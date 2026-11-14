# Challenge 4 – Personas der Key Figures

Stand 11.11.2026. Alle Personen sind **frei erfunden**. Sie bauen auf den Kurz-Personas in
[research/01-workflow-nutzer.md](../research/01-workflow-nutzer.md) (Abschnitt 9) auf und ergänzen
die Service-Seite von Siemens Healthineers und die Strahlenschutz-Rolle. Grundlage sind außerdem
[research/03-klinik-it-netzwerk.md](../research/03-klinik-it-netzwerk.md), das
[Interview](../interview-siemens-healthineers.md) und [ideen-vergleich.md](../ideen-vergleich.md).
Zahlen ohne Quelle sind Annahmen, auf dem Hackathon mit echten MTR, OP-Pflege und den Mentoren
prüfen. Die Abläufe stehen in [user-journeys.md](user-journeys.md).

## Überblick: drei Kreise

| Kreis | Persona | Rolle | Will vom C-Bogen | Entscheidet über Konnektivität? |
|---|---|---|---|---|
| **Am Gerät** | P1 **Sabine Hoffmann**, 44, MTR | Hauptbedienerin tagsüber | „Sofort bereit, nie überraschen“ | Nein, aber kann blockieren |
| | P2 **Jonas Becker**, 27, OTA | Bringt das Gerät nachts an den Tisch | „Einschalten und los“ | Nein |
| | P3 **Dr. Martin Weber**, 52, Unfallchirurg | Löst per Fußschalter aus | „Bild jetzt, gerne bessere Funktionen“ | Nein, aber Meinungsführer |
| **In der Klinik** | P4 **Murat Yilmaz**, 38, Medizintechnik | Verantwortet 40 mobile Röntgengeräte | „Wissen, welches Gerät wo welchen Stand hat“ | **Ja, organisatorisch** |
| | P5 **Andrea Krüger**, 47, IT-Sicherheit | Gibt Netz und Datenfluss frei | „Kein neues Risiko, Nachweise für NIS2“ | **Ja, technisch (Veto)** |
| | P6 **Dr. Petra Seidel**, 50, Medizinphysik/Strahlenschutz | Konstanzprüfung, Abnahme | „Kein Update der Bildkette ohne Prüfung“ | Ja, bei bildrelevanten Updates |
| **Beim Hersteller** | P7 **Lena Wagner**, 34, Remote-Service-Ingenieurin | Klärt Störungen aus der Ferne | „Logs vor dem Rückruf“ | Nein, aber größter Nutznießer |
| | P8 **Tobias Schmid**, 41, Field-Service-Techniker | Fährt raus, repariert, spielt Updates ein | „Einmal fahren, richtiges Teil dabei“ | Nein |

**Kernthese aus den Personas:** Die Menschen am Gerät haben keinen eigenen Grund zu verbinden, die
Menschen in der Klinik entscheiden darüber, und der Nutzen fällt beim Hersteller an. Ein Konzept
muss alle drei Kreise bedienen (siehe Synthese, Erkenntnisse 3 und 4).

---

## P1 – Sabine Hoffmann, 44, MTR im Zentral-OP

> „Wenn das Ding morgens um sieben eine Frage stellt, ist die Antwort Nein.“

**Steckbrief.** Medizinische Technologin für Radiologie, seit 18 Jahren im Beruf, seit 9 im
Zentral-OP eines Maximalversorgers. Betreut drei mobile C-Bögen für acht Säle. Erfahren,
pragmatisch, misstrauisch gegenüber „IT-Zeug“.

**Ein typischer Tag.** 06:40 Geräte einschalten und prüfen, ob die Akkus voll sind. 07:30 erster
Schnitt. Zwischen den Fällen Gerät umsetzen, abdecken, Bilder ans PACS schicken. Wenn ein Gerät
ausfällt, ruft sie die Medizintechnik oder direkt die Hotline an.

**Ziele.** Geräte jederzeit bereit, keine Wartezeit für das OP-Team, keine Überraschungen in der
Bedienung.

**Frust.**
- Fehlermeldungen ohne Handlungsanweisung („Error 4711“).
- Ein Update, nach dem ein Menü anders aussah, ohne dass es jemand angekündigt hatte.
- Hotline fragt am Telefon nach Seriennummer, Softwarestand und Fehlercode, während der Saal wartet.
- Niemand fühlt sich fürs Einstecken verantwortlich (Allmende-Problem, Recherche 01).

**Technik.** Bedient die Geräte souverän, privat Smartphone, keine Lust auf Apps im Dienst.

**Was sie von uns braucht.** Eine einzige Statuszeile („Bereit. Über Nacht aktualisiert, neu: …“),
nie einen Dialog beim Einschalten. Im Störfall einen Knopf, der der Hotline alles schickt.

**Design-Konsequenzen.** Bereitschaft vor Aktualität. Updates nie im Zustand „im Einsatz“. Release
Notes in einem Satz in OP-Sprache.

---

## P2 – Jonas Becker, 27, OTA im Spät- und Nachtdienst

> „Nachts bin ich froh, wenn ich das Gerät überhaupt finde.“

**Steckbrief.** Operationstechnischer Assistent in einem Kreiskrankenhaus, hat den
Strahlenschutzkurs für OP-Personal (§ 145 StrlSchV), bedient den C-Bogen nur gelegentlich. Nachts
löst meist der Unfallchirurg aus.

**Typischer Moment.** 23:10 Hüftfraktur. Das Gerät steht im Flur, Stecker steckt (zum Glück), er
zieht ihn und schiebt los.

**Ziele.** Schnell an den Tisch, keine Entscheidung über Dinge, die er nicht versteht.

**Frust.** Unklare Meldungen beim Hochfahren, lange Bootzeit (vergleichbares Gerät: 175 s laut
Hersteller, Recherche 01), Angst, „etwas kaputt zu machen“.

**Was er von uns braucht.** Dass jede Bedienhandlung (Stecker ziehen, Einschalten, Bremse lösen)
Wartung sofort sicher abbricht und das Gerät mit der alten Version bereit ist.

**Design-Konsequenzen.** Nichts darf Jonas eine Frage stellen, die er nicht beantworten kann. „Nicht
heute“ ohne Rückfrage.

---

## P3 – Dr. Martin Weber, 52, Oberarzt Unfallchirurgie

> „Spart mir das Testaufnahmen? Dann her damit.“

**Steckbrief.** Oberarzt in einem überregionalen Traumazentrum, schiebt das Gerät im Zweifel selbst.
Offen für neue Funktionen, wenn sie Zeit oder Strahlung sparen.

**Rolle.** Meinungsführer im OP. Wenn er in der Morgenbesprechung sagt „seit dem Update speichert
der Bogen die Positionen“, gelten Updates als Gewinn.

**Was er von uns braucht.** Sichtbaren Nutzen von Updates. Er ist der Grund, warum „Was ist neu“
(Ideen 2, 5, 8) wichtig ist.

**Design-Konsequenzen.** Nutzen erzählen, nicht Versionsnummern.

---

## P4 – Murat Yilmaz, 38, Medizintechnik im Klinikverbund

> „Ich weiß von 40 Geräten bei 12 sicher, welchen Softwarestand sie haben.“

**Steckbrief.** Medizintechnik-Ingenieur, verantwortlich für mobile Röntgengeräte an zwei
Standorten. Koordiniert Wartung, Updates, Einweisungen und Prüfungen mit IT, Strahlenschutz und
Hersteller. Muss Geräte regelmäßig suchen.

**Pflichten.** Nach der neuen MPBetreibV (seit 20.02.2025) zählen sicherheitsrelevante Updates zur
Instandhaltung, Einweisungen nach Updates mit geänderter Bedienung sind Pflicht (Recherche 02,
[Wortlaut prüfen]).

**Ziele.** Flottenüberblick, Updates in Wellen (erst ein Gerät, dann alle), dokumentierte Nachweise,
nie alle C-Bögen eines Hauses gleichzeitig außer Betrieb.

**Frust.** Termine für Updates mit dem OP abstimmen, Gerät seit 9 Tagen nicht eingesteckt, Excel als
Bestandsliste.

**Was er von uns braucht.** Ein Flotten-Cockpit mit Ampel, letztem Kontakt, wartenden Updates und
einer einmal festgelegten Klinik-Policy (Idee 4).

**Design-Konsequenzen.** Er ist der eigentliche Kunde für Konnektivität. Seine Oberfläche ist die
zweite Hälfte der Demo.

---

## P5 – Andrea Krüger, 47, Informationssicherheitsbeauftragte (KRITIS-Haus)

> „Geräte, die ‚irgendwie ins Internet‘ gehen, kommen mir nicht ins Netz.“

**Steckbrief.** Informationssicherheitsbeauftragte eines Klinikums, das unter KRITIS bzw. NIS2 fällt
(in DE seit 06.12.2025, Recherche 02). Etwa 7 IT-Vollkräfte pro Standort (Recherche 03), keine Zeit
für Einzelfreigaben pro Gerät.

**Ziele.** Segmentierung, Nachweis des Patch-Stands, kein Datenabfluss mit Patientendaten, Audit-Trail.

**Frust.** Hersteller-Modems, die den Perimeter umgehen. MDS2-Formulare, die nicht zum Gerät passen.
Updates, die sie nicht nachvollziehen kann.

**Was sie von uns braucht.** Einen Weg pro Klinik statt pro Gerät (Medizingeräte-VLAN, nur
ausgehend, signierte Pakete), Allowlist für Logs ohne Patientendaten, und Nachweise, die sie für ihre
eigenen Pflichten verwenden kann („Compliance-Dividende“, Idee 4).

**Design-Konsequenzen.** Sie hat ein Veto. Der Pitch muss ihr ein Geschenk machen, nicht eine
Bitte stellen. Der QR-Weg (Idee 1) braucht ihre Zustimmung zum Handy als Kanal.

---

## P6 – Dr. Petra Seidel, 50, Medizinphysik-Expertin und Strahlenschutzbeauftragte

> „Ein Update, das die Bildkette anfasst, ist für mich eine Änderung an der Röntgeneinrichtung.“

**Steckbrief.** Medizinphysikerin, zuständig für Abnahme- und Konstanzprüfungen der
Röntgeneinrichtungen. Nach § 115 Abs. 4 StrlSchV braucht eine Änderung, die die Bildqualität
beeinflussen kann, eine Prüfung vor der nächsten Anwendung am Patienten (Recherche 02,
[Praxis prüfen]).

**Ziele.** Kein bildrelevantes Update ohne Prüfung, klare Kennzeichnung, was ein Update berührt.

**Was sie von uns braucht.** Die **Update-Ampel** mit Regulatory Manifest: grün unsichtbar, gelb mit
Konstanzprüfung geplant, rot mit Teilabnahme (Synthese, Idee E; Ideen-Vergleich, Idee 2).

**Design-Konsequenzen.** „Unsichtbar“ gilt nur für grüne Updates. Sie ist der Grund, warum wir nicht
„alles im Hintergrund“ versprechen.

---

## P7 – Lena Wagner, 34, Remote-Service-Ingenieurin beim Hersteller

> „Bei verbundenen Geräten weiß ich vor dem Rückruf, was los ist. Bei C-Bögen rate ich.“

**Steckbrief.** Ingenieurin im Remote-Service-Center des Herstellers, betreut Röntgensysteme in der
DACH-Region. Bei CT und Angio sieht sie Logs über die Remote-Services-Verbindung, bei mobilen
C-Bögen fast nie (Interview).

**Typischer Fall.** Klinik ruft an: „Bild bleibt schwarz.“ Ohne Logs fragt sie 15 Minuten lang ab,
tippt auf drei mögliche Ursachen und schickt den Techniker mit zwei Ersatzteilen.

**Ziele.** Remote-Vorabklärung, Erstlösungsquote am Telefon, weniger Einsätze vor Ort.

**Was sie von uns braucht.** Ein Diagnosepaket, das vor dem Rückruf da ist, egal über welchen Weg
(Netz, später, QR-Code). Das ist laut Interview der Hauptschmerz.

**Design-Konsequenzen.** Diagnose vor Update. Ihr Dashboard ist der „Wow-Bildschirm“ der Demo.

---

## P8 – Tobias Schmid, 41, Field-Service-Techniker

> „Zweimal hinfahren ist der teuerste Satz in meinem Job.“

**Steckbrief.** Servicetechniker im Außendienst für Nordbayern, fährt am Tag zwei bis drei Kliniken
an. Spielt bei Besuchen ausstehende Updates ein, wenn er das Gerät ohnehin offen hat.

**Frust.** Kommt an, das Gerät ist im OP, er wartet zwei Stunden. Falsches Ersatzteil dabei.
Updates bei Vor-Ort-Terminen dauern und blockieren das Gerät.

**Was er von uns braucht.** Fehlerbild und Softwarestand vor der Fahrt, ein Zeitfenster, in dem das
Gerät wirklich frei ist, und Updates, die schon vorher eingespielt sind.

**Design-Konsequenzen.** Jeder Prozentpunkt mehr verbundene Geräte spart ihm Fahrten. Er ist der
Business Case für den Hersteller.

---

## Was wir vor Ort mit echten Nutzern und Mentoren prüfen

1. Wer bedient bei den Hackathon-Teilnehmern aus der Klinik tatsächlich (MTR, OTA, Ärzte)?
2. Wo steht das Gerät nachts, und ist es eingesteckt? (P1, P2, P4)
3. Gibt es in der Klinik eine Person wie P4, die sich für die Flotte zuständig fühlt?
4. Würde P5 den QR-Weg über ein Diensthandy akzeptieren?
5. Wie oft lösen Software-Updates heute eine Konstanzprüfung aus (P6)?
6. Wie viel Zeit spart Remote-Vorabklärung pro Fall (P7, P8)? Zahl für den Pitch.
7. Interviewfragen für MTR stehen in [research/01-workflow-nutzer.md](../research/01-workflow-nutzer.md), Abschnitt 10.
