# Fundament – Beispiel-Designsystem für Menschen und KI-Agenten

Ein generisches Designsystem, das zeigt, wie ein agententaugliches System aufgebaut ist. Gestaltet wird in Figma, umgesetzt im Code; der **Vertrag dazwischen** ist `specs/system.json`. Ein Abgleich hält alle drei gleich.

```
Specs als einzige Quelle  (Tokens, Komponenten, Regeln, Grundsätze, Versionen)
        │
        ├── Doku-Site     docs/index.html      für Menschen
        ├── CLI           cli/fundament.mjs    lint, check, migrate → CI als Gate
        └── MCP-Server    mcp/server.mjs       Lesen + check für Agenten
```

## Struktur

```
specs/system.json        Quelle: Tokens, Text-Styles, Komponenten mit Aussehen je Variante,
                         Regeln und Grundsätze mit Begründung, Kontrastpaare, Migrationen, Changelog
build.mjs                erzeugt alles Folgende: node build.mjs
generated/contracts.json Verträge: Elemente, Attribute, Werte, Slots, Regeln, Tokens
generated/contrast.json  geprüfte Text/Fläche-Paare je Mode (Build bricht bei Verstoß ab)
generated/tokens/        DTCG-Tokens (Format 2025.10)
generated/components/    Markdown je Komponente
generated/llms.txt       Index für Agenten
docs/index.html          Doku-Site mit den echten Web Components
ui/                      Paket @fundament/ui
  fundament.js             Web Components (von Hand), Light DOM, keine Abhängigkeiten
  contract.generated.js    Elementvertrag (erzeugt)
  tokens.css               CSS-Variablen light/dark (erzeugt)
  components.css           Styles der Komponenten (von Hand), nur Tokens
  examples/                Konto-Einstellungen und eine Seite mit allen Zuständen
cli/fundament.mjs        lint (Spec), check (HTML/CSS/Svelte-Markup), migrate (Veraltetes ersetzen)
mcp/server.mjs           MCP-Server über stdio, Eintrag in .mcp.json
plugin/                  Figma-Plugin, das die Library in einer leeren Datei anlegt
AGENTS.md                die Schleife für Agenten, ohne fest eingetragene Listen
DESIGN.md, rubric.md     Grundsätze und Kritiker-Fragen für das, was kein Check sieht
evals/                   Aufgaben, Läufe mit und ohne Harness, Auswertung
tooling/                 verify.mjs (alles prüfen), Tests für CLI und Web Components, Plugin-Attrappe
.github/workflows/       CI-Gate
```

## Benutzen

```html
<link rel="stylesheet" href="ui/tokens.css">
<link rel="stylesheet" href="ui/components.css">
<script type="module" src="ui/fundament.js"></script>

<fd-button variant="primary" label="Änderungen speichern"></fd-button>
```

Jede Komponente ist ein Element (`Button` → `<fd-button>`), Props sind Attribute in kebab-case. Das funktioniert in reinem HTML und unverändert in Svelte. Dark Mode folgt dem System oder `data-theme="dark"`.

## Ansehen

```
node tooling/serve.mjs     # http://localhost:4321/ zeigt die Doku, /ui/examples/ die Beispiele
```

Die Seiten laden das Paket als ES-Modul. Das geht im Browser nur über http, nicht per Doppelklick auf die Datei.

## Prüfen

```
node tooling/verify.mjs                      # baut und prüft alles (läuft auch in CI)
node cli/fundament.mjs lint                  # Spec in sich stimmig?
node cli/fundament.mjs check <Pfad> --json   # Seite gegen Verträge, Regeln, Grundsätze
node cli/fundament.mjs migrate <Pfad> --write
node evals/auswerten.mjs                     # Messläufe auswerten
```

## Figma

**Von Figma ins Repo (der normale Weg für Designer):** In Figma ändern, das Plugin `plugin-export/` ausführen, das Ergebnis als `specs/figma.snapshot.json` speichern, dann `node tooling/figma-diff.mjs`. Der Abgleich zeigt jede Abweichung als Vorschlag; `--apply` übernimmt die eindeutigen in die Spec.

**Vom Repo nach Figma (neue Datei):**

Plugins → Entwicklung → Plugin aus Manifest importieren → `plugin/manifest.json`, in einer **leeren** Datei ausführen. Das Plugin bricht ab, wenn die Datei schon Variablen enthält.

Bewusst manuell danach: Code Connect, Dev Resources, Library veröffentlichen.

## Eigene Marke

Farben, Schrift, Namen und Komponenten in `specs/system.json` ändern, `node tooling/verify.mjs`, Plugin in einer neuen Datei ausführen. Neue Komponenten brauchen zusätzlich ihre Umsetzung in `ui/fundament.js`, `ui/components.css` und einen Builder im Plugin; `verify` meldet, wenn eines davon fehlt.
