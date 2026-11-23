<!-- Generiert aus specs/leitfaden.json – nicht von Hand bearbeiten. -->
# Leitfaden: So bleibt das System sicher für Agenten

Was Fundament für KI-Agenten verlässlich macht und wie man neue Regeln, Tokens und Komponenten so ergänzt, dass es so bleibt. Stand 23.11.2026.

## Die sieben Grundelemente

Fällt eines weg, raten Agenten wieder.

- **1 / Ein Vertrag, zwei Werkbänke.** Gestaltet wird in Figma, umgesetzt im Code. Die Spec im Repo ist der Vertrag dazwischen. Ein Export aus Figma zeigt jede Änderung als Vorschlag für die Spec. Grün ist der Stand erst, wenn Figma, Spec und Code übereinstimmen.
- **2 / Namen wie im Code.** Eine Komponente heißt überall gleich: Button, <fd-button>, Ebene „label“, Attribut label. Tokens heißen nach ihrer Aufgabe (text/primary), nicht nach ihrem Aussehen (blue/600).
- **3 / Jede Entscheidung hat ein Warum.** Tokens, Regeln und Grundsätze tragen eine Begründung. Mit ihr entscheidet ein Agent die Fälle, die niemand vorhergesehen hat.
- **4 / Verträge statt Listen.** Gültige Elemente, Werte und Tokens stehen nur im erzeugten Vertrag. AGENTS.md beschreibt den Ablauf und nennt bewusst keinen einzigen Namen. Handgeschriebene Listen veralten.
- **5 / Prüfen in der Schleife.** Der Agent prüft seine Arbeit selbst: check gegen den Vertrag, audit im gerenderten Zustand, dann die Rubrik. Höchstens drei Runden, danach berichtet er, was offen ist.
- **6 / Lücken melden statt nachbauen.** Fehlt eine Komponente, ein Wert oder ein Slot, baut der Agent nichts darüber. Er meldet die Lücke. So wächst das System an den richtigen Stellen.
- **7 / Messen.** Agentenläufe mit und ohne System, die gerenderte Prüfung und der Abgleich zwischen Figma und Spec zeigen, ob es wirkt. Was nicht gemessen ist, gilt als Annahme.

## Vom Entwurf in Figma zum Stand im Code

Designer arbeiten in Figma. So kommt ihre Änderung an, ohne dass jemand abtippt.

- **1 / In Figma gestalten.** Werte an Variablen ändern, Varianten und Properties anlegen, die Beschreibung nach dem Muster pflegen. Properties heißen so, wie sie im Code heißen sollen.
- **2 / Stand exportieren.** Das Plugin „Fundament Export“ liest Variablen, Text-Styles und Komponenten aus. Das Ergebnis kommt als specs/figma.snapshot.json ins Repo.
- **3 / Abgleich lesen.** node tooling/figma-diff.mjs zeigt jede Abweichung: was Figma hat, was die Spec hat, und ob sie eindeutig übernehmbar ist.
- **4 / Übernehmen und entscheiden.** --apply schreibt Eindeutiges in die Spec: Werte, Verweise, Beschreibungen, Standards, neue Varianten-Werte. Neues braucht eine Entscheidung: Ein Token braucht ein Warum, eine Variante ihr Aussehen und ihre Umsetzung.
- **5 / Bauen und umsetzen.** node build.mjs erzeugt Verträge, Tokens und Doku neu. Der Build rechnet den Kontrast nach; eine Farbänderung, die ein Paar unter die Grenze drückt, fällt hier auf.
- **6 / Gate.** node tooling/verify.mjs vergleicht den Figma-Stand mit der Spec und prüft Code und Beispiele. Weicht etwas ab, ist der Stand rot, egal auf welcher Seite die Änderung begann.

## Wer hat das letzte Wort

Beide Seiten dürfen anfangen. Entschieden wird im Vorschlag für die Spec.

- **Figma führt beim Aussehen.** Farbwerte, Abstände, Radien, Typografie, welche Varianten es gibt und wie Properties heißen.
- **Das Repo führt beim Verhalten.** Regeln mit Warum, Checks, Barrierefreiheit, Verhalten wie trailingAction, Migrationen. Das steht in Figma nur als Beschreibung oder Annotation.
- **Der Abgleich ist die Schnittstelle.** Niemand tippt Werte ab. Was Figma ändert, kommt als Vorschlag; was das Repo ändert, zieht Figma nach (Plugin oder Skript) und der Abgleich bestätigt es.

## Eine neue Regel schreiben

Sechs Schritte. Die Regel steht danach in der Spec, bei der Komponente oder bei den Grundsätzen.

```json
{
  "id": "card/one-action",
  "text": "Höchstens eine Aktion im Footer.",
  "why": "Karten sind Einstiege, keine Formulare.",
  "check": "max-children"
}
```

- **1 / Mit einer Beobachtung anfangen.** Eine Regel entsteht aus einem Fehler, der wirklich passiert ist: in einer Messung, einem Review, einem Produkt. Regeln auf Vorrat liest niemand und prüft niemand.
- **2 / Ein Satz, eine Sache, mit Zahl oder Ort.** „Höchstens ein primärer Button pro Ansicht“ lässt sich zählen. „Buttons sparsam einsetzen“ lässt sich nur auslegen.
- **3 / Das Warum dazuschreiben.** Ein Satz, der sagt, wovor die Regel schützt. Ohne ihn wird sie in Grenzfällen wörtlich und falsch angewendet. lint lehnt Regeln ohne Begründung ab.
- **4 / Entscheiden: Check oder Urteil.** Lässt sich die Regel automatisch prüfen, bekommt sie einen Check und die CLI setzt ihn um. Sonst steht check auf null, und die Regel gehört zum Urteil (DESIGN.md, Rubrik). lint meldet Checks, die versprochen, aber nicht gebaut sind.
- **5 / Die Behebung in die Meldung schreiben.** Jeder Befund nennt, was zu tun ist und welche Werte erlaubt sind. Eine Meldung ohne Ausweg führt zum Raten.
- **6 / Den Fehlerfall festhalten.** Ein Beispiel, das die Regel verletzt, kommt in tooling/fixtures. Der CLI-Test verlangt, dass die Regel dort anschlägt. Dann node tooling/verify.mjs.

## Gut und schlecht formuliert

| So nicht | So |
|---|---|
| Bedienelemente übersichtlich halten. | Höchstens eine Aktion im Footer. Warum: Karten sind Einstiege, keine Formulare. |
| Verwende für Fehler den Ton error. | Kein Wert im Text. Der gültige Wert steht im Vertrag (tone), die Regel sagt nur, wann ein Alert nötig ist. |
| Der Fokus muss gut sichtbar sein. | Hover und Fokus kommen aus der Komponente, nie selbst gestaltet. Warum: Der Fokusring ist eine Zusage an Tastaturnutzer:innen. |
| Fehlt eine Komponente, improvisiere passend zum Stil. | Fehlt eine Komponente, nicht nachbauen. Die Lücke im Bericht benennen, mit dem Anlass. |

## Wohin gehört was

Jede Aussage hat genau einen Ort.

- **Regel einer Komponente.** specs/system.json, bei der Komponente unter rules. Gilt nur dort.
- **Grundsatz für alle Seiten.** specs/system.json unter principles, wenn er prüfbar ist. Sonst DESIGN.md.
- **Wann ein Token gilt.** In der Beschreibung des Tokens (why): Einsatz und Grenze, bei Farben die erlaubten Flächen.
- **Fragen an das fertige Ergebnis.** rubric.md. Ja-Nein-Fragen, die man am Screenshot beantworten kann.
- **Ablauf für Agenten.** AGENTS.md. Nur Schritte und Dateipfade, keine Komponenten, keine Werte.
- **Aussehen einer Variante.** specs/system.json unter styles. Daraus entstehen Figma, die erlaubten Farb-Tokens und die Prüfung des CSS.

## Eine neue Komponente aufnehmen

Der Entwurf beginnt in Figma. verify meldet, wenn ein Schritt fehlt.

- **1 / In Figma bauen.** Set mit Varianten, Properties mit den Namen aus dem Code, Farben und Maße an Variablen, Beschreibung nach dem Muster (Status, Zweck, Regeln mit ID, A11y).
- **2 / Exportieren und abgleichen.** Plugin „Fundament Export“, dann node tooling/figma-diff.mjs --apply. Für eine neue Komponente legt der Abgleich ein Gerüst in der Spec an: Properties, Zweck, Regeln und A11y aus Figma.
- **3 / Spec vervollständigen.** Was Figma nicht tragen kann: styles je Variante, das Warum jeder Regel, Checks, Do und Don’t. node cli/fundament.mjs lint zeigt jede Lücke.
- **4 / Umsetzen.** Element in ui/fundament.js, Styles in ui/components.css. Erlaubt sind nur die Tokens aus dem Vertrag der Komponente.
- **5 / Prüfen.** node tooling/verify.mjs: Figma-Stand gegen Spec, Check, Verhalten im Browser, gerenderte Prüfung.
- **6 / Messen.** Eine Aufgabe, die die neue Komponente braucht, in evals/tasks.md ergänzen und einen Lauf machen.

## Was man lassen sollte

- **Listen in Prosa.** Komponenten, Werte oder Tokens in AGENTS.md, Skills oder Prompts aufzählen. Ein veraltetes Wort genügt für Fehler in Serie.
- **Regeln ohne Prüfer.** Eine Regel, die weder ein Check prüft noch die Rubrik abfragt, existiert nur auf dem Papier.
- **Fehlende Fähigkeit mit Doku flicken.** Wenn eine Komponente etwas nicht kann, hilft kein Hinweistext. Die Komponente braucht den Slot, den Zustand oder das Verhalten.
- **Tokens nach Aussehen am Einsatzort.** Zahlenrampen wie background/10 sagen nicht, wofür sie gedacht sind. Die ZDS-Probe zeigt das: Erst die Beschreibung macht sie benutzbar.
- **Ausnahmen im Produkt.** Ein überschriebener Wert an einer Stelle ist eine Regeländerung ohne Entscheidung. Wiederholt sich die Ausnahme, fehlt eine Variante.
- **Die Prüfung umgehen.** data-fd-specimen ist für Musterseiten. Wer es nutzt, um einen Befund loszuwerden, hat die Regel abgeschafft, nicht erfüllt.
