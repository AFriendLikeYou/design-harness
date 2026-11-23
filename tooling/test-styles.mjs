// Prüft im Browser, ob jede Variante der Web Components die Farben trägt, die in Figma an dieser Variante hängen.
// Der Figma-Schnappschuss ist der Vertrag fürs Aussehen; der Code wird direkt daran gemessen.
// Geprüft werden Fläche, Text, Rahmen und Fokusring, in hell und dunkel. Varianten kommen aus specs/figma.snapshot.json.
import { readFileSync } from 'node:fs';
import { withServer, dumpDom, resultOf } from './browser.mjs';
import { loadSpec } from './assemble.mjs';
const ri = process.argv.indexOf('--root'); // --root <Ordner>: anderes System messen (z. B. probe-zds)
const root = ri > 0 ? new URL(process.argv[ri + 1].replace(/\/?$/, '/'), `file://${process.cwd()}/`).pathname : new URL('..', import.meta.url).pathname;
const spec = await loadSpec(root); const snap = JSON.parse(readFileSync(root + 'specs/figma.snapshot.json', 'utf8'));
const P = spec.cssPrefix; const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const cases = (snap.styles || []).map(([comp, variant]) => { const c = spec.components.find((x) => x.name === comp); if (!c) return null;
  const props = Object.fromEntries((variant || '').split(', ').filter(Boolean).map((kv) => kv.split('=')));
  const attrs = Object.entries(props).map(([k, v]) => v === 'true' ? ` ${kebab(k)}` : v === 'false' ? '' : ` ${kebab(k)}="${v}"`).join('') + (c.props.some((p) => p.name === 'label') ? ' label="Text"' : '') + (c.props.some((p) => p.name === 'title') ? ' title="Titel"' : '') + (comp === 'Link' ? ' href="#"' : '') + (c.props.some((p) => p.name === 'showHelper') ? ' show-helper helper-text="Hilfe"' : '') + (props.state === 'error' ? ' error-text="Fehler"' : '');
  const want = c.looks[variant || 'default'] || {}; return { comp, variant, tag: `${P}-${kebab(comp)}`, html: `<${P}-${kebab(comp)}${attrs}></${P}-${kebab(comp)}>`, want: { bg: want.bg || null, fg: want.fg || null, border: want.border || null, ring: want.ring || null } }; }).filter(Boolean);
const PAGE = () => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>styles</title><link rel="stylesheet" href="${root}ui/tokens.css"><link rel="stylesheet" href="${root}ui/components.css"><style>*,*::before,*::after{transition:none!important;animation:none!important}</style></head><body>
<div id="stage">${cases.map((c, i) => `<div data-i="${i}">${c.html}</div>`).join('')}</div>
<script type="module">
await import('${root}ui/fundament.js'); await new Promise((r) => setTimeout(r, 100));
const cases = ${JSON.stringify(cases.map(({ comp, variant, tag, want }) => ({ comp, variant, tag, want })))}; const P = ${JSON.stringify(P)}; const out = [];
const probe = document.createElement('span'); document.body.append(probe);
const token = (name) => { probe.style.color = 'var(--' + P + '-color-' + name.replace(/\\//g, '-') + ')'; return getComputedStyle(probe).color; };
const clear = (c) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
for (const theme of ['light', 'dark']) { document.documentElement.dataset.theme = theme; await new Promise((r) => setTimeout(r, 50));
  cases.forEach((c, i) => { const host = document.querySelector('[data-i="' + i + '"] > *'); const q = (...s) => { for (const x of s) { const n = host.querySelector(x); if (n) return n; } return null; };
    const surface = q('.' + c.tag + '__control', '.' + c.tag + '__box', '.' + c.tag + '__track', '.' + c.tag); const text = q('.' + c.tag + '__input', '.' + c.tag + '__label', '.' + c.tag + '__title') || surface;
    if (!surface) { out.push([c.comp, c.variant, theme, 'Element', 'nicht gerendert', '']); return; }
    const cs = getComputedStyle(surface); const got = { bg: clear(cs.backgroundColor) ? null : cs.backgroundColor, fg: getComputedStyle(text).color,
      border: ['Top', 'Left'].map((s) => parseFloat(cs['border' + s + 'Width']) > 0 && !clear(cs['border' + s + 'Color']) ? cs['border' + s + 'Color'] : null).find(Boolean) || null,
      ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineColor : null };
    for (const role of ['bg', 'fg', 'border', 'ring']) { const want = c.want[role] ? token(c.want[role]) : null; if (role === 'fg' && !c.want.fg) continue; if (got[role] !== want) out.push([c.comp, c.variant, theme, role, got[role] || '(nichts)', (c.want[role] || '(nichts)') + (want ? ' = ' + want : '')]); } }); }
document.body.setAttribute('data-result', JSON.stringify({ out, n: cases.length }));
</script></body></html>`;
const { dom } = await withServer({ '/__styles': PAGE }, (base) => dumpDom(base + '/__styles', { budget: 10000 }));
const res = resultOf(dom);
if (!res) { console.error('Kein Ergebnis: Die Seite ist nicht durchgelaufen.'); process.exit(1); }
for (const [comp, variant, theme, role, got, want] of res.out) console.log(`${comp}${variant ? ' [' + variant + ']' : ''} / ${role} (${theme})\n    Code: ${got}\n    Figma: ${want}`);
console.log(res.out.length ? `\n${res.out.length} Abweichungen zwischen Code und Figma.` : `Code und Figma stimmen überein: ${res.n} Varianten, je Fläche, Text, Rahmen und Fokusring, hell und dunkel.`);
process.exit(res.out.length ? 1 : 0);
