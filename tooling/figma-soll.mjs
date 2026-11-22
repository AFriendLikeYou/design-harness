// Berechnet aus der Spec, was in der Figma-Datei stehen muss, als Prüfsummen je Gruppe.
// Dieselbe Kanonisierung läuft in Figma (siehe tooling/figma-ist.js); stimmen die Summen, stimmt die Datei mit der Spec überein.
import { readFileSync } from 'node:fs';
const spec = JSON.parse(readFileSync(new URL('../specs/system.json', import.meta.url), 'utf8'));
const P = spec.cssPrefix; const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
export const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); };
const lines = { primitives: [], semantic: [], textStyles: [] }; const comps = {};
for (const [hue, stops] of Object.entries(spec.primitives.color)) for (const [stop, v] of Object.entries(stops)) lines.primitives.push(`color/${hue}/${stop}|COLOR|${v.toLowerCase()}||-|Primitiv. Nicht direkt verwenden.|hidden`);
for (const d of spec.primitives.dimension) lines.primitives.push(`dimension/${d}|FLOAT|${d}||-|Primitiv. Nicht direkt verwenden.|hidden`);
for (const s of spec.primitives.fontSize) lines.primitives.push(`font-size/${s}|FLOAT|${s}|FONT_SIZE|var(--${P}-font-size-${s})|Schriftgröße, gebunden in Text-Styles.|shown`);
for (const l of spec.primitives.lineHeight) lines.primitives.push(`line-height/${l}|FLOAT|${l}|LINE_HEIGHT|var(--${P}-line-height-${l})|Zeilenhöhe, gebunden in Text-Styles.|shown`);
for (const [n, t] of Object.entries(spec.semantic.color)) lines.semantic.push(`color/${n}|COLOR|>color/${t.light},>color/${t.dark}|${[...t.scopes].sort().join('+')}|var(--${P}-color-${kebab(n)})|${t.why}|shown`);
const SC = { space: 'GAP', radius: 'CORNER_RADIUS', 'border-width': 'STROKE_FLOAT', size: 'WIDTH_HEIGHT' };
for (const [g, sc] of Object.entries(SC)) for (const [n, t] of Object.entries(spec.semantic[g])) { const v = spec.primitives.dimension.includes(t.value) ? `>dimension/${t.value}` : String(t.value); lines.semantic.push(`${g}/${n}|FLOAT|${v},${v}|${sc}|var(--${P}-${g}-${n})|${t.why}|shown`); }
for (const t of spec.textStyles) lines.textStyles.push(`${t.name}|${t.weight}|${t.size}|${t.line}|${t.why} Code: var(--${P}-text-${kebab(t.name)})|font-size/${t.size}|line-height/${t.line}`);
const isBool = (p) => p.values && p.values.join() === 'false,true';
for (const c of spec.components) {
  const L = [`Status: ${c.status} · v${c.version}`, c.purpose]; if (c.rules.length) L.push(`Regeln: ${c.rules.map((r) => `${r.text} [${r.id}]`).join(' ')}`); L.push(`A11y: ${c.a11y}`); L.push(`Spec: ds/${kebab(c.name)}`); if (c.status !== 'deprecated') L.push(`Code: <${P}-${kebab(c.name)}> aus "${spec.codePackage}"`);
  const desc = (c.deprecated ? `VERALTET seit ${c.deprecated.since} – nutze ${c.deprecated.use}.\n` : '') + L.join('\n');
  const props = c.props.filter((p) => p.type !== 'behavior').map((p) => `${p.name}:${p.type === 'variant' ? 'VARIANT(' + [...p.values].sort().join(',') + ')' : p.type === 'text' ? 'TEXT' : p.type === 'boolean' ? 'BOOLEAN' : 'INSTANCE_SWAP'}`).sort();
  comps[c.name] = [props.join(';'), desc];
}
const out = { primitives: [lines.primitives.length, hash(lines.primitives.sort().join('\n'))], semantic: [lines.semantic.length, hash(lines.semantic.sort().join('\n'))], textStyles: [lines.textStyles.length, hash(lines.textStyles.sort().join('\n'))] };
for (const [n, [props, desc]] of Object.entries(comps)) out[n] = [hash(props), hash(desc)];
if (process.argv[2] === '--zeilen') console.log(JSON.stringify({ lines, comps }, null, 1)); else console.log(JSON.stringify(out));
