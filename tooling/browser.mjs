// Gemeinsame Helfer: statischer Server auf freiem Port und Headless-Chrome, der eine Seite lädt und das fertige DOM zurückgibt.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { extname } from 'node:path';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
export const chromePath = () => process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'].find(existsSync);
// Liefert Dateien unter ihrem absoluten Pfad aus (nur lokal, nur lesend) und zusätzliche Seiten aus `pages`.
export async function withServer(pages, fn) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x'); const p = decodeURIComponent(url.pathname);
    if (pages[p]) { res.writeHead(200, { 'content-type': TYPES['.html'] }).end(pages[p](url.searchParams)); return; }
    try { const body = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body); } catch { res.writeHead(404).end('Nicht gefunden'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try { return await fn(`http://127.0.0.1:${server.address().port}`); } finally { server.close(); }
}
// Lädt die Seite, wartet bis zu `budget` ms virtueller Zeit und gibt das DOM zurück. Ein zweiter Versuch fängt Starts ab, bei denen Chrome unter Last nichts liefert.
export async function dumpDom(url, { budget = 8000, tries = 2 } = {}) {
  const chrome = chromePath(); if (!chrome) throw new Error('Chrome nicht gefunden. CHROME=<Pfad> setzen.');
  let last = '';
  for (let i = 0; i < tries; i++) {
    last = await new Promise((resolve) => execFile(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', `--virtual-time-budget=${budget}`, '--dump-dom', url], { encoding: 'utf8', maxBuffer: 2e8, timeout: 60000 }, (err, stdout) => resolve(stdout || '')));
    if (/data-result="/.test(last)) return { dom: last, tries: i + 1 };
  }
  return { dom: last, tries };
}
export const resultOf = (dom) => { const m = dom.match(/data-result="([^"]*)"/); return m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')) : null; };
