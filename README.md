# Fundament – Beispiel-Designsystem für Menschen und KI-Agenten

Ein Designsystem, das zeigt, wie ein agententaugliches System aufgebaut ist. Jedes Wissen hat genau eine Heimat, und Prüfungen vergleichen die Seiten direkt:

| Wissen | Heimat | Datei im Repo |
|---|---|---|
| Tokenwerte, Farb- und Rahmenstärken-Bindungen je Variante | Figma | `specs/figma.snapshot.json` (Export) |
| Props, Slots, Verhalten | Code | `ui/elements.js`, `ui/fundament.js` |
| Regeln, Begründungen, Kontrastzusagen | Regeldatei | `specs/rules.json` |

Eine große Spec, die jemand von Hand pflegt, gibt es nicht. `generated/system.json` zeigt das zusammengesetzte System zur Ansicht.

## Struktur

```
specs/figma.snapshot.json letzter Export aus Figma: Variablen, Text-Styles, Komponenten, Farb- und Rahmenstärken-Bindungen je Variante
specs/rules.json          von Hand: Regeln mit Warum, Barrierefreiheit, Grundsätze, Kontrastpaare, Migrationen, Changelog
specs/leitfaden.json      Quelle des Leitfadens (LEITFADEN.md, Doku-Site, Figma-Seite)
ui/                       Paket @fundament/ui
  elements.js               API der Komponenten: Attribute, Werte, Standards, Slots (von Hand)
  fundament.js              Web Components, Light DOM, keine Abhängigkeiten (von Hand)
  components.css            Styles, nur Tokens (von Hand)
  tokens.css                CSS-Variablen light/dark (erzeugt aus dem Figma-Export)
  custom-elements.json      Manifest der Web Components (erzeugt)
  examples/                 Konto-Einstellungen und eine Seite mit allen Zuständen
build.mjs                 setzt das System zusammen und erzeugt alles unter generated/, docs/ und die erzeugten Dateien in ui/
generated/                Verträge, Kontrast, DTCG-Tokens, Markdown und Figma-Beschreibung je Komponente, llms.txt
docs/index.html           Doku-Site mit den echten Web Components
cli/fundament.mjs         lint (System in sich), check (Seiten), audit (gerendert), migrate (Veraltetes ersetzen)
mcp/server.mjs            MCP-Server über stdio, Eintrag in .mcp.json
plugin-export/            „Fundament Export“: liest den Stand einer Figma-Datei aus und verändert nichts
tooling/                  assemble.mjs (Zusammenbau), figma-diff.mjs (Abgleich), verify.mjs (alles prüfen), Tests
AGENTS.md, DESIGN.md, rubric.md   Schleife für Agenten, Grundsätze, Kritiker-Fragen
evals/                    Aufgaben, Läufe mit und ohne Harness, Auswertung
probe-zds/                fünf ZDS-Komponenten im selben System (noch mit einer einzelnen Spec-Datei)
```

## Der Weg einer Änderung

1. In Figma gestalten.
2. Plugin „Fundament Export“ ausführen, Ergebnis als `specs/figma.snapshot.json` speichern.
3. `node build.mjs`: Tokenwerte fließen von selbst in CSS, Verträge und Doku. Der Kontrast wird nachgerechnet.
4. `node tooling/figma-diff.mjs`: zeigt, wo Figma und Code auseinanderliegen, mit dem nächsten Schritt je Zeile.
5. Im Code nachziehen (`ui/elements.js`, `ui/fundament.js`, `ui/components.css`), Regeln in `specs/rules.json` ergänzen.
6. `node tooling/verify.mjs`: alles zusammen. Dasselbe läuft in CI als Gate.

Von außen schreibt nichts in die Figma-Datei. Ändert jemand etwas nur im Code, zeigt der Abgleich die Abweichung, und Figma wird von Hand nachgezogen.

## Benutzen

```html
<link rel="stylesheet" href="ui/tokens.css">
<link rel="stylesheet" href="ui/components.css">
<script type="module" src="ui/fundament.js"></script>

<fd-button variant="primary" label="Änderungen speichern"></fd-button>
```

Jede Komponente ist ein Element (`Button` → `<fd-button>`), Props sind Attribute in kebab-case. Das funktioniert in reinem HTML und unverändert in Svelte. Dark Mode folgt dem System oder `data-theme="dark"`.

## Ohne Web Components: nur HTML und CSS

Jeder Baustein liegt auch als reines HTML unter `generated/html/`. `node tooling/html-templates.mjs` erzeugt diese Fassung aus den Web Components und misst im Browser, dass sie gleich aussieht. Eingebunden werden dann nur `tokens.css` und `components.css`. Prüfen mit `node cli/fundament.mjs check <Pfad> --html` oder je Seite mit `<html data-fd-html>`. Verhalten und Zustände für Hilfstechnik setzt man in dieser Fassung selbst. Beispiel: `ui/examples/nur-html.html`. Der Vergleich beider Wege steht in der Doku unter „Zwei Wege im Code“.

## Ansehen

```
node tooling/serve.mjs     # http://localhost:4321/ zeigt die Doku, /ui/examples/ die Beispiele
```

Die Seiten laden das Paket als ES-Modul. Das geht im Browser nur über http, nicht per Doppelklick auf die Datei.

## Prüfen

```
node tooling/verify.mjs                      # baut und prüft alles
node cli/fundament.mjs lint                  # System in sich stimmig?
node cli/fundament.mjs check <Pfad> --json   # Seite gegen Verträge, Regeln, Grundsätze
node cli/fundament.mjs audit <Pfad> --json   # gerendert: Überlauf, Kontrast, Namen, Klickflächen
node tooling/figma-diff.mjs                  # Figma gegen Code und Regeln
node tooling/test-robust.mjs                  # kaputte Eingaben (Kopie des Repos): klare Fehlermeldung statt Absturz
node tooling/test-styles.mjs                 # Code gegen Figma: Farb- und Rahmenstärken-Bindungen je Variante (Abstände, Radien, Typografie werden nicht verglichen)
```

## Bewusst manuell

Code Connect, Dev Resources und das Veröffentlichen der Library gehen nur vom eigenen Figma-Konto.

## Eigene Marke

Die Figma-Datei duplizieren und dort Farben und Namen ändern, exportieren, bauen. Die Schriftfamilie steht nicht im Export, sondern in `fontFamily` in `specs/rules.json` (ohne Eintrag gilt Inter). Regeln in `specs/rules.json` anpassen.
