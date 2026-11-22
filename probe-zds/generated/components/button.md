<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Button
Status: stable · v0.1.0 · Spec: ds/button
Löst eine Aktion aus.
```html
<script type="module">import "@zeit/zds-probe";</script>
<z-ds-button label="Speichern"></z-ds-button>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `variant` | variant | `default`, `primary`, `zplus` | default |
| `fullwidth` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Speichern |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `variant=default` | bg: `background/10`, fg: `text/100` |
| `variant=default, state=hover` | bg: `background/20` |
| `variant=primary` | bg: `text/100`, fg: `background/0` |
| `variant=primary, state=hover` | bg: `text/70` |
| `variant=zplus` | bg: `accent/100`, fg: `general/white-100` |
| `variant=zplus, state=hover` | bg: `accent/70` |
| `state=focus` | ring: `focus/100`, ringWidth: `strong` |

## Regeln

- **Höchstens ein Primary-Button pro Ansicht.** Warum: Mehrere primäre Aktionen konkurrieren um Aufmerksamkeit. (`button/one-primary`, Check: `max-per-view`)
- **Beschriftung beginnt mit einem Verb und nennt das Ergebnis.** Warum: Man weiß vor dem Klick, was passiert. (`button/label-verb`, manuell)
- **variant=zplus nur für den Weg zu Z+-Inhalten oder zum Abo.** Warum: ZEIT-Rot ist die Farbe des Bezahlangebots; überall sonst verliert es diese Bedeutung. (`button/zplus-only-paid`, manuell)

## Barrierefreiheit

Als <button> umsetzen. :focus-visible zeigt eine 2-px-Outline in focus/100. Deaktiviert senkt die Deckkraft auf 50 %.

## Do

- „Einstellungen speichern“

## Don't

- „Click me“
- Zwei Primary-Buttons nebeneinander
