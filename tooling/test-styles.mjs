// Prüft im Browser, ob jede Variante der Web Components die Farben trägt, die in Figma an dieser Variante hängen.
// Der Figma-Schnappschuss ist der Vertrag fürs Aussehen; der Code wird direkt daran gemessen.
// Geprüft werden alle Rollen, die der Export liefert: Fläche (bg), Text (fg), Fließtext (body), Hilfstext (helper), Rahmen (border), Haken (mark), Schieber (thumb), Fokusring (ring) und die Breiten (borderWidth, ringWidth als Token der Gruppe border-width), in hell und dunkel. Varianten kommen aus specs/figma.snapshot.json.
import { readFileSync } from 'node:fs';
import { withServer, dumpDom, resultOf } from './browser.mjs';
import { loadSpec } from './assemble.mjs';
const ri = process.argv.indexOf('--root'); // --root <Ordner>: anderes System messen (z. B. probe-zds)
const root = ri > 0 ? new URL(process.argv[ri + 1].replace(/\/?$/, '/'), `file://${process.cwd()}/`).pathname : new URL('..', import.meta.url).pathname;
let spec, snap; try { spec = await loadSpec(root); snap = JSON.parse(readFileSync(root + 'specs/figma.snapshot.json', 'utf8')); } catch (e) { console.error('Fehler: ' + e.message); process.exit(2); }
const P = spec.cssPrefix; const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const cases = (snap.styles || []).map(([comp, variant, , dims]) => { const c = spec.components.find((x) => x.name === comp); if (!c) return null;
  const props = Object.fromEntries((variant || '').split(', ').filter(Boolean).map((kv) => kv.split('=')));
  const attrs = Object.entries(props).map(([k, v]) => v === 'true' ? ` ${kebab(k)}` : v === 'false' ? '' : ` ${kebab(k)}="${v}"`).join('') + (c.props.some((p) => p.name === 'label') ? ' label="Text"' : '') + (c.props.some((p) => p.name === 'title') ? ' title="Titel"' : '') + (comp === 'Link' ? ' href="#"' : '') + (c.props.some((p) => p.name === 'showHelper') ? ' show-helper helper-text="Hilfe"' : '') + (c.props.some((p) => p.name === 'description') ? ' description="Beschreibung"' : '') + (c.props.some((p) => p.name === 'body') ? ' body="Text"' : '') + (props.state === 'error' ? ' error-text="Fehler"' : '');
  const want = c.looks[variant || 'default'] || {}; return { comp, variant, tag: `${P}-${kebab(comp)}`, html: `<${P}-${kebab(comp)}${attrs}></${P}-${kebab(comp)}>`, want: { ...want }, dims: Object.fromEntries(Object.entries(dims || {}).filter(([k]) => !(c.unmeasured || {})[k])) }; }).filter(Boolean);
const exceptions = spec.components.flatMap((c) => Object.entries(c.unmeasured || {}).map(([k, why]) => `${c.name} / ${k}: ${why}`));
if (!cases.length) { console.error('Keine Varianten zu messen: specs/figma.snapshot.json hat kein Aussehen (styles) zu den Komponenten im Code. Neu exportieren.'); process.exit(1); }
const PAGE = () => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>styles</title><link rel="stylesheet" href="${root}ui/tokens.css"><link rel="stylesheet" href="${root}ui/components.css"><style>*,*::before,*::after{transition:none!important;animation:none!important}</style></head><body>
<div id="stage">${cases.map((c, i) => `<div data-i="${i}">${c.html}</div>`).join('')}</div>
<script type="module">
await import('${root}ui/fundament.js'); await new Promise((r) => setTimeout(r, 100));
const cases = ${JSON.stringify(cases.map(({ comp, variant, tag, want, dims }) => ({ comp, variant, tag, want, dims })))}; const P = ${JSON.stringify(P)}; const out = [];
const probe = document.createElement('span'); document.body.append(probe);
const token = (name) => { probe.style.color = 'var(--' + P + '-color-' + name.replace(/\\//g, '-') + ')'; return getComputedStyle(probe).color; };
const width = (name) => { probe.style.cssText = 'border:solid;border-width:var(--' + P + '-border-width-' + name + ')'; const w = getComputedStyle(probe).borderTopWidth; probe.style.cssText = ''; return w; };
// Maße: Länge eines Tokens (space/lg, radius/md …) und die Schrift eines Textstils, jeweils vom Browser aufgelöst
const len = (name) => { probe.style.cssText = 'position:absolute;width:var(--' + P + '-' + name.replace(/\\//g, '-') + ')'; const w = getComputedStyle(probe).width; probe.style.cssText = ''; return w; };
const font = (name) => { probe.style.cssText = 'font:var(--' + P + '-text-' + name.replace(/\\//g, '-') + ')'; const s = getComputedStyle(probe); const f = s.fontSize + ' / ' + s.lineHeight + ' / ' + s.fontWeight; probe.style.cssText = ''; return f; };
const DIM = { radius: 'Radius', padX: 'Innenabstand seitlich', padY: 'Innenabstand oben', gap: 'Lücke', textStyle: 'Textstil' }; let measured = 0;
const clear = (c) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
for (const theme of ['light', 'dark']) { document.documentElement.dataset.theme = theme; await new Promise((r) => setTimeout(r, 50));
  cases.forEach((c, i) => { const host = document.querySelector('[data-i="' + i + '"] > *'); const q = (...s) => { for (const x of s) { const n = host.querySelector(x); if (n) return n; } return null; };
    const surface = q('.' + c.tag + '__control', '.' + c.tag + '__box', '.' + c.tag + '__track', '.' + c.tag); const text = q('.' + c.tag + '__input', '.' + c.tag + '__label', '.' + c.tag + '__title') || surface;
    if (!surface) { out.push([c.comp, c.variant, theme, 'Element', 'nicht gerendert', '']); return; }
    const isErr = (c.variant || '').includes('state=error'); const mark = c.want.mark ? getComputedStyle(surface, '::after') : null;
    const textOf = (el) => (el ? getComputedStyle(el).color : null); const cs = getComputedStyle(surface);
    const sideOf = ['Top', 'Left'].find((s) => parseFloat(cs['border' + s + 'Width']) > 0 && !clear(cs['border' + s + 'Color'])); const got = { bg: clear(cs.backgroundColor) ? null : cs.backgroundColor, fg: getComputedStyle(text).color,
      border: ['Top', 'Left'].map((s) => parseFloat(cs['border' + s + 'Width']) > 0 && !clear(cs['border' + s + 'Color']) ? cs['border' + s + 'Color'] : null).find(Boolean) || null,
      ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineColor : null,
      body: textOf(q('.' + c.tag + '__description', '.' + c.tag + '__body')), helper: textOf(isErr ? q('.' + c.tag + '__error-text', '.' + c.tag + '__helper-text') : q('.' + c.tag + '__helper-text', '.' + c.tag + '__error-text')),
      mark: mark && mark.content !== 'none' ? (parseFloat(mark.borderBottomWidth) > 0 ? mark.borderBottomColor : mark.backgroundColor) : null, thumb: (() => { const t = q('.' + c.tag + '__thumb'); return t ? getComputedStyle(t).backgroundColor : null; })(),
      borderWidth: sideOf ? cs['border' + sideOf + 'Width'] : null, ringWidth: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineWidth : null };
    // Fläche, Rahmen und Ring: Fehlt die Rolle in Figma, darf der Code sie auch nicht tragen. Die übrigen Rollen werden gemessen, wenn Figma sie liefert.
    for (const role of ['bg', 'fg', 'body', 'helper', 'border', 'mark', 'thumb', 'ring', 'borderWidth', 'ringWidth']) { const isW = /Width$/.test(role); const t = c.want[role]; const always = ['bg', 'border', 'ring'].includes(role); if (!t && !always) continue;
      const want = t ? (isW ? width(t) : token(t)) : null; if (got[role] !== want) out.push([c.comp, c.variant, theme, role, got[role] || '(nichts)', (t || '(nichts)') + (want ? ' = ' + want : '')]); }
    // Maße hängen nicht am Mode: einmal messen
    if (theme === 'light') { const ts = getComputedStyle(text); const gotDim = { radius: cs.borderTopLeftRadius, padX: cs.paddingLeft, padY: (parseFloat(cs.paddingTop) + (text !== surface && surface.contains(text) ? parseFloat(ts.paddingTop) : 0)) + 'px', gap: cs.columnGap !== 'normal' ? cs.columnGap : cs.rowGap, textStyle: ts.fontSize + ' / ' + ts.lineHeight + ' / ' + ts.fontWeight };
      for (const [k, t] of Object.entries(c.dims || {})) { measured++; const want = k === 'textStyle' ? font(t) : len(t); if (gotDim[k] !== want) out.push([c.comp, c.variant, 'Maß', DIM[k] || k, gotDim[k], t + ' = ' + want]); } } }); }
document.body.setAttribute('data-result', JSON.stringify({ out, n: cases.length, measured }));
</script></body></html>`;
const { dom } = await withServer({ '/__styles': PAGE }, (base) => dumpDom(base + '/__styles', { budget: 10000 }));
const res = resultOf(dom);
if (!res) { console.error('Kein Ergebnis: Die Seite ist nicht durchgelaufen.'); process.exit(1); }
for (const [comp, variant, theme, role, got, want] of res.out) console.log(`${comp}${variant ? ' [' + variant + ']' : ''} / ${role} (${theme})\n    Code: ${got}\n    Figma: ${want}`);
console.log(res.out.length ? `\n${res.out.length} Abweichungen zwischen Code und Figma.` : `Code und Figma stimmen überein: ${res.n} Varianten, alle exportierten Rollen (Fläche, Text, Fließtext, Hilfstext, Rahmen, Haken, Schieber, Fokusring, Breiten), hell und dunkel. ${res.measured ? res.measured + ' Maße (Radius, Innenabstand, Lücke, Textstil) geprüft.' + (exceptions.length ? ' Bewusst nicht gemessen: ' + exceptions.join(' | ') : '') : 'Maße: im Figma-Stand noch nicht enthalten (neu exportieren).'}`);
process.exit(res.out.length ? 1 : 0);
