// Kleiner statischer Server für Doku und Beispiele. ES-Module laden im Browser nicht von file://, deshalb braucht es http.
// Nimmt außerdem den Export aus dem Figma-Plugin entgegen (POST /__snapshot): prüft ihn in einer Kopie (?dry: nur prüfen), legt ihn als specs/figma.snapshot.json ab und baut.
// Scheitert der Build, bleibt der alte Stand erhalten. Der Server hört nur auf dem eigenen Rechner (127.0.0.1).
// Aufruf: node tooling/serve.mjs [Port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
const root = new URL('..', import.meta.url).pathname; const port = Number(process.argv[2]) || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-allow-private-network': 'true' };
const run = (args, cwd = root) => { const r = spawnSync('node', args, { cwd, encoding: 'utf8' }); return { ok: r.status === 0, out: r.stdout.trim().split('\n').filter(Boolean), err: r.stderr.trim().split('\n').filter(Boolean) }; };
const MODE = { light: 'hell', dark: 'dunkel' };
// Was sich gegenüber dem Stand im Repo ändert, in Worten
function changes(old, snap) {
  const out = []; const by = (list, n) => new Map((list || []).map((x) => [x.slice(0, n).join('|'), x])); const show = (v) => String(v).replace(/^>/, '');
  const A = by(old.variables, 2), B = by(snap.variables, 2);
  for (const [k, v] of B) { const name = v[1]; const o = A.get(k); if (!o) { out.push('Neue Variable: ' + name); continue; }
    const modes = Object.keys(v[3]).filter((m) => JSON.stringify(o[3][m]) !== JSON.stringify(v[3][m]));
    const txt = modes.map((m) => show(o[3][m]) + ' → ' + show(v[3][m])); if (modes.length) out.push(name + ': ' + (modes.length === Object.keys(v[3]).length && new Set(txt).size === 1 ? txt[0] : modes.map((m, k) => (MODE[m] ? MODE[m] + ' ' : '') + txt[k]).join(', '))); else if (JSON.stringify(o) !== JSON.stringify(v)) out.push(name + ': Beschreibung oder Einsatzbereich geändert'); }
  for (const [k, o] of A) if (!B.has(k)) out.push('Entfernte Variable: ' + o[1]);
  const TA = by(old.textStyles, 1), TB = by(snap.textStyles, 1); for (const [k, v] of TB) { if (!TA.has(k)) out.push('Neuer Textstil: ' + k); else if (JSON.stringify(TA.get(k)) !== JSON.stringify(v)) out.push('Textstil geändert: ' + k); } for (const k of TA.keys()) if (!TB.has(k)) out.push('Entfernter Textstil: ' + k);
  const CA = by(old.components, 1), CB = by(snap.components, 1); const SA = by(old.styles, 2), SB = by(snap.styles, 2);
  for (const [name, v] of CB) { if (!CA.has(name)) { out.push('Neue Komponente: ' + name + ' (' + (snap.styles || []).filter((x) => x[0] === name).length + ' Varianten)'); continue; }
    const props = JSON.stringify(CA.get(name)[1]) !== JSON.stringify(v[1]); let looks = 0, added = 0, removed = 0; for (const [k, x] of SB) if (x[0] === name) { if (!SA.has(k)) added++; else if (JSON.stringify(SA.get(k)) !== JSON.stringify(x)) looks++; } for (const [k, x] of SA) if (x[0] === name && !SB.has(k)) removed++;
    const lost = new Set(); for (const [k, x] of SB) if (x[0] === name && SA.has(k)) for (const role of Object.keys(SA.get(k)[2])) if (!(role in x[2])) lost.add(role);
    const parts = [lost.size && 'Achtung, Rolle entfällt: ' + [...lost].join(', ') + ' (Ebene umbenannt oder gelöscht?)', props && 'Properties geändert', added && added + ' neue Varianten', removed && removed + ' Varianten entfernt', looks && 'Aussehen von ' + looks + ' Varianten geändert'].filter(Boolean);
    if (parts.length) out.push(name + ': ' + parts.join(', ')); else if (JSON.stringify(CA.get(name)) !== JSON.stringify(v)) out.push(name + ': Beschreibung geändert'); }
  for (const name of CA.keys()) if (!CB.has(name)) out.push('Entfernte Komponente: ' + name);
  return out;
}
// Meldungen von Build und Abgleich in Punkte übersetzen; jeder Punkt nennt, wenn möglich, die Komponente (für den Sprung in Figma)
const where = (text, names) => { const comp = names.find((n) => new RegExp('(^|[^\\wäöüß])' + n + '([^\\wäöüß]|$)').test(text)); const v = text.match(/\[([^\]]*=[^\]]*)\]/); return comp ? { comp, variant: v ? v[1] : '' } : {}; };
function fromBuild(lines, names) { return lines.filter((l) => !/^Das System ist in sich|^… und/.test(l)).map((l) => { let t = l.trim().replace(/^Fehler: /, '').replace(/^specs\/figma\.snapshot\.json: /, '').replace(/^\[[a-z/-]+\] /, '');
  const c = t.match(/^(light|dark): (\S+) auf (\S+) = ([\d.]+) \(mindestens ([\d.]+)\)/); if (c) t = 'Kontrast reicht nicht (' + MODE[c[1]] + '): ' + c[2] + ' auf ' + c[3] + ' hat ' + c[4] + ', nötig sind ' + c[5] + '. Eine der beiden Farben anpassen.';
  return { text: t, ...where(t, names) }; }); }
function fromDiff(lines, names) { const out = []; let skip = false; for (const l of lines) { if (!/^\s/.test(l)) skip = /^\d+ Abweichungen|passen zusammen|^Hinweis|Beschreibung/.test(l); if (skip) continue; if (/^\s/.test(l) && out.length) { const m = l.trim().match(/^(Figma|Soll|Tun):\s*(.*)$/); if (m) out[out.length - 1].detail.push((m[1] === 'Soll' ? 'Code' : m[1]) + ': ' + m[2]); else out[out.length - 1].detail.push(l.trim()); } else out.push({ text: l.trim(), detail: [], ...where(l, names) }); } return out; }
// Prüft einen Export (dry) oder übernimmt ihn. Die Prüfung läuft in einer Kopie; im Repo ändert sich dabei nichts.
function takeSnapshot(text, dry) {
  let snap; try { snap = JSON.parse(text); } catch { return { ok: false, title: 'Der Export ist kein gültiges JSON.', blockers: [], todo: [], changes: [] }; }
  for (const k of ['variables', 'textStyles', 'components', 'styles']) if (!Array.isArray(snap[k])) return { ok: false, title: 'Dem Export fehlt „' + k + '“.', blockers: [{ text: 'Plugin neu starten und noch einmal lesen.' }], todo: [], changes: [] };
  const rel = 'specs/figma.snapshot.json'; const file = join(root, rel); const before = existsSync(file) ? readFileSync(file, 'utf8') : null; const old = before ? JSON.parse(before) : {};
  const names = snap.components.map((c) => c[0]).sort((x, y) => y.length - x.length); const list = changes(old, snap); const pretty = JSON.stringify(snap, null, 1) + '\n';
  const tmp = mkdtempSync(join(tmpdir(), 'fundament-export-')); let build, diff;
  try { cpSync(root, tmp, { recursive: true, filter: (p) => !/\/(\.git|evals|probe-zds|node_modules)(\/|$)/.test(p.slice(root.length - 1)) }); writeFileSync(join(tmp, rel), pretty); build = run(['build.mjs'], tmp); diff = build.ok ? run(['tooling/figma-diff.mjs'], tmp) : null; } finally { rmSync(tmp, { recursive: true, force: true }); }
  if (!build.ok) return { ok: false, applied: false, title: 'So kann der Stand nicht übernommen werden.', changes: list, blockers: fromBuild(build.err, names).slice(0, 12), todo: [] };
  const todo = diff.ok ? [] : fromDiff([...diff.out, ...diff.err], names).slice(0, 12);
  if (dry) return { ok: true, applied: false, changes: list, blockers: [], todo, title: !list.length ? 'Figma und Repo sind auf demselben Stand.' : 'Bereit zum Übernehmen.' };
  writeFileSync(file, pretty); const real = run(['build.mjs']);
  if (!real.ok) { if (before !== null) { writeFileSync(file, before); run(['build.mjs']); } return { ok: false, applied: false, title: 'Nicht übernommen: Der Build ist gescheitert. Der alte Stand ist unverändert.', changes: list, blockers: fromBuild(real.err, names).slice(0, 12), todo: [] }; }
  return { ok: true, applied: true, changes: list, blockers: [], todo, title: todo.length ? 'Übernommen. Die Entwicklung muss noch nachziehen.' : 'Übernommen. Figma und Code passen zusammen.' };
}
createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS).end(); return; }
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__snapshot') {
    if (req.method === 'GET') { res.writeHead(200, { ...CORS, 'content-type': TYPES['.json'] }).end(JSON.stringify({ ok: true, name: 'fundament' })); return; }
    // Nur das Plugin-Fenster (Herkunft „null“) oder Aufrufe ohne Herkunft (Terminal); keine fremden Webseiten
    if (req.headers.origin && req.headers.origin !== 'null') { res.writeHead(403, CORS).end(); return; }
    let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 5e6) { res.writeHead(413, CORS).end(); return; } }
    let out; try { out = takeSnapshot(body, url.searchParams.has('dry')); } catch (e) { out = { ok: false, title: 'Fehler beim Übernehmen: ' + e.message, blockers: [], todo: [], changes: [] }; }
    res.writeHead(200, { ...CORS, 'content-type': TYPES['.json'] }).end(JSON.stringify(out)); return;
  }
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (p.endsWith('/')) p += 'index.html'; if (p === '/index.html') p = '/docs/index.html';
  const file = join(root, p); if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body); } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Nicht gefunden: ' + p); }
}).listen(port, '127.0.0.1', () => console.log(`Fundament läuft auf http://localhost:${port}/  (Doku), /ui/examples/zustaende.html, /ui/examples/konto-einstellungen.html`));
