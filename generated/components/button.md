<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
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
| `variant=danger, size=md, disabled=false, state=default` | bg: `action/danger`, fg: `text/on-action` |
| `variant=danger, size=md, disabled=false, state=focus` | bg: `action/danger`, fg: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=danger, size=md, disabled=false, state=hover` | bg: `action/danger-hover`, fg: `text/on-action` |
| `variant=danger, size=md, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `variant=danger, size=sm, disabled=false, state=default` | bg: `action/danger`, fg: `text/on-action` |
| `variant=danger, size=sm, disabled=false, state=focus` | bg: `action/danger`, fg: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=danger, size=sm, disabled=false, state=hover` | bg: `action/danger-hover`, fg: `text/on-action` |
| `variant=danger, size=sm, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `variant=ghost, size=md, disabled=false, state=default` | fg: `feedback/info-fg` |
| `variant=ghost, size=md, disabled=false, state=focus` | fg: `feedback/info-fg`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=ghost, size=md, disabled=false, state=hover` | bg: `bg/subtle`, fg: `feedback/info-fg` |
| `variant=ghost, size=md, disabled=true, state=default` | fg: `text/disabled` |
| `variant=ghost, size=sm, disabled=false, state=default` | fg: `feedback/info-fg` |
| `variant=ghost, size=sm, disabled=false, state=focus` | fg: `feedback/info-fg`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=ghost, size=sm, disabled=false, state=hover` | bg: `bg/subtle`, fg: `feedback/info-fg` |
| `variant=ghost, size=sm, disabled=true, state=default` | fg: `text/disabled` |
| `variant=primary, size=md, disabled=false, state=default` | bg: `action/primary`, fg: `text/on-action` |
| `variant=primary, size=md, disabled=false, state=focus` | bg: `action/primary`, fg: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=primary, size=md, disabled=false, state=hover` | bg: `action/primary-hover`, fg: `text/on-action` |
| `variant=primary, size=md, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `variant=primary, size=sm, disabled=false, state=default` | bg: `action/primary`, fg: `text/on-action` |
| `variant=primary, size=sm, disabled=false, state=focus` | bg: `action/primary`, fg: `text/on-action`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=primary, size=sm, disabled=false, state=hover` | bg: `action/primary-hover`, fg: `text/on-action` |
| `variant=primary, size=sm, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `variant=secondary, size=md, disabled=false, state=default` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `variant=secondary, size=md, disabled=false, state=focus` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=secondary, size=md, disabled=false, state=hover` | bg: `bg/subtle`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `variant=secondary, size=md, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |
| `variant=secondary, size=sm, disabled=false, state=default` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `variant=secondary, size=sm, disabled=false, state=focus` | bg: `bg/surface`, border: `border/input`, borderWidth: `default`, fg: `text/primary`, ring: `focus/ring`, ringWidth: `strong` |
| `variant=secondary, size=sm, disabled=false, state=hover` | bg: `bg/subtle`, border: `border/input`, borderWidth: `default`, fg: `text/primary` |
| `variant=secondary, size=sm, disabled=true, state=default` | bg: `bg/disabled`, fg: `text/disabled` |

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
