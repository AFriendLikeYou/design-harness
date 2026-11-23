# Fundament: Hinweise für Agenten

Diese Datei nennt bewusst keine Komponenten, Attribute, Werte oder Tokens. Solche Listen veralten und führen zu erfundenen Namen. Lies sie immer aus der erzeugten Quelle.

## Wo was steht

- `generated/contracts.json`: einzige gültige Liste der Komponenten (als Elemente), Attribute, erlaubten Werte, Slots, Regeln, Grundsätze und Tokens mit Beschreibung. Erzeugt aus den drei Quellen unten.
- MCP-Server `fundament` (`.mcp.json`): dieselben Daten als Tools, dazu `check`. Wenn verbunden, bevorzugen.
- `generated/components/<name>.md`: Zweck, Beispielaufruf, Regeln mit Begründung, Barrierefreiheit je Komponente.
- `generated/contrast.json`: geprüfte Text/Fläche-Paare je Mode. Nur diese Paarungen sind zugesagt.
- `DESIGN.md`: Grundsätze für Entscheidungen, die kein Check trifft. `rubric.md`: Fragen für den Kritiker-Durchlauf.
- `ui/`: das Paket (Web Components, Tokens, Styles). `ui/examples/` zeigt eine komplette Seite und alle Zustände. `docs/index.html` ist die Doku für Menschen.
- Die drei Quellen des Systems: `specs/figma.snapshot.json` (Tokenwerte und Aussehen, Export aus Figma), `ui/elements.js` (Props und Slots), `specs/rules.json` (Regeln und Begründungen). `generated/system.json` zeigt alles zusammengesetzt. Erzeugte Dateien nie von Hand ändern.

## Die Schleife

1. **Kontext laden.** Vertrag und `DESIGN.md` lesen. Nichts verwenden, was im Vertrag nicht steht.
2. **Nur komponieren.** Seiten bestehen aus den Elementen des Systems. Eigenes CSS nur für Seitenlayout und nur mit Tokens. Keine internen Klassen, keine nackten Bedienelemente.
3. **Prüfen.** `node cli/fundament.mjs check <Pfad> --json` (oder das MCP-Tool `check`). Jeden Befund mit der genannten Behebung korrigieren.
4. **Kritisieren.** Wenn der Check sauber ist: `node cli/fundament.mjs audit <Pfad> --json` ausführen (misst gerendert: Überlauf bei 360 px, Kontrast, Namen, Klickflächen) und `rubric.md` beantworten, möglichst am Screenshot. Jedes Nein umsetzen, dann zurück zu 3.
5. **Begrenzen.** Höchstens drei Runden aus Prüfen und Kritisieren. Danach berichten, was offen bleibt, statt weiter zu raten.
6. **Lücken melden.** Fehlt eine Komponente, ein Wert oder ein Slot: nicht nachbauen. Eine fehlende API ist kein Dokumentationsproblem. Jede Lücke steht im Bericht in diesem Format:
   - **Was fehlt:** ein Satz.
   - **Anlass:** die Stelle in der Aufgabe, an der es gebraucht wurde.
   - **Geprüft:** welche vorhandenen Bausteine nicht passen und warum (dazu „Nicht verwenden für“ im Vertrag lesen).
   - **Art:** neuer Baustein / neue Variante oder neuer Wert / neuer Slot / neues Token / neue Regel / Fehler im System.
   - **Behelf:** was stattdessen auf der Seite steht, oder „nichts, die Stelle bleibt offen“.

## Hinweise und Ausnahmen

Der Check kennt zwei Stufen. **Fehler** müssen behoben werden. **Hinweise** (`"level": "warning"`) lassen den Check bestehen; prüfe sie und folge dem Vorschlag, wenn er zum Inhalt passt.

Passt eine Regel an einer Stelle wirklich nicht, gibt es die Einzelausnahme: `data-fd-allow="regel/id: Grund"` am Element oder an einem Vorfahren. Ohne Grund gilt sie nicht. Sie ist das letzte Mittel, nicht der Weg, einen Befund loszuwerden: Jede Ausnahme nennst du mit ihrem Grund im Bericht. Für erfundene Bausteine, falsche Werte, feste Farben und feste Abstände gibt es keine Ausnahme.

## Seiten ohne Web Components

Soll eine Seite nur aus HTML und CSS bestehen, kommt das Markup aus `generated/html/<name>.html` (erzeugt aus den Web Components, nicht abwandeln). `<html data-fd-html>` setzen oder mit `check <Pfad> --html` prüfen. Verhalten und Zustände für Hilfstechnik bringt diese Fassung nicht mit; was fehlt, im Bericht nennen.

## Was der Check nicht sieht

Regeln mit `"check": null` verlangen Urteil. Lies ihre Begründung (`why`) und `DESIGN.md`.

`data-fd-specimen` am `<html>` ist nur für Musterseiten gedacht, die absichtlich alle Varianten nebeneinander zeigen. In Produktseiten nicht verwenden.

## Veraltetes

`node cli/fundament.mjs migrate <Pfad> --write` ersetzt veraltete Elemente laut `migrations` in `specs/rules.json`.

## Nach Änderungen am System

`node tooling/verify.mjs` baut alles und führt alle Prüfungen aus. Dasselbe läuft in CI als Gate.
