# Fundament: Hinweise für Agenten

Diese Datei nennt bewusst keine Komponenten, Attribute, Werte oder Tokens. Solche Listen veralten und führen zu erfundenen Namen. Lies sie immer aus der erzeugten Quelle.

## Wo was steht

- `generated/contracts.json`: einzige gültige Liste der Komponenten (als Elemente), Attribute, erlaubten Werte, Slots, Regeln, Grundsätze und Tokens mit Beschreibung. Erzeugt aus `specs/system.json`.
- MCP-Server `fundament` (`.mcp.json`): dieselben Daten als Tools, dazu `check`. Wenn verbunden, bevorzugen.
- `generated/components/<name>.md`: Zweck, Beispielaufruf, Regeln mit Begründung, Barrierefreiheit je Komponente.
- `generated/contrast.json`: geprüfte Text/Fläche-Paare je Mode. Nur diese Paarungen sind zugesagt.
- `DESIGN.md`: Grundsätze für Entscheidungen, die kein Check trifft. `rubric.md`: Fragen für den Kritiker-Durchlauf.
- `ui/`: das Paket (Web Components, Tokens, Styles). `ui/examples/` zeigt eine komplette Seite und alle Zustände. `docs/index.html` ist die Doku für Menschen.
- `specs/system.json`: Quelle der Wahrheit. Änderungen nur dort, danach `node build.mjs`.

## Die Schleife

1. **Kontext laden.** Vertrag und `DESIGN.md` lesen. Nichts verwenden, was im Vertrag nicht steht.
2. **Nur komponieren.** Seiten bestehen aus den Elementen des Systems. Eigenes CSS nur für Seitenlayout und nur mit Tokens. Keine internen Klassen, keine nackten Bedienelemente.
3. **Prüfen.** `node cli/fundament.mjs check <Pfad> --json` (oder das MCP-Tool `check`). Jeden Befund mit der genannten Behebung korrigieren.
4. **Kritisieren.** Wenn der Check sauber ist: `rubric.md` beantworten, möglichst am Screenshot. Jedes Nein umsetzen, dann zurück zu 3.
5. **Begrenzen.** Höchstens drei Runden aus Prüfen und Kritisieren. Danach berichten, was offen bleibt, statt weiter zu raten.
6. **Lücken melden.** Fehlt eine Komponente, ein Wert oder ein Slot: nicht nachbauen. Die Lücke im Bericht benennen, mit dem Anlass. Eine fehlende API ist kein Dokumentationsproblem.

## Was der Check nicht sieht

Regeln mit `"check": null` verlangen Urteil. Lies ihre Begründung (`why`) und `DESIGN.md`.

`data-fd-specimen` am `<html>` ist nur für Musterseiten gedacht, die absichtlich alle Varianten nebeneinander zeigen. In Produktseiten nicht verwenden.

## Veraltetes

`node cli/fundament.mjs migrate <Pfad> --write` ersetzt veraltete Elemente laut Spec.

## Nach Änderungen am System

`node tooling/verify.mjs` baut alles und führt alle Prüfungen aus. Dasselbe läuft in CI als Gate.
