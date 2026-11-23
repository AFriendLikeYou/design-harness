# Vorschlag: die sechs Kontrastverstöße im ZDS beheben

Stand 23.11.2026. Grundlage: `generated/contrast.json` der Probe (vom Build nach WCAG 2.x gerechnet) und die Token-Werte aus `packages/tokens/dist/styles-zds.css`. Alle Verhältnisse unten sind nachgerechnet, nichts ist geschätzt. Der Vorschlag ändert nichts am ZDS; er zeigt je Verstoß die kleinste Korrektur.

## 1 und 2: Rahmen der Checkbox und des Inputs (hell und dunkel)

| | heute | Verhältnis | nötig |
|---|---|---|---|
| hell: `border-100` #cccccf auf #ffffff | | 1,6:1 | 3:1 |
| dunkel: `border-100` #363636 auf #121212 | | 1,55:1 | 3:1 |

**Vorschlag:** Für Rahmen von Bedienelementen `text-55` verwenden statt `border-100`. Das Token gibt es schon: hell #69696c, dunkel #999999. Beide liegen deutlich über 3:1, und der Input nutzt `text-55` heute bereits für den Fokusrahmen.
Folge: Der Fokus des Inputs braucht dann ein anderes Zeichen, am einfachsten dieselbe 2-px-Outline in `focus-100` wie beim Button.
`border-100` bleibt für Trennlinien, die kein Bedienelement begrenzen.

## 3 und 4: Bahn des Toggles im Aus-Zustand (hell und dunkel)

| | heute | Verhältnis | nötig |
|---|---|---|---|
| hell: `background-20` #dfdfe1 auf #ffffff | | 1,33:1 | 3:1 |
| dunkel: `background-20` #2e2e2e auf #121212 | | 1,38:1 | 3:1 |

**Vorschlag:** Die Bahn im Aus-Zustand bekommt einen Rahmen in `text-55` (1 px, innen). Die Fläche bleibt `background-20`. So ändert sich das Aussehen kaum, und die Grenze des Bedienelements ist erkennbar.
Alternative mit stärkerem Eingriff: Bahn in `text-40` (hell #999999 = 2,85:1, reicht knapp nicht; es bräuchte einen neuen Wert um #8f8f8f = 3,23:1).

## 5: Beschriftung des Z+-Buttons im Dark Mode

| | heute | Verhältnis | nötig |
|---|---|---|---|
| dunkel: Weiß auf `accent-100` #eb362e | | 4,12:1 | 4,5:1 |

**Vorschlag A (kleinster Eingriff):** Im Dark Mode für die Fläche des Z+-Buttons den hellen Wert #b91109 behalten. Weiß darauf hat 6,67:1. `accent-100` dunkel bleibt für Text und Akzente auf dunklem Grund, wofür es aufgehellt wurde.
**Vorschlag B:** Die Beschriftung im Dark Mode dunkel setzen: #121212 auf #eb362e hat 4,55:1. Das reicht knapp und ändert das gewohnte Bild stärker.
Das passt zur Hausregel, dass das Markenrot selbst nicht verändert wird: Vorschlag A nutzt nur vorhandene Werte.

## 6: Haken der Checkbox und Knopf des Toggles im Dark Mode

| | heute | Verhältnis | nötig |
|---|---|---|---|
| dunkel: `general-white-100` #ffffff auf `text-100` #ffffff | | 1:1 | 3:1 |

Ursache: Die gefüllte Fläche nutzt `text-100`, das im Dark Mode zu Weiß wird. Haken und Knopf sind fest weiß.
**Vorschlag:** Haken und Knopf nutzen `background-0` statt `general-white-100`. Hell bleibt alles gleich (#ffffff auf #252525 = 15,33:1), dunkel wird der Haken #121212 auf Weiß (18,73:1).
Das ist dieselbe Paarung, die der Primary-Button schon nutzt: Fläche `text-100`, Beschriftung `background-0`.

## Dahinter liegt ein Namensproblem

Vier der sechs Verstöße entstehen, weil ein Token mehrere Aufgaben hat (`text-100` als Text und als Fläche, `border-100` als Trennlinie und als Rahmen von Bedienelementen). Mit Rollen-Tokens wäre der Fehler nicht passiert: Ein Token „Fläche gewählt“ und ein Token „Zeichen auf gewählter Fläche“ werden als Paar definiert und als Paar geprüft. Ein erster Schritt ohne Umbau der Rampe wären vier Aliase:

| Rolle | hell | dunkel |
|---|---|---|
| Rahmen Bedienelement | `text-55` | `text-55` |
| Fläche gewählt | `text-100` | `text-100` |
| Zeichen auf gewählter Fläche | `background-0` | `background-0` |
| Fläche Z+ | #b91109 | #b91109 |

## Nicht geprüft

- Ob die Vorschläge zum Erscheinungsbild von zeit.de passen, ist eine Gestaltungsentscheidung. Gerechnet ist nur der Kontrast.
- Die Probe umfasst fünf Komponenten. Dieselben Tokens stecken in weiteren ZDS-Komponenten, die hier nicht untersucht sind.
- Hover- und Disabled-Zustände sind nicht einzeln nachgerechnet.
