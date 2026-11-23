<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Checkbox
Status: stable · v0.1.0 · Spec: ds/checkbox
Auswahl einer unabhängigen Option.
```html
<script type="module">import "@zeit/zds-probe";</script>
<z-ds-checkbox label="Auch Angebote der ZEIT erhalten" helper-text="Abbestellen ist jederzeit möglich."></z-ds-checkbox>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `checked` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Auch Angebote der ZEIT erhalten |
| `helperText` | text | – | Abbestellen ist jederzeit möglich. |
| `showHelper` | boolean | – | false |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `checked=false, disabled=false, state=default` | bg: `background-0`, border: `border-100`, borderWidth: `default`, fg: `text-100`, helper: `text-70` |
| `checked=false, disabled=false, state=focus` | bg: `background-0`, border: `border-100`, borderWidth: `default`, fg: `text-100`, helper: `text-70`, ring: `focus-100`, ringWidth: `strong` |
| `checked=false, disabled=false, state=hover` | bg: `background-10`, border: `border-100`, borderWidth: `default`, fg: `text-100`, helper: `text-70` |
| `checked=false, disabled=true, state=default` | bg: `background-0`, border: `border-70`, borderWidth: `default`, fg: `text-40`, helper: `text-70` |
| `checked=true, disabled=false, state=default` | bg: `text-100`, border: `text-100`, borderWidth: `default`, fg: `text-100`, helper: `text-70`, mark: `general-white-100` |
| `checked=true, disabled=false, state=hover` | bg: `text-70`, border: `text-70`, borderWidth: `default`, fg: `text-100`, helper: `text-70`, mark: `general-white-100` |
| `checked=true, disabled=true, state=default` | bg: `text-40`, border: `text-40`, borderWidth: `default`, fg: `text-40`, helper: `text-70`, mark: `general-white-100` |

## Regeln

- **Die Checkbox hat immer eine sichtbare Beschriftung; sie gehört zur Klickfläche.** Warum: Die ZDS-Checkbox ist als Kästchen von 16 px dokumentiert. Allein ist sie zu klein und hat keinen Namen. (`checkbox/needs-label`, Check: `required-prop`)
- **Ist die Checkbox deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`checkbox/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Natives <input type="checkbox"> in einem <label>. Die ZDS-Doku beschreibt nur ein <span>; das ist nicht bedienbar.

## Do

- Kurze Beschriftung in Satzschreibung

## Don't

- Kästchen ohne Beschriftung
