# Gespräch mit dem Challenge-Geber (12.11.2026, abends)

**Quelle:** Zwei automatische Mitschnitte desselben Gesprächs zwischen dem Team und einem der beiden
Challenge-Geber von Siemens Healthineers, dazu Notizen des Teams. Von Christian am 12.11.2026 um
21:09 Uhr bereitgestellt. Die Rohfassung liegt in der Projekt-Bibliothek unter `uploads/hearth/` und ist
bewusst nicht ins Repo übernommen, weil sie lockere Nebenbemerkungen enthält.

**Wie zu lesen:** Dies ist ein Faktenblatt, kein Wortprotokoll. Aussagen sind sinngemäß und geordnet,
englische Zitate nach dem saubereren der beiden Mitschnitte. Die Mitschnitte haben
Hörfehler. Zahlen sind mündliche Schätzungen des Challenge-Gebers („roughly“, „I'm just making up
numbers“ ist jeweils vermerkt). Belegmarke für alles hier: **[geprüft: Gespräch 12.11., mündlich]**. Für
den Pitch heißt das: verwendbar als „laut Challenge-Geber“, nicht als gemessener Wert.

Was daraus für unser Konzept folgt, steht in
[synthese-nach-gespraech.md](synthese-nach-gespraech.md).

## 1. Das größte Problem aus seiner Sicht

- „The biggest challenge for any kind of mobile device in the clinical field is when it's not used, it's
  switched off.“ Das Gerät steht im Flur, niemand kümmert sich, weil es niemand benutzt.
- **Im Flur gibt es oft keine Steckdose.** Manchmal ja, manchmal nein, man kann sich nicht darauf
  verlassen. Manche Häuser parken das Gerät in einem Lagerraum.
- **Das Gerät läuft nur am Netzstrom.** Die eingebaute USV reicht nur zum sicheren Herunterfahren, damit
  keine Bilder verloren gehen. Netzstecker ist ein normaler Schuko-Stecker.
- Seit rund zwei Jahrzehnten versucht Siemens, die Konnektivität dieser Geräte zu verbessern, ohne
  dass es besser geworden wäre. Einige Kunden halten ihre Geräte mit viel Handarbeit verbunden, vielen
  ist es gleichgültig.

## 2. Das Zeitfenster im OP

- Ablauf: Gerät in den OP bringen, einstecken, einschalten, positionieren, abdecken, Patient vorbereiten.
- **Vom Einstecken bis zum Beginn der Operation vergeht höchstens etwa eine Stunde, meist weniger.**
- **Nach Beginn der Operation ist praktisch keine Hintergrundaktivität mehr erlaubt.** Das System muss
  fehlerfrei laufen.
- Eine OP-Minute kostet nach seiner Angabe etwa 80 Euro. Kliniken müssen deshalb sparsam mit Saalzeit sein.
- Tagsüber sind die Säle von etwa 8 bis 17 Uhr belegt. **85 bis 90 Prozent der Eingriffe sind geplant.**
  Nachts sind in einer Klinik mit zwölf Sälen zwei bis drei in Betrieb, auch mangels Personal.

## 3. Wie Updates heute laufen

- **Der Download läuft schon in Teilen**, immer wenn das Gerät verbunden ist. Erst wenn alles geladen
  und die Prüfsumme korrekt ist, zeigt das Gerät dem Nutzer an, dass ein Update bereitsteht.
- **Die 120 Minuten aus dem Pitch sind keine Übertreibung**, sondern eine ziemlich durchschnittliche
  Dauer. Sie lässt sich vorab ungefähr abschätzen.
- Lang ist nicht die Dateigröße und nicht die Rechenleistung, sondern „the sheer amount of stuff that
  needs to be done“: viele Teilsysteme und verteilte Komponenten (Motorsteuerung, Bildsystem, Windows).
  Laut Notiz des Teams sichert das Gerät vorher seine Parameter und spielt sie danach zurück.
- **Ein Mensch muss den Knopf drücken.** „There is always one human in the loop that needs to press the
  button, because as a human you need to confirm now is the right time to do this update. So we are not
  allowed to automatically start that.“
- **Etwa 99 Prozent der Sicherheitsupdates sind aus der Ferne möglich.** Sicherheits-Patches kommen
  etwa alle drei Monate. Updates mit Hardware-Tausch versucht Siemens auf etwa einmal in zwei Jahren zu
  begrenzen.
- **Updates mit mechanischer Kalibrierung** (Endlagen, Detektor, Röhre) macht der Siemens-Techniker vor
  Ort in einem eigenen Raum, wegen Strahlung und Bewegung. Kein autonomer Modus erlaubt. Für unsere
  Challenge ausdrücklich ausgeklammert: „That's something not to worry about.“
- **Aufgabe der Challenge in seinen Worten:** Software-Updates, die Verbindung zum Backend, um sie zu
  bekommen, und ein Rückkanal für Log-Dateien.

## 4. Wenn es schiefgeht

- **Etwa 2 Prozent der Updates enden „dead on arrival“**: Das Gerät ist danach nicht benutzbar. „And
  that's a lot.“
- Ursachen, die er nennt: Jemand schaltet aus, weil er denkt, es sei fertig. Jemand zieht den Stecker,
  um Strom zu sparen, ohne zu wissen, dass ein Update läuft. Ein Teilsystem ist nicht erreichbar. Zu
  wenig Festplattenplatz trotz Vorabprüfung. Dass gesicherte Parameter nicht zur neuen Version passen,
  kam als Nachfrage aus dem Team und wurde von ihm nur kurz bejaht.
- **Bei einem Fehlschlag gibt es meist ein Rollback**, dessen Dauer davon abhängt, wie weit das Update war.
- Starten heißt für die Bedienung „fire and pray“, nicht „fire and forget“.
- **Siemens erfährt von Fehlschlägen durch Anrufe verärgerter Kunden.** Auf die Frage, ob ein
  ausbleibendes Lebenszeichen nach 120 Minuten den Fehlschlag anzeigen könnte, antwortete er knapp mit Ja.
- **Rollouts laufen gestaffelt.** Ein einzelner Fehlschlag gilt als Zufall, bei vielen gleichzeitig wird
  gestoppt. Problem dabei: Geräte, die das Paket schon geladen haben, tragen es weiter „in their belly“.
  Drückt dort jemand den Knopf, schlägt es fehl. Diese Pakete müsste man zurückholen können.

## 5. Drei Rollen, keine fühlt sich zuständig

| Rolle | Was sie kann | Warum sie es nicht tut |
|---|---|---|
| **Person am Gerät** („X-ray nurse“, Teil des OP-Teams) | Steht am Gerät, könnte den Knopf drücken | Nicht technikaffin, überlastet, will nicht angeschrien werden, wenn etwas kaputtgeht. Scheut deshalb zurück |
| **Medizinphysik bzw. Medizintechnik** („physicist“, „biomeds“) | Verantwortet die Flotte (als Beispiel nennt er 100 Systeme) und den Strahlenschutz | Will nicht in den OP-Trakt laufen und warten. Muss bei den Abteilungen nach einem Fenster fragen, die antworten: Wir wissen nicht, wann der nächste Fall kommt. Viel Abstimmung per Telefon und E-Mail |
| **IT-Admin** | Sieht in teamplay Fleet alle Systeme, verfügbare Updates und was sie bringen | Sitzt woanders, in Klinikketten dezentral, und ist abends um halb acht nicht im OP |

- „So there are three people who actually could be responsible for performing those updates, but none
  of them.“ Er vergleicht es mit einem Fußballspiel, sinngemäß: „Nimm du ihn, ich hab ihn sicher.“ (Im
  Mitschnitt ist die Stelle nur verstümmelt zu hören, das Bild hat Christian so wiedergegeben.)
- Auf die Frage, warum nicht der Letzte am Abend das Update startet: „Nobody feels responsible. So it's
  a problem of feeling responsible. Not necessarily of being responsible.“
- Die Person am Gerät bedient nur den C-Bogen, keine anderen Bildgebungsgeräte, und hilft sonst dem OP-Team.
- Ob Bediener ein Diensthandy mit Hersteller-Software haben: meist nicht, er wusste es nicht sicher.
- Eine Planungshilfe für dieses Fenster gibt es nach seiner Schilderung nicht. Er bejahte, dass
  Scheduling helfen würde.
- Warum es bei CT und MRT klappt: fest installiert, einmal von der IT angebunden, fester Tagesplan, der
  Letzte drückt abends den Knopf. Für die Radiologie ist das Gerät ihr Beruf, für die Chirurgie ist der
  C-Bogen ein Werkzeug wie ein Schraubendreher.

## 6. Zwei Lösungsrichtungen, die er selbst nennt

1. **Die „golden windows of opportunity“ im Ablauf finden** und klären, wer das Gerät wann verbindet und
   wer sich um Update und Logs kümmert.
2. **Das Gerät technisch vom Backend entkoppeln:** ein kleiner, akkubetriebener Rechner neben dem Gerät
   („think about a mini PC, Raspberry Pi“), der mit dem Backend spricht, auch wenn der C-Bogen aus ist.
   Er lädt das Update, schickt Logs hinaus, und sobald der C-Bogen an ist, übergibt er das Update per
   Kabel.

Auf die Frage, von welcher Technik er sich am meisten erhofft, nannte er genau diese zweite Richtung:
ein autonomes Gerät neben dem System, das die Verbindung übernimmt. Offen seien Kommunikation zwischen
beiden und der Akku des Begleiters. Die eigene Entwicklung möge die Idee, habe aber viele Gründe genannt,
warum das nie funktionieren werde. „I'm a fan of showing them that it actually can work.“

Zu Logs malte er das Zielbild: Logs fließen laufend ins Backend, eine KI erkennt zum Beispiel, dass die
Röhre in einer Woche ausfällt, Siemens ruft vorher an und vereinbart den Tausch. Dafür fehlen die Daten.

## 7. Reaktionen auf unsere Ideen

| Unsere Idee | Seine Reaktion |
|---|---|
| Rechner tauschen wie einen Roller-Akku (Idee 20) | Gefällt ihm als Gedanke, trägt aber nicht: doppelt so viele Rechner, und der Rechner ist ein teures Teil. Löst nur den PC, nicht die verteilten Komponenten. Jemand müsste das Gerät öffnen |
| Zweites Abbild je Teilsystem, Umschalten per Neustart (Idee 17) | „I would love if it worked that way.“ Die Systeme sind dafür noch nicht weit genug. „But that should not limit your thoughts.“ |
| Größerer Akku (Idee 10) | Kosten, Baugröße, Gewicht. Das Gerät muss im engen OP leicht zu bewegen sein |
| Ausbleibendes Lebenszeichen als Fehlersignal (Idee 19) | Knappes Ja. Klar belegt ist nur: Siemens erfährt Fehlschläge heute durch Anrufe |
| Scheduling für die Medizinphysik, KI-Orchestrator (Idee 21) | Zustimmung zum Scheduling. Er selbst nennt die goldenen Fenster als ersten Lösungsweg |
| Tamagotchi, emotionale Bindung (Idee 8) | Kein Widerspruch, keine ausdrückliche Zustimmung |
| Notfälle vorhersehen (Idee 16) | Verweist auf den Polytrauma-Alarm: Alle Fachrichtungen kommen zusammen, meist geht es zuerst ins CT, dann wird der OP angefordert. Das ließe sich als Auslöser nutzen |
| Lokaler Funk im Kliniknetz statt WLAN | „Could work.“ Er will die Technik nicht einschränken |

Typische Notfälle für den C-Bogen: Polytrauma nach Verkehrsunfall, offene Brüche. Haupteinsatz ist
orthopädische und Unfallchirurgie, vieles davon planbar (ein gebrochenes Handgelenk muss nicht am
selben Tag operiert werden).

## 8. Technische Eckdaten des Geräts

- Schnittstellen: **WLAN, LAN, USB. Kein Bluetooth.**
- **Das Universitätsklinikum Erlangen erlaubt kein WLAN im OP.**
- Stromverbrauch während eines Updates: wusste er nicht. Die Frage, ob dabei Röhre und Detektor
  überhaupt versorgt sein müssen, fand er gut.
- Die mobilen Geräte laufen nicht auf der Software-Plattform der großen Scanner, weil sie dafür zu groß
  wäre. Die genannte Basis ist im Mitschnitt nicht sicher zu verstehen. [unklar]
- Flottenplattform von Siemens: teamplay Fleet.
- Größe eines Updates: nannte er nicht. Die „10 Gigabyte“ im Gespräch waren ausdrücklich eine erfundene
  Beispielzahl.

## 9. Was „invisible“ für ihn heißt

„I don't want the user to think about if it's connected or not. It just should work.“ Unsichtbar meint
also: aus dem Kopf der Nutzer, nicht technisch versteckt.

## 10. Einordnung des Teams aus dem Gespräch

Notizen des Teams, keine Aussagen des Challenge-Gebers:

- Das Szenario aus dem Pitch sei zugespitzt gewesen. Die Dauer von 120 Minuten hat er aber bestätigt.
- Vermutung des Teams: Die Challenge-Geber haben selbst eine Lösung im Kopf (den Begleiter) und suchen
  Rückenwind dafür im eigenen Haus. [Annahme des Teams]
- Die Idee eines Wartungsroboters („C-ARMAGOTCHI“) entstand im Anschluss. Sie ist als Idee 23 in
  [ideen-vergleich.md](ideen-vergleich.md) aufgenommen.

## 11. Nachtrag: Start aus der Ferne und Art der Updates

Von Christian am 12.11. gegen 21:50 Uhr aus dem Gespräch nachgereicht. Diese Punkte stehen so nicht im
Mitschnitt, sie sind [geprüft: Gespräch 12.11., mündlich, wiedergegeben von Christian]. Die genaue
Form des Fern-Starts ist am 13.11. noch einmal zu bestätigen.

- **Die Mehrzahl der Updates braucht niemanden am Gerät.** Der Knopf muss weiter gedrückt werden, das
  lässt sich aber „more or less“ aus der Ferne auslösen. Der Mensch bleibt also in der Schleife, muss
  aber nicht daneben stehen. Das präzisiert Abschnitt 3: Pflicht ist die Bestätigung, nicht die
  Anwesenheit.
- **Nur die großen Updates mit Neukonfiguration der Sensorik, bei denen sich der Arm bewegt,** brauchen
  Aufsicht und finden im OP-Saal statt, unter anderem weil dabei Strahlung ausgelöst wird. Vermutlich
  sind das die Kalibrier-Updates aus Abschnitt 3, die der Siemens-Techniker macht [Annahme]. Dort war
  von „einem eigenen Raum“ die Rede, hier vom OP-Saal, der Ort ist also noch zu klären.
- **Die Umgebung ließe sich mit Sensorik prüfen,** etwa mit LiDAR. Das war ein Gedanke im Gespräch,
  keine vorhandene Funktion. Was genau zu prüfen wäre (steht jemand am Gerät, ist der Platz frei), ist
  unsere Formulierung.

Weitere Punkte, die Christian am 13.11. kurz nach Mitternacht bei der Durchsicht der Synthese
nachgetragen hat, gleiche Belegmarke:

- Aus der Ferne startbar sind oft die Sicherheitsupdates und die Software des eingebauten Rechners.
  Das sind die häufigeren Updates. Sie zu entlasten, würde schon viel bringen. Dazu passt Abschnitt 3:
  Etwa 99 Prozent der Sicherheitsupdates sind aus der Ferne möglich.
- Bei den selteneren Updates mit Armbewegung muss jemand dabeibleiben und dafür sorgen, dass der Raum
  leer ist.
- Im Betrieb darf nebenbei wenig bis gar nichts laufen, was den Einsatz gefährden könnte.
- Ein unbrauchbares Gerät nach einem Fehlschlag heißt: Der Service muss anrücken. In manchen Fällen
  rettet noch ein Rollback.
- Geräte stehen in der Standzeit auch deshalb nicht am Strom, weil Energie gespart wird.
- Die Fachabteilungen können Fenster nicht voraussagen. Die Nachfragen bauen Druck bei der Person am
  Gerät auf. Die drei Rollen haben sehr verschiedene Zeitpläne.
- WLAN, LAN und USB sind je nach Gerät vorhanden.
- Ein zweites Systemabbild (Idee 17) würde die Hardware teurer machen.
- Zur Frage, ob ein Akkupack ein Update tragen könnte, war er zuversichtlich: Bei den betreffenden
  Updates wird vor allem der Rechner aktualisiert. Im Mitschnitt kannte er den Verbrauch nicht
  (Abschnitt 8).

Unsere Folgerung daraus [Annahme], ausgeführt in der Synthese: Am geparkten Gerät fehlen dann vor allem
Strom, das Einschalten und Netz. Das ist physische Arbeit, und die übernimmt der Roboter aus Idee 23.
