<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# Alert
Status: stable · v1.0.2 · Spec: ds/alert
Hinweis im Seitenfluss zu Status, Erfolg, Warnung oder Fehler.
```html
<script type="module">import "@fundament/ui";</script>
<fd-alert title="Änderungen gespeichert" description="Deine Einstellungen gelten ab sofort."></fd-alert>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Nicht verwenden für

- Fehler an einem einzelnen Feld: stattdessen `TextField`
- Aktionen: dafür gibt es noch keinen Baustein, Lücke melden

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `tone` | variant | `info`, `success`, `warning`, `danger` | info |
| `title` | text | – | Änderungen gespeichert |
| `description` | text | – | Deine Einstellungen gelten ab sofort. |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `tone=danger` | bg: `feedback/danger-bg`, body: `text/primary`, border: `feedback/danger-fg`, borderWidth: `accent`, fg: `feedback/danger-fg` |
| `tone=info` | bg: `feedback/info-bg`, body: `text/primary`, border: `feedback/info-fg`, borderWidth: `accent`, fg: `feedback/info-fg` |
| `tone=success` | bg: `feedback/success-bg`, body: `text/primary`, border: `feedback/success-fg`, borderWidth: `accent`, fg: `feedback/success-fg` |
| `tone=warning` | bg: `feedback/warning-bg`, body: `text/primary`, border: `feedback/warning-fg`, borderWidth: `accent`, fg: `feedback/warning-fg` |

## Regeln

- **Höchstens ein Alert pro Bereich.** Warum: Mehrere Hinweise übereinander werden ignoriert. (`alert/one-per-area`, Check: `max-per-parent`)
- **Titel nennt das Ergebnis, Beschreibung den nächsten Schritt.** Warum: Man soll den Titel allein verstehen können. (`alert/title-states-outcome`, manuell)
- **Ein Alert enthält keine Aktion. Die Beschreibung nennt den nächsten Schritt, die Aktion steht dort, wo sie wirkt.** Warum: Eine Aktion im Hinweis konkurriert mit der Hauptaktion der Seite. (`alert/no-action`, manuell)

## Barrierefreiheit

Fehler und Warnungen mit role="alert", Info und Erfolg mit role="status".

## Do

- „Zahlung fehlgeschlagen“ + „Prüfe deine Kartendaten.“

## Don't

- „Fehler!“ ohne Erklärung
