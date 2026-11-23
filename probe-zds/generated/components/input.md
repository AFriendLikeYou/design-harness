<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Input
Status: stable · v0.1.0 · Spec: ds/input
Einzeilige Texteingabe.
```html
<script type="module">import "@zeit/zds-probe";</script>
<z-ds-input label="E-Mail-Adresse" value="name@beispiel.de" helper-text="Wir schicken dir einen Bestätigungslink." error-text="Bitte gib eine gültige E-Mail-Adresse ein."></z-ds-input>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `state` | variant | `default`, `focus`, `error`, `disabled` | default |
| `label` | text | – | E-Mail-Adresse |
| `value` | text | – | name@beispiel.de |
| `helperText` | text | – | Wir schicken dir einen Bestätigungslink. |
| `showHelper` | boolean | – | true |
| `errorText` | text | – | Bitte gib eine gültige E-Mail-Adresse ein. |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `default` | bg: `background/0`, fg: `text/100`, border: `border/100`, borderWidth: `default`, helper: `text/70` |
| `state=focus` | border: `text/55` |
| `state=error` | border: `error/70`, helper: `error/70` |
| `state=disabled` | fg: `text/40` |

## Regeln

- **Der Input hat immer eine sichtbare Beschriftung.** Warum: Das ZDS dokumentiert den Input nur mit Platzhalter und aria-label. Platzhalter verschwinden beim Tippen. (`input/visible-label`, Check: `required-prop`)
- **Im Fehlerzustand erklärt errorText, wie man den Fehler behebt.** Warum: Das ZDS färbt nur den Rahmen. Rot allein sagt nicht, was zu tun ist. (`input/error-text`, manuell)

## Barrierefreiheit

<label for> mit dem Feld verknüpfen, Fehlertext per aria-describedby, Fehler mit aria-invalid. Der Fokus zeigt sich im ZDS nur als dunklerer Rahmen; die Extras Leading Icon und Dropdown sind in der Probe nicht übertragen.

## Do

- Beschriftung über dem Feld

## Don't

- Platzhalter als einzige Beschriftung
