# ZDS-Probe: Ergebnis vom 22.11.2026

Drei echte ZDS-Komponenten (Button, Checkbox, Toggle) wurden in das System von Fundament übertragen: Spec, Vertrag, Web Components, Check, gerenderte Prüfung. Danach haben zwei Modelle (Claude Sonnet, Claude Haiku) denselben Brief (`brief.md`, Newsletter-Einstellungen) unter drei Bedingungen umgesetzt. Zahlen aus `node vergleich.mjs` (`vergleich/ergebnis.json`), Seiten nebeneinander in `vergleich.html`.

## Die drei Bedingungen

| | nur Brief | lose ZDS-Dateien | mit System |
|---|---|---|---|
| Was der Agent hatte | nur die Aufgabe | dazu das echte ZDS-CSS und die Tokens | Elemente, Vertrag, Check, Schleife |
| feste Farbwerte (Sonnet / Haiku) | 16 / 13 | 0 / 0 | 0 / 0 |
| feste Abstände | 21 / 23 | 1 / 1 | 0 / 0 |
| selbst gebaute Bedienelemente | 6 / 6 | 6 / 6 | 0 / 0 |
| Zeilen eigenes Skript | 7 / 11 | 17 / 21 | 0 / 0 |
| Bedienelemente ohne Namen (gerendert) | 0 / 3 | 3 / 3 | 0 / 0 |
| zu kleine Klickflächen (gerendert) | 1 / 2 | 3 / 3 | 0 / 0 |
| Kontrastbefunde (gerendert) | 0 / 0 | 1 / 0 | 1 / 1 |

## Was das zeigt

- **Nur Brief:** Die Agenten erfinden das Aussehen. Beide färben die Schalter ZEIT-rot, obwohl das ZDS sie schwarz zeichnet, und setzen Serifenschrift für Titel. Farben und Abstände stehen als feste Werte im Code.
- **Lose ZDS-Dateien:** Die Tokens werden benutzt, feste Farben verschwinden. Aber das ZDS-CSS beschreibt nur das Aussehen. Verhalten, Semantik und Beschriftung bauen die Agenten jedes Mal selbst: sechs eigene Bedienelemente, 17 bis 21 Zeilen Skript, drei Schalter ohne zugänglichen Namen, drei zu kleine Klickflächen (das Toggle misst im ZDS 26 × 16 px).
- **Mit System:** Kein eigenes Bedienelement, kein Skript, keine Namens- oder Größenbefunde. Übrig bleibt je Seite ein Kontrastbefund, und der ist ein bekannter Verstoß des ZDS selbst (Weiß auf Z+-Rot im Dark Mode). Die Agenten haben ihn nicht umgangen, sondern gemeldet.

Anders als bei der Messung mit Fundament trennt dieser Vergleich die Bedingungen klar. Der Grund: Das ZDS liefert heute CSS-Muster ohne Verhalten. Genau diese Lücke füllen die Agenten ohne System jedes Mal anders.

## Was die Probe am ZDS selbst gefunden hat

1. **Sechs Kontrastpaare fallen durch** (vom Build nachgerechnet, in `generated/contrast.json` als bekannt markiert): Rahmen der Checkbox 1,6:1 statt 3:1, Toggle-Bahn im Aus-Zustand 1,33:1, Weiß auf Z+-Rot im Dark Mode 4,12:1 statt 4,5:1, und im Dark Mode sind Haken und Toggle-Knopf weiß auf weiß.
2. **Die Checkbox ist als `<span>` dokumentiert**, also nicht bedienbar. In der Probe ist sie ein natives `<input>` in einem `<label>`.
3. **Checkbox und Toggle haben keine Beschriftung** als Teil der Komponente. Allein sind sie mit 16 und 26 × 16 px zu klein; mit Beschriftung in einem `<label>` wird die Zeile zur Klickfläche.
4. **Der Toggle hat keinen deaktivierten Zustand.**
5. **Token-Namen tragen keine Rolle.** `background-10` oder `text-100` sagen nicht, wofür sie gedacht sind. `text-100` ist Textfarbe, Buttonfläche, Checkboxfüllung und Toggle-Bahn zugleich. Erst die Beschreibung in der Spec macht die Tokens für Agenten benutzbar. Im Dark Mode führt genau diese Mehrfachrolle zum Weiß-auf-Weiß-Fehler.
6. **Für die Schrift gibt es kein Token.** Die Agenten mit losen Dateien haben Georgia, Helvetica oder system-ui eingesetzt.
7. **Gemeldete Lücken für diesen Brief:** Link für Navigation (der Weg zum Abo ist heute ein Button), ein Hinweis-Baustein, Text- und Überschriftenstile, Gruppierung von Feldern.

## Was die Übertragung gekostet hat

- Spec mit 12 Farb-Tokens (echte Namen und Werte, hell und dunkel), 3 Komponenten, 8 Regeln.
- Styles: 56 Zeilen, aus dem ZDS-CSS übertragen. Die Web Components selbst kamen unverändert aus Fundament (`ui/fundament.js`), der Toggle nutzt die Umsetzung des Switch.
- Nötige Erweiterungen am System: Präfix und Schriftfamilie aus der Spec, bekannte Kontrastverstöße ohne Build-Abbruch, CLI mit `--root`.

## Grenzen

- Ein Lauf je Zelle, zwei Modelle derselben Familie.
- Regeln mit dem Feld `herkunft` stammen nicht aus der ZDS-Doku, sondern aus Fundament oder sind Annahmen der Probe. Textstile außer der Button-Beschriftung sind Annahmen.
- Radius-, Größen- und Textnamen folgen dem Schema von Fundament (`--z-ds-radius-4` statt `--z-ds-border-radius-4`). Für einen echten Einsatz bräuchte es eine Zuordnung zu den ZDS-Namen.
- Die gerenderte Prüfung misst Textkontrast, keine Rahmen oder Flächen. Den Weiß-auf-Weiß-Fehler im Dark Mode findet deshalb nur die Kontrastrechnung im Build.
- Das Repo `designsystem-dokumentation` wurde nur gelesen, nichts dort geändert.
