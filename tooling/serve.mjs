// Kleiner statischer Server für Doku und Beispiele. ES-Module laden im Browser nicht von file://, deshalb braucht es http.
// Aufruf: node tooling/serve.mjs [Port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = new URL('..', import.meta.url).pathname; const port = Number(process.argv[2]) || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (p.endsWith('/')) p += 'index.html'; if (p === '/index.html') p = '/docs/index.html';
  const file = join(root, p); if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body); } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Nicht gefunden: ' + p); }
}).listen(port, '127.0.0.1', () => console.log(`Fundament läuft auf http://localhost:${port}/  (Doku), /ui/examples/zustaende.html, /ui/examples/konto-einstellungen.html`));
