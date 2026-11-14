# Recherche 00: Synthese, kritische Einordnung und Lösungsideen

Challenge 4 (Siemens Healthineers): *Invisible Connectivity: Smart Workflow Windows for Mobile C-Arms*.
Stand: 11.11.2026. Diese Datei fasst die fünf Einzelrecherchen zusammen, ordnet sie kritisch ein und
schlägt Konzepte für den Hackathon vor. Details und Quellen stehen in den Einzeldateien:

| Datei | Winkel |
|---|---|
| [01-workflow-nutzer.md](01-workflow-nutzer.md) | OP-Alltag, wer bedient den C-Bogen, Personas, Interviewfragen |
| [02-regulatorik-security.md](02-regulatorik-security.md) | MDR, MDCG, IEC 62304/81001-5-1/80001-1, StrlSchV, MPBetreibV, NIS2, Data Act, AI Act |
| [03-klinik-it-netzwerk.md](03-klinik-it-netzwerk.md) | Klinik-IT als Gatekeeper, Funk im OP, Bewertungsmatrix der Verbindungswege |
| [04-wettbewerb-analogien.md](04-wettbewerb-analogien.md) | Was Siemens und Wettbewerber schon haben, Analogien, White Space |
| [05-technik-prototyp.md](05-technik-prototyp.md) | Update- und Log-Technik, Prototyp-Architektur, Bauplan, Demo-Skript |
| [../interview-siemens-healthineers.md](../interview-siemens-healthineers.md) | Interview mit den Challenge-Gebern |
| [../ideen-vergleich.md](../ideen-vergleich.md) | Dreiundzwanzig Ideen vertieft (inkl. Deep Tech, Gamification, „Was wäre wenn“, Blue Ocean), Vergleichsmatrix, Streitfragen |

> **Belegstand:** Das gemeinsame Abrufbudget für Webseiten war gegen Ende der Recherche erschöpft. Ein
> Teil der Quellen ist nur über Suchtreffer bestätigt und in den Einzeldateien so markiert. Die Liste
> „Vor dem Pitch gegenprüfen“ unten sammelt die wichtigsten Punkte.

---

## 1. Die Challenge in einem Satz, neu gerahmt

Siemens hat den Kanal (Smart Remote Services, ausgehend über TLS 443, Patientendaten maskiert) und die
Update-Technik ist gelöst (A/B, Signaturen, Rollback). **Es fehlt nicht Technik, sondern ein Grund und ein
Moment, in dem sich Verbinden von selbst ergibt.** Unser Vorschlag zur Rahmung:

> **Nicht „unsichtbare Konnektivität“, sondern „unsichtbarer Service“.** Der C-Bogen muss nicht ständig
> online sein. Er muss so gebaut sein, dass Service trotz Funklöchern, Ausschalten und Zeitdruck
> funktioniert, und dass jede kurze Verbindung genutzt wird.

Das ist die Denkweise von *Delay-Tolerant Networking*: Daten warten geduldig auf den nächsten Kontakt
statt eine Dauerverbindung vorauszusetzen.

## 2. Zehn Erkenntnisse, die das Konzept tragen

1. **Der Hauptschmerz ist die Remote-Vorabklärung, nicht das Update** (Interview). Logs vor dem
   Techniker-Einsatz sparen Vor-Ort-Zeit, Servicekosten und Ausfallzeit. Logs sind klein (MB) und passen
   in jedes Fenster, Updates (GB) nicht. → *Logs zuerst, Updates danach.* (01, 04, 05)
2. **„Radiographer“ ist in Deutschland oft nicht die Person am Gerät.** Nach § 145 StrlSchV bedienen auch
   OP-Pflege/OTA und Ärzte unter Aufsicht. Das Konzept muss für wechselnde, wenig geschulte Bediener
   funktionieren und darf ihnen keine Entscheidung aufbürden. (01)
3. **Die Bediener haben keinen eigenen Grund, sich zu verbinden.** Nutzen haben Hersteller, Medizintechnik
   und IT. Bediener wollen nur, dass das Gerät sofort geht (vergleichbares Gerät GE OEC Elite: 175 s bis zur
   vollen Funktion laut Hersteller). → Nullaufwand oder Huckepack auf eine Handlung, die ohnehin passiert. (01)
4. **Der eigentliche Gatekeeper ist die Klinik-IT** mit Informationssicherheit, Medizintechnik und
   Datenschutz (B3S, IEC 80001-1, MDS2, AVV). Bei ca. 7 IT-Vollkräften pro Standort skaliert nichts, was pro
   Gerät Handarbeit braucht. → **Zwei Nutzer gewinnen:** MTR (null Aufwand) und IT (null neues Risiko,
   Nachweise geschenkt). (03)
5. **Im OP ist der C-Bogen oft physikalisch offline** (Bleiwände, meist keine Access Points im OP). Das
   Konnektivitätsfenster und das Ruhefenster liegen am selben Ort: Parkposition, Flur, Lager. (03)
6. **Strahlenschutz ist der übersehene Hebel.** Nach § 115 Abs. 4 StrlSchV braucht jede Änderung, die die
   Bildqualität beeinflussen kann, eine (Teil-)Abnahme bzw. Konstanzprüfung vor der nächsten Anwendung am
   Patienten; Software-Änderungen sind als Anlass genannt. → Ein Update der Bildkette darf nicht
   unbemerkt nachts laufen. Updates müssen **klassifiziert** werden. (02)
7. **Die Klinik ist selbst verpflichtet:** Die neue MPBetreibV (seit 20.02.2025) zählt sicherheitsrelevante
   Updates zur Instandhaltung und verlangt nach Updates mit wesentlich geänderter Bedienung eine erneute
   Einweisung. NIS2 gilt in Deutschland seit 06.12.2025. → Updates sind **Compliance-Pflicht des Kunden**.
   Das ist der stärkste Anreiz, den wir nutzen können. (02, 03)
8. **Bestandsflotte = Legacy-Geräte = keine wesentlichen Änderungen** (Art. 120 MDR, MDCG 2020-3). Das deckt
   sich mit Siemens' Wunsch nach „small software-only changes“: Service-Layer ändern (Zeitfenster, Logs,
   Bedienführung), klinische Funktion nicht anfassen. (02, Interview)
9. **Die Grundidee „gelerntes Update-Fenster“ ist nicht neu** (Ford-Patent US11017616, Windows Active
   Hours per ML, GE US6912481). Neu ist die Übertragung auf ein mobiles, oft ausgeschaltetes Gerät im
   OP-Ablauf. Das ehrlich zu sagen, macht uns glaubwürdiger. (04)
10. **„Tesla für den C-Bogen“ ist abgedroschen und schief** (Tesla steht nachts am Strom im WLAN, der
    C-Bogen nicht). Stärkere Bilder: **„Gatelink für den OP“** (Flugzeug dockt in der Bodenzeit an, Daten
    raus, Software rein im zertifizierten Fenster) und das iPhone-Muster „Heute Nacht aktualisieren“. (04)

## 3. Kritische Prüfung der Challenge-Annahmen

| Annahme in der Challenge | Unsere Einschätzung | Konsequenz |
|---|---|---|
| Radiographers sollen *willingly connect* | Sie entscheiden über das Netz meist gar nicht, und in DE bedienen oft andere | Zielgruppe erweitern: Bediener **und** Medizintechnik/IT. Für Bediener: Verbinden als Nebeneffekt, nicht als Entscheidung |
| Updates sind das Ziel | Laut Interview ist Vorabklärung der Hauptschmerz; Updates sind regulatorisch (StrlSchV, Legacy) heikler | Reihenfolge drehen: Diagnose zuerst, Updates klassifiziert danach |
| „Im Hintergrund“ ist immer gut | Bildketten-Updates brauchen Prüfung; ein heimliches Update ist ein Haftungs- und Strahlenschutzrisiko | „Unsichtbar“ nur für grüne Updates, gelbe/rote werden sichtbar geplant |
| Mehr Konnektivität = mehr WLAN | OP-Funk ist schlecht, IT ist knapp, eigenes LTE-Modem umgeht den Perimeter | Bestehende Kontakte nutzen (DICOM-Versand, Parkposition, Smartphone), einen freigegebenen Pfad pro Klinik statt pro Gerät |
| Die Lösung ist Technik | Siemens sagt selbst: frühere Versuche waren rein technisch | Pitch über Verhalten, Anreize, Momente; Technik nur so weit, dass es glaubwürdig ist |

## 4. Lösungsideen aus verschiedenen Winkeln

Jede Idee ist markiert: **[SW]** Bestandsflotte, reine Software · **[NG]** Next Gen, Hardware erlaubt.
Mut-Skala: ● solide · ●● ambitioniert · ●●● bold.

### A. Der Störfall als Einstieg („Hilfe zuerst“) [SW] ●●

Der stärkste Moment für freiwilliges Verbinden ist, wenn etwas nicht geht. Ein Knopf **„Problem melden“**
schnürt ein Diagnosepaket nur aus freigegebenen technischen Feldern (Allowlist, keine Patientendaten),
signiert es und schickt es über den nächsten Kanal: jetzt, beim nächsten Netzkontakt (Store-and-forward)
oder sofort als QR-Code. Die Hotline hat beim Rückruf schon die Logs. **Wer meldet, bekommt schneller
Hilfe** – das ist der Anreiz für das Personal, den die Challenge sucht. Verbindung kommt als Trojanisches
Pferd über den Service, nicht über das Update.

### B. QR-Datenbrücke über das Smartphone („Sneakernet mit Stil“) [SW] ●●●

Ohne jedes Kliniknetz: Das Gerät zeigt eine kurze **Folge von QR-Codes** (Fountain-Code-Verfahren, wie
bei Projekten wie TXQR), die ein Handy der Hotline, des Medizintechnikers oder der MTR abfilmt und an
SRS weitergibt. Einweg, nur aus dem Gerät heraus, nur technische Daten, kein neues Netzwerk-Interface am
Gerät. Für ein paar Kilobyte Kennzahlen und Fehlercodes reicht das. *Kritisch:* Die IT muss den
Handy-Weg akzeptieren (Datenschutz, MDM); Ein-Weg und Allowlist sind die Argumente. Sehr gut demo-fähig.
*[Annahme: Fountain-QR-Bibliotheken vor dem Bau prüfen.]*

### C. „Gute Nacht, C-Bogen“: Ausschalten ist das Fenster [SW, falls A/B möglich] ●●

Das Gerät ist aus, wenn es Zeit hätte. Also wird das **Herunterfahren an der Parkposition** zum Fenster:
Ist das Gerät am Netz und ein grünes Update bereit (Download vorher gedrosselt im Hintergrund), wird es
beim Ausschalten aktiviert, Selbsttest ohne Strahlung, dann aus. Wer mitten drin einschaltet, bekommt sofort
die alte Version. Garantie: **„Beim Einschalten immer einsatzbereit.“** *Offene Frage an die Mentoren:*
Haben Bestandsgeräte A/B-Slots bzw. Software-gesteuertes Abschalten?

### D. Huckepack auf die DICOM-Verbindung [SW] ●

Immer wenn der C-Bogen Bilder ans PACS schickt, ist er ohnehin im Netz. Dann gehen Logs mit raus und
Update-Teile laden gedrosselt. Kein neuer Handgriff, keine neue Gewohnheit. *Kritisch:* Ob das
Medizingeräte-VLAN den Weg zu SRS freigibt, entscheidet die IT. Darum Idee F.

### E. Update-Ampel mit Regulatory Manifest [SW] ●●

Jedes Update-Paket trägt ein maschinenlesbares Manifest: Strahlenschutz-/Bildqualitätsrelevanz,
Einweisungsbedarf, SBOM-Delta, Bezug zu Sicherheitsmaßnahmen im Feld (FSCA).
**Grün** läuft unsichtbar (Security, OS, Log-Agent, Konnektivität). **Gelb** wird mit Konstanzprüfung im
OP-Plan vorgeschlagen. **Rot** braucht Teilabnahme bzw. Sachverständigen. Damit wird aus „Siemens drückt
Updates rein“ ein regulatorisch sauberer Prozess, und die Jury sieht, dass wir StrlSchV und MDCG kennen.

### F. Klinik-Policy einmal, dann automatisch [SW] ●

Die Klinik (Medizintechnik + IT) legt **einmalig** fest, welche Update-Klassen automatisch laufen dürfen,
in welchen Fenstern, und dass nie alle C-Bögen eines Hauses in derselben Nacht aktualisiert werden
(Staffelung, immer ein Ersatzgerät auf altem Stand). Das ist IEC-80001-1-konform und gibt der IT die
Kontrolle zurück. **Die MTR entscheidet nie zwischen Update und Patient.**

### G. Compliance-Dividende für die Klinik-IT [SW] ●●

Wer verbindet, bekommt geschenkt, was er sonst mühsam erstellt: Patch-Stand der Flotte, SBOM, Nachweis
eingespielter Sicherheitsupdates (MPBetreibV § 7), Audit-Trail für NIS2 und § 391 SGB V, plus „die Klinik
sieht dieselben Logs wie Siemens“ (EU Data Act). **Der Gatekeeper wird zum Fürsprecher.**

### H. Einweisung als 60-Sekunden-Moment am Gerät [SW] ●●

MPBetreibV verlangt nach Updates mit geänderter Bedienung eine erneute Einweisung. Statt Schulungstermin:
Beim ersten Einschalten nach dem Update ein kurzer, überspringbarer Hinweis „Was ist neu für dich“,
später nachholbar, Bestätigung wird dokumentiert. Das macht jedes Update **sichtbar nützlich** und erfüllt
nebenbei eine Pflicht. *Kritisch:* darf den Start nie blockieren; im Notfall wegklicken, Nachweis später.

### I. Gelerntes Ruhemuster pro Gerät [SW] ●

Aus Signalen, die das Gerät schon hat (Ein/Aus, Röntgenauslösung, Bedienung, Netzstatus, Uhrzeit), lernt
es sein eigenes Ruhemuster, erklärbar per Kaplan-Meier statt Blackbox-KI. Ehrlich als Übertragung von
bekanntem Stand der Technik pitchen (Ford, Windows). Optional Anbindung an den OP-Plan (HL7 SIU/FHIR
Schedule) als Ausbaustufe.

### J. Next Gen: Parken = Laden = Verbinden [NG] ●●

Park-Dock mit Strom und Daten (Ethernet über Ladekontakt), stromsparender Service-Controller, der auch bei
ausgeschaltetem Gerät Logs schickt und Updates vorbereitet, E-Ink-Statusanzeige außen („bereit“, „Update
heute Nacht“), Echtzeituhr mit Pufferbatterie für TLS, Instant-On statt Kaltstart. Einstecken gilt als
Zustimmung, wie beim iPhone über Nacht. Für den Pitch eine Folie „So sieht es in der nächsten
Generation aus“.

### K. Flottenzwilling für die Medizintechnik [SW] ●●

Ein Dashboard über alle C-Bögen eines Hauses: Verbindungsquote als KPI, letzte Logs, wartende Updates,
Ampel, nächstes Fenster, Geräte mit offenem Störfall. Daraus wird später Predictive Maintenance, aber
erst, wenn genug Geräte verbunden sind. Erst Quote, dann KI.

### Bewusst verworfen oder abgeschwächt

- **Eigenes LTE/5G-Modem als Standard:** umgeht aus IT-Sicht den Perimeter; höchstens Opt-in für
  Notfall-Logs in der Next Gen. (03)
- **Peer-to-Peer-Updates zwischen C-Bögen:** widerspricht der Netzsegmentierung, schwer zu begründen. (03)
- **Gamification für MTR (Punkte, Badges):** Die Bediener besitzen das Gerät nicht und wechseln; Anreiz
  muss im Service-Erlebnis liegen, nicht in Punkten. (01)
- **KI-Funktionen per Update in die Bestandsflotte:** wesentliche Änderung bei Legacy-Geräten, AI Act ab
  2028 für Medizinprodukte. Next-Gen-Thema. (02)
- **Logs in der Cloud nachträglich anonymisieren:** Datensparsamkeit verlangt, Patientendaten gar nicht
  erst zu senden; Allowlist statt Filter. (02, 05)

## 5. Empfehlung für den Hackathon

**Konzept „Service first – erst Hilfe, dann Updates“** aus drei Bausteinen, die zusammen eine Geschichte
erzählen:

1. **Hilfe-Knopf mit Diagnosepaket und QR-Brücke** (A + B): der Moment, in dem Bediener freiwillig
   verbinden, und der Hauptschmerz laut Siemens.
2. **„Gute Nacht“-Fenster mit Update-Ampel** (C + E + I): Updates nur grün und nur beim Parken/Ausschalten,
   alles andere sichtbar geplant, Garantie „beim Einschalten bereit“.
3. **Flotten-Cockpit mit Klinik-Policy und Compliance-Nachweis** (F + G + K): gewinnt den Gatekeeper.

Plus eine Next-Gen-Folie (J). Das trifft beide Zielhorizonte aus dem Interview: kleine Software-Änderungen
für die installierte Basis, Impulse für die nächste Gerätegeneration.

**Pitch-Bild:** „Gatelink für den OP“ – jedes Andocken an Netz und Strom ist eine Bodenzeit, in der Daten
rausgehen und Software reinkommt, ohne dass die Crew etwas tun muss.

**Prototyp:** Bauplan, Stack (Python, FastAPI, eine HTML-Seite mit Server-Sent Events, SQLite, pytest,
Ed25519, qrcode), Stundenplan für ca. 20 h und das 3-Minuten-Demo-Skript stehen in
[05-technik-prototyp.md](05-technik-prototyp.md). Kernlogik mit Tests: „nie Update im Zustand *im
Einsatz*“, „rotes Update nie automatisch“, „Diagnosepaket enthält nur Allowlist-Felder“. Nur synthetische
Logs. Im UI sichtbar: Demonstrator, kein Medizinprodukt.

## 6. Fragen an die Siemens-Mentoren (vor dem Bauen klären)

1. Wie hoch ist die Verbindungsquote mobiler C-Bögen heute, und woran scheitert es meistens (IT-Freigabe,
   kein Netz am Parkplatz, Bediener)?
2. Was waren die früheren „rein technischen“ Versuche konkret, und warum sind sie gescheitert?
3. Haben die Bestandsgeräte A/B-Partitionen, und kann Software das Herunterfahren verzögern?
4. Hat das Gerät ausgeschaltet noch Strom (Akku, USV) oder ist es komplett aus?
5. Welche Signale liefert das Gerät heute (Netzstatus, Akku, Nutzung, Fehlercodes), und wie groß sind
   Update-Pakete typischerweise?
6. Was gilt bei Siemens als „kleine Software-Änderung“ für Legacy-Geräte?
7. Welche Updates lösen heute eine Konstanz- oder Teilabnahmeprüfung aus, und wie wird das gehandhabt?
8. Wie sieht der Hotline-Prozess heute aus, wenn ein nicht verbundenes Gerät ausfällt?

Interviewfragen für echte MTR/OP-Pflege stehen in [01-workflow-nutzer.md](01-workflow-nutzer.md).

## 7. Vor dem Pitch gegenprüfen

- Paragraphen der neuen MPBetreibV (§ 4 Abs. 3, § 7 Abs. 2) im Wortlaut (bisher Sekundärquelle).
- § 115 Abs. 4 StrlSchV und die Praxis bei Software-Updates von Röntgeneinrichtungen in Kliniken.
- MDCG 2020-3 (Chart C) zu Software-Änderungen an Legacy-Geräten.
- AI-Omnibus: Verordnungsnummer und Datum 02.08.2028 für Hochrisiko-Pflichten bei Medizinprodukten.
- Data Act: Zugangsrecht der Klinik und Access by Design ab 12.09.2026 im Wortlaut.
- B3S Krankenhaus Version und Datum; KHZG-Fördertatbestand 10.
- Bootzeit 175 s (GE OEC Elite) ist eine Herstellerangabe; eine Cios-Bootzeit haben wir nicht gefunden.
- Fountain-QR-Bibliotheken (Idee B) vor dem Bau ausprobieren.
