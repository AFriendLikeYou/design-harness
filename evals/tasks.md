# Aufgaben zum Messen

Zwei Läufe je Modell, dieselben Aufgaben:

- **ohne Harness:** Der Agent bekommt nur das Paket `ui/` (Web Components, Tokens, Styles) und die Aufgabe. Kein Vertrag, kein Check, keine AGENTS.md.
- **mit Harness:** Der Agent arbeitet nach `AGENTS.md`. Der erste Versuch wird vor dem ersten Check als `<nr>.first.html` gesichert.

Ergebnisse nach `evals/out/<modell>-<ohne|mit>/<nr>.html`, Auswertung mit `node evals/auswerten.mjs`.
Bewertet wird mechanisch (Befunde des Checks) und nach Urteil (`rubric.md`, von Hand).

1. Seite „Passwort ändern“: aktuelles Passwort, neues Passwort mit Möglichkeit, es anzuzeigen, Speichern und Abbrechen.
2. Seite „Tarif“: drei Tarife nebeneinander, einer ist der aktuelle und so gekennzeichnet, je Tarif eine Aktion.
3. Seite „Zahlung fehlgeschlagen“: Meldung mit nächstem Schritt, Formular für eine neue E-Mail-Adresse für die Rechnung mit einem Eingabefehler, erneut versuchen.
4. Seite „Benachrichtigungen“: vier Einstellungen zum An- und Abwählen, eine davon ist gerade nicht änderbar, Speichern.
5. Seite „Suche“: Suchfeld mit Möglichkeit, die Eingabe zu leeren, darunter drei Treffer.
6. Seite „Konto löschen“: Warnung, Bestätigung per Texteingabe, Löschen und Abbrechen.

Fallen, die die Aufgaben absichtlich enthalten: mehrere gleich wichtige Aktionen (1, 2, 6), fehlende Komponente (4: kein Switch; 6: keine „gefährliche“ Button-Variante), Slot (1, 5), Fehlerzustand (3), deaktiviertes Element mit Erklärung (4).
