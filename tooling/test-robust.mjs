// Verfälscht je Fall genau eine Sache in einer Kopie des Repos und verlangt, dass der passende Schritt mit Exit ≠ 0 und einer verständlichen Meldung scheitert
// (kein TypeError, kein Stacktrace). Dazu ein paar Fälle, die grün bleiben oder unverändert bleiben müssen. Das echte Repo wird nicht angefasst.
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
const SRC = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const SKIP = new Set(['.git', 'evals', 'node_modules']);
const copy = () => { const dir = mkdtempSync(join(tmpdir(), 'fundament-robust-')); cpSync(SRC, dir, { recursive: true, filter: (p) => { const r = relative(SRC, p); return !r.split(sep).some((x) => SKIP.has(x)) && r !== join('probe-zds', 'vergleich') && r !== 'probe-zds/vergleich.html'; } }); return dir; };
const BAD = /TypeError|ReferenceError|SyntaxError|RangeError|node:internal|\n\s+at \S+ \(|\n\s+at file:/;
const run = (dir, args) => { const r = spawnSync('node', args, { cwd: dir, encoding: 'utf8', timeout: 120000 }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const json = (dir, f, fn) => { const p = join(dir, f); const o = JSON.parse(readFileSync(p, 'utf8')); fn(o); writeFileSync(p, JSON.stringify(o, null, 1)); };
const SNAP = 'specs/figma.snapshot.json', RULES = 'specs/rules.json';
const snapOf = (d, fn) => json(d, SNAP, fn); const rulesOf = (d, fn) => json(d, RULES, fn);
const looks = (o, comp, pick) => o.styles.filter((x) => x[0] === comp && pick(x[1])).forEach((x) => x);
const tree = (dir, subs) => { const m = {}; const walk = (p) => { if (!existsSync(p)) return; if (statSync(p).isDirectory()) readdirSync(p).forEach((f) => walk(join(p, f))); else m[relative(dir, p)] = readFileSync(p, 'utf8'); }; subs.forEach((x) => walk(join(dir, x))); return m; };
const LINT = ['cli/fundament.mjs', 'lint'], BUILD = ['build.mjs'], DIFF = ['tooling/figma-diff.mjs'], STYLES = ['tooling/test-styles.mjs'];

// fail: jeder Schritt muss mit Exit ≠ 0 enden und die Meldung muss `match` enthalten
const fail = (name, setup, steps, match) => ({ name, setup, steps, match });
// ok: eigener Ablauf, gibt einen Fehlertext oder nichts zurück
const own = (name, fn) => ({ name, fn });
const cases = [
  fail('Modusnamen Light/Dark', (d) => snapOf(d, (o) => o.variables.forEach((v) => { if (v[0] !== 'primitives') { v[3] = { Light: v[3].light, Dark: v[3].dark }; } })), [LINT, BUILD, DIFF, STYLES], /Modi/),
  fail('ungültiges JSON', (d) => writeFileSync(join(d, SNAP), readFileSync(join(d, SNAP), 'utf8').slice(0, 5000)), [LINT, BUILD, DIFF, STYLES], /kein gültiges JSON/),
  fail('textStyles fehlt', (d) => snapOf(d, (o) => { delete o.textStyles; }), [LINT, BUILD, DIFF, STYLES], /textStyles/),
  fail('doppelte Variable', (d) => snapOf(d, (o) => o.variables.push(structuredClone(o.variables.find((v) => v[0] !== 'primitives')))), [LINT, BUILD, DIFF], /doppelt/),
  fail('doppelte Komponente', (d) => snapOf(d, (o) => o.components.push(structuredClone(o.components[0]))), [LINT, DIFF], /doppelt/),
  fail('Verweis ins Leere', (d) => snapOf(d, (o) => { o.variables.find((v) => v[1] === 'space/2xl')[3].light = '>dimension/999'; }), [LINT, DIFF], /dimension\/999/),
  fail('Farbe ohne Verweis auf ein Primitiv', (d) => snapOf(d, (o) => { o.variables.find((v) => v[0] === 'semantic' && v[1].startsWith('color/'))[3].light = '#ff0000'; }), [LINT, BUILD], /statt eines Verweises/),
  fail('Kontrastpaar auf fehlendes Token', (d) => rulesOf(d, (o) => { o.contrast[0].fg = 'text/gibt-es-nicht'; }), [LINT, BUILD], /unbekannte Token/),
  fail('unbekannter Schriftschnitt', (d) => snapOf(d, (o) => { o.textStyles[0][1] = 'Ultra Black'; }), [BUILD], /Schriftschnitt „Ultra Black“/),
  fail('Rolle thumb auf anderes Token', (d) => snapOf(d, (o) => o.styles.filter((x) => x[0] === 'Switch').forEach((x) => { x[2].thumb = 'bg/canvas'; })), [STYLES], /thumb/),
  fail('Rolle mark auf anderes Token', (d) => snapOf(d, (o) => o.styles.filter((x) => x[0] === 'Checkbox').forEach((x) => { if (x[2].mark) x[2].mark = 'bg/canvas'; })), [STYLES], /mark/),
  fail('Rolle helper auf anderes Token', (d) => snapOf(d, (o) => o.styles.filter((x) => x[0] === 'Checkbox').forEach((x) => { x[2].helper = 'bg/canvas'; })), [STYLES], /helper/),
  fail('Rolle body auf anderes Token', (d) => snapOf(d, (o) => o.styles.filter((x) => x[0] === 'Card').forEach((x) => { x[2].body = 'bg/canvas'; })), [STYLES], /body/),
  fail('Rolle borderWidth auf anderes Token', (d) => snapOf(d, (o) => o.styles.filter((x) => x[0] === 'Card').forEach((x) => { x[2].borderWidth = 'strong'; })), [STYLES], /borderWidth/),
  fail('fg einer Button-Variante entfernt', (d) => snapOf(d, (o) => { delete o.styles.find((x) => x[0] === 'Button' && x[1].startsWith('variant=secondary') && x[1].includes('state=hover'))[2].fg; }), [LINT], /fg fehlt/),
  fail('Regel mit check, den die CLI nicht kennt', (d) => rulesOf(d, (o) => { o.components[0].rules.find((r) => r.id === 'button/label-verb').check = 'gibt-es-nicht'; }), [LINT], /gibt-es-nicht/),
  fail('Regel mit check, aber ohne Verdrahtung in der CLI', (d) => rulesOf(d, (o) => { o.components[0].rules.find((r) => r.id === 'button/label-verb').check = 'max-words'; }), [LINT], /CHECKED_IDS/),
  fail('gelöschte Regel, die die CLI noch prüft', (d) => rulesOf(d, (o) => { const c = o.components.find((x) => x.name === 'Link'); c.rules = c.rules.filter((r) => r.id !== 'link/has-target'); }), [LINT, BUILD], /link\/has-target/),
  fail('Komponente nur in rules.json', (d) => rulesOf(d, (o) => o.components.push({ name: 'Geist', kind: 'component', status: 'beta', version: '0.1.0', purpose: 'Gibt es nur in den Regeln.', rules: [], a11y: 'Keine.', do: [], dont: [] })), [LINT, BUILD], /Regeleintrag ohne Komponente im Code/),
  own('gelöschte Regel: check gibt keinen Befund mehr aus', () => {
    const d = copy(); try { json(d, 'generated/contracts.json', (o) => { o.components.Link.rules = o.components.Link.rules.filter((r) => r.id !== 'link/has-target'); });
      const r = run(d, ['cli/fundament.mjs', 'check', 'tooling/fixtures/fehler.html', '--json']); if (BAD.test(r.out)) return 'Absturz im Check'; if (/link\/has-target/.test(r.out)) return 'Check gibt noch einen Befund für link/has-target aus, obwohl die Regel im Vertrag fehlt'; if (!/"id"/.test(r.out)) return 'Check meldet gar nichts mehr'; } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('Kontrast fällt durch: nichts wird geschrieben', () => {
    const d = copy(); try { rulesOf(d, (o) => { o.contrast[0].min = 21; }); const before = tree(d, ['generated', 'ui', 'docs', 'LEITFADEN.md', 'plugin-export']); const r = run(d, BUILD);
      if (r.code === 0) return 'Build läuft trotz durchgefallenem Kontrast durch'; if (BAD.test(r.out) || !/mindestens 21/.test(r.out)) return 'Meldung unklar: ' + r.out.slice(0, 300);
      const after = tree(d, ['generated', 'ui', 'docs', 'LEITFADEN.md', 'plugin-export']); const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]); if (changed.length) return 'nach dem Abbruch verändert: ' + changed.join(', '); } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('Schnappschuss kaputt: nichts wird geschrieben', () => {
    const d = copy(); try { snapOf(d, (o) => { delete o.textStyles; }); const before = tree(d, ['generated', 'ui']); const r = run(d, BUILD); if (r.code === 0) return 'Build läuft durch'; const after = tree(d, ['generated', 'ui']); const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]); if (changed.length) return 'verändert: ' + changed.join(', '); } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('Build leert verwaiste Dateien in generated/components', () => {
    const d = copy(); try { writeFileSync(join(d, 'generated/components/verwaist.md'), 'alt'); const r = run(d, BUILD); if (r.code !== 0) return 'Build scheitert: ' + r.out.slice(-300); if (existsSync(join(d, 'generated/components/verwaist.md'))) return 'verwaiste Datei liegt noch da'; } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('geänderter Regeltext lässt figma-diff grün', () => {
    const d = copy(); try { rulesOf(d, (o) => { o.components[0].rules[0].text += ' Zusatz.'; }); const r = run(d, DIFF); if (r.code !== 0) return 'figma-diff schlägt an: ' + r.out.slice(0, 300); } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('Beschreibung ohne Spec-Zeile lässt figma-diff scheitern', () => {
    const d = copy(); try { snapOf(d, (o) => { const c = o.components.find((x) => x[0] === 'Button'); c[2] = c[2].split('\n').filter((l) => !l.startsWith('Spec:')).join('\n'); }); const r = run(d, DIFF); if (r.code === 0) return 'figma-diff bleibt grün'; if (!/Spec: ds\/button/.test(r.out)) return 'Meldung nennt die Zeile nicht'; } finally { rmSync(d, { recursive: true, force: true }); } }),
  own('Maß kommt aus dem Wert des Primitivs, nicht aus dem Namen', () => {
    const d = copy(); try { snapOf(d, (o) => { o.variables.find((v) => v[0] === 'primitives' && v[1] === 'dimension/16')[3].value = 17; }); const r = run(d, BUILD); if (r.code !== 0) return 'Build scheitert: ' + r.out.slice(-300);
      const css = readFileSync(join(d, 'ui/tokens.css'), 'utf8'); if (!/: 17px;/.test(css)) return 'tokens.css trägt 17px nicht (Wert kommt wohl aus dem Namen)'; } finally { rmSync(d, { recursive: true, force: true }); } }),
];
const fails = []; let n = 0;
for (const c of cases) {
  const t = Date.now(); let err = null;
  if (c.fn) err = c.fn() || null;
  else { const d = copy(); try { c.setup(d); for (const step of c.steps) { const r = run(d, step); const label = step.join(' ');
    if (r.code === 0) err = `${label}: Exit 0, sollte scheitern`; else if (BAD.test(r.out)) err = `${label}: Absturz statt Meldung: ${r.out.split('\n').slice(0, 3).join(' | ')}`; else if (!c.match.test(r.out)) err = `${label}: Meldung enthält ${c.match} nicht: ${r.out.trim().split('\n').slice(0, 3).join(' | ')}`;
    if (err) break; } } finally { rmSync(d, { recursive: true, force: true }); } }
  n++; if (err) fails.push(`${c.name}: ${err}`); if (process.env.VERBOSE) console.log(`${err ? 'FEHL' : 'ok  '} ${c.name} (${Date.now() - t} ms)`);
}
console.log(fails.length ? fails.join('\n') + `\n${fails.length} von ${n} Fällen fehlgeschlagen.` : `Robustheit bestanden: ${n} verfälschte Kopien des Repos, jede scheitert mit klarer Meldung oder bleibt wie verlangt.`);
process.exit(fails.length ? 1 : 0);
