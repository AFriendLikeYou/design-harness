# Fundament: Grundsätze für Gestaltungsentscheidungen

Der Check (`node cli/fundament.mjs check`) findet falsche Namen, Regelverstöße und die fünf prüfbaren Grundsätze aus der Spec (keine Verläufe und Schatten, Satzschreibung, Aktionen sagen, was passiert, Abstände aus der Skala, Bedienelemente aus dem System). Er kann nicht beurteilen, ob eine Oberfläche gut ist. Dafür sind diese Grundsätze da. Sie enthalten bewusst keine Listen von Komponenten oder Tokens; die stehen in `generated/contracts.json`.

## 1. Eine Ansicht hat eine Hauptsache

Frag vor dem Bauen: Was soll die Person hier als Nächstes tun? Genau das bekommt die primäre Aktion. Alles andere ist sekundär oder kommt später. Wenn zwei Dinge gleich wichtig wirken, ist die Ansicht noch nicht entschieden.

## 2. Text sagt, was passiert

Eine Beschriftung nennt das Ergebnis des Klicks. Ein Titel ist allein verständlich, die Beschreibung nennt den nächsten Schritt. Ein Fehlertext sagt, wie man den Fehler behebt, nicht nur, dass es einen gibt. Farbe trägt nie allein die Bedeutung.

## 3. Nimm, was es gibt, und melde, was fehlt

Fertige Muster ganz übernehmen, statt sie neu zusammenzusetzen. Wenn eine Komponente etwas nicht kann, was die Aufgabe braucht (ein Slot, ein Zustand, eine Variante), bau es nicht darüber oder daneben nach. Schreib auf, was fehlt und wofür. Eine fehlende Fähigkeit ist eine Lücke im System, kein Anlass für eine Einzellösung.

## 4. Rolle vor Aussehen

Wähle ein Token nach seiner Aufgabe, nicht nach seiner Farbe. Zwei Tokens mit gleichem Wert sind nicht austauschbar: Ihre Werte können sich unabhängig ändern. Lies die Beschreibung des Tokens; sie nennt Einsatz und Grenzen.

## 5. Zustände gehören dem System

Hover, Fokus, Fehler und Deaktiviert kommen aus der Komponente. Der Fokusring wird nie entfernt, versetzt oder umgefärbt. Ein deaktiviertes Element braucht in der Nähe eine Erklärung, warum es deaktiviert ist.

## 6. Weniger Rahmen, klare Hierarchie

Gruppiere durch Abstand, bevor du eine Fläche oder einen Rahmen hinzufügst. Flächen werden nicht verschachtelt. Ein Hinweis pro Bereich; mehrere gleichzeitig werden überlesen.

## 7. Im Zweifel die Begründung lesen

Jede Regel im Vertrag hat ein `why`. Deckt eine Regel deinen Fall nicht wörtlich ab, folge ihrer Begründung.
