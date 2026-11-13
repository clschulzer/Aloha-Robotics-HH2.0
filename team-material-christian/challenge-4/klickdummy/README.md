# IA Klickdummy (Challenge 4)

Klickbarer Entwurf zur Synthese in [../synthese-nach-gespraech.md](../synthese-nach-gespraech.md):
Gerätepflege für mobile C-Bögen statt Kundenpflege. **Alle Daten sind erfunden** (Klinik, Geräte,
OP-Plan, Vertrag). Kein Produkt von Siemens Healthineers, kein Medizinprodukt.

Die Oberfläche gibt es auf Deutsch und Englisch, umschaltbar oben rechts.

Online: https://claude.ai/artifact/4t2Rdyioo6wiemHFhhuKAf (privat, über „Teilen“ freigeben).
Offline: `index.html` im Browser öffnen. Es wird nichts aus dem Netz geladen, die Schrift Open Sans
liegt unter `fonts/` (SIL Open Font License).

## Was man sieht

| Bereich | Inhalt | Vorbild |
|---|---|---|
| Heute | Sechs Ergebnisse aus der Synthese als Kennzahlen, „Du entscheidest“ je Rolle, Protokoll der Helfer | Goebel OS: Entscheiden-Karten, KI-Trupp |
| Planungstafel | Geräte oder Säle gegen Zeit, Tag und Woche, Updates, Wartung und Prüfungen auf einer Tafel, „Lücken füllen“, Fenster-Karte mit Begründung und fünf Schritten, Polytrauma-Alarm | Goebel OS: Plantafel, Lücken füllen, lila Vorschläge |
| Geräte und Akte | Flotte nach Dringlichkeit, Zwilling mit sechs Baugruppen, Prüfungen, Servicevertrag und Fristen, Nutzungsmuster, Logs, „Frag die Akte“ | PST: Anlagenakte, Wartungsverträge |
| Begleiter | Pixel-Figur je C-Bogen am Gerätedisplay, eine Bitte, sechs Bedürfnisse, Tagebuch, Aufwecken, Teamraum, Pflege-Serie je Abteilung ohne Namen | Tamagotchi-Idee (8, 18, 22) |
| Roboter | C-ARMAGOTCHI in Aktion: Karte, Umgebungsscan, Wartungsablauf in zwölf Schritten, Not-Halt, Steuerung von Hand, Hindernis und Verbindungsverlust zum Ausprobieren | Christians Wunsch vom 13.11. |
| Leitstand | Gesamtübersicht für die Planung: Karte mit Geräten, Roboter und Personen im Dienst, Aufträge für Menschen, wer gefragt wird und wer nichts sieht | Fahrdienst-Leitstand |
| Aufträge | In der Ansicht „Person am Gerät“ erscheint ein Auftrag wie eine Fahrt: annehmen oder ablehnen. Nur wer im Dienst und frei ist, sieht ihn | Fahrdienst-App |
| Helfer und Regeln | Lotse, Bote, Wächter, Dolmetscher und die festen Leitplanken | Synthese, Abschnitt 5 |

Unten läuft eine Drehbuch-Leiste mit sechs Szenen (Pitch) oder 13 Szenen (Vertiefung). „Demo zurücksetzen“ leert den Zustand
(liegt im Browser unter `ia-klickdummy-v5`).

## Aufbau

- `planner.js`: Fenstersuche und Sicherheitsregeln als reine Funktionen (kein Start ohne Freigabe und
  ohne „Umgebung frei“, kein Fern-Start bei Armbewegung, kein Fenster über einem Eingriff, höchstens
  zwei Geräte je Nacht, kein Vorschlag bei dünner Datenlage). Grenzwerte sind als [Annahme] markiert.
- `data.js`: die erfundene Welt (acht C-Bögen, eine Woche OP-Belegung nur mit Saal und Zeit).
- `app.js`, `index.html`: Oberfläche ohne Framework und ohne Build-Schritt. Jeder Text steht als
  `L(deutsch, englisch)` im Code.
- `i18n.js`: Englisch für die Texte aus `data.js` und `planner.js`.

## Roboter, Aufträge und Leitstand

- Grundriss, Abstände, Tempo, Personen und Dienste sind erfunden und als Annahme gekennzeichnet.
- Der Roboter fährt nur in Fluren, nie in einen OP-Saal. Er startet kein Update selbst. Not-Halt darf
  jede Rolle drücken, freigeben und von Hand steuern nur Medizinphysik und IT-Abteilung. Solange er
  angehalten ist, meldet er nie „Umgebung frei“. Not-Halt und Funkabriss ziehen eine schon gegebene
  Meldung zurück, ein Start ist dann erst nach einer neuen Meldung möglich. Solange er am Gerät
  eingesteckt ist, lässt er sich nicht von Hand wegfahren. Bei einem Alarm fährt er an die Wand
  und wartet auf die Freigabe.
- Aufträge entstehen, wenn der Roboter nicht weiterkommt, ein Gerät sich nicht zurückmeldet oder ein
  Update Aufsicht braucht. Gefragt wird immer nur eine Person, die nächste zuerst, und nur wer im
  Dienst und laut Plan frei ist. Ablehnen hat keine Folgen. Aufsicht bei einem Update mit
  Armbewegung geht nur an eingewiesene Funktionen (Annahme: MTR und Medizintechnik) und durchläuft
  dieselbe Startprüfung wie ein Fern-Start. Der Rufdienst wird zuletzt gefragt.
- Personen erscheinen nur als Funktion und Schicht. Der Standort ist der eingeteilte Bereich, keine
  Ortung. Wer im Eingriff oder nicht im Dienst ist, erscheint im Leitstand nur als Zahl. Ist ein
  Auftrag erledigt, wird gelöscht, wer ihn hatte und wer abgelehnt hat. Vor einem echten Einsatz gehört das in eine Vereinbarung mit Personalrat und Datenschutz.

## Überblick, weitere Dienste und geführte Tour

- Der Klickdummy öffnet mit „Überblick“: Leitgedanke (das goldene Fenster als gemeinsame Währung,
  der Roboter als gemeinsame Hand), Helferkreis (der Lotse dirigiert sieben Helfer, vier Rollen
  entscheiden), sieben Hypothesen, Plattformkarte (neun Dienste gegen sechs Schritte, jede Zeile
  anklickbar), Menschen und ihre Ziele, erste Gedanken zur Architektur mit Schnittstellen, der
  Weg und Fragen an die Challenge-Owner. Hintergrund in `../plattform-konzept.md`,
  `../menschen-und-ziele.md`, `../architektur-skizze.md`.
- „Weitere Dienste“ hat je Dienst einen eigenen klickbaren Bereich: Wartung (Prüfung ins
  Update-Fenster legen), Servicetermin (Vorab-Check, die Klinik hakt drei Punkte ab, erst dann
  kann der Techniker zusagen), Lernen, richtiger Ort, Nachweise, Hersteller, Gerätetypen. Nichts
  davon ist gebaut, alles trägt „Ausblick“, Fälle und Inhalte sind erfunden.
- In der Roboter-Ansicht steht eine erfundene Nachtschicht mit den Fähigkeiten, die dieselbe Hand
  später haben kann. Geräte bewegen steht dort als Vision, die Regel „bewegt keinen C-Bogen“
  bleibt bestehen. Unter „Helfer und Regeln“ stehen die neuen Helfer Empfang, Coach, Chronist und
  Lagerist und die drei Stufen der Selbstständigkeit. Der Helferkreis steht auch im Cockpit
  „Heute“.
- Zwei Touren: „3-Minuten-Pitch starten“ setzt die Demo zurück und führt durch sechs Szenen mit
  Sprechtext und Zeitbudget (Summe 180 Sekunden, per Test geprüft). „Vertiefung starten“ blendet
  zu allen 13 Szenen einen Sprechtext ein und lässt alles frei klickbar. Die Leiste unten
  wechselt zwischen beiden. Drehbuch in `../pitch-und-demo-konzept.md`.

## Prüfen

```bash
node --test challenges/04-invisible-connectivity/klickdummy/planner.test.cjs   # 15 Regeltests
node challenges/04-invisible-connectivity/klickdummy/tools/check.mjs           # Drehbuch im Browser, Screenshots
```

`tools/check.mjs` braucht Playwright, spielt das Drehbuch auf Deutsch und Englisch durch (inklusive Alarm und Fehlschlag),
meldet deutsche Wörter auf englischen Seiten,
prüft Zustände, Konsolenfehler und seitliches Scrollen bei 1440 und 400 Pixeln und legt Screenshots ab.

## Entscheidungen aus dem Fragebogen

Christian hat den Fragebogen „Fragen Klickdummy IA“ am 13.11.2026 beantwortet. Umgesetzt sind: Name IA,
Start aus Sicht der Medizinphysik, helle Plattform mit dunklem Gerätedisplay, benannte Helfer, Zeilen
umschaltbar zwischen Geräten und Sälen, Tag und Woche, lila Vorschläge mit Freigabe durch einen
Menschen, Alarm-Knopf, Akte mit Zwilling als Linienzeichnung, Servicevertrag mit Fristen, Pixel-Figur
mit sechs Bedürfnissen, die matt wird und einschläft, aber nicht stirbt, Pflege-Serie je Abteilung und
der Roboter als eigene Zeile mit Live-Meldung.

## English summary

Clickable design dummy for Challenge 4: device care for mobile C-arms. **All data is invented.** Not a
Siemens Healthineers product, not a medical device. The interface is available in German and English
(switch at the top right). Open `index.html` in a browser, nothing is loaded from the network.
Screens: Today, Planning board (devices or rooms against time, “Fill the gaps”, golden windows,
polytrauma alarm), Devices and device file (digital twin, checks, service contract, logs), Companion
(pixel companion per C-arm), Robot (map, surroundings scan, maintenance sequence, remote control), Control room
with job offers for people nearby, and Helpers and rules. The safety rules live in `planner.js` and are
covered by 15 tests.

## Screenshots

![Planungstafel nach „Lücken füllen“](screenshots/04-tafel-luecken-gefuellt.png)
![Roboter meldet bereit, Start aus der Ferne](screenshots/06-roboter-bereit.png)
![Begleiter mit einer Bitte](screenshots/09-begleiter-cora-bitte.png)
![Geräteakte mit Zwilling](screenshots/11-akte-cio.png)
![Planning board by room, English](screenshots/en-04-board-rooms.png)
![Companion, English](screenshots/en-02-companion-weak.png)
![Roboter meldet Umgebung frei](screenshots/25-roboter-umgebung-frei.png)
![Leitstand mit Aufträgen](screenshots/27-leitstand-voll.png)
![Auftrag für die Person am Gerät](screenshots/23-auftrag-angebot.png)
![Überblick für die Challenge-Owner](screenshots/00-ueberblick.png)
![Helferkreis im Cockpit](screenshots/39-heute-kreis.png)
![Ausblick: Vorab-Check für den Servicetermin](screenshots/31-servicetermin.png)
![Ausblick: Nachtschicht des Roboters](screenshots/38-nachtschicht.png)
![Ausblick: Nachweise](screenshots/35-nachweis.png)
