// @fundament/ui – Web Components. Von Hand gepflegt; gültige Elemente, Attribute und Werte kommen aus contract.generated.js.
// Light DOM: Die Elemente rendern die Klassen aus components.css, damit Tokens und Themes ohne Shadow-Grenze wirken.
// Einbinden: tokens.css + components.css laden, dann <script type="module" src="fundament.js">.
import { ELEMENTS, VERSION } from './contract.generated.js';

export { VERSION };
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
    this.uid = `fd-${++uid}`;
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
  pass(target) { for (const n of this.c.passthrough) { const v = this.getAttribute(n); if (v === null) target.removeAttribute(n); else target.setAttribute(n, v); } }
  static define(tag) { this.tag = tag; if (!customElements.get(tag)) customElements.define(tag, this); }
}

class Button extends Base {
  // ARIA-Zustände, die an das innere <button> weitergereicht werden
  static aria = ['aria-pressed', 'aria-controls', 'aria-expanded', 'aria-label'];
  build() { this.innerHTML = '<button class="fd-button"><span class="fd-button__label"></span></button>'; }
  update() {
    const b = this.q('button');
    b.dataset.variant = this.a('variant'); b.dataset.size = this.a('size');
    if (this.a('state') === 'default') delete b.dataset.state; else b.dataset.state = this.a('state');
    b.disabled = this.a('disabled'); b.type = this.getAttribute('type') || 'button';
    for (const n of ['name', 'value']) { const v = this.getAttribute(n); if (v === null) b.removeAttribute(n); else b.setAttribute(n, v); }
    for (const n of Button.aria) { const v = this.getAttribute(n); if (v === null) b.removeAttribute(n); else b.setAttribute(n, v); }
    this.q('.fd-button__label').textContent = this.a('label');
  }
}

class TextField extends Base {
  build() {
    const id = this.uid;
    this.innerHTML = `<div class="fd-text-field"><label class="fd-text-field__label" for="${id}"></label><div class="fd-text-field__control"><input class="fd-text-field__input" id="${id}"><span class="fd-text-field__trailing"></span></div><span class="fd-text-field__helper-text" id="${id}-h"></span><span class="fd-text-field__error-text" id="${id}-e"></span></div>`;
    this.q('.fd-text-field__trailing').append(...this.slotted.trailing);
    this.q('input').value = this.getAttribute('value') ?? '';
  }
  update() {
    const state = this.a('state'), input = this.q('input'), err = state === 'error';
    this.q('.fd-text-field').dataset.state = state;
    this.q('label').textContent = this.a('label');
    this.pass(input); if (!this.hasAttribute('type')) input.type = 'text';
    if (document.activeElement !== input && this.hasAttribute('value') && input.value !== this.getAttribute('value') && !this.dirty) input.value = this.getAttribute('value');
    input.disabled = state === 'disabled';
    const help = this.q('.fd-text-field__helper-text'), error = this.q('.fd-text-field__error-text');
    help.textContent = this.a('helper-text'); error.textContent = this.a('error-text');
    help.hidden = err || !this.a('show-helper') || !this.a('helper-text'); error.hidden = !err;
    if (err) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', error.id); } else { input.removeAttribute('aria-invalid'); if (help.hidden) input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', help.id); }
    this.q('.fd-text-field__trailing').hidden = !this.a('show-trailing');
    if (!this.listening) {
      this.listening = true; input.addEventListener('input', () => { this.dirty = true; });
      // Verhalten des Slots trailing: reveal schaltet die Sichtbarkeit des Passworts, clear leert das Feld
      this.q('.fd-text-field__trailing').addEventListener('click', (e) => {
        const b = e.target.closest('fd-button'); const action = this.a('trailing-action'); if (!b || action === 'none') return;
        if (action === 'reveal') { const show = input.type === 'password'; input.type = show ? 'text' : 'password'; this.revealed = show; b.setAttribute('label', show ? 'Verbergen' : 'Anzeigen'); b.setAttribute('aria-pressed', String(show)); }
        if (action === 'clear') { input.value = ''; this.dirty = true; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
      });
    }
    if (this.a('trailing-action') === 'reveal') { input.type = this.revealed ? 'text' : 'password'; const b = this.q('.fd-text-field__trailing fd-button'); if (b && !b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false'); if (b) b.setAttribute('aria-controls', input.id); }
  }
  get value() { return this.q('input')?.value ?? this.getAttribute('value') ?? ''; }
  set value(v) { if (this.ready) this.q('input').value = v; else this.setAttribute('value', v); }
  get input() { return this.q('input'); }
}

class Checkbox extends Base {
  build() { const id = this.uid; this.innerHTML = `<div class="fd-checkbox-field"><label class="fd-checkbox"><input class="fd-checkbox__box" type="checkbox"><span class="fd-checkbox__label"></span></label><span class="fd-checkbox__helper-text" id="${id}-h"></span></div>`; this.q('input').checked = this.a('checked'); }
  update() {
    const input = this.q('input'), help = this.q('.fd-checkbox__helper-text');
    if (!this.touched) input.checked = this.a('checked');
    input.disabled = this.a('disabled'); this.pass(input);
    const l = this.q('.fd-checkbox'); if (this.a('state') === 'focus') l.dataset.state = 'focus'; else delete l.dataset.state;
    this.q('.fd-checkbox__label').textContent = this.a('label');
    help.textContent = this.a('helper-text'); help.hidden = !this.a('show-helper') || !this.a('helper-text');
    if (help.hidden) input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', help.id);
    if (!this.listening) { this.listening = true; input.addEventListener('change', () => { this.touched = true; }); }
  }
  get checked() { return this.q('input')?.checked ?? this.a('checked'); }
  set checked(v) { this.touched = true; if (this.ready) this.q('input').checked = !!v; }
}

class Switch extends Base {
  build() { const id = this.uid; this.innerHTML = `<div class="fd-switch"><button class="fd-switch__track" type="button" role="switch" id="${id}"><span class="fd-switch__thumb"></span></button><label class="fd-switch__label" for="${id}"></label><span class="fd-switch__helper-text" id="${id}-h"></span></div>`; this.on = this.a('checked'); }
  update() {
    const b = this.q('button'), help = this.q('.fd-switch__helper-text');
    if (!this.touched) this.on = this.a('checked');
    b.setAttribute('aria-checked', String(this.on)); b.disabled = this.a('disabled');
    if (this.a('state') === 'focus') b.dataset.state = 'focus'; else delete b.dataset.state;
    this.q('.fd-switch__label').textContent = this.a('label');
    help.textContent = this.a('helper-text'); help.hidden = !this.a('show-helper') || !this.a('helper-text');
    if (help.hidden) b.removeAttribute('aria-describedby'); else b.setAttribute('aria-describedby', help.id);
    if (!this.listening) { this.listening = true; b.addEventListener('click', () => { this.touched = true; this.on = !this.on; b.setAttribute('aria-checked', String(this.on)); this.dispatchEvent(new Event('change', { bubbles: true })); }); }
  }
  get checked() { return !!this.on; }
  set checked(v) { this.touched = true; this.on = !!v; if (this.ready) this.q('button').setAttribute('aria-checked', String(this.on)); }
}

class Badge extends Base {
  build() { this.innerHTML = '<span class="fd-badge"><span class="fd-badge__label"></span></span>'; }
  update() { this.q('.fd-badge').dataset.tone = this.a('tone'); this.q('.fd-badge__label').textContent = this.a('label'); }
}

class Alert extends Base {
  build() { this.innerHTML = '<div class="fd-alert"><p class="fd-alert__title"></p><p class="fd-alert__description"></p></div>'; }
  update() {
    const tone = this.a('tone'), box = this.q('.fd-alert'), d = this.q('.fd-alert__description');
    box.dataset.tone = tone; box.setAttribute('role', tone === 'warning' || tone === 'danger' ? 'alert' : 'status');
    this.q('.fd-alert__title').textContent = this._title ?? ''; d.textContent = this.a('description'); d.hidden = !this.a('description');
  }
}

class Card extends Base {
  build() { this.innerHTML = '<section class="fd-card"><div class="fd-card__header"><h2 class="fd-card__title"></h2><span class="fd-card__badge"></span></div><p class="fd-card__body"></p><div class="fd-card__footer"></div></section>'; this.q('.fd-card__footer').append(...this.slotted.action); this.q('.fd-card__badge').append(...this.slotted.badge); }
  update() {
    this.q('.fd-card__title').textContent = this._title ?? ''; this.q('.fd-card__body').textContent = this.a('body');
    const f = this.q('.fd-card__footer'); f.hidden = !this.a('show-footer') || !f.children.length;
    const g = this.q('.fd-card__badge'); g.hidden = !this.a('show-badge') || !g.children.length;
  }
}

class SignInForm extends Base {
  build() {
    this.innerHTML = `<form class="fd-sign-in-form"><h2 class="fd-sign-in-form__title">Anmelden</h2>
<fd-text-field label="E-Mail-Adresse" name="email" type="email" autocomplete="email" show-helper="false"></fd-text-field>
<fd-text-field label="Passwort" name="password" type="password" autocomplete="current-password" helper-text="Mindestens 12 Zeichen." show-trailing trailing-action="reveal"><fd-button slot="trailing" variant="ghost" size="sm" label="Anzeigen"></fd-button></fd-text-field>
<fd-checkbox label="Angemeldet bleiben" name="remember"></fd-checkbox>
<fd-button class="fd-sign-in-form__submit" type="submit" label="Anmelden"></fd-button></form>`;
  }
  update() {}
}

class Link extends Base {
  build() { this.innerHTML = '<a class="fd-link"><span class="fd-link__label"></span></a>'; }
  update() { const a = this.q('a'); this.pass(a); if (this.a('state') === 'default') delete a.dataset.state; else a.dataset.state = this.a('state'); this.q('.fd-link__label').textContent = this.a('label'); }
}

// Muster: Der danger-Button wird erst aktiv, wenn das Bestätigungswort im Feld steht. Meldet dann beim Klick das Ereignis "confirm".
class ConfirmAction extends Base {
  build() {
    this.innerHTML = '<div class="fd-confirm-action"><fd-text-field autocomplete="off" helper-text="Der Button wird aktiv, sobald die Eingabe stimmt."></fd-text-field><fd-button variant="danger" disabled></fd-button></div>';
    this.addEventListener('input', () => this.sync());
    this.q('fd-button').addEventListener('click', () => { if (this.matches) this.dispatchEvent(new Event('confirm', { bubbles: true })); });
  }
  get matches() { return this.q('fd-text-field').value.trim() === this.a('word').trim() && this.a('word').trim() !== ''; }
  sync() { const b = this.q('fd-button'); if (this.matches) b.removeAttribute('disabled'); else b.setAttribute('disabled', ''); }
  update() { this.q('fd-text-field').setAttribute('label', this.a('field-label')); this.q('fd-button').setAttribute('label', this.a('action-label')); this.sync(); }
}

class LinkButton extends Base {
  build() { this.innerHTML = '<a class="fd-link-button"><span class="fd-link-button__label"></span></a>'; }
  update() { this.q('.fd-link-button__label').textContent = this.a('label'); }
}

const CLASSES = { 'fd-button': Button, 'fd-text-field': TextField, 'fd-checkbox': Checkbox, 'fd-switch': Switch, 'fd-badge': Badge, 'fd-alert': Alert, 'fd-card': Card, 'fd-link': Link, 'fd-sign-in-form': SignInForm, 'fd-confirm-action': ConfirmAction, 'fd-link-button': LinkButton };
for (const tag of Object.keys(ELEMENTS)) {
  if (!CLASSES[tag]) { console.warn(`Für <${tag}> aus dem Vertrag fehlt die Umsetzung in fundament.js.`); continue; }
  CLASSES[tag].define(tag);
}
for (const tag of Object.keys(CLASSES)) if (!ELEMENTS[tag]) console.warn(`<${tag}> ist umgesetzt, steht aber nicht im Vertrag.`);
