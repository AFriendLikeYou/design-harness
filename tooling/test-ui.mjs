// Lädt tooling/test-ui.html über einen lokalen Server in Headless-Chrome und wertet die Prüfungen aus.
import { withServer, dumpDom, resultOf } from './browser.mjs';
const file = new URL('./test-ui.html', import.meta.url).pathname;
const { dom, tries } = await withServer({}, (base) => dumpDom(base + file));
const res = resultOf(dom);
if (!res) { console.error('Kein Ergebnis: Die Testseite ist nicht durchgelaufen.'); process.exit(1); }
const failed = Object.entries(res.r).filter(([, v]) => !v).map(([k]) => k);
console.log(`${Object.keys(res.r).length - failed.length} von ${Object.keys(res.r).length} Prüfungen bestanden.${tries > 1 ? ' (zweiter Anlauf nötig)' : ''}`);
for (const f of failed) console.log('  durchgefallen: ' + f);
process.exit(failed.length ? 1 : 0);
