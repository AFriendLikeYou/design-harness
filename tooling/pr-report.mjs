// Schreibt den Bericht zu einem Figma-Stand als Markdown (für den Kommentar am Pull Request).
// Vergleicht specs/figma.snapshot.json mit dem Stand auf main, baut und gleicht ab.
// Ausgabe: Markdown auf stdout. Exit 0 = übernehmbar, 1 = in Figma zu beheben (Build gescheitert).
//   node tooling/pr-report.mjs [<alter Stand als Datei>]     ohne Angabe: git show origin/main:specs/figma.snapshot.json
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { changes, fromBuild, fromDiff } from './snapshot-report.mjs';
const root = new URL('..', import.meta.url).pathname;
const run = (cmd, args) => { const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 5e7 }); return { ok: r.status === 0, out: (r.stdout || '').trim().split('\n').filter(Boolean), err: (r.stderr || '').trim().split('\n').filter(Boolean), text: r.stdout || '' }; };
let old = {}; try { old = JSON.parse(process.argv[2] ? readFileSync(process.argv[2], 'utf8') : run('git', ['show', 'origin/main:specs/figma.snapshot.json']).text); } catch {}
const snap = JSON.parse(readFileSync(root + 'specs/figma.snapshot.json', 'utf8')); const names = snap.components.map((c) => c[0]).sort((x, y) => y.length - x.length);
const list = changes(old, snap); const build = run('node', ['build.mjs']); const diff = build.ok ? run('node', ['tooling/figma-diff.mjs']) : null;
const blockers = build.ok ? [] : fromBuild(build.err, names); const todo = diff && !diff.ok ? fromDiff([...diff.out, ...diff.err], names) : [];
const L = ['## Figma-Stand vom ' + (snap.exportedAt || '') + (snap.file ? ' aus „' + snap.file + '“' : ''), ''];
if (blockers.length) L.push('**So kann der Stand nicht übernommen werden.** Das ist in Figma zu beheben, danach neu senden.', '', ...blockers.map((x) => '- ' + x.text), '');
else if (todo.length) L.push('**Übernehmbar, aber die Entwicklung muss noch nachziehen.** Solange das offen ist, gilt der Baustein als Entwurf.', '');
else L.push('**Figma und Code passen zusammen.**', '');
L.push('### Das ändert sich (' + list.length + ')', '', ...(list.length ? list.slice(0, 40).map((x) => '- ' + x) : ['Nichts. Der Stand ist derselbe wie auf main.']), ...(list.length > 40 ? ['- und ' + (list.length - 40) + ' weitere'] : []), '');
if (todo.length) L.push('### Im Code noch nachzuziehen (' + todo.length + ')', '', ...todo.flatMap((x) => ['- **' + x.text + '**', ...(x.detail || []).map((d) => '  - ' + d)]), '');
console.log(L.join('\n'));
process.exit(blockers.length ? 1 : 0);
