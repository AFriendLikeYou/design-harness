// Prüft die CLI an einer Datei mit eingebauten Fehlern: Jede hier genannte Regel muss anschlagen, die sauberen Dateien dürfen keinen Befund haben.
import { check, lint, migrate, IMPLEMENTED } from '../cli/fundament.mjs';
import { readFileSync } from 'node:fs';
const here = (p) => new URL(p, import.meta.url).pathname;
const EXPECT = ['tokens/no-raw-color', 'tokens/unknown', 'principles/spacing-from-scale', 'principles/surface-and-line', 'principles/sentence-case', 'principles/action-says-what', 'principles/system-controls', 'props/invalid-value', 'props/unknown', 'props/required', 'alert/one-per-area', 'card/no-nesting', 'card/one-action', 'slots/unknown-child', 'button/one-primary', 'components/deprecated', 'components/unknown', 'components/internal-class', 'badge/short-label', 'textfield/visible-label', 'textfield/error-text', 'textfield/trailing-slot', 'switch/disabled-reason'];
const found = new Set(check([here('./fixtures/fehler.html')]).map((f) => f.id));
const fails = [];
for (const id of EXPECT) if (!found.has(id)) fails.push(`Regel ${id} schlägt in fixtures/fehler.html nicht an`);
const clean = check([here('../ui/components.css'), here('../ui/examples/konto-einstellungen.html'), here('../ui/examples/zustaende.html'), here('../docs/index.html')]);
if (clean.length) fails.push(`${clean.length} Befunde in den eigenen Dateien: ${clean.map((f) => f.id).join(', ')}`);
const l = lint(); if (l.length) fails.push(`lint: ${l.map((f) => f.message).join(' | ')}`);
const spec = JSON.parse(readFileSync(here('../specs/system.json'), 'utf8'));
const promised = [...spec.components.flatMap((c) => c.rules), ...spec.principles].filter((r) => r.check).map((r) => r.check);
for (const c of promised) if (!IMPLEMENTED.includes(c)) fails.push(`Check ${c} ist versprochen, aber nicht umgesetzt`);
if (migrate([here('./fixtures/fehler.html')], false).length !== 1) fails.push('migrate findet die veraltete Komponente nicht');
console.log(fails.length ? fails.join('\n') : `CLI-Test bestanden: ${EXPECT.length} Regeln schlagen an, eigene Dateien sauber, ${new Set(promised).size} versprochene Checks umgesetzt.`);
process.exit(fails.length ? 1 : 0);
