// Erzeugt die Doku-Site (docs/index.html) aus der Spec. Nutzt nur Tokens und die eigenen Web Components;
// die Seite muss selbst durch check und audit kommen.
export function renderDocs({ spec, pairs, usage, kebab, isBool, floatGroups, guide }) {
  const P = spec.cssPrefix; const v = (n) => `var(--${P}-${n})`;
  const e = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const el = (name, attrs = '', inner = '') => `<${P}-${name}${attrs ? ' ' + attrs : ''}>${inner}</${P}-${name}>`;
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
<p class="lead">${e(c.purpose)}</p>${c.deprecated ? `<p class="note">Veraltet seit ${e(c.deprecated.since)}. Stattdessen: ${e(c.deprecated.use)}.</p>` : ''}
${c.status === 'deprecated' ? '' : `<div class="stage">${demos(c).map(([cap, h]) => `<figure class="cell"><div class="cell-live">${h}</div>${cap ? `<figcaption><code>${e(cap)}</code></figcaption>` : ''}</figure>`).join('')}</div>
<h3>Aufruf</h3><pre>${e(demos(c)[0][1])}</pre>`}
${c.props.length ? `<h3>Attribute</h3><div class="scroll"><table><thead><tr><th>Attribut</th><th>Typ</th><th>Werte</th><th>Standard</th></tr></thead><tbody>${c.props.map((p) => `<tr><td><code>${kebab(p.name)}</code></td><td>${p.type === 'instance' ? 'Slot' : p.type === 'behavior' ? 'Verhalten, nur Code' : p.type === 'codeText' ? 'Text, nur Code' : p.type === 'variant' && isBool(p) ? 'Wahrheitswert' : p.type === 'variant' ? 'Auswahl' : p.type === 'boolean' ? 'Wahrheitswert' : 'Text'}</td><td>${p.values && !isBool(p) ? p.values.map((x) => `<code>${e(x)}</code>`).join(' ') : ''}</td><td>${e(p.default)}</td></tr>`).join('')}</tbody></table></div>` : ''}
${c.rules.length ? `<h3>Regeln</h3><ul class="rules">${c.rules.map(rule).join('')}</ul>` : ''}
<h3>Barrierefreiheit</h3><p>${e(c.a11y)}</p>
${c.do.length || c.dont.length ? `<div class="dodont"><div class="do"><h3>So</h3><ul>${c.do.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div><div class="dont"><h3>So nicht</h3><ul>${c.dont.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div></div>` : ''}
</section>`;
  const swatch = (n) => `<span class="sw-pair"><span class="sw" data-theme="light" style="background: ${v('color-' + kebab(n))}"></span><span class="sw" data-theme="dark" style="background: ${v('color-' + kebab(n))}"></span></span>`;
  const colorGroups = {}; for (const [n, t] of Object.entries(spec.semantic.color)) (colorGroups[n.split('/')[0]] ??= []).push([n, t]);
  const GROUP = { bg: 'Flächen', text: 'Text', border: 'Rahmen', action: 'Aktionen', focus: 'Fokus', feedback: 'Rückmeldung' };
  const nav = (h, l) => el('link', `href="#${h}" label="${e(l)}"`);
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
  html { scroll-behavior: smooth; scroll-padding-top: ${v('space-xl')}; }
  body { margin: 0; background: ${v('color-bg-canvas')}; color: ${v('color-text-primary')}; font: ${v('text-body-md')}; }
  .top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: ${v('space-lg')}; padding: ${v('space-lg')} ${v('space-xl')}; border-bottom: ${v('border-width-default')} solid ${v('color-border-default')}; background: ${v('color-bg-surface')}; }
  .brand { font: ${v('text-heading-md')}; } .brand span { font: ${v('text-body-sm')}; color: ${v('color-text-secondary')}; margin-left: ${v('space-sm')}; }
  .layout { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr); gap: ${v('space-3xl')}; max-width: 1240px; margin: 0 auto; padding: ${v('space-2xl')} ${v('space-xl')} ${v('space-3xl')}; }
  nav { position: sticky; top: ${v('space-xl')}; align-self: start; display: flex; flex-direction: column; font: ${v('text-body-sm')}; }
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
  .guide { display: grid; gap: ${v('space-md')}; } .guide-item { padding: ${v('space-lg')}; border-radius: ${v('radius-md')}; background: ${v('color-bg-canvas')}; } .guide-item p { color: ${v('color-text-secondary')}; margin-top: ${v('space-xs')}; }
  .compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: ${v('space-md')}; margin-bottom: ${v('space-md')}; }
  @media (max-width: 820px) { .layout { grid-template-columns: minmax(0, 1fr); gap: ${v('space-xl')}; padding: ${v('space-xl')} ${v('space-lg')}; } nav { position: static; flex-direction: row; flex-wrap: wrap; column-gap: ${v('space-lg')}; } nav strong { width: 100%; } .panel { padding: ${v('space-lg')}; } .stage { padding: ${v('space-lg')}; } }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
</style>
</head>
<body>
<header class="top"><div class="brand">${e(spec.name)} <span>Design System ${e(spec.version)}</span></div>${el('switch', 'id="theme" label="Dunkle Ansicht"')}</header>
<div class="layout">
<nav aria-label="Inhalt"><strong>Grundlagen</strong>${[['start', 'Überblick'], ['grundsaetze', 'Grundsätze'], ['farben', 'Farben'], ['masse', 'Maße'], ['typo', 'Typografie'], ['kontrast', 'Kontrast']].map(([h, l]) => nav(h, l)).join('')}<strong>Komponenten</strong>${spec.components.map((c) => nav(kebab(c.name), c.name)).join('')}${guide ? `<strong>Arbeiten</strong>${nav('leitfaden', 'Leitfaden')}` : ''}</nav>
<main>
<section class="hero" id="start">
  <div><h1>${e(spec.name)} Design System</h1><p class="lead">Ein Designsystem, das Menschen und KI-Agenten gleich gut lesen können. Diese Seite ist aus der Spec erzeugt und zeigt die echten Web Components aus ${e(spec.codePackage)}.</p></div>
  <div class="facts"><div class="fact"><b>${live.length}</b><span>Komponenten und Muster</span></div><div class="fact"><b>${tokenCount}</b><span>Tokens mit Begründung</span></div><div class="fact"><b>${rules.length + (spec.principles || []).length}</b><span>Regeln, davon ${checked} automatisch geprüft</span></div><div class="fact"><b>${pairs.length}</b><span>Kontrastpaare nachgerechnet</span></div></div>
  <div class="tiles">${live.map((c) => `<div class="tile"><div class="tile-live">${demos(c)[0][1]}</div><div>${nav(kebab(c.name), c.name)}<p>${e(c.purpose)}</p></div></div>`).join('')}</div>
  <div class="panel"><h2>Einbinden</h2><pre>${e(`<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components.css">\n<script type="module" src="fundament.js"></script>\n\n${usage(spec.components[0])}`)}</pre><h3>Changelog</h3><ul>${(spec.changelog || []).map((x) => `<li><strong>${e(x.version)}</strong> ${e(x.text)}</li>`).join('')}</ul></div>
</section>
<section class="panel" id="grundsaetze"><h2>Grundsätze</h2><p class="lead">Diese fünf prüft der Check auf jeder Seite. Weitere Grundsätze für Urteilsfragen stehen in DESIGN.md.</p><h3>Im Check</h3><ul class="rules">${(spec.principles || []).map(rule).join('')}</ul></section>
<section class="panel" id="farben"><h2>Farben</h2><p class="lead">Jedes Muster zeigt links den hellen, rechts den dunklen Wert.</p>${Object.entries(colorGroups).map(([g, list]) => `<h3>${e(GROUP[g] || g)}</h3><div class="scroll"><table><thead><tr><th>Muster</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${list.map(([n, t]) => `<tr><td>${swatch(n)}</td><td><code>--${P}-color-${kebab(n)}</code></td><td>${e(t.why)}</td></tr>`).join('')}</tbody></table></div>`).join('')}</section>
<section class="panel" id="masse"><h2>Maße</h2>${floatGroups.map((g) => `<h3>${e({ space: 'Abstände', radius: 'Radien', 'border-width': 'Rahmenstärken', size: 'Größen' }[g] || g)}</h3><div class="scroll"><table><thead><tr><th>Wert</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${Object.entries(spec.semantic[g]).map(([n, t]) => `<tr><td>${g === 'space' ? `<span class="bar" style="width: ${v('space-' + n)}"></span> ` : ''}${t.value} px</td><td><code>--${P}-${g}-${n}</code></td><td>${e(t.why)}</td></tr>`).join('')}</tbody></table></div>`).join('')}</section>
<section class="panel" id="typo"><h2>Typografie</h2>${spec.textStyles.map((t) => `<div class="type-row"><p style="font: ${v('text-' + kebab(t.name))}">${e(t.name)}</p><p class="meta">${t.size}/${t.line} ${e(t.weight)} / ${e(t.why)} / <code>--${P}-text-${kebab(t.name)}</code></p></div>`).join('')}</section>
<section class="panel" id="kontrast"><h2>Kontrast</h2><p class="lead">Nur diese Paarungen sind zugesagt. Der Build rechnet sie in beiden Modes nach und bricht ab, wenn eine durchfällt.</p><h3>Geprüfte Paare</h3><div class="scroll"><table><thead><tr><th>Vordergrund</th><th>auf</th><th>hell</th><th>dunkel</th><th>mindestens</th><th>wofür</th></tr></thead><tbody>${pairs.filter((p) => p.mode === 'light').map((p) => `<tr><td><code>${e(p.fg)}</code></td><td><code>${e(p.on)}</code></td><td>${p.ratio}</td><td>${pairs.find((d) => d.mode === 'dark' && d.fg === p.fg && d.on === p.on).ratio}</td><td>${p.min}</td><td>${e(p.why)}</td></tr>`).join('')}</tbody></table></div></section>
${spec.components.map(comp).join('\n')}
${guide ? `<section class="panel" id="leitfaden"><h2>${e(guide.title)}</h2><p class="lead">${e(guide.intro)}</p>${guide.sections.map((s) => `<h3>${e(s.title)}</h3>${s.intro ? `<p class="lead">${e(s.intro)}</p>` : ''}${s.code ? `<pre>${e(s.code)}</pre>` : ''}<div class="guide">${(s.items || []).map(([t, x]) => `<div class="guide-item"><strong>${e(t)}</strong><p>${e(x)}</p></div>`).join('')}${(s.compare || []).map(([a, b]) => `<div class="compare"><div class="dont"><h3>So nicht</h3><p>${e(a)}</p></div><div class="do"><h3>So</h3><p>${e(b)}</p></div></div>`).join('')}</div>`).join('')}</section>` : ''}
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
