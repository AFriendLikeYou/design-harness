<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
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
| `checked=false` | bg: `background/0`, border: `border/100`, borderWidth: `default`, fg: `text/100`, helper: `text/70` |
| `checked=false, state=hover` | bg: `background/10` |
| `checked=true` | bg: `text/100`, mark: `general/white-100` |
| `checked=true, state=hover` | bg: `text/70` |
| `state=focus` | ring: `focus/100`, ringWidth: `strong` |
| `disabled=true` | border: `border/70`, fg: `text/40` |
| `checked=true, disabled=true` | bg: `text/40` |

## Regeln

- **Die Checkbox hat immer eine sichtbare Beschriftung; sie gehört zur Klickfläche.** Warum: Die ZDS-Checkbox ist als Kästchen von 16 px dokumentiert. Allein ist sie zu klein und hat keinen Namen. (`checkbox/needs-label`, Check: `required-prop`)
- **Ist die Checkbox deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`checkbox/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Natives <input type="checkbox"> in einem <label>. Die ZDS-Doku beschreibt nur ein <span>; das ist nicht bedienbar.

## Do

- Kurze Beschriftung in Satzschreibung

## Don't

- Kästchen ohne Beschriftung
