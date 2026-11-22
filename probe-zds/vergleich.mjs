// Vergleicht die Läufe unter vergleich/: nur Brief, lose ZDS-Dateien, mit System.
// Neutrale Zählung (gilt für jede Seite, egal wie sie gebaut ist) plus gerenderte Prüfung; für die Läufe mit System zusätzlich der Check gegen den Vertrag.
// Aufruf: node vergleich.mjs   → vergleich/ergebnis.json und vergleich.html
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
process.env.FUNDAMENT_ROOT = new URL('.', import.meta.url).pathname;
const { tokenize, check } = await import('../cli/fundament.mjs');
const { audit } = await import('../cli/audit.mjs');
const here = new URL('./vergleich/', import.meta.url).pathname;
const RUNS = readdirSync(here).filter((d) => existsSync(join(here, d, 'index.html'))).sort((a, b) => { const o = (r) => ['-nur-brief', '-lose-dateien', '-mit'].findIndex((s) => r.endsWith(s)); const m = (r) => r.split('-')[0]; return m(b).localeCompare(m(a)) || o(a) - o(b); });
const count = (s, re) => (s.match(re) || []).length;
const rows = [];
for (const run of RUNS) {
  const file = join(here, run, 'index.html'); const src = readFileSync(file, 'utf8'); const toks = tokenize(src);
  let css = '', js = ''; toks.forEach((t, i) => { if (!t.close && (t.tag === 'style' || t.tag === 'script') && toks[i + 1]?.close) { const body = src.slice(t.end, toks[i + 1].index); if (t.tag === 'style') css += body; else js += body; } });
  const inline = toks.filter((t) => typeof t.attrs.style === 'string').map((t) => t.attrs.style).join(';'); const own = css + ';' + inline;
  let linked = ''; for (const t of toks) if (!t.close && t.tag === 'link' && t.attrs.rel === 'stylesheet' && typeof t.attrs.href === 'string') { try { linked += readFileSync(join(dirname(file), t.attrs.href), 'utf8'); } catch {} }
  const defined = new Set([...(linked + css).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])); const used = [...new Set([...own.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))];
  const m = {
    lauf: run,
    'Zeilen eigenes CSS': css.split('\n').filter((l) => l.trim()).length,
    'Zeilen eigenes Skript': js.split('\n').filter((l) => l.trim()).length,
    'feste Farbwerte': count(own, /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(/g),
    'feste Abstände': [...own.matchAll(/(?:^|[;{\s])(?:margin|padding)(?:-[a-z-]+)?\s*:\s*([^;}]*)|(?:^|[;{\s])(?:gap|row-gap|column-gap)\s*:\s*([^;}]*)/g)].filter((x) => /(?<![\w.-])[1-9]\d*(?:\.\d+)?(?:px|rem|em)/.test(x[1] || x[2] || '')).length,
    'erfundene Tokens': used.filter((u) => !defined.has(u)).length,
    'Verläufe, Schatten, Versalien': count(own, /gradient\(|box-shadow\s*:(?!\s*none)|text-shadow\s*:(?!\s*none)|text-transform\s*:\s*uppercase/g),
    'selbst gebaute Bedienelemente': toks.filter((t) => !t.close && ['button', 'input', 'select', 'textarea'].includes(t.tag) && t.attrs.type !== 'hidden').length,
  };
  const a = await audit([file]); const by = {}; for (const f of a) by[f.id] = (by[f.id] || 0) + 1;
  m['gerendert: Kontrast'] = by['render/contrast'] || 0; m['gerendert: Klickfläche zu klein'] = by['render/target-size'] || 0; m['gerendert: ohne Namen'] = by['render/no-name'] || 0; m['gerendert: Überlauf bei 360 px'] = by['render/overflow'] || 0;
  if (by['render/not-loaded'] || by['render/error']) m['gerendert: nicht messbar'] = 1;
  if (run.endsWith('-mit')) { m['Check gegen Vertrag'] = check([file]).length; const first = join(here, run, 'index.first.html'); if (existsSync(first)) m['Check, erster Versuch'] = check([first]).length; }
  m.details = a.map((f) => f.message); rows.push(m);
}
writeFileSync(join(here, 'ergebnis.json'), JSON.stringify(rows, null, 2) + '\n');
const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => k !== 'lauf' && k !== 'details');
const label = (r) => r.replace('-nur-brief', ' / nur Brief').replace('-lose-dateien', ' / lose ZDS-Dateien').replace('-mit', ' / mit System').replace(/^./, (c) => c.toUpperCase());
const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
writeFileSync(new URL('./vergleich.html', import.meta.url), `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZDS-Probe: mit und ohne System</title>
<!-- Generiert von vergleich.mjs – nicht von Hand bearbeiten. Über http ansehen (node ../tooling/serve.mjs), damit der Hell/Dunkel-Schalter die eingebetteten Seiten erreicht. -->
<link rel="stylesheet" href="ui/tokens.css">
<style>
  body { margin: 0; padding: var(--z-ds-space-32) var(--z-ds-space-24); background: var(--z-ds-color-background-0); color: var(--z-ds-color-text-100); font: var(--z-ds-text-body-md); }
  h1 { font: var(--z-ds-text-display); margin: 0 0 var(--z-ds-space-8); } h2 { font: var(--z-ds-text-heading-lg); margin: var(--z-ds-space-32) 0 var(--z-ds-space-16); }
  p { margin: 0 0 var(--z-ds-space-16); max-width: 70ch; color: var(--z-ds-color-text-70); }
  .scroll { overflow-x: auto; } table { border-collapse: collapse; font: var(--z-ds-text-body-sm); min-width: 100%; }
  th, td { padding: var(--z-ds-space-8); border-bottom: var(--z-ds-border-width-default) solid var(--z-ds-color-border-100); text-align: right; vertical-align: top; } th:first-child, td:first-child { text-align: left; } th { font: var(--z-ds-text-label-sm); }
  td.bad { font-weight: 700; } td.ok { color: var(--z-ds-color-text-70); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: var(--z-ds-space-24); }
  figure { margin: 0; min-width: 0; } figcaption { font: var(--z-ds-text-label-md); margin-bottom: var(--z-ds-space-8); }
  iframe { width: 100%; height: 760px; border: var(--z-ds-border-width-default) solid var(--z-ds-color-border-100); border-radius: var(--z-ds-radius-4); background: var(--z-ds-color-background-0); }
  .bar { display: flex; gap: var(--z-ds-space-16); align-items: center; margin-bottom: var(--z-ds-space-16); font: var(--z-ds-text-body-sm); }
  ul { margin: var(--z-ds-space-8) 0 0; padding-left: var(--z-ds-space-16); font: var(--z-ds-text-body-sm); color: var(--z-ds-color-text-70); }
</style>
</head>
<body>
<h1>ZDS-Probe: mit und ohne System</h1>
<p>Derselbe Brief (Newsletter-Einstellungen), drei Bedingungen, zwei Modelle. „Nur Brief“: Der Agent kennt nur die Aufgabe. „Lose ZDS-Dateien“: dazu das echte CSS und die Tokens des ZDS, wie sie heute vorliegen. „Mit System“: die drei Komponenten als Elemente mit Vertrag, Check und Schleife.</p>
<h2>Zahlen</h2>
<div class="scroll"><table><thead><tr><th>Messgröße</th>${rows.map((r) => `<th>${e(label(r.lauf))}</th>`).join('')}</tr></thead><tbody>
${keys.map((k) => `<tr><td>${e(k)}</td>${rows.map((r) => `<td class="${r[k] ? 'bad' : 'ok'}">${r[k] ?? ''}</td>`).join('')}</tr>`).join('\n')}
</tbody></table></div>
<h2>Die Seiten</h2>
<div class="bar"><label><input type="checkbox" id="dark"> dunkel anzeigen</label><span>Jede Seite ist das unveränderte Ergebnis des Laufs.</span></div>
<div class="grid">
${rows.map((r) => `<figure><figcaption>${e(label(r.lauf))}</figcaption><iframe src="vergleich/${r.lauf}/index.html" title="${e(label(r.lauf))}"></iframe>${r.details.length ? `<ul>${[...new Set(r.details)].slice(0, 6).map((d) => `<li>${e(d)}</li>`).join('')}</ul>` : ''}</figure>`).join('\n')}
</div>
<script>
const set = () => { const t = document.getElementById('dark').checked ? 'dark' : 'light'; document.documentElement.dataset.theme = t; for (const f of document.querySelectorAll('iframe')) { try { const d = f.contentDocument.documentElement; d.dataset.theme = t; d.classList.remove('color-scheme-light', 'color-scheme-dark'); d.classList.add('color-scheme-' + t); } catch {} } };
document.getElementById('dark').addEventListener('change', set); for (const f of document.querySelectorAll('iframe')) f.addEventListener('load', set);
</script>
</body>
</html>
`);
console.table(rows.map(({ details, ...r }) => r));
