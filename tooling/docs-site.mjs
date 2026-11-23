// Erzeugt die Doku-Site (docs/index.html) aus dem zusammengesetzten System und specs/leitfaden.json. Nutzt nur Tokens und die eigenen Web Components;
// die Seite muss selbst durch check und audit kommen.
export function renderDocs({ spec, pairs, usage, kebab, isBool, floatGroups, guide, html = {} }) {
  const P = spec.cssPrefix; const v = (n) => `var(--${P}-${n})`; const v0 = v;
  const e = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const el = (name, attrs = '', inner = '') => `<${P}-${name}${attrs ? ' ' + attrs : ''}>${inner}</${P}-${name}>`;
  const nav = (h, l) => el('link', `href="#${h}" label="${e(l)}"`);
  const live = spec.components.filter((c) => c.status !== 'deprecated'); const rules = spec.components.flatMap((c) => c.rules); const checked = [...rules, ...(spec.principles || [])].filter((r) => r.check).length;
  const tokenCount = Object.values(spec.semantic).reduce((n, g) => n + Object.keys(g).length, 0) + spec.textStyles.length;
  // Beispiele je Komponente: jede Variante einmal, mit Beschriftung des gesetzten Attributs
  const demos = (c) => {
    if (c.name === 'Card') return [['mit Badge und Aktion', el('card', 'title="Plus" body="Für kleine Teams." show-badge', el('badge', 'slot="badge" tone="info" label="Aktuell"') + el('button', 'slot="action" variant="secondary" label="Tarif verwalten"'))], ['ohne Footer', el('card', 'title="Kartentitel" body="Kurze Beschreibung des Inhalts." show-footer="false"')]];
    if (c.kind === 'pattern' || !c.props.length) return [['', usage(c)]];
    const out = []; const en = c.props.filter((p) => (p.type === 'variant' && !isBool(p)));
    if (!en.length) out.push(['Standard', usage(c)]);
    for (const p of en) for (const val of p.values) out.push([`${kebab(p.name)}="${val}"`, usage(c, { [p.name]: val })]);
    for (const p of c.props.filter((x) => x.type === 'variant' && isBool(x))) out.push([kebab(p.name), usage(c, { [p.name]: 'true', ...(c.props.some((x) => x.name === 'showHelper') && p.name === 'disabled' ? { showHelper: true } : {}) })]);
    if (c.name === 'TextField') out.push(['show-trailing trailing-action="reveal"', el('text-field', 'label="Passwort" type="password" value="geheim-geheim" show-helper="false" show-trailing trailing-action="reveal"', el('button', 'slot="trailing" variant="ghost" size="sm" label="Anzeigen"'))]);
    const seen = new Set(); return out.filter(([, h]) => !seen.has(h) && seen.add(h));
  };
  const rule = (r) => `<li class="rule"><div class="rule-head"><strong>${e(r.text)}</strong>${el('badge', `tone="${r.check ? 'success' : 'neutral'}" label="${r.check ? 'Geprüft' : 'Urteil'}"`)}</div><p>${e(r.why)}</p><code>${e(r.id)}</code></li>`;
  const comp = (c) => `<section class="panel" id="${kebab(c.name)}">
<header class="comp-head"><div><h2>${e(c.name)}</h2><p class="meta"><code>&lt;${P}-${kebab(c.name)}&gt;</code> / v${e(c.version)} / ${c.kind === 'pattern' ? 'Muster' : 'Komponente'}</p></div>${el('badge', `tone="${c.status === 'deprecated' ? 'warning' : 'success'}" label="${e(c.status)}"`)}</header>
<p class="lead">${e(c.purpose)}</p>${(c.notFor || []).length ? `<div class="notfor"><strong>Nicht verwenden für</strong><ul>${c.notFor.map((x) => `<li>${e(x.text)}: ${x.use ? `stattdessen ${nav(kebab(x.use), x.use)}` : 'dafür gibt es noch keinen Baustein'}</li>`).join('')}</ul></div>` : ''}${c.deprecated ? `<p class="note">Veraltet seit ${e(c.deprecated.since)}. Stattdessen: ${e(c.deprecated.use)}.</p>` : ''}
${c.status === 'deprecated' ? '' : `<div class="stage">${demos(c).map(([cap, h]) => `<figure class="cell"><div class="cell-live">${h}</div>${cap ? `<figcaption><code>${e(cap)}</code></figcaption>` : ''}</figure>`).join('')}</div>
<h3>Aufruf</h3><pre>${e(demos(c)[0][1])}</pre>${html[c.name] ? `<details class="more"><summary>Als HTML und CSS, ohne Web Components</summary><pre>${e(html[c.name])}</pre><p class="meta">Zum Kopieren: <code>generated/html/${kebab(c.name)}.html</code>. Verhalten und Zustände für Hilfstechnik setzt man in dieser Fassung selbst, siehe ${nav('html-css', 'Zwei Wege im Code')}.</p></details>` : ''}`}
${c.props.length ? `<h3>Attribute</h3><div class="scroll"><table><thead><tr><th>Attribut</th><th>Typ</th><th>Werte</th><th>Standard</th></tr></thead><tbody>${c.props.map((p) => `<tr><td><code>${kebab(p.name)}</code></td><td>${p.type === 'instance' ? 'Slot' : p.type === 'behavior' ? 'Verhalten, nur Code' : p.type === 'codeText' ? 'Text, nur Code' : p.type === 'variant' && isBool(p) ? 'Wahrheitswert' : p.type === 'variant' ? 'Auswahl' : p.type === 'boolean' ? 'Wahrheitswert' : 'Text'}</td><td>${p.values && !isBool(p) ? p.values.map((x) => `<code>${e(x)}</code>`).join(' ') : ''}</td><td>${e(p.default)}</td></tr>`).join('')}</tbody></table></div>` : ''}
${c.rules.length ? `<h3>Regeln</h3><ul class="rules">${c.rules.map(rule).join('')}</ul>` : ''}
<h3>Barrierefreiheit</h3><p>${e(c.a11y)}</p>
${c.do.length || c.dont.length ? `<div class="dodont"><div class="do"><h3>So</h3><ul>${c.do.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div><div class="dont"><h3>So nicht</h3><ul>${c.dont.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div></div>` : ''}
</section>`;
  const swatch = (n) => `<span class="sw-pair"><span class="sw" data-theme="light" style="background: ${v('color-' + kebab(n))}"></span><span class="sw" data-theme="dark" style="background: ${v('color-' + kebab(n))}"></span></span>`;
  const colorGroups = {}; for (const [n, t] of Object.entries(spec.semantic.color)) (colorGroups[n.split('/')[0]] ??= []).push([n, t]);
  const GROUP = { bg: 'Flächen', text: 'Text', border: 'Rahmen', action: 'Aktionen', focus: 'Fokus', feedback: 'Rückmeldung' };
  const TONE = { Design: 'info', Entwicklung: 'neutral', Automatisch: 'success', Agent: 'warning', Team: 'neutral' };
  const who = (w) => el('badge', `tone="${TONE[w] || 'neutral'}" label="${e(w)}"`);
  const flow = (f) => `<figure class="flow"><figcaption><strong>${e(f.title)}</strong>${f.when ? `<span>${e(f.when)}</span>` : ''}</figcaption><ol>${f.steps.map(([w, t, x], i) => `<li><div class="flow-rail"><span class="flow-n">${i + 1}</span><span class="flow-line"></span></div><div class="flow-body"><div class="flow-head"><strong>${e(t)}</strong>${who(w)}</div><p>${e(x)}</p></div></li>`).join('')}</ol>${f.loop ? `<p class="flow-loop"><strong>Wenn es hakt:</strong> ${e(f.loop)}</p>` : ''}${f.result ? `<p class="flow-result"><strong>Am Ende:</strong> ${e(f.result)}</p>` : ''}</figure>`;
  const ROLE = { bg: 'Fläche', fg: 'Text', border: 'Rahmen', ring: 'Fokusring' };
  const proof = (p) => { const c = spec.components.find((x) => x.name === p.component); if (!c) return ''; const n = spec.components.reduce((k, x) => k + Object.keys(x.looks || {}).length, 0);
    return `<figure class="proof"><div class="proof-row proof-head"><span>So sieht es im Browser aus</span><span>Das hängt in Figma daran</span></div>${p.variants.filter((v) => c.looks[v]).map((v) => { const props = Object.fromEntries(v.split(', ').map((kv) => kv.split('='))); const shown = Object.fromEntries(Object.entries(props).filter(([k, val]) => c.props.find((q) => q.name === k)?.default !== val)); return `<div class="proof-row"><div class="proof-live">${usage(c, shown)}</div><ul>${Object.entries(c.looks[v]).filter(([r]) => ROLE[r]).map(([r, t]) => `<li><span class="sw" style="background: ${v0('color-' + kebab(t))}"></span><span>${ROLE[r]}</span><code>${e(t)}</code></li>`).join('')}</ul></div>`; }).join('')}<figcaption>Die Prüfung vergleicht beide Seiten für alle ${n} Varianten, hell und dunkel. Weicht eine ab, ist der Stand rot.</figcaption></figure>`; };
  const body = (s) => `${s.intro ? `<p class="lead">${e(s.intro)}</p>` : ''}
${s.pipeline ? `<ol class="pipe">${s.pipeline.map(([t, x, w]) => `<li><strong>${e(t)}</strong><span>${e(x)}</span>${who(w)}</li>`).join('')}</ol>` : ''}
${s.steps ? `<ol class="steps3">${s.steps.map(([t, x, code], i) => `<li><span class="flow-n">${i + 1}</span><strong>${e(t)}</strong><p>${e(x)}</p>${code ? `<pre>${e(code)}</pre>` : ''}</li>`).join('')}</ol>` : ''}
${s.signals ? `<h3>${e(s.signalsTitle || '')}</h3><div class="signals">${s.signals.map(([tone, t, x]) => `<div class="signal" data-tone="${e(tone)}"><strong>${e(t)}</strong><p>${e(x)}</p></div>`).join('')}</div>` : ''}
${s.checks ? `<ol class="steps3">${s.checks.map(([t, x], i) => `<li><span class="flow-n">${i + 1}</span><strong>${e(t)}</strong><p>${e(x)}</p></li>`).join('')}</ol>` : ''}
${s.proof ? proof(s.proof) : ''}`;
  const section = (s) => s.fold ? `<details class="panel fold" id="${e(s.id)}"><summary><h2>${e(s.title)}</h2></summary>${sectionBody(s)}</details>` : `<section class="panel" id="${e(s.id)}"><h2>${e(s.title)}</h2>${sectionBody(s)}</section>`;
  const sectionBody = (s) => `${body(s)}
${s.homes ? `<div class="homes">${s.homes.map((h) => `<div class="home"><span class="kicker">${e(h.where)}</span><strong>${e(h.what)}</strong><ul>${h.list.map((x) => `<li>${e(x)}</li>`).join('')}</ul><code>${e(h.file)}</code></div>`).join('')}</div><div class="homes-arrow" aria-hidden="true">↓</div><div class="homes-out"><strong>${e(s.out.title)}</strong><div class="chips">${s.out.list.map((x) => `<span class="chip">${e(x)}</span>`).join('')}</div><code>node build.mjs</code></div>` : ''}
${s.guards ? `<ol class="guards">${s.guards.map(([t, x, code], i) => `<li><span class="flow-n">${i + 1}</span><div><strong>${e(t)}</strong><p>${e(x)}</p>${code ? `<pre>${e(code)}</pre>` : ''}</div></li>`).join('')}</ol>` : ''}
${s.legend ? `<ul class="legend">${s.legend.map(([w, x]) => `<li>${who(w)}<span>${e(x)}</span></li>`).join('')}</ul>` : ''}
${s.flows ? `<div class="flows">${s.flows.map(flow).join('')}</div>` : ''}
${s.table ? `<div class="scroll"><table class="ways"><thead><tr>${s.table.head.map((h) => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(([a, ...r]) => `<tr><th scope="row">${e(a)}</th>${r.map((x) => `<td>${e(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
${s.htmlExample && html[s.htmlExample] ? `<div class="pair"><div><h3>Als Web Component</h3><pre>${e(usage(spec.components.find((c) => c.name === s.htmlExample)))}</pre></div><div><h3>Als HTML und CSS</h3><pre>${e(html[s.htmlExample])}</pre></div></div><p class="meta">Die HTML-Fassung jedes Bausteins steht bei der Komponente und unter <code>generated/html/</code>. Eine ganze Seite ohne Web Components: <code>ui/examples/nur-html.html</code>.</p>` : ''}
${s.items ? `<div class="guide">${s.items.map(([t, x]) => `<div class="guide-item"><strong>${e(t)}</strong><p>${e(x)}</p></div>`).join('')}</div>` : ''}
${s.code ? `<h3>Beispiel</h3><pre>${e(s.code)}</pre>${s.codeNote ? `<p class="meta">${e(s.codeNote)}</p>` : ''}` : ''}
${s.note ? `<div class="note-box"><strong>${e(s.note[0])}</strong><p>${e(s.note[1])}</p></div>` : ''}${s.compare ? `<h3>Vage und klar</h3>${s.compare.map(([a, b]) => `<div class="compare"><div class="dont"><h3>So nicht</h3><p>${e(a)}</p></div><div class="do"><h3>So</h3><p>${e(b)}</p></div></div>`).join('')}` : ''}`;
  return `<!doctype html>
<html lang="de" data-fd-specimen>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(spec.name)} Design System ${e(spec.version)}</title>
<!-- Generiert (tooling/docs-site.mjs) aus Figma-Schnappschuss, Code und Regeldatei – nicht von Hand bearbeiten. -->
<link rel="stylesheet" href="../ui/tokens.css">
<link rel="stylesheet" href="../ui/components.css">
<script type="module" src="../ui/fundament.js"></script>
<style>
  html { scroll-behavior: smooth; scroll-padding-top: calc(${v('space-3xl')} + ${v('space-xl')}); }
  body { margin: 0; background: ${v('color-bg-canvas')}; color: ${v('color-text-primary')}; font: ${v('text-body-md')}; }
  .top { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: ${v('space-lg')}; padding: ${v('space-lg')} ${v('space-xl')}; border-bottom: ${v('border-width-default')} solid ${v('color-border-default')}; background: ${v('color-bg-surface')}; }
  .brand { font: ${v('text-heading-md')}; } .brand span { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; margin-left: ${v('space-sm')}; }
  .layout { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr); gap: ${v('space-3xl')}; max-width: 1240px; margin: 0 auto; padding: ${v('space-2xl')} ${v('space-xl')} ${v('space-3xl')}; }
  nav { position: sticky; top: calc(${v('space-3xl')} + ${v('space-xl')}); align-self: start; max-height: calc(100vh - ${v('space-3xl')} - ${v('space-2xl')}); overflow-y: auto; display: flex; flex-direction: column; font: ${v('text-body-sm')}; }
  nav strong { margin: ${v('space-lg')} 0 ${v('space-xs')}; font: ${v('text-label-sm')}; color: ${v('color-text-secondary')}; } nav strong:first-child { margin-top: 0; }
  main { display: flex; flex-direction: column; gap: ${v('space-2xl')}; min-width: 0; }
  h1 { font: ${v('text-display')}; margin: 0; } h2 { font: ${v('text-heading-lg')}; margin: 0; } h3 { font: ${v('text-label-md')}; margin: ${v('space-xl')} 0 ${v('space-sm')}; }
  p, ul { margin: 0; } p, li, strong, figcaption { overflow-wrap: anywhere; } .guide-item, .compare > div, .rule { min-width: 0; } ul { padding-left: ${v('space-xl')}; } li { margin-bottom: ${v('space-xs')}; }
  .lead { color: ${v('color-text-secondary')}; margin-top: ${v('space-sm')}; max-width: 68ch; }
  .meta { font: ${v('text-caption')}; color: ${v('color-text-secondary')}; margin-top: ${v('space-2xs')}; }
  .note { margin-top: ${v('space-sm')}; color: ${v('color-feedback-warning-fg')}; }
  .hero { display: flex; flex-direction: column; gap: ${v('space-xl')}; }
  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: ${v('space-lg')}; }
  .fact { padding: ${v('space-lg')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-lg')}; background: ${v('color-bg-surface')}; }
  .fact b { display: block; font: ${v('text-display')}; } .fact span { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: ${v('space-lg')}; }
  .tile { display: flex; flex-direction: column; gap: ${v('space-md')}; padding: ${v('space-lg')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-lg')}; background: ${v('color-bg-surface')}; min-width: 0; }
  .tile-live { display: flex; align-items: center; justify-content: center; min-height: ${v('space-3xl')}; padding: ${v('space-md')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; overflow: hidden; }
  .tile-live > * { min-width: 0; max-width: 100%; } .tile-live > :is(${P}-text-field, ${P}-sign-in-form, ${P}-confirm-action, ${P}-alert, ${P}-card) { flex: 1; }
  .tile p { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; }
  .panel { padding: ${v('space-2xl')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-lg')}; background: ${v('color-bg-surface')}; }
  .comp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: ${v('space-lg')}; }
  .stage { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: ${v('space-lg')}; margin-top: ${v('space-xl')}; padding: ${v('space-xl')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; }
  .cell { display: flex; flex-direction: column; gap: ${v('space-sm')}; margin: 0; min-width: 0; } .cell-live { display: flex; align-items: center; min-height: ${v('size-touch-target')}; min-width: 0; } .cell-live > * { max-width: 100%; }
  figcaption { font: ${v('text-caption')}; color: ${v('color-text-secondary')}; }
  pre { margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-subtle')}; font: ${v('text-body-sm')}; white-space: pre-wrap; overflow-wrap: anywhere; }
  code { font: ${v('text-body-sm')}; overflow-wrap: anywhere; } td code { padding: ${v('space-2xs')} ${v('space-xs')}; border-radius: ${v('radius-sm')}; background: ${v('color-bg-subtle')}; }
  .scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font: ${v('text-body-sm')}; }
  th, td { text-align: left; vertical-align: top; padding: ${v('space-md')} ${v('space-sm')}; border-bottom: ${v('border-width-default')} solid ${v('color-border-default')}; }
  th { font: ${v('text-label-sm')}; color: ${v('color-text-secondary')}; }
  .rules { list-style: none; padding: 0; display: grid; gap: ${v('space-md')}; }
  .rule { margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .rule p { color: ${v('color-text-secondary')}; margin: ${v('space-xs')} 0; } .rule code { font: ${v('text-caption')}; color: ${v('color-text-secondary')}; }
  .rule-head { display: flex; align-items: flex-start; justify-content: space-between; gap: ${v('space-md')}; }
  .dodont { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: ${v('space-lg')}; margin-top: ${v('space-xl')}; }
  .do, .dont { padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; } .do { background: ${v('color-feedback-success-bg')}; } .dont { background: ${v('color-feedback-danger-bg')}; }
  .do h3, .dont h3 { margin-top: 0; } .do h3 { color: ${v('color-feedback-success-fg')}; } .dont h3 { color: ${v('color-feedback-danger-fg')}; }
  .sw-pair { display: inline-flex; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-sm')}; overflow: hidden; } .sw { display: block; width: ${v('space-2xl')}; height: ${v('space-2xl')}; }
  .bar { display: inline-block; height: ${v('space-md')}; border-radius: ${v('radius-sm')}; background: ${v('color-action-primary')}; vertical-align: middle; }
  .type-row { padding: ${v('space-md')} 0; border-bottom: ${v('border-width-default')} solid ${v('color-border-default')}; }
  .guide { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: ${v('space-md')}; margin-top: ${v('space-xl')}; } .guide-item { padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .guide-item p { color: ${v('color-text-secondary')}; margin-top: ${v('space-xs')}; }
  .kicker { display: block; font: ${v('text-label-sm')}; color: ${v('color-text-secondary')}; margin-bottom: ${v('space-xs')}; }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: ${v('space-lg')}; } .step { display: flex; flex-direction: column; gap: ${v('space-sm')}; min-width: 0; padding: ${v('space-lg')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-lg')}; background: ${v('color-bg-surface')}; } .step p { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; } .step pre { padding: ${v('space-md')}; }
  .homes { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: ${v('space-lg')}; margin-top: ${v('space-xl')}; }
  .home, .homes-out { display: flex; flex-direction: column; gap: ${v('space-xs')}; min-width: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .home strong, .homes-out strong { font: ${v('text-heading-md')}; } .home ul { margin: ${v('space-sm')} 0; color: ${v('color-text-secondary')}; } .home code, .homes-out code { font: ${v('text-caption')}; color: ${v('color-text-secondary')}; }
  .homes-arrow { text-align: center; font: ${v('text-heading-lg')}; color: ${v('color-text-secondary')}; padding: ${v('space-xs')} 0; } .homes-out { align-items: center; text-align: center; border: ${v('border-width-default')} solid ${v('color-border-default')}; background: ${v('color-bg-surface')}; } .chip { padding: ${v('space-xs')} ${v('space-md')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-full')}; font: ${v('text-body-sm')}; } .chips { display: flex; flex-wrap: wrap; justify-content: center; gap: ${v('space-sm')}; margin: ${v('space-sm')} 0; }
  .guards { list-style: none; margin: ${v('space-xl')} 0 0; padding: 0; display: grid; gap: ${v('space-lg')}; } .guards li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: ${v('space-md')}; margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .guards p { color: ${v('color-text-secondary')}; margin: ${v('space-2xs')} 0 0; max-width: 68ch; } .guards pre { margin-top: ${v('space-md')}; background: ${v('color-bg-surface')}; }
  .note-box { margin-top: ${v('space-lg')}; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-feedback-warning-bg')}; color: ${v('color-feedback-warning-fg')}; } .note-box p { margin-top: ${v('space-2xs')}; max-width: 68ch; }
  .pipe { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: ${v('space-xl')}; margin: ${v('space-xl')} 0 0; padding: 0; } .pipe li { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: ${v('space-xs')}; margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; min-width: 0; } .pipe strong { font: ${v('text-heading-md')}; } .pipe span { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; }
  .pipe li + li::before { content: "→"; position: absolute; left: calc(-1 * ${v('space-xl')}); top: 50%; width: ${v('space-xl')}; text-align: center; transform: translateY(-50%); color: ${v('color-text-secondary')}; font: ${v('text-heading-md')}; }
  .steps3 { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: ${v('space-lg')}; margin: ${v('space-xl')} 0 0; padding: 0; } .steps3 li { display: flex; flex-direction: column; align-items: flex-start; gap: ${v('space-xs')}; margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; min-width: 0; } .steps3 strong { font: ${v('text-heading-md')}; margin-top: ${v('space-xs')}; } .steps3 p { color: ${v('color-text-secondary')}; } .steps3 pre { align-self: stretch; margin-top: ${v('space-sm')}; padding: ${v('space-md')}; background: ${v('color-bg-surface')}; }
  .signals { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: ${v('space-lg')}; } .signal { padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; min-width: 0; } .signal p { margin-top: ${v('space-2xs')}; font: ${v('text-body-sm')}; }
  .signal[data-tone="success"] { background: ${v('color-feedback-success-bg')}; color: ${v('color-feedback-success-fg')}; } .signal[data-tone="warning"] { background: ${v('color-feedback-warning-bg')}; color: ${v('color-feedback-warning-fg')}; } .signal[data-tone="danger"] { background: ${v('color-feedback-danger-bg')}; color: ${v('color-feedback-danger-fg')}; }
  .proof { margin: ${v('space-xl')} 0 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .proof-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: ${v('space-lg')}; align-items: center; padding: ${v('space-md')} 0; border-top: ${v('border-width-default')} solid ${v('color-border-default')}; } .proof-head { border-top: 0; padding-top: 0; font: ${v('text-label-sm')}; color: ${v('color-text-secondary')}; }
  .proof ul { list-style: none; display: flex; flex-wrap: wrap; gap: ${v('space-sm')} ${v('space-xl')}; margin: 0; padding: 0; } .proof li { display: flex; align-items: center; gap: ${v('space-sm')}; margin: 0; font: ${v('text-body-sm')}; } .proof .sw { width: ${v('space-lg')}; height: ${v('space-lg')}; border: ${v('border-width-default')} solid ${v('color-border-default')}; border-radius: ${v('radius-sm')}; } .proof figcaption { margin-top: ${v('space-md')}; }
  .fold > summary { cursor: pointer; border-radius: ${v('radius-sm')}; } .fold > summary h2 { display: inline; font: ${v('text-heading-md')}; } .fold > summary:focus-visible { outline: ${v('border-width-strong')} solid ${v('color-focus-ring')}; outline-offset: ${v('border-width-strong')}; } .fold[open] > summary { margin-bottom: ${v('space-md')}; }
  @media (max-width: 820px) { .pipe li + li::before { content: none; } .proof-row { grid-template-columns: minmax(0, 1fr); } }
  .notfor { margin-top: ${v('space-lg')}; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .notfor ul { margin-top: ${v('space-xs')}; color: ${v('color-text-secondary')}; }
  .legend { list-style: none; display: flex; flex-wrap: wrap; gap: ${v('space-sm')} ${v('space-xl')}; padding: 0; margin: ${v('space-lg')} 0; font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; } .legend li { display: flex; align-items: center; gap: ${v('space-sm')}; margin: 0; }
  .flows { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: ${v('space-lg')}; align-items: start; }
  .flow { display: flex; flex-direction: column; gap: ${v('space-lg')}; margin: 0; padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; min-width: 0; }
  .flow figcaption { display: flex; flex-direction: column; gap: ${v('space-2xs')}; } .flow figcaption strong { font: ${v('text-heading-md')}; color: ${v('color-text-primary')}; } .flow figcaption span { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; }
  .flow ol { list-style: none; margin: 0; padding: 0; } .flow li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: ${v('space-md')}; margin: 0; }
  .flow-rail { display: flex; flex-direction: column; align-items: center; } .flow-line { flex: 1; width: ${v('border-width-strong')}; background: ${v('color-border-default')}; } .flow li:last-child .flow-line { background: transparent; }
  .flow-n { display: inline-grid; place-content: center; flex: none; width: ${v('space-xl')}; height: ${v('space-xl')}; border-radius: ${v('radius-full')}; background: ${v('color-action-primary')}; color: ${v('color-text-on-action')}; font: ${v('text-label-sm')}; }
  .flow-body { padding-bottom: ${v('space-lg')}; min-width: 0; } .flow-body p { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; margin-top: ${v('space-2xs')}; }
  .flow-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: ${v('space-xs')} ${v('space-sm')}; }
  .flow-loop, .flow-result { padding: ${v('space-md')}; border-radius: ${v('radius-md')}; font: ${v('text-body-sm')}; } .flow-loop { background: ${v('color-feedback-warning-bg')}; color: ${v('color-feedback-warning-fg')}; } .flow-result { background: ${v('color-feedback-success-bg')}; color: ${v('color-feedback-success-fg')}; }
  .pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: ${v('space-lg')}; } .pair > div { min-width: 0; } .ways th[scope="row"] { color: ${v('color-text-primary')}; white-space: nowrap; } .ways td { min-width: 200px; }
  .more { margin-top: ${v('space-sm')}; } .more summary { padding: ${v('space-md')} 0; font: ${v('text-label-md')}; color: ${v('color-feedback-info-fg')}; cursor: pointer; border-radius: ${v('radius-sm')}; } .more summary:focus-visible { outline: ${v('border-width-strong')} solid ${v('color-focus-ring')}; outline-offset: ${v('border-width-strong')}; } .more .meta { margin-top: ${v('space-sm')}; }
  .compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: ${v('space-md')}; margin-bottom: ${v('space-md')}; }
  @media (max-width: 820px) { .layout { grid-template-columns: minmax(0, 1fr); gap: ${v('space-xl')}; padding: ${v('space-xl')} ${v('space-lg')}; } nav { position: static; max-height: none; flex-direction: row; flex-wrap: wrap; column-gap: ${v('space-lg')}; } nav strong { width: 100%; } .panel { padding: ${v('space-lg')}; } .stage { padding: ${v('space-lg')}; } }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
</style>
</head>
<body>
<header class="top"><div class="brand">${e(spec.name)} <span>Design System ${e(spec.version)}</span></div>${el('switch', 'id="theme" label="Dunkle Ansicht"')}</header>
<div class="layout">
<nav aria-label="Inhalt"><strong>Start</strong>${nav('start', 'Überblick')}${guide ? `<strong>${e(guide.title)}</strong>${guide.sections.filter((x) => !x.fold).map((x) => nav(x.id, x.title)).join('')}<strong>Nachschlagen</strong>${guide.sections.filter((x) => x.fold).map((x) => nav(x.id, x.title)).join('')}` : ''}<strong>Grundlagen</strong>${[['grundsaetze', 'Alle Regeln'], ['farben', 'Farben'], ['masse', 'Maße'], ['typo', 'Typografie'], ['kontrast', 'Kontrast']].map(([h, l]) => nav(h, l)).join('')}<strong>Komponenten</strong>${spec.components.map((c) => nav(kebab(c.name), c.name)).join('')}<strong>Verlauf</strong>${nav('aenderungen', 'Änderungen')}</nav>
<main>
<section class="hero" id="start">
  <div><h1>${e(spec.name)} Design System</h1><p class="lead">Ein Designsystem, das Menschen und KI-Agenten gleich gut lesen können. Diese Seite wird aus Figma, Code und Regeldatei erzeugt und zeigt die echten Bausteine.</p></div>
  <div class="steps"><div class="step"><span class="kicker">1 / Einbinden</span><pre>${e(`<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components.css">\n<script type="module" src="fundament.js"></script>`)}</pre></div><div class="step"><span class="kicker">2 / Baustein verwenden</span><pre>${e(usage(spec.components[0]))}</pre><p>Alle Bausteine stehen unten, jeweils mit Varianten, Attributen und Regeln.</p></div><div class="step"><span class="kicker">3 / Prüfen</span><pre>node cli/fundament.mjs check &lt;Pfad&gt;</pre><p>Der Check nennt jeden Fehler und sagt, wie man ihn behebt.</p></div></div>
  <div class="facts"><div class="fact"><b>${live.length}</b><span>Komponenten und Muster</span></div><div class="fact"><b>${tokenCount}</b><span>Tokens mit Begründung</span></div><div class="fact"><b>${rules.length + (spec.principles || []).length}</b><span>Regeln, davon ${checked} automatisch geprüft</span></div><div class="fact"><b>${pairs.length}</b><span>Kontrastpaare nachgerechnet</span></div></div>
  <h2>Bausteine</h2><div class="tiles">${live.map((c) => `<div class="tile"><div>${nav(kebab(c.name), c.name)}<p>${e(c.purpose)}</p></div></div>`).join('')}</div>
</section>
${guide ? guide.sections.map(section).join('\n') : ''}
<section class="panel" id="grundsaetze"><h2>Alle Regeln</h2><p class="lead">${rules.length + (spec.principles || []).length} Regeln, jede ein Satz mit Begründung. ${checked} prüft der Check von selbst, die übrigen brauchen ein Urteil.</p><h3>Für jede Seite</h3><ul class="rules">${(spec.principles || []).map(rule).join('')}</ul><h3>Je Baustein</h3>${spec.components.filter((c) => c.rules.length).map((c) => `<details class="more"><summary>${e(c.name)} / ${c.rules.length} ${c.rules.length === 1 ? 'Regel' : 'Regeln'}</summary><ul class="rules">${c.rules.map(rule).join('')}</ul></details>`).join('')}</section>
<section class="panel" id="farben"><h2>Farben</h2><p class="lead">Jedes Muster zeigt links den hellen, rechts den dunklen Wert.</p>${Object.entries(colorGroups).map(([g, list]) => `<h3>${e(GROUP[g] || g)}</h3><div class="scroll"><table><thead><tr><th>Muster</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${list.map(([n, t]) => `<tr><td>${swatch(n)}</td><td><code>--${P}-color-${kebab(n)}</code></td><td>${e(t.why)}</td></tr>`).join('')}</tbody></table></div>`).join('')}</section>
<section class="panel" id="masse"><h2>Maße</h2>${floatGroups.map((g) => `<h3>${e({ space: 'Abstände', radius: 'Radien', 'border-width': 'Rahmenstärken', size: 'Größen' }[g] || g)}</h3><div class="scroll"><table><thead><tr><th>Wert</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${Object.entries(spec.semantic[g]).map(([n, t]) => `<tr><td>${g === 'space' ? `<span class="bar" style="width: ${v('space-' + n)}"></span> ` : ''}${t.value} px</td><td><code>--${P}-${g}-${n}</code></td><td>${e(t.why)}</td></tr>`).join('')}</tbody></table></div>`).join('')}</section>
<section class="panel" id="typo"><h2>Typografie</h2>${spec.textStyles.map((t) => `<div class="type-row"><p style="font: ${v('text-' + kebab(t.name))}">${e(t.name)}</p><p class="meta">${t.size}/${t.line} ${e(t.weight)} / ${e(t.why)} / <code>--${P}-text-${kebab(t.name)}</code></p></div>`).join('')}</section>
<section class="panel" id="kontrast"><h2>Kontrast</h2><p class="lead">Nur diese Paarungen sind zugesagt. Der Build rechnet sie in beiden Modes nach und bricht ab, wenn eine durchfällt.</p><h3>Geprüfte Paare</h3><div class="scroll"><table><thead><tr><th>Vordergrund</th><th>auf</th><th>hell</th><th>dunkel</th><th>mindestens</th><th>wofür</th></tr></thead><tbody>${pairs.filter((p) => p.mode === 'light').map((p) => `<tr><td><code>${e(p.fg)}</code></td><td><code>${e(p.on)}</code></td><td>${p.ratio}</td><td>${pairs.find((d) => d.mode === 'dark' && d.fg === p.fg && d.on === p.on).ratio}</td><td>${p.min}</td><td>${e(p.why)}</td></tr>`).join('')}</tbody></table></div></section>
${spec.components.map(comp).join('\n')}
<section class="panel" id="aenderungen"><h2>Was sich geändert hat</h2><ul>${(spec.changelog || []).map((x) => `<li><strong>${e(x.version)}</strong> ${e(x.text)}</li>`).join('')}</ul></section>
</main>
</div>
<script type="module">
const sw = document.getElementById('theme');
sw.addEventListener('change', () => { document.documentElement.dataset.theme = sw.checked ? 'dark' : 'light'; });
</script>
</body>
</html>
`;
}
