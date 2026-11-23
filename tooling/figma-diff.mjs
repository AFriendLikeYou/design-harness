// Vergleicht den Schnappschuss aus Figma (specs/figma.snapshot.json) mit der Spec.
// Figma ist die Werkbank der Gestaltung: Was Designer dort ändern, erscheint hier als Vorschlag für die Spec.
//   node tooling/figma-diff.mjs            zeigt Abweichungen, Exit 1 wenn es welche gibt
//   node tooling/figma-diff.mjs --apply    übernimmt die eindeutigen Änderungen in specs/system.json (danach node tooling/verify.mjs)
//   node tooling/figma-diff.mjs --soll     schreibt den Stand, den Figma laut Spec haben müsste (zum Vergleich oder als erster Schnappschuss)
//   --snapshot <Datei> --spec <Datei>      andere Dateien verwenden
import { readFileSync, writeFileSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const root = new URL('..', import.meta.url).pathname; const specPath = arg('--spec', root + 'specs/system.json'); const snapPath = arg('--snapshot', root + 'specs/figma.snapshot.json');
const spec = JSON.parse(readFileSync(specPath, 'utf8')); const P = spec.cssPrefix;
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
export const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); };
const SCOPE = { space: 'GAP', radius: 'CORNER_RADIUS', 'border-width': 'STROKE_FLOAT', size: 'WIDTH_HEIGHT' };
const isBool = (p) => p.values && p.values.join() === 'false,true';
export function describe(c) { const L = [`Status: ${c.status} · v${c.version}`, c.purpose]; if (c.rules.length) L.push(`Regeln: ${c.rules.map((r) => `${r.text} [${r.id}]`).join(' ')}`); L.push(`A11y: ${c.a11y}`, `Spec: ds/${kebab(c.name)}`); if (c.status !== 'deprecated') L.push(`Code: <${P}-${kebab(c.name)}> aus "${spec.codePackage}"`); return (c.deprecated ? `VERALTET seit ${c.deprecated.since} – nutze ${c.deprecated.use}.\n` : '') + L.join('\n'); }
// Der Stand, den die Figma-Datei laut Spec haben muss, in derselben Form wie der Export
export function expected(s = spec) {
  const variables = [];
  for (const [hue, stops] of Object.entries(s.primitives.color)) for (const [stop, v] of Object.entries(stops)) variables.push(['primitives', `color/${hue}/${stop}`, 'COLOR', { value: v.toLowerCase() }, [], '', 'Primitiv. Nicht direkt verwenden.', 1]);
  for (const d of s.primitives.dimension) variables.push(['primitives', `dimension/${d}`, 'FLOAT', { value: d }, [], '', 'Primitiv. Nicht direkt verwenden.', 1]);
  for (const x of s.primitives.fontSize) variables.push(['primitives', `font-size/${x}`, 'FLOAT', { value: x }, ['FONT_SIZE'], `var(--${P}-font-size-${x})`, 'Schriftgröße, gebunden in Text-Styles.', 0]);
  for (const x of s.primitives.lineHeight) variables.push(['primitives', `line-height/${x}`, 'FLOAT', { value: x }, ['LINE_HEIGHT'], `var(--${P}-line-height-${x})`, 'Zeilenhöhe, gebunden in Text-Styles.', 0]);
  for (const [n, t] of Object.entries(s.semantic.color)) variables.push(['semantic', `color/${n}`, 'COLOR', { light: `>color/${t.light}`, dark: `>color/${t.dark}` }, [...t.scopes].sort(), `var(--${P}-color-${kebab(n)})`, t.why, 0]);
  for (const [g, sc] of Object.entries(SCOPE)) for (const [n, t] of Object.entries(s.semantic[g] || {})) { const v = s.primitives.dimension.includes(t.value) ? `>dimension/${t.value}` : t.value; variables.push(['semantic', `${g}/${n}`, 'FLOAT', { light: v, dark: v }, [sc], `var(--${P}-${g}-${n})`, t.why, 0]); }
  const textStyles = s.textStyles.map((t) => [t.name, t.weight, t.size, t.line, `${t.why} Code: var(--${P}-text-${kebab(t.name)})`]);
  const components = s.components.map((c) => [c.name, c.props.filter((p) => !['behavior', 'codeText'].includes(p.type)).map((p) => p.type === 'variant' ? [p.name, 'VARIANT', [...p.values].sort(), String(p.default)] : p.type === 'text' ? [p.name, 'TEXT', p.default, ''] : p.type === 'boolean' ? [p.name, 'BOOLEAN', p.default, ''] : [p.name, 'INSTANCE_SWAP', '', '']).sort((a, b) => a[0].localeCompare(b[0])), describe(c)]);
  variables.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])); textStyles.sort((a, b) => a[0].localeCompare(b[0])); components.sort((a, b) => a[0].localeCompare(b[0]));
  return { schema: 1, variables, textStyles, components };
}
export const sums = (x) => ({ variables: [x.variables.length, hash(JSON.stringify(x.variables))], textStyles: [x.textStyles.length, hash(JSON.stringify(x.textStyles))], components: [x.components.length, hash(JSON.stringify(x.components))] });

export function diff(snap, s = spec) {
  const want = expected(s); const out = []; const add = (kind, where, figma, inSpec, apply) => out.push({ kind, where, figma, spec: inSpec, apply });
  const key = (v) => v[0] + '/' + v[1]; const W = new Map(want.variables.map((v) => [key(v), v])); const F = new Map(snap.variables.map((v) => [key(v), v]));
  for (const [k, f] of F) { const w = W.get(k); if (!w) { add('Variable nur in Figma', k, JSON.stringify(f[3]), '', null); continue; }
    const [col, name] = f; const [group, ...rest] = name.split('/'); const n = rest.join('/');
    if (JSON.stringify(f[3]) !== JSON.stringify(w[3])) add('Wert', k, JSON.stringify(f[3]), JSON.stringify(w[3]), (sp) => {
      if (col === 'primitives' && group === 'color') { const [hue, stop] = rest; sp.primitives.color[hue][stop] = f[3].value.toUpperCase(); return true; }
      if (col === 'semantic' && group === 'color') { for (const m of ['light', 'dark']) if (typeof f[3][m] === 'string' && f[3][m].startsWith('>color/')) sp.semantic.color[n][m] = f[3][m].slice(7); else return false; return true; }
      if (col === 'semantic' && sp.semantic[group]?.[n]) { const v = f[3].light; const num = typeof v === 'string' ? Number(v.replace('>dimension/', '')) : v; if (!Number.isFinite(num)) return false; sp.semantic[group][n].value = num; if (!sp.primitives.dimension.includes(num) && group !== 'radius') { sp.primitives.dimension.push(num); sp.primitives.dimension.sort((a, b) => a - b); } return true; }
      return false; });
    if (f[6] !== w[6] && col === 'semantic') add('Beschreibung', k, f[6], w[6], (sp) => { const t = group === 'color' ? sp.semantic.color[n] : sp.semantic[group]?.[n]; if (!t) return false; t.why = f[6]; return true; });
    if (JSON.stringify(f[4]) !== JSON.stringify(w[4])) add('Scope', k, f[4].join('+'), w[4].join('+'), col === 'semantic' && group === 'color' ? (sp) => { sp.semantic.color[n].scopes = f[4]; return true; } : null);
    if (f[5] !== w[5]) add('Code-Syntax', k, f[5], w[5], null);
  }
  for (const k of W.keys()) if (!F.has(k)) add('Variable fehlt in Figma', k, '', JSON.stringify(W.get(k)[3]), null);
  const WT = new Map(want.textStyles.map((t) => [t[0], t]));
  for (const f of snap.textStyles) { const w = WT.get(f[0]); if (!w) { add('Text-Style nur in Figma', f[0], `${f[2]}/${f[3]} ${f[1]}`, '', null); continue; } if (f[1] !== w[1] || f[2] !== w[2] || f[3] !== w[3]) add('Text-Style', f[0], `${f[2]}/${f[3]} ${f[1]}`, `${w[2]}/${w[3]} ${w[1]}`, (sp) => { const t = sp.textStyles.find((x) => x.name === f[0]); Object.assign(t, { weight: f[1], size: f[2], line: f[3] }); for (const [list, v] of [[sp.primitives.fontSize, f[2]], [sp.primitives.lineHeight, f[3]]]) if (!list.includes(v)) { list.push(v); list.sort((a, b) => a - b); } return true; }); }
  for (const w of want.textStyles) if (!snap.textStyles.some((f) => f[0] === w[0])) add('Text-Style fehlt in Figma', w[0], '', `${w[2]}/${w[3]} ${w[1]}`, null);
  const WC = new Map(want.components.map((c) => [c[0], c]));
  for (const f of snap.components) { const w = WC.get(f[0]); if (!w) { add('Komponente nur in Figma', f[0], f[1].map((p) => p[0]).join(', '), '', (sp) => {
      // Gerüst aus Figma: Properties aus den Definitionen, Zweck, Regeln und A11y aus der Beschreibung nach dem Muster
      const L = f[2].split('\n'); const line = (p) => (L.find((l) => l.startsWith(p)) || '').slice(p.length).trim(); const status = L[0].match(/^Status: (\w+) · v([\d.]+)/);
      const rules = [...line('Regeln:').matchAll(/\s*(.+?) \[([\w/-]+)\]/g)].map((m) => ({ id: m[2], text: m[1].trim(), why: '', check: null }));
      sp.components.push({ name: f[0], kind: 'component', status: status ? status[1] : 'beta', version: status ? status[2] : '0.1.0', purpose: status ? (L[1] || '') : '',
        props: f[1].map((p) => p[1] === 'VARIANT' ? { name: p[0], type: 'variant', values: p[2].includes(p[3]) ? [p[3], ...p[2].filter((v) => v !== p[3])] : p[2], default: p[3] } : p[1] === 'TEXT' ? { name: p[0], type: 'text', default: p[2] } : p[1] === 'BOOLEAN' ? { name: p[0], type: 'boolean', default: p[2] } : { name: p[0], type: 'instance', default: 'Button' }),
        rules, a11y: line('A11y:'), do: [], dont: [] });
      return 'Gerüst angelegt. Es fehlen noch: styles je Variante, das Warum jeder Regel, Do und Don’t, die Umsetzung im Code. lint zeigt die Lücken'; }); continue; }
    const wp = new Map(w[1].map((p) => [p[0], p]));
    for (const p of f[1]) { const q = wp.get(p[0]); const where = `${f[0]}.${p[0]}`;
      if (!q) { add('Property nur in Figma', where, `${p[1]} ${JSON.stringify(p[2])}`, '', null); continue; }
      if (p[1] !== q[1]) { add('Property-Typ', where, p[1], q[1], null); continue; }
      if (p[1] === 'VARIANT' && JSON.stringify(p[2]) !== JSON.stringify(q[2])) add('Varianten-Werte', where, p[2].join(' | '), q[2].join(' | '), (sp) => { const c = sp.components.find((x) => x.name === f[0]); const prop = c.props.find((x) => x.name === p[0]); const added = p[2].filter((v) => !prop.values.includes(v)); const removed = prop.values.filter((v) => !p[2].includes(v)); prop.values = [...prop.values.filter((v) => !removed.includes(v)), ...added]; return added.length ? `neue Werte ${added.join(', ')}: styles und Umsetzung im Code ergänzen` : true; });
      if (p[1] === 'VARIANT' && p[3] !== q[3]) add('Standard', where, p[3], q[3], (sp) => { sp.components.find((x) => x.name === f[0]).props.find((x) => x.name === p[0]).default = p[3]; return true; });
      if ((p[1] === 'TEXT' || p[1] === 'BOOLEAN') && p[2] !== q[2]) add('Standard', where, String(p[2]), String(q[2]), (sp) => { sp.components.find((x) => x.name === f[0]).props.find((x) => x.name === p[0]).default = p[2]; return true; });
    }
    for (const q of w[1]) if (!f[1].some((p) => p[0] === q[0])) add('Property fehlt in Figma', `${f[0]}.${q[0]}`, '', q[1], null);
    if (f[2] !== w[2]) add('Beschreibung der Komponente', f[0], f[2].split('\n').find((l, i) => l !== w[2].split('\n')[i]) || '(Zeile entfernt)', w[2].split('\n').find((l, i) => l !== f[2].split('\n')[i]) || '', null);
  }
  for (const w of want.components) if (!snap.components.some((f) => f[0] === w[0])) add('Komponente fehlt in Figma', w[0], '', '', null);
  return out;
}

if (process.argv[1]?.endsWith('figma-diff.mjs')) {
  if (process.argv.includes('--soll')) { const x = expected(); if (process.argv.includes('--summen')) console.log(JSON.stringify(sums(x))); else { writeFileSync(snapPath, JSON.stringify({ ...x, file: 'aus der Spec erzeugt', exportedAt: new Date().toISOString().slice(0, 10) }, null, 1) + '\n'); console.log('geschrieben: ' + snapPath); } process.exit(0); }
  let snap; try { snap = JSON.parse(readFileSync(snapPath, 'utf8')); } catch { console.error(`Kein Schnappschuss unter ${snapPath}. In Figma das Plugin „Fundament Export“ ausführen und das Ergebnis dort speichern.`); process.exit(2); }
  const d = diff(snap);
  if (!d.length) { console.log(`Figma (Stand ${snap.exportedAt}) und Spec stimmen überein: ${snap.variables.length} Variablen, ${snap.textStyles.length} Text-Styles, ${snap.components.length} Komponenten.`); process.exit(0); }
  const apply = process.argv.includes('--apply'); const next = JSON.parse(JSON.stringify(spec)); let done = 0;
  for (const x of d) { let note = x.apply ? 'übernehmbar mit --apply' : 'braucht eine Entscheidung'; if (apply && x.apply) { const r = x.apply(next); if (r) { done++; note = r === true ? 'in die Spec übernommen' : `in die Spec übernommen; ${r}`; } else note = 'nicht eindeutig, braucht eine Entscheidung'; }
    console.log(`${x.kind}: ${x.where}\n    Figma: ${x.figma || '(fehlt)'}\n    Spec:  ${x.spec || '(fehlt)'}\n    ${note}`); }
  console.log(`\n${d.length} Abweichungen zwischen Figma (Stand ${snap.exportedAt}) und Spec.`);
  if (apply && done) { writeFileSync(specPath, JSON.stringify(next, null, 2) + '\n'); console.log(`${done} übernommen in ${specPath}. Jetzt: Version und Changelog anpassen, dann node tooling/verify.mjs.`); }
  process.exit(apply && done === d.length ? 0 : 1);
}
