<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Card
Status: stable · v1.1.0 · Spec: ds/card
Gruppiert zusammengehörige Inhalte mit optionaler Aktion.
```html
<script type="module">import "@fundament/ui";</script>
<fd-card title="Kartentitel" body="Kurze Beschreibung des Inhalts in ein bis zwei Sätzen."></fd-card>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Hinweise und Rückmeldungen: stattdessen `Alert`

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `title` | text | – | Kartentitel |
| `body` | text | – | Kurze Beschreibung des Inhalts in ein bis zwei Sätzen. |
| `showFooter` | boolean | – | true |
| `action` | instance | – | Button |
| `showBadge` | boolean | – | false |
| `badge` | instance | – | Badge |

## Slots

- `action`: Standard Button
- `badge`: Standard Badge

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `default` | bg: `bg/surface`, body: `text/secondary`, border: `border/default`, borderWidth: `default`, fg: `text/primary` |

## Regeln

- **Höchstens eine Aktion im Footer.** Warum: Karten sind Einstiege, keine Formulare. (`card/one-action`, Check: `max-children`)
- **Keine Karten in Karten.** Warum: Verschachtelte Rahmen zerstören die Hierarchie. (`card/no-nesting`, Check: `no-nesting`)
- **Eine Kennzeichnung der Karte (z. B. „Aktuell“) gehört in den Slot badge, nicht daneben oder darüber.** Warum: Nur im Slot bleibt die Kennzeichnung beim Umbruch an der Karte. (`card/badge-slot`, Check: `slot-content`)

## Barrierefreiheit

Titel als Überschrift passender Ebene; ist die ganze Karte klickbar, nur ein Link darin.

## Do

- Eine klare Aktion

## Don't

- Karte in Karte
- Drei Buttons im Footer
