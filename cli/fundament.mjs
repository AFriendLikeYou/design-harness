#!/usr/bin/env node
// Fundament-CLI. Liest ausschließlich specs/system.json und generated/contracts.json.
//   fundament lint                      prüft die Spec selbst (Verweise, Eindeutigkeit, Regeln mit Check)
//   fundament check <Pfad …> [--json]   prüft HTML/CSS gegen Verträge, Regeln und Grundsätze
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
export const IMPLEMENTED = ['max-per-view', 'no-raw-color', 'required-prop', 'slot-content', 'max-words', 'max-per-parent', 'max-children', 'no-nesting', 'registered-only', 'required-when-disabled', 'no-decoration', 'no-uppercase', 'no-vague-action', 'no-raw-space'];

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
export function lint(spec = read('specs/system.json')) {
  const out = []; const add = (id, message) => out.push({ file: 'specs/system.json', line: 0, id, message, fix: 'Spec korrigieren, dann node build.mjs.' });
  const colors = new Set(Object.keys(spec.semantic.color)); const prim = spec.primitives;
  if (!/^\d+\.\d+\.\d+$/.test(spec.version)) add('lint/version', `Version „${spec.version}“ ist nicht x.y.z.`);
  if (spec.changelog?.[0]?.version !== spec.version) add('lint/changelog', `Oberster Changelog-Eintrag (${spec.changelog?.[0]?.version}) passt nicht zur Version ${spec.version}.`);
  for (const [n, t] of Object.entries(spec.semantic.color)) { for (const m of ['light', 'dark']) { const [h, s] = (t[m] || '').split('/'); if (!prim.color[h]?.[s]) add('lint/primitive', `color/${n}: Primitiv „${t[m]}“ (${m}) gibt es nicht.`); } if (!t.why) add('lint/why', `color/${n} hat keine Begründung.`); if (!t.scopes?.length) add('lint/scope', `color/${n} hat keinen Scope.`); }
  for (const [g, entries] of Object.entries(spec.semantic)) if (g !== 'color') for (const [n, t] of Object.entries(entries)) { if (!t.why) add('lint/why', `${g}/${n} hat keine Begründung.`); if (g !== 'radius' && !prim.dimension.includes(t.value)) add('lint/primitive', `${g}/${n}: Maß ${t.value} fehlt in primitives.dimension.`); }
  for (const t of spec.textStyles) { if (!prim.fontSize.includes(t.size)) add('lint/primitive', `Text-Style ${t.name}: Größe ${t.size} fehlt.`); if (!prim.lineHeight.includes(t.line)) add('lint/primitive', `Text-Style ${t.name}: Zeilenhöhe ${t.line} fehlt.`); }
  for (const p of spec.contrast || []) for (const k of [p.fg, ...p.on]) if (!colors.has(k)) add('lint/contrast', `Kontrastpaar verweist auf unbekanntes Token „${k}“.`);
  const ids = new Set(); const names = new Set();
  const rules = [...spec.components.flatMap((c) => c.rules), ...(spec.principles || [])];
  for (const r of rules) { if (ids.has(r.id)) add('lint/rule-id', `Regel-ID „${r.id}“ ist doppelt.`); ids.add(r.id); if (!r.why) add('lint/why', `Regel ${r.id} hat keine Begründung.`); if (r.check && !IMPLEMENTED.includes(r.check)) add('lint/check-missing', `Regel ${r.id} verspricht den Check „${r.check}“, den die CLI nicht umsetzt.`); }
  for (const c of spec.components) {
    if (names.has(c.name)) add('lint/component', `Komponente ${c.name} ist doppelt.`); names.add(c.name);
    for (const f of ['purpose', 'a11y', 'version', 'status']) if (!c[f]) add('lint/component', `${c.name}: „${f}“ fehlt.`);
    for (const p of c.props) { if (p.type === 'variant' && !p.values.includes(String(p.default))) add('lint/prop', `${c.name}.${p.name}: Standard „${p.default}“ ist kein erlaubter Wert.`); if (p.type === 'instance' && !spec.components.some((x) => x.name === p.default)) add('lint/prop', `${c.name}.${p.name}: Standard-Komponente „${p.default}“ gibt es nicht.`); }
    if (c.status !== 'deprecated' && !c.styles) add('lint/styles', `${c.name}: styles fehlen.`);
    for (const [key, st] of Object.entries(c.styles || {})) {
      for (const [role, tok] of Object.entries(st)) { if (/Width$/.test(role)) { if (!spec.semantic['border-width']?.[tok]) add('lint/styles', `${c.name} [${key}]: Rahmenstärke „${tok}“ gibt es nicht.`); } else if (!colors.has(tok)) add('lint/styles', `${c.name} [${key}]: Token „${tok}“ gibt es nicht.`); }
      if (key !== 'default') for (const kv of key.split(', ')) { const [prop, val] = kv.split('='); const p = c.props.find((x) => x.name === prop); if (!p || !p.values?.includes(val)) add('lint/styles', `${c.name}: styles-Schlüssel „${kv}“ passt zu keinem Prop-Wert.`); }
    }
    if (c.status === 'deprecated' && !(spec.migrations || []).some((m) => m.from.endsWith(c.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()))) add('lint/migration', `${c.name} ist veraltet, hat aber keinen Eintrag in migrations.`);
  }
  return out;
}

// ---------- check ----------
export function check(files, C = read('generated/contracts.json')) {
  const P = C.cssPrefix; const findings = [];
  const add = (file, line, id, message, fix) => findings.push({ file, line, id, message, fix });
  // name = Art der Komponente für die Regeln (bei "impl" die der Umsetzung), title = Name im System
  const byEl = Object.fromEntries(Object.entries(C.components).map(([name, c]) => [c.element, { ...c, title: name, name: c.impl || name }]));
  const byClass = Object.fromEntries(Object.entries(C.components).map(([name, c]) => [c.class, { name, ...c }]));
  const GLOBAL = /^(id|class|slot|hidden|style|lang|dir|tabindex|data-.*|aria-.*)$/;
  const elList = Object.keys(byEl).filter((e) => byEl[e].status !== 'deprecated').map((e) => `<${e}>`).join(', ');

  function decl(file, css, L, allowed, owner) {
    for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch|oklab|lab|lch)a?\([^)]*\)/g)) add(file, L(m.index), 'tokens/no-raw-color', `Fester Farbwert ${m[0]}.`, `Durch ein semantisches Token ersetzen, var(--${P}-color-…). Gültige Namen: generated/contracts.json → tokens.`);
    for (const m of css.matchAll(new RegExp(`var\\(\\s*(--${P}-[a-z0-9-]+)`, 'g'))) {
      if (!C.tokens[m[1]]) add(file, L(m.index), 'tokens/unknown', `Token ${m[1]} gibt es nicht.`, 'Namen aus generated/contracts.json → tokens verwenden; keine Tokens erfinden.');
      else if (allowed && m[1].startsWith(`--${P}-color-`) && !allowed.has(m[1])) add(file, L(m.index), 'tokens/not-in-contract', `${owner} verwendet ${m[1]}, das steht nicht in seinem Vertrag.`, `Erlaubt: ${[...allowed].join(', ')}. Soll das Token dazugehören, styles in specs/system.json ergänzen und neu bauen.`);
    }
    for (const m of css.matchAll(/(?:^|[;{\s])(border(?:-(?:top|right|bottom|left))?(?:-width)?|outline(?:-width)?)\s*:\s*([^;}]*)/g)) { const px = m[2].match(/(?<![\w.-])(\d*\.?\d+)px/); if (px && +px[1] > 0) add(file, L(m.index), 'tokens/no-raw-border-width', `Feste Rahmenstärke ${px[0]} in „${m[1]}“.`, `var(--${P}-border-width-…) verwenden.`); }
    if (!allowed) for (const m of css.matchAll(/(?:^|[;{\s])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block))?|gap|row-gap|column-gap)\s*:\s*([^;}]*)/g)) { const raw = m[2].match(/(?<![\w.-])(\d*\.?\d+)(px|rem|em)/); if (raw && +raw[1] > 0) add(file, L(m.index), 'principles/spacing-from-scale', `Fester Abstand ${raw[0]} in „${m[1]}“.`, `var(--${P}-space-…) verwenden.`); }
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
  function html(file, src) {
    const L = (i) => lineOf(src, i);
    const toks = tokenize(src);
    toks.forEach((tk, i) => { if (!tk.close && tk.tag === 'style' && toks[i + 1]?.close) css(file, src.slice(tk.end, toks[i + 1].index), L(tk.index) - 1); });
    const specimen = toks.some((tk) => !tk.close && tk.tag === 'html' && 'data-fd-specimen' in tk.attrs);
    const VOID = new Set(['input', 'br', 'img', 'meta', 'link', 'hr']); const stack = []; let primary = 0; const alerts = new Map();
    for (const m of toks) {
      const { close, tag: t, attrs } = m;
      if (close) { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === t) { stack.length = i; break; } continue; }
      const line = L(m.index); const parent = stack[stack.length - 1]; const pc = parent?.comp;
      if (typeof attrs.style === 'string') decl(file, attrs.style, () => line, null, '');
      if (typeof attrs.class === 'string' && attrs.class.split(/\s+/).some((c) => c.startsWith(P + '-'))) add(file, line, 'components/internal-class', `Interne Klasse in class="${attrs.class}".`, `Die Klassen gehören dem Paket. Das Element verwenden: ${elList}.`);
      if (!t.startsWith(P + '-') && ['button', 'input', 'select', 'textarea', ...(C.components.Link ? ['a'] : [])].includes(t) && attrs.type !== 'hidden') add(file, line, 'principles/system-controls', `Nacktes <${t}>.`, `Systemkomponente verwenden: ${elList}. Fehlt eine passende, die Lücke melden statt nachzubauen.`);
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
          if ((variant === 'primary' || variant === 'danger') && slot !== 'trailing' && !specimen && ++primary > 1) add(file, line, 'button/one-primary', 'Mehr als ein primärer Button in dieser Ansicht (danger zählt als primär).', 'Weitere Aktionen mit variant="secondary" oder "ghost".');
          if (C.vagueActions.includes(v('label').trim().toLowerCase().replace(/[.!→>\s]+$/g, ''))) add(file, line, 'principles/action-says-what', `Beschriftung „${v('label')}“ sagt nicht, was passiert.`, 'Mit einem Verb beginnen und das Ergebnis nennen, z. B. „Änderungen speichern“.');
          if (slot === 'trailing' && (variant !== 'ghost' || v('size') !== 'sm')) add(file, line, 'textfield/trailing-slot', 'Button im Slot trailing ist nicht ghost und sm.', 'variant="ghost" size="sm" setzen.');
        }
        if (comp.name === 'Link') {
          if (!attrs.href || attrs.href === true) add(file, line, 'link/has-target', 'Link ohne href.', 'href="…" setzen. Ohne Ziel ist es eine Aktion und gehört in <fd-button>.');
          if (C.vagueActions.includes(v('label').trim().toLowerCase().replace(/[.!→>\s]+$/g, '')) || /^hier$/i.test(v('label').trim())) add(file, line, 'link/names-destination', `Linktext „${v('label')}“ nennt kein Ziel.`, 'Das Ziel nennen, z. B. „Alle Rechnungen ansehen“.');
        }
        if (comp.name === 'ConfirmAction' && !specimen && ++primary > 1) add(file, line, 'button/one-primary', 'Mehr als eine primäre Aktion in dieser Ansicht (ConfirmAction zählt als primär).', 'Weitere Aktionen mit variant="secondary" oder "ghost".');
        if (comp.name === 'TextField') {
          if (comp.attrs['trailing-action'] && v('trailing-action') !== 'none' && !(attrs['show-trailing'] !== undefined && attrs['show-trailing'] !== 'false')) add(file, line, 'textfield/trailing-slot', 'trailing-action ohne sichtbaren Slot.', 'show-trailing setzen und einen <fd-button slot="trailing" variant="ghost" size="sm"> einfügen.');
          if (v('state') === 'error' && !v('error-text').trim()) add(file, line, 'textfield/error-text', 'Fehlerzustand ohne error-text.', 'error-text="…" setzen und darin sagen, wie man den Fehler behebt.');
        }
        if (['Checkbox', 'Switch'].includes(comp.name) && v('disabled') && !(v('show-helper') && v('helper-text').trim())) add(file, line, `${comp.name.toLowerCase()}/disabled-reason`, `Deaktiviert ohne Erklärung.`, 'show-helper und helper-text="…" setzen und den Grund nennen.');
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
      if (!VOID.has(t) && !m.selfClosing) stack.push({ tag: t, comp, id: m.index, slots: {}, shown: Object.keys(attrs).filter((a) => a.startsWith('show-') && attrs[a] !== 'false') });
    }
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
  const print = (findings, n) => { if (flags.includes('--json')) console.log(JSON.stringify({ ok: !findings.length, checked: n, findings }, null, 2)); else if (!findings.length) console.log(`Sauber: ${n} geprüft, keine Befunde.`); else { for (const x of findings) console.log(`${x.file}${x.line ? ':' + x.line : ''}  [${x.id}]  ${x.message}\n    Behebung: ${x.fix}`); console.log(`\n${findings.length} Befunde.`); } process.exit(findings.length ? 1 : 0); };
  try {
    if (cmd === 'lint') print(lint(), 1);
    else if (cmd === 'check' && paths.length) { const files = collect(paths, ['.html', '.htm', '.css', '.svelte']); if (!files.length) throw new Error('Keine HTML-, CSS- oder Svelte-Dateien gefunden.'); print(check(files), files.length); }
    else if (cmd === 'audit' && paths.length) { const files = collect(paths, ['.html', '.htm']).map((f) => new URL(f, `file://${process.cwd()}/`).pathname); const { audit } = await import('./audit.mjs'); print(await audit(files), files.length); }
    else if (cmd === 'migrate' && paths.length) { const ch = migrate(collect(paths, ['.html', '.htm', '.svelte']), flags.includes('--write')); for (const c of ch) console.log(`${c.file}:${c.line}  ${c.from} → ${c.to}  (${c.why})`); console.log(ch.length ? `\n${ch.length} Ersetzungen${flags.includes('--write') ? ' geschrieben' : ' möglich; mit --write ausführen'}.` : 'Nichts zu migrieren.'); }
    else { console.error('Aufruf:\n  node cli/fundament.mjs lint\n  node cli/fundament.mjs check <Pfad …> [--json]\n  node cli/fundament.mjs audit <Pfad …> [--json]   (gerendert, braucht Chrome)\n  node cli/fundament.mjs migrate <Pfad …> [--write]'); process.exit(2); }
  } catch (e) { console.error('Fehler: ' + e.message); process.exit(2); }
}
