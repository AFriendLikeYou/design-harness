// @fundament/ui – Web Components. Von Hand gepflegt; gültige Elemente, Attribute und Werte kommen aus contract.generated.js.
// Light DOM: Die Elemente rendern die Klassen aus components.css, damit Tokens und Themes ohne Shadow-Grenze wirken.
// Einbinden: tokens.css + components.css laden, dann <script type="module" src="fundament.js">.
import { ELEMENTS, VERSION, PREFIX } from './contract.generated.js';

export { VERSION };
const P = PREFIX; // Elemente heißen <P-…>, Klassen .P-…
let uid = 0;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GLOBAL = /^(id|class|slot|hidden|style|lang|dir|tabindex|data-.*|aria-.*)$/;

class Base extends HTMLElement {
  static get contract() { return ELEMENTS[this.tag]; }
  static get observedAttributes() { const c = ELEMENTS[this.tag]; return [...Object.keys(c.attrs), ...c.passthrough, ...(this.aria || [])]; }
  get c() { return this.constructor.contract; }
  // Attribut lesen: enum → gültiger Wert oder Standard, boolean → true/false, text → Zeichenkette
  a(name) {
    const d = this.c.attrs[name]; const v = this.getAttribute(name);
    if (!d) return v ?? ''; // Attribut gibt es in diesem System nicht
    if (d.type === 'boolean') return v === null ? d.default : v !== 'false';
    if (d.type === 'enum') return d.values.includes(v) ? v : d.default;
    return v ?? '';
  }
  connectedCallback() {
    if (this.ready) return;
    // Der native Tooltip eines title-Attributs wäre hier falsch: Wert merken, Attribut entfernen
    if ('title' in this.c.attrs && this.hasAttribute('title')) { this._title = this.getAttribute('title'); this.removeAttribute('title'); }
    this.slotted = {}; for (const s of this.c.slots) this.slotted[s] = [...this.children].filter((n) => n.getAttribute('slot') === s);
    this.check();
    this.uid = `${P}-${++uid}`;
    this.build(); this.ready = true; this.update();
  }
  attributeChangedCallback(name, old, val) {
    if (name === 'title' && val !== null) { this._title = val; this.removeAttribute('title'); }
    if (this.ready && old !== val) { this.check(); this.update(); }
  }
  // Im Betrieb still, in der Entwicklung laut: ungültige Werte und unbekannte Attribute melden
  check() {
    for (const { name, value } of [...this.attributes]) {
      const d = this.c.attrs[name];
      if (!d && !this.c.passthrough.includes(name) && !GLOBAL.test(name)) console.warn(`<${this.localName}> kennt das Attribut "${name}" nicht.`);
      if (d?.type === 'enum' && !d.values.includes(value)) console.warn(`<${this.localName} ${name}="${value}"> ist ungültig. Erlaubt: ${d.values.join(', ')}.`);
    }
    if (this.c.status === 'deprecated') console.warn(`<${this.localName}> ist veraltet seit ${this.c.deprecated.since}. Nutze ${this.c.deprecated.use}.`);
  }
  q(sel) { return this.querySelector(sel); }
  // Überträgt alle Aufzählungs- und Wahrheitswerte des Vertrags als data-Attribute auf das innere Element (state=default entfällt)
  reflect(el, skip = []) {
    for (const [n, d] of Object.entries(this.c.attrs)) {
      if (skip.includes(n) || d.type === 'text' || n.startsWith('show-')) continue; const key = n.replace(/-(.)/g, (m, ch) => ch.toUpperCase()); const v = this.a(n);
      if (d.type === 'boolean') { if (v) el.dataset[key] = 'true'; else delete el.dataset[key]; }
      else if (n === 'state' && v === 'default') delete el.dataset[key]; else el.dataset[key] = v;
    }
  }
  pass(target) { for (const n of this.c.passthrough) { const v = this.getAttribute(n); if (v === null) target.removeAttribute(n); else target.setAttribute(n, v); } }
  static define(tag) { if (customElements.get(tag)) return; const K = class extends this {}; K.tag = tag; customElements.define(tag, K); }
}

class Button extends Base {
  // ARIA-Zustände, die an das innere <button> weitergereicht werden
  static aria = ['aria-pressed', 'aria-controls', 'aria-expanded', 'aria-label'];
  build() { this.innerHTML = `<button class="${P}-button"><span class="${P}-button__label"></span></button>`; }
  update() {
    const b = this.q('button');
    this.reflect(b, ['disabled']);
    b.disabled = this.a('disabled'); b.type = this.getAttribute('type') || 'button';
    for (const n of ['name', 'value']) { const v = this.getAttribute(n); if (v === null) b.removeAttribute(n); else b.setAttribute(n, v); }
    for (const n of Button.aria) { const v = this.getAttribute(n); if (v === null) b.removeAttribute(n); else b.setAttribute(n, v); }
    this.q(`.${P}-button__label`).textContent = this.a('label');
  }
}

class TextField extends Base {
  build() {
    const id = this.uid;
    this.innerHTML = `<div class="${P}-text-field"><label class="${P}-text-field__label" for="${id}"></label><div class="${P}-text-field__control"><input class="${P}-text-field__input" id="${id}"><span class="${P}-text-field__trailing"></span></div><span class="${P}-text-field__helper-text" id="${id}-h"></span><span class="${P}-text-field__error-text" id="${id}-e"></span></div>`;
    this.q(`.${P}-text-field__trailing`).append(...this.slotted.trailing);
    this.q('input').value = this.getAttribute('value') ?? '';
  }
  update() {
    const state = this.a('state'), input = this.q('input'), err = state === 'error';
    this.q(`.${P}-text-field`).dataset.state = state;
    this.q('label').textContent = this.a('label');
    this.pass(input); if (!this.hasAttribute('type')) input.type = 'text';
    if (document.activeElement !== input && this.hasAttribute('value') && input.value !== this.getAttribute('value') && !this.dirty) input.value = this.getAttribute('value');
    input.disabled = state === 'disabled';
    const help = this.q(`.${P}-text-field__helper-text`), error = this.q(`.${P}-text-field__error-text`);
    help.textContent = this.a('helper-text'); error.textContent = this.a('error-text');
    help.hidden = err || !this.a('show-helper') || !this.a('helper-text'); error.hidden = !err;
    if (err) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', error.id); } else { input.removeAttribute('aria-invalid'); if (help.hidden) input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', help.id); }
    this.q(`.${P}-text-field__trailing`).hidden = !this.a('show-trailing');
    if (!this.listening) {
      this.listening = true; input.addEventListener('input', () => { this.dirty = true; });
      // Verhalten des Slots trailing: reveal schaltet die Sichtbarkeit des Passworts, clear leert das Feld
      this.q(`.${P}-text-field__trailing`).addEventListener('click', (e) => {
        const b = e.target.closest(`${P}-button`); const action = this.a('trailing-action'); if (!b || action === 'none') return;
        if (action === 'reveal') { const show = input.type === 'password'; input.type = show ? 'text' : 'password'; this.revealed = show; b.setAttribute('label', show ? 'Verbergen' : 'Anzeigen'); b.setAttribute('aria-pressed', String(show)); }
        if (action === 'clear') { input.value = ''; this.dirty = true; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
      });
    }
    if (this.a('trailing-action') === 'reveal') { input.type = this.revealed ? 'text' : 'password'; const b = this.q(`.${P}-text-field__trailing ${P}-button`); if (b && !b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false'); if (b) b.setAttribute('aria-controls', input.id); }
  }
  get value() { return this.q('input')?.value ?? this.getAttribute('value') ?? ''; }
  set value(v) { if (this.ready) this.q('input').value = v; else this.setAttribute('value', v); }
  get input() { return this.q('input'); }
}

class Checkbox extends Base {
  build() { const id = this.uid; this.innerHTML = `<div class="${P}-checkbox-field"><label class="${P}-checkbox"><input class="${P}-checkbox__box" type="checkbox"><span class="${P}-checkbox__label"></span></label><span class="${P}-checkbox__helper-text" id="${id}-h"></span></div>`; this.q('input').checked = this.a('checked'); }
  update() {
    const input = this.q('input'), help = this.q(`.${P}-checkbox__helper-text`);
    if (!this.touched) input.checked = this.a('checked');
    input.disabled = this.a('disabled'); this.pass(input);
    const l = this.q(`.${P}-checkbox`); this.reflect(l, ['checked', 'disabled']);
    this.q(`.${P}-checkbox__label`).textContent = this.a('label');
    help.textContent = this.a('helper-text'); help.hidden = !this.a('show-helper') || !this.a('helper-text');
    if (help.hidden) input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', help.id);
    if (!this.listening) { this.listening = true; input.addEventListener('change', () => { this.touched = true; }); }
  }
  get checked() { return this.q('input')?.checked ?? this.a('checked'); }
  set checked(v) { this.touched = true; if (this.ready) this.q('input').checked = !!v; }
}

class Switch extends Base {
  // Klassen heißen nach dem Element (fd-switch, z-ds-toggle …), damit dieselbe Umsetzung mehrere Namen tragen kann
  build() { const id = this.uid; const B = this.localName; this.innerHTML = `<div class="${B}-field"><label class="${B}"><button class="${B}__track" type="button" role="switch" id="${id}"><span class="${B}__thumb"></span></button><span class="${B}__label"></span></label><span class="${B}__helper-text" id="${id}-h"></span></div>`; this.on = this.a('checked'); }
  update() {
    const B = this.localName; const b = this.q('button'), help = this.q(`.${B}__helper-text`);
    if (!this.touched) this.on = this.a('checked');
    b.setAttribute('aria-checked', String(this.on)); b.disabled = this.a('disabled');
    if (this.a('state') === 'focus') b.dataset.state = 'focus'; else delete b.dataset.state;
    this.q(`.${B}__label`).textContent = this.a('label');
    help.textContent = this.a('helper-text'); help.hidden = !this.a('show-helper') || !this.a('helper-text');
    if (help.hidden) b.removeAttribute('aria-describedby'); else b.setAttribute('aria-describedby', help.id);
    if (!this.listening) { this.listening = true; b.addEventListener('click', () => { this.touched = true; this.on = !this.on; b.setAttribute('aria-checked', String(this.on)); this.dispatchEvent(new Event('change', { bubbles: true })); }); }
  }
  get checked() { return !!this.on; }
  set checked(v) { this.touched = true; this.on = !!v; if (this.ready) this.q('button').setAttribute('aria-checked', String(this.on)); }
}

class Badge extends Base {
  build() { this.innerHTML = `<span class="${P}-badge"><span class="${P}-badge__label"></span></span>`; }
  update() { this.q(`.${P}-badge`).dataset.tone = this.a('tone'); this.q(`.${P}-badge__label`).textContent = this.a('label'); }
}

class Alert extends Base {
  build() { this.innerHTML = `<div class="${P}-alert"><p class="${P}-alert__title"></p><p class="${P}-alert__description"></p></div>`; }
  update() {
    const tone = this.a('tone'), box = this.q(`.${P}-alert`), d = this.q(`.${P}-alert__description`);
    box.dataset.tone = tone; box.setAttribute('role', tone === 'warning' || tone === 'danger' ? 'alert' : 'status');
    this.q(`.${P}-alert__title`).textContent = this._title ?? ''; d.textContent = this.a('description'); d.hidden = !this.a('description');
  }
}

class Card extends Base {
  build() { this.innerHTML = `<section class="${P}-card"><div class="${P}-card__header"><h2 class="${P}-card__title"></h2><span class="${P}-card__badge"></span></div><p class="${P}-card__body"></p><div class="${P}-card__footer"></div></section>`; this.q(`.${P}-card__footer`).append(...this.slotted.action); this.q(`.${P}-card__badge`).append(...this.slotted.badge); }
  update() {
    this.q(`.${P}-card__title`).textContent = this._title ?? ''; this.q(`.${P}-card__body`).textContent = this.a('body');
    const f = this.q(`.${P}-card__footer`); f.hidden = !this.a('show-footer') || !f.children.length;
    const g = this.q(`.${P}-card__badge`); g.hidden = !this.a('show-badge') || !g.children.length;
  }
}

class SignInForm extends Base {
  build() {
    this.innerHTML = `<form class="${P}-sign-in-form"><h2 class="${P}-sign-in-form__title">Anmelden</h2>
<${P}-text-field label="E-Mail-Adresse" name="email" type="email" autocomplete="email" show-helper="false"></${P}-text-field>
<${P}-text-field label="Passwort" name="password" type="password" autocomplete="current-password" helper-text="Mindestens 12 Zeichen." show-trailing trailing-action="reveal"><${P}-button slot="trailing" variant="ghost" size="sm" label="Anzeigen"></${P}-button></${P}-text-field>
<${P}-checkbox label="Angemeldet bleiben" name="remember"></${P}-checkbox>
<${P}-button class="${P}-sign-in-form__submit" type="submit" label="Anmelden"></${P}-button></form>`;
  }
  update() {}
}

class Link extends Base {
  build() { this.innerHTML = `<a class="${P}-link"><span class="${P}-link__label"></span></a>`; }
  update() { const a = this.q('a'); this.pass(a); if (this.a('state') === 'default') delete a.dataset.state; else a.dataset.state = this.a('state'); this.q(`.${P}-link__label`).textContent = this.a('label'); }
}

// Muster: Der danger-Button wird erst aktiv, wenn das Bestätigungswort im Feld steht. Meldet dann beim Klick das Ereignis "confirm".
class ConfirmAction extends Base {
  build() {
    this.innerHTML = `<div class="${P}-confirm-action"><${P}-text-field autocomplete="off" helper-text="Der Button wird aktiv, sobald die Eingabe stimmt."></${P}-text-field><${P}-button variant="danger" disabled></${P}-button></div>`;
    this.addEventListener('input', () => this.sync());
    this.q(`${P}-button`).addEventListener('click', () => { if (this.confirmed) this.dispatchEvent(new Event('confirm', { bubbles: true })); });
  }
  // nicht "matches" nennen: das würde Element.matches überschreiben
  get confirmed() { return this.q(`${P}-text-field`).value.trim() === this.a('word').trim() && this.a('word').trim() !== ''; }
  sync() { const b = this.q(`${P}-button`); if (this.confirmed) b.removeAttribute('disabled'); else b.setAttribute('disabled', ''); }
  update() { this.q(`${P}-text-field`).setAttribute('label', this.a('field-label')); this.q(`${P}-button`).setAttribute('label', this.a('action-label')); this.sync(); }
}

class LinkButton extends Base {
  build() { this.innerHTML = `<a class="${P}-link-button"><span class="${P}-link-button__label"></span></a>`; }
  update() { this.q(`.${P}-link-button__label`).textContent = this.a('label'); }
}

// Umsetzung je Komponentenname aus dem Vertrag. Toggle ist dieselbe Umsetzung wie Switch.
const IMPL = { Button, TextField, Checkbox, Switch, Toggle: Switch, Badge, Alert, Card, Link, SignInForm, ConfirmAction, LinkButton };
for (const [tag, def] of Object.entries(ELEMENTS)) {
  if (!IMPL[def.name]) { console.warn(`Für <${tag}> aus dem Vertrag fehlt die Umsetzung in fundament.js.`); continue; }
  IMPL[def.name].define(tag);
}
