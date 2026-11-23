// Prüft die CLI an einer Datei mit eingebauten Fehlern: Jede hier genannte Regel muss anschlagen, die sauberen Dateien dürfen keinen Befund haben.
import { check, lint, migrate, tokenize, IMPLEMENTED, emittedId } from '../cli/fundament.mjs';
import { readFileSync } from 'node:fs';
const here = (p) => new URL(p, import.meta.url).pathname;
const { loadSpec } = await import('./assemble.mjs'); const spec = await loadSpec(here('..'));
// Erwartet wird, was aus den Regeln mit check folgt (Befund-ID je Regel), dazu die allgemeinen IDs, die keiner einzelnen Regel gehören
const GENERIC = ['tokens/no-raw-color', 'tokens/unknown', 'props/invalid-value', 'props/unknown', 'props/required', 'slots/unknown-child', 'components/deprecated', 'components/unknown', 'components/internal-class'];
const withCheck = [...spec.components.flatMap((c) => c.rules), ...spec.principles].filter((r) => r.check);
const EXPECT = [...new Set([...GENERIC, ...withCheck.map((r) => emittedId(r))])];
const found = new Set(check([here('./fixtures/fehler.html')]).map((f) => f.id));
const fails = [];
for (const id of EXPECT) if (!found.has(id)) fails.push(`Regel ${id} schlägt in fixtures/fehler.html nicht an`);
// HTML-Fassung: dieselben Regeln am Klassen-Markup
const EXPECT_HTML = ['components/unknown', 'props/invalid-value', 'principles/system-controls', 'principles/action-says-what', 'button/one-primary', 'link/has-target', 'link/names-destination', 'badge/short-label', 'textfield/visible-label', 'card/no-nesting', 'alert/one-per-area', 'tokens/no-raw-color'];
const foundHtml = new Set(check([here('./fixtures/fehler-html.html')]).map((f) => f.id));
for (const id of EXPECT_HTML) if (!foundHtml.has(id)) fails.push(`Regel ${id} schlägt in fixtures/fehler-html.html nicht an`);
const clean = check([here('../ui/components.css'), here('../ui/examples/konto-einstellungen.html'), here('../ui/examples/zustaende.html'), here('../ui/examples/nur-html.html'), here('../docs/index.html')]);
if (clean.length) fails.push(`${clean.length} Befunde in den eigenen Dateien: ${clean.map((f) => f.id).join(', ')}`);
const l = lint(spec); if (l.length) fails.push(`lint: ${l.map((f) => f.message).join(' | ')}`);
// Parser: schwieriges Markup
const tk = tokenize(`<!-- <fd-button label="im Kommentar"> --><!doctype html><FD-Button\n  variant = 'ghost' label="a > b" disabled data-x=1 /><script>if (a < b) { x = "<fd-chip>"; }</script><fd-text-field label={name} value="{x}"></fd-text-field><p>1 < 2</p>`);
const open = tk.filter((x) => !x.close);
if (open.length !== 4 || open[0].tag !== 'fd-button' || open[0].attrs.variant !== 'ghost' || open[0].attrs.label !== 'a > b' || open[0].attrs.disabled !== true || open[0].attrs['data-x'] !== '1' || !open[0].selfClosing || open[1].tag !== 'script' || open[2].attrs.label !== '{name}' || open[3].tag !== 'p') fails.push('Parser liest schwieriges Markup falsch: ' + JSON.stringify(open.map((x) => [x.tag, x.attrs])));
const promised = withCheck.map((r) => r.check);
for (const c of promised) if (!IMPLEMENTED.includes(c)) fails.push(`Check ${c} ist versprochen, aber nicht umgesetzt`);
if (migrate([here('./fixtures/fehler.html')], false).length !== 1) fails.push('migrate findet die veraltete Komponente nicht');
console.log(fails.length ? fails.join('\n') : `CLI-Test bestanden: ${EXPECT.length} Regeln schlagen an, eigene Dateien sauber, ${new Set(promised).size} versprochene Checks umgesetzt.`);
process.exit(fails.length ? 1 : 0);
