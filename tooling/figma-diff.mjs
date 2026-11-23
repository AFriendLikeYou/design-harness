// Prüft den Schnappschuss aus Figma (specs/figma.snapshot.json) gegen die beiden anderen Quellen:
//   gegen den Code (ui/elements.js): Stimmen Komponenten, Properties, Werte und Standards überein?
//   gegen die Regeldatei (specs/rules.json): Steht in Figma die aktuelle Beschreibung?
// Dazu, ob die Figma-Datei in sich stimmt: Variablen mit Beschreibung, Scope und Code-Syntax, kein Aussehen ohne Variable.
// Tokenwerte und Aussehen werden nicht verglichen, sondern übernommen: Dafür ist Figma die Quelle.
//   node tooling/figma-diff.mjs                 zeigt Abweichungen, Exit 1 wenn es welche gibt
//   --snapshot <Datei>                          anderen Schnappschuss prüfen
//   --root <Ordner>                             anderes System prüfen (z. B. probe-zds)
import { readFileSync } from 'node:fs';
import { loadSpec, describe, kebab } from './assemble.mjs';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const root = arg('--root') ? new URL(arg('--root').replace(/\/?$/, '/'), `file://${process.cwd()}/`).pathname : new URL('..', import.meta.url).pathname;
const isBool = (p) => p.values && p.values.join() === 'false,true';

export function diff(snap, spec) {
  const P = spec.cssPrefix; const out = []; const add = (kind, where, figma, soll, todo) => out.push({ kind, where, figma, soll, todo });
  // 1) Figma in sich
  const names = new Set(snap.variables.map((v) => v[1]));
  for (const [col, name, type, values, scopes, syntax, description, hidden] of snap.variables) {
    const where = `${col}/${name}`; const group = name.split('/')[0];
    for (const v of Object.values(values)) if (typeof v === 'string' && v.startsWith('>') && !names.has(v.slice(1))) add('Verweis ins Leere', where, v, '', 'In Figma auf eine vorhandene Variable zeigen.');
    if (col !== 'primitives') {
      if (!description.trim()) add('Variable ohne Beschreibung', where, '', 'Einsatz und Grenze in einem Satz', 'Beschreibung in Figma ergänzen. Ohne sie weiß kein Agent, wofür das Token gedacht ist.');
      if (!scopes.length) add('Variable ohne Scope', where, '', '', 'Scope in Figma setzen, damit das Token nur dort angeboten wird, wo es hingehört.');
      const want = `var(--${P}-${group}-${kebab(name.split('/').slice(1).join('/'))})`; if (syntax !== want) add('Code-Syntax', where, syntax || '(leer)', want, 'Code-Syntax (Web) in Figma so eintragen. Daran erkennen Entwickler und Agenten den Namen im Code.');
    } else if ((group === 'color' || group === 'dimension') && !hidden) add('Primitiv nicht versteckt', where, '', '', 'In Figma vom Veröffentlichen ausnehmen, damit es niemand direkt verwendet.');
  }
  // 2) Komponenten gegen den Code und die Regeldatei
  const F = new Map(snap.components.map((c) => [c[0], c]));
  for (const c of spec.components) { const f = F.get(c.name);
    if (!f) { add('Komponente fehlt in Figma', c.name, '', `<${P}-${kebab(c.name)}>`, 'In Figma anlegen oder im Code entfernen.'); continue; }
    const want = c.props.filter((p) => !['behavior', 'codeText'].includes(p.type)); const fp = new Map(f[1].map((p) => [p[0], p]));
    for (const p of want) { const q = fp.get(p.name); const where = `${c.name}.${p.name}`;
      const type = p.type === 'variant' ? 'VARIANT' : p.type === 'text' ? 'TEXT' : p.type === 'boolean' ? 'BOOLEAN' : 'INSTANCE_SWAP';
      if (!q) { add('Property fehlt in Figma', where, '', `${type} (Code: ${kebab(p.name)})`, 'In Figma anlegen, mit genau diesem Namen.'); continue; }
      if (q[1] !== type) { add('Property-Typ', where, q[1], type, 'Typ in Figma oder im Code angleichen.'); continue; }
      if (type === 'VARIANT') { const a = [...p.values].sort().join(' | '), b = q[2].join(' | '); if (a !== b) add('Varianten-Werte', where, b, a, 'Neuer Wert in Figma: in ui/elements.js und im CSS umsetzen. Fehlt er in Figma: dort die Variante anlegen.'); if (String(p.default) !== q[3]) add('Standard', where, q[3], String(p.default), 'Standard auf einer Seite angleichen.'); }
      if ((type === 'TEXT' || type === 'BOOLEAN') && q[2] !== p.default) add('Standard', where, String(q[2]), String(p.default), 'Standard auf einer Seite angleichen.'); }
    for (const q of f[1]) if (!want.some((p) => p.name === q[0])) add('Property nur in Figma', `${c.name}.${q[0]}`, `${q[1]} ${JSON.stringify(q[2])}`, '', 'Im Code umsetzen (ui/elements.js, fundament.js) oder in Figma entfernen.');
    const d = describe(c, spec); if (f[2] !== d) { const a = f[2].split('\n'), b = d.split('\n'); const i = b.findIndex((l, n) => l !== a[n]); add('Beschreibung in Figma veraltet', c.name, a[i] || '(Zeile fehlt)', b[i] || '(Zeile zu viel)', 'Beschreibung aus generated/components/' + kebab(c.name) + '.figma.txt in Figma einfügen.'); }
    if (c.missingRules) add('Komponente ohne Regeln', c.name, '', '', 'Eintrag in specs/rules.json anlegen: Zweck, Regeln mit Warum, Barrierefreiheit.');
  }
  for (const f of snap.components) if (!spec.components.some((c) => c.name === f[0])) add('Komponente nur in Figma', f[0], f[1].map((p) => `${p[0]}: ${p[1]}`).join(', '), '', 'Im Code umsetzen (ui/elements.js, fundament.js, components.css) und in specs/rules.json eintragen. Bis dahin ist sie ein Entwurf.');
  // 3) Aussehen: alles an Variablen gebunden?
  for (const [comp, variant, roles] of snap.styles || []) for (const [role, tok] of Object.entries(roles)) if (tok.startsWith('(')) add('Aussehen ohne Variable', `${comp}${variant ? ' [' + variant + ']' : ''} / ${role}`, tok, '', 'In Figma an eine semantische Variable binden.');
  if (!snap.styles) add('Schnappschuss ohne Aussehen', 'styles', '(alter Export)', '', 'Mit dem aktuellen Plugin „Fundament Export“ neu exportieren.');
  return out;
}

if (process.argv[1]?.endsWith('figma-diff.mjs')) {
  const snapPath = arg('--snapshot', root + 'specs/figma.snapshot.json'); let snap;
  try { snap = JSON.parse(readFileSync(snapPath, 'utf8')); } catch { console.error(`Kein Schnappschuss unter ${snapPath}. In Figma das Plugin „Fundament Export“ ausführen und das Ergebnis dort speichern.`); process.exit(2); }
  const spec = await loadSpec(root); const d = diff(snap, spec);
  if (!d.length) { console.log(`Figma (Stand ${snap.exportedAt}), Code und Regeln passen zusammen: ${snap.variables.length} Variablen, ${snap.components.length} Komponenten, Aussehen von ${(snap.styles || []).length} Varianten.`); process.exit(0); }
  for (const x of d) console.log(`${x.kind}: ${x.where}\n    Figma: ${x.figma || '(fehlt)'}\n    Soll:  ${x.soll || '(fehlt)'}\n    Tun:   ${x.todo}`);
  console.log(`\n${d.length} Abweichungen zwischen Figma (Stand ${snap.exportedAt}) und Code oder Regeln.`);
  process.exit(1);
}
