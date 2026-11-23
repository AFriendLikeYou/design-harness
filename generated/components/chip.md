<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Chip
Status: beta · v0.1.0 · Spec: ds/chip
Filter zum An- und Abwählen. Mehrere Chips bilden eine Filterzeile.
```html
<script type="module">import "@fundament/ui";</script>
<fd-chip label="Kostenlos"></fd-chip>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Aktionen, die einmal etwas auslösen: stattdessen `Button`
- Status oder Kategorie ohne Bedienung: stattdessen `Badge`

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `selected` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Kostenlos |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `selected=false, disabled=false, state=default` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `selected=false, disabled=false, state=focus` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary`, ring: `focus/ring`, ringWidth: `strong` |
| `selected=false, disabled=false, state=hover` | bg: `bg/subtle`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `selected=false, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `selected=true, disabled=false, state=default` | bg: `action/primary`, fg: `text/on-action` |
| `selected=true, disabled=false, state=focus` | bg: `action/primary`, fg: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `selected=true, disabled=false, state=hover` | bg: `action/primary-hover`, fg: `text/on-action` |
| `selected=true, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |

## Regeln

- **Höchstens zwei Wörter.** Warum: Eine Filterzeile wird überflogen und soll in eine Zeile passen. (`chip/short-label`, Check: `max-words`)
- **Nur zum Filtern oder Auswählen. Für Aktionen einen Button verwenden.** Warum: Ein Chip bleibt gewählt, eine Aktion passiert einmal. (`chip/filter-only`, manuell)

## Barrierefreiheit

Als <button> mit aria-pressed umsetzen. Die Beschriftung nennt den Filter, nicht den Zustand.

## Do

- „Kostenlos“
- „Diese Woche“

## Don't

- Chip als Aktion, zum Beispiel „Speichern“
- „An“ oder „Aus“ als Beschriftung
