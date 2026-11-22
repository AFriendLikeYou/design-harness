# ZDS-Probe: Hinweise für Agenten

Du arbeitest innerhalb der ZDS-Probe: drei ZEIT-Komponenten im System von Fundament. Diese Datei nennt bewusst keine Komponenten, Attribute, Werte oder Tokens. Lies sie aus dem Vertrag.

## Wo was steht

- `generated/contracts.json`: einzige gültige Liste der Komponenten (als Elemente), Attribute, erlaubten Werte, Regeln, Grundsätze und Tokens mit Beschreibung.
- `generated/components/<name>.md`: Zweck, Beispielaufruf, Regeln mit Begründung, Barrierefreiheit.
- `generated/contrast.json`: geprüfte Paarungen je Mode, darunter bekannte Verstöße (`accepted`).
- `ui/`: das Paket (`fundament.js`, `tokens.css`, `components.css`). `ui/examples/zustaende.html` zeigt alle Zustände.
- `../DESIGN.md` und `../rubric.md`: Grundsätze und Kritiker-Fragen.

## Die Schleife

1. **Kontext laden.** Vertrag und `../DESIGN.md` lesen. Nichts verwenden, was im Vertrag nicht steht.
2. **Nur komponieren.** Seiten bestehen aus den Elementen des Systems. Eigenes CSS nur für Seitenlayout und nur mit Tokens. Keine internen Klassen, keine nackten Bedienelemente.
3. **Prüfen.** `node ../cli/fundament.mjs check --root . <Pfad> --json`. Jeden Befund mit der genannten Behebung korrigieren.
4. **Kritisieren.** Wenn der Check sauber ist: `node ../cli/fundament.mjs audit --root . <Pfad> --json` und `../rubric.md` beantworten. Jedes Nein umsetzen, dann zurück zu 3. Befunde, die auf einen bekannten Verstoß des Systems zurückgehen (`accepted` in `generated/contrast.json`), nicht umgehen, sondern im Bericht nennen.
5. **Begrenzen.** Höchstens drei Runden. Danach berichten, was offen bleibt.
6. **Lücken melden.** Fehlt eine Komponente, ein Wert oder ein Slot: nicht nachbauen. Die Lücke im Bericht benennen, mit dem Anlass.
