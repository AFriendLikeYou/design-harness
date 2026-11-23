<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Link
Status: stable · v1.0.0 · Spec: ds/link
Führt zu einer anderen Seite oder Stelle. Für Aktionen einen Button verwenden.
```html
<script type="module">import "@fundament/ui";</script>
<fd-link href="#" label="Alle Rechnungen ansehen"></fd-link>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Aktionen ohne Ziel: stattdessen `Button`

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `state` | variant | `default`, `hover`, `focus` | default |
| `label` | text | – | Alle Rechnungen ansehen |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `state=default` | fg: `feedback/info-fg` |
| `state=focus` | fg: `feedback/info-fg`, ring: `focus/ring`, ringWidth: `strong` |
| `state=hover` | fg: `text/primary` |

## Regeln

- **Der Linktext nennt das Ziel.** Warum: „Hier“ oder „Mehr“ sagen nicht, wohin es geht, und sind in einer Linkliste nicht unterscheidbar. (`link/names-destination`, Check: `no-vague-action`)
- **Ein Link hat immer ein Ziel (href).** Warum: Ohne Ziel ist er eine Aktion und gehört in einen Button. (`link/has-target`, Check: `required-prop`)

## Barrierefreiheit

Als <a href> umsetzen. Öffnet der Link ein neues Fenster, steht das im Text.

## Do

- „Alle Rechnungen ansehen“

## Don't

- „Hier“
- Link, der etwas speichert oder löscht
