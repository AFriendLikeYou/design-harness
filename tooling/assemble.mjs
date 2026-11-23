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

export async function loadSpec(dir) {
  const p = (f) => join(dir, f);
  if (!existsSync(p('specs/rules.json'))) return JSON.parse(readFileSync(p('specs/system.json'), 'utf8'));
  const rules = JSON.parse(readFileSync(p('specs/rules.json'), 'utf8')); const snap = JSON.parse(readFileSync(p('specs/figma.snapshot.json'), 'utf8'));
  const code = await import(pathToFileURL(p('ui/elements.js')).href);
  const primitives = { color: {}, dimension: [], fontSize: [], lineHeight: [] }; const semantic = { color: {} };
  const num = (v) => (typeof v === 'string' ? Number(v.replace('>dimension/', '')) : v);
  for (const [col, name, , values, scopes, , description] of snap.variables) {
    const [group, ...rest] = name.split('/'); const n = rest.join('/');
    if (col === 'primitives') { if (group === 'color') (primitives.color[rest[0]] ??= {})[rest[1]] = values.value; else if (group === 'dimension') primitives.dimension.push(values.value); else if (group === 'font-size') primitives.fontSize.push(values.value); else if (group === 'line-height') primitives.lineHeight.push(values.value); }
    else if (group === 'color') semantic.color[n] = { light: String(values.light).replace('>color/', ''), dark: String(values.dark).replace('>color/', ''), scopes, why: description };
    else (semantic[group] ??= {})[n] = { value: num(values.light), why: description };
  }
  for (const k of ['dimension', 'fontSize', 'lineHeight']) primitives[k].sort((a, b) => a - b);
  for (const g of Object.keys(semantic)) if (g !== 'color') semantic[g] = Object.fromEntries(Object.entries(semantic[g]).sort((a, b) => a[1].value - b[1].value));
  const textStyles = snap.textStyles.map(([name, weight, size, line, description]) => ({ name, size, line, weight, why: description.replace(/ Code: var\([^)]*\)$/, '') })).sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
  // Aussehen je Variante, wie es in Figma gebunden ist
  const looks = {}; for (const [comp, variant, roles] of snap.styles || []) (looks[comp] ??= {})[variant || 'default'] = roles;
  const components = rules.components.map((c) => { const api = code.COMPONENTS[c.name] || { props: [] }; return { ...c, ...(api.impl ? { impl: api.impl } : {}), props: api.props, passthrough: api.passthrough || [], looks: looks[c.name] || {} }; });
  for (const name of Object.keys(code.COMPONENTS)) if (!rules.components.some((c) => c.name === name)) components.push({ name, kind: 'component', status: 'beta', version: '0.0.0', purpose: '', rules: [], a11y: '', do: [], dont: [], props: code.COMPONENTS[name].props, passthrough: code.COMPONENTS[name].passthrough || [], looks: looks[name] || {}, missingRules: true });
  return { name: rules.name, version: rules.version, cssPrefix: code.PREFIX, codePackage: code.PACKAGE, ...(rules.fontFamily ? { fontFamily: rules.fontFamily } : {}), primitives, semantic, textStyles, contrast: rules.contrast, components, principles: rules.principles, vagueActions: rules.vagueActions, migrations: rules.migrations, changelog: rules.changelog, figma: { exportedAt: snap.exportedAt, file: snap.file }, assembled: true };
}
// Alle Farb-Tokens, die eine Komponente in irgendeiner Variante trägt (aus looks) oder laut alter Spec tragen darf (aus styles)
export const colorRoles = (c) => [...new Set([...Object.values(c.looks || {}), ...Object.values(c.styles || {})].flatMap((st) => Object.entries(st).filter(([k, v]) => !/Width$/.test(k) && v && !v.startsWith('(')).map(([, v]) => v)))];
// Beschreibung einer Komponente, wie sie in Figma stehen soll
export function describe(c, spec) { const L = [`Status: ${c.status} · v${c.version}`, c.purpose]; if (c.rules.length) L.push(`Regeln: ${c.rules.map((r) => `${r.text} [${r.id}]`).join(' ')}`); L.push(`A11y: ${c.a11y}`, `Spec: ds/${kebab(c.name)}`); if (c.status !== 'deprecated') L.push(`Code: <${spec.cssPrefix}-${kebab(c.name)}> aus "${spec.codePackage}"`); return (c.deprecated ? `VERALTET seit ${c.deprecated.since} – nutze ${c.deprecated.use}.\n` : '') + L.join('\n'); }
