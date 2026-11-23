// Lässt plugin/code.js (Fundament Start) gegen eine Attrappe der Figma-API laufen: Variablen, Text-Styles, Seiten.
// Findet Tippfehler, fehlende Variablen und Laufzeitfehler; ersetzt keinen Lauf in Figma.
import { readFileSync } from 'node:fs';
let id = 0; const warnings = []; let closed = null;
class Node {
  constructor(type) { this.type = type; this.id = String(++id); this.name = type; this.children = []; this.parent = null; this.width = 100; this.height = 40; this.bound = {}; this.fills = []; this.strokes = []; this.componentPropertyDefinitions = {}; this.componentPropertyReferences = null; this.description = ''; this.characters = ''; }
  appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.push(c); }
  insertChild(i, c) { this.appendChild(c); this.children.splice(this.children.indexOf(c), 1); this.children.splice(i, 0, c); }
  resize(w, h) { this.width = w; this.height = h; }
  setBoundVariable(field, v) { if (!v) throw new Error('Variable undefined für ' + field); this.bound[field] = v.name; }
  findAll(fn = () => true) { const out = []; const walk = (n) => n.children.forEach((c) => { if (fn(c)) out.push(c); walk(c); }); walk(this); return out; }
  findOne(fn) { return this.findAll(fn)[0] || null; }
  addComponentProperty(name, type, def) { const key = type === 'VARIANT' ? name : `${name}#${++id}`; this.componentPropertyDefinitions[key] = { type, defaultValue: def }; return key; }
  get defaultVariant() { return this.children[0]; }
  createInstance() { const i = new Node('INSTANCE'); i.main = this; i.width = this.width; i.height = this.height; const copy = (from, to) => from.children.forEach((c) => { const n = new Node(c.type === 'COMPONENT' ? 'FRAME' : c.type); n.name = c.name; n.defs = c.defs; to.children.push(n); n.parent = to; copy(c, n); }); copy(this, i); const set = this.parent && this.parent.type === 'COMPONENT_SET' ? this.parent : this; i.defs = set.componentPropertyDefinitions; return i; }
  setProperties(p) { for (const k of Object.keys(p)) if (!(k in this.defs) && !Object.keys(this.defs).some((d) => d === k)) throw new Error(`Property ${k} gibt es nicht (${Object.keys(this.defs).join(', ')})`); }
  async setTextStyleIdAsync(i) { if (!i) throw new Error('Text-Style fehlt'); this.textStyleId = i; }
  setExplicitVariableModeForCollection() {}
}
const pages = [Object.assign(new Node('PAGE'), { name: 'Page 1' })]; const vars = []; const styles = []; const cols = [];
const figma = {
  root: { get children() { return pages; } },
  variables: {
    createVariableCollection: (name) => { const c = { name, modes: [{ modeId: 'm' + ++id, name: 'Mode 1' }], renameMode() {}, addMode(n) { const m = 'm' + ++id; this.modes.push({ modeId: m, name: n }); return m; } }; cols.push(c); return c; },
    createVariable: (name, col, type) => { if (vars.some((v) => v.name === name && v.col === col)) throw new Error('Variable doppelt: ' + name); const v = { name, col, type, values: {}, setValueForMode(m, val) { if (val === undefined) throw new Error('Wert undefined: ' + name); this.values[m] = val; }, setVariableCodeSyntax(p, s) { this.syntax = s; } }; vars.push(v); return v; },
    createVariableAlias: (v) => { if (!v) throw new Error('Alias auf undefined'); return { type: 'VARIABLE_ALIAS', id: v.name }; },
    setBoundVariableForPaint: (p, f, v) => { if (!v) throw new Error('Farbvariable undefined'); return { ...p, boundVariables: { color: v.name } }; },
    getLocalVariableCollectionsAsync: async () => [],
  },
  loadFontAsync: async () => {}, notify() {}, closePlugin: (m) => { closed = m; },
  createTextStyle: () => { const s = { id: 's' + ++id, bound: {}, setBoundVariable(f, v) { if (!v) throw new Error('Variable undefined für ' + f); this.bound[f] = v.name; } }; styles.push(s); return s; },
  createPage: () => { const p = new Node('PAGE'); pages.push(p); return p; },
  setCurrentPageAsync: async (p) => { if (!p) throw new Error('Seite fehlt'); },
  createFrame: () => new Node('FRAME'), createComponent: () => new Node('COMPONENT'), createText: () => new Node('TEXT'), createVector: () => new Node('VECTOR'), createRectangle: () => new Node('RECTANGLE'),
  combineAsVariants: (comps, parent) => { for (const c of comps) if (c.parent !== parent) throw new Error('Variante liegt nicht auf der Zielseite: ' + c.name); const s = new Node('COMPONENT_SET'); parent.appendChild(s); comps.forEach((c) => s.appendChild(c)); const names = new Set(comps.map((c) => c.name)); if (names.size !== comps.length) throw new Error('Doppelte Variantennamen'); for (const kv of comps[0].name.split(', ')) s.componentPropertyDefinitions[kv.split('=')[0]] = { type: 'VARIANT' }; return s; },
};
const origWarn = console.warn; console.warn = (m) => warnings.push(m); const origLog = console.log; console.log = () => {};
const code = readFileSync(new URL('../plugin/code.js', import.meta.url), 'utf8');
await new (Object.getPrototypeOf(async function () {}).constructor)('figma', code + '\nawait new Promise((r) => setTimeout(r, 50));')(figma);
await new Promise((r) => setTimeout(r, 200));
console.warn = origWarn; console.log = origLog;
const all = pages.flatMap((p) => p.findAll());
const spec = JSON.parse(readFileSync(new URL('../specs/system.json', import.meta.url), 'utf8'));
const abweichungen = [];
const semCount = Object.values(spec.semantic).reduce((n, g) => n + Object.keys(g).length, 0); const primCount = Object.values(spec.primitives.color).reduce((n, g) => n + Object.keys(g).length, 0) + spec.primitives.dimension.length + spec.primitives.fontSize.length + spec.primitives.lineHeight.length;
if (vars.length !== semCount + primCount) abweichungen.push(`Variablen: ${vars.length} statt ${semCount + primCount}`);
if (styles.length !== spec.textStyles.length) abweichungen.push(`Text-Styles: ${styles.length} statt ${spec.textStyles.length}`);
for (const v of vars) if (v.col.name === 'semantic' && !v.syntax) abweichungen.push(`${v.name} ohne Code-Syntax`);
const want = spec.components.filter((c) => c.kind === 'component' && c.status !== 'deprecated').length + 5;
if (pages.length !== want) abweichungen.push(`Seiten: ${pages.length} statt ${want}`);
if (!pages[0].findOne((n) => n.name === 'readme')) abweichungen.push('Seite „Lies mich“ ist leer');
const report = { meldung: closed, seiten: pages.length, variablen: vars.length, textStyles: styles.length, ungebundeneFarben: all.filter((n) => [...n.fills, ...n.strokes].some((p) => !p.boundVariables)).length, texteOhneStyle: all.filter((n) => n.type === 'TEXT' && !n.textStyleId).length, hinweise: warnings, abweichungenZurSpec: abweichungen };
warnings.push(...abweichungen);
console.log(JSON.stringify(report, null, 2));
process.exit(warnings.length || !closed || closed.startsWith('Fehler') ? 1 : 0);
