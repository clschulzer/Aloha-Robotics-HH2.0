# Challenge 4: Synthese nach dem Gespräch mit dem Challenge-Geber

Stand 13.11.2026, 01:15 Uhr. **Dies ist der aktuelle Stand**, als Ganzes überarbeitet und mit Christians
Korrekturen vom späten Abend abgeglichen. Er ersetzt die Synthese in
[bewertung-nach-pitch.md](bewertung-nach-pitch.md), die vor dem Gespräch entstand. Grundlage ist das
Faktenblatt [gespraech-challenge-geber.md](gespraech-challenge-geber.md).

**Belegmarken:** Aussagen des Challenge-Gebers sind [geprüft: Gespräch 12.11., mündlich], also
Schätzungen aus dem Gespräch, keine Messwerte. Was Christian aus dem Gespräch nachgereicht hat und
nicht im Mitschnitt steht, ist als „Nachtrag“ gekennzeichnet. Alle Wertungen, Folgerungen, Rechnungen
und Entwürfe hier sind [Annahme].

## Was der Ansatz erreichen soll

Die Abschnitte weiter unten gehen ins Detail. Maßgeblich sind die Ergebnisse, die am Ende stehen
sollen. Sie sind unser Entwurf [Annahme], die Probleme dahinter stammen aus dem Gespräch. Zielwerte
legen wir erst fest, wenn wir die heutigen Werte kennen (Abschnitt 6, Frage 13).

| Ergebnis (Ziel, keine Zusage) | Woran man es misst | Heute laut Gespräch |
|---|---|---|
| **Die Flotte ist aktuell.** Jedes Gerät erhält jedes Sicherheitsupdate fristgerecht | Anteil der Geräte auf aktuellem Stand, Tage von der Freigabe bis zur Installation | Keine Planungshilfe, Fenster lassen sich nicht voraussagen. Dass Updates deshalb liegen bleiben, ist unsere Folgerung [Annahme] |
| **Kein Update kostet OP-Zeit.** Kein Eingriff wartet auf ein Gerät oder wird gestört | Zahl der Updates, die mit einem Eingriff kollidieren (Ziel: null) | Eine OP-Minute kostet etwa 80 Euro, nach OP-Beginn ist nichts im Hintergrund erlaubt |
| **Ein Fehlschlag überrascht niemanden.** Er wird sofort gemeldet, und ein Ersatz ist vorgeschlagen | Minuten vom Fehlschlag bis zur Meldung | Siemens erfährt es durch verärgerte Anrufe |
| **Niemand telefoniert einem Fenster hinterher.** Jede Rolle gibt höchstens eine Bestätigung | Telefonate und E-Mails je Update, Arbeitsminuten je Update | Medizinphysik fragt per Telefon und E-Mail nach |
| **Die Person am Gerät hat keinen Druck.** Sie entscheidet nicht und wird nicht verantwortlich gemacht | Handgriffe je Update (Ziel: null bis einer), Rückmeldung der Bediener | Sie scheut zurück, weil sie nicht angeschrien werden will |
| **Siemens bekommt die Logs.** Bei jedem Kontakt, ohne Patientendaten | Anteil der Geräte mit aktuellem Log-Stand | Für einen laufenden Log-Strom fehlen die Daten |

**Die KI bekommt diese Ergebnisse als Ziel, nicht den Weg dorthin.** Der Auftrag an Orchestrierung und
Scheduling lautet: Halte die Flotte innerhalb der Fristen aktuell, mit möglichst wenig Aufwand für die
drei Rollen und ohne einen einzigen Eingriff zu berühren. Wie sie das erreicht (welches Fenster,
welche Reihenfolge, Roboter oder Begleiter oder ein Mensch, wen sie wann fragt), entscheidet sie je
Klinik und Tag selbst. Fest vorgegeben sind nur die Leitplanken: Ein Mensch bestätigt jeden Start, nie
während eines Eingriffs, nie Updates mit Armbewegung aus der Ferne, nie die ganze Flotte in einer
Nacht, keine Patientendaten. Alles, was
in Abschnitt 4 und 5 an Einzelheiten steht, ist ein möglicher Weg und kein Pflichtprogramm.

**Für den Pitch in einem Satz (als Ziel formuliert):** Jeder C-Bogen ist aktuell, ohne dass ein Eingriff wartet, ohne dass
jemand telefoniert und ohne dass die Person am Gerät etwas riskiert.

## Das Wichtigste in sechs Punkten

1. **Das Problem ist nicht der Download, sondern die Installation im Ruhezustand.** Geladen wird heute
   schon stückweise, immer wenn das Gerät verbunden ist. Im Betrieb darf nebenbei wenig bis gar nichts
   laufen, was den Einsatz gefährden könnte. Die Installation dauert rund 120 Minuten, und genau dann,
   wenn dafür Zeit wäre, steht das Gerät ausgeschaltet ohne Strom im Flur, und oft ist niemand da, der
   sich kümmert. Ein Mensch muss den Start bestätigen, weil er verantwortet, dass der Zeitpunkt passt.
   Bei den häufigen Updates (Sicherheits-Patches, Software des eingebauten Rechners) geht das oft aus
   der Ferne, und schon das würde stark entlasten. Bei den selteneren Updates, in denen sich der Arm
   bewegt, vermutlich zur Neukalibrierung, muss jemand dabeibleiben und dafür sorgen, dass der Raum leer ist.
   Etwa 2 Prozent der Updates enden mit einem unbrauchbaren Gerät. Manchmal rettet ein Rollback, sonst
   muss der Service anrücken.
2. **Drei Rollen könnten zuständig sein, keine fühlt sich so:** die Person am Gerät („X-ray nurse“),
   die Medizinphysik bzw. Medizintechnik und die IT-Abteilung. Der Challenge-Geber vergleicht es mit
   einem Fußballspiel, in Christians Wiedergabe: „Nimm du ihn, ich hab ihn sicher.“ Als ersten Lösungsweg nennt er selbst, die goldenen Fenster für
   das Update zu finden. Der Fenster-Lotse (Idee 21) ist damit bestätigt und wird zum Kern.
3. **Sein eigener Favorit ist ein akkubetriebener Begleiter am Gerät**, der die Verbindung hält, wenn
   der C-Bogen aus ist. Die eigene Entwicklung mag die Idee, hält sie aber für nicht machbar, er will
   das Gegenteil zeigen. In unserem Konzept ist das die Hand ohne Räder (Idee 22).
4. **Zwei unserer früheren Kern-Ideen tragen im Bestand nicht.** Vorladen in Etappen (15) entfällt
   als eigene Idee: Den Download in Teilen gibt es schon, und im OP ist nach Beginn nichts im
   Hintergrund erlaubt. Ein Rest bleibt nützlich: Der Roboter könnte Pakete per Netzwerkkabel schneller
   aufspielen [Annahme]. Das gespiegelte System (17) wünscht sich der Challenge-Geber, die Geräte können es noch
   nicht, und es würde nach Christians Nachtrag die Hardware teurer machen.
5. **Der Roboter (Idee 23) bleibt, und zwar so avantgardistisch, wie er gedacht ist.** Wenn der Start
   aus der Ferne geht, wie für die häufigen Updates beschrieben, fehlt am geparkten Gerät nur noch Physisches: Strom, Einschalten, Netz. Genau
   das macht der Roboter. Er fährt hin, steckt ein, schaut sich um, meldet „bereit“, und ein Mensch
   bestätigt aus der Ferne. Er ist die Schau, und er hat eine echte Aufgabe.
6. **Das Produkt ist die Plattform dahinter:** Planung der Fenster, Daten vom Gerät, die Rollen des
   Personals und die Anbindung an OP-Planung und Kliniksysteme, zusammengehalten von einer
   KI-Orchestrierung. Die Formel des Teams gilt: Die Plattform ist das Gehirn, der Roboter sind die
   Hände, das Tamagotchi ist die Persönlichkeit. Der Begleiter ist dieselbe Hand ohne Räder, für
   Häuser ohne Roboter.

## Leitmotiv: „IA“, Invisible Autonomization

Christians Wortspiel als Klammer für Pitch und Konzept:

- Die Challenge heißt „Invisible Connectivity“. Wir drehen das Wort weiter zu **Invisible
  Autonomization**. In einer Welt, in der alle über AI reden, reden wir über **IA**.
- **Gemeint sind zuerst die Menschen.** In einer Klinik laufen viele herum, die kaum jemand sieht und
  ohne die nichts geht: Medizintechnik, Medizinphysik, IT, Reinigung, Transport, die Person am Gerät.
  Der Pitch feiert sie. Unter ihnen sind genau die drei Rollen aus dem Gespräch.
- **Dann die Technik.** Plattform und Roboter nehmen diesen Menschen Laufwege und Telefonate ab, nicht
  die Entscheidung. Das passt zu dem, was der Challenge-Geber unter „invisible“ versteht: Niemand soll
  darüber nachdenken müssen, „it just should work“.
- **Der Witz daran:** Das Unsichtbarste im Konzept ist ein Roboter, der sehr sichtbar durch den Flur
  rollt. Er macht die unsichtbare Arbeit für zwei Minuten sichtbar, danach verschwindet sie wieder.

Mögliche Eröffnung: „Everyone here talks about AI. We turned it around. We talk about IA: Invisible
Autonomization. It starts with the people you never see.“

Zwei Hinweise [Annahme]: „Autonomization“ ist ein Kunstwort. Falls jemand stolpert, ergeben „Invisible
Autonomy“ oder „Invisible Automation“ dasselbe Kürzel. Und das Feiern der Menschen kommt im Pitch vor
dem Roboter, sonst klingt es nach Ersetzen. Der Satz dazu: Der Roboter übernimmt die Botengänge, nicht
die Menschen.

## 1. Was jetzt beantwortet ist

| Frage | Antwort des Challenge-Gebers |
|---|---|
| Warum zwei Stunden? | Realistischer Wert, „a pretty average update time“. Lang ist die Menge der Schritte über viele Teilsysteme, nicht Download oder Rechenleistung |
| Was passiert bei Abbruch? | Im besten Fall Rollback, Dauer je nach Fortschritt. Rund 2 Prozent „dead on arrival“ |
| Warum muss ein Mensch drücken? | Vorschrift: Ein Mensch muss bestätigen, dass jetzt der richtige Zeitpunkt ist. Automatischer Start ist nicht erlaubt. Nach Christians Nachtrag gilt das erst recht für die komplexeren Updates, bei denen sich der C-Bogen bewegt |
| Muss dieser Mensch am Gerät stehen? | Bei der Mehrzahl der Updates nein, der Start lässt sich „more or less“ aus der Ferne auslösen (Nachtrag, wiedergegeben von Christian). Im Mitschnitt: Etwa 99 Prozent der Sicherheitsupdates sind aus der Ferne möglich. Aufsicht vor Ort brauchen nur die großen Updates, bei denen sich der Arm bewegt und Strahlung ausgelöst wird |
| Warum nicht in der Standzeit? | Gerät ist dann aus und nicht am Strom, es läuft nur am Netz, im Flur gibt es oft keine Steckdose, niemand fühlt sich zuständig, und Stecker werden gezogen, um Energie zu sparen |
| Gibt es heute eine Planung? | Nein. Die Medizinphysik fragt per Telefon und E-Mail bei den Fachabteilungen nach Fenstern. Die können es nicht voraussagen. Nach Christians Einordnung baut das Druck bei der Person am Gerät auf |
| Wie kommt das Update aufs Gerät? | Über das Netz, in Teilen, immer wenn verbunden. Anzeige erst, wenn vollständig und geprüft |
| Wann hat das Gerät Netz? | Nur eingeschaltet, also praktisch nur im OP. WLAN, LAN und USB sind je nach Gerät vorhanden, kein Bluetooth. Manche Kliniken machen es schwer: Das Uniklinikum Erlangen erlaubt kein WLAN im OP |
| Wer ist zuständig? | Person am Gerät („X-ray nurse“), Medizinphysik bzw. Medizintechnik, IT-Abteilung. „Three people who actually could be responsible … but none of them.“ Dazu kommen laut Christian sehr verschiedene Zeitpläne der drei |
| Was hat die Person am Gerät zur Hand? | Meist kein Gerät mit Hersteller-Software, er wusste es nicht sicher |
| Welche Notfälle? | Polytrauma, offene Brüche. 85 bis 90 Prozent der Eingriffe tagsüber sind geplant. Der Polytrauma-Alarm wäre ein Auslöser |
| Frühere Versuche? | Zwei Jahrzehnte Arbeit an der Konnektivität ohne Besserung. Den Begleiter mag die Entwicklung als Idee, hält ihn aber für nicht machbar |
| Größerer Akku, Rechner tauschen? | Akku: Kosten, Größe, Gewicht. Tausch: doppelte Rechner, der Rechner ist ein teures Teil, löst nur den PC, jemand muss öffnen |

**Drei Arten von Updates**, weil sich daran entscheidet, was Plattform und Roboter übernehmen können:

| Art | Wie oft | Start | Für uns |
|---|---|---|---|
| Sicherheits-Patches und Software des eingebauten Rechners | Etwa alle drei Monate, die häufigste Art | Mensch bestätigt, oft aus der Ferne | **Unser Feld.** Hier entlasten Plattform und Roboter am meisten |
| Updates mit Armbewegung, vermutlich die Kalibrier-Updates aus dem Mitschnitt [Annahme] | Seltener | Jemand bleibt dabei, der Raum muss leer sein, Strahlung möglich. Kalibrier-Updates macht laut Mitschnitt der Siemens-Techniker | Bleibt beaufsichtigt. Von der Challenge ausdrücklich ausgeklammert |
| Updates mit Hardware-Tausch | Etwa einmal in zwei Jahren | Techniker vor Ort | Nicht unser Thema |

Noch offen bleiben die Fragen in Abschnitt 6.

## 2. Was an unserer früheren Synthese nicht mehr stimmt

Diese Punkte aus [bewertung-nach-pitch.md](bewertung-nach-pitch.md) sind durch das Gespräch widerlegt
oder eingeschränkt:

| Frühere Annahme | Stand jetzt |
|---|---|
| „Zwei Stunden werden ein Neustart von sechs Minuten“ | **Im Bestand nicht haltbar.** Die 120 Minuten sind Installation über viele Teilsysteme. Kürzer wird es nur mit neuer Architektur |
| Vorladen während der OP, pausiert bei Röntgenauslösung | **Nicht erlaubt.** Nach Beginn der Operation keine Hintergrundaktivität. Download in Teilen gibt es bereits |
| Einschalten mitten im Update führt sofort in die alte Version | **Falsch für den Bestand.** Ausschalten oder Ausstecken während des Updates ist gerade eine Ursache für tote Geräte |
| Aktivierung nachts automatisch nach Policy | **Nicht erlaubt.** Ein Mensch muss den Start bestätigen, das geht aber oft aus der Ferne |
| Die zwei Stunden im Pitch waren gespielt | **Sie sind echt.** Laut Challenge-Geber kommt so ein Wert durchaus vor, er nennt ihn durchschnittlich |
| Die drei Rollen sind eine Annahme | **Bestätigt:** Person am Gerät, Medizinphysik bzw. Medizintechnik, IT-Abteilung |
| Parkposition als natürlicher Ort für Strom und Netz | **Nur manchmal.** Im Flur fehlt oft die Steckdose |
| Ein Mensch muss am Gerät stehen, also braucht es keinen Roboter | **Überholt.** Der Start geht bei den häufigen Updates aus der Ferne, am Gerät fehlt dann nur Physisches |

Was sich bestätigt hat: geparkt heißt aus und offline, die Last liegt bei der Person mit der wenigsten
Zeit, Rollouts brauchen Staffelung, der Rückmelde-Wächter schließt eine echte Lücke, und Logs sind der
zweite gleichrangige Auftrag.

## 3. Wie die Ideen jetzt stehen

| Idee | Stand nach dem Gespräch | Rolle |
|---|---|---|
| **21 Fenster-Lotse** | Bestätigt. Rollen, fehlende Planung und Abstimmungslast sind genau so beschrieben. Mit dem Fern-Start kann er das Fenster nicht nur finden, sondern auch auslösen lassen | **Kern, das Gehirn der Plattform** |
| **23 Wartungsroboter** | Durch den Fern-Start aufgewertet: Er liefert das Physische, das am geparkten Gerät fehlt | **Die Hände, das Auge und das Gesicht des Pitches** |
| **22 Service-Begleiter** | Lösungsweg des Challenge-Gebers selbst, sein Favorit | **Die Hand ohne Räder und der Datensammler am Gerät** |
| **19 Rückmelde-Wächter** | Die Lücke ist bestätigt: Siemens erfährt Fehlschläge heute durch Anrufe. Zur Idee selbst gab es nur ein knappes Ja | **Das Sicherheitsnetz** |
| **8 „Cio“, Tamagotchi** | Stärker als gedacht, weil es um das Gefühl von Zuständigkeit geht. Kein Widerspruch von ihm | **Die Persönlichkeit** |
| 18 Geräte-Patenschaft | Stärker: „feeling responsible“ ist laut Challenge-Geber das Problem | Baustein der Persönlichkeit |
| 4 Flotten-Cockpit | Gibt es als teamplay Fleet. Neu ist, was die Plattform daraufsetzt | Rahmen, nicht neu bauen |
| 2 Gute Nacht, C-Bogen | Der Moment bleibt richtig (nach dem letzten Fall). Ohne automatischen Start und ohne Zusage „morgens sicher bereit“ | Baustein im Lotsen, Abendrunde des Roboters |
| 16 Einsatz-Planung | Geht im Scheduling auf. Der Polytrauma-Alarm ist ein echter Auslöser für eine Sperre | Teil von 21 |
| 1 Hilfe-Knopf | Logs bleiben Auftrag. Roboter und Begleiter sind dafür der bessere Kanal als die QR-Brücke | Funktion von Roboter und Begleiter |
| 15 Vorladen in Etappen | Für den Download schon vorhanden, im OP nicht erlaubt | Entfällt als eigene Idee, lebt als Kabel-Übergabe durch den Roboter weiter |
| 17 Gespiegeltes System | „I would love if it worked that way“, Geräte können es noch nicht, Hardware würde teurer (Nachtrag) | Ausblick Next Gen |
| 10 Nie ganz aus | Größerer Akku scheitert an Kosten, Größe, Gewicht | Geht in Begleiter und Akkupack des Roboters auf |
| 3 Steckdosen-Prinzip, 12 Robo-Garage | Steckdose am Parkplatz fehlt oft | Werden zur Heimatstation des Roboters |
| 20 Wechsel-Rechner | Vom Challenge-Geber begründet verworfen | Nur als Ausblick für den Roboter |
| 5, 6, 7, 9, 11, 13, 14 | Unverändert schwach oder Ausblick | Weglassen |

## 4. Die Roboter-Idee

Vor dem Nachtrag zum Fern-Start hieß das Urteil: starkes Bild, aber nicht der Kern, weil ohnehin ein
Mensch am Gerät drücken muss. Das gilt für die häufigen Updates nach dem Nachtrag nicht mehr. Damit lassen sich die drei
Fragen beantworten, an denen die Idee laut Team hängt.

**1. Welche physische Aufgabe braucht wirklich einen Roboter?**
Alles, was am geparkten Gerät übrig bleibt, wenn für den Knopf kein Mensch mehr vor Ort sein muss: Strom
bringen (Akkupack oder Kabel zur nächsten Steckdose), einstecken, einschalten, Netz herstellen. Dazu
kommt: **Der Roboter ist das Auge vor Ort.** Wer aus der Ferne bestätigt, will wissen, dass niemand am
Gerät arbeitet und der Platz frei ist. Der Roboter prüft das mit LiDAR und meldet nur „frei“ oder
„nicht frei“. Er speichert keine Bilder und identifiziert niemanden, er erkennt nur, ob jemand da ist [Annahme: so auch
datenschutzrechtlich am einfachsten].

**2. Was kann der Roboter realistisch automatisieren?**
Hinfahren, einstecken, einschalten, Umgebung prüfen, Logs abholen, Paket übergeben, „bereit“ melden,
während des Updates danebenstehen und aufpassen, dass niemand aussteckt, danach ausstecken und
weiterfahren. Nicht: selbst entscheiden, dass jetzt gestartet wird (das bleibt ein Mensch, nur eben
aus der Ferne). Und nicht die Updates mit Armbewegung und Strahlung, die bleiben beaufsichtigt.

**3. Warum ein Roboter statt einer billigeren festen Lösung?**

- Einer für die ganze Flotte, keine Änderung am C-Bogen, und Strom auch dorthin, wo keine Steckdose ist.
- Er bewacht die zwei Stunden. Ausstecken während des Updates ist eine der genannten Ursachen für tote
  Geräte. Ein Roboter, der davor steht und „Finger weg, ich update“ sagt, ist die wirksamste Anzeige,
  die man bauen kann.
- Er liefert die Prüfung vor Ort, ohne die ein Fern-Start ein Blindflug wäre.
- Der Begleiter (22) bleibt die günstige Fassung für kleine Häuser: gleiche Plattform, keine Räder,
  dafür muss dort ein Mensch einstecken.

**Die Rollenverteilung** (Christians Entscheidung):

- **Der Roboter ist die Schau, und er darf avantgardistisch und schräg sein.** Er rollt in die Hektik,
  stöpselt sich an und redet mit dem C-Bogen wie mit einem Haustier, das gefüttert werden muss. Er ist
  der Grund, warum sich die Jury an den Pitch erinnert.
- **Die Plattform ist das Produkt.** Sie bleibt wertvoll, auch wenn nie ein Roboter gekauft wird
  (Abschnitt 5).

### Was aus den anderen Ideen in den Roboter wandert

Viele der früheren Ideen sind als eigenes Konzept zu schwach, geben dem Roboter aber Fähigkeiten und
dem Auftritt Stoff. Alles in dieser Tabelle ist unser Entwurf [Annahme].

| Aus Idee | Was der Roboter davon übernimmt | Wozu es gut ist |
|---|---|---|
| **15 Vorladen in Etappen** | Der Roboter lädt geprüfte Pakete an seiner Station und bringt sie mit. Am Gerät überträgt er sie per Netzwerkkabel. Er ist ein fahrender Update-Tank | Macht unabhängig vom WLAN, das etwa im OP des Uniklinikums Erlangen verboten ist, und von langsamen Verbindungen. Geräte, die nie lange genug online sind, bekommen ihr Paket trotzdem |
| **1 Hilfe-Knopf** | Auf dem Rückweg nimmt er die Logs mit. Wer am Gerät „Problem melden“ drückt, bestellt damit den Roboter | Der Log-Strom, der Siemens heute fehlt, fließt bei jedem Besuch. Ohne Patientendaten, nur freigegebene Felder |
| **19 Rückmelde-Wächter** | Er steht während des Updates daneben, sieht Start und Ende und meldet sofort, wenn das Gerät nicht zurückkommt | Aus „fire and pray“ wird ein beaufsichtigter Vorgang. Zurückgerufene Pakete liefert er gar nicht erst aus |
| **2 Gute Nacht, C-Bogen** | Die Abendrunde: Nach dem letzten geplanten Fall fährt er die Geräte ab und bringt sie „ins Bett“ | Gibt dem Ablauf ein Ritual und dem Sketch eine Szene |
| **8 Tamagotchi und 18 Patenschaft** | Roboter und C-Bogen haben Namen und reden miteinander. Der Roboter bedankt sich bei der Person, die das Gerät gut abgestellt hat | Baut die Beziehung auf, die der Person am Gerät den Druck nimmt |
| **3 Steckdosen-Prinzip und 12 Robo-Garage** | Die Heimatstation des Roboters ist die Steckdose, die im Flur fehlt. Das Kabel kommt vom Roboter, mit magnetischem Stecker. Markierte Parkplätze für C-Bögen machen es noch einfacher | Löst das schwerste technische Problem (Stecker an beliebiger Stelle finden) |
| **16 Einsatz-Planung** | Seine Route folgt dem Scheduling. Bei Polytrauma-Alarm gibt er das Gerät sofort frei und fährt beiseite | Der Roboter steht nie im Weg, wenn es ernst wird |
| **22 Begleiter und 10 Nie ganz aus** | Sein Akkupack ist das „nie ganz aus“ von außen. Wo ein Begleiter am Gerät sitzt, sagt der dem Roboter, wo das Gerät steht und was es braucht | Beide Hardware-Ideen ergänzen sich, statt zu konkurrieren |
| **6 Digitaler Zwilling** | Aus seinen Fahrten entsteht eine aktuelle Karte: wo welches Gerät steht, wo Strom ist | Die Plattform weiß, was heute niemand weiß. Die Drohnen aus dem Ausblick des Teams suchen, was fehlt |
| **4 Cockpit und 9 Flotten-Mission** | Jeder Besuch erscheint in der Flottenübersicht. Die Klinik sieht ihren Stand als gemeinsames Ziel | Nachweis für die IT, Fortschritt für alle sichtbar |
| **17 Gespiegeltes System** | Ausblick: Mit zwei Systemhälften schrumpft der Besuch von zwei Stunden auf Minuten | Zeigt, dass der Roboter auch zur nächsten Gerätegeneration passt |
| **20 Wechsel-Rechner** | Ausblick: Der Roboter tauscht ein vorbereitetes Rechnermodul wie einen Roller-Akku | Die avantgardistische Fassung. Im Bestand vom Challenge-Geber verworfen, deshalb nur als Bild |
| **Updates mit Armbewegung** | Ausblick: Der Roboter sichert den Raum und meldet „leer“, der Techniker beaufsichtigt | Heute nicht erlaubt und ausgeklammert. Nur erwähnen, nicht versprechen |

Für den Pitch reichen drei davon: **Update-Tank mit Kabel, Wächter am Gerät, Abendrunde.** Der Rest ist
Stoff für Nachfragen.

### Was offen bleibt

- Einen Netzstecker an einem beliebig abgestellten Gerät zu finden und zu stecken, ist für einen
  Roboter schwer. Christians Ansatz: Das Kabel kommt vom Roboter zum Gerät, am besten mit einem
  magnetischen Stecker. Feste Parkplätze helfen zusätzlich. Ob das am C-Bogen geht, ist zu prüfen, für
  die Bühne reicht es [Annahme].
- Lässt sich der C-Bogen ohne Fingerdruck einschalten, oder drückt der Roboter wirklich den Schalter?
- Was muss die Person wissen, die aus der Ferne startet? Christians Gedanke: Der Roboter gibt ihr die
  Gewissheit, dass das Gerät an einem vernünftigen Ort steht und der Zeitpunkt passt. Seine Meldung
  fließt ins Scheduling ein und macht den Vorschlag belastbarer. So ließe sich der Fern-Start nicht
  nur auslösen, sondern absichern. Ob Siemens das als Absicherung gelten lässt, ist offen.
- Trägt ein Akkupack ein Update von zwei Stunden? Der Verbrauch ist unbekannt. Der Challenge-Geber war
  laut Christian zuversichtlich, weil die betreffenden Updates vor allem den Rechner aktualisieren.
- Nimmt das Gerät ein Paket per Kabel von einer lokalen Quelle an? Davon hängt der Update-Tank ab.
- Fahren in Fluren mit Patienten braucht Kollisionsschutz, Hygienekonzept, Türen und Aufzüge. Das ist
  Ausbaustufe, kein Hindernis für die Demo.
- Der Fern-Start ist mündlich und mit „more or less“ beschrieben. Wer ihn auslösen darf und womit, ist
  zu klären.

## 5. Die Synthese: eine Plattform mit Händen und Gesicht

**Ein Satz:** Die Plattform findet mit den drei Rollen die zwei Stunden, in denen das Update laufen
kann, der Roboter (oder in kleinen Häusern der Begleiter) macht das Gerät dafür bereit, ein Mensch
bestätigt aus der Ferne, und der Wächter sorgt dafür, dass ein Fehlschlag niemanden überrascht.

### Die Plattform

Sie besteht aus vier Teilen. Darüber liegt die KI-Orchestrierung, die die drei Rollen zusammenführt.

1. **Planung:** der Fenster-Lotse mit dem KI-gestützten Scheduling. Er kennt Belegung, Update-Dauer und
   Fristen und schlägt das Fenster vor.
2. **Daten vom Gerät:** Roboter oder Begleiter sammeln Logs, Softwarestand, Standort und
   Nutzungsmuster, auch wenn der C-Bogen aus ist. Das ist der Log-Strom, den Siemens heute nicht bekommt.
3. **Die Menschen:** wer welche Rolle hat, wer heute Dienst hat, wer freigeben darf. Als Rollen und
   Dienste, nicht als Bewertung einzelner Personen [Annahme: sonst Thema für den Personalrat].
4. **Anbindung an die Kliniksysteme:** OP-Planung bzw. Krankenhausinformationssystem für die Belegung,
   teamplay Fleet für den Gerätestand, der Polytrauma-Alarm als Sperre. Gebraucht werden nur Saal,
   Zeit und Gerätebedarf, **keine Patientendaten** [Annahme: so auch am leichtesten freizugeben].

Daraus entsteht mehr als ein Update-Planer [Annahme]: Wer weiß, wo welches Gerät steht, wie es genutzt
wird und wann es frei ist, kann auch Wartung, Geräteverteilung und Ersatz planen. Für Siemens ist das
ein Service-Angebot je Flotte, für die Klinik weniger Telefonate und weniger Ausfälle.

### Die Bausteine

| Baustein | Was er tut | Behebt laut Gespräch | Bestand? |
|---|---|---|---|
| **Lotse** (21), das Gehirn | Kennt OP-Plan oder Nutzungsmuster, Dauer des Updates, Orte mit Strom. Schlägt das Fenster vor und fragt jede Rolle eine Sache. Setzt auf teamplay Fleet auf | „Three people … but none of them“, Abstimmung per Telefon | Reine Software im Backend |
| **Roboter** (23), die Hände und das Auge | Fährt zum geparkten Gerät, bringt Strom und Paket, steckt ein, schaltet ein, prüft mit LiDAR die Umgebung (ohne Bildspeicherung), meldet „bereit“, bewacht das Update, nimmt Logs mit | Keine Steckdose im Flur, niemand vor Ort, kein WLAN im OP, Ausstecken als Ursache für tote Geräte | Keine Änderung am C-Bogen, aber eine Anschaffung [Annahme] |
| **Begleiter** (22), die Hand ohne Räder | Akkubetriebener Kleinrechner am Gerät. Lädt Updates und sendet Logs, während der C-Bogen aus im Flur steht. Übergibt per Kabel, sobald der C-Bogen an ist | „When it's not used, it's switched off“, fehlender Log-Strom | Nachrüstteil, keine Änderung an der klinischen Funktion [Annahme] |
| **Wächter** (19), das Netz | Gerät oder Roboter meldet Start und erwartetes Ende. Bleibt die Rückmeldung aus, erfahren es Medizinphysik und Siemens sofort, ein Ersatzgerät wird vorgeschlagen. Am Gerät steht groß „Update läuft, nicht ausstecken, fertig 19:10“. Zurückgerufene Pakete werden abgezogen | 2 Prozent tote Geräte, Ausstecken als Ursache, „someone will call us and yell at us“, Pakete „in their belly“ | Software, eine Anzeige am Gerät |
| **Persönlichkeit** (8, 18) | Macht aus „niemand fühlt sich zuständig“ ein gemeinsames, sichtbares Kümmern. Zeigt, wer gerade dran ist, und nimmt der Person am Gerät den Druck | „A problem of feeling responsible“, „they don't want to be yelled at“ | Software |

### Wo das goldene Fenster liegt

Aus den Angaben folgt eine einfache Rechnung [Annahme]:

- Die Stunde vor der OP ist für 120 Minuten zu kurz. Dort passt nur eine Übergabe von Paketen.
- Im Flur fehlt oft der Strom.
- Tagsüber enden die geplanten Eingriffe gegen 17 Uhr, nachts laufen nur zwei bis drei von zwölf Sälen.
- **Ohne Roboter ist das Fenster der Abend nach dem letzten geplanten Fall, in einem Saal oder Raum mit
  Steckdose.** Die Person am Gerät lässt es eingesteckt, gestartet wird aus der Ferne, der Wächter
  passt auf.
- **Mit Roboter wird das Fenster viel größer:** Abend, Nacht und Wochenende, auch für Geräte im Flur.
  Der Roboter bringt den Strom, und niemand aus dem OP-Team muss etwas tun.

Das ist das, was bei CT und MRT funktioniert („the last one who leaves clicks the button“), nur dass
beim C-Bogen bisher niemand weiß, wer der Letzte ist und ob das Gerät morgen früh gebraucht wird.

### Die KI-Orchestrierung: zwei Rollen aus der Ferne, eine vor Ort

Christians Ergänzung. Die Rollen und ihre Lücken stammen aus dem Gespräch, die Spalte „Stärke“ ist
Christians Zusammenfassung, die Ausgestaltung ist unser Entwurf [Annahme]:

| Rolle | Stärke | Lücke | Was die Orchestrierung für sie tut |
|---|---|---|---|
| **IT-Abteilung** | Soll die Flotte aktuell halten [Annahme]. Sieht alles in teamplay Fleet | Nicht vor Ort | Bringt ihr die Lage vor Ort: wo das Gerät steht, ob es Strom hat, ob es frei ist, wann das nächste Fenster kommt |
| **Medizinphysik** | Verantwortet die Flotte, könnte freigeben [Annahme] | Nicht vor Ort, stimmt heute per Telefon und E-Mail ab | Legt einen fertigen Vorschlag mit Begründung und Ersatzgerät vor, statt dass sie Fenster erfragen muss |
| **Person am Gerät** („X-ray nurse“) | Als Einzige am C-Bogen | Will nichts falsch machen, ist nicht technikaffin, hat keine Zeit | Nimmt ihr den Druck, baut eine Beziehung auf, leitet sie an und sorgt dafür, dass der Zeitpunkt passt |

Für die Person am Gerät heißt das:

- **Druck nehmen:** Sie entscheidet nicht und steht nicht allein da. Auf dem Gerät steht, wer
  freigegeben hat und dass der Start aus der Ferne kommt. Geht etwas schief, landet die Meldung bei
  Medizinphysik und Siemens, nicht bei ihr.
- **Beziehung aufbauen:** Hier arbeitet das Tamagotchi. Das Gerät meldet sich freundlich und immer
  gleich, bedankt sich und zeigt am nächsten Morgen, dass alles gut ging. Vertrauen entsteht daraus,
  dass die Bitte jedes Mal klein ist und jedes Mal gut ausgeht.
- **Anleiten:** ein Schritt, in ihrer Sprache, im Moment des Ausschaltens. „Bitte eingesteckt lassen,
  das war alles.“ Keine Technikbegriffe, keine Auswahl.
- **Der passende Zeitpunkt:** Sie wird nur gefragt, wenn das Fenster wirklich passt, also nach dem
  letzten geplanten Fall und nie vor oder während eines Eingriffs.

Wo dabei KI steckt, und wo bewusst nicht [Annahme]:

- **KI:** aus OP-Plan, Nutzungsmuster und Fristen das beste Fenster vorschlagen und begründen, die
  Nachricht je Rolle in deren Sprache fassen, Rückfragen beantworten („Kann ich das Gerät morgen um 7
  nutzen?“), bei Alarm oder Absage neu planen.
- **Feste Regeln, keine KI:** die Sicherheitsbedingungen. Nie Start ohne menschliche Bestätigung, nie im
  Einsatz, Fern-Start nur nach der Meldung „Umgebung frei“, nie Updates mit Armbewegung aus der Ferne,
  Sperre bei Alarm. Diese Regeln sind getestet und lassen sich von keinem Vorschlag überstimmen.
- Die KI schlägt vor, die Menschen entscheiden. Sie bekommt nur Saal, Zeit, Gerät und Rolle, keine
  Patientendaten. In der Demo läuft sie mit Rückfallebene, damit sie auch ohne Netz funktioniert.

### Das KI-gestützte Scheduling

Christians Ergänzung. Die Orchestrierung braucht einen Plan, den sie den Rollen vorlegen kann. Den
liefert das Scheduling. Der Entwurf ist unserer [Annahme], die meisten Eingangsgrößen stammen aus dem
Gespräch.

**Was es plant:** für jedes Gerät und jedes fällige Update ein Fenster, dazu die Route des Roboters
durch die Flotte und das Ersatzgerät für den Fall, dass etwas schiefgeht.

**Womit es rechnet:**

- OP-Plan, nur Saal und Zeit ohne Patientenbezug. 85 bis 90 Prozent der Eingriffe tagsüber sind laut
  Challenge-Geber geplant. Dazu das Nutzungsmuster jedes Geräts aus den Gerätedaten.
- Dauer des Updates (rund 120 Minuten) plus Puffer für einen Rollback.
- Art des Updates: Nur die aus der Ferne startbaren werden so geplant.
- Frist des Updates, etwa bei Sicherheits-Patches.
- Wo das Gerät steht, ob es dort Strom gibt, ob der Roboter frei ist. Steht der Roboter schon am Gerät,
  kommt seine Meldung dazu: Ort geeignet, Zeitpunkt passt.
- Wer Dienst hat und freigeben kann.
- Wie viele Geräte gleichzeitig ausfallen dürfen. Nie die ganze Flotte in einer Nacht, das passt zu den
  gestaffelten Rollouts, die Siemens ohnehin fährt.

**Was daran KI ist:**

- **Vorhersage:** Wie wahrscheinlich wird dieses Gerät in den nächsten zwei Stunden gebraucht? Gelernt
  aus Nutzungsmuster, Wochentag, Tageszeit und der Zahl der Notfälle je Zeitraum (ohne Patientenbezug).
  Das ist die Antwort auf den Einwand der Fachabteilungen, sie könnten den nächsten Fall nicht
  voraussagen: Sicher weiß es niemand, aber das Risiko lässt sich beziffern.
- **Erklärung:** Jeder Vorschlag kommt mit Begründung und Restrisiko, etwa „Gerät 3 heute 17:20, letzter
  geplanter Fall endet 17:00, an Dienstagabenden wurde es in den letzten acht Wochen nie gebraucht,
  Ersatz ist Gerät 5“. Reicht die Datenlage nicht, sagt das System das und schlägt nichts vor.
- **Umplanen:** Bei Polytrauma-Alarm, Absage oder Fehlschlag wird sofort neu geplant, und jede Rolle
  bekommt nur die Änderung, die sie betrifft.
- **Lernen:** Abgelehnte Vorschläge und tatsächliche Dauern fließen zurück.

**Was daran bewusst keine KI ist:** Die Belegung selbst und die Sicherheitsregeln sind feste
Bedingungen. Ein Fenster, das mit einem geplanten Eingriff kollidiert, wird nie vorgeschlagen. Für die
Demo reicht ein einfacher, nachvollziehbarer Planer mit synthetischem OP-Plan, die Vorhersage kann eine
schlichte Häufigkeit je Wochentag und Stunde sein. Das läuft ohne Netz und lässt sich in zwei Sätzen
erklären.

**Für den Pitch:** Das Scheduling findet das goldene Fenster, die Orchestrierung bringt die drei
Rollen dazu, es zu nutzen, der Roboter macht das Gerät bereit.

### Was die Plattform jede Rolle fragt

- **IT-Abteilung** (sieht das Update in teamplay Fleet): „Sicherheitsupdate für acht C-Bögen. Frist Freitag?“
- **Medizinphysik:** „Vorschlag: Gerät 3 heute nach dem letzten Fall, etwa 17:20 bis 19:20. Ersatz bis
  morgen: Gerät 5. Freigeben?“
- **Mit Roboter:** Er meldet „Stehe an Gerät 3 im Flur B, Strom und Netz stehen, niemand in der Nähe.
  Starten?“, und Medizinphysik oder IT bestätigen aus der Ferne. Die Person am Gerät wird nicht gefragt.
- **Ohne Roboter**, an die Person am Gerät beim Ausschalten: „Heute bitte eingesteckt in Saal 3 lassen.
  Das Update wird aus der Ferne gestartet, freigegeben von der Medizinphysik. Sonst ist nichts zu tun.“

Kommt ein Polytrauma-Alarm, bevor gestartet wurde, sperrt die Plattform das Fenster und plant neu. Läuft
die Installation schon, wird sie nicht abgebrochen, dann greift das Ersatzgerät.

### Zahlen für den Pitch

Alle aus mündlichen Schätzungen des Challenge-Gebers, im Pitch als „laut Siemens im Gespräch“ nennen:

- Rund 120 Minuten je Update, laut Challenge-Geber ein durchschnittlicher Wert.
- Sicherheits-Patches etwa alle drei Monate, etwa 99 Prozent davon aus der Ferne möglich.
- Rund 2 Prozent der Updates enden mit einem nicht benutzbaren Gerät.
- Eine OP-Minute kostet etwa 80 Euro.
- 85 bis 90 Prozent der Eingriffe tagsüber sind geplant.
- Drei Rollen, keine fühlt sich zuständig.

Eigene Rechnung daraus [Annahme, nur als Größenordnung]: Bei vier Updates im Jahr und 2 Prozent
Fehlschlägen trifft es je Gerät etwa alle zwölf Jahre einmal, in einer Flotte von 100 Geräten also rund
acht unbrauchbare Geräte im Jahr. Und jedes Update verlangt heute, dass drei Menschen ein Zeitfenster
von zwei Stunden per Telefon finden.

### Demo-Vorschlag

1. **Auftritt:** „Everyone talks about AI, we talk about IA.“ Dann Hektik im Flur, die unsichtbaren
   Helfer rennen, die IT ruft an, und jeder sagt: „Nimm du ihn, ich hab ihn sicher.“ Der C-Bogen
   quengelt: „Ich brauche Pflege.“ Niemand hat Zeit.
2. **Der Roboter kommt.** Langsam, mitten durch die Hektik: „Beep. Ich bin für das Update da.“ Er
   stöpselt Strom und Netzwerkkabel an, schaut sich um und meldet: „Strom steht, Paket ist drauf,
   niemand in der Nähe.“ So schräg spielen, wie es das Team geplant hat. Das ist der Moment, der bleibt.
3. **Plattform:** Auf dem Bildschirm sieht man, warum der Roboter genau jetzt genau dort ist. Das
   Scheduling hat das Fenster aus OP-Plan und Fristen gefunden, die Medizinphysik hat freigegeben.
   Jetzt kommt die Meldung des Roboters, und ein Mensch bestätigt den Start aus der Ferne. Dann ein
   Polytrauma-Alarm bei einem zweiten Gerät, und die Plattform plant sichtbar um.
4. **Wächter:** Update läuft, der Roboter bleibt daneben stehen: „Finger weg, ich update.“ Variante
   Fehlschlag: Das Gerät meldet sich nicht zurück, die Medizinphysik bekommt „Gerät 3 nicht zurück,
   Ersatz Gerät 5“, bevor morgens jemand vor dem unbrauchbaren Gerät steht.
5. **Auflösung:** Der Roboter ist die Schau. Das Produkt ist die Plattform, und sie läuft auch ohne
   ihn, mit einem Kleinrechner und einer Powerbank am Gerät (Begleiter kurz zeigen).
6. **Ausblick:** gespiegeltes System für die nächste Generation, Roboter tauscht Rechnermodule,
   Drohnen finden verlorene Geräte.

Kernlogik mit Tests: nie Start ohne menschliche Bestätigung, Fern-Start nur nach der Meldung „Umgebung
frei“ und nie für Updates mit Armbewegung, nie Start im Zustand „im Einsatz“, Sperre bei Alarm, Warnung
bleibt stehen, bis sie bestätigt ist, nur geprüfte und nicht zurückgerufene Pakete werden übergeben,
Logs nur mit freigegebenen Feldern ohne Patientendaten.

### Wo die Synthese angreifbar ist

- **„Ein Roboter, um einen Stecker zu stecken?“** Antwort: Der Roboter ist die Schau und die Hände,
  verkauft wird die Plattform. Sie läuft auch mit dem Begleiter oder mit einem Menschen, der einsteckt.
- **Der Fern-Start ist nur mündlich belegt** und mit „more or less“ beschrieben. Fällt er weg, steht
  wieder ein Mensch am Knopf, und der Roboter verliert seine beste Begründung (Abschnitt 6, Frage 1).
- **Roboter und Begleiter sind Hardware.** Das Interview wünscht kleine Software-Änderungen. Antwort:
  Der Begleiter kommt vom Challenge-Geber selbst, beide ändern das Gerät nicht, und Lotse und Wächter
  sind reine Software.
- **Die Entwicklung von Siemens hält den Begleiter für nicht machbar**, auch wenn sie die Idee mag. Wir
  kennen die Gründe nicht (Abschnitt 6, Frage 3). Sie könnten auch den Roboter treffen.
- **Weder Roboter noch Begleiter verkürzen die 120 Minuten.** Sie lösen Strom, Verbindung und Logs.
  Deshalb braucht es die Planung, und das muss der Pitch klar trennen.
- **Die Plattform ist nur so gut wie die Bereitschaft der Rollen zu antworten.** Wer E-Mails nicht
  liest, liest vielleicht auch sie nicht. Deshalb je Rolle eine Frage, im Werkzeug, das sie ohnehin nutzt.
- **Ein Gerät zwei Stunden unbeaufsichtigt am Strom** kann an Reinigung, Saalplanung oder Hausregeln
  scheitern (Abschnitt 6, Frage 2).

## 6. Was noch offen ist

### Top 3 für das Training Center am 13.11.

1. **Wie genau geht der Start aus der Ferne?** Wer darf ihn auslösen (IT, Medizinphysik,
   Siemens-Service), womit (teamplay Fleet?), für welche Updates, und was muss vorher am Gerät geprüft
   sein? Reicht dafür die Meldung eines Roboters oder Sensors „Umgebung frei“?
   Die Grundfrage ist beantwortet (ja, bei den häufigen Updates), die Form entscheidet über Demo und Pitch.
2. **Darf ein C-Bogen zwei Stunden eingeschaltet und unbeaufsichtigt am Strom stehen,** nach dem
   letzten Fall im Saal oder nachts im Flur mit einem Roboter daneben? Was spricht dagegen: Reinigung,
   Saalbelegung, Brandschutz, Hausregeln?
   Entscheidet, ob es das goldene Fenster wirklich gibt.
3. **Welche Gründe nennt die Entwicklung, warum der Begleiter nie funktionieren werde?** Über welche
   Schnittstelle käme ein Gerät von außen an den C-Bogen (LAN oder USB), und darf es ein Update-Paket
   übergeben?
   Entscheidet über Begleiter und Update-Tank des Roboters zugleich.

### Shortlist

4. Meldet das Gerät Start, Fortschritt und Ende eines Updates in einer Form, die ein Wächter lesen kann?
5. Lässt sich ein schon geladenes Paket zurückrufen, bevor jemand startet?
6. Müssen Röhre und Detektor während eines Updates versorgt sein, und wie hoch ist der Verbrauch? Davon
   hängt ab, ob das Akkupack des Roboters ein Update tragen könnte. Der Challenge-Geber war laut
   Christian zuversichtlich, eine Zahl fehlt noch. **Für die Roboter-Idee die wichtigste Frage nach
   den Top 3.**
7. Lässt sich der C-Bogen einschalten, ohne dass jemand den Schalter drückt (etwa beim Anlegen von
   Strom oder über das Netz)? Sonst muss der Roboter wirklich drücken.
8. Bietet teamplay Fleet eine Schnittstelle, auf die eine Plattform aufsetzen kann?
9. Woher käme der Belegungsplan: über eine Schnittstelle zur OP-Planung oder zum
   Krankenhausinformationssystem (wem gehören die Daten?), oder reicht das Nutzungsmuster des Geräts?
10. Wie groß ist ein Update tatsächlich, und wie schnell käme es per Kabel aufs Gerät?
11. An den Applikationstrainer: Würde die Person am Gerät das Gerät abends eingesteckt lassen, wenn die
    Freigabe sichtbar von jemand anderem kommt und sie selbst nicht drücken muss? Nimmt das den Druck?
12. Wo genau finden die Updates mit Armbewegung statt? Im Mitschnitt ist von einem eigenen Raum die
    Rede, im Nachtrag vom OP-Saal.
13. Wie sieht es heute in Zahlen aus: Anteil der Geräte auf aktuellem Stand, Tage von der Freigabe bis
    zur Installation, Aufwand je Update? Ohne diese Ausgangswerte lassen sich keine Zielwerte nennen.

Die ausführliche Longlist in [bewertung-nach-pitch.md](bewertung-nach-pitch.md), Abschnitt 5, gilt
weiter für alles, was hier nicht beantwortet ist (Ablauf nach dem letzten Bild, Zuständigkeit für
Reinigung, Hands-on-Liste).

## 7. Nächste Schritte

1. Team entscheidet: Plattform als Produkt, Roboter als Schau mit echter Aufgabe, Begleiter als
   günstige Fassung (Abschnitt 5).
2. Top 3 aus Abschnitt 6 am 13.11. früh klären.
3. Danach Briefing, Drehbuch und Personas umschreiben. Die Personas brauchen die Rolle Medizinphysik als
   Flottenverantwortliche, die IT-Abteilung und die Person am Gerät als Teil des OP-Teams.
