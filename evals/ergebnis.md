# Messung 22.11.2026 (System 1.2.0)

Sechs Aufgaben aus `tasks.md`, zwei Modelle (Claude Sonnet, Claude Haiku), drei Bedingungen, je ein Lauf. 36 Seiten. Zahlen aus `node evals/auswerten.mjs` (`ergebnis.json`).

| Bedingung | Was der Agent hatte | Sonnet: saubere Seiten | Haiku: saubere Seiten |
|---|---|---|---|
| ohne | nur das Paket `ui/` in einem leeren Ordner | 5 von 6 (1 Befund) | 6 von 6 |
| nur Anleitung | Paket und der Text der `AGENTS.md`, aber kein Check und kein Vertrag | 6 von 6 | 4 von 6 (5 Befunde) |
| mit Harness, erster Versuch | alles, vor dem ersten Check | 6 von 6 | 5 von 6 (1 Befund) |
| mit Harness, Abgabe | alles, nach der Schleife | 6 von 6 | 6 von 6 |

## Was das zeigt

- **Mechanisch macht das Harness hier kaum einen Unterschied.** Schon das Paket allein reichte fast immer für saubere Seiten. Die Elemente tragen ihre gültigen Attribute und Werte mit (`contract.generated.js`), und die Agenten lesen das.
- **Die Schleife schließt den Rest.** Mit Harness waren am Ende 12 von 12 Seiten sauber; der eine Befund im ersten Versuch wurde in der zweiten Runde behoben.
- **Der eigentliche Gewinn waren die Lückenberichte.** Auf 19 von 36 Seiten haben die Agenten eigenes Skript geschrieben (Passwort anzeigen, Eingabe leeren, Bestätigung per Eingabe). Alle sechs Läufe meldeten dieselben zwei Lücken: kein Verhalten für den Slot `trailing` und kein Platz für eine Kennzeichnung an der Card. Beide sind in 1.3.0 geschlossen.

## Grenzen

- Ein Lauf je Zelle, zwei Modelle derselben Familie, Aufgaben vom Autor des Systems. Die Unterschiede zwischen den Bedingungen liegen im Rauschen.
- Die Aufgaben sind zu leicht, um die Bedingungen zu trennen: Fast alles ist sauber. Ein aussagekräftiger Benchmark braucht schwerere Aufgaben, Wiederholungen und andere Modellfamilien.
- Die Bedingung „nur Anleitung“ ist unbeabsichtigt entstanden: Die Umgebung hat die `AGENTS.md` aus dem Projektordner von selbst in den Kontext gelegt. Die saubere Bedingung „ohne“ lief deshalb in einem Ordner außerhalb des Projekts.
- Urteil (Rubrik) wurde nicht unabhängig bewertet. Die Agenten mit Harness haben die Rubrik selbst beantwortet, teils ohne Screenshot.
- Gemessen wurde 1.2.0. Für 1.3.0 gibt es noch keinen Lauf.

## Noch offene Lücken aus den Berichten

- Bestätigung per Texteingabe vor einer gefährlichen Aktion (in vier Läufen selbst geskriptet)
- Link für Navigation (Button ist für Aktionen, LinkButton ist veraltet)
- Aktion im Alert
- Überschriften und Seitenlayout haben keine Komponente; das ist bisher Absicht (Tokens für Text, Layout frei)
