<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Switch
Status: stable · v1.0.0 · Spec: ds/switch
Schaltet eine Einstellung sofort ein oder aus, ohne Speichern.
```html
<script type="module">import "@fundament/ui";</script>
<fd-switch label="E-Mail-Benachrichtigungen" helper-text="Wir schreiben dir höchstens einmal pro Woche."></fd-switch>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `checked` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `focus` | default |
| `label` | text | – | E-Mail-Benachrichtigungen |
| `helperText` | text | – | Wir schreiben dir höchstens einmal pro Woche. |
| `showHelper` | boolean | – | false |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `checked=false, disabled=false, state=default` | bg: `border/input`, fg: `text/primary`, helper: `text/secondary`, thumb: `text/on-action` |
| `checked=false, disabled=false, state=focus` | bg: `border/input`, fg: `text/primary`, helper: `text/secondary`, ring: `focus/ring`, ringWidth: `strong`, thumb: `text/on-action` |
| `checked=false, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled`, helper: `text/secondary`, thumb: `text/disabled` |
| `checked=true, disabled=false, state=default` | bg: `action/primary`, fg: `text/primary`, helper: `text/secondary`, thumb: `text/on-action` |
| `checked=true, disabled=false, state=focus` | bg: `action/primary`, fg: `text/primary`, helper: `text/secondary`, ring: `focus/ring`, ringWidth: `strong`, thumb: `text/on-action` |
| `checked=true, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled`, helper: `text/secondary`, thumb: `text/disabled` |

## Regeln

- **Nur für Einstellungen, die sofort wirken. Braucht es Speichern, eine Checkbox verwenden.** Warum: Ein Schalter verspricht, dass die Änderung schon gilt. (`switch/immediate`, manuell)
- **Ist der Schalter deaktiviert, erklärt helperText den Grund.** Warum: Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler. (`switch/disabled-reason`, Check: `required-when-disabled`)

## Barrierefreiheit

Als <button role="switch"> mit aria-checked umsetzen; das Label benennt die Einstellung, nicht den Zustand.

## Do

- „E-Mail-Benachrichtigungen“

## Don't

- „An“ oder „Aus“ als Label
- Schalter in einem Formular mit Speichern-Button
