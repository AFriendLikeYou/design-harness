// Liest den Stand der Figma-Datei als Schnappschuss aus: Variablen, Text-Styles, Komponenten mit Properties.
// Läuft in Figma: über das Plugin „Fundament Export“ (plugin-export/) oder die figma-console-Bridge.
// OPT.collections: nur diese Sammlungen; OPT.skip: Komponenten, deren Name so beginnt, auslassen.
const OPT = typeof EXPORT_OPTIONS !== 'undefined' ? EXPORT_OPTIONS : { collections: ['primitives', 'semantic'], skip: ['ZDS '] };
await figma.loadAllPagesAsync();
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const cols = (await figma.variables.getLocalVariableCollectionsAsync()).filter((c) => OPT.collections.includes(c.name));
const all = await figma.variables.getLocalVariablesAsync(); const byId = Object.fromEntries(all.map((v) => [v.id, v]));
const variables = [];
for (const col of cols) for (const v of all.filter((x) => x.variableCollectionId === col.id)) {
  const values = {}; for (const m of col.modes) { const x = v.valuesByMode[m.modeId]; values[m.name] = x && x.type === 'VARIABLE_ALIAS' ? '>' + byId[x.id].name : v.resolvedType === 'COLOR' ? hex(x) : x; }
  variables.push([col.name, v.name, v.resolvedType, values, [...v.scopes].sort(), (v.codeSyntax && v.codeSyntax.WEB) || '', v.description, v.hiddenFromPublishing ? 1 : 0]);
}
const textStyles = (await figma.getLocalTextStylesAsync()).filter((s) => !OPT.skip.some((p) => s.name.startsWith(p.trim().toLowerCase() + '/'))).map((s) => [s.name, s.fontName.style, s.fontSize, s.lineHeight.value, s.description]);
const components = figma.root.findAll((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type === 'PAGE')).filter((n) => !OPT.skip.some((p) => n.name.startsWith(p))).map((n) => [n.name,
  Object.entries(n.componentPropertyDefinitions).map(([k, d]) => [k.split('#')[0], d.type, d.type === 'VARIANT' ? [...d.variantOptions].sort() : d.type === 'INSTANCE_SWAP' ? '' : d.defaultValue, d.type === 'VARIANT' ? d.defaultValue : '']).sort((p, q) => p[0].localeCompare(q[0])), n.description]).sort((p, q) => p[0].localeCompare(q[0]));
variables.sort((p, q) => (p[0] + p[1]).localeCompare(q[0] + q[1])); textStyles.sort((p, q) => p[0].localeCompare(q[0]));
return { schema: 1, file: figma.root.name, fileKey: figma.fileKey || '', exportedAt: new Date().toISOString().slice(0, 10), variables, textStyles, components };
