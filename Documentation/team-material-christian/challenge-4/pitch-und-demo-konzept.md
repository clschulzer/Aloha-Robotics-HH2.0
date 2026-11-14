# Challenge 4: Pitch- und Demo-Konzept

Stand: 13.11.2026, Entwurf zum Feinschleifen. Christian will zwei Formate: einen sehr kurzen Pitch
von drei Minuten am Hackathon und einen Folgetermin mit den Challenge-Ownern, in dem wir mehr
Zeit haben, mehr klicken lassen und zeigen, dass alles durchdacht ist. Beide laufen im selben
Klickdummy (`klickdummy/`), offline und mit erfundenen Daten.

Zahlen nennen wir nur als „laut Siemens im Gespräch“ (rund 120 Minuten je Update, etwa 80 Euro je
OP-Minute, drei Rollen). Sie sind mündliche Schätzungen und nicht `[geprüft]`.

## Format 1: Der Pitch in drei Minuten

**Ziel:** Die Jury soll in drei Minuten glauben, dass das Problem echt ist, dass wir es an der
richtigen Stelle anpacken, und dass man das morgen weiterbauen kann.

**Ein Satz, der hängen bleibt:** „Die unsichtbaren Helfer bekommen Hilfe.“

**Ablauf:** Auf der Startseite „3-Minuten-Pitch starten“. Der Klickdummy setzt die Demo zurück,
führt durch sechs Szenen und blendet zu jeder den Sprechtext und ihr Zeitbudget ein. Die Summe
ist 180 Sekunden, ein Test prüft das.

| # | Zeit | Bildschirm | Klick | Kernsatz |
|---|---|---|---|---|
| 1 | 25 s | Begleiter an Cio | keiner | Drei Rollen könnten das Update anstoßen, keine fühlt sich zuständig. Das Problem ist nicht der Download, es ist das Fenster. |
| 2 | 30 s | Planungstafel | „Lücken füllen“ | Der Lotse findet für jedes Gerät das goldene Fenster. Die Regel dahinter ist getesteter Code, kein Sprachmodell. |
| 3 | 25 s | Planungstafel, Cio | Cios Fenster freigeben, Roboter losschicken | Die Medizinphysik bekommt genau eine Frage. Eine Freigabe, kein Telefonat. |
| 4 | 35 s | Planungstafel, Cio | Start bestätigen, sobald „Umgebung frei“ gemeldet ist | Strom und Paket kommen zum Gerät, ein Mensch bestätigt den Start, der Wächter meldet, wenn das Gerät zurück ist. |
| 5 | 30 s | Leitstand | einen Auftrag annehmen | Fehlt eine Hand, fragt IA die nächste freie Person. Ablehnen kostet nichts. Später fährt ein Roboter. |
| 6 | 35 s | Überblick | keiner, Kreis und Karte zeigen | Dasselbe Fenster und dieselbe Hand tragen auch Wartung, Service und Einweisung. |

**Regeln für den Pitch:**

- Eine Person spricht, eine klickt. Wer klickt, sagt nichts.
- Höchstens sechs Klicks. Fällt einer aus, geht der Sprechtext weiter, die Szene steht auch ohne
  Klick.
- Der Roboter ist im Pitch nur die Hand, die Strom und Paket bringt. Seine eigene Ansicht zeigen
  wir im Folgetermin, beim Bauen ist er die dritte Priorität.
- Plan B ohne Rechner: die Screenshots aus `klickdummy/screenshots/` in derselben Reihenfolge.

**Offen zum Feinschleifen:** der Einstieg (Szene am Flur oder eine Zahl), wer spricht, ob die
letzte Szene mit dem Kreis oder mit der Frage an die Jury endet.

## Format 2: Der Folgetermin in der Tiefe

**Ziel:** Die Challenge-Owner sollen sehen, dass wir die Zusammenhänge rund um die Maschine
verstanden haben, und uns sagen, wo wir falsch liegen. Wir wollen drei Dinge mitnehmen: ein
Urteil zu den Hypothesen, die Bestätigung des Killer-Features und was wirklich verfügbar ist.

**Dauer:** 30 bis 45 Minuten, davon höchstens die Hälfte wir.

| Teil | Zeit | Was wir zeigen | Was wir fragen |
|---|---|---|---|
| 1 Einstieg | 3 min | Den Pitch, unverändert | nichts |
| 2 Hypothesen | 8 min | Startseite: sieben Hypothesen, Helferkreis | Welche Hypothese ist falsch? |
| 3 Killer-Feature | 8 min | „Vertiefung starten“, Szenen 2 bis 8: Lücken füllen, Freigabe, Start, Alarm, kleine Bitte, Akte | Ist der Fenster-Lotse das Richtige? Welche Regel fehlt? |
| 4 Die Gäste klicken | 8 min | Roboter mit Nachtschicht, Leitstand mit Aufträgen. Die Gäste lösen selbst „Bett im Flur“ oder einen Alarm aus | Was liefert ein ausgeschalteter C-Bogen wirklich? |
| 5 Rund um die Maschine | 8 min | „Weitere Dienste“: Vorab-Check für den Servicetermin, Lernen, richtiger Ort, Nachweise, Hersteller, Gerätetypen | Wie disponiert der Kundendienst heute? Wer weist ein? |
| 6 Architektur und Weg | 5 min | Startseite unten: Schichten, Schnittstellen, Weg | Was weiß das Flottenportal je Gerät? |
| 7 Abschluss | 5 min | Fragenliste auf der Startseite | Was sollen wir bis zum nächsten Mal klären? |

**Regeln für den Folgetermin:**

- Die freie Tour ist ein Geländer, kein Drehbuch. Jeder Bereich ist frei klickbar, und „Zum
  Pitch“ in der Leiste unten wechselt jederzeit zurück.
- Alles, was nicht gebaut ist, trägt das Wort „Ausblick“. Wir sagen es auch laut.
- Wir zeigen die angreifbaren Stellen selbst (Abschnitt „Wo das Konzept angreifbar ist“ im
  Plattformkonzept), bevor jemand danach fragt.
- Die Sprache lässt sich oben auf Englisch umstellen, falls jemand dazukommt, der kein Deutsch
  spricht.

## Was beide Formate gemeinsam haben

- **Leitsatz:** Das goldene Fenster ist die gemeinsame Währung, der Roboter die gemeinsame Hand.
- **Gefühl:** Die unsichtbaren Helfer bekommen Hilfe.
- **Haltung:** Regeln sind Code, die KI schlägt vor, ein Mensch entscheidet. Keine
  Patientendaten, keine Bewertung von Personen.
- **Abgrenzung:** kein Produkt von Siemens Healthineers, kein Medizinprodukt, erfundene Daten.

## Woran wir merken, dass es funktioniert hat

- Pitch: Eine Jurorin kann nach drei Minuten in einem Satz sagen, was wir bauen.
- Folgetermin: Die Challenge-Owner widersprechen mindestens einer Hypothese. Dann haben sie
  mitgedacht, und wir wissen mehr als vorher.
