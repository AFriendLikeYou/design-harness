// Kleiner statischer Server für Doku und Beispiele. ES-Module laden im Browser nicht von file://, deshalb braucht es http.
// Nimmt außerdem den Export aus dem Figma-Plugin entgegen (POST /__snapshot): legt ihn als specs/figma.snapshot.json ab, baut und gleicht ab.
// Scheitert der Build, bleibt der alte Stand erhalten. Der Server hört nur auf dem eigenen Rechner (127.0.0.1).
// Aufruf: node tooling/serve.mjs [Port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
const root = new URL('..', import.meta.url).pathname; const port = Number(process.argv[2]) || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-allow-private-network': 'true' };
const run = (args) => { const r = spawnSync('node', args, { cwd: root, encoding: 'utf8' }); return { ok: r.status === 0, lines: (r.stdout + r.stderr).trim().split('\n').filter(Boolean) }; };
// Übernimmt einen Export: prüfen, ablegen, bauen, abgleichen. Antwort sagt in Klartext, was passiert ist.
function takeSnapshot(text) {
  let snap; try { snap = JSON.parse(text); } catch { return { ok: false, title: 'Der Export ist kein gültiges JSON.', lines: [] }; }
  for (const k of ['variables', 'textStyles', 'components', 'styles']) if (!Array.isArray(snap[k])) return { ok: false, title: 'Dem Export fehlt „' + k + '“.', lines: ['Plugin „Fundament Export“ neu starten und noch einmal senden.'] };
  const file = join(root, 'specs/figma.snapshot.json'); const before = existsSync(file) ? readFileSync(file, 'utf8') : null; const old = before ? JSON.parse(before) : { variables: [], components: [], styles: [] };
  const key = (list, n) => new Map(list.map((x) => [x.slice(0, n).join(' / '), JSON.stringify(x)])); const count = (a, b, n) => { const A = key(a, n), B = key(b, n); let changed = 0, added = 0, removed = 0; for (const [k, v] of B) if (!A.has(k)) added++; else if (A.get(k) !== v) changed++; for (const k of A.keys()) if (!B.has(k)) removed++; return { changed, added, removed }; };
  const diff = { Variablen: count(old.variables, snap.variables, 2), Komponenten: count(old.components, snap.components, 1), Varianten: count(old.styles, snap.styles, 2) };
  const summary = Object.entries(diff).filter(([, d]) => d.changed + d.added + d.removed).map(([n, d]) => n + ': ' + [d.changed && d.changed + ' geändert', d.added && d.added + ' neu', d.removed && d.removed + ' entfernt'].filter(Boolean).join(', '));
  writeFileSync(file, JSON.stringify(snap, null, 1) + '\n');
  const build = run(['build.mjs']);
  if (!build.ok) { if (before !== null) writeFileSync(file, before); return { ok: false, title: 'Nicht übernommen: Der Build ist gescheitert. Der alte Stand ist unverändert.', lines: build.lines.slice(-12) }; }
  const abgleich = run(['tooling/figma-diff.mjs']);
  return { ok: true, clean: abgleich.ok, title: summary.length ? 'Übernommen.' : 'Übernommen. Gegenüber dem letzten Stand hat sich nichts geändert.', lines: [...summary, ...(abgleich.ok ? ['Figma und Code passen zusammen.'] : ['Im Code ist noch etwas nachzuziehen:', ...abgleich.lines.slice(-14)])] };
}
createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS).end(); return; }
  if (req.url === '/__snapshot') {
    if (req.method === 'GET') { res.writeHead(200, { ...CORS, 'content-type': TYPES['.json'] }).end(JSON.stringify({ ok: true, name: 'fundament' })); return; }
    // Nur das Plugin-Fenster (Herkunft „null“) oder Aufrufe ohne Herkunft (Terminal); keine fremden Webseiten
    if (req.headers.origin && req.headers.origin !== 'null') { res.writeHead(403, CORS).end(); return; }
    let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 5e6) { res.writeHead(413, CORS).end(); return; } }
    let out; try { out = takeSnapshot(body); } catch (e) { out = { ok: false, title: 'Fehler beim Übernehmen: ' + e.message, lines: [] }; }
    res.writeHead(200, { ...CORS, 'content-type': TYPES['.json'] }).end(JSON.stringify(out)); return;
  }
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (p.endsWith('/')) p += 'index.html'; if (p === '/index.html') p = '/docs/index.html';
  const file = join(root, p); if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body); } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Nicht gefunden: ' + p); }
}).listen(port, '127.0.0.1', () => console.log(`Fundament läuft auf http://localhost:${port}/  (Doku), /ui/examples/zustaende.html, /ui/examples/konto-einstellungen.html`));
