// Prüfung im gerenderten Zustand: lädt jede Seite in Headless-Chrome, in 360 und 1280 px Breite, hell und dunkel.
// Misst, was der statische Check nicht sehen kann: Überlauf, tatsächlichen Kontrast, fehlende Namen von Bedienelementen, zu kleine Klickflächen.
import { withServer, dumpDom, resultOf } from '../tooling/browser.mjs';
const HARNESS = (q) => `<!doctype html><meta charset="utf-8"><title>audit</title><body><script type="module">
const file = ${JSON.stringify(q.get('file'))}; const out = [];
try {
const lum = (c) => { const v = c.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const rgb = (s) => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).map(Number); return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
const where = (el) => { const host = el.closest('[class]') || el; const tag = (el.getRootNode().host || el).localName; return (el.closest('fd-button,fd-text-field,fd-checkbox,fd-switch,fd-badge,fd-alert,fd-card,fd-link,fd-sign-in-form,fd-confirm-action')?.localName || el.localName) + (el.id ? '#' + el.id : ''); };
for (const [w, theme] of [[360, 'light'], [360, 'dark'], [1280, 'light'], [1280, 'dark']]) {
  const f = document.createElement('iframe'); f.style.cssText = 'border:0;height:900px;width:' + w + 'px'; f.src = file; document.body.append(f);
  await new Promise((r) => { f.onload = r; }); const d = f.contentDocument; d.documentElement.dataset.theme = theme;
  await new Promise((r) => setTimeout(r, 250));
  const add = (id, message, el) => out.push({ id, message, at: el ? where(el) : '', width: w, theme });
  if (d.documentElement.scrollWidth > w + 1) { const wide = [...d.body.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > w + 1).pop(); add('render/overflow', 'Inhalt ist ' + (d.documentElement.scrollWidth - w) + ' px breiter als ' + w + ' px.', wide); }
  const win = f.contentWindow; const seen = new Set();
  for (const el of d.body.querySelectorAll('*')) {
    const cs = win.getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    // Deaktivierte Bedienelemente und ihre Beschriftung sind vom Kontrast ausgenommen (WCAG 1.4.3, inaktive Komponenten)
    const inactive = el.closest(':disabled, [data-state="disabled"]') || (el.closest('.fd-checkbox, .fd-switch')?.querySelector(':disabled') && !el.matches('[class*="helper-text"]'));
    if (text && !inactive && w === 1280) {
      const fg = rgb(cs.color); let bgEl = el, bg = null; while (bgEl) { const b = rgb(win.getComputedStyle(bgEl).backgroundColor); if (b && b.a >= 1) { bg = b; break; } bgEl = bgEl.parentElement; } if (!bg) bg = rgb(win.getComputedStyle(d.documentElement).backgroundColor) || { c: [255, 255, 255] };
      if (fg && fg.a >= 1) { const a = lum(fg.c), b = lum(bg.c); const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); const size = parseFloat(cs.fontSize); const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700); const min = large ? 3 : 4.5; const key = where(el) + cs.color + bg.c;
        if (ratio < min && !seen.has(key)) { seen.add(key); add('render/contrast', 'Text „' + el.textContent.trim().slice(0, 30) + '“ hat ' + ratio.toFixed(2) + ' : 1 (mindestens ' + min + ').', el); } }
    }
    if (w === 360 && theme === 'light' && el.matches('button, a[href], input:not([type=hidden]), select, textarea')) {
      const name = (el.getAttribute('aria-label') || el.textContent || (el.labels && [...el.labels].map((l) => l.textContent).join(' ')) || el.getAttribute('title') || '').trim();
      if (!name) add('render/no-name', 'Bedienelement ohne zugänglichen Namen.', el);
      const target = el.closest('label') || el; const tr = target.getBoundingClientRect(); if (!el.disabled && (Math.max(r.width, tr.width) < 24 || Math.max(r.height, tr.height) < 24)) add('render/target-size', 'Klickfläche ' + Math.round(r.width) + ' × ' + Math.round(r.height) + ' px, mindestens 24 × 24.', el);
    }
  }
  f.remove();
}
} catch (e) { out.push({ id: 'render/error', message: 'Prüfung abgebrochen: ' + e.message, at: '', width: 0, theme: '' }); }
document.body.setAttribute('data-result', JSON.stringify({ out }));
</script>`;
export async function audit(files) {
  const FIX = { 'render/overflow': 'Layout bei dieser Breite umbrechen lassen (flex-wrap, minmax(0, 1fr), keine festen Breiten).', 'render/contrast': 'Nur Paarungen aus generated/contrast.json verwenden; Text nicht auf eine Fläche setzen, für die das Token nicht zugesagt ist.', 'render/no-name': 'Beschriftung setzen (label-Attribut der Komponente oder aria-label).', 'render/target-size': 'Systemkomponente verwenden; sie bringt die Mindestgröße mit.' };
  const findings = [];
  await withServer({ '/__audit': HARNESS }, async (base) => {
    for (const file of files) {
      const { dom } = await dumpDom(`${base}/__audit?file=${encodeURIComponent(file)}`, { budget: 30000 }); const res = resultOf(dom);
      if (!res) { findings.push({ file, line: 0, id: 'render/not-loaded', message: 'Seite konnte nicht geladen werden.', fix: 'Pfad und eingebundene Dateien prüfen.' }); continue; }
      for (const x of res.out) findings.push({ file, line: 0, id: x.id, message: `${x.message} (${x.width} px, ${x.theme}${x.at ? ', bei <' + x.at + '>' : ''})`, fix: FIX[x.id] });
    }
  });
  return findings;
}
