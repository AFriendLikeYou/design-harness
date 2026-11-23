<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# TextButton
Status: stable · v0.1.0 · Spec: ds/text-button
Zurückhaltende Aktion ohne Fläche, etwa in Leisten und neben Inhalten.
```html
<script type="module">import "@zeit/zds-probe";</script>
<z-ds-text-button label="Merken"></z-ds-text-button>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `size` | variant | `default`, `slim`, `large` | default |
| `bold` | variant | `false`, `true` | false |
| `disabled` | variant | `false`, `true` | false |
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Merken |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `default` | fg: `text/70` |
| `state=hover` | bg: `background/10`, fg: `text/100` |
| `state=focus` | ring: `focus/100`, ringWidth: `strong` |

## Regeln

- **Beschriftung beginnt mit einem Verb und nennt das Ergebnis.** Warum: Man weiß vor dem Klick, was passiert. (`textbutton/label-verb`, manuell)

## Barrierefreiheit

Als <button> umsetzen. Die Variante On Image des ZDS ist in der Probe nicht übertragen.

## Do

- „Merken“
- „Teilen“

## Don't

- Text-Button als Hauptaktion einer Seite
