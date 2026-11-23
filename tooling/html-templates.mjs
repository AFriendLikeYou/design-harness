// Erzeugt die HTML-und-CSS-Fassung jeder Komponente: das Markup, das die Web Component selbst rendert,
// ohne eigene Elemente (verschachtelte <fd-…> werden aufgelöst). Niemand pflegt diese Fassung von Hand.
// Danach der Beweis: Beide Fassungen werden nebeneinander gerendert und Stück für Stück gemessen
// (Größe, Farben, Rahmen, Schrift). Weicht etwas ab, endet der Lauf mit Fehler.
// Ergebnis: generated/html.json (für Doku und Check) und generated/html/<name>.html (zum Kopieren).
//   node tooling/html-templates.mjs [--root <Ordner>]
import { writeFileSync, mkdirSync } from 'node:fs';
import { withServer, dumpDom, resultOf } from './browser.mjs';
import { loadSpec, kebab } from './assemble.mjs';
const ri = process.argv.indexOf('--root');
const root = ri > 0 ? new URL(process.argv[ri + 1].replace(/\/?$/, '/'), `file://${process.cwd()}/`).pathname : new URL('..', import.meta.url).pathname;
const spec = await loadSpec(root); const P = spec.cssPrefix;
const isBool = (p) => p.values && p.values.join() === 'false,true';
const cases = spec.components.filter((c) => c.status !== 'deprecated').map((c) => { const tag = `${P}-${kebab(c.name)}`;
  const attrs = c.props.filter((p) => !['instance', 'behavior', 'boolean'].includes(p.type) && !isBool(p)).map((p) => ` ${kebab(p.name)}="${String(p.default).replace(/"/g, '&quot;')}"`).join('') + ((c.impl || c.name) === 'Link' ? ' href="#"' : '');
  return { name: c.name, html: `<${tag}${attrs}></${tag}>` }; });
const PAGE = () => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>html</title>
<link rel="stylesheet" href="${root}ui/tokens.css"><link rel="stylesheet" href="${root}ui/components.css">
<style>.w { width: 420px; margin: 8px; } * { transition: none !important; }</style></head><body>
${cases.map((c, i) => `<div class="w" data-i="${i}">${c.html}</div><div class="w" data-p="${i}"></div>`).join('\n')}
<script type="module">
await import('${root}ui/fundament.js'); await new Promise((r) => setTimeout(r, 200));
const P = '${P}';
// Eigene Elemente auflösen: Inhalt bleibt, Klassen der Hülle wandern auf das erste Kind
const plain = (host) => { const doc = new DOMParser().parseFromString('<div id="r">' + host.innerHTML + '</div>', 'text/html'); const r = doc.getElementById('r'); let n;
  while ((n = [...r.querySelectorAll('*')].find((x) => x.localName.startsWith(P + '-')))) { const first = n.firstElementChild; if (first) for (const c of n.classList) first.classList.add(c); n.replaceWith(...n.childNodes); }
  return r.innerHTML; };
const own = (el) => [...el.querySelectorAll('[class]')].filter((x) => !x.localName.startsWith(P + '-') && [...x.classList].some((c) => c.startsWith(P + '-')));
const look = (x) => { const s = getComputedStyle(x); const b = x.getBoundingClientRect(); return { size: Math.round(b.width) + ' × ' + Math.round(b.height), color: s.color, background: s.backgroundColor, border: s.borderTopWidth + ' ' + s.borderTopColor, radius: s.borderTopLeftRadius, font: s.font }; };
const out = []; const diffs = [];
document.querySelectorAll('[data-i]').forEach((d) => { const i = d.dataset.i; const html = plain(d.firstElementChild); out.push(html);
  const p = document.querySelector('[data-p="' + i + '"]'); p.innerHTML = html;
  const a = own(d), b = own(p); if (a.length !== b.length) { diffs.push({ i: +i, part: '(Aufbau)', key: 'Anzahl Teile', wc: a.length, html: b.length }); return; }
  a.forEach((x, k) => { const la = look(x), lb = look(b[k]); for (const key of Object.keys(la)) if (la[key] !== lb[key]) diffs.push({ i: +i, part: [...x.classList].find((c) => c.startsWith(P + '-')), key, wc: la[key], html: lb[key] }); }); });
document.body.setAttribute('data-result', JSON.stringify({ out, diffs }));
</script></body></html>`;
const { dom } = await withServer({ '/__html': PAGE }, (base) => dumpDom(base + '/__html'));
const res = resultOf(dom); if (!res) { console.error('Kein Ergebnis: Die Seite ist nicht durchgelaufen.'); process.exit(1); }
// Einrücken und die laufenden IDs der Komponente durch sprechende Platzhalter ersetzen
const VOID = new Set(['input', 'br', 'img', 'hr']);
const pretty = (html, name) => { const ids = {}; let k = 0; html = html.replace(new RegExp(`${P}-\\d+(-[a-z])?`, 'g'), (m, suf = '') => (ids[m.replace(suf, '')] ??= `${kebab(name)}-${++k}`) + suf);
  const out = []; let depth = 0; for (const tok of html.replace(/>\s+</g, '><').split(/(?=<)|(?<=>)/).filter((t) => t.trim())) { if (tok.startsWith('</')) depth = Math.max(0, depth - 1); out.push('  '.repeat(depth) + tok.trim()); if (tok.startsWith('<') && !tok.startsWith('</') && !tok.endsWith('/>') && !VOID.has(tok.slice(1).split(/[\s>]/)[0])) depth++; }
  return out.join('\n').replace(/>\n\s*([^<\n]+)\n\s*<\//g, '>$1</').replace(/<(\w+)([^>]*)>\n\s*<\/\1>/g, '<$1$2></$1>'); };
const map = {}; mkdirSync(root + 'generated/html', { recursive: true });
cases.forEach((c, i) => { const html = pretty(res.out[i].replace(/ hidden=""/g, ' hidden'), c.name); map[c.name] = html; writeFileSync(`${root}generated/html/${kebab(c.name)}.html`, `<!-- ${c.name} als HTML und CSS. Erzeugt aus der Web Component (tooling/html-templates.mjs) – nicht von Hand bearbeiten.\n     Varianten und Zustände: die data-Attribute am Element mit der Klasse der Komponente. Verhalten und ARIA-Zustände setzt man hier selbst. -->\n${html}\n`); });
writeFileSync(root + 'generated/html.json', JSON.stringify(map, null, 2) + '\n');
for (const d of res.diffs) console.log(`${cases[d.i].name} / ${d.part}: ${d.key} – Web Component ${d.wc}, HTML ${d.html}`);
console.log(res.diffs.length ? `\nHTML-Fassung weicht an ${res.diffs.length} Stellen von den Web Components ab.` : `HTML-Fassung erzeugt und gemessen: ${cases.length} Komponenten, sieht aus wie die Web Components.`);
process.exit(res.diffs.length ? 1 : 0);
