<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Radio
Status: beta · v0.1.0 · Spec: ds/radio
Eine Auswahl aus mehreren. Steht immer in einer Gruppe von mindestens zwei.
```html
<script type="module">import "@fundament/ui";</script>
<fd-radio label="Monatlich zahlen" helper-text="Du kannst jederzeit wechseln."></fd-radio>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Eine einzelne Ja-oder-Nein-Frage: stattdessen `Checkbox`
- Mehr als fünf Optionen: dafür gibt es noch keinen Baustein, Lücke melden

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `checked` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `focus` | default |
| `label` | text | – | Monatlich zahlen |
| `helperText` | text | – | Du kannst jederzeit wechseln. |
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

- **Mindestens zwei Radios mit demselben name bilden eine Gruppe.** Warum: Ein einzelnes Radio lässt sich nicht wieder abwählen. (`radio/in-group`, Check: `min-per-group`)
- **Ist das Radio deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`radio/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Natives <input type="radio"> mit <label>. Die Gruppe bekommt eine gemeinsame Überschrift, die sagt, worum es geht.

## Do

- Zwei bis fünf Optionen
- Eine Option ist vorausgewählt

## Don't

- Radio für eine einzelne Ja-oder-Nein-Frage (dafür Checkbox oder Switch)
