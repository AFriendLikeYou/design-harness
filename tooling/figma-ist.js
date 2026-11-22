// In Figma ausführen (Plugin-Konsole oder figma-console-Bridge). Liefert dieselben Prüfsummen wie `node tooling/figma-soll.mjs`.
await figma.loadAllPagesAsync();
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); };
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const cols = await figma.variables.getLocalVariableCollectionsAsync(); const vars = await figma.variables.getLocalVariablesAsync(); const byId = Object.fromEntries(vars.map((v) => [v.id, v]));
const out = {}; const lines = {};
for (const col of cols) { const L = []; for (const v of vars.filter((x) => x.variableCollectionId === col.id)) { const vals = col.modes.map((m) => { const x = v.valuesByMode[m.modeId]; return x && x.type === 'VARIABLE_ALIAS' ? '>' + byId[x.id].name : v.resolvedType === 'COLOR' ? hex(x) : String(x); }).join(','); L.push(`${v.name}|${v.resolvedType}|${vals}|${[...v.scopes].sort().join('+')}|${(v.codeSyntax && v.codeSyntax.WEB) || '-'}|${v.description}|${v.hiddenFromPublishing ? 'hidden' : 'shown'}`); } lines[col.name] = L.sort(); out[col.name] = [L.length, hash(L.join('\n'))]; }
const ts = (await figma.getLocalTextStylesAsync()).map((s) => `${s.name}|${s.fontName.style}|${s.fontSize}|${s.lineHeight.value}|${s.description}|${byId[s.boundVariables.fontSize.id].name}|${byId[s.boundVariables.lineHeight.id].name}`).sort();
lines.textStyles = ts; out.textStyles = [ts.length, hash(ts.join('\n'))];
for (const n of figma.root.findAll((x) => x.type === 'COMPONENT_SET' || (x.type === 'COMPONENT' && x.parent.type === 'PAGE'))) {
  const props = Object.entries(n.componentPropertyDefinitions).map(([k, d]) => `${k.split('#')[0]}:${d.type === 'VARIANT' ? 'VARIANT(' + [...d.variantOptions].sort().join(',') + ')' : d.type}`).sort().join(';');
  out[n.name] = [hash(props), hash(n.description)]; lines[n.name] = [props, n.description];
}
return { out, lines: typeof WANT !== 'undefined' ? Object.fromEntries(WANT.map((k) => [k, lines[k]])) : undefined };
