// Baut aus specs/system.json: DTCG-Tokens, CSS-Tokens, Verträge, Komponenten-Markdown, llms.txt, Doku-Site, Leitfaden, Export-Plugin
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const HOME = new URL('.', import.meta.url).pathname; // gemeinsame Werkzeuge kommen immer aus dem Hauptprojekt
if (process.argv[2]) process.chdir(process.argv[2]);
const spec = JSON.parse(readFileSync('specs/system.json', 'utf8'));
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const FLOAT_GROUPS = ['space', 'radius', 'border-width', 'size'].filter((g) => spec.semantic[g]);

mkdirSync('generated/components', { recursive: true });

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
  ...spec.textStyles.map((t) => `  --${spec.cssPrefix}-text-${kebab(t.name)}: ${weights[t.weight]} ${t.size}px/${t.line}px ${spec.fontFamily || 'Inter, system-ui, sans-serif'};`),
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
  pairs.push({ fg: p.fg, on, mode, ratio: +r.toFixed(2), min: p.min, pass: r >= p.min, why: p.why, ...(p.accept && r < p.min ? { accepted: p.accept } : {}) });
}
writeFileSync('generated/contrast.json', JSON.stringify({ $comment: 'Generiert. Geprüfte Text/Fläche-Paare je Mode nach WCAG 2.x.', pairs }, null, 2) + '\n');
// Paare mit "accept" in der Spec sind bekannte, bewusst offene Verstöße: Sie werden gemeldet, brechen den Build aber nicht ab
const failed = pairs.filter((p) => !p.pass && !p.accepted); const known = pairs.filter((p) => p.accepted);
if (known.length) console.log('Kontrast: bekannte Verstöße:', known.map((p) => `${p.mode} ${p.fg} auf ${p.on} = ${p.ratio} (min ${p.min})`).join('; '));
console.log('Kontrast:', pairs.length, 'Paare geprüft,', failed.length, 'durchgefallen');
if (failed.length) { for (const f of failed) console.error(`  ${f.mode}: ${f.fg} auf ${f.on} = ${f.ratio} (mindestens ${f.min})`); process.exit(1); }

// 7) Web Components: Vertrag für die Elemente (ui/contract.generated.js) und Elementangaben in contracts.json
// Attribute, die ein Element an sein inneres natives Element durchreicht (Umsetzungsdetail des Pakets)
const PASSTHROUGH = { Link: ['href', 'target', 'rel'], Button: ['type', 'name', 'value'], TextField: ['name', 'type', 'autocomplete', 'inputmode', 'required'], Checkbox: ['name', 'value'], Switch: ['name'], SignInForm: [] };
for (const c of spec.components) {
  const k = contracts.components[c.name];
  k.element = `${spec.cssPrefix}-${kebab(c.name)}`;
  if (c.impl) k.impl = c.impl; // Umsetzung und Regeln einer anderen Komponente übernehmen (z. B. Toggle → Switch)
  k.attrs = Object.fromEntries(c.props.filter((p) => p.type !== 'instance').map((p) => [kebab(p.name), (p.type === 'variant' && !isBool(p)) || p.type === 'behavior' ? { type: 'enum', values: p.values, default: p.default } : p.type === 'variant' || p.type === 'boolean' ? { type: 'boolean', default: String(p.default) === 'true' } : { type: 'text', default: p.default }]));
  k.passthrough = PASSTHROUGH[c.impl || c.name] || [];
  k.slotNames = c.props.filter((p) => p.type === 'instance').map((p) => p.name);
}
writeFileSync('generated/contracts.json', JSON.stringify(contracts, null, 2) + '\n');
const elements = Object.fromEntries(Object.entries(contracts.components).map(([name, k]) => [k.element, { name, ...(k.impl ? { impl: k.impl } : {}), status: k.status, deprecated: k.deprecated, attrs: k.attrs, passthrough: k.passthrough, slots: k.slotNames }]));
writeFileSync('ui/contract.generated.js', `// Generiert aus specs/system.json – nicht von Hand bearbeiten.\nexport const VERSION = ${JSON.stringify(spec.version)};\nexport const PREFIX = ${JSON.stringify(spec.cssPrefix)};\nexport const ELEMENTS = ${JSON.stringify(elements, null, 2)};\n`);
writeFileSync('ui/package.json', JSON.stringify({ name: spec.codePackage, version: spec.version, description: `${spec.name} Design System als Web Components`, type: 'module', main: './fundament.js', exports: { '.': './fundament.js', './tokens.css': './tokens.css', './components.css': './components.css', './contract': './contract.generated.js' }, files: ['fundament.js', 'contract.generated.js', 'tokens.css', 'components.css'], sideEffects: true }, null, 2) + '\n');
console.log('gebaut: ui/contract.generated.js, ui/package.json,', Object.keys(elements).length, 'Elemente');

// 8) Doku-Site für Menschen (docs/index.html), vollständig aus der Spec; nutzt die echten Web Components
// Das Layout der Doku-Site nutzt die Rollen-Tokens von Fundament. Systeme mit anderem Token-Schema (z. B. die ZDS-Probe) bekommen keine.
if (!spec.semantic.color['bg/canvas']) console.log('übersprungen: docs/index.html (Token-Schema ohne bg/canvas)');
else {
  const { renderDocs } = await import(HOME + 'tooling/docs-site.mjs');
  let guide = null; try { guide = JSON.parse(readFileSync('specs/leitfaden.json', 'utf8')); } catch {}
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/index.html', renderDocs({ spec, pairs, usage, kebab, isBool, floatGroups: FLOAT_GROUPS, guide }));
  console.log('gebaut: docs/index.html');
}

// 9) Leitfaden als Markdown (LEITFADEN.md) aus specs/leitfaden.json; dieselbe Datei speist die Figma-Seite
try {
  const g = JSON.parse(readFileSync('specs/leitfaden.json', 'utf8')); const L = ['<!-- Generiert aus specs/leitfaden.json – nicht von Hand bearbeiten. -->', '# ' + g.title, '', g.intro, ''];
  for (const s of g.sections) { L.push('## ' + s.title, ''); if (s.intro) L.push(s.intro, ''); if (s.code) L.push('```json', s.code, '```', ''); for (const [t, x] of s.items || []) L.push(`- **${t}.** ${x}`); if (s.compare) { L.push('| So nicht | So |', '|---|---|'); for (const [a, c] of s.compare) L.push(`| ${a} | ${c} |`); } L.push(''); }
  writeFileSync('LEITFADEN.md', L.join('\n')); console.log('gebaut: LEITFADEN.md');
} catch (e) { if (e.code !== 'ENOENT') throw e; }

// 10) Export-Plugin für Designer aus tooling/figma-export.js (nur im Hauptprojekt)
if (!process.argv[2]) {
  const body = readFileSync('tooling/figma-export.js', 'utf8');
  const ui = '<style>body{font:12px Inter,sans-serif;margin:12px}textarea{width:100%;height:300px;font:11px monospace}button{margin-top:8px;padding:6px 12px}</style><p>Schnappschuss kopieren und im Repo als <b>specs/figma.snapshot.json</b> speichern. Danach <b>node tooling/figma-diff.mjs</b>.</p><textarea id="t" readonly>Lese Datei …</textarea><button id="c">Kopieren</button><script>onmessage=(e)=>{document.getElementById("t").value=e.data.pluginMessage};document.getElementById("c").onclick=()=>{const t=document.getElementById("t");t.select();document.execCommand("copy")}</script>';
  mkdirSync('plugin-export', { recursive: true });
  writeFileSync('plugin-export/code.js', `// Fundament Export – zeigt den Schnappschuss der Datei zum Kopieren. Erzeugt aus tooling/figma-export.js – nicht von Hand bearbeiten.\nfigma.showUI(${JSON.stringify(ui)}, { width: 420, height: 420 });\n(async () => {\n${body.replace(/^return /m, 'const snapshot = ')}\nfigma.ui.postMessage(JSON.stringify(snapshot, null, 1));\n})().catch((e) => figma.ui.postMessage('Fehler: ' + e.message));\n`);
}
