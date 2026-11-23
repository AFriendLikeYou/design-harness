<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Checkbox
Status: stable · v1.2.0 · Spec: ds/checkbox
Auswahl einer unabhängigen Option, die man an- oder abwählen kann.
```html
<script type="module">import "@fundament/ui";</script>
<fd-checkbox label="Angemeldet bleiben" helper-text="Du kannst das später ändern."></fd-checkbox>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Einstellungen, die sofort wirken: stattdessen `Switch`
- Eine Auswahl aus mehreren: stattdessen `Radio`

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `checked` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `focus` | default |
| `label` | text | – | Angemeldet bleiben |
| `helperText` | text | – | Du kannst das später ändern. |
| `showHelper` | boolean | – | false |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `checked=false, disabled=false, state=default` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary`, helper: `text/secondary` |
| `checked=false, disabled=false, state=focus` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary`, helper: `text/secondary`, ring: `focus/ring`, ringWidth: `strong` |
| `checked=false, disabled=true, state=default` | bg: `bg/disabled`, border: `border/input`, borderWidth: `default`, fg: `text/disabled`, helper: `text/secondary` |
| `checked=true, disabled=false, state=default` | bg: `action/primary`, fg: `text/primary`, helper: `text/secondary`, mark: `text/on-action` |
| `checked=true, disabled=false, state=focus` | bg: `action/primary`, fg: `text/primary`, helper: `text/secondary`, mark: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `checked=true, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled`, helper: `text/secondary`, mark: `text/disabled` |

## Regeln

- **Das Label ist Teil der Klickfläche.** Warum: Die Box allein ist mit 20 px zu klein für Touch. (`checkbox/label-clickable`, manuell)
- **Ist die Checkbox deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`checkbox/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Natives <input type="checkbox"> mit <label>; Klickfläche mindestens 44 × 44 px.

## Do

- Kurzes Label in Satzschreibung

## Don't

- Checkbox für sofort wirksame Einstellungen (dafür Switch)
