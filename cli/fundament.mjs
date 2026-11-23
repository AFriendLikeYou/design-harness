#!/usr/bin/env node
// Fundament-CLI. Liest das zusammengesetzte System (tooling/assemble.mjs) und generated/contracts.json.
//   fundament lint                      prüft die Spec selbst (Verweise, Eindeutigkeit, Regeln mit Check)
//   fundament check <Pfad …> [--json] [--html] [--strict]   prüft HTML/CSS gegen Verträge, Regeln und Grundsätze; --html für Seiten aus reinem HTML und CSS
//   fundament audit <Pfad …> [--json]   prüft gerendert in Chrome: Überlauf bei 360 px, Kontrast, Namen, Klickflächen
//   fundament migrate <Pfad …> [--write] ersetzt Veraltetes laut migrations in der Spec
// Exit 0 = sauber, 1 = Befunde, 2 = falscher Aufruf.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

// --root <Ordner> oder FUNDAMENT_ROOT wählt ein anderes System (z. B. probe-zds); Standard ist dieses Projekt
const rootArg = process.argv.indexOf('--root'); const rootDir = rootArg > 0 ? process.argv[rootArg + 1] : process.env.FUNDAMENT_ROOT;
if (rootArg > 0) process.argv.splice(rootArg, 2);
const ROOT = rootDir ? new URL(rootDir.replace(/\/?$/, '/'), `file://${process.cwd()}/`) : new URL('..', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
export const systemRoot = ROOT;
// Checks, die diese CLI wirklich umsetzt. lint meldet Regeln, die einen anderen Check versprechen.
export const IMPLEMENTED = ['max-per-view', 'no-raw-color', 'required-prop', 'slot-content', 'max-words', 'max-per-parent', 'max-children', 'no-nesting', 'registered-only', 'required-when-disabled', 'no-decoration', 'no-uppercase', 'no-vague-action', 'no-raw-space', 'required-when-error', 'min-per-group'];
// Regel-IDs, unter denen check() Befunde ausgibt (komponentenbezogen und Grundsätze). Alles andere sind allgemeine IDs (tokens/…, props/…, components/…, slots/…).
// lint gleicht diese Liste mit specs/rules.json ab: Jede Regel mit "check" muss hier stehen (oder über CHECK_EMITS abgedeckt sein), jede Regel hier muss in den Regeln stehen und einen check tragen.
export const CHECKED_IDS = ['button/one-primary', 'textfield/visible-label', 'textfield/error-text', 'textfield/trailing-slot', 'checkbox/disabled-reason', 'switch/disabled-reason', 'radio/disabled-reason', 'radio/in-group', 'badge/short-label', 'chip/short-label', 'alert/one-per-area', 'card/one-action', 'card/no-nesting', 'card/badge-slot', 'link/has-target', 'link/names-destination', 'principles/spacing-from-scale', 'principles/surface-and-line', 'principles/sentence-case', 'principles/action-says-what', 'principles/system-controls'];
// Checks, die ihre Befunde unter einer allgemeinen ID ausgeben, nicht unter der Regel-ID
export const CHECK_EMITS = { 'no-raw-color': 'tokens/no-raw-color', 'required-prop': 'props/required', 'registered-only': 'components/unknown' };
// Unter welcher ID erscheint der Befund einer Regel mit check? undefined = die CLI gibt für diese Regel nichts aus
export const emittedId = (r) => (CHECKED_IDS.includes(r.id) ? r.id : CHECK_EMITS[r.check]);

const collect = (paths, exts) => { const files = []; const walk = (p) => { const s = statSync(p); if (s.isDirectory()) readdirSync(p).forEach((f) => walk(join(p, f))); else if (exts.includes(extname(p))) files.push(p); }; paths.forEach(walk); return files; };
const lineOf = (src, i) => src.slice(0, i).split('\n').length;

// ---------- HTML-Tokenizer ----------
// Zustandsautomat nach dem Muster des HTML-Standards, reduziert auf das, was der Check braucht: Start- und End-Tags mit Attributen.
// Kommentare, Doctype und der Inhalt von <script>, <style>, <textarea>, <title> werden übersprungen (dort stehendes Markup zählt nicht).
export function tokenize(src) {
  const out = []; const n = src.length; let i = 0; const RAW = new Set(['script', 'style', 'textarea', 'title']);
  const ws = (ch) => ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r' || ch === '\f';
  while (i < n) {
    const lt = src.indexOf('<', i); if (lt < 0) break; i = lt;
    if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i + 4); i = e < 0 ? n : e + 3; continue; }
    if (src[i + 1] === '!' || src[i + 1] === '?') { const e = src.indexOf('>', i); i = e < 0 ? n : e + 1; continue; }
    const close = src[i + 1] === '/'; let j = i + (close ? 2 : 1);
    if (!/[a-zA-Z]/.test(src[j] || '')) { i++; continue; }
    let k = j; while (k < n && !ws(src[k]) && src[k] !== '>' && src[k] !== '/') k++;
    const tag = src.slice(j, k).toLowerCase(); const attrs = {}; let selfClosing = false; j = k;
    while (j < n && src[j] !== '>') {
      if (ws(src[j])) { j++; continue; }
      if (src[j] === '/') { selfClosing = src[j + 1] === '>'; j++; continue; }
      let a = j; while (j < n && !ws(src[j]) && src[j] !== '=' && src[j] !== '>' && !(src[j] === '/' && src[j + 1] === '>')) j++;
      const name = src.slice(a, j).toLowerCase(); let m = j; while (m < n && ws(src[m])) m++;
      if (src[m] !== '=') { if (name) attrs[name] = true; continue; }
      j = m + 1; while (j < n && ws(src[j])) j++;
      let value; if (src[j] === '"' || src[j] === "'") { const q = src[j]; const e = src.indexOf(q, j + 1); value = src.slice(j + 1, e < 0 ? n : e); j = e < 0 ? n : e + 1; }
      else if (src[j] === '{') { let depth = 0; a = j; while (j < n) { if (src[j] === '{') depth++; else if (src[j] === '}' && --depth === 0) { j++; break; } j++; } value = src.slice(a, j); }
      else { a = j; while (j < n && !ws(src[j]) && src[j] !== '>') j++; value = src.slice(a, j); }
      if (name) attrs[name] = value;
    }
    const end = j < n ? j + 1 : n;
    out.push({ close, tag, attrs: close ? {} : attrs, index: i, end, selfClosing });
    i = end;
    if (!close && RAW.has(tag)) { const re = new RegExp(`</${tag}\\s*>`, 'i'); const m = re.exec(src.slice(i)); if (!m) break; out.push({ close: true, tag, attrs: {}, index: i + m.index, end: i + m.index + m[0].length, selfClosing: false }); i += m.index + m[0].length; }
  }
  return out;
}

// ---------- lint ----------
export function lint(spec) {
  const out = []; const add = (id, message) => out.push({ file: spec.assembled ? 'System (Figma-Schnappschuss, ui/elements.js, specs/rules.json)' : 'specs/system.json', line: 0, id, message, fix: 'Quelle korrigieren, dann node build.mjs.' });
  const colors = new Set(Object.keys(spec.semantic.color)); const prim = spec.primitives;
  if (!/^\d+\.\d+\.\d+$/.test(spec.version)) add('lint/version', `Version „${spec.version}“ ist nicht x.y.z.`);
  if (spec.changelog?.[0]?.version !== spec.version) add('lint/changelog', `Oberster Changelog-Eintrag (${spec.changelog?.[0]?.version}) passt nicht zur Version ${spec.version}.`);
  for (const [n, t] of Object.entries(spec.semantic.color)) { for (const m of ['light', 'dark']) { const [h, s] = (t[m] || '').split('/'); if (!prim.color[h]?.[s]) add('lint/primitive', `color/${n}: Primitiv „${t[m]}“ (${m}) gibt es nicht.`); } if (!t.why) add('lint/why', `color/${n} hat keine Begründung.`); if (!t.scopes?.length) add('lint/scope', `color/${n} hat keinen Scope.`); }
  for (const [g, entries] of Object.entries(spec.semantic)) if (g !== 'color') for (const [n, t] of Object.entries(entries)) { if (!t.why) add('lint/why', `${g}/${n} hat keine Begründung.`); if (g !== 'radius' && !prim.dimension.includes(t.value)) add('lint/primitive', `${g}/${n}: Maß ${t.value} fehlt in primitives.dimension.`); }
  for (const t of spec.textStyles) { if (!prim.fontSize.includes(t.size)) add('lint/primitive', `Text-Style ${t.name}: Größe ${t.size} fehlt.`); if (!prim.lineHeight.includes(t.line)) add('lint/primitive', `Text-Style ${t.name}: Zeilenhöhe ${t.line} fehlt.`); }
  for (const p of spec.contrast || []) for (const k of [p.fg, ...p.on]) if (!colors.has(k)) add('lint/contrast', `Kontrastpaar verweist auf unbekanntes Token „${k}“.`);
  const ids = new Set(); const names = new Set();
  const rules = [...spec.components.flatMap((c) => c.rules), ...(spec.principles || [])];
  for (const r of rules) { if (ids.has(r.id)) add('lint/rule-id', `Regel-ID „${r.id}“ ist doppelt.`); ids.add(r.id); if (!r.why) add('lint/why', `Regel ${r.id} hat keine Begründung.`); if (r.check && !IMPLEMENTED.includes(r.check)) add('lint/check-missing', `Regel ${r.id} verspricht den Check „${r.check}“, den die CLI nicht umsetzt.`); else if (r.check && !emittedId(r)) add('lint/check-unwired', `Regel ${r.id} hat check „${r.check}“, aber die CLI gibt keinen Befund für diese Regel-ID aus (nicht in CHECKED_IDS in cli/fundament.mjs). Check dort verdrahten oder in specs/rules.json auf null setzen.`); }
  const byId = new Map(rules.map((r) => [r.id, r]));
  for (const id of CHECKED_IDS) { const scope = id.split('/')[0]; if (scope === 'principles' ? !(spec.principles || []).length : !spec.components.some((c) => c.name.toLowerCase() === scope)) continue; const r = byId.get(id);
    if (!r) add('lint/check-orphan', `Die CLI prüft „${id}“, diese Regel gibt es in specs/rules.json nicht (mehr). Regel wieder anlegen oder die Prüfung in cli/fundament.mjs entfernen.`); else if (!r.check) add('lint/check-orphan', `Die CLI prüft „${id}“, aber die Regel hat check: null. Einen Check-Namen eintragen (und in IMPLEMENTED aufführen) oder die Prüfung entfernen.`); }
  for (const c of spec.components) {
    if (names.has(c.name)) add('lint/component', `Komponente ${c.name} ist doppelt.`); names.add(c.name);
    for (const f of ['purpose', 'a11y', 'version', 'status']) if (!c[f]) add('lint/component', `${c.name}: „${f}“ fehlt.`);
    for (const x of c.notFor || []) if (!x.text || (x.use && !spec.components.some((k) => k.name === x.use))) add('lint/not-for', `${c.name}: „Nicht verwenden für“ braucht einen Text, und „${x.use}“ muss ein Baustein des Systems sein.`);
    for (const p of c.props) { if (p.type === 'variant' && !p.values.includes(String(p.default))) add('lint/prop', `${c.name}.${p.name}: Standard „${p.default}“ ist kein erlaubter Wert.`); if (p.type === 'instance' && !spec.components.some((x) => x.name === p.default)) add('lint/prop', `${c.name}.${p.name}: Standard-Komponente „${p.default}“ gibt es nicht.`); }
    if (c.missingCode) add('lint/code', `${c.name}: Regeleintrag ohne Komponente im Code. Komponente in ui/elements.js anlegen oder den Eintrag aus specs/rules.json entfernen.`);
    if (c.missingRules) add('lint/rules', `${c.name} ist im Code umgesetzt, hat aber keinen Eintrag in specs/rules.json (Zweck, Regeln, Barrierefreiheit).`);
    if (spec.assembled) { if (!Object.keys(c.looks).length) add('lint/figma', `${c.name}: kein Aussehen im Figma-Schnappschuss. Komponente in Figma anlegen und neu exportieren.`); for (const [variant, st] of Object.entries(c.looks)) for (const [role, tok] of Object.entries(st)) { if (tok.startsWith('(')) add('lint/figma', `${c.name} [${variant}]: ${role} ist in Figma nicht an eine Variable gebunden.`); else if (/Width$/.test(role) ? !spec.semantic['border-width']?.[tok] : !colors.has(tok)) add('lint/figma', `${c.name} [${variant}]: ${role} nutzt „${tok}“, das kein semantisches Token ist.`); } }
    if (spec.assembled) { // Textrollen und Schiebergriff, die die Standardvariante trägt, dürfen in keiner Variante ohne Grund fehlen (Fläche, Rahmen, Ring und Haken wechseln mit dem Zustand)
      const vp = c.props.filter((p) => p.type === 'variant'); const dflt = Object.entries(c.looks).find(([k]) => k === 'default' || (vp.length && k.split(', ').length === vp.length && k.split(', ').every((kv) => { const [a, b] = kv.split('='); return String(vp.find((p) => p.name === a)?.default) === b; })));
      if (dflt) for (const role of ['fg', 'body', 'helper', 'thumb']) if (dflt[1][role]) for (const [variant, st] of Object.entries(c.looks)) if (!st[role]) add('lint/figma', `${c.name} [${variant}]: ${role} fehlt, die Standardvariante [${dflt[0]}] hat es. In Figma die Ebene ergänzen und neu exportieren.`); }
    if (!spec.assembled && c.status !== 'deprecated' && !c.styles) add('lint/styles', `${c.name}: styles fehlen.`);
    for (const [key, st] of Object.entries(c.styles || {})) {
      for (const [role, tok] of Object.entries(st)) { if (tok === null) continue; if (/Width$/.test(role)) { if (!spec.semantic['border-width']?.[tok]) add('lint/styles', `${c.name} [${key}]: Rahmenstärke „${tok}“ gibt es nicht.`); } else if (!colors.has(tok)) add('lint/styles', `${c.name} [${key}]: Token „${tok}“ gibt es nicht.`); }
      if (key !== 'default') for (const kv of key.split(', ')) { const [prop, val] = kv.split('='); const p = c.props.find((x) => x.name === prop); if (!p || !p.values?.includes(val)) add('lint/styles', `${c.name}: styles-Schlüssel „${kv}“ passt zu keinem Prop-Wert.`); }
    }
    if (c.status === 'deprecated' && !(spec.migrations || []).some((m) => m.from.endsWith(c.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()))) add('lint/migration', `${c.name} ist veraltet, hat aber keinen Eintrag in migrations.`);
  }
  return out;
}

// ---------- check ----------
export function check(files, C = read('generated/contracts.json'), opts = {}) {
  const P = C.cssPrefix; const findings = [];
  // --html: Seiten aus reinem HTML und CSS. Erlaubt sind dann die Klassen aus generated/html.json (erzeugt aus den Web Components).
  // Eine einzelne Seite wählt die Fassung mit <html data-fd-html>.
  let H = null; const htmlClasses = () => new Set(Object.values((() => { try { return read('generated/html.json'); } catch { return {}; } })()).flatMap((h) => [...h.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/))));
  // Zu einem festen Wert das passende Token suchen: gleicher Wert oder knapp daneben
  const TV = C.tokenValues || {}; const rgbOf = (x) => { let m = /^#([0-9a-f]{3,8})$/i.exec(x.trim()); if (m) { let h = m[1]; if (h.length <= 4) h = [...h].map((ch) => ch + ch).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); } m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(x.trim()); return m ? [+m[1], +m[2], +m[3]] : null; };
  const colorHint = (raw) => { const c = rgbOf(raw); if (!c) return null; const exact = [], near = []; for (const [name, v] of Object.entries(TV)) { if (!v || typeof v !== 'object') continue; for (const mode of ['light', 'dark']) { const t = v[mode] && rgbOf(v[mode]); if (!t) continue; const d = Math.max(...t.map((n, i) => Math.abs(n - c[i]))); const label = `var(${name})${v.light === v.dark ? '' : mode === 'light' ? ' im hellen Modus' : ' im dunklen Modus'}`; if (d === 0) { if (!exact.includes(label)) exact.push(label); } else if (d <= 8) near.push(`${label} = ${v[mode]}`); } }
    return exact.length ? { message: '', fix: `Der Wert entspricht ${exact.slice(0, 4).join(', ')}${exact.length > 4 ? ' und weiteren' : ''}. Das Token nehmen, dessen Rolle passt.` } : near.length ? { message: ' Er liegt knapp neben einem Token.', fix: `Vermutlich gemeint: ${[...new Set(near)].slice(0, 3).join(', ')}. Das Token verwenden, nicht den Wert angleichen.` } : null; };
  const spaceHint = (n, unit) => { if (unit !== 'px') return null; const list = Object.entries(TV).filter(([, v]) => typeof v === 'number').sort((a, b) => a[1] - b[1]); const hit = list.filter(([, v]) => v === n); if (hit.length) return `Der Wert entspricht var(${hit[0][0]}).`; const lo = list.filter(([, v]) => v < n).pop(), hi = list.find(([, v]) => v > n); return list.length ? `${n}px gibt es in der Skala nicht. Am nächsten: ${[lo, hi].filter(Boolean).map(([k, v]) => `${v}px = var(${k})`).join(' oder ')}.` : null; };
  const vague = (t) => C.vagueActions.includes(t.trim().toLowerCase().replace(/[.!→>\s]+$/g, ''));
  // Befunde zu Regel-IDs, die es im Vertrag nicht gibt, werden nicht ausgegeben (lint meldet die Lücke)
  const known = new Set([...Object.values(C.components).flatMap((c) => c.rules || []), ...(C.principles || [])].map((r) => r.id));
  // Stufen: Fehler (Standard) oder Hinweis ("level": "warning" an der Regel oder am Befund). Hinweise lassen den Check bestehen.
  // Einzelausnahme: data-fd-allow="regel/id: Grund" am Element oder an einem Vorfahren. Ohne Grund gilt sie nicht. Ausnahmen stehen in findings.allowed.
  const levelOf = Object.fromEntries([...Object.values(C.components).flatMap((c) => c.rules || []), ...(C.principles || [])].map((r) => [r.id, r.level || 'error']));
  const allowed = []; findings.allowed = allowed; let allowNow = null;
  const add = (file, line, id, message, fix, level) => { if (CHECKED_IDS.includes(id) && !known.has(id)) return; if (allowNow && allowNow.has(id)) { allowed.push({ file, line, id, message, reason: allowNow.get(id) }); return; } findings.push({ file, line, id, message, fix, level: level || levelOf[id] || 'error' }); };
  const weak = (t) => (C.weakActions || []).includes(t.trim().toLowerCase().replace(/[.!→>\s]+$/g, ''));
  const WEAK_FIX = 'Wenn es passt, das Ergebnis nennen, z. B. „Weiter zur Zahlung“. In einer Strecke mit festem nächsten Schritt ist das Wort in Ordnung.';
  const parseAllow = (file, line, value, base) => { const map = new Map(base || []); if (typeof value !== 'string') return map; for (const part of value.split(';').map((x) => x.trim()).filter(Boolean)) { const i = part.indexOf(':'); const id = (i < 0 ? part : part.slice(0, i)).trim(); const why = i < 0 ? '' : part.slice(i + 1).trim();
    if (!known.has(id)) add(file, line, 'allow/unknown-rule', `Ausnahme für „${id}“: Diese Regel gibt es nicht.`, 'Die Regel-ID aus dem Befund übernehmen. Ausnahmen gibt es nur für Regeln und Grundsätze, nicht für unbekannte Bausteine, Werte oder Tokens.');
    else if (why.length < 8) add(file, line, 'allow/needs-reason', `Ausnahme für „${id}“ ohne Grund.`, 'Den Grund dazuschreiben: data-fd-allow="' + id + ': warum es hier anders sein muss".'); else map.set(id, why); } return map; };
  // Ein primärer Button zählt je Ansicht; Karte, Formular und Dialog sind eigene Einheiten
  const unitOf = (stack) => { for (let i = stack.length - 1; i >= 0; i--) { const s = stack[i]; if (s.comp?.name === 'Card' || (s.owner && (s.owner.impl || s.owner.name) === 'Card') || s.tag === 'form' || s.tag === 'dialog') return s.id; } return 0; };
  // name = Art der Komponente für die Regeln (bei "impl" die der Umsetzung), title = Name im System
  const byEl = Object.fromEntries(Object.entries(C.components).map(([name, c]) => [c.element, { ...c, title: name, name: c.impl || name }]));
  const byClass = Object.fromEntries(Object.entries(C.components).map(([name, c]) => [c.class, { name, ...c }]));
  const GLOBAL = /^(id|class|slot|hidden|style|lang|dir|tabindex|data-.*|aria-.*)$/;
  const elList = Object.keys(byEl).filter((e) => byEl[e].status !== 'deprecated').map((e) => `<${e}>`).join(', ');

  function decl(file, css, L, allowed, owner) {
    for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch|oklab|lab|lch)a?\([^)]*\)/g)) { const h = colorHint(m[0]); add(file, L(m.index), 'tokens/no-raw-color', `Fester Farbwert ${m[0]}.${h ? h.message : ''}`, h ? h.fix : `Durch ein semantisches Token ersetzen, var(--${P}-color-…). Gültige Namen: generated/contracts.json → tokens.`); }
    for (const m of css.matchAll(new RegExp(`var\\(\\s*(--${P}-[a-z0-9-]+)`, 'g'))) {
      if (!C.tokens[m[1]]) add(file, L(m.index), 'tokens/unknown', `Token ${m[1]} gibt es nicht.`, 'Namen aus generated/contracts.json → tokens verwenden; keine Tokens erfinden.');
      else if (allowed && m[1].startsWith(`--${P}-color-`) && !allowed.has(m[1])) add(file, L(m.index), 'tokens/not-in-contract', `${owner} verwendet ${m[1]}, das steht nicht in seinem Vertrag.`, `Erlaubt: ${[...allowed].join(', ')}. Soll das Token dazugehören, in Figma an die Komponente binden, neu exportieren und bauen.`);
    }
    for (const m of css.matchAll(/(?:^|[;{\s])(border(?:-(?:top|right|bottom|left))?(?:-width)?|outline(?:-width)?)\s*:\s*([^;}]*)/g)) { const px = m[2].match(/(?<![\w.-])(\d*\.?\d+)px/); if (px && +px[1] > 0) add(file, L(m.index), 'tokens/no-raw-border-width', `Feste Rahmenstärke ${px[0]} in „${m[1]}“.`, `var(--${P}-border-width-…) verwenden.`); }
    if (!allowed) for (const m of css.matchAll(/(?:^|[;{\s])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block))?|gap|row-gap|column-gap)\s*:\s*([^;}]*)/g)) { const raw = m[2].match(/(?<![\w.-])(\d*\.?\d+)(px|rem|em)/); if (raw && +raw[1] > 0) add(file, L(m.index), 'principles/spacing-from-scale', `Fester Abstand ${raw[0]} in „${m[1]}“.`, spaceHint(+raw[1], raw[2]) || `var(--${P}-space-…) verwenden.`); }
    for (const m of css.matchAll(/\b(?:linear|radial|conic)-gradient\(|(?:^|[;{\s])(?:box-shadow|text-shadow)\s*:\s*(?!none)/g)) add(file, L(m.index), 'principles/surface-and-line', `Verlauf oder Schatten: ${m[0].trim().replace(/[:(]\s*$/, '')}.`, 'Entfernen. Trennung über Fläche (bg-Tokens) und Linie (border-Tokens).');
    for (const m of css.matchAll(/text-transform\s*:\s*uppercase/g)) add(file, L(m.index), 'principles/sentence-case', 'Versalien per text-transform.', 'Entfernen; Text in Satzschreibung setzen.');
  }
  function css(file, src, off = 0) {
    const L = (i) => off + lineOf(src, i);
    const clean = src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const start = m.index + m[1].length + 1;
      const comps = [...new Set([...m[1].matchAll(new RegExp(`\\.(${P}-[a-z0-9-]+?)(?=__|[^a-z0-9-]|$)`, 'g'))].map((x) => (x[1].endsWith('-field') && byClass[x[1].slice(0, -6)] ? x[1].slice(0, -6) : x[1])))];
      for (const c of comps) if (!byClass[c]) add(file, L(m.index), 'components/unknown', `Klasse „${c}“ gehört zu keiner Komponente.`, 'Nur Klassen der Komponenten aus dem Vertrag gestalten.');
      const known = comps.filter((c) => byClass[c]);
      decl(file, m[2], (i) => L(start + i), known.length ? new Set(known.flatMap((c) => byClass[c].colorTokens)) : null, known.map((c) => byClass[c].name).join(' / '));
    }
  }
  // Prüfungen für die HTML-Fassung: Klassen, Werte der data-Attribute und die Regeln, die sich am Markup ablesen lassen
  function htmlFassung(file, line, m, next, cls, src, stack, parent, alerts, countPrimary, specimen) {
    const { attrs } = m;
    for (const c of cls) if (!H.has(c)) add(file, line, 'components/unknown', `Klasse „${c}“ gibt es im System nicht.`, 'Markup aus generated/html/<name>.html übernehmen. Keine Klassen erfinden; fehlt etwas, die Lücke melden.');
    const text = next?.close && next.tag === m.tag ? src.slice(m.end, next.index).trim() : null;
    for (const c of cls) { const [block, part] = c.split('__'); const kind = byClass[block] ? (byClass[block].impl || byClass[block].name) : null; if (!kind || text === null) continue;
      if ((part === 'label' || part === 'title') && !text) add(file, line, kind === 'TextField' ? 'textfield/visible-label' : 'props/required', `${c} ohne Text.`, 'Sichtbaren Text einsetzen.');
      if (part === 'label' && kind === 'Button' && vague(text)) add(file, line, 'principles/action-says-what', `Beschriftung „${text}“ sagt nicht, was passiert.`, 'Mit einem Verb beginnen und das Ergebnis nennen, z. B. „Änderungen speichern“.');
      if (part === 'label' && kind === 'Button' && !vague(text) && weak(text)) add(file, line, 'principles/action-says-what', `Beschriftung „${text}“ sagt wenig darüber, was passiert.`, WEAK_FIX, 'warning');
      if (part === 'label' && kind === 'Link' && (vague(text) || /^hier$/i.test(text))) add(file, line, 'link/names-destination', `Linktext „${text}“ nennt kein Ziel.`, 'Das Ziel nennen, z. B. „Alle Rechnungen ansehen“.');
      if (part === 'label' && kind === 'Chip' && text.split(/\s+/).length > 2) add(file, line, 'chip/short-label', `Chip-Text „${text}“ hat mehr als zwei Wörter.`, 'Auf höchstens zwei Wörter kürzen.');
      if (part === 'label' && kind === 'Badge' && text.split(/\s+/).length > 2) add(file, line, 'badge/short-label', `Badge-Text „${text}“ hat mehr als zwei Wörter.`, 'Auf höchstens zwei Wörter kürzen.'); }
    const owner = cls.map((c) => byClass[c]).find(Boolean); if (!owner) return; const kind = owner.impl || owner.name;
    for (const [a, d] of Object.entries(owner.attributes || {})) if (typeof attrs[a] === 'string' && !d.values.includes(attrs[a])) add(file, line, 'props/invalid-value', `class="${owner.class}" ${a}="${attrs[a]}" ist kein gültiger Wert.`, `Erlaubt: ${d.values.join(', ')} (Standard: ${d.default}).`);
    if (kind === 'Button') { const variant = attrs['data-variant'] ?? owner.attributes?.['data-variant']?.default; if ((variant === 'primary' || variant === 'danger') && !specimen && countPrimary() > 1) add(file, line, 'button/one-primary', 'Mehr als ein primärer Button in dieser Ansicht (danger zählt als primär).', 'Weitere Aktionen mit data-variant="secondary" oder "ghost".'); }
    if (kind === 'Link' && (!attrs.href || attrs.href === true)) add(file, line, 'link/has-target', 'Link ohne href.', 'href="…" setzen. Ohne Ziel ist es eine Aktion und gehört in einen Button.');
    if (kind === 'Card' && stack.some((x) => x.owner && (x.owner.impl || x.owner.name) === 'Card')) add(file, line, 'card/no-nesting', 'Karte in einer Karte.', 'Innere Karte auflösen oder neben die äußere stellen.');
    if (kind === 'Alert') { const key = parent ? parent.id : 0; const k = (alerts.get(key) || 0) + 1; alerts.set(key, k); if (k > 1) add(file, line, 'alert/one-per-area', 'Mehr als ein Alert im selben Bereich.', 'Hinweise zusammenfassen oder nur den wichtigsten zeigen.'); }
  }
  function html(file, src) {
    const L = (i) => lineOf(src, i);
    const toks = tokenize(src); allowNow = null;
    toks.forEach((tk, i) => { if (!tk.close && tk.tag === 'style' && toks[i + 1]?.close) css(file, src.slice(tk.end, toks[i + 1].index), L(tk.index) - 1); });
    H = opts.html || toks.some((tk) => !tk.close && tk.tag === 'html' && 'data-fd-html' in tk.attrs) ? htmlClasses() : null;
    const specimen = toks.some((tk) => !tk.close && tk.tag === 'html' && 'data-fd-specimen' in tk.attrs);
    const VOID = new Set(['input', 'br', 'img', 'meta', 'link', 'hr']); const stack = []; const primaries = new Map(); const bump = () => { const k = unitOf(stack); primaries.set(k, (primaries.get(k) || 0) + 1); return primaries.get(k); }; const alerts = new Map(); const radios = new Map(); allowNow = null;
    for (const [ti, m] of toks.entries()) {
      const { close, tag: t, attrs } = m;
      if (close) { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === t) { stack.length = i; break; } continue; }
      const line = L(m.index); const parent = stack[stack.length - 1]; const pc = parent?.comp;
      allowNow = null; const allowHere = parseAllow(file, line, attrs['data-fd-allow'], parent?.allow); allowNow = allowHere;
      if (typeof attrs.style === 'string') decl(file, attrs.style, () => line, null, '');
      const cls = typeof attrs.class === 'string' ? attrs.class.split(/\s+/).filter((c) => c.startsWith(P + '-')) : [];
      if (H) htmlFassung(file, line, m, toks[ti + 1], cls, src, stack, parent, alerts, bump, specimen);
      else if (cls.length) add(file, line, 'components/internal-class', `Interne Klasse in class="${attrs.class}".`, `Die Klassen gehören dem Paket. Das Element verwenden: ${elList}.`);
      if (!t.startsWith(P + '-') && ['button', 'input', 'select', 'textarea', ...(C.components.Link ? ['a'] : [])].includes(t) && attrs.type !== 'hidden' && !(H && (cls.length || stack.some((x) => x.sys)))) add(file, line, 'principles/system-controls', `Nacktes <${t}>.`, `Systemkomponente verwenden: ${elList}. Fehlt eine passende, die Lücke melden statt nachzubauen.`);
      let comp = null;
      if (t.startsWith(P + '-')) {
        comp = byEl[t];
        if (!comp) add(file, line, 'components/unknown', `<${t}> gibt es nicht.`, `Vorhanden: ${elList}. Keine Komponenten erfinden; fehlt etwas, die Lücke melden.`);
      }
      if (comp) {
        const v = (n) => { const d = comp.attrs[n]; const x = attrs[n]; if (!d) return ''; if (d.type === 'boolean') return x === undefined ? d.default : x !== 'false'; if (d.type === 'enum') return x === undefined ? d.default : x; return x === undefined || x === true ? '' : x; };
        if (comp.status === 'deprecated') add(file, line, 'components/deprecated', `<${t}> ist veraltet seit ${comp.deprecated?.since}.`, `Ersetzen durch ${comp.deprecated?.use}; „fundament migrate <Pfad> --write“ erledigt das.`);
        for (const [a, x] of Object.entries(attrs)) {
          const d = comp.attrs[a];
          if (!d) { if (!comp.passthrough.includes(a) && !GLOBAL.test(a)) add(file, line, 'props/unknown', `<${t}> kennt „${a}“ nicht.`, `Erlaubt: ${Object.keys(comp.attrs).join(', ') || 'keine Attribute'}.`); continue; }
          if (typeof x === 'string' && x.startsWith('{')) continue; // Svelte-Ausdruck: Wert steht erst zur Laufzeit fest
          if (d.type === 'enum' && !d.values.includes(x)) add(file, line, 'props/invalid-value', `<${t} ${a}="${x}"> ist kein gültiger Wert.`, `Erlaubt: ${d.values.join(', ')} (Standard: ${d.default}).`);
          if (d.type === 'boolean' && x !== true && x !== 'true' && x !== 'false' && x !== '') add(file, line, 'props/invalid-value', `<${t} ${a}="${x}"> ist kein Wahrheitswert.`, 'Attribut ohne Wert setzen oder "true" / "false".');
        }
        for (const n of ['label', 'title']) if (comp.attrs[n] && !v(n).trim()) add(file, line, comp.name === 'TextField' ? 'textfield/visible-label' : 'props/required', `<${t}> ohne ${n}.`, `${n}="…" setzen.`);
        const slot = attrs.slot;
        if (comp.name === 'Button') {
          const variant = v('variant');
          if ((variant === 'primary' || variant === 'danger') && slot !== 'trailing' && !specimen && bump() > 1) add(file, line, 'button/one-primary', 'Mehr als ein primärer Button in dieser Ansicht, Karte oder diesem Formular (danger zählt als primär).', 'Weitere Aktionen mit variant="secondary" oder "ghost".');
          if (C.vagueActions.includes(v('label').trim().toLowerCase().replace(/[.!→>\s]+$/g, ''))) add(file, line, 'principles/action-says-what', `Beschriftung „${v('label')}“ sagt nicht, was passiert.`, 'Mit einem Verb beginnen und das Ergebnis nennen, z. B. „Änderungen speichern“.');
          else if (weak(v('label'))) add(file, line, 'principles/action-says-what', `Beschriftung „${v('label')}“ sagt wenig darüber, was passiert.`, WEAK_FIX, 'warning');
          if (slot === 'trailing' && (variant !== 'ghost' || v('size') !== 'sm')) add(file, line, 'textfield/trailing-slot', 'Button im Slot trailing ist nicht ghost und sm.', 'variant="ghost" size="sm" setzen.');
        }
        if (comp.name === 'Link') {
          if (!attrs.href || attrs.href === true) add(file, line, 'link/has-target', 'Link ohne href.', 'href="…" setzen. Ohne Ziel ist es eine Aktion und gehört in <fd-button>.');
          if (C.vagueActions.includes(v('label').trim().toLowerCase().replace(/[.!→>\s]+$/g, '')) || /^hier$/i.test(v('label').trim())) add(file, line, 'link/names-destination', `Linktext „${v('label')}“ nennt kein Ziel.`, 'Das Ziel nennen, z. B. „Alle Rechnungen ansehen“.');
        }
        if (comp.name === 'ConfirmAction' && !specimen && bump() > 1) add(file, line, 'button/one-primary', 'Mehr als eine primäre Aktion in dieser Ansicht (ConfirmAction zählt als primär).', 'Weitere Aktionen mit variant="secondary" oder "ghost".');
        if (comp.name === 'TextField') {
          if (comp.attrs['trailing-action'] && v('trailing-action') !== 'none' && !(attrs['show-trailing'] !== undefined && attrs['show-trailing'] !== 'false')) add(file, line, 'textfield/trailing-slot', 'trailing-action ohne sichtbaren Slot.', 'show-trailing setzen und einen <fd-button slot="trailing" variant="ghost" size="sm"> einfügen.');
          if (v('state') === 'error' && !v('error-text').trim()) add(file, line, 'textfield/error-text', 'Fehlerzustand ohne error-text.', 'error-text="…" setzen und darin sagen, wie man den Fehler behebt.');
        }
        if (comp.name === 'Radio') { const g = typeof attrs.name === 'string' ? attrs.name : ''; if (!radios.has(g)) radios.set(g, []); radios.get(g).push(line); }
        if (['Checkbox', 'Switch', 'Radio'].includes(comp.name) && v('disabled') && !(v('show-helper') && v('helper-text').trim())) add(file, line, `${comp.name.toLowerCase()}/disabled-reason`, `Deaktiviert ohne Erklärung.`, 'show-helper und helper-text="…" setzen und den Grund nennen.');
        if (comp.name === 'Chip' && v('label').trim().split(/\s+/).length > 2) add(file, line, 'chip/short-label', `Chip-Text „${v('label')}“ hat mehr als zwei Wörter.`, 'Auf höchstens zwei Wörter kürzen.');
        if (comp.name === 'Badge' && v('label').trim().split(/\s+/).length > 2) add(file, line, 'badge/short-label', `Badge-Text „${v('label')}“ hat mehr als zwei Wörter.`, 'Auf höchstens zwei Wörter kürzen.');
        if (comp.name === 'Card' && stack.some((s) => s.comp?.name === 'Card')) add(file, line, 'card/no-nesting', 'Karte in einer Karte.', 'Innere Karte auflösen oder neben die äußere stellen.');
        if (comp.name === 'Alert') { const key = parent ? parent.id : 0; const n = (alerts.get(key) || 0) + 1; alerts.set(key, n); if (n > 1) add(file, line, 'alert/one-per-area', 'Mehr als ein Alert im selben Bereich.', 'Hinweise zusammenfassen oder nur den wichtigsten zeigen.'); }
      }
      // Kinder von Komponenten: nur in benannten Slots
      if (pc) {
        const slot = attrs.slot;
        if (!pc.slotNames.includes(slot)) add(file, line, 'slots/unknown-child', `<${t}> liegt in <${pc.element}> ohne gültigen Slot.`, pc.slotNames.length ? `slot="${pc.slotNames.join('" oder "')}" setzen; anderer Inhalt gehört nicht in die Komponente.` : `<${pc.element}> nimmt keine Kinder auf. Inhalt über Attribute setzen.`);
        else {
          parent.slots[slot] = (parent.slots[slot] || 0) + 1;
          const sd = pc.slots.find((x) => x.name === slot); const rid = { trailing: 'textfield/trailing-slot', action: 'card/one-action', badge: 'card/badge-slot' }[slot] || 'slots/content';
          if (t !== sd.element) add(file, line, rid, `Im Slot ${slot} ist nur <${sd.element}> erlaubt.`, `<${sd.element} slot="${slot}" …> verwenden.`);
          if (parent.slots[slot] > 1) add(file, line, rid, `Mehr als ein Element im Slot ${slot}.`, 'Höchstens eines.');
          if (pc.attrs[sd.show] && !parent.shown.includes(sd.show)) add(file, line, rid, `Slot ${slot} ist gefüllt, aber ${sd.show} fehlt.`, `${sd.show} am <${pc.element}> setzen, sonst bleibt der Slot unsichtbar.`);
        }
      }
      if (!VOID.has(t) && !m.selfClosing) stack.push({ tag: t, comp, allow: allowHere, sys: cls.length > 0, owner: cls.map((c) => byClass[c]).find(Boolean), id: m.index, slots: {}, shown: Object.keys(attrs).filter((a) => a.startsWith('show-') && attrs[a] !== 'false') });
    }
    allowNow = null;
    if (!specimen) for (const [g, lines] of radios) if (!g || lines.length < 2) for (const l of lines) add(file, l, 'radio/in-group', g ? `Radio mit name="${g}" steht allein.` : 'Radio ohne name.', 'Mindestens zwei Radios mit demselben name="…" zu einer Gruppe machen. Für eine einzelne Ja-oder-Nein-Frage eine Checkbox verwenden.');
  }
  for (const f of files) { if (/^(tokens\.css|contract\.generated\.js)$/.test(basename(f))) continue; const src = readFileSync(f, 'utf8'); extname(f) === '.css' ? css(f, src) : html(f, src); }
  return findings;
}

// ---------- migrate ----------
export function migrate(files, write, C = read('generated/contracts.json')) {
  const changes = [];
  for (const f of files) {
    let src = readFileSync(f, 'utf8'); const before = src;
    for (const m of C.migrations) {
      src = src.replace(new RegExp(`<${m.from}(\\s[^>]*)?>`, 'g'), (all, rest = '') => { const set = Object.entries(m.set || {}).filter(([k]) => !new RegExp(`\\s${k}=`).test(rest)).map(([k, v]) => ` ${k}="${v}"`).join(''); changes.push({ file: f, line: lineOf(before, before.indexOf(all)), from: `<${m.from}>`, to: `<${m.to}${set}>`, why: m.why }); return `<${m.to}${set}${rest}>`; });
      src = src.replace(new RegExp(`</${m.from}>`, 'g'), `</${m.to}>`);
    }
    if (write && src !== before) writeFileSync(f, src);
  }
  return changes;
}

// ---------- Aufruf ----------
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('fundament.mjs')) {
  const [cmd, ...rest] = process.argv.slice(2); const flags = rest.filter((a) => a.startsWith('--')); const paths = rest.filter((a) => !a.startsWith('--'));
  // Fehler lassen den Lauf scheitern, Hinweise nicht (außer mit --strict). Begründete Ausnahmen werden genannt, damit sie im Bericht landen.
  const print = (findings, n) => { const allowed = findings.allowed || []; const errors = findings.filter((x) => x.level !== 'warning'); const hints = findings.filter((x) => x.level === 'warning'); const failed = errors.length > 0 || (flags.includes('--strict') && hints.length > 0);
    if (flags.includes('--json')) console.log(JSON.stringify({ ok: !failed, checked: n, findings: [...findings], allowed }, null, 2));
    else { for (const x of findings) console.log(`${x.file}${x.line ? ':' + x.line : ''}  [${x.id}]${x.level === 'warning' ? '  Hinweis:' : ''}  ${x.message}\n    ${x.level === 'warning' ? 'Vorschlag' : 'Behebung'}: ${x.fix}`);
      for (const x of allowed) console.log(`${x.file}:${x.line}  [${x.id}]  Ausnahme: ${x.reason}`);
      const parts = [errors.length && `${errors.length} ${errors.length === 1 ? 'Fehler' : 'Fehler'}`, hints.length && `${hints.length} ${hints.length === 1 ? 'Hinweis' : 'Hinweise'}`, allowed.length && `${allowed.length} begründete ${allowed.length === 1 ? 'Ausnahme' : 'Ausnahmen'}`].filter(Boolean);
      console.log(!findings.length && !allowed.length ? `Sauber: ${n} geprüft, keine Befunde.` : `${findings.length || allowed.length ? '\n' : ''}${errors.length ? '' : 'Bestanden: '}${parts.join(', ')}.`); }
    process.exit(failed ? 1 : 0); };
  try {
    if (cmd === 'lint') { const { loadSpec } = await import('../tooling/assemble.mjs'); print(lint(await loadSpec(ROOT.pathname)), 1); }
    else if (cmd === 'check' && paths.length) { const files = collect(paths, ['.html', '.htm', '.css', '.svelte']); if (!files.length) throw new Error('Keine HTML-, CSS- oder Svelte-Dateien gefunden.'); print(check(files, undefined, { html: flags.includes('--html') }), files.length); }
    else if (cmd === 'audit' && paths.length) { const files = collect(paths, ['.html', '.htm']).map((f) => new URL(f, `file://${process.cwd()}/`).pathname); const { audit } = await import('./audit.mjs'); print(await audit(files), files.length); }
    else if (cmd === 'migrate' && paths.length) { const ch = migrate(collect(paths, ['.html', '.htm', '.svelte']), flags.includes('--write')); for (const c of ch) console.log(`${c.file}:${c.line}  ${c.from} → ${c.to}  (${c.why})`); console.log(ch.length ? `\n${ch.length} Ersetzungen${flags.includes('--write') ? ' geschrieben' : ' möglich; mit --write ausführen'}.` : 'Nichts zu migrieren.'); }
    else { console.error('Aufruf:\n  node cli/fundament.mjs lint\n  node cli/fundament.mjs check <Pfad …> [--json] [--html]   (--html: Seiten aus reinem HTML und CSS)\n  node cli/fundament.mjs audit <Pfad …> [--json]   (gerendert, braucht Chrome)\n  node cli/fundament.mjs migrate <Pfad …> [--write]'); process.exit(2); }
  } catch (e) { console.error('Fehler: ' + e.message); process.exit(2); }
}
