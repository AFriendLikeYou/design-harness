// Setzt das System aus seinen drei Quellen zusammen:
//   specs/figma.snapshot.json  Tokenwerte, Text-Styles und das Aussehen je Variante (Export aus Figma)
//   ui/elements.js             Props, Slots und Verhalten der Komponenten (Code)
//   specs/rules.json           Regeln, Begründungen, Barrierefreiheit, Kontrastzusagen (von Hand)
// Ergebnis ist ein Objekt, mit dem Build, Check und Doku arbeiten. Es wird nie von Hand geschrieben; zur Ansicht liegt es in generated/system.json.
// Ältere Systeme mit einer einzigen specs/system.json (z. B. die ZDS-Probe) werden unverändert geladen.
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
export const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();

// Fehler in den Quelldateien: Klartext (welche Datei, was ist falsch, was tun), nie ein TypeError
export class SpecError extends Error {}
const readJson = (path, file, hint) => {
  let text; try { text = readFileSync(path, 'utf8'); } catch { throw new SpecError(`${file}: Datei nicht lesbar. ${hint}`); }
  try { return JSON.parse(text); } catch (e) { throw new SpecError(`${file}: kein gültiges JSON (${e.message}). ${hint}`); }
};
const SNAP = 'specs/figma.snapshot.json'; const EXPORT_HINT = 'Mit dem Plugin „Fundament Export“ neu exportieren und die Datei ersetzen.';
// Prüft den Schnappschuss (und die Kontrastpaare der Regeldatei) auf Form und Verweise, bevor damit gerechnet wird.
export function validateSnapshot(snap, rules) {
  const errs = []; const e = (m, file = SNAP) => errs.push(`${file}: ${m}`);
  const done = () => { if (errs.length) throw new SpecError(errs.slice(0, 8).join('\n') + (errs.length > 8 ? `\n… und ${errs.length - 8} weitere Fehler.` : '')); };
  if (!snap || typeof snap !== 'object' || Array.isArray(snap)) { e(`Inhalt ist kein Objekt. ${EXPORT_HINT}`); done(); }
  for (const k of ['variables', 'textStyles', 'components', 'styles']) if (!Array.isArray(snap[k])) e(`Schlüssel „${k}“ fehlt oder ist keine Liste. ${EXPORT_HINT}`);
  done();
  const prim = new Map(); const seen = new Set(); const hasPrim = snap.variables.some((v) => Array.isArray(v) && v[0] === 'primitives');
  snap.variables.forEach((v, i) => {
    if (!Array.isArray(v) || typeof v[0] !== 'string' || typeof v[1] !== 'string' || !v[3] || typeof v[3] !== 'object') { e(`Variable Nr. ${i + 1} hat nicht die Form [Sammlung, Name, Typ, Werte, …]. ${EXPORT_HINT}`); return; }
    const key = v[0] + '/' + v[1]; if (seen.has(key)) e(`Variable „${key}“ kommt doppelt vor. In Figma eine der beiden umbenennen oder löschen, dann neu exportieren.`); seen.add(key);
    if (v[0] === 'primitives') prim.set(v[1], v);
  });
  const sem = new Set();
  for (const v of snap.variables) {
    if (!Array.isArray(v) || typeof v[1] !== 'string' || !v[3] || typeof v[3] !== 'object') continue;
    const [col, name, type, values] = v; const key = col + '/' + name; const want = col === 'primitives' ? ['value'] : ['light', 'dark'];
    const miss = want.filter((m) => !(m in values)); if (miss.length) { e(`Variable „${key}“: erwartet die Modi „${want.join('“ und „')}“, gefunden: ${Object.keys(values).join(', ') || 'keine'}. Modi in Figma genau so (klein geschrieben) benennen und neu exportieren.`); continue; }
    for (const m of want) { const x = values[m];
      if (typeof x === 'string' && x.startsWith('>')) { if (!prim.has(x.slice(1))) e(`Variable „${key}“ (${m}) verweist auf „${x.slice(1)}“, das es nicht gibt. In Figma auf eine vorhandene Variable zeigen und neu exportieren.`); }
      else if (col !== 'primitives' && name.startsWith('color/') && hasPrim) e(`Variable „${key}“ (${m}) trägt „${x}“ statt eines Verweises auf ein Primitiv. Das System hat Primitive: in Figma als Alias auf color/… setzen.`);
      else if (type === 'FLOAT' && typeof x !== 'number') e(`Variable „${key}“ (${m}): Wert „${x}“ ist keine Zahl. In Figma korrigieren und neu exportieren.`); }
    if (col !== 'primitives' && name.startsWith('color/')) sem.add(name.slice(6));
  }
  snap.textStyles.forEach((t, i) => { if (!Array.isArray(t) || typeof t[0] !== 'string' || typeof t[1] !== 'string' || typeof t[2] !== 'number' || typeof t[3] !== 'number') e(`Text-Style Nr. ${i + 1} hat nicht die Form [Name, Schnitt, Größe, Zeilenhöhe, Beschreibung]. ${EXPORT_HINT}`); });
  const cn = new Set(); snap.components.forEach((c, i) => { if (!Array.isArray(c) || typeof c[0] !== 'string' || !Array.isArray(c[1])) { e(`Komponente Nr. ${i + 1} hat nicht die Form [Name, Properties, Beschreibung]. ${EXPORT_HINT}`); return; } if (cn.has(c[0])) e(`Komponente „${c[0]}“ kommt doppelt vor. In Figma eine umbenennen oder löschen, dann neu exportieren.`); cn.add(c[0]); });
  snap.styles.forEach((s, i) => { if (!Array.isArray(s) || typeof s[0] !== 'string' || !s[2] || typeof s[2] !== 'object') e(`Aussehen Nr. ${i + 1} hat nicht die Form [Komponente, Variante, Rollen]. ${EXPORT_HINT}`); });
  if (rules && !Array.isArray(rules.components)) e('Schlüssel „components“ fehlt oder ist keine Liste.', 'specs/rules.json');
  for (const p of rules?.contrast || []) for (const k of [p.fg, ...(p.on || [])]) if (!sem.has(k)) e(`Kontrastpaar verweist auf das unbekannte Token „${k}“. Token in Figma anlegen oder das Paar korrigieren.`, 'specs/rules.json');
  done();
}

export async function loadSpec(dir) {
  const p = (f) => join(dir, f);
  if (!existsSync(p('specs/rules.json'))) return readJson(p('specs/system.json'), 'specs/system.json', 'Datei reparieren.');
  const rules = readJson(p('specs/rules.json'), 'specs/rules.json', 'Datei reparieren.'); const snap = readJson(p(SNAP), SNAP, EXPORT_HINT);
  validateSnapshot(snap, rules);
  const code = await import(pathToFileURL(p('ui/elements.js')).href);
  const primitives = { color: {}, dimension: [], fontSize: [], lineHeight: [] }; const semantic = { color: {} };
  // Maße kommen aus dem Wert des Primitivs, auf das die Variable zeigt, nicht aus dessen Namen
  const primByName = new Map(snap.variables.filter((v) => v[0] === 'primitives').map((v) => [v[1], v]));
  const num = (v, d = 0) => { if (typeof v !== 'string' || !v.startsWith('>')) return v; const t = primByName.get(v.slice(1)); return t && d < 5 ? num(t[3].value, d + 1) : NaN; };
  for (const [col, name, , values, scopes, , description] of snap.variables) {
    const [group, ...rest] = name.split('/'); const n = rest.join('/');
    if (col === 'primitives') { if (group === 'color') (primitives.color[rest[0]] ??= {})[rest[1]] = values.value; else if (group === 'dimension') primitives.dimension.push(values.value); else if (group === 'font-size') primitives.fontSize.push(values.value); else if (group === 'line-height') primitives.lineHeight.push(values.value); }
    else if (group === 'color') {
      // Verweist die Variable auf ein Primitiv, gilt der Verweis. Trägt sie den Wert selbst (Sammlung ohne Primitive), wird je Mode ein Primitiv mitgeführt.
      const ref = (mode) => { const v = String(values[mode] ?? values.light); if (v.startsWith('>color/')) return v.slice(7); (primitives.color[mode] ??= {})[kebab(n)] = v; return `${mode}/${kebab(n)}`; };
      semantic.color[n] = { light: ref('light'), dark: ref('dark'), scopes, why: description };
    } else { const v = num(values.light); (semantic[group] ??= {})[n] = { value: v, why: description }; if (typeof values.light === 'number' && group !== 'radius' && !primitives.dimension.includes(v)) primitives.dimension.push(v); }
  }
  for (const k of ['dimension', 'fontSize', 'lineHeight']) primitives[k].sort((a, b) => a - b);
  for (const g of Object.keys(semantic)) if (g !== 'color') semantic[g] = Object.fromEntries(Object.entries(semantic[g]).sort((a, b) => a[1].value - b[1].value));
  const textStylesRaw = snap.textStyles; for (const t of textStylesRaw) { if (!primitives.fontSize.includes(t[2])) primitives.fontSize.push(t[2]); if (!primitives.lineHeight.includes(t[3])) primitives.lineHeight.push(t[3]); }
  for (const k of ['dimension', 'fontSize', 'lineHeight']) primitives[k].sort((x, y) => x - y);
  const textStyles = snap.textStyles.map(([name, weight, size, line, description]) => ({ name, size, line, weight, why: description.replace(/ Code: var\([^)]*\)$/, '') })).sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
  // Aussehen je Variante, wie es in Figma gebunden ist
  const looks = {}; for (const [comp, variant, roles] of snap.styles || []) (looks[comp] ??= {})[variant || 'default'] = roles;
  const components = rules.components.map((c) => { const api = code.COMPONENTS[c.name] || { props: [] }; return { ...c, ...(code.COMPONENTS[c.name] ? {} : { missingCode: true }), ...(api.impl ? { impl: api.impl } : {}), props: api.props, passthrough: api.passthrough || [], looks: looks[c.name] || {} }; });
  for (const name of Object.keys(code.COMPONENTS)) if (!rules.components.some((c) => c.name === name)) components.push({ name, kind: 'component', status: 'beta', version: '0.0.0', purpose: '', rules: [], a11y: '', do: [], dont: [], props: code.COMPONENTS[name].props, passthrough: code.COMPONENTS[name].passthrough || [], looks: looks[name] || {}, missingRules: true });
  return { name: rules.name, version: rules.version, cssPrefix: code.PREFIX, codePackage: code.PACKAGE, ...(rules.fontFamily ? { fontFamily: rules.fontFamily } : {}), primitives, semantic, textStyles, contrast: rules.contrast, components, principles: rules.principles, vagueActions: rules.vagueActions, migrations: rules.migrations, changelog: rules.changelog, figma: { exportedAt: snap.exportedAt, file: snap.file }, assembled: true };
}
// Alle Farb-Tokens, die eine Komponente in irgendeiner Variante trägt (aus looks) oder laut alter Spec tragen darf (aus styles)
export const colorRoles = (c) => [...new Set([...Object.values(c.looks || {}), ...Object.values(c.styles || {})].flatMap((st) => Object.entries(st).filter(([k, v]) => !/Width$/.test(k) && v && !v.startsWith('(')).map(([, v]) => v)))];
// Beschreibung einer Komponente, wie sie in Figma stehen soll
export function describe(c, spec) { const L = [`Status: ${c.status} · v${c.version}`, c.purpose]; if (c.rules.length) L.push(`Regeln: ${c.rules.map((r) => `${r.text} [${r.id}]`).join(' ')}`); L.push(`A11y: ${c.a11y}`, `Spec: ds/${kebab(c.name)}`); if (c.status !== 'deprecated') L.push(`Code: <${spec.cssPrefix}-${kebab(c.name)}> aus "${spec.codePackage}"`); return (c.deprecated ? `VERALTET seit ${c.deprecated.since} – nutze ${c.deprecated.use}.\n` : '') + L.join('\n'); }
