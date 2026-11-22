<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# Alert
Status: stable · v1.0.1 · Spec: ds/alert
Hinweis im Seitenfluss zu Status, Erfolg, Warnung oder Fehler.
```html
<script type="module">import "@fundament/ui";</script>
<fd-alert title="Änderungen gespeichert" description="Deine Einstellungen gelten ab sofort."></fd-alert>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `tone` | variant | `info`, `success`, `warning`, `danger` | info |
| `title` | text | – | Änderungen gespeichert |
| `description` | text | – | Deine Einstellungen gelten ab sofort. |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `tone=info` | bg: `feedback/info-bg`, fg: `feedback/info-fg`, body: `text/primary`, border: `feedback/info-fg`, borderWidth: `accent` |
| `tone=success` | bg: `feedback/success-bg`, fg: `feedback/success-fg`, body: `text/primary`, border: `feedback/success-fg`, borderWidth: `accent` |
| `tone=warning` | bg: `feedback/warning-bg`, fg: `feedback/warning-fg`, body: `text/primary`, border: `feedback/warning-fg`, borderWidth: `accent` |
| `tone=danger` | bg: `feedback/danger-bg`, fg: `feedback/danger-fg`, body: `text/primary`, border: `feedback/danger-fg`, borderWidth: `accent` |

## Regeln

- **Höchstens ein Alert pro Bereich.** Warum: Mehrere Hinweise übereinander werden ignoriert. (`alert/one-per-area`, Check: `max-per-parent`)
- **Titel nennt das Ergebnis, Beschreibung den nächsten Schritt.** Warum: Man soll den Titel allein verstehen können. (`alert/title-states-outcome`, manuell)

## Barrierefreiheit

Fehler und Warnungen mit role="alert", Info und Erfolg mit role="status".

## Do

- „Zahlung fehlgeschlagen“ + „Prüfe deine Kartendaten.“

## Don't

- „Fehler!“ ohne Erklärung
