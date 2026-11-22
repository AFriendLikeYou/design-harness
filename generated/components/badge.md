<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Badge
Status: stable · v1.0.0 · Spec: ds/badge
Kurzer Status oder Kategorie, nicht interaktiv.
```html
<script type="module">import "@fundament/ui";</script>
<fd-badge label="Neu"></fd-badge>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `tone` | variant | `neutral`, `info`, `success`, `warning`, `danger` | neutral |
| `label` | text | – | Neu |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `tone=neutral` | bg: `bg/subtle`, fg: `text/secondary` |
| `tone=info` | bg: `feedback/info-bg`, fg: `feedback/info-fg` |
| `tone=success` | bg: `feedback/success-bg`, fg: `feedback/success-fg` |
| `tone=warning` | bg: `feedback/warning-bg`, fg: `feedback/warning-fg` |
| `tone=danger` | bg: `feedback/danger-bg`, fg: `feedback/danger-fg` |

## Regeln

- **Höchstens zwei Wörter.** Warum: Badges werden überflogen, nicht gelesen. (`badge/short-label`, Check: `max-words`)
- **Nie klickbar; für Filter einen Chip verwenden.** Warum: Badges sehen nicht nach Bedienelement aus. (`badge/not-interactive`, manuell)

## Barrierefreiheit

Bedeutung steht im Text, nicht nur in der Farbe.

## Do

- „Entwurf“
- „Veröffentlicht“

## Don't

- Ganze Sätze
- Badge als Button
