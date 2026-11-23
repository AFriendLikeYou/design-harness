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
// Die Markierung (Ebene check) ist bei der Checkbox ein gezeichneter Haken (Strich), beim Radio ein gefüllter Punkt.
// Aussehen je Variante: welche Variable an welcher Rolle hängt. Die Rollen folgen den Ebenennamen:
// Fläche und Rahmen = Ebene input, box oder track, sonst die Variante selbst; Text = value, label oder title; body/description; helperText/errorText; check; thumb; focusRing.
const inInstance = (n, top) => { let x = n.parent; while (x && x !== top) { if (x.type === 'INSTANCE') return true; x = x.parent; } return false; };
const bound = (paints) => { const p = Array.isArray(paints) ? paints.find((q) => q.type === 'SOLID' && q.visible !== false) : null; const id = p && p.boundVariables && p.boundVariables.color && p.boundVariables.color.id; return id && byId[id] ? byId[id].name.replace(/^color\//, '') : (p ? '(ohne Variable)' : null); };
const weight = (n) => { const b = n.boundVariables || {}; const id = (b.strokeWeight || b.strokeLeftWeight || {}).id; return id && byId[id] ? byId[id].name.replace(/^border-width\//, '') : '(ohne Variable)'; };
const look = (c) => { const find = (...names) => { for (const nm of names) { const n = c.findOne((x) => x.name === nm && x.type !== 'INSTANCE' && !inInstance(x, c)); if (n) return n; } return null; };
  const surface = find('input', 'box', 'track') || c; const r = {}; const set = (k, v) => { if (v) r[k] = v; };
  set('bg', bound(surface.fills)); if (surface.strokes && surface.strokes.length) { set('border', bound(surface.strokes)); set('borderWidth', weight(surface)); }
  const fg = find('value', 'label', 'title'); if (fg) set('fg', bound(fg.fills)); const body = find('body', 'description'); if (body) set('body', bound(body.fills));
  const helper = find('helperText', 'errorText'); if (helper) set('helper', bound(helper.fills)); const mark = find('check'); if (mark) set('mark', bound(mark.strokes) || bound(mark.fills)); const thumb = find('thumb'); if (thumb) set('thumb', bound(thumb.fills));
  const ring = find('focusRing'); if (ring) { set('ring', bound(ring.strokes)); set('ringWidth', weight(ring)); }
  return Object.fromEntries(Object.keys(r).sort().map((k) => [k, r[k]])); };
// Maße je Variante: welche Variable an Radius, Innenabstand und Lücke der Fläche hängt und welcher Textstil an der Beschriftung.
// Nur gebundene Werte zählen; die Fläche ist dieselbe Ebene wie beim Aussehen (input, box oder track, sonst die Variante selbst).
const styleName = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s.name]));
const dim = (node, prop) => { const b = node.boundVariables && node.boundVariables[prop]; return b && b.id && byId[b.id] ? byId[b.id].name : null; };
const measure = (c) => { const find = (...names) => { for (const nm of names) { const n = c.findOne((q) => q.name === nm && q.type !== 'INSTANCE' && !inInstance(q, c)); if (n) return n; } return null; };
  const surface = find('input', 'box', 'track') || c; const m = {}; const set = (k, v) => { if (v) m[k] = v; };
  set('radius', dim(surface, 'topLeftRadius'));
  if (surface.layoutMode && surface.layoutMode !== 'NONE') { set('padX', dim(surface, 'paddingLeft')); set('padY', dim(surface, 'paddingTop')); set('gap', dim(surface, 'itemSpacing')); }
  const fg = find('value', 'label', 'title'); if (fg && typeof fg.textStyleId === 'string' && styleName[fg.textStyleId]) set('textStyle', styleName[fg.textStyleId]);
  return m; };
const styles = [];
for (const n of figma.root.findAll((x) => x.type === 'COMPONENT_SET' || (x.type === 'COMPONENT' && x.parent.type === 'PAGE')).filter((x) => !OPT.skip.some((p) => x.name.startsWith(p)))) { if (n.type === 'COMPONENT_SET') for (const v of n.children) styles.push([n.name, v.name, look(v), measure(v)]); else styles.push([n.name, '', look(n), measure(n)]); }
styles.sort((p, q) => (p[0] + '|' + p[1]).localeCompare(q[0] + '|' + q[1]));
variables.sort((p, q) => (p[0] + p[1]).localeCompare(q[0] + q[1])); textStyles.sort((p, q) => p[0].localeCompare(q[0]));
return { schema: 2, file: figma.root.name, fileKey: figma.fileKey || '', exportedAt: new Date().toISOString().slice(0, 10), variables, textStyles, components, styles };
