# Challenge 4: Plattformkonzept „rund um die Maschine“

Stand: 13.11.2026, nach Christians Antworten im Fragebogen (`antworten/fragebogen-plattform-v1`).
Baut auf `synthese-nach-gespraech.md` auf und erweitert sie um die
Dienste neben dem Software-Update. Belegmarken wie im Projekt: `[geprüft]`, `[Suchtreffer]`,
`[Annahme]`. Aussagen „laut Gespräch“ sind mündliche Schätzungen des Challenge-Gebers
(`gespraech-challenge-geber.md`). Alles ohne Marke in diesem Dokument ist unser Entwurf, also
`[Annahme]`.

## Das Ergebnis zuerst

Wir bauen im Hackathon **ein** Killer-Feature: Die Plattform findet das goldene Fenster für ein
Update, macht das Gerät dafür bereit und lässt genau einen Menschen den Start bestätigen
(Fenster-Lotse mit Begleiter und Bestätigung). Bleibt Zeit, kommen in dieser Reihenfolge dazu:
zuerst die Aufträge für Personen in der Nähe, dann der Roboter-Einsatz. Alles
andere in diesem Dokument zeigen wir nur als Bild, als Mock-Screen oder als Satz im Pitch. Es soll
belegen, dass wir das Problem und seine Abhängigkeiten verstanden haben, und dass das
Killer-Feature der erste Baustein einer Plattform ist und kein Einzelwerkzeug.

## Der Kerngedanke: Das goldene Fenster ist die gemeinsame Währung, der Roboter die gemeinsame Hand

Zwei Dinge sind rund um die Maschine knapp: eine Zeit, in der Gerät, Raum, Strom und der richtige
Mensch zusammenkommen, und eine Hand, die am Gerät das Physische erledigt. Die Plattform teilt
beides über alle Dienste. Das Gefühl dahinter: **Die unsichtbaren Helfer bekommen Hilfe.** In der
Klinik halten viele Menschen den Betrieb am Laufen, ohne dass es jemand sieht. Für sie ist die
Plattform gedacht.

Laut Gespräch scheitert das Update nicht am Download, sondern daran, dass niemand die rund 120
Minuten findet, in denen Gerät, Strom, Raum und ein zuständiger Mensch zusammenkommen. Genau
dasselbe knappe Gut brauchen auch die anderen Dienste am Gerät:

| Dienst | Braucht das Gerät | Braucht einen Menschen | Wer sucht heute das Fenster |
|---|---|---|---|
| Software-Update | aus dem Einsatz, mit Strom und Netz | Bestätigung des Starts, bei Armbewegung Aufsicht | Medizinphysik per Telefon (laut Gespräch) |
| Wartung und Prüfungen (sicherheitstechnische Kontrolle, Konstanzprüfung, Akku) | aus dem Einsatz | Prüfer oder Technik vor Ort | Medizintechnik, Medizinphysik |
| Servicetermin des Herstellers | aus dem Einsatz, zugänglich | Techniker, dazu jemand, der Zugang gibt | Kundendienst und Klinik, mehrere Anrufe |
| Einweisung und Fortbildung | frei und eingeschaltet | die Person selbst und eine einweisende Person | Stationsleitung, Hersteller-Trainer |
| Logs und Diagnose | eingeschaltet oder mit Begleiter | niemanden | bisher niemand (laut Gespräch fehlt der Log-Strom) |
| Gerät morgens am richtigen Ort | frei, fahrbereit | eine Person in der Nähe | wer es morgens sucht |

Heute sucht jede Stelle ihr Fenster für sich. Die Plattform sucht es einmal und legt hinein, was
zusammenpasst: die Konstanzprüfung direkt nach dem Update und vor dem nächsten Einsatz, die Kurzschulung „Was ist neu“ beim
ersten Einschalten danach, den Servicetermin in das Fenster, in dem das Gerät ohnehin steht. Das
ist der Unterschied zwischen einem Update-Planer und einer Plattform.

## Vertikal: sechs Schritte, die jeder Dienst durchläuft

| Schritt | Was passiert | Wer es heute tut | KI-Helfer | Was beim Menschen bleibt |
|---|---|---|---|---|
| 1 Erkennen | Das Gerät meldet, was es braucht: Update fällig, Prüfung fällig, Fehlerbild, Akku schwach | niemand systematisch | Begleiter am Gerät, Geräteakte | nichts |
| 2 Planen | Fenster finden, Dienste bündeln, Ersatzgerät benennen | Telefonate zwischen drei Rollen | Lotse | Freigabe durch die Medizinphysik |
| 3 Vorbereiten | Vorab-Check: Strom, Netz, Paket geprüft, Zugang, Teile, Ansprechperson | wer gerade daran denkt | Empfang (neu), Lagerist (neu), Bote | eine kleine Bitte an die Person am Gerät, höchstens ein Handgriff |
| 4 Ausführen | Update läuft, Prüfung findet statt, Techniker arbeitet, Schulung läuft | Mensch vor Ort | Bote (Roboter oder Begleiter) | Start bestätigen, bei Armbewegung dabeibleiben |
| 5 Prüfen | Hat sich das Gerät zurückgemeldet, ist es einsatzbereit, steht ein Ersatz bereit | fällt am nächsten Morgen auf | Wächter | Warnung bestätigen |
| 6 Lernen und belegen | Was hat das Fenster gezeigt, was steht im Nachweis | Ordner, Tabellen | Chronist (neu), Geräteakte | Nachweis lesen und unterschreiben |

In jedem Schritt gilt dieselbe Regel wie beim Update: Die KI bekommt ein Ziel und Leitplanken,
ein Mensch trifft die Entscheidung, für die er verantwortlich ist.

## Horizontal: die Dienste rund um die Maschine

| Dienst | Im Hackathon | Was die Plattform dafür schon hat | Nutzen für die Klinik | Nutzen für den Hersteller |
|---|---|---|---|---|
| **Software-Updates** | gebaut | Fenster, Regeln, Rollen, Begleiter, Roboter, Wächter | Flotte aktuell, kein Eingriff wartet | weniger tote Geräte, weniger verärgerte Anrufe |
| **Wartung und Prüfungen** | eigener Bereich, Ausblick | dieselben Fenster, Fälligkeiten in der Akte | ein Termin statt zwei | planbare Einsätze |
| **Servicetermine mit Vorab-Check** | eigener Bereich, Ausblick | Logs, Standort, Zugang, Fenster, Vertrag | Gerät schneller wieder da | Techniker kommt einmal und mit dem richtigen Teil |
| **Einweisung und Fortbildung** | eigener Bereich, Ausblick | weiß, was sich am Gerät geändert hat und wer eingewiesen ist | Nachweis ohne Zettel, sichere Bedienung | neue Funktionen werden genutzt |
| **Weitere Roboter-Dienste** | Nachtschicht mit Fähigkeiten, Ausblick | Route, Regeln, Fernsteuerung | weniger Laufwege, keine toten Akkus | Log-Strom auch von Geräten ohne Netz |
| **Nachweise** | eigener Bereich, Ausblick | jede Entscheidung ist schon protokolliert | Patch-Stand und Prüfungen auf Knopfdruck | Marktüberwachung mit echten Daten |
| **Rückkanal zum Hersteller** | eigener Bereich, Ausblick | Nutzungsmuster ohne Patientendaten, von der Klinik je Datenart freigegeben | bessere Geräte | vorausschauender Service, Entwicklung nah am Alltag |
| **Gerät morgens am richtigen Ort** | eigener Bereich, Ausblick | OP-Plan von morgen, Standorte aus der Abendrunde, Aufträge für Personen in der Nähe | keine Suche kurz vor dem Schnitt | weniger Reklamationen über „fehlende“ Geräte |
| **Andere Gerätetypen** | eigener Bereich, Ausblick | dieselben sechs Schritte | eine Plattform statt einer je Gerät | mehr Geräte je Kunde auf demselben Weg |

Christian wollte alle acht weiteren Dienste angedeutet sehen, jeden als eigenen klickbaren Bereich.
Im Klickdummy liegen sie unter „Weitere Dienste“ und in der Roboter-Ansicht und tragen sichtbar
das Wort „Ausblick“.

### Servicetermin mit Vorab-Check

Gemeint ist eine Prüfung **vor** dem Termin, damit der Techniker nicht umsonst kommt, und damit
das Klinikpersonal den Termin so gut wie möglich vorbereiten kann. Das Bild dazu ist der
Online-Check-in vor einem Flug. Bevor ein Techniker losfährt, ist geklärt:

1. **Gerät:** Fehlercodes, Logs ohne Patientendaten, Softwarestand, Akku, letzter Einsatz.
2. **Person am Gerät:** „Was hast du gesehen?“ am Begleiter, drei Antworten zum Antippen, 20
   Sekunden, kein Freitext und keine Verantwortung für die Diagnose.
3. **Plan:** das nächste Fenster, in dem das Gerät frei und zugänglich ist, und wer Zugang gibt.
4. **Vertrag:** Reaktionszeit und Abdeckung.
5. **Vorbereitung der Klinik:** Der Empfang nennt der Klinik die wenigen Punkte, an denen der
   Termin sonst scheitert, zum Abhaken: Gerät bleibt eingesteckt, jemand öffnet, Ersatzgerät ist
   eingeplant.
6. **Ergebnis:** Der Techniker sieht „bereit zum Besuch“ oder „noch nicht losfahren, offen ist:
   Vorbereitung der Klinik“ und bringt das wahrscheinlich nötige Teil mit. Zusagen kann er erst,
   wenn alles erledigt ist. Der Lagerist prüft, ob das Teil vorrätig ist.

Ein Foto ist bewusst nicht dabei (Christians Entscheidung), weil im OP-Bereich zu leicht etwas
ins Bild gerät, das nicht hineingehört.

Was wir nicht wissen: wie der Kundendienst heute disponiert und welche Daten er schon hat. Das ist
eine Frage an die Challenge-Owner.

### Einweisung und Fortbildung

- **„Was ist neu“ in zwei Minuten:** Nach einem Update zeigt das Gerät beim ersten Einschalten,
  was sich für die Bedienung geändert hat. Überspringbar, später nachholbar.
- **Einweisung mit Nachweis:** Die Plattform weiß, wer in welches Gerät eingewiesen ist. Sie
  braucht das ohnehin, um Aufsicht bei Updates mit Armbewegung nur eingewiesenen Personen
  anzubieten. Dass Betreiber Einweisungen dokumentieren müssen, folgt aus der
  Medizinprodukte-Betreiberverordnung `[Annahme, vor dem Pitch gegen den Verordnungstext prüfen]`.
- **Lernfenster:** Dieselbe Logik wie beim Update. Schulung wird vorgeschlagen, wenn Gerät und
  Person gleichzeitig frei sind.
- **Grenze:** Gespeichert wird nur „eingewiesen ja oder nein“, sichtbar für die Person selbst
  und die Medizinphysik. Kein Lernverlauf, keine Rangliste,
  keine Auswertung von Bedienfehlern je Person. Alles andere wäre ein Thema für Personalrat und
  Datenschutz.

### Was der Roboter später noch kann

Der Roboter ist heute die Hand für das Update. Dieselbe Hand kann mehr, ohne dass sich an seinen
Regeln etwas ändert (kein OP-Saal, keine Strahlung, kein Start ohne Mensch, keine Bilder):

| Fähigkeit | Stand | Nutzen |
|---|---|---|
| Update einspielen | gezeigt | das Killer-Feature |
| Andere Updates einspielen (Firmware, Sicherheitslisten, weitere Gerätetypen) | später | eine Runde für die ganze Flotte |
| Logs und Diagnosedaten holen | später | Log-Strom auch ohne Netz |
| Strom bringen und Akkus pflegen | später | keine toten Geräte im Flur |
| Abendrunde und Inventur | später | jeder weiß, wo welches Gerät steht |
| Techniker lotsen und vorbereiten | später | weniger Suchzeit beim Servicetermin |
| Teile bringen | später | das Akkumodul liegt am Gerät, bevor der Techniker da ist |
| Einweisung begleiten | später | Kurzschulung am Gerät, ohne dass jemand Material holt |
| Geräte an den richtigen Ort bringen | Vision | das Gerät steht morgens vor dem richtigen Saal |

Im Klickdummy steht das als erfundene Nachtschicht von 17 bis 7 Uhr: Man tippt eine Fähigkeit an
und sieht, wann sie in der Nacht drankommt.

**Geräte bewegen ist die fernste Stufe.** Heute gilt die Regel „der Roboter bewegt keinen
C-Bogen“, und sie bleibt im Klickdummy bestehen. Ein Roboter, der ein mehrere hundert Kilo
schweres Gerät durch einen Flur mit Menschen schiebt, braucht eine eigene Sicherheitsbetrachtung
`[Annahme]`. Bis dahin geht dieser Weg als kleiner Auftrag an eine Person in der Nähe.

## Wie KI und Agenten das orchestrieren

Ein Dirigent, benannte Helfer, Menschen entscheiden.

| Helfer | Aufgabe | Darf selbst | Darf nie |
|---|---|---|---|
| **Lotse** (Dirigent) | Fenster finden, Dienste bündeln, Arbeit an die anderen verteilen, bei Alarm neu planen | vorschlagen und umplanen | ein Fenster ohne Freigabe als geplant führen |
| **Bote** | Roboter und Begleiter: Strom, Paket, Umgebung, Logs | hinfahren, einstecken, „Umgebung frei“ melden | ein Update starten |
| **Wächter** | Start und erwartetes Ende kennen, Ausbleiben melden, Ersatz vorschlagen | melden | eine Warnung von selbst schließen |
| **Dolmetscher** | jede Bitte in der Sprache der Rolle, eine Frage je Rolle | Nachrichten formulieren | für eine Rolle entscheiden |
| **Empfang** (neu) | Servicetermine vorbereiten, Check-in zusammenstellen | Daten sammeln und zusammenfassen | einen Techniker ohne Zusage der Klinik einbestellen |
| **Coach** (neu) | Kurzschulung nach Updates, Einweisungen im Blick | Lernfenster vorschlagen | Personen bewerten |
| **Chronist** (neu) | Nachweise für Prüfungen und IT-Sicherheit mitschreiben | protokollieren | Einträge ändern oder löschen |
| **Lagerist** (neu) | Teile und Zubehör im Blick, Vorschlag für das wahrscheinlich nötige Teil | Bestand prüfen, Teil vormerken | ohne Freigabe bestellen |

Im Klickdummy steht das als Kreis: der Lotse in der Mitte, die Helfer auf einem Ring, die vier
entscheidenden Rollen außen. Vorbild ist die Kreis-Animation aus dem Goebel-OS-Pitch. Der Kreis
steht auf der Startseite, im Cockpit „Heute“ und unter „Helfer und Regeln“.

**Selbstständigkeit in drei Stufen, je Dienst einstellbar:** Die KI schlägt vor. Die KI handelt
nach Freigabe. Die KI handelt selbst und meldet es. Logs holen kann auf Stufe drei stehen, ein
Fenster planen auf Stufe zwei. Der Start eines Updates bleibt unabhängig von der Stufe bei einem
Menschen.

**Was die Helfer gemeinsam nutzen:** die Geräteakte (was das Gerät ist und braucht), den Kalender
(OP-Plan, Dienstplan, Fenster) und die Regeln (Leitplanken, die kein Helfer überstimmen kann).
Kein Helfer sieht Patientendaten.

## Schlüsselhypothesen für das Gespräch mit den Challenge-Ownern

Jede Hypothese ist so formuliert, dass man sie bestätigen oder widerlegen kann.

1. **Das Fenster ist der Engpass, nicht die Technik.** Updates bleiben liegen, weil niemand die
   120 Minuten findet, nicht weil der Download fehlt.
2. **Niemand ist zuständig, also ist am Ende jemand schuld.** Wenn jede Rolle genau eine kleine
   Entscheidung bekommt, verschwindet die Schuldfrage.
3. **Dasselbe Fenster trägt mehrere Dienste.** Update, Prüfung, Servicetermin und Einweisung
   lassen sich bündeln, und das spart mehr als jeder Dienst für sich.
4. **Am geparkten Gerät fehlt nur Physisches.** Strom, Einschalten, Netz. Das kann ein Begleiter
   oder ein Roboter liefern, ohne den C-Bogen zu verändern.
5. **Ein gut vorbereiteter Servicetermin spart die zweite Anfahrt.** Der Vorab-Check stellt
   sicher, dass der Techniker nicht umsonst kommt, und sagt der Klinik, was sie vorbereitet.
6. **Die Klinik gibt Belegung und Dienste frei, wenn keine Patientendaten nötig sind.** Saal,
   Zeit, Gerät und Rolle reichen.
7. **Menschen nehmen kleine Aufträge an, wenn Ablehnen nichts kostet.** Die Anfrage geht nur an
   Personen, die im Dienst und frei sind, und niemand wird ausgewertet.

## Der Weg

| Stufe | Inhalt | Braucht |
|---|---|---|
| **Hackathon** | Killer-Feature als Klickdummy mit getesteter Planungslogik, Plattformbild, Mock-Screens | erfundene Daten |
| **Pilot in einem Haus** | Fenster-Lotse und Begleiter für eine Flotte, Wächter, eine Anbindung an die OP-Planung | Belegung ohne Patientendaten, Gerätestand aus dem Flottenportal, Vereinbarung mit Personalrat und Datenschutz |
| **Ausbau** | Wartung, Servicetermine, Einweisung im selben Fenster, Roboter in großen Häusern | Schnittstelle zum Kundendienst, Schulungsinhalte des Herstellers |
| **Vision** | Der Roboter als Hand für alle Dienste, weitere Gerätetypen, Rückkanal in die Entwicklung | Regulatorische Klärung je Dienst |

## Notizen für Pitch, Konzept und Design

- **Pitch:** Ein Satz reicht für die Breite: „Was wir für das Update zeigen, gilt für alles, was
  am Gerät ein freies Fenster braucht.“ Danach zurück zum Killer-Feature. Zahlen nur mit dem
  Hinweis „laut Siemens im Gespräch“.
- **Konzept:** Die Plattform ist das Gehirn, der Roboter sind die Hände, das Tamagotchi ist die
  Persönlichkeit. Neu ist die Klammer „gemeinsame Währung“.
- **Design:** Alles Angedeutete trägt sichtbar das Wort „Ausblick“. Neue Helfer bekommen dieselbe
  lila KI-Farbe. Der Roboter zeigt seine Nachtschicht als Zeitleiste mit Fähigkeiten-Karten, eine
  „gezeigt“, die anderen „später“, das Bewegen von Geräten als „Vision“.
- **Zwei Formate:** ein Pitch von drei Minuten für den Hackathon und ein Folgetermin mit den
  Challenge-Ownern in der Tiefe. Beides steht in `pitch-und-demo-konzept.md`.

## Was wir von den Challenge-Ownern wollen

1. Ein Urteil zu den sieben Hypothesen: Welche ist falsch?
2. Die Bestätigung, dass der Fenster-Lotse das richtige Killer-Feature ist.
3. Was wirklich verfügbar ist: welche Signale ein ausgeschalteter C-Bogen liefert, was das
   Flottenportal je Gerät weiß, wie der Kundendienst heute disponiert.

Nach Interesse an einem Pilot fragen wir in diesem Termin bewusst nicht.

## Wo das Konzept angreifbar ist

- Wir kennen die Abläufe des Kundendienstes und der Schulung beim Hersteller nicht.
- Bündeln klingt gut, kann aber Fenster verlängern und damit seltener machen.
- Jede Erweiterung um Personen (Einweisung, Aufträge) berührt Mitbestimmung und Datenschutz.
- Der Roboter ist eine Anschaffung, die sich über das Update allein kaum rechnet. Genau deshalb
  sind die weiteren Dienste wichtig, aber sie sind bisher nur behauptet.
- Die Zahlen sind mündliche Schätzungen und nicht belegt.
