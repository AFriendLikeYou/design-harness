// Zählt die Befunde des Checks je Lauf und Aufgabe: ohne Harness, mit Harness (erster Versuch) und mit Harness (Abgabe).
import { check } from '../cli/fundament.mjs';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
const out = new URL('./out/', import.meta.url).pathname; const rows = []; const ids = {};
for (const run of readdirSync(out).sort()) for (const f of readdirSync(out + run).filter((x) => x.endsWith('.html')).sort()) {
  const fs = check([`${out}${run}/${f}`]); rows.push({ run, file: f, n: fs.length, ids: [...new Set(fs.map((x) => x.id))] });
  for (const x of fs) { ids[run] ??= {}; ids[run][x.id] = (ids[run][x.id] || 0) + 1; }
}
const runs = [...new Set(rows.map((r) => r.run))];
const sum = (run, pred) => rows.filter((r) => r.run === run && pred(r.file)).reduce((a, r) => a + r.n, 0);
const count = (run, pred) => rows.filter((r) => r.run === run && pred(r.file)).length;
const clean = (run, pred) => rows.filter((r) => r.run === run && pred(r.file) && r.n === 0).length;
const isFirst = (f) => f.includes('.first.'); const isFinal = (f) => !f.includes('.first.');
const table = runs.map((run) => run.endsWith('-mit')
  ? { lauf: run, seiten: count(run, isFinal), 'Befunde erster Versuch': sum(run, isFirst), 'sauber im ersten Versuch': `${clean(run, isFirst)}/${count(run, isFirst)}`, 'Befunde Abgabe': sum(run, isFinal), 'sauber bei Abgabe': `${clean(run, isFinal)}/${count(run, isFinal)}` }
  : { lauf: run, seiten: count(run, isFinal), 'Befunde erster Versuch': '', 'sauber im ersten Versuch': '', 'Befunde Abgabe': sum(run, isFinal), 'sauber bei Abgabe': `${clean(run, isFinal)}/${count(run, isFinal)}` });
console.table(table);
for (const run of runs) console.log(run, JSON.stringify(Object.fromEntries(Object.entries(ids[run] || {}).sort((a, b) => b[1] - a[1]))));
writeFileSync(new URL('./ergebnis.json', import.meta.url), JSON.stringify({ table, perFile: rows, ids }, null, 2) + '\n');
