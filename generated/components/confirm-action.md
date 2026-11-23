<!-- Generiert aus specs/figma.snapshot.json, ui/elements.js und specs/rules.json – nicht von Hand bearbeiten. -->
# ConfirmAction
Status: stable · v1.0.0 · Spec: ds/confirm-action
Sichert eine unwiderrufliche Aktion ab: Der danger-Button wird erst aktiv, wenn das Bestätigungswort eingegeben ist.
```html
<script type="module">import "@fundament/ui";</script>
<fd-confirm-action word="LÖSCHEN" field-label="Gib zur Bestätigung LÖSCHEN ein" action-label="Konto endgültig löschen"></fd-confirm-action>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Props

| Prop | Typ | Werte | Standard |
|---|---|---|---|
| `word` | codeText | – | LÖSCHEN |
| `fieldLabel` | codeText | – | Gib zur Bestätigung LÖSCHEN ein |
| `actionLabel` | codeText | – | Konto endgültig löschen |

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `default` | keine eigenen Farben |

## Regeln

- **Jede Aktion, die Daten unwiderruflich löscht, läuft über ConfirmAction.** Warum: Ein roter Button allein schützt nicht vor einem versehentlichen Klick. (`confirmaction/for-irreversible`, manuell)
- **Das Freischalten kommt aus dem Muster, nicht aus eigenem Skript.** Warum: Sonst unterscheiden sich Bestätigungen von Seite zu Seite. (`confirmaction/no-custom-script`, manuell)

## Barrierefreiheit

Der Button nennt die Aktion. Warum er deaktiviert ist, steht als Hilfstext am Feld und ist per aria-describedby verknüpft.

## Do

- Bestätigungswort nennt die Aktion: „LÖSCHEN“

## Don't

- Bestätigung per Checkbox
- Eigenes Skript, das einen Button freischaltet
