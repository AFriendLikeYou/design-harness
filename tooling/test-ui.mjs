// Lädt tooling/test-ui.html in Headless-Chrome und wertet die Prüfungen aus. CHROME=<Pfad> überschreibt den Standardpfad.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const chrome = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'].find(existsSync);
if (!chrome) { console.error('Chrome nicht gefunden. CHROME=<Pfad> setzen.'); process.exit(2); }
const url = new URL('./test-ui.html', import.meta.url).href;
const dom = execFileSync(chrome, ['--headless=new', '--no-sandbox', '--allow-file-access-from-files', '--virtual-time-budget=4000', '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1e8 });
const m = dom.match(/data-result="([^"]*)"/);
if (!m) { console.error('Kein Ergebnis: Die Testseite ist nicht durchgelaufen.'); process.exit(1); }
const { r } = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
const failed = Object.entries(r).filter(([, v]) => !v).map(([k]) => k);
console.log(`${Object.keys(r).length - failed.length} von ${Object.keys(r).length} Prüfungen bestanden.`);
for (const f of failed) console.log('  durchgefallen: ' + f);
process.exit(failed.length ? 1 : 0);
