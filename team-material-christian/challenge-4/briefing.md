# Challenge 4 – Briefing für den Hackathon-Start

Stand 12.11.2026, 21:30 Uhr (Siemens-Pitch, Bewertung nach dem Pitch und Gespräch mit dem Challenge-Geber ergänzt). Kurzfassung aller Recherchen für Tag 1. Details und Quellen in
[ideen-vergleich.md](ideen-vergleich.md), [research/](research/00-synthese.md),
[personas/](personas/personas.md), im [Interview](interview-siemens-healthineers.md) und in den
[Pitch-Notizen](pitch-notizen-siemens-healthineers.md).
Mit [A] markierte Punkte sind Annahmen und vor dem Pitch zu prüfen.

## Die Challenge in einem Satz

Mobile C-Bögen sind fast nie verbunden, weil sie ausgeschaltet zwischen Sälen wandern und im OP kein
Netz haben. Gesucht sind Konzepte, mit denen Bediener **freiwillig** verbinden und Updates und Logs
nebenbei laufen. Challenge-Geber: Dr. Sebastian Glawion und Dr. Christoph Luckner, Siemens Healthineers.

**Unsere Rahmung:** nicht „unsichtbare Konnektivität“, sondern **„unsichtbarer Service“: erst Hilfe,
dann Updates.** Daten warten geduldig auf den nächsten Kontakt.

## Top-Ideen vor dem Pitch (aus den Ideen 1 bis 14, Skala 1–5)

| Rang | Idee | Punkte | Rolle im Pitch |
|---|---|---:|---|
| 1 | **Hilfe-Knopf mit QR-Brücke**: „Problem melden“ schnürt ein Diagnosepaket ohne Patientendaten; ohne Netz geht es als QR-Folge übers Handy raus | 4,55 | Kern und Eröffnung |
| 2 | **Flotten-Cockpit mit Compliance-Dividende**: Klinik-IT bekommt Nachweise für NIS2 und MPBetreibV geschenkt | 4,15 | Business Case, gewinnt den Gatekeeper |
| 3 | **„Cio“, der C-Bogen mit Gefühl**: Figur zeigt Hunger auf Verbindung und Updates | 3,90 | Gesicht von Idee 1 und 2 (MTR-Test nötig) |
| 4 | **Flotten-Mission mit Freischaltung**: gemeinsames Klinik-Ziel statt Rangliste | 3,80 | Schicht im Cockpit |
| 5 | **„Gute Nacht, C-Bogen“**: Ausschalten ist das Update-Fenster, mit Update-Ampel und Rollback | 3,70 | zweiter Akt, Höhepunkt der Demo |

**Next Gen (eigene Matrix):** Idee 10 „Nie ganz aus“ (4,25), Dock und Handy-Brücke (je 4,00) auf eine
Ausblick-Folie. Quantum-Scheduling weglassen.

**Empfehlung:** Idee 1 als Kern, Idee 2 als zweiter Akt, Idee 4 als Business Case, Cio als
durchgehende Figur. Alles reine Software für die Bestandsflotte. Pitch-Bild: **„Gatelink für den OP“**
(jedes Andocken ist eine Bodenzeit).

## Aktueller Stand nach dem Gespräch mit dem Challenge-Geber (13.11., 01:15 Uhr)

Ausführlich in [synthese-nach-gespraech.md](synthese-nach-gespraech.md), Aussagen im
[Faktenblatt](gespraech-challenge-geber.md). Dieser Abschnitt geht allem Folgenden vor.

- **Was der Ansatz erreichen soll (Ziel, keine Zusage):** Jeder C-Bogen ist aktuell, ohne dass ein Eingriff wartet, ohne
  dass jemand telefoniert und ohne dass die Person am Gerät etwas riskiert. Fehlschläge fallen sofort
  auf, Siemens bekommt die Logs. Die KI bekommt diese Ergebnisse als Ziel und feste Leitplanken, den
  Weg wählt sie selbst [Annahme, unser Entwurf].
- **Das Problem (laut Challenge-Geber, mündlich):** nicht der Download, sondern die Installation im
  Ruhezustand. Geladen wird schon in Teilen. Die Installation dauert rund 120 Minuten. In der
  Standzeit ist das Gerät aus und ohne Strom, im Flur fehlt oft die Steckdose. Nach OP-Beginn ist
  nichts im Hintergrund erlaubt. Rund 2 Prozent der Updates enden mit einem unbrauchbaren Gerät.
- **Start des Updates:** Ein Mensch muss bestätigen, automatisch ist nicht erlaubt. Bei den häufigen
  Updates (Sicherheits-Patches, Software des eingebauten Rechners) geht das oft aus der Ferne. Bei den
  selteneren Updates mit Armbewegung muss jemand dabeibleiben (Nachtrag von Christian).
- **Drei Rollen, keine fühlt sich zuständig:** Person am Gerät („X-ray nurse“), Medizinphysik bzw.
  Medizintechnik, IT-Abteilung (sieht alles in teamplay Fleet, ist aber nicht vor Ort). In Christians
  Wiedergabe: „Nimm du ihn, ich hab ihn sicher.“
- **Leitmotiv „IA, Invisible Autonomization“:** Alle reden über AI, wir über IA. Gefeiert werden die
  Menschen, die in der Klinik unsichtbar Wichtiges tun. Plattform und Roboter nehmen ihnen Laufwege
  und Telefonate ab, nicht die Entscheidung.
- **Das Produkt ist die Plattform:** Fenster-Lotse mit KI-gestütztem Scheduling (21), Daten vom Gerät,
  Rollen des Personals, Anbindung an OP-Planung und teamplay Fleet, dazu der Rückmelde-Wächter (19).
  Tamagotchi als Persönlichkeit.
- **KI-Orchestrierung über der Plattform:** IT und Medizinphysik sollen die Flotte aktuell halten
  [Annahme], sind aber nicht vor Ort. Die Person am Gerät ist vor Ort, will aber nichts falsch machen.
  Die Orchestrierung bringt den beiden die Lage vor Ort und nimmt der Person am Gerät den Druck:
  Beziehung aufbauen, anleiten, nur zum passenden Zeitpunkt fragen. Die KI schlägt vor, Menschen
  entscheiden, Sicherheitsregeln sind fest.
- **KI-gestütztes Scheduling:** sagt je Gerät vorher, wie wahrscheinlich es in den nächsten zwei
  Stunden gebraucht wird, schlägt das Fenster mit Begründung und Ersatzgerät vor und plant bei Alarm
  um [Annahme, unser Entwurf]. Belegung und Sicherheitsregeln bleiben feste Bedingungen.
- **Roboter „C-ARMAGOTCHI“ (Idee 23) ist die Schau, bewusst avantgardistisch, und hat eine echte
  Aufgabe:** Er fährt zum geparkten Gerät, bringt Strom und Update-Paket, steckt ein (auch das
  Netzwerkkabel), schaltet ein, prüft die Umgebung, meldet „bereit“ und bewacht das Update. Ein Mensch bestätigt aus
  der Ferne. Aus den anderen Ideen übernimmt er vor allem Update-Tank, Wächter und Abendrunde.
- **Begleiter (22,** akkubetriebener Kleinrechner am Gerät, Favorit des Challenge-Gebers**):** dieselbe
  Hand ohne Räder, für Häuser ohne Roboter.
- **Überholt:** „Zwei Stunden werden ein Neustart“, Vorladen im OP (15) und gespiegeltes System (17) für
  den Bestand.
- **Offen für den 13.11.:** Wie genau geht der Start aus der Ferne, und wer darf ihn auslösen? Darf das
  Gerät zwei Stunden unbeaufsichtigt am Strom bleiben? Welche Gründe nennt die Siemens-Entwicklung
  gegen den Begleiter, und nimmt das Gerät ein Paket per Kabel von außen an?

## Bewertung nach dem Pitch (12.11. spät, vor dem Gespräch, in Teilen überholt)

Ausführlich in [bewertung-nach-pitch.md](bewertung-nach-pitch.md): alle 21 Ideen gegen das Transkript,
Synthese, Fragenliste für das Training Center. Die Tabelle „Top-Ideen“ oben ist der Stand vor dem Pitch.

- **Der Pitch spielte keinen Störfall, sondern ein Update**, das nicht in die Lücke passt und beim
  Abbruch das Gerät lahmlegt. Der Hilfe-Knopf (bisher Rang 1) löst das nicht.
- **Neuer Kern (Vorschlag):** „Zwei Stunden werden ein Neustart“. Vorladen in Etappen (Idee 15),
  gespiegeltes System (17) und Aktivieren beim Ausschalten (2). Die IT setzt im Cockpit (4) eine Frist,
  statt anzurufen. Einsatz-Planung (16) und Geräte-Patenschaft (18) sind Bausteine. Ideen 15 bis 18
  stammen aus Christians Brainstorming nach dem Pitch. Dazu vom Team: Rückmelde-Wächter (19) als
  Baustein und Wechsel-Rechner (20) als Avantgarde-Ausblick.
- **Leitbegriff „goldenes Fenster“:** Drei Rollen sind in der Theorie zuständig (welche, ist noch
  Annahme: Person am Gerät, Medizintechnik, Klinik-IT), in der Praxis vermutlich keine [Annahme].
  Der Fenster-Lotse (Idee 21, KI-Orchestrator) findet das Fenster und fragt jede Rolle genau eine Sache.
  Er führt die Schicht „Fenster finden“ (bisher „Planen“). Die KI formuliert und versteht, sie schaltet nie selbst.
- **Hilfe-Knopf wird zweiter Akt** (Logs, Vorabklärung), Cio höchstens kleines Statusbild.
- **Demo:** die Szene von Siemens noch einmal spielen, diesmal mit gutem Ende.
- **Steht und fällt mit drei Antworten:** Netz im OP? Was am Update dauert so lang? Platz für ein
  zweites System? Die drei dringendsten Fragen und die Shortlist stehen in Abschnitt 5 der Bewertung. Entscheidung über den Kern erst nach dem Training Center am 13.11.

## Neu aus dem Siemens-Pitch (12.11. abends)

Details und Transkript in den [Pitch-Notizen](pitch-notizen-siemens-healthineers.md).

- **Bediener ist die OP-Pflege**, nicht die MTR: Gerät holen, abdecken, Patient lagern, Instrumente,
  RIS-Daten ziehen, Bilder machen. Demo-Persona daher Jonas (OTA) bzw. OP-Pflege vorn, Sabine dahinter.
- **Szenario des Pitches:** IT ruft wegen Virus an, Update dauert 2 h, nächste OP in 2 h, ein Knopf,
  Update bricht ab. Genau das sollte unsere Demo J2 (Update im Aus-Zustand, Rollback) auflösen.
- **Geparkt = aus = offline** im Flur, von Siemens bestätigt. „Dead simple“, „no time to check
  anything in advance“.
- **13.11.:** Einführung im Siemens Training Center (200 m entfernt), nachmittags Hands-on-Slots buchen.
  Fragenliste dafür: [bewertung-nach-pitch.md](bewertung-nach-pitch.md), Abschnitt 5.

## Die stärksten Belege

- **Interview:** Frühere Versuche waren rein technisch und haben Nutzergewohnheiten ignoriert.
  Hauptschmerz ist die fehlende **Remote-Vorabklärung** (mehr Vor-Ort-Zeit, Servicekosten, Downtime).
  Ziel: **kleine reine Software-Änderungen** für die Bestandsflotte, plus Impulse für die nächste Generation.
- Logs sind klein (MB), Updates groß (GB): **Logs zuerst**.
- Bediener haben keinen eigenen Grund zu verbinden. Entscheider ist die **Klinik-IT** (ca. 7 IT-Vollkräfte
  pro Standort), Nutzen fällt beim Hersteller an.
- Im OP ist das Gerät oft physikalisch offline (Bleiwände, keine Access Points).
- **§ 115 Abs. 4 StrlSchV:** Updates der Bildkette brauchen eine Prüfung. Also Updates klassifizieren
  (grün automatisch, gelb/rot sichtbar geplant).
- **MPBetreibV (seit 20.02.2025)** zählt Sicherheitsupdates zur Instandhaltung, **NIS2** gilt seit
  06.12.2025: Updates sind Compliance-Pflicht der Klinik, der stärkste Anreiz.
- Legacy-Geräte (Art. 120 MDR, MDCG 2020-3): Service-Layer ändern, klinische Funktion nicht anfassen.
- Show HN „ShadowCat“: QR-Dateitransfer im Browser, fast deckungsgleich mit der QR-Brücke (Lizenz prüfen).
- **Erlangen 2025:** Siemens-Challenge „Smart Authentification“ (Service offline + remote), Team TapID
  wurde 3. Siemens sitzt 2026 wieder in der Jury (Dr. Lars Hofmann).

## Für die Demo: Personas und Journeys

- **Sabine Hoffmann, 44** (P1), MTR im Zentral-OP: „Wenn das Ding morgens um sieben eine Frage stellt,
  ist die Antwort Nein.“
- **Jonas Becker, 27** (P2), OTA im Nachtdienst: „Einschalten und los.“
- **Murat Yilmaz, 38** (P4), Medizintechnik, und **Andrea Krüger, 47** (P5), IT-Sicherheit mit Veto.
- **Lena Wagner, 34** (P7), Remote-Service bei Siemens: „Logs vor dem Rückruf.“

**Drehbuch (≈ 3 min):**
1. **J1 Störfall:** Cio meldet „Mir geht's nicht gut“. Sabine tippt, kein Netz, QR-Folge. Ein
   Jury-Handy filmt sie, Lena sieht den Fall mit Diagnose im Dashboard vor dem Anruf. Einmaliger Opt-in.
2. **J2 Update:** Sabine schaltet aus, Cio fragt einmal. Jonas zieht nachts mitten im Update den Stecker,
   das Gerät startet sofort in der alten Version. Manipuliertes Paket wird abgelehnt.
3. **J3 Flotte:** Cockpit, Verbindungsquote 18 % → 70 % (simuliert, gekennzeichnet), Audit-Nachweis.
4. Ausblick-Folie Next Gen.

Bauplan und Stack (Python, FastAPI, SSE, SQLite, Ed25519, qrcode) in
[research/05-technik-prototyp.md](research/05-technik-prototyp.md). Kernlogik testen: nie Update „im
Einsatz“, rotes Update nie automatisch, Diagnosepaket nur Allowlist-Felder. Plan B für den QR-Scan
(Video). Pflicht im UI: „Demonstrator, kein Medizinprodukt, synthetische Logs.“

## Wie die Owner bewerten (Lesart)

Zwei Produkt- und Technikleute aus der Röntgenbildgebung, die eine Kennzahl bewegen wollen: Anteil
verbundener Geräte in der Bestandsflotte. Fragen werden sein: Passt es zu SRS? Ist es eine kleine
Software-Änderung? Stört es den OP? Reine Netzwerk- oder Security-Architektur gilt als „haben wir schon“.
Sprache des Service-Geschäfts nutzen: Downtime, Vor-Ort-Zeit, Servicekosten.

## Offene Fragen an die Mentoren (Tag 1, früh)

1. Wie hoch ist die Verbindungsquote heute, und woran scheitert es meist (IT, Netz, Bediener)?
2. Was waren die früheren „rein technischen“ Versuche, und warum sind sie gescheitert?
3. Haben Bestandsgeräte A/B-Speicher, und kann Software das Herunterfahren verzögern? Strom im Aus-Zustand?
4. Wie läuft die Hotline heute bei einem nicht verbundenen Gerät?
5. Was gilt als „kleine Software-Änderung“ für Legacy-Geräte?
6. Welche Updates lösen eine Konstanzprüfung aus?
7. Abgrenzung zu teamplay Fleet? Darf die Lösung SRS-Schnittstellen voraussetzen?
8. Was hat TapID 2025 gebaut, und wurde es weiterverfolgt? Jurykriterien 2026?
9. Wie sind die Geräte heute verbunden (Ethernet, WLAN, wo, wer richtet es ein)? Details in [Pitch-Notizen](pitch-notizen-siemens-healthineers.md).
10. Welche alten Gerätegenerationen sind im Feld, und wie abwärtskompatibel muss das Konzept sein? (siehe Pitch-Notizen)

Danach die Gewichte in `ideen-vergleich.md` anpassen.
