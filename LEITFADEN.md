<!-- Generiert aus specs/leitfaden.json – nicht von Hand bearbeiten. -->
# So funktioniert es

Design entsteht in Figma, Code im Repo. Diese Seite zeigt, wie beides zusammenkommt und wie geprüft wird, ob der Code zur Vorlage passt.

## Das Ganze in einem Bild

Ein Klick bringt den Stand aus Figma ins Repo. Dort wird nachgemessen.

**Figma** (Design zeichnet) → **Plugin** (ein Klick) → **Repo** (Code und Regeln) → **Prüfung** (misst nach) → **Ergebnis** (Bausteine, Doku, Seiten)


## Ich gestalte

Du arbeitest in Figma. Auf deinem Rechner muss dafür heute ein kleiner Server laufen, siehe unten.

1. **In Figma bauen.** Farben und Abstände an Variablen binden. Properties so nennen, wie sie im Code heißen sollen.
2. **Plugin starten.** „Fundament Export“ liest die Datei und prüft sie gegen den Code. In Figma ändert es nichts.
3. **Übernehmen.** Ein Klick legt den Stand ins Repo.

**Was das Plugin dir sagt**

- **Passt:** Figma und Code stimmen überein.
- **Im Code nachzuziehen:** Kein Fehler von dir. Die Entwicklung setzt es um. Bis dahin gilt der Baustein als Entwurf.
- **In Figma beheben:** Zum Beispiel ein zu schwacher Kontrast. „Zeigen“ springt zur Stelle.


> **Voraussetzung heute.** Auf dem Rechner läuft der lokale Server (node tooling/serve.mjs). Geplant ist, dass das Plugin stattdessen direkt einen Pull Request auf GitHub anlegt.


## Ich entwickle

Du setzt um, was der Abgleich meldet.

1. **Abgleich lesen.** Zeigt, was in Figma neu oder anders ist, und sagt, was zu tun ist. `node tooling/figma-diff.mjs`
2. **Umsetzen.** Attribute, Verhalten, Aussehen. Nur mit Tokens, nie mit festen Werten. `ui/elements.js`, `ui/fundament.js`, `ui/components.css`
3. **Prüfen.** Grün heißt: Alle Prüfungen sind bestanden, Farben und Rahmen stimmen mit Figma überein. `node tooling/verify.mjs`


> **Und die Regeln?.** Wofür ein Baustein da ist und was für ihn gilt, steht in specs/rules.json. Jede Regel ist ein Satz mit Begründung.


## Wie wir prüfen, dass der Code zur Vorlage passt

Drei Messungen. Jede läuft von selbst, bei jeder Änderung.

1. **Werte werden nicht abgetippt.** Farben, Abstände, Radien und Schrift kommen aus Figma direkt ins CSS.
2. **Jeder Baustein wird nachgemessen.** Ein Programm öffnet jede Variante im Browser und vergleicht Farben und Rahmenstärken mit Figma, hell und dunkel.
3. **Jede Seite wird geprüft.** Erfundene Bausteine, feste Farbwerte und feste Abstände fallen auf. Am fertigen Bild werden Handybreite, Kontrast und Klickflächen gemessen.


> **Was noch nicht gemessen wird.** Welchen Abstand, Radius oder Textstil ein Baustein an welcher Stelle nutzt. Die Werte selbst kommen aus Figma, aber ein falsch gewählter Innenabstand fiele heute nicht von selbst auf.


## Wenn ein KI-Agent baut

Ein Agent arbeitet in einer festen Schleife. Vier Dinge nehmen ihm dabei das Raten ab.

1. **Lesen.** Die erzeugte Liste der Bausteine, Werte und Regeln laden.
2. **Bauen.** Nur mit Bausteinen des Systems. Eigenes CSS nur fürs Layout.
3. **Prüfen.** Den Check laufen lassen und jeden Befund beheben. `node cli/fundament.mjs check <Pfad>`
4. **Am Bild messen.** Handybreite, Kontrast, Klickflächen, Namen. `node cli/fundament.mjs audit <Pfad>`
5. **Höchstens drei Runden.** Danach berichten, was offen ist, statt weiter zu raten.
6. **Lücken melden.** Fehlt ein Baustein, nicht nachbauen, sondern nennen.

1. **Er bekommt eine Liste, keine Beschreibung.** Für jeden Baustein steht fest, wie er heißt, welche Einstellungen er hat und welche Werte erlaubt sind. Die Liste wird erzeugt. Niemand tippt sie ab, also veraltet sie nicht.

   ```
   fd-button
     variant   primary | secondary | ghost | danger
     size      md | sm
     disabled  ja | nein
     label     Text
   ```

2. **Der Check sagt, was falsch ist und was gilt.** Erfundene Bausteine, falsche Werte, feste Farben und feste Abstände fallen sofort auf. Jede Meldung nennt die Behebung.

   ```
   <fd-button variant="blue"> ist kein gültiger Wert.
       Behebung: Erlaubt: primary, secondary, ghost, danger (Standard: primary).
   
   Fester Farbwert #1f4fd8.
       Behebung: Durch ein semantisches Token ersetzen, var(--fd-color-…).
   ```

3. **Regeln haben einen Grund.** Jede Regel ist ein kurzer Satz mit Begründung. Die Begründung hilft dem Agenten in Fällen, an die niemand gedacht hat.

   ```
   Regel:  Höchstens ein primärer Button pro Ansicht.
   Warum:  Mehrere primäre Aktionen konkurrieren um Aufmerksamkeit.
   ```


## Woher die Regeln kommen

Eine Regel entsteht aus einem Fehler, der wirklich passiert ist. Sie gilt erst, wenn sie im Repo steht.

**Anlass** (ein echter Fehler) → **Vorschlag** (ein Satz mit Warum) → **Entscheidung** (im Pull Request) → **Prüfbar machen** (Check und Fehlerfall) → **Gilt** (Doku, Liste, Check)


> **Stand heute.** Die Regeln in diesem Beispielsystem sind ein Startsatz: aus gemessenen Agentenläufen und aus üblicher Praxis für Barrierefreiheit. Wer im Team entscheidet, ist ein Vorschlag und noch nicht festgelegt.

- **Wer schlägt vor.** Alle: Design, Entwicklung, Redaktion. Auch ein Agent, wenn er in seinem Bericht eine Lücke oder einen wiederkehrenden Fehler nennt.
- **Wer schreibt.** Wer den Fehler gesehen hat, schreibt die Regel als Satz mit Begründung in specs/rules.json. Mehr braucht es für den Vorschlag nicht.
- **Wer entscheidet.** Design und Entwicklung gemeinsam, im Pull Request. Ohne Zustimmung beider Seiten wird die Regel nicht zusammengeführt.
- **Was der Rechner verlangt.** Jede Regel braucht eine Begründung und einen eindeutigen Namen. Verspricht sie einen Check, muss es ihn geben, samt Beispiel, das die Regel verletzt. Sonst ist der Stand rot.

## Was wohin gehört

Drei Orte. Jeder führt bei dem, was nur er wissen kann.

- **Figma: Wie es aussieht.** Farben, Abstände, Radien, Schrift; Welche Farbe an welcher Variante hängt; Wofür ein Token gedacht ist. Datei: `specs/figma.snapshot.json`
- **Code: Was es kann.** Attribute und ihre Werte; Slots für Inhalte; Verhalten und Bedienung. Datei: `ui/elements.js, ui/fundament.js, ui/components.css`
- **Regeldatei: Warum und wann.** Wofür eine Komponente da ist; Regeln mit Begründung; Zugesagte Kontraste, Veraltetes. Datei: `specs/rules.json`

Der Build setzt alles zusammen: CSS mit allen Tokens, Liste für Agenten, Diese Doku, HTML-Fassung.


## Alle Abläufe Schritt für Schritt

Von oben nach unten lesen. Die Farbe zeigt, wer den Schritt macht.

### Ein Design ändert sich

Eine Farbe, ein Abstand oder eine Variante soll anders werden.

1. **In Figma ändern** (Design): Den Wert an der Variable ändern oder die Variante an der Komponente.
2. **Stand exportieren** (Design): Plugin „Fundament Export“ starten und auf „Ins Repo übernehmen“ klicken.
3. **Bauen und nachrechnen** (Automatisch): Neue Werte landen im CSS. Der Kontrast wird nachgerechnet.
4. **Code nachziehen** (Entwicklung): Nur nötig, wenn der Abgleich etwas meldet, zum Beispiel eine neue Variante.
5. **Freigabe** (Automatisch): Alle Prüfungen sind grün. Die Änderung darf zusammengeführt werden.

Wenn es hakt: Reicht der Kontrast in Schritt 3 nicht, bricht der Build ab. Dann zurück zu Schritt 1.

Am Ende: Figma und Code zeigen denselben Stand.

### Eine neue Komponente entsteht

Im System fehlt ein Baustein.

1. **In Figma bauen** (Design): Varianten und Properties so benennen, wie sie im Code heißen sollen.
2. **Stand exportieren** (Design): Die Komponente steht jetzt nur in Figma. Bis sie umgesetzt ist, gilt sie als Entwurf.
3. **Im Code umsetzen** (Entwicklung): Attribute, Verhalten und Styles.
4. **Regeln schreiben** (Team): Wofür sie da ist, was gilt und warum.
5. **Freigabe** (Automatisch): Das Aussehen wird im Browser gegen Figma gemessen.

Wenn es hakt: Meldet die Messung eine Abweichung, zurück zu Schritt 3.

Am Ende: Die Komponente steht in Doku und Liste. Agenten dürfen sie verwenden.

### Eine neue Regel kommt dazu

Ein Fehler ist wirklich passiert und soll nicht wieder passieren.

1. **Fehler festhalten** (Team): Was ist passiert, und wo?
2. **Regel und Warum schreiben** (Team): Ein Satz, der sich zählen oder zeigen lässt. Ein Satz Begründung.
3. **Prüfbar machen** (Entwicklung): Wenn möglich, einen Check bauen. Sonst bleibt es eine Frage fürs Urteil.
4. **Fehlerfall ablegen** (Entwicklung): Ein Beispiel, das die Regel verletzt. Der Test verlangt, dass der Check es findet.
5. **Bauen** (Automatisch): Die Regel steht in Doku und Liste.

Am Ende: Der Fehler wird ab jetzt von selbst gefunden.

### Ein Agent baut eine Seite

Jemand bittet einen KI-Agenten um eine Seite.

1. **Lesen** (Agent): Die Liste der Komponenten, Werte und Regeln laden.
2. **Bauen** (Agent): Nur mit Bausteinen des Systems. Eigenes CSS nur fürs Layout.
3. **Prüfen** (Automatisch): Der Check nennt jeden Fehler und sagt, wie man ihn behebt.
4. **Beheben** (Agent): Fehler korrigieren und noch einmal prüfen.
5. **Im Browser messen** (Automatisch): Passt es aufs Handy? Reicht der Kontrast? Sind die Klickflächen groß genug?
6. **Berichten** (Agent): Was offen ist und was dem System fehlt.

Wenn es hakt: Schritt 3 und 4 wiederholen sich, höchstens drei Runden. Danach wird berichtet statt geraten.

Am Ende: Eine geprüfte Seite und eine Liste der Lücken.


## Eine gute Regel schreiben

Drei Dinge machen eine Regel brauchbar, für Menschen wie für Agenten.

- **1 / Sie kommt aus einem echten Fehler.** Regeln auf Vorrat liest niemand und prüft niemand.
- **2 / Ein Satz, den man zählen oder zeigen kann.** „Höchstens ein primärer Button pro Ansicht“ lässt sich zählen. „Buttons sparsam einsetzen“ lässt sich nur auslegen.
- **3 / Sie hat ein Warum.** Ein Satz, der sagt, wovor die Regel schützt. Damit lassen sich auch Fälle entscheiden, an die niemand gedacht hat.

```json
{
  "id": "card/one-action",
  "text": "Höchstens eine Aktion im Footer.",
  "why": "Karten sind Einstiege, keine Formulare.",
  "check": "max-children"
}
```

So steht eine Regel in specs/rules.json. Lässt sie sich nicht automatisch prüfen, steht bei check der Wert null.

| So nicht | So |
|---|---|
| Bedienelemente übersichtlich halten. | Höchstens eine Aktion im Footer. |
| Der Fokus muss gut sichtbar sein. | Hover und Fokus kommen aus der Komponente, nie selbst gestaltet. |
| Fehlt eine Komponente, improvisiere passend zum Stil. | Fehlt eine Komponente, nicht nachbauen. Die Lücke im Bericht nennen. |

## Ohne Web Components: nur HTML und CSS

Die Bausteine gibt es als Web Components und als reines HTML mit CSS. Beide nutzen dasselbe CSS und dieselben Tokens. Die HTML-Fassung wird aus den Web Components erzeugt und im Browser nachgemessen: Sie sieht gleich aus.

|  | Web Components | Nur HTML und CSS |
|---|---|---|
| Einbinden | tokens.css, components.css, fundament.js | tokens.css, components.css |
| Schreiben | Ein Element mit Attributen, zum Beispiel <fd-button variant="primary" label="Speichern"> | Markup aus generated/html/ kopieren. Die Variante steht als data-Attribut am Element. |
| Aussehen | Kommt aus Figma | Dasselbe, gemessen gleich |
| Verhalten | Eingebaut: Passwort anzeigen, Eingabe leeren, Bestätigen vor dem Löschen | Selbst schreiben |
| Zustände für Hilfstechnik | Eingebaut: Label und Feld verknüpft, Fehler und Schalterstand angesagt | Selbst setzen und aktuell halten |
| Wenn sich ein Baustein ändert | Jede Seite bekommt die Änderung von selbst | Markup an jeder Stelle nachziehen |
| Prüfen | check prüft alle Regeln | check --html prüft Klassen, Werte und einen Teil der Regeln |

- **Was in beiden Wegen gleich bleibt.** Figma als Ort für das Aussehen, die Tokens, die Regeln, der Abgleich zwischen Figma und Code und die Messung im Browser (audit). Die Messung arbeitet am fertigen Bild und gilt deshalb für beide Wege voll.
- **Was der Check im HTML-Weg nicht sieht.** Regeln zu Slots, den Fehlertext im Fehlerzustand und den Grund bei deaktivierten Feldern. Bei Web Components hängen sie an Attributen. Im reinen HTML gibt es dafür keine feste Stelle.
- **Wann welcher Weg.** Web Components sind der Standard. Reines HTML passt, wenn auf der Seite kein Skript laufen soll oder das Markup aus einem System kommt, das eigene Elemente nicht kennt.
- **Beleg aus der ZDS-Probe.** Mit CSS ohne Verhalten haben Agenten jedes Bedienelement selbst gebaut, eigenes Skript geschrieben und Schalter ohne Namen geliefert (probe-zds/ERGEBNIS.md). Die fertigen Vorlagen und check --html verkleinern diese Lücke. Das Verhalten ersetzen sie nicht.

## Was man lassen sollte

- **Namen und Werte in Anleitungen abtippen.** Listen von Komponenten oder Tokens in Prompts und Hinweisdateien veralten. Sie stehen nur in der erzeugten Liste.
- **Regeln, die niemand prüft.** Eine Regel ohne Check und ohne Frage im Review steht nur auf dem Papier.
- **Fehlendes mit Text flicken.** Kann ein Baustein etwas nicht, hilft kein Hinweis. Er braucht den Slot, den Zustand oder das Verhalten.
- **Ausnahmen im Produkt.** Ein überschriebener Wert ist eine Regeländerung ohne Entscheidung. Kommt die Ausnahme wieder, fehlt eine Variante.
