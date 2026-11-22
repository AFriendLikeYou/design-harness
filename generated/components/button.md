<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Button
Status: stable · v1.4.1 · Spec: ds/button
Löst eine Aktion aus. Für Navigation zu einer anderen Seite einen Link verwenden.
```html
<script type="module">import "@fundament/ui";</script>
<fd-button label="Speichern"></fd-button>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `variant` | variant | `primary`, `secondary`, `ghost`, `danger` | primary |
| `size` | variant | `md`, `sm` | md |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Speichern |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `variant=primary` | bg: `action/primary`, fg: `text/on-action` |
| `variant=primary, state=hover` | bg: `action/primary-hover` |
| `variant=secondary` | bg: `bg/surface`, fg: `text/primary`, border: `border/input`, borderWidth: `default` |
| `variant=secondary, state=hover` | bg: `bg/subtle` |
| `variant=ghost` | fg: `feedback/info-fg` |
| `variant=ghost, state=hover` | bg: `bg/subtle` |
| `variant=danger` | bg: `action/danger`, fg: `text/on-action` |
| `variant=danger, state=hover` | bg: `action/danger-hover` |
| `state=focus` | ring: `focus/ring`, ringWidth: `strong` |
| `disabled=true` | bg: `bg/disabled`, fg: `text/disabled` |

## Regeln

- **Höchstens ein primärer Button pro Ansicht; ein danger-Button und ConfirmAction zählen als primär.** Warum: Mehrere primäre Aktionen konkurrieren um Aufmerksamkeit. (`button/one-primary`, Check: `max-per-view`)
- **Beschriftung beginnt mit einem Verb und nennt das Ergebnis.** Warum: Nutzer:innen wissen vor dem Klick, was passiert. (`button/label-verb`, manuell)
- **Farbe nur über variant, nie eigene Füllungen.** Warum: Sonst brechen Dark Mode und Kontrastgarantie. (`button/no-custom-colors`, Check: `no-raw-color`)
- **Hover und Fokus kommen aus der Komponente, nie selbst gestaltet.** Warum: Der Fokusring ist eine Zusage an Tastaturnutzer:innen und muss überall gleich aussehen. (`button/states-from-system`, manuell)
- **variant=danger nur für Aktionen, die etwas unwiderruflich löschen oder beenden, und nie als einzige Absicherung.** Warum: Rot warnt, schützt aber nicht vor einem versehentlichen Klick; es braucht zusätzlich eine Bestätigung. (`button/danger-confirm`, manuell)

## Barrierefreiheit

Immer als <button> umsetzen. Deaktiviert nur, wenn ein Hinweis erklärt, warum.

## Do

- „Änderungen speichern“
- Primär + sekundär nebeneinander

## Don't

- „Hier klicken“
- Zwei primäre Buttons nebeneinander
