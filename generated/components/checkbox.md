<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Checkbox
Status: stable · v1.2.0 · Spec: ds/checkbox
Auswahl einer unabhängigen Option, die man an- oder abwählen kann.
```html
<script type="module">import "@fundament/ui";</script>
<fd-checkbox label="Angemeldet bleiben" helper-text="Du kannst das später ändern."></fd-checkbox>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

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
| `default` | bg: `bg/surface`, fg: `text/primary`, border: `border/input`, borderWidth: `default`, helper: `text/secondary` |
| `checked=true` | bg: `action/primary`, mark: `text/on-action`, border: entfällt, borderWidth: entfällt |
| `state=focus` | ring: `focus/ring`, ringWidth: `strong` |
| `disabled=true` | bg: `bg/disabled`, fg: `text/disabled` |
| `checked=true, disabled=true` | mark: `text/disabled` |

## Regeln

- **Das Label ist Teil der Klickfläche.** Warum: Die Box allein ist mit 20 px zu klein für Touch. (`checkbox/label-clickable`, manuell)
- **Ist die Checkbox deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`checkbox/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Natives <input type="checkbox"> mit <label>; Klickfläche mindestens 44 × 44 px.

## Do

- Kurzes Label in Satzschreibung

## Don't

- Checkbox für sofort wirksame Einstellungen (dafür Switch)
