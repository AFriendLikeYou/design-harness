<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Toggle
Status: stable · v0.1.0 · Spec: ds/toggle
Schaltet eine Einstellung sofort ein oder aus.
```html
<script type="module">import "@zeit/zds-probe";</script>
<z-ds-toggle label="Was jetzt? Der Morgenüberblick" helper-text="Montag bis Freitag um 6 Uhr."></z-ds-toggle>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `checked` | variant | `false`, `true` | false |
| `state` | variant | `default`, `focus` | default |
| `label` | text | – | Was jetzt? Der Morgenüberblick |
| `helperText` | text | – | Montag bis Freitag um 6 Uhr. |
| `showHelper` | boolean | – | false |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `checked=false` | bg: `background/20`, thumb: `general/white-100`, fg: `text/100`, helper: `text/70` |
| `checked=true` | bg: `text/100` |
| `state=focus` | ring: `focus/100`, ringWidth: `strong` |

## Regeln

- **Der Toggle hat immer eine sichtbare Beschriftung; sie gehört zur Klickfläche.** Warum: Die Bahn misst 26 × 16 px und ist allein zu klein. Die ZDS-Doku behilft sich mit aria-label. (`toggle/needs-label`, Check: `required-prop`)
- **Nur für Einstellungen, die sofort wirken.** Warum: Ein Schalter verspricht, dass die Änderung schon gilt. (`toggle/immediate`, manuell)

## Barrierefreiheit

Als <button role="switch"> mit aria-checked. Einen deaktivierten Zustand gibt es im ZDS nicht.

## Do

- Beschriftung nennt die Einstellung

## Don't

- „An“ oder „Aus“ als Beschriftung
