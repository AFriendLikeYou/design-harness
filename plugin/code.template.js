// Fundament Start – legt in einer leeren Figma-Datei das Fundament an: Variablen, Text-Styles, Seiten und die Seite „Lies mich“.
// Komponenten baut das Plugin bewusst nicht. Sie entstehen in Figma; der Abgleich (Plugin „Fundament Export“ + node tooling/figma-diff.mjs)
// hält sie mit der Spec gleich. Generiert aus specs/system.json. Nicht von Hand bearbeiten, sondern Spec ändern und neu bauen.
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
function pad(node, x, y) { bind(node, 'paddingLeft', `space/${x}`); bind(node, 'paddingRight', `space/${x}`); bind(node, 'paddingTop', `space/${y}`); bind(node, 'paddingBottom', `space/${y}`); }
function radius(node, r) { for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) bind(node, c, `radius/${r}`); }
function stroke(node, color, width = 'default') { node.strokes = [paint(color)]; node.strokeAlign = 'INSIDE'; bind(node, 'strokeWeight', `border-width/${width}`); }
function frame(name, dir, gap) { const f = figma.createFrame(); f.name = name; f.fills = []; f.layoutMode = dir; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; if (gap) bind(f, 'itemSpacing', `space/${gap}`); return f; }
function fixedWidth(node, w) { node.resize(w, 100); node.counterAxisSizingMode = 'FIXED'; node.primaryAxisSizingMode = 'AUTO'; }
async function text(chars, textStyle, color, name) { const t = figma.createText(); t.name = name || 'text'; t.fontName = { family: 'Inter', style: 'Regular' }; t.characters = chars; await t.setTextStyleIdAsync(TS[textStyle].id); t.fills = [paint(color || 'text/primary')]; return t; }
function fill(child) { tryDo('Füllbreite', () => { child.layoutSizingHorizontal = 'FILL'; }); }
async function goTo(name) { const p = figma.root.children.find((x) => x.name === name); await figma.setCurrentPageAsync(p); return p; }

// ---------- Seiten ----------
const LIVE = SPEC.components.filter((c) => c.kind === 'component' && c.status !== 'deprecated').map((c) => c.name);
const PAGES = ['📖 Lies mich', '🎨 Foundations', ...LIVE.map((n) => `🧩 ${n}`), '🧱 Patterns', '📰 Beispiele', '🗄 Veraltet'];

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
    ['Figma, Spec und Code', 'heading/md', null, 'source-title'],
    ['Gestaltet wird in dieser Datei, umgesetzt im Code. Der Vertrag dazwischen ist die Spec im Repo (specs/system.json). Das Plugin „Fundament Export“ liefert den Stand dieser Datei; der Abgleich im Repo zeigt jede Abweichung als Vorschlag für die Spec.', 'body/md', null, 'source'],
    ['Changelog', 'heading/md', null, 'changelog-title'],
    [(SPEC.changelog || []).map((e) => `${e.version}: ${e.text}`).join('\n') || `${SPEC.version}: Erste Version.`, 'body/md', null, 'changelog'],
  ];
  for (const [chars, textStyle, color, name] of parts) { const t = await text(chars, textStyle, color, name); f.appendChild(t); fill(t); }
  f.x = 0; f.y = 0;
}


// ---------- Ablauf ----------
async function main() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  if (existing.length) { figma.closePlugin('Abbruch: Die Datei enthält schon Variablen. Bitte in einer leeren Datei ausführen.'); return; }
  figma.notify('Lege Variablen und Text-Styles an …');
  buildVariables();
  await buildTextStyles();
  figma.root.children[0].name = PAGES[0];
  for (const n of PAGES.slice(1)) { const p = figma.createPage(); p.name = n; }
  await buildReadme(await goTo('📖 Lies mich'));
  console.log('Hinweise:', log);
  figma.closePlugin(log.length ? `Fertig mit ${log.length} Hinweisen (siehe Konsole).` : 'Fertig. Variablen, Text-Styles und Seiten sind angelegt. Komponenten jetzt in Figma bauen und mit „Fundament Export“ abgleichen.');
}

main().catch((e) => { console.error(e); figma.closePlugin(`Fehler: ${e.message}`); });
