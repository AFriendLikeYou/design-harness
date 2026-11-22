// Baut aus specs/system.json: Figma-Plugin, DTCG-Tokens, Komponenten-Markdown, llms.txt
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const spec = JSON.parse(readFileSync('specs/system.json', 'utf8'));
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const FLOAT_GROUPS = ['space', 'radius', 'border-width', 'size'].filter((g) => spec.semantic[g]);

// 1) Plugin
const tpl = readFileSync('plugin/code.template.js', 'utf8');
writeFileSync('plugin/code.js', tpl.replace('__SPEC__', JSON.stringify(spec, null, 2)));

// 2) DTCG-Tokens
const hexObj = (h) => ({ colorSpace: 'srgb', components: [1, 3, 5].map((i) => +(parseInt(h.slice(i, i + 2), 16) / 255).toFixed(4)), hex: h });
const prim = { color: { $type: 'color' }, dimension: { $type: 'dimension' } };
for (const [hue, stops] of Object.entries(spec.primitives.color)) { prim.color[hue] = {}; for (const [s, v] of Object.entries(stops)) prim.color[hue][s] = { $value: hexObj(v) }; }
for (const d of spec.primitives.dimension) prim.dimension[d] = { $value: { value: d, unit: 'px' } };
const sem = { light: { color: { $type: 'color' } }, dark: { color: { $type: 'color' } } };
const setPath = (root, path, val) => { const parts = path.split('/'); let o = root; parts.slice(0, -1).forEach((p) => (o = o[p] ??= {})); o[parts.at(-1)] = val; };
for (const [name, t] of Object.entries(spec.semantic.color)) {
  for (const mode of ['light', 'dark']) setPath(sem[mode].color, name, { $value: `{color.${t[mode].replace('/', '.')}}`, $description: t.why });
}
const shared = Object.fromEntries(FLOAT_GROUPS.map((g) => [g, { $type: 'dimension' }]));
for (const g of FLOAT_GROUPS) for (const [n, t] of Object.entries(spec.semantic[g])) shared[g][n] = { $value: spec.primitives.dimension.includes(t.value) ? `{dimension.${t.value}}` : { value: t.value, unit: 'px' }, $description: t.why };
mkdirSync('generated/tokens', { recursive: true });
writeFileSync('generated/tokens/primitive.json', JSON.stringify(prim, null, 2));
writeFileSync('generated/tokens/semantic.light.json', JSON.stringify(sem.light, null, 2));
writeFileSync('generated/tokens/semantic.dark.json', JSON.stringify(sem.dark, null, 2));
writeFileSync('generated/tokens/semantic.shared.json', JSON.stringify(shared, null, 2));

// Beispielaufruf eines Elements mit den Standardwerten der Spec
const usage = (c, over = {}) => { const tag = `${spec.cssPrefix}-${kebab(c.name)}`; const at = (c.name === 'Link' ? ' href="#"' : '') + c.props.filter((p) => p.type !== 'instance' && p.type !== 'behavior').map((p) => { const v = over[p.name] ?? p.default; const n = kebab(p.name); if (p.type === 'boolean' || (p.type === 'variant' && p.values.join() === 'false,true')) return String(v) === 'true' ? (p.default === true ? '' : ` ${n}`) : (p.default === true ? ` ${n}="false"` : ''); if (p.type === 'variant') return v === p.default && !(p.name in over) ? '' : ` ${n}="${v}"`; return ` ${n}="${String(v).replace(/"/g, '&quot;')}"`; }).join(''); return `<${tag}${at}></${tag}>`; };

// 3) Komponenten-Markdown für Agenten im Code-Repo
const idx = [];
for (const c of spec.components) {
  const file = `${kebab(c.name)}.md`;
  idx.push(`- [${c.name}](components/${file}): ${c.purpose}${c.status !== 'stable' ? ` (${c.status})` : ''}`);
  const md = [
    `<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->`,
    `# ${c.name}`, '',
    `Status: ${c.status} · v${c.version} · Spec: ds/${kebab(c.name)}`, '',
    c.purpose, '',
    c.deprecated ? `> Veraltet seit ${c.deprecated.since}. Stattdessen: ${c.deprecated.use}.\n` : '',
    c.status !== 'deprecated' ? `\`\`\`html\n<script type="module">import "${spec.codePackage}";</script>\n${usage(c)}\n\`\`\`\n\nProps sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.\n` : '',
    c.props.length ? '## Props\n\n| Prop | Typ | Werte | Standard |\n|---|---|---|---|\n' + c.props.map((p) => `| \`${p.name}\` | ${p.type} | ${p.values ? p.values.map((v) => `\`${v}\``).join(', ') : '–'} | ${p.default ?? '–'} |`).join('\n') + '\n' : '',
    c.props.some((p) => p.type === 'instance') ? '## Slots\n\n' + c.props.filter((p) => p.type === 'instance').map((p) => `- \`${p.name}\`: Standard ${p.default}`).join('\n') + '\n' : '',
    c.styles ? '## Aussehen (Tokens je Variante oder Zustand)\n\n| Für | Tokens |\n|---|---|\n' + Object.entries(c.styles).map(([k, st]) => `| \`${k}\` | ${Object.entries(st).map(([role, t]) => `${role}: \`${t}\``).join(', ')} |`).join('\n') + '\n' : '',
    c.rules.length ? '## Regeln\n\n' + c.rules.map((r) => `- **${r.text}** Warum: ${r.why} (\`${r.id}\`, ${r.check ? `Check: \`${r.check}\`` : 'manuell'})`).join('\n') + '\n' : '',
    `## Barrierefreiheit\n\n${c.a11y}\n`,
    c.do.length ? `## Do\n\n${c.do.map((d) => `- ${d}`).join('\n')}\n` : '',
    c.dont.length ? `## Don't\n\n${c.dont.map((d) => `- ${d}`).join('\n')}\n` : '',
  ].filter(Boolean).join('\n');
  writeFileSync(`generated/components/${file}`, md);
}
writeFileSync('generated/llms.txt', `# ${spec.name} Design System ${spec.version}\n\n> Komponenten und Tokens. Quelle: specs/system.json. Code-Paket: ${spec.codePackage}.\n\n## Komponenten\n\n${idx.join('\n')}\n\n## Tokens\n\n- [Primitive](tokens/primitive.json): nicht direkt verwenden\n- [Semantisch light](tokens/semantic.light.json), [dark](tokens/semantic.dark.json), [Abstände und Radien](tokens/semantic.shared.json)\n\n## Verträge und Prüfung\n\n- [Verträge](contracts.json): gültige Komponenten, Attribute, Werte, Regeln und Tokens, maschinenlesbar\n- Prüfen: node validate.mjs <Pfad> --json, Befunde beheben, wiederholen bis ok\n`);
console.log('gebaut:', spec.components.length, 'Komponenten');

// 4) CSS-Tokens für den Code (ui/tokens.css)
const primHex = (ref) => { const [hue, stop] = ref.split('/'); return spec.primitives.color[hue][stop]; };
const colorVars = (mode) => Object.entries(spec.semantic.color).map(([n, t]) => `  --${spec.cssPrefix}-color-${kebab(n)}: ${primHex(t[mode]).toLowerCase()};`).join('\n');
const weights = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700 };
const css = [
  `/* Generiert aus specs/system.json – nicht von Hand bearbeiten. */`,
  `:root {\n  color-scheme: light dark;\n${colorVars('light')}`,
  ...FLOAT_GROUPS.flatMap((g) => Object.entries(spec.semantic[g]).map(([n, t]) => `  --${spec.cssPrefix}-${g}-${n}: ${t.value}px;`)),
  ...spec.textStyles.map((t) => `  --${spec.cssPrefix}-text-${kebab(t.name)}: ${weights[t.weight]} ${t.size}px/${t.line}px Inter, system-ui, sans-serif;`),
  `}`,
  `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${colorVars('dark').replace(/^/gm, '  ')}\n  }\n}`,
  `:root[data-theme="dark"], [data-theme="dark"] {\n${colorVars('dark')}\n}`,
  `[data-theme="light"] {\n${colorVars('light')}\n}`,
].join('\n');
mkdirSync('ui', { recursive: true });
writeFileSync('ui/tokens.css', css + '\n');

// 5) Maschinenlesbare Verträge (generated/contracts.json) – Grundlage für validate.mjs und Agenten
const tokenNames = [
  ...Object.keys(spec.semantic.color).map((n) => `--${spec.cssPrefix}-color-${kebab(n)}`),
  ...FLOAT_GROUPS.flatMap((g) => Object.keys(spec.semantic[g]).map((n) => `--${spec.cssPrefix}-${g}-${n}`)),
  ...spec.textStyles.map((t) => `--${spec.cssPrefix}-text-${kebab(t.name)}`),
];
// Props mit den Werten false/true sind im HTML native boolesche Attribute (disabled, checked)
const isBool = (p) => p.values && p.values.join() === 'false,true';
const contracts = {
  $comment: 'Generiert aus specs/system.json – nicht von Hand bearbeiten. Einzige Quelle für gültige Komponenten, Props, Werte und Tokens.',
  principles: spec.principles || [], vagueActions: spec.vagueActions || [], migrations: spec.migrations || [],
  system: spec.name, version: spec.version, cssPrefix: spec.cssPrefix, codePackage: spec.codePackage,
  tokens: Object.fromEntries(tokenNames.map((n) => [n, true])),
  tokenDescriptions: Object.fromEntries([
    ...Object.entries(spec.semantic.color).map(([n, t]) => [`--${spec.cssPrefix}-color-${kebab(n)}`, t.why]),
    ...FLOAT_GROUPS.flatMap((g) => Object.entries(spec.semantic[g]).map(([n, t]) => [`--${spec.cssPrefix}-${g}-${n}`, t.why])),
    ...spec.textStyles.map((t) => [`--${spec.cssPrefix}-text-${kebab(t.name)}`, t.why]),
  ]),
  components: Object.fromEntries(spec.components.map((c) => [c.name, {
    class: `${spec.cssPrefix}-${kebab(c.name)}`, kind: c.kind, status: c.status, version: c.version, purpose: c.purpose,
    deprecated: c.deprecated || null,
    // Varianten-Props werden im HTML als data-<prop> gesetzt, boolesche als natives Attribut, Text-Props als Inhalt des gleichnamigen Teils (class="<class>__<prop>")
    booleans: c.props.filter((p) => p.type === 'variant' && isBool(p)).map((p) => p.name),
    attributes: Object.fromEntries(c.props.filter((p) => p.type === 'variant' && !isBool(p)).map((p) => [`data-${kebab(p.name)}`, { values: p.values, default: p.default }])),
    parts: c.props.filter((p) => p.type === 'text').map((p) => `${spec.cssPrefix}-${kebab(c.name)}__${kebab(p.name)}`),
    // Aussehen je Variante oder Zustand; colorTokens ist die vollständige Liste der Farb-Tokens, die diese Komponente verwenden darf
    styles: c.styles || {},
    colorTokens: [...new Set(Object.values(c.styles || {}).flatMap((st) => Object.entries(st).filter(([k]) => !/Width$/.test(k)).map(([, v]) => `--${spec.cssPrefix}-color-${kebab(v)}`)))],
    slots: c.props.filter((p) => p.type === 'instance').map((p) => ({ name: p.name, class: `${spec.cssPrefix}-${kebab(c.name)}__${kebab(p.name)}`, default: p.default, element: `${spec.cssPrefix}-${kebab(p.default)}`, show: `show-${kebab(p.name)}` })),
    rules: c.rules, a11y: c.a11y,
  }])),
};
writeFileSync('generated/contracts.json', JSON.stringify(contracts, null, 2) + '\n');
console.log('gebaut: ui/tokens.css,', tokenNames.length, 'Tokens, generated/contracts.json');

// 6) Kontrast nachrechnen (WCAG 2.x), Ergebnis ablegen, bei Verstoß abbrechen
const lum = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [];
for (const p of spec.contrast || []) for (const on of p.on) for (const mode of ['light', 'dark']) {
  const r = ratio(primHex(spec.semantic.color[p.fg][mode]), primHex(spec.semantic.color[on][mode]));
  pairs.push({ fg: p.fg, on, mode, ratio: +r.toFixed(2), min: p.min, pass: r >= p.min, why: p.why });
}
writeFileSync('generated/contrast.json', JSON.stringify({ $comment: 'Generiert. Geprüfte Text/Fläche-Paare je Mode nach WCAG 2.x.', pairs }, null, 2) + '\n');
const failed = pairs.filter((p) => !p.pass);
console.log('Kontrast:', pairs.length, 'Paare geprüft,', failed.length, 'durchgefallen');
if (failed.length) { for (const f of failed) console.error(`  ${f.mode}: ${f.fg} auf ${f.on} = ${f.ratio} (mindestens ${f.min})`); process.exit(1); }

// 7) Web Components: Vertrag für die Elemente (ui/contract.generated.js) und Elementangaben in contracts.json
// Attribute, die ein Element an sein inneres natives Element durchreicht (Umsetzungsdetail des Pakets)
const PASSTHROUGH = { Link: ['href', 'target', 'rel'], Button: ['type', 'name', 'value'], TextField: ['name', 'type', 'autocomplete', 'inputmode', 'required'], Checkbox: ['name', 'value'], Switch: ['name'], SignInForm: [] };
for (const c of spec.components) {
  const k = contracts.components[c.name];
  k.element = `${spec.cssPrefix}-${kebab(c.name)}`;
  k.attrs = Object.fromEntries(c.props.filter((p) => p.type !== 'instance').map((p) => [kebab(p.name), (p.type === 'variant' && !isBool(p)) || p.type === 'behavior' ? { type: 'enum', values: p.values, default: p.default } : p.type === 'variant' || p.type === 'boolean' ? { type: 'boolean', default: String(p.default) === 'true' } : { type: 'text', default: p.default }]));
  k.passthrough = PASSTHROUGH[c.name] || [];
  k.slotNames = c.props.filter((p) => p.type === 'instance').map((p) => p.name);
}
writeFileSync('generated/contracts.json', JSON.stringify(contracts, null, 2) + '\n');
const elements = Object.fromEntries(Object.entries(contracts.components).map(([name, k]) => [k.element, { name, status: k.status, deprecated: k.deprecated, attrs: k.attrs, passthrough: k.passthrough, slots: k.slotNames }]));
writeFileSync('ui/contract.generated.js', `// Generiert aus specs/system.json – nicht von Hand bearbeiten.\nexport const VERSION = ${JSON.stringify(spec.version)};\nexport const ELEMENTS = ${JSON.stringify(elements, null, 2)};\n`);
writeFileSync('ui/package.json', JSON.stringify({ name: spec.codePackage, version: spec.version, description: `${spec.name} Design System als Web Components`, type: 'module', main: './fundament.js', exports: { '.': './fundament.js', './tokens.css': './tokens.css', './components.css': './components.css', './contract': './contract.generated.js' }, files: ['fundament.js', 'contract.generated.js', 'tokens.css', 'components.css'], sideEffects: true }, null, 2) + '\n');
console.log('gebaut: ui/contract.generated.js, ui/package.json,', Object.keys(elements).length, 'Elemente');

// 8) Doku-Site für Menschen (docs/index.html), vollständig aus der Spec; nutzt die echten Web Components
{
  const e = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const P = spec.cssPrefix;
  const demo = (c) => {
    if (c.kind === 'pattern' || !c.props.length) return [usage(c)];
    const en = c.props.filter((p) => p.type === 'variant' && !isBool(p));
    if (c.name === 'TextField') return [...en[0].values.map((v) => usage(c, { state: v })), `<${P}-text-field label="Passwort" type="password" value="geheim-geheim" show-helper="false" show-trailing trailing-action="reveal"><${P}-button slot="trailing" variant="ghost" size="sm" label="Anzeigen"></${P}-button></${P}-text-field>`];
    if (c.name === 'Card') return [`<${P}-card title="Plus" body="Für kleine Teams." show-badge><${P}-badge slot="badge" tone="info" label="Aktuell"></${P}-badge><${P}-button slot="action" variant="secondary" label="Tarif verwalten"></${P}-button></${P}-card>`];
    const out = [];
    if (!en.length) out.push(usage(c));
    for (const p of en) for (const v of p.values) out.push(usage(c, { [p.name]: v, ...(c.name === 'TextField' && v !== 'error' ? {} : {}) }));
    for (const p of c.props.filter((x) => x.type === 'variant' && isBool(x))) out.push(usage(c, { [p.name]: 'true', ...(c.props.some((x) => x.name === 'showHelper') && p.name === 'disabled' ? { showHelper: true } : {}) }));
    return [...new Set(out)];
  };
  const comp = (c) => `<section class="doc" id="${kebab(c.name)}"><h2>${e(c.name)} <span class="meta">${e(c.status)} / v${e(c.version)} / &lt;${P}-${kebab(c.name)}&gt;</span></h2>
<p class="lead">${e(c.purpose)}</p>${c.deprecated ? `<p class="note">Veraltet seit ${e(c.deprecated.since)}. Stattdessen: ${e(c.deprecated.use)}.</p>` : ''}
${c.status === 'deprecated' ? '' : `<div class="stage">${demo(c).map((h) => `<div class="cell">${h}</div>`).join('')}</div><pre>${e(demo(c)[0])}</pre>`}
${c.props.length ? `<h3>Attribute</h3><table><thead><tr><th>Attribut</th><th>Typ</th><th>Werte</th><th>Standard</th></tr></thead><tbody>${c.props.map((p) => `<tr><td><code>${kebab(p.name)}</code></td><td>${p.type === 'instance' ? 'Slot' : p.type === 'behavior' ? 'Verhalten (nur Code)' : p.type === 'codeText' ? 'text (nur Code)' : p.type === 'variant' && isBool(p) ? 'boolean' : e(p.type)}</td><td>${p.values && !isBool(p) ? p.values.map(e).join(', ') : ''}</td><td>${e(p.default)}</td></tr>`).join('')}</tbody></table>` : ''}
${c.rules.length ? `<h3>Regeln</h3><ul>${c.rules.map((r) => `<li><strong>${e(r.text)}</strong> ${e(r.why)} <span class="meta">${e(r.id)} / ${r.check ? 'automatisch geprüft' : 'Urteil'}</span></li>`).join('')}</ul>` : ''}
<h3>Barrierefreiheit</h3><p>${e(c.a11y)}</p>
${c.do.length || c.dont.length ? `<div class="dodont"><div><h3>Do</h3><ul>${c.do.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div><div><h3>Don't</h3><ul>${c.dont.map((d) => `<li>${e(d)}</li>`).join('')}</ul></div></div>` : ''}</section>`;
  const tokenRows = (group, entries, sample) => Object.entries(entries).map(([n, t]) => `<tr><td>${sample(n, t)}</td><td><code>--${P}-${group}-${kebab(n)}</code></td><td>${e(t.why)}</td></tr>`).join('');
  const page = `<!doctype html>
<html lang="de" data-fd-specimen>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(spec.name)} Design System ${e(spec.version)}</title>
<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
<link rel="stylesheet" href="../ui/tokens.css">
<link rel="stylesheet" href="../ui/components.css">
<script type="module" src="../ui/fundament.js"></script>
<style>
  body { margin: 0; background: var(--${P}-color-bg-canvas); color: var(--${P}-color-text-primary); font: var(--${P}-text-body-md); }
  .layout { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr); gap: var(--${P}-space-2xl); max-width: 1180px; margin: 0 auto; padding: var(--${P}-space-2xl) var(--${P}-space-lg); }
  nav { position: sticky; top: var(--${P}-space-lg); align-self: start; display: flex; flex-direction: column; gap: var(--${P}-space-xs); font: var(--${P}-text-body-sm); }
  nav strong { margin-top: var(--${P}-space-md); font: var(--${P}-text-label-md); }
  main { display: flex; flex-direction: column; gap: var(--${P}-space-3xl); min-width: 0; }
  h1 { font: var(--${P}-text-display); margin: 0; } h2 { font: var(--${P}-text-heading-lg); margin: 0; } h3 { font: var(--${P}-text-label-md); margin: var(--${P}-space-lg) 0 var(--${P}-space-xs); }
  p, ul { margin: 0; } ul { padding-left: var(--${P}-space-xl); } li { margin-bottom: var(--${P}-space-xs); }
  .lead { color: var(--${P}-color-text-secondary); margin-top: var(--${P}-space-xs); }
  .meta { font: var(--${P}-text-caption); color: var(--${P}-color-text-secondary); }
  .note { margin-top: var(--${P}-space-sm); color: var(--${P}-color-feedback-warning-fg); }
  .doc { padding: var(--${P}-space-xl); border: var(--${P}-border-width-default) solid var(--${P}-color-border-default); border-radius: var(--${P}-radius-lg); background: var(--${P}-color-bg-surface); }
  .stage { display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--${P}-space-lg); margin-top: var(--${P}-space-lg); padding: var(--${P}-space-lg); border-radius: var(--${P}-radius-md); background: var(--${P}-color-bg-canvas); }
  .cell { min-width: 0; max-width: var(--${P}-size-panel); }
  pre { margin: var(--${P}-space-sm) 0 0; padding: var(--${P}-space-md); border-radius: var(--${P}-radius-md); background: var(--${P}-color-bg-subtle); font: var(--${P}-text-body-sm); white-space: pre-wrap; overflow-wrap: anywhere; }
  code { font: var(--${P}-text-body-sm); overflow-wrap: anywhere; }
  .scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font: var(--${P}-text-body-sm); }
  th, td { text-align: left; vertical-align: top; padding: var(--${P}-space-sm); border-bottom: var(--${P}-border-width-default) solid var(--${P}-color-border-default); }
  th { font: var(--${P}-text-label-md); }
  .sw { display: inline-block; width: var(--${P}-size-touch-target); height: var(--${P}-space-xl); border: var(--${P}-border-width-default) solid var(--${P}-color-border-default); border-radius: var(--${P}-radius-sm); }
  .bar { display: inline-block; height: var(--${P}-space-md); background: var(--${P}-color-action-primary); }
  .dodont { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--${P}-space-lg); }
  @media (max-width: 760px) { .layout { grid-template-columns: minmax(0, 1fr); } nav { position: static; flex-direction: row; flex-wrap: wrap; gap: var(--${P}-space-sm); } nav strong { width: 100%; } }
</style>
</head>
<body>
<div class="layout">
<nav aria-label="Inhalt"><strong>Grundlagen</strong>${[['start', 'Start'], ['grundsaetze', 'Grundsätze'], ['farben', 'Farben'], ['masse', 'Maße'], ['typo', 'Typografie'], ['kontrast', 'Kontrast']].map(([h, l]) => `<${P}-link href="#${h}" label="${l}"></${P}-link>`).join('')}<strong>Komponenten</strong>${spec.components.map((c) => `<${P}-link href="#${kebab(c.name)}" label="${e(c.name)}"></${P}-link>`).join('')}</nav>
<main>
<section id="start"><h1>${e(spec.name)} Design System</h1><p class="lead">Version ${e(spec.version)}. Diese Seite ist aus specs/system.json erzeugt und zeigt die echten Web Components aus ${e(spec.codePackage)}.</p>
<h3>Einbinden</h3><pre>${e(`<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components.css">\n<script type="module" src="fundament.js"></script>`)}</pre>
<h3>Changelog</h3><ul>${(spec.changelog || []).map((x) => `<li><strong>${e(x.version)}</strong> ${e(x.text)}</li>`).join('')}</ul></section>
<section class="doc" id="grundsaetze"><h2>Grundsätze</h2><ul>${(spec.principles || []).map((r) => `<li><strong>${e(r.text)}</strong> ${e(r.why)} <span class="meta">${e(r.id)} / automatisch geprüft</span></li>`).join('')}</ul><p class="lead">Weitere Grundsätze für Urteilsfragen stehen in DESIGN.md.</p></section>
<section class="doc" id="farben"><h2>Farben</h2><div class="scroll"><table><thead><tr><th>Muster</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${tokenRows('color', spec.semantic.color, (n) => `<span class="sw" style="background: var(--${P}-color-${kebab(n)})"></span>`)}</tbody></table></div></section>
<section class="doc" id="masse"><h2>Maße</h2><div class="scroll"><table><thead><tr><th>Muster</th><th>Token</th><th>Einsatz</th></tr></thead><tbody>${FLOAT_GROUPS.map((g) => tokenRows(g, spec.semantic[g], (n, t) => g === 'space' ? `<span class="bar" style="width: var(--${P}-space-${n})"></span> ${t.value} px` : `${t.value} px`)).join('')}</tbody></table></div></section>
<section class="doc" id="typo"><h2>Typografie</h2>${spec.textStyles.map((t) => `<p style="font: var(--${P}-text-${kebab(t.name)})">${e(t.name)} / ${t.size}/${t.line} ${e(t.weight)}</p><p class="meta">${e(t.why)} <code>--${P}-text-${kebab(t.name)}</code></p>`).join('')}</section>
<section class="doc" id="kontrast"><h2>Kontrast</h2><p class="lead">Geprüfte Paare. Nur diese Paarungen sind zugesagt; der Build bricht ab, wenn eines durchfällt.</p><div class="scroll"><table><thead><tr><th>Vordergrund</th><th>auf</th><th>light</th><th>dark</th><th>mindestens</th><th>wofür</th></tr></thead><tbody>${pairs.filter((p) => p.mode === 'light').map((p) => `<tr><td>${e(p.fg)}</td><td>${e(p.on)}</td><td>${p.ratio}</td><td>${pairs.find((d) => d.mode === 'dark' && d.fg === p.fg && d.on === p.on).ratio}</td><td>${p.min}</td><td>${e(p.why)}</td></tr>`).join('')}</tbody></table></div></section>
${spec.components.map(comp).join('\n')}
</main>
</div>
</body>
</html>
`;
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/index.html', page);
  console.log('gebaut: docs/index.html');
}
