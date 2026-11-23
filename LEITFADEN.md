<!-- Generiert aus specs/leitfaden.json – nicht von Hand bearbeiten. -->
# Leitfaden: So bleibt das System sicher für Agenten

Was Fundament für KI-Agenten verlässlich macht und wie man neue Regeln, Tokens und Komponenten so ergänzt, dass es so bleibt. Stand 23.11.2026, Version 1.5.0.

## Die sieben Grundelemente

Fällt eines weg, raten Agenten wieder.

- **1 / Jedes Wissen hat eine Heimat.** Tokenwerte und Aussehen entstehen in Figma. Props und Verhalten stehen im Code. Regeln und ihre Begründungen stehen in einer kleinen Regeldatei. Niemand schreibt etwas doppelt; Prüfungen vergleichen die Seiten direkt.
- **2 / Namen wie im Code.** Eine Komponente heißt überall gleich: Button, <fd-button>, Ebene „label“, Attribut label. Tokens heißen nach ihrer Aufgabe (text/primary), nicht nach ihrem Aussehen (blue/600).
- **3 / Jede Entscheidung hat ein Warum.** Tokens, Regeln und Grundsätze tragen eine Begründung. Mit ihr entscheidet ein Agent die Fälle, die niemand vorhergesehen hat.
- **4 / Verträge statt Listen.** Gültige Elemente, Werte und Tokens stehen nur im erzeugten Vertrag. AGENTS.md beschreibt den Ablauf und nennt bewusst keinen einzigen Namen. Handgeschriebene Listen veralten.
- **5 / Prüfen in der Schleife.** Der Agent prüft seine Arbeit selbst: check gegen den Vertrag, audit im gerenderten Zustand, dann die Rubrik. Höchstens drei Runden, danach berichtet er, was offen ist.
- **6 / Lücken melden statt nachbauen.** Fehlt eine Komponente, ein Wert oder ein Slot, baut der Agent nichts darüber. Er meldet die Lücke. So wächst das System an den richtigen Stellen.
- **7 / Messen.** Agentenläufe mit und ohne System, die gerenderte Prüfung und der Abgleich zwischen Figma und Spec zeigen, ob es wirkt. Was nicht gemessen ist, gilt als Annahme.

## Vom Entwurf in Figma zum Stand im Code

Designer arbeiten in Figma. So kommt ihre Änderung an, ohne dass jemand abtippt.

- **1 / In Figma gestalten.** Werte an Variablen ändern, Varianten und Properties anlegen, Farben an Variablen binden. Properties heißen so, wie sie im Code heißen sollen.
- **2 / Stand exportieren.** Das Plugin „Fundament Export“ liest die Datei aus. Das Ergebnis kommt als specs/figma.snapshot.json ins Repo; im Pull Request ist jede Designänderung als Diff zu sehen.
- **3 / Bauen.** node build.mjs übernimmt Tokenwerte von selbst in CSS, Verträge und Doku. Dabei wird der Kontrast nachgerechnet: Drückt eine Farbänderung ein zugesagtes Paar unter die Grenze, bricht der Build ab.
- **4 / Abgleich lesen.** node tooling/figma-diff.mjs zeigt, wo Figma und Code auseinanderliegen: Komponenten, Properties, Werte, Standards. Jede Zeile nennt, was zu tun ist.
- **5 / Im Code nachziehen.** Neue Varianten und Properties in ui/elements.js, fundament.js und components.css umsetzen. Eine Prüfung im Browser misst je Variante, ob der Code die Farben trägt, die in Figma daran hängen.
- **6 / Gate.** node tooling/verify.mjs führt alles aus. Weicht eine Seite ab, ist der Stand rot, egal wo die Änderung begann.

## Wer hat das letzte Wort

Jede Seite führt bei dem, was nur sie wissen kann.

- **Figma führt bei Werten und Aussehen.** Farbwerte, Abstände, Radien, Typografie und welche Variable an welcher Variante hängt. Das wird nicht verglichen, sondern übernommen.
- **Der Code führt bei Props und Verhalten.** Welche Attribute, Werte, Standards und Slots eine Komponente hat (ui/elements.js) und was sie tut. Figma wird daran gemessen.
- **Die Regeldatei führt beim Warum.** Regeln mit Begründung, Checks, Barrierefreiheit, Kontrastzusagen, Veraltetes (specs/rules.json). Das kann weder Figma noch der Code tragen.
- **Der Pull Request ist die Schnittstelle.** Schnappschuss, Code und Regeln liegen im selben Repo. Eine Änderung ist erst fertig, wenn alle drei zusammenpassen. Von außen schreibt nichts in die Figma-Datei.

## Eine neue Regel schreiben

Sechs Schritte. Die Regel steht danach in specs/rules.json, bei der Komponente oder bei den Grundsätzen.

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

- **Regel einer Komponente.** specs/rules.json, bei der Komponente unter rules. Gilt nur dort.
- **Grundsatz für alle Seiten.** specs/rules.json unter principles, wenn er prüfbar ist. Sonst DESIGN.md.
- **Wann ein Token gilt.** In der Beschreibung der Variable in Figma: Einsatz und Grenze, bei Farben die erlaubten Flächen.
- **Aussehen einer Variante.** In Figma, an der Variante: Fläche, Text, Rahmen und Fokusring an Variablen gebunden.
- **Props und Slots.** ui/elements.js. Daraus entstehen der Vertrag und das Manifest der Web Components.
- **Ablauf für Agenten.** AGENTS.md. Nur Schritte und Dateipfade, keine Komponenten, keine Werte.

## Eine neue Komponente aufnehmen

Der Entwurf beginnt in Figma. Der Abgleich zeigt, was noch fehlt.

- **1 / In Figma bauen.** Set mit Varianten, Properties mit den Namen aus dem Code, Farben und Maße an Variablen. Ebenen heißen nach ihrer Rolle (label, value, input, box, track, thumb, check, helperText, focusRing): Daran erkennt der Export das Aussehen.
- **2 / Exportieren.** Plugin „Fundament Export“. Der Abgleich meldet die Komponente als „nur in Figma“; bis sie umgesetzt ist, gilt sie als Entwurf.
- **3 / Im Code umsetzen.** Props in ui/elements.js, Element in ui/fundament.js, Styles in ui/components.css. Erlaubt sind nur die Farb-Tokens, die in Figma an der Komponente hängen.
- **4 / Regeln schreiben.** Eintrag in specs/rules.json: Zweck, Regeln mit Warum, Barrierefreiheit, So und So nicht. lint meldet, wenn der Eintrag fehlt.
- **5 / Beschreibung zurück nach Figma.** Der Build legt den Text unter generated/components/<name>.figma.txt ab. In Figma ins Beschreibungsfeld einfügen; der Abgleich prüft, ob er aktuell ist.
- **6 / Prüfen und messen.** node tooling/verify.mjs. Danach eine Aufgabe, die die Komponente braucht, in evals/tasks.md ergänzen.

## Was man lassen sollte

- **Listen in Prosa.** Komponenten, Werte oder Tokens in AGENTS.md, Skills oder Prompts aufzählen. Ein veraltetes Wort genügt für Fehler in Serie.
- **Regeln ohne Prüfer.** Eine Regel, die weder ein Check prüft noch die Rubrik abfragt, existiert nur auf dem Papier.
- **Fehlende Fähigkeit mit Doku flicken.** Wenn eine Komponente etwas nicht kann, hilft kein Hinweistext. Die Komponente braucht den Slot, den Zustand oder das Verhalten.
- **Tokens nach Aussehen am Einsatzort.** Zahlenrampen wie background/10 sagen nicht, wofür sie gedacht sind. Die ZDS-Probe zeigt das: Erst die Beschreibung macht sie benutzbar.
- **Ausnahmen im Produkt.** Ein überschriebener Wert an einer Stelle ist eine Regeländerung ohne Entscheidung. Wiederholt sich die Ausnahme, fehlt eine Variante.
- **Die Prüfung umgehen.** data-fd-specimen ist für Musterseiten. Wer es nutzt, um einen Befund loszuwerden, hat die Regel abgeschafft, nicht erfüllt.
