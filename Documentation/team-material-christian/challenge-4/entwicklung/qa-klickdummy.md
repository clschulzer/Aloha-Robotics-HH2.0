# QA des Klickdummys (Challenge 4)

Stand: 13.11.2026, Klickdummy auf `main` (a2d7bb1). Geprüft mit Playwright in echten Durchläufen, DE und EN,
hell und dunkel, 1440 und 400 Pixel. Die 15 Regeltests (`planner.test.cjs`) und das Browser-Drehbuch
(`tools/check.mjs`) waren vorher und nachher grün.

## Ergebnis

Ein Befund war ein Blocker für den Pitch (B5, Bitte des Begleiters im Hellmodus unlesbar). Er ist behoben.
Vier Befunde sind mittel (B3, B4, B6, B7). Sie betreffen Drehbuch und Logik und bleiben beim
Klickdummy-Feinschliff, weil dort parallel gearbeitet wird.

| Befund | Status |
|---|---|
| B5 Bitte des Begleiters unlesbar (Blocker) | behoben in `index.html` |
| B1, B2, B8, B13, B15, B16 kleine Text- und README-Fehler | behoben |
| B3 Pitch-Szene 5 braucht drei Klicks, Pitch hat sieben statt höchstens sechs | offen, Entscheidung beim Feinschliff |
| B4 Wächter-Meldung nur über „Vorspulen“, steht nicht in der Pitch-Tabelle | offen, Drehbuch anpassen |
| B6 Leitstand zeigt „wird gefragt“ auch nach Ablehnung | offen, Logik |
| B7 Aufsicht „Erledigt“ startet Update ohne Freigabe-Prüfung, README verspricht mehr | offen, README oder Logik |
| B9 bis B12, B14, B17, B18 | offen, klein oder Idee |

## Befunde im Einzelnen

Geprüft und ok (bisher): Pitch-Tour 6 Szenen: Bildschirm/Kernsatz/Zeit stimmen mit Tabelle (25/30/25/35/30/35 = 180), Zurück/Weiter-Grenzen, Sprachwechsel und Reload mitten in der Tour halten Szene, Reset mitten in der Tour springt auf Szene 1, keine Konsolenfehler. Alle 9 Bereiche + 7 Dienste-Tabs DE/EN ohne Konsolenfehler.

### B1 (Klein) EN-Zeitform
Bereich: Überblick, Menschen und Ziele, Person am Gerät. DE "Sie war die Letzte am Gerät, wenn etwas schiefgeht." EN "She was the last one at the device when something goes wrong." (Zeitform springt). app.js:852. Vorschlag EN: "She is the last one at the device when something goes wrong." (klein und eindeutig)

### B2 (Klein) "Nie: Bestellt nie ..." / "Never: Never books"
Bereich: Helfer und Regeln, Neue Helfer. Label "Nie"/"Never" + Text "Bestellt nie einen Techniker.." / "Never books a technician..." = doppelte Verneinung/Wiederholung. app.js:1082 (nur Empfang). Vorschlag: DE "Bestellt einen Techniker nur mit Zusage der Klinik", EN "Books a technician only with the hospital’s consent". (klein und eindeutig)

### B3 (Mittel) Pitch-Szene 5: "einen Auftrag annehmen" braucht drei Klicks, Klickbudget "höchstens sechs" reißt
Schritte: "3-Minuten-Pitch starten", Szene 2 "Lücken füllen", Szene 3 freigeben + Roboter losschicken, Szene 4 "Start bestätigen", Szene 5 Leitstand.
Erwartet (Tabelle): Leitstand zeigt einen Auftrag, ein Klick "annehmen". Tatsächlich: Leitstand hat 0 offene Aufträge ("Im Moment muss kein Mensch etwas vor Ort tun"), Rolle ist noch Medizinphysik (nur Knopf "Aufsicht für Rudis Update anfragen"); erst anfragen, dann Rolle auf "Person am Gerät" wechseln, dann "Annehmen" = 3 Klicks. Gesamt im Pitch: Lücken füllen, freigeben, Roboter, Start, Anfragen, Rollenwechsel, Annehmen = 7 Klicks (Konzept: "Höchstens sechs Klicks"). Der Hinweis in der Leiste ("Als Person am Gerät annehmen oder ablehnen") nennt Anfragen und Rollenwechsel nicht. Beleg: b2.cjs (jobs [] , role mp in Szene 5).
Vorschlag: für den Pitch beim Betreten von Szene 5 (SCENES[9].go, app.js ca. Z. 202) den Auftrag anlegen und Rolle setzen, z. B. im PITCH-Modus `if (S.mode==='pitch' && !S.jobs.length) { jobNew('aufsicht','C-06'); }` und Rolle 'nurse'; Rolle zurück auf mp in Szene 6. Nicht klein/eindeutig (Designentscheidung).

### B4 (Mittel) Pitch-Szene 4: Update läuft nie von selbst zu Ende, Kernsatz "Wächter meldet, wenn das Gerät zurück ist" ohne Bild
Schritte: Pitch bis Szene 4, Start bestätigen, 120 s warten. Erwartet: Wächter-Meldung nach Update-Ende (Szene 4 hat 35 s). Tatsächlich: Status bleibt "läuft" (rob step 8), die Meldung kommt nur über den Knopf "Vorspulen: Gerät meldet sich zurück", der in der Konzept-Tabelle (Spalte Klick) nicht steht. Wer nur klickt wie in der Tabelle, zeigt den Wächter-Satz ohne Beleg; mit dem Knopf wird es Klick Nr. 8. Vorschlag: Konzept-Tabelle um "Vorspulen" ergänzen oder Hinweistext der Leiste in Szene 4 ("Dann Vorspulen klicken, der Wächter meldet das Ende"). Beleg: b2.cjs.

### B5 (Blocker für Pitch) Sprechblase des Begleiters im Hellmodus unlesbar (CSS-Klassenkollision `.say`)
Schritte: index.html im Hellmodus öffnen, "Begleiter" (oder Pitch Szene 1, Vertiefung Szene 2 und 7). Erwartet: Bitte des Geräts ("Ich bin matt und schlafe gleich ein ... Weckt mich jemand?") hell auf dunklem Gerätedisplay lesbar. Tatsächlich: Text rgb(230,230,230) auf Hintergrund rgb(255,243,191) (hellgelb), nahezu unsichtbar. Ursache: die Klasse `.say` der Sprechtext-Leiste (index.html:346, Hintergrund var(--gold-soft), Rahmen, Padding) greift auch auf die Blase im Gerät (app.js:527 `<div class="say">`), `.device .say` (index.html:257) setzt nur Schrift, Farbe kommt von `.device` (hell). Im Dunkelmodus ist es lesbar (dunkles Gold). Betrifft gerade die Eröffnungsszene des Pitch. Belege: bg_light.png, d7b.png, Computed Style per Playwright.
Vorschlag (klein und eindeutig, 1 Zeile):
alt (index.html:257): `.device .say{font-size:18px;line-height:1.4;max-width:30ch;text-wrap:balance}`
neu: `.device .say{display:block;background:none;border:0;padding:0;margin:0;font-size:18px;line-height:1.4;max-width:30ch;text-wrap:balance}`
(Die Roboter- und Auftragsansicht prüfen, ob `.say` dort ebenfalls im Gerät verwendet wird, siehe Roboter-Check.)

### B6 (Mittel) Leitstand: Tabelle "Wer wird gefragt" widerspricht dem Auftrag und den Regeln
Schritte: Leitstand, "Aufsicht für Rudis Update anfragen"; als "Person am Gerät" "Passt gerade nicht"; zurück als Medizinphysik, "Vorspulen: lehnt ab" (Rufdienst). Karte zeigt "niemand erreichbar / Im Moment kann niemand mit Einweisung gefragt werden".
Erwartet: Tabelle und Kennzahl "3 Personen im Dienst und frei, nur sie werden gefragt" passen dazu (Regel 2: immer nur eine Person; Aufsicht bei Armbewegung nur an Eingewiesene, OP-Pflege laut "Lernen"-Tab nein). Tatsächlich: alle drei Zeilen (auch die beiden, die abgelehnt haben, und OP-Pflege Spätdienst 1) stehen weiter auf "wird gefragt". Beleg: c4_alleabgelehnt.png. Ursache: app.js:797 nimmt nur staffState(p).s ('frei'/'job'), nicht offerTo(j). Vorschlag: Spalte "Anfragen" je Zeile aus offers() ableiten ("wird gefragt" nur für offerTo(j).k, sonst "frei, nicht gefragt"). Nicht klein (Logik).

### B7 (Mittel) Auftrag "Aufsicht" : "Erledigt" startet das Update ohne Fenster-Freigabe, Prüfung hart auf "ok" gesetzt
Schritte: Leitstand, "Aufsicht für Rudis Update anfragen" (Medizinphysik), Rolle "Person am Gerät", "Annehmen", "Erledigt".
Erwartet (README: "durchläuft dieselbe Startprüfung wie ein Fern-Start"; Regel 1/3: keine Freigabe, kein Start): Start nur mit freigegebenem Fenster der Medizinphysik, Umgebung frei, Paket geprüft. Tatsächlich: Rudi hat gar kein Fenster in der Planung (Status "offen/Techniker vor Ort"), trotzdem meldet die Demo sofort "Rudi: Update unter Aufsicht vor Ort gelaufen und zurückgemeldet. Version 4.2.1." Ursache: app.js:669-672 `P.canStart({ freigabe: true, umgebungFrei: true, paketGeprueft: true, ...})` sind Konstanten, geprüft werden nur imEinsatz und alarm (und nur zum Zeitpunkt jetzt, nicht über die 120 Minuten). Die Karte nennt "Raum leer, Tür zu", aber "Erledigt" ist ein einzelner Klick ohne Bestätigung dieser Punkte. Die Anfrage der Medizinphysik ist die einzige menschliche Freigabe.
Vorschlag: (a) README/Pitch ehrlich formulieren ("Anfrage der Medizinphysik gilt als Freigabe"), oder (b) in Karte zwei Häkchen "Raum leer", "Tür zu" vor "Erledigt" verlangen und im Fall Armbewegung ein freigegebenes Fenster voraussetzen. Beleg: c6.cjs.

### B8 (Klein) README nennt falschen localStorage-Schlüssel
README.md:27 "ia-klickdummy-v4", im Code app.js:9 `KEY = 'ia-klickdummy-v5'`. Wer den Zustand per DevTools löscht, sucht v4. Vorschlag (klein und eindeutig): README.md:27 alt `(liegt im Browser unter \`ia-klickdummy-v4\`)` neu `(liegt im Browser unter \`ia-klickdummy-v5\`)`. Auch Auftrag nennt v4.
Datenschutz (ok): localStorage enthält nur Zustandsfelder (plan, jobs, feed, rob ...), keine Namen, keine Patientendaten; erledigter Auftrag: by=null, no=[]. sessionStorage und Cookies leer.

### B9 (Klein) Planungstafel: Beschriftungen der 2-Stunden-Blöcke abgeschnitten
Schritte: Planungstafel, "Lücken füllen", Cios Fenster freigeben, Roboter schicken (Pitch Szene 2 bis 4), DE und EN, hell und dunkel.
Erwartet: Beschriftung lesbar. Tatsächlich: Block ist nur 72 px breit; "Goldenes Fenster" erscheint als "Goldenes Fe", EN "Golden win" (Zeile 17:00–19:00 ebenfalls knapp), "Roboter kommt", "Update läuft" schneiden ab; Eingriffsblöcke Schockraum/Notaufnahme (57 px): "Schockrau/Notaufnal", EN "Trauma r/Emergenc"; Roboterzeile "Strom, Paket, W". Belege: gf2_en.png, gf_light.png, dk_tafel.png. Datei: index.html:154 `.blk{... overflow:hidden;white-space:nowrap;text-overflow:ellipsis;display:flex ...}` (ellipsis greift im Flex-Container nicht, daher hartes Abschneiden); Texte app.js:284.
Vorschlag: für Fenster-Blöcke kürzere Beschriftung ("Fenster"/"Window") oder `button.blk{white-space:normal}` mit kleinerer Schrift; für busy-Blöcke `title` mit vollem Text ergänzen. Nicht ganz eindeutig (Design).

### B10 (Idee) Pflege-Serie: sortierte Balken sind faktisch eine Rangliste, widerspricht dem Text "Es gibt keine Rangliste"
Bereich Begleiter, "Pflege-Serie je Abteilung" (app.js:525): Unfallchirurgie 12, Orthopädie 9, Neurochirurgie 7, Notaufnahme 4, absteigend sortiert. Dazu passt nicht: Cio (Unfallchirurgie) steht seit Tagen ohne Strom im Flur ("Logs vor 9 Tagen"), die Abteilung hat aber "12 Abende in Folge eingesteckt". Vorschlag: alphabetisch sortieren oder Zahlen weglassen; Unfallchirurgie auf kleinere Zahl setzen oder Text "Serie zählt nur Geräte im Saal". Die Jury könnte nach Leistungsbezug (Abteilungen im Vergleich) fragen.

### B11 (Klein) Tastatur: Fokus geht nach jeder Aktion verloren
Schritte: Mit Tab auf "Planungstafel" (oder "Lücken füllen", "English"), Enter/Leertaste. Erwartet: Fokus bleibt am Knopf bzw. an seinem Nachfolger. Tatsächlich: `document.activeElement` ist danach BODY, weil render() das DOM neu schreibt (app.js:1186-1191 Klick-Handler); Tastaturnutzer müssen jedes Mal von vorn tabben. Sichtbarer Fokusring ist vorhanden (2 px orange, ok). Belege: f1.cjs, f2.cjs.
Vorschlag (klein, aber 3-4 Zeilen): im Handler vor `fn(...); render();` `const k='[data-act="'+el.dataset.act+'"]'+(el.dataset.a!=null?'[data-a="'+el.dataset.a+'"]':'')`, nach render `const n=document.querySelector(k); if(n&&document.activeElement===document.body) n.focus({preventScroll:true});`. Geräte-Zeilen `tr[data-act]` sind per Tab fokussierbar, haben aber keine role="button" (Idee).

### B12 (Klein) Einzahl nicht behandelt: "Alle 1 freigeben", "1 goldene Fenster warten", "1 golden windows", "Release all 1"
Schritte: Planungstafel, "Lücken füllen", bei Cio, Bogdan und Otto "Ablehnen" (bleibt Cora als einziger Vorschlag). Erwartet: "Alle freigeben" bzw. "1 goldenes Fenster wartet" / "1 golden window". Tatsächlich: Knopf "Alle 1 freigeben" (EN "Release all 1"), Banner "1 goldene Fenster, 5 Geräte ohne Vorschlag" (EN "1 golden windows"), Heute-Karte "1 goldene Fenster warten auf deine Freigabe". Dateien: app.js:239 (Karte Heute), app.js:311 (Banner), Knopf `relall` (Label mit Anzahl, Suche "Alle ${"), app.js:107 (Protokolleintrag "1 goldene Fenster gefunden", nur bei genau 1 Treffer). Ähnlich möglich bei "1 Geräte ohne Vorschlag". Vorschlag: kleine Hilfsfunktion `const pl = (n, one, many) => n === 1 ? one : many` für diese 4 Stellen. Beleg: g3.cjs.

Geprüft und ok (Sicherheitsregeln, UI): Ohne Freigabe (Status Vorschlag/geplant) gibt es keinen Start-Knopf; Start nur bei Status "bereit" mit "Umgebung frei" (Roboter step 7); Not-Halt zieht "Umgebung frei" zurück (Fenster wieder "unterwegs", Roboter steht, Start-Knopf weg), neuer Start erst nach neuer Meldung; Funkabriss ebenso; Hindernis hält Roboter, Banner "Solange er steht, ist kein Start möglich"; Handsteuerung nur in Fluren (Toast "Dort ist kein Flur"), bei eingestecktem Roboter gesperrt, Freigeben/Steuern für "Person am Gerät" deaktiviert; Alarm: bereites Fenster wird gesperrt, neu geplant (17:00 auf 20:00), Start-Knopf weg; Alarm bei laufendem Update bricht nicht ab; Alarm-Banner und Wächter-Banner bleiben über alle Bereiche und nach Reload bis "Verstanden/Bestätigen"; Rudi (Armbewegung) hat keinen Fern-Start; Reset und Moduswechsel mitten in Mission/Scan räumen sauber auf; Reload mitten in Scan, Mission, laufendem Update und nach Fehlschlag stellt den Zustand wieder her. Keine Konsolenfehler bei all diesen Randfällen.

### B13 (Klein) README: "Drehbuch-Leiste mit neun Szenen" veraltet
README.md:26: "Unten läuft eine Drehbuch-Leiste mit neun Szenen." Tatsächlich 6 Pitch-Szenen und 13 Szenen in der Vertiefung (README selbst nennt weiter unten 13). Vorschlag (klein und eindeutig): alt "mit neun Szenen" neu "mit sechs (Pitch) bzw. 13 Szenen (Vertiefung)".

### B14 (Klein) Uhr steht auf 16:40, Meldungen tragen 16:41/16:42
Schritte: Alarm auslösen oder Auftrag anlegen. Kopfzeile "Mi 18.11.2026, 16:40" und Gerätedisplay "16:40" bleiben, Alarm-Banner "Polytrauma-Alarm 16:41", Protokoll 16:41/16:42, Nachweis "Stand ... 16:40" mit Einträgen 16:42. Vorschlag: Alarm und Einträge auf 16:40 setzen oder die Kopfzeile "ca. 16:40" nennen. Fachleute sehen den Sprung.

### B15 (Klein) Hersteller-Tab: Aussage widerspricht den Daten
Dienste, Tab "Hersteller", "Nutzungsmuster" freigeben: "An Dienstagabenden wurde in acht Wochen kein Gerät gebraucht." (app.js:1031). data.js: Otto (Notaufnahme) hat abends Nutzungsanteil 0,5 (risk([0.5,0.5,0.5], ...)), also wurde ein Gerät gebraucht. Vorschlag: "An Dienstagabenden war die Mehrzahl der Geräte in acht Wochen nie gebraucht" oder "fast kein Gerät" / EN "almost no device".

### B16 (Klein) Pitch Szene 3: Sprechtext nennt "Prüfung", Karte zeigt keine
Sprechtext (DE) "Ersatzgerät und Prüfung liegen schon dabei", EN "the replacement and the check are already attached". Die Fenster-Karte für Cio zeigt Ersatzgerät, Restrisiko, Standort, Frist, aber keine Prüfung (Konstanzprüfung erscheint nur bei Bogdan nach "Zusammenlegen"). Jury-Frage möglich. Vorschlag: "Ersatzgerät und Restrisiko liegen schon dabei." (app.js:212, Pitch-Szene 3; klein und eindeutig) EN: "The replacement device and the residual risk are already attached."

### B17 (Klein) Vertiefung Szene 7: Hinweis in der Leiste passt nur nach vorherigen Klicks
Vertiefung, ohne vorher zu füllen/freigeben direkt zu Szene 7: Leiste sagt "Cora bittet nur darum, eingesteckt zu bleiben", Gerät zeigt "Ich habe Hunger auf ein Update. Sobald der Lotse ein Fenster findet, melde ich mich." Erst nach Lücken füllen, Freigabe der Szene 3/4 kommt die Bitte "Heute bitte eingesteckt lassen" (Beleg: d7.png, c1.cjs). Die Vertiefung ist frei klickbar, daher Hinweistext ergänzen ("nach der Freigabe") oder Szene 7 setzt Cora auf geplant.

### B18 (Idee) Mobil (400 px): Szenenzähler in der Leiste abgeschnitten, Disclaimer nur am Seitenende
m_p1.png: "Szene 1 von..." und "Cio steht im F..." abgeschnitten. Hinweis "Erfundene Daten, kein Medizinprodukt" erscheint auf Mobil nur am Seitenende. Pitch läuft am Laptop, daher Idee.

Nicht gefunden (geprüft): keine Personennamen mit Leistungsbezug (Funktionen statt Namen; Zahlen je Schicht/Abteilung); keine Patientendaten in UI, localStorage, URL; Hinweis "Erfundene Daten · kein Medizinprodukt · kein Produkt von Siemens Healthineers" in Seitenleiste, Fußzeile jeder Seite und Leiste; Dringlichkeit als "Planungshilfe, keine klinische Bewertung" gekennzeichnet; Fokusring sichtbar; Dunkelmodus insgesamt lesbar (nur Haken "✓" in Zeile Vorab-Check 2,25:1, klein); EN ohne deutsche Reste; keine Konsolenfehler in allen Läufen.

## Geprüft und in Ordnung

- **Pitch-Tour:** sechs Szenen stimmen mit `pitch-und-demo-konzept.md`, 25/30/25/35/30/35 = 180 s. Sprachwechsel und Neuladen mitten in der Tour halten die Szene, „Demo zurücksetzen“ springt auf Szene 1. Ausgelassene oder doppelte Klicks sind unkritisch.
- **Vertiefung:** alle 13 Szenen erreichbar, Rolle, Gerät und Sprechtext passen.
- **Freies Klicken:** neun Bereiche und sieben Dienste-Reiter in DE und EN ohne Fehler. Roboter: Not-Halt, Hindernis, Verbindungsverlust und Handsteuerung wie beschrieben. Neuladen mitten in Scan, Mission, Update und Fehlschlag stellt den Zustand wieder her.
- **Sicherheitsregeln:** Ohne Freigabe kein Start-Knopf, ohne „Umgebung frei“ gesperrt. Not-Halt und Funkabriss ziehen die Meldung zurück. Bei Alarm wird das Fenster gesperrt und neu geplant. Geräte mit Armbewegung haben keinen Fern-Start. Alarm- und Wächter-Banner bleiben bis zur Bestätigung stehen, auch nach Neuladen. „Kein Medizinprodukt“ und „erfundene Daten“ sind sichtbar.
- **Datenschutz:** `localStorage` (`ia-klickdummy-v5`) enthält nur Zustandsfelder, keine Namen. Erledigte Aufträge vergessen, wer sie hatte. Keine Personennamen mit Leistungsbezug.
- **Inhalt und Konsole:** Fristen, Versionen, Standorte und Uhrzeiten zwischen den Ansichten konsistent (bis auf B14). Kein deutsches Restwort im EN-Text. Keine Konsolenfehler, auch bei schnellem Klicken und Zurücksetzen während einer Mission.
