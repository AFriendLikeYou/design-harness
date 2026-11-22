<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# TextField
Status: stable · v1.3.0 · Spec: ds/text-field
Einzeilige Texteingabe mit sichtbarem Label und optionalem Hilfstext.
```html
<script type="module">import "@fundament/ui";</script>
<fd-text-field label="E-Mail-Adresse" value="name@beispiel.de" helper-text="Wir senden dir einen Bestätigungslink." error-text="Bitte gib eine gültige E-Mail-Adresse ein."></fd-text-field>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `state` | variant | `default`, `focus`, `error`, `disabled` | default |
| `label` | text | – | E-Mail-Adresse |
| `value` | text | – | name@beispiel.de |
| `helperText` | text | – | Wir senden dir einen Bestätigungslink. |
| `showHelper` | boolean | – | true |
| `errorText` | text | – | Bitte gib eine gültige E-Mail-Adresse ein. |
| `showTrailing` | boolean | – | false |
| `trailing` | instance | – | Button |
| `trailingAction` | behavior | `none`, `reveal`, `clear` | none |

## Slots

- `trailing`: Standard Button

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `state=default` | bg: `bg/surface`, fg: `text/primary`, border: `border/input`, borderWidth: `default`, helper: `text/secondary` |
| `state=focus` | ring: `focus/ring`, ringWidth: `strong` |
| `state=error` | border: `feedback/danger-fg`, borderWidth: `strong`, helper: `feedback/danger-fg` |
| `state=disabled` | bg: `bg/disabled`, fg: `text/disabled` |

## Regeln

- **Label ist immer sichtbar, nie nur als Platzhalter.** Warum: Platzhalter verschwinden beim Tippen und sind für Screenreader unzuverlässig. (`textfield/visible-label`, Check: `required-prop`)
- **Im Fehlerzustand ersetzt errorText den Hilfstext und erklärt, wie man den Fehler behebt.** Warum: Rot allein sagt nicht, was zu tun ist. (`textfield/error-text`, manuell)
- **Aktionen im Feld (Passwort anzeigen, Eingabe leeren) nur über den Slot trailing, mit einem Button variant=ghost size=sm.** Warum: Selbst über das Feld gelegte Knöpfe verlieren Fokusreihenfolge und Abstände. (`textfield/trailing-slot`, Check: `slot-content`)
- **Passwort anzeigen und Eingabe leeren kommen über trailingAction (reveal, clear), nicht über eigenes Skript.** Warum: Nur so stimmen Beschriftung, aria-pressed und Fokus bei jedem Feld überein. (`textfield/trailing-behavior`, manuell)

## Barrierefreiheit

Label per <label for> verknüpfen, Hilfs- und Fehlertext per aria-describedby; Fehler mit aria-invalid.

## Do

- „Bitte gib eine gültige E-Mail-Adresse ein.“

## Don't

- Nur roter Rahmen ohne Text
- Label als Platzhalter
