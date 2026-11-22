// Fundament DS Generator – erzeugt ein beispielhaftes, agententaugliches Designsystem.
// Generiert aus specs/system.json. Nicht von Hand bearbeiten, sondern Spec ändern und neu bauen.
// Regeln dieses Generators: Knoten entstehen direkt auf ihrer Zielseite. Keine Rohwerte:
// Farben über semantische Variablen, Abstände/Radien/Rahmenstärken/Größen gebunden, Text über Text-Styles.
const SPEC = __SPEC__;

const P = SPEC.cssPrefix;
const log = [];
const warn = (m) => { log.push(m); console.warn(m); };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const hex = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const tryDo = (label, fn) => { try { return fn(); } catch (e) { warn(`${label}: ${e.message}`); } };
const specOf = (name) => SPEC.components.find((c) => c.name === name);
// Aussehen je Variante/Zustand kommt aus der Spec (components[].styles)
const style = (comp, key) => (specOf(comp).styles || {})[key] || {};

// ---------- Variablen ----------
const V = {}; // Name → Variable (semantische überschreiben gleichnamige nicht: eigene Präfixe)
let semCol, lightMode, darkMode;

function makeVar(name, col, type, scopes, desc, cssName) {
  const v = figma.variables.createVariable(name, col, type);
  v.scopes = scopes;
  if (desc) v.description = desc;
  if (cssName) tryDo(`Code-Syntax ${name}`, () => v.setVariableCodeSyntax('WEB', `var(--${P}-${cssName})`));
  V[name] = v;
  return v;
}

function buildVariables() {
  const prim = figma.variables.createVariableCollection('primitives');
  const pm = prim.modes[0].modeId;
  prim.renameMode(pm, 'value');
  for (const [hue, stops] of Object.entries(SPEC.primitives.color)) {
    for (const [stop, value] of Object.entries(stops)) {
      const v = makeVar(`color/${hue}/${stop}`, prim, 'COLOR', [], 'Primitiv. Nicht direkt verwenden.', null);
      v.hiddenFromPublishing = true;
      v.setValueForMode(pm, hex(value));
    }
  }
  for (const d of SPEC.primitives.dimension) {
    const v = makeVar(`dimension/${d}`, prim, 'FLOAT', [], 'Primitiv. Nicht direkt verwenden.', null);
    v.hiddenFromPublishing = true;
    v.setValueForMode(pm, d);
  }
  for (const s of SPEC.primitives.fontSize) makeVar(`font-size/${s}`, prim, 'FLOAT', ['FONT_SIZE'], 'Schriftgröße, gebunden in Text-Styles.', `font-size-${s}`).setValueForMode(pm, s);
  for (const l of SPEC.primitives.lineHeight) makeVar(`line-height/${l}`, prim, 'FLOAT', ['LINE_HEIGHT'], 'Zeilenhöhe, gebunden in Text-Styles.', `line-height-${l}`).setValueForMode(pm, l);

  semCol = figma.variables.createVariableCollection('semantic');
  lightMode = semCol.modes[0].modeId;
  semCol.renameMode(lightMode, 'light');
  darkMode = tryDo('Dark Mode (Tarif erlaubt evtl. nur einen Mode)', () => semCol.addMode('dark')) || null;

  for (const [name, t] of Object.entries(SPEC.semantic.color)) {
    const v = makeVar(`color/${name}`, semCol, 'COLOR', t.scopes, t.why, `color-${kebab(name)}`);
    v.setValueForMode(lightMode, figma.variables.createVariableAlias(V[`color/${t.light}`]));
    if (darkMode) v.setValueForMode(darkMode, figma.variables.createVariableAlias(V[`color/${t.dark}`]));
  }
  const floatGroup = (group, scopes) => {
    for (const [name, t] of Object.entries(SPEC.semantic[group] || {})) {
      const v = makeVar(`${group}/${name}`, semCol, 'FLOAT', scopes, t.why, `${group}-${name}`);
      const prim = V[`dimension/${t.value}`];
      const val = prim ? figma.variables.createVariableAlias(prim) : t.value;
      v.setValueForMode(lightMode, val);
      if (darkMode) v.setValueForMode(darkMode, val);
    }
  };
  floatGroup('space', ['GAP']);
  floatGroup('radius', ['CORNER_RADIUS']);
  floatGroup('border-width', ['STROKE_FLOAT']);
  floatGroup('size', ['WIDTH_HEIGHT']);
}

// ---------- Text-Styles ----------
const TS = {};
async function buildTextStyles() {
  for (const st of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
  for (const t of SPEC.textStyles) {
    const s = figma.createTextStyle();
    s.name = t.name;
    s.fontName = { family: 'Inter', style: t.weight };
    s.fontSize = t.size;
    s.lineHeight = { unit: 'PIXELS', value: t.line };
    s.description = `${t.why} Code: var(--${P}-text-${kebab(t.name)})`;
    tryDo(`Bindung fontSize ${t.name}`, () => s.setBoundVariable('fontSize', V[`font-size/${t.size}`]));
    tryDo(`Bindung lineHeight ${t.name}`, () => s.setBoundVariable('lineHeight', V[`line-height/${t.line}`]));
    TS[t.name] = s;
  }
}

// ---------- Bau-Helfer ----------
const paint = (varName) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[`color/${varName}`]);
const bind = (node, field, varName) => { if (!V[varName]) { warn(`Variable fehlt: ${varName}`); return; } tryDo(`Bindung ${field}`, () => node.setBoundVariable(field, V[varName])); };
function pad(node, x, y) {
  bind(node, 'paddingLeft', `space/${x}`); bind(node, 'paddingRight', `space/${x}`);
  bind(node, 'paddingTop', `space/${y}`); bind(node, 'paddingBottom', `space/${y}`);
}
function radius(node, r) { for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) bind(node, c, `radius/${r}`); }
function stroke(node, color, width = 'default') { node.strokes = [paint(color)]; node.strokeAlign = 'INSIDE'; bind(node, 'strokeWeight', `border-width/${width}`); }
function stack(node, dir, gap) {
  node.layoutMode = dir;
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'AUTO';
  if (gap) bind(node, 'itemSpacing', `space/${gap}`);
  return node;
}
function frame(name, dir, gap) { const f = figma.createFrame(); f.name = name; f.fills = []; return stack(f, dir, gap); }
function fixedWidth(node, w, sizeToken) { node.resize(w, 100); node.counterAxisSizingMode = 'FIXED'; node.primaryAxisSizingMode = 'AUTO'; if (sizeToken) bind(node, 'width', `size/${sizeToken}`); }
// Hilfstext unter Checkbox und Switch, eingerückt um die Breite des Bedienelements
async function helperRow(parent, chars, color, indentToken) {
  const row = frame('helper', 'HORIZONTAL', 'sm');
  const indent = frame('indent', 'HORIZONTAL'); indent.resize(20, 1); indent.primaryAxisSizingMode = 'FIXED'; indent.counterAxisSizingMode = 'FIXED'; bind(indent, 'width', `size/${indentToken}`);
  row.appendChild(indent); row.appendChild(await text(chars, 'body/sm', color, 'helperText'));
  parent.appendChild(row); return row;
}
async function text(chars, textStyle, color, name) {
  const t = figma.createText();
  t.name = name || 'text';
  t.fontName = { family: 'Inter', style: 'Regular' };
  t.characters = chars;
  await t.setTextStyleIdAsync(TS[textStyle].id);
  t.fills = [paint(color || 'text/primary')];
  return t;
}
function fill(child) { tryDo('Füllbreite', () => { child.layoutSizingHorizontal = 'FILL'; }); }
function description(c) {
  const lines = [`Status: ${c.status} · v${c.version}`, c.purpose];
  if (c.rules.length) lines.push(`Regeln: ${c.rules.map((r) => `${r.text} [${r.id}]`).join(' ')}`);
  lines.push(`A11y: ${c.a11y}`);
  lines.push(`Spec: ds/${kebab(c.name)}`);
  if (c.status !== 'deprecated') lines.push(`Code: <${P}-${kebab(c.name)}> aus "${SPEC.codePackage}"`);
  return lines.join('\n');
}
function annotate(node, label) { tryDo('Annotation', () => { node.annotations = [{ label }]; }); }
// Fokusring: eigene Ebene mit 2 px Abstand, damit er nicht in die Fläche ragt
function focusRing(parent, r, st) {
  parent.clipsContent = false;
  const f = figma.createFrame(); f.name = 'focusRing'; f.fills = [];
  parent.appendChild(f);
  stroke(f, st.ring, st.ringWidth);
  f.layoutPositioning = 'ABSOLUTE'; f.x = -4; f.y = -4; f.resize(parent.width + 8, parent.height + 8);
  f.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  radius(f, r);
  return f;
}
async function goTo(name) { const p = figma.root.children.find((x) => x.name === name); await figma.setCurrentPageAsync(p); return p; }
function newComponent(page, name) { const c = figma.createComponent(); page.appendChild(c); c.name = name; return c; }
const propKey = (node, name) => Object.keys(node.componentPropertyDefinitions).find((k) => k.split('#')[0] === name);

async function finishSet(comps, page, name, width, textProps = {}, boolProps = {}) {
  const set = figma.combineAsVariants(comps, page);
  set.name = name;
  stack(set, 'HORIZONTAL', 'xl');
  set.layoutWrap = 'WRAP';
  set.primaryAxisSizingMode = 'FIXED';
  set.resize(width, set.height);
  set.counterAxisSizingMode = 'AUTO';
  set.counterAxisAlignItems = 'CENTER';
  set.clipsContent = false;
  bind(set, 'counterAxisSpacing', 'space/xl');
  pad(set, 'xl', 'xl');
  radius(set, 'md');
  set.fills = [paint('bg/canvas')];
  stroke(set, 'border/default');
  set.dashPattern = [6, 4];
  const keys = {};
  for (const [prop, def] of Object.entries(textProps)) {
    keys[prop] = set.addComponentProperty(prop, 'TEXT', def);
    for (const c of set.children) { const n = c.findOne((x) => x.type === 'TEXT' && x.name === prop); if (n) n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { characters: keys[prop] }); }
  }
  for (const [prop, def] of Object.entries(boolProps)) {
    keys[prop] = set.addComponentProperty(prop, 'BOOLEAN', def.value);
    for (const c of set.children) { const n = c.findOne((x) => x.name === def.layer); if (n) n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { visible: keys[prop] }); }
  }
  set.description = description(specOf(name));
  set.x = 0; set.y = 0;
  return { set, keys };
}

// ---------- Komponenten ----------
const C = {};

async function buildButton(page) {
  const comps = [];
  const variants = specOf('Button').props.find((p) => p.name === 'variant').values;
  // Hover und Fokus gibt es nur für disabled=false
  const cells = [['false', 'default'], ['false', 'hover'], ['false', 'focus'], ['true', 'default']];
  for (const variant of variants) for (const size of ['md', 'sm']) for (const [disabled, state] of cells) {
    const c = newComponent(page, `variant=${variant}, size=${size}, disabled=${disabled}, state=${state}`);
    stack(c, 'HORIZONTAL', 'xs');
    c.primaryAxisAlignItems = 'CENTER'; c.counterAxisAlignItems = 'CENTER';
    pad(c, size === 'md' ? 'lg' : 'md', size === 'md' ? 'sm' : 'xs');
    radius(c, 'md');
    const base = style('Button', `variant=${variant}`);
    const hover = style('Button', `variant=${variant}, state=hover`);
    const off = style('Button', 'disabled=true');
    const isOff = disabled === 'true';
    const bg = isOff ? (base.bg ? off.bg : null) : (state === 'hover' ? hover.bg : base.bg);
    c.fills = bg ? [paint(bg)] : [];
    if (base.border && !isOff) stroke(c, base.border, base.borderWidth);
    c.appendChild(await text('Speichern', size === 'md' ? 'label/md' : 'label/sm', isOff ? off.fg : base.fg, 'label'));
    if (state === 'focus') focusRing(c, 'lg', style('Button', 'state=focus'));
    comps.push(c);
  }
  C.Button = await finishSet(comps, page, 'Button', 1000, { label: 'Speichern' });
  annotate(C.Button.set.children[0], 'Hover und Fokus sind eigene Varianten (state). Im Code entstehen sie über :hover und :focus-visible, nicht über ein Prop.');
}

async function buildTextField(page) {
  const comps = [];
  const def = style('TextField', 'state=default');
  for (const state of ['default', 'focus', 'error', 'disabled']) {
    const st = Object.assign({}, def, style('TextField', `state=${state}`));
    const c = newComponent(page, `state=${state}`);
    stack(c, 'VERTICAL', 'xs');
    fixedWidth(c, 320, 'field');
    c.clipsContent = false;
    const lab = await text('E-Mail-Adresse', 'label/md', state === 'disabled' ? st.fg : def.fg, 'label');
    c.appendChild(lab); fill(lab);
    const box = frame('input', 'HORIZONTAL', 'xs');
    box.counterAxisAlignItems = 'CENTER';
    pad(box, 'md', 'sm'); radius(box, 'md');
    box.fills = [paint(st.bg)];
    stroke(box, st.border, st.borderWidth);
    const val = await text('name@beispiel.de', 'body/md', st.fg, 'value');
    box.appendChild(val); val.layoutGrow = 1;
    c.appendChild(box); fill(box);
    const isError = state === 'error';
    const help = await text(isError ? 'Bitte gib eine gültige E-Mail-Adresse ein.' : 'Wir senden dir einen Bestätigungslink.', 'body/sm', st.helper, isError ? 'errorText' : 'helperText');
    c.appendChild(help); fill(help);
    if (state === 'focus') focusRing(box, 'lg', st);
    if (isError) annotate(c, 'Fehlertext per aria-describedby verknüpfen, Feld mit aria-invalid="true" markieren.');
    comps.push(c);
  }
  const r = await finishSet(comps, page, 'TextField', 1440,
    { label: 'E-Mail-Adresse', value: 'name@beispiel.de', helperText: 'Wir senden dir einen Bestätigungslink.', errorText: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
    { showHelper: { value: true, layer: 'helperText' } });
  // Slot trailing: Button ghost/sm, ausgeblendet bis showTrailing
  const ghost = C.Button.set.children.find((x) => x.name === 'variant=ghost, size=sm, disabled=false, state=default');
  r.keys.showTrailing = r.set.addComponentProperty('showTrailing', 'BOOLEAN', false);
  r.keys.trailing = r.set.addComponentProperty('trailing', 'INSTANCE_SWAP', ghost.id);
  for (const c of r.set.children) {
    const box = c.findOne((n) => n.name === 'input');
    const t = ghost.createInstance(); t.name = 'trailing';
    const ring = box.findOne((n) => n.name === 'focusRing');
    if (ring) box.insertChild(box.children.indexOf(ring), t); else box.appendChild(t);
    tryDo('Slot-Beschriftung', () => t.setProperties({ [C.Button.keys.label]: 'Anzeigen' }));
    t.componentPropertyReferences = { visible: r.keys.showTrailing, mainComponent: r.keys.trailing };
  }
  C.TextField = r;
}

async function buildCheckbox(page) {
  const comps = [];
  const cells = [['false', 'false', 'default'], ['false', 'true', 'default'], ['true', 'false', 'default'], ['true', 'true', 'default'], ['false', 'false', 'focus'], ['true', 'false', 'focus']];
  const un = style('Checkbox', 'checked=false'), on = style('Checkbox', 'checked=true'), off = style('Checkbox', 'disabled=true');
  for (const [checked, disabled, state] of cells) {
    const c = newComponent(page, `checked=${checked}, disabled=${disabled}, state=${state}`);
    stack(c, 'VERTICAL', '2xs'); c.clipsContent = false;
    const ctl = frame('control', 'HORIZONTAL', 'sm'); ctl.counterAxisAlignItems = 'CENTER'; ctl.clipsContent = false; c.appendChild(ctl);
    const box = figma.createFrame(); box.name = 'box';
    box.layoutMode = 'HORIZONTAL'; box.primaryAxisAlignItems = 'CENTER'; box.counterAxisAlignItems = 'CENTER';
    box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED'; box.resize(20, 20);
    bind(box, 'width', 'size/checkbox'); bind(box, 'height', 'size/checkbox');
    radius(box, 'sm');
    const isOff = disabled === 'true', isOn = checked === 'true';
    box.fills = [paint(isOff ? off.bg : (isOn ? on.bg : un.bg))];
    if (!isOn) stroke(box, un.border, un.borderWidth);
    if (isOn) {
      const v = figma.createVector(); v.name = 'check';
      tryDo('Haken', () => { v.vectorPaths = [{ windingRule: 'NONE', data: 'M 0 4 L 3.5 7.5 L 10 1' }]; });
      v.fills = []; v.strokes = [paint(isOff ? off.mark : on.mark)]; v.strokeCap = 'ROUND'; v.strokeJoin = 'ROUND';
      box.appendChild(v); bind(v, 'strokeWeight', 'border-width/strong');
    }
    ctl.appendChild(box);
    ctl.appendChild(await text('Angemeldet bleiben', 'body/md', isOff ? off.fg : un.fg, 'label'));
    await helperRow(c, 'Du kannst das später ändern.', un.helper, 'checkbox');
    if (state === 'focus') focusRing(box, 'md', style('Checkbox', 'state=focus'));
    comps.push(c);
  }
  C.Checkbox = await finishSet(comps, page, 'Checkbox', 848, { label: 'Angemeldet bleiben', helperText: 'Du kannst das später ändern.' }, { showHelper: { value: false, layer: 'helper' } });
}

async function buildSwitch(page) {
  const comps = [];
  const cells = [['false', 'false', 'default'], ['false', 'true', 'default'], ['true', 'false', 'default'], ['true', 'true', 'default'], ['false', 'false', 'focus'], ['true', 'false', 'focus']];
  const un = style('Switch', 'checked=false'), on = style('Switch', 'checked=true'), off = style('Switch', 'disabled=true');
  for (const [checked, disabled, state] of cells) {
    const c = newComponent(page, `checked=${checked}, disabled=${disabled}, state=${state}`);
    stack(c, 'VERTICAL', '2xs'); c.clipsContent = false;
    const ctl = frame('control', 'HORIZONTAL', 'sm'); ctl.counterAxisAlignItems = 'CENTER'; ctl.clipsContent = false; c.appendChild(ctl);
    const isOff = disabled === 'true', isOn = checked === 'true';
    const track = figma.createFrame(); track.name = 'track';
    track.layoutMode = 'HORIZONTAL'; track.primaryAxisSizingMode = 'FIXED'; track.counterAxisSizingMode = 'FIXED'; track.resize(36, 20);
    track.counterAxisAlignItems = 'CENTER'; track.primaryAxisAlignItems = isOn ? 'MAX' : 'MIN';
    bind(track, 'width', 'size/switch-width'); bind(track, 'height', 'size/checkbox'); pad(track, '2xs', '2xs'); radius(track, 'full');
    track.fills = [paint(isOff ? off.bg : (isOn ? on.bg : un.bg))];
    const thumb = figma.createFrame(); thumb.name = 'thumb'; thumb.resize(16, 16); thumb.fills = [paint(isOff ? off.thumb : un.thumb)]; radius(thumb, 'full');
    track.appendChild(thumb); bind(thumb, 'width', 'size/switch-thumb'); bind(thumb, 'height', 'size/switch-thumb');
    ctl.appendChild(track);
    ctl.appendChild(await text('E-Mail-Benachrichtigungen', 'body/md', isOff ? off.fg : un.fg, 'label'));
    await helperRow(c, 'Wir schreiben dir höchstens einmal pro Woche.', un.helper, 'switch-width');
    if (state === 'focus') focusRing(track, 'full', style('Switch', 'state=focus'));
    comps.push(c);
  }
  C.Switch = await finishSet(comps, page, 'Switch', 1000, { label: 'E-Mail-Benachrichtigungen', helperText: 'Wir schreiben dir höchstens einmal pro Woche.' }, { showHelper: { value: false, layer: 'helper' } });
}

async function buildBadge(page) {
  const comps = [];
  for (const tone of specOf('Badge').props[0].values) {
    const st = style('Badge', `tone=${tone}`);
    const c = newComponent(page, `tone=${tone}`);
    stack(c, 'HORIZONTAL'); pad(c, 'sm', '2xs'); radius(c, 'full');
    c.fills = [paint(st.bg)];
    c.appendChild(await text('Neu', 'label/sm', st.fg, 'label'));
    comps.push(c);
  }
  C.Badge = await finishSet(comps, page, 'Badge', 760, { label: 'Neu' });
}

async function buildAlert(page) {
  const comps = [];
  for (const tone of specOf('Alert').props[0].values) {
    const st = style('Alert', `tone=${tone}`);
    const c = newComponent(page, `tone=${tone}`);
    stack(c, 'VERTICAL', 'xs'); fixedWidth(c, 360, 'panel');
    pad(c, 'lg', 'md'); radius(c, 'lg');
    c.fills = [paint(st.bg)];
    c.strokes = [paint(st.border)]; c.strokeAlign = 'INSIDE';
    tryDo('Randstärken', () => { c.strokeTopWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 0; c.strokeLeftWeight = 4; });
    bind(c, 'strokeLeftWeight', `border-width/${st.borderWidth}`);
    const t = await text('Änderungen gespeichert', 'label/md', st.fg, 'title'); c.appendChild(t); fill(t);
    const d = await text('Deine Einstellungen gelten ab sofort.', 'body/sm', st.body, 'description'); c.appendChild(d); fill(d);
    comps.push(c);
  }
  C.Alert = await finishSet(comps, page, 'Alert', 808, { title: 'Änderungen gespeichert', description: 'Deine Einstellungen gelten ab sofort.' });
}

function surface(c, comp) { const st = style(comp, 'default'); c.fills = [paint(st.bg)]; stroke(c, st.border, st.borderWidth); return st; }

async function buildCard(page) {
  const c = newComponent(page, 'Card');
  stack(c, 'VERTICAL', 'sm'); fixedWidth(c, 320, 'field');
  pad(c, 'xl', 'xl'); radius(c, 'lg');
  const st = surface(c, 'Card');
  const header = frame('header', 'HORIZONTAL', 'sm'); header.counterAxisAlignItems = 'CENTER'; c.appendChild(header); fill(header);
  const t = await text('Kartentitel', 'heading/md', st.fg, 'title'); header.appendChild(t); fill(t);
  const badge = C.Badge.set.defaultVariant.createInstance(); badge.name = 'badge'; header.appendChild(badge);
  const b = await text('Kurze Beschreibung des Inhalts in ein bis zwei Sätzen.', 'body/md', st.body, 'body'); c.appendChild(b); fill(b);
  const footer = frame('footer', 'HORIZONTAL', 'sm'); bind(footer, 'paddingTop', 'space/sm');
  const btnDefault = C.Button.set.defaultVariant;
  const btn = btnDefault.createInstance(); btn.name = 'action';
  footer.appendChild(btn); c.appendChild(footer);
  const keys = {};
  keys.title = c.addComponentProperty('title', 'TEXT', 'Kartentitel'); t.componentPropertyReferences = { characters: keys.title };
  keys.body = c.addComponentProperty('body', 'TEXT', 'Kurze Beschreibung des Inhalts in ein bis zwei Sätzen.'); b.componentPropertyReferences = { characters: keys.body };
  keys.showFooter = c.addComponentProperty('showFooter', 'BOOLEAN', true); footer.componentPropertyReferences = { visible: keys.showFooter };
  keys.showBadge = c.addComponentProperty('showBadge', 'BOOLEAN', false);
  tryDo('Instance-Swap badge', () => { keys.badge = c.addComponentProperty('badge', 'INSTANCE_SWAP', C.Badge.set.defaultVariant.id); badge.componentPropertyReferences = { visible: keys.showBadge, mainComponent: keys.badge }; });
  tryDo('Instance-Swap action', () => { keys.action = c.addComponentProperty('action', 'INSTANCE_SWAP', btnDefault.id); btn.componentPropertyReferences = { mainComponent: keys.action }; });
  c.description = description(specOf('Card'));
  c.x = 0; c.y = 0;
  C.Card = { set: c, keys };
}

async function buildLink(page) {
  const comps = [];
  for (const state of specOf('Link').props[0].values) {
    const st = Object.assign({}, style('Link', 'state=default'), style('Link', `state=${state}`));
    const c = newComponent(page, `state=${state}`);
    stack(c, 'HORIZONTAL'); radius(c, 'sm'); c.clipsContent = false;
    const t = await text('Alle Rechnungen ansehen', 'body/md', st.fg, 'label'); t.textDecoration = 'UNDERLINE'; c.appendChild(t);
    if (state === 'focus') focusRing(c, 'md', st);
    comps.push(c);
  }
  C.Link = await finishSet(comps, page, 'Link', 760, { label: 'Alle Rechnungen ansehen' });
}

function inst(name, props = {}) {
  const ref = C[name];
  const node = ref.set.type === 'COMPONENT_SET' ? ref.set.defaultVariant.createInstance() : ref.set.createInstance();
  const mapped = {};
  for (const [k, v] of Object.entries(props)) mapped[propKey(ref.set, k) || k] = v;
  tryDo(`Props ${name}`, () => node.setProperties(mapped));
  return node;
}

async function buildSignInForm(page) {
  const c = newComponent(page, 'SignInForm');
  stack(c, 'VERTICAL', 'lg'); fixedWidth(c, 360, 'panel');
  pad(c, 'xl', 'xl'); radius(c, 'lg');
  const st = surface(c, 'SignInForm');
  const h = await text('Anmelden', 'heading/lg', st.fg, 'title'); c.appendChild(h); fill(h);
  const email = inst('TextField', { label: 'E-Mail-Adresse', showHelper: false }); email.name = 'email'; c.appendChild(email); fill(email);
  const pw = inst('TextField', { label: 'Passwort', value: '••••••••', helperText: 'Mindestens 12 Zeichen.', showTrailing: true }); pw.name = 'password'; c.appendChild(pw); fill(pw);
  const cb = inst('Checkbox'); cb.name = 'remember'; c.appendChild(cb);
  const btn = inst('Button', { label: 'Anmelden' }); btn.name = 'submit'; c.appendChild(btn); fill(btn);
  c.description = description(specOf('SignInForm'));
  c.x = 0; c.y = 0;
  C.SignInForm = { set: c, keys: {} };
}

// Muster ConfirmAction: nur aus Instanzen; die Texte (word, fieldLabel, actionLabel) sind Props im Code
async function buildConfirmAction(page, y) {
  const spec = specOf('ConfirmAction'); const d = Object.fromEntries(spec.props.map((x) => [x.name, x.default]));
  const c = newComponent(page, 'ConfirmAction');
  stack(c, 'VERTICAL', 'lg'); fixedWidth(c, 360, 'panel');
  const field = inst('TextField', { label: d.fieldLabel, value: d.word, helperText: 'Der Button wird aktiv, sobald die Eingabe stimmt.' }); field.name = 'field'; c.appendChild(field); fill(field);
  const btn = inst('Button', { variant: 'danger', label: d.actionLabel }); btn.name = 'action'; c.appendChild(btn);
  c.description = description(spec);
  annotate(c, 'word, fieldLabel und actionLabel sind Props im Code. Der Button ist deaktiviert, bis die Eingabe dem Wort entspricht.');
  c.x = 0; c.y = y;
  C.ConfirmAction = { set: c, keys: {} };
  const doc = await docFrame(spec, page, c.width + 80); doc.y = y;
}

async function buildDeprecated(page) {
  const c = newComponent(page, 'LinkButton');
  stack(c, 'HORIZONTAL'); pad(c, 'xs', '2xs');
  const l = await text('Mehr', 'label/md', style('LinkButton', 'default').fg, 'label'); c.appendChild(l);
  l.componentPropertyReferences = { characters: c.addComponentProperty('label', 'TEXT', 'Mehr') };
  const d = specOf('LinkButton').deprecated;
  c.description = `VERALTET seit ${d.since} – nutze ${d.use}.\n` + description(specOf('LinkButton'));
  c.x = 0; c.y = 0;
  C.LinkButton = { set: c, keys: {} };
}

// ---------- Doku-Rahmen (aus der Spec generiert) ----------
async function docFrame(spec, page, x) {
  const f = frame(`doc/${spec.name}`, 'VERTICAL', 'lg');
  page.appendChild(f);
  fixedWidth(f, 520);
  pad(f, 'xl', 'xl'); radius(f, 'lg');
  f.fills = [paint('bg/surface')]; stroke(f, 'border/default');
  const add = async (chars, textStyle, color, name) => { const t = await text(chars, textStyle, color, name); f.appendChild(t); fill(t); return t; };
  await add(spec.name, 'heading/lg', null, 'title');
  await add(`${spec.status} · v${spec.version} · Spec ds/${kebab(spec.name)}`, 'caption', 'text/secondary', 'status');
  await add(spec.purpose, 'body/md', null, 'purpose');
  if (spec.props.length) {
    await add('Properties (identisch mit Code-Props)', 'label/md', null, 'properties-title');
    await add(spec.props.map((p) => `${p.name}: ${p.values ? p.values.join(' | ') : p.type === 'codeText' ? 'text' : p.type}${p.type === 'behavior' || p.type === 'codeText' ? '  (nur im Code)' : ''}${p.default !== undefined ? `  (Standard: ${p.default})` : ''}`).join('\n'), 'body/sm', 'text/secondary', 'properties');
  }
  if (spec.rules.length) {
    await add('Regeln', 'label/md', null, 'rules-title');
    await add(spec.rules.map((r) => `${r.text}\n   Warum: ${r.why}\n   ID: ${r.id}${r.check ? ` · Check: ${r.check}` : ' · manuell/Rubrik'}`).join('\n\n'), 'body/sm', 'text/secondary', 'rules');
  }
  await add('Barrierefreiheit', 'label/md', null, 'a11y-title');
  await add(spec.a11y, 'body/sm', 'text/secondary', 'a11y');
  if (spec.do.length) { await add('Do', 'label/md', 'feedback/success-fg', 'do-title'); await add(spec.do.join('\n'), 'body/sm', 'text/secondary', 'do'); }
  if (spec.dont.length) { await add("Don't", 'label/md', 'feedback/danger-fg', 'dont-title'); await add(spec.dont.join('\n'), 'body/sm', 'text/secondary', 'dont'); }
  f.x = x; f.y = 0;
  return f;
}

async function componentPage(pageName, builder, name) {
  const page = await goTo(pageName);
  await builder(page);
  await docFrame(specOf(name), page, C[name].set.width + 80);
}

// ---------- Seiten ----------
async function buildReadme(page) {
  const f = frame('readme', 'VERTICAL', 'lg');
  page.appendChild(f);
  fixedWidth(f, 816);
  pad(f, '3xl', '3xl'); radius(f, 'lg');
  f.fills = [paint('bg/surface')]; stroke(f, 'border/default');
  const parts = [
    [`${SPEC.name} Design System`, 'display', null, 'title'],
    [`Version ${SPEC.version} / Beispiel-Library mit Best Practices für Menschen und KI-Agenten. Erzeugt aus specs/system.json.`, 'body/md', 'text/secondary', 'version'],
    ['Zweck', 'heading/md', null, 'purpose-title'],
    ['Eine Referenz-Library, die Menschen und KI-Agenten gleich gut lesen können: Namen wie im Code, jede Entscheidung mit Begründung, keine Rohwerte.', 'body/md', null, 'purpose'],
    ['Seiten', 'heading/md', null, 'pages-title'],
    [`📖 Lies mich: diese Seite\n🎨 Foundations: semantische Farben, Abstände, Radien, Rahmenstärken, Größen, Text-Styles\n🧩 ${LIVE.join(', ')}: je eine Seite, Doku-Rahmen neben dem Set\n`+'🧱 Patterns: fertige Kompositionen wie SignInForm\n📰 Beispiele: Konto-Einstellungen in light und dark\n🗄 Veraltet: abgelöste Komponenten mit Verweis auf den Ersatz', 'body/md', null, 'pages'],
    ['Konventionen', 'heading/md', null, 'conventions-title'],
    ['• Komponenten- und Property-Namen sind identisch mit dem Code.\n• Jede Komponente hat eine Beschreibung nach festem Muster: Status, Zweck, Regeln mit ID, A11y, Spec, Code.\n• Primitive Variablen sind versteckt; gestaltet wird nur mit semantischen Variablen.\n• Jede semantische Variable hat Beschreibung, Code-Syntax (WEB) und Scope.\n• Auto Layout überall, Ebenennamen entsprechen den Props.\n• Hilfskomponenten beginnen mit _ und werden nicht veröffentlicht.\n• Zustände, die man nicht sieht (Hover, Fokus), sind eigene Varianten mit der Property state.\n• Hover und Fokus gibt es nur für disabled=false; deaktivierte Elemente haben keinen Hover und keinen Fokus.', 'body/md', null, 'conventions'],
    ['Status', 'heading/md', null, 'status-title'],
    ['stable: freigegeben\nbeta: nutzbar, API kann sich ändern\ndeprecated: nicht mehr verwenden, Ersatz steht in der Beschreibung', 'body/md', null, 'status'],
    ['Quelle der Wahrheit', 'heading/md', null, 'source-title'],
    ['Quelle der Wahrheit sind die Specs im Repo, nicht diese Datei.', 'body/md', null, 'source'],
    ['Changelog', 'heading/md', null, 'changelog-title'],
    [(SPEC.changelog || []).map((e) => `${e.version}: ${e.text}`).join('\n') || `${SPEC.version}: Erste Version.`, 'body/md', null, 'changelog'],
  ];
  for (const [chars, textStyle, color, name] of parts) { const t = await text(chars, textStyle, color, name); f.appendChild(t); fill(t); }
  f.x = 0; f.y = 0;
}

async function buildFoundations(page) {
  const root = frame('foundations', 'VERTICAL', '2xl');
  page.appendChild(root);
  fixedWidth(root, 1200);
  pad(root, '3xl', '3xl');
  root.fills = [paint('bg/canvas')];
  const add = async (parent, chars, textStyle, color, name) => { const t = await text(chars, textStyle, color, name); parent.appendChild(t); fill(t); return t; };
  const sample = (w, h, r) => { const b = figma.createFrame(); b.name = 'sample'; b.resize(w, h); b.fills = [paint('bg/subtle')]; stroke(b, 'border/input'); radius(b, r); return b; };
  const info = async (card, group, name, t) => {
    await add(card, `${group}/${name} / ${t.value} px`, 'label/md', null, 'name');
    await add(card, `var(--${P}-${group}-${name})`, 'caption', 'text/secondary', 'css');
    await add(card, t.why, 'caption', 'text/secondary', 'why');
  };
  await add(root, 'Foundations', 'display', null, 'page-title');
  await add(root, 'Semantische Farben, Abstände, Radien, Rahmenstärken, Größen und Text-Styles. Alle Muster sind an Variablen gebunden.', 'body/md', 'text/secondary', 'intro');

  await add(root, 'Farben', 'heading/lg', null, 'colors-title');
  const grid = frame('colors', 'HORIZONTAL', 'lg'); root.appendChild(grid); grid.layoutWrap = 'WRAP'; fill(grid); bind(grid, 'counterAxisSpacing', 'space/xl');
  for (const [name, t] of Object.entries(SPEC.semantic.color)) {
    const card = frame(`swatch/${name}`, 'VERTICAL', 'xs'); grid.appendChild(card); fixedWidth(card, 260);
    const sw = figma.createFrame(); sw.name = 'swatch'; sw.resize(260, 56); sw.fills = [paint(name)]; stroke(sw, 'border/default'); radius(sw, 'md');
    card.appendChild(sw); fill(sw);
    await add(card, `color/${name}`, 'label/md', null, 'name');
    await add(card, `var(--${P}-color-${kebab(name)})`, 'caption', 'text/secondary', 'css');
    await add(card, t.why, 'caption', 'text/secondary', 'why');
  }

  await add(root, 'Abstände', 'heading/lg', null, 'spacing-title');
  const sp = frame('spacing', 'VERTICAL', 'sm'); root.appendChild(sp); fill(sp);
  for (const [name, t] of Object.entries(SPEC.semantic.space)) {
    const row = frame(`space/${name}`, 'HORIZONTAL', 'md'); sp.appendChild(row); row.counterAxisAlignItems = 'CENTER'; fill(row);
    const slot = frame('bar-slot', 'HORIZONTAL'); row.appendChild(slot); slot.resize(64, 16); slot.primaryAxisSizingMode = 'FIXED'; slot.counterAxisSizingMode = 'FIXED';
    const bar = figma.createRectangle(); bar.name = 'bar'; bar.resize(Math.max(t.value, 1), 16); bar.fills = [paint('action/primary')]; slot.appendChild(bar);
    bind(bar, 'width', `space/${name}`);
    const l = await text(`space/${name} / ${t.value} px / var(--${P}-space-${name})`, 'label/md', 'text/primary', 'name'); row.appendChild(l); l.resize(300, l.height);
    const w = await text(t.why, 'body/sm', 'text/secondary', 'why'); row.appendChild(w); fill(w);
  }

  await add(root, 'Radien', 'heading/lg', null, 'radius-title');
  const rr = frame('radii', 'HORIZONTAL', 'xl'); root.appendChild(rr); fill(rr);
  for (const [name, t] of Object.entries(SPEC.semantic.radius)) {
    const card = frame(`radius/${name}`, 'VERTICAL', 'xs'); rr.appendChild(card); fixedWidth(card, 240);
    card.appendChild(sample(96, 56, name));
    await info(card, 'radius', name, t);
  }

  await add(root, 'Rahmenstärken', 'heading/lg', null, 'border-width-title');
  const bw = frame('border-widths', 'HORIZONTAL', 'xl'); root.appendChild(bw); fill(bw);
  for (const [name, t] of Object.entries(SPEC.semantic['border-width'])) {
    const card = frame(`border-width/${name}`, 'VERTICAL', 'xs'); bw.appendChild(card); fixedWidth(card, 240);
    const b = sample(96, 56, 'md'); b.fills = [paint('bg/surface')]; bind(b, 'strokeWeight', `border-width/${name}`); card.appendChild(b);
    await info(card, 'border-width', name, t);
  }

  await add(root, 'Größen', 'heading/lg', null, 'size-title');
  const sz = frame('sizes', 'HORIZONTAL', 'xl'); root.appendChild(sz); fill(sz); sz.counterAxisAlignItems = 'MAX';
  for (const [name, t] of Object.entries(SPEC.semantic.size)) {
    const card = frame(`size/${name}`, 'VERTICAL', 'xs'); sz.appendChild(card); fixedWidth(card, 240);
    const b = sample(Math.min(t.value, 96), Math.min(t.value, 44), 'sm'); card.appendChild(b); if (t.value > 96) { await info(card, 'size', name, t); continue; } bind(b, 'width', `size/${name}`); bind(b, 'height', `size/${name}`);
    await info(card, 'size', name, t);
  }

  await add(root, 'Typografie', 'heading/lg', null, 'type-title');
  const ty = frame('type', 'VERTICAL', 'lg'); root.appendChild(ty); fill(ty);
  for (const t of SPEC.textStyles) {
    const row = frame(`text/${t.name}`, 'VERTICAL', '2xs'); ty.appendChild(row); fill(row);
    await add(row, `${t.name} / ${t.size}/${t.line} ${t.weight}`, t.name, null, 'sample');
    await add(row, `${t.why} Code: var(--${P}-text-${kebab(t.name)})`, 'caption', 'text/secondary', 'why');
  }
  root.x = 0; root.y = 0;
}

async function buildExamples(page) {
  const make = async (label, mode, x) => {
    const f = frame(`example/${label}`, 'VERTICAL', '2xl');
    page.appendChild(f);
    fixedWidth(f, 880);
    pad(f, '3xl', '3xl');
    f.fills = [paint('bg/canvas')];
    if (mode) tryDo('Mode setzen', () => f.setExplicitVariableModeForCollection(semCol, mode));
    const h = await text('Konto-Einstellungen', 'display', 'text/primary', 'page-title'); f.appendChild(h); fill(h);
    const al = inst('Alert', { tone: 'success' }); al.name = 'alert'; f.appendChild(al); fill(al);
    const row = frame('cards', 'HORIZONTAL', 'lg'); f.appendChild(row); fill(row);
    // Aktionen in Karten sind sekundär: höchstens ein primärer Button pro Ansicht (button/one-primary)
    for (const [name, title, body, action] of [['card-profile', 'Profil', 'Name, Foto und öffentliche Angaben.', 'Profil bearbeiten'], ['card-notifications', 'Benachrichtigungen', 'Lege fest, wann wir dir schreiben.', 'Benachrichtigungen ändern']]) {
      const c = inst('Card', { title, body }); c.name = name; row.appendChild(c); fill(c); c.layoutAlign = 'STRETCH';
      const a = c.findOne((n) => n.type === 'INSTANCE' && n.name === 'action');
      tryDo(`Aktion ${name}`, () => a.setProperties({ variant: 'secondary', [C.Button.keys.label]: action }));
    }
    const badges = frame('status', 'HORIZONTAL', 'sm'); f.appendChild(badges);
    const b1 = inst('Badge', { tone: 'success', label: 'Verifiziert' }); b1.name = 'badge-verified'; badges.appendChild(b1);
    const b2 = inst('Badge', { tone: 'neutral', label: 'Basis-Tarif' }); b2.name = 'badge-plan'; badges.appendChild(b2);
    const sw = inst('Switch', { checked: 'true', showHelper: true }); sw.name = 'switch-mail'; f.appendChild(sw);
    const s = C.SignInForm.set.createInstance(); s.name = 'sign-in'; f.appendChild(s);
    f.x = x; f.y = 0;
  };
  await make('light', lightMode, 0);
  if (darkMode) await make('dark', darkMode, 960);
}

// ---------- Ablauf ----------
const BUILDERS = { Link: buildLink, Button: buildButton, TextField: buildTextField, Checkbox: buildCheckbox, Switch: buildSwitch, Badge: buildBadge, Alert: buildAlert, Card: buildCard };
const LIVE = SPEC.components.filter((c) => c.kind === 'component' && c.status !== 'deprecated').map((c) => c.name);
const PAGES = ['📖 Lies mich', '🎨 Foundations', ...LIVE.map((n) => `🧩 ${n}`), '🧱 Patterns', '📰 Beispiele', '🗄 Veraltet'];

async function main() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  if (existing.length) { figma.closePlugin('Abbruch: Die Datei enthält schon Variablen. Bitte in einer leeren Datei ausführen.'); return; }
  figma.notify('Erzeuge Variablen …');
  buildVariables();
  await buildTextStyles();

  figma.root.children[0].name = PAGES[0];
  for (const n of PAGES.slice(1)) { const p = figma.createPage(); p.name = n; }

  figma.notify('Erzeuge Komponenten …');
  for (const n of LIVE) { if (!BUILDERS[n]) { warn(`Für ${n} fehlt ein Builder im Plugin.`); continue; } await componentPage(`🧩 ${n}`, BUILDERS[n], n); }
  await componentPage('🧱 Patterns', buildSignInForm, 'SignInForm');
  await buildConfirmAction(await goTo('🧱 Patterns'), 900);
  await componentPage('🗄 Veraltet', buildDeprecated, 'LinkButton');

  await buildExamples(await goTo('📰 Beispiele'));
  await buildFoundations(await goTo('🎨 Foundations'));
  await buildReadme(await goTo('📖 Lies mich'));

  const msg = log.length ? `Fertig mit ${log.length} Hinweisen (siehe Konsole).` : 'Fertig. Fundament wurde angelegt.';
  console.log('Hinweise:', log);
  figma.closePlugin(msg);
}

main().catch((e) => { console.error(e); figma.closePlugin(`Fehler: ${e.message}`); });
