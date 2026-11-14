# Pitch-Storyboard Challenge 4, Fassung 4 (getimt, 180 s)

Stand 13.11.2026, 22:00 Uhr. Baut auf `storyline-v3.md` (Inhalt, Alternativen) und
`klickdummy-pitch-v2-spec.md` (Christians Kommentare) auf. Neu: Die Akte 2 bis 5 laufen über den
neuen Pitch-Klickdummy `../pitch-demo/` als **vier Screencast-Clips**. Die Präsentation
(`encore-christian/` im Aloha-Repo) trägt Video, Statement, Architektur und Schluss und bettet die
Clips ein. Christian spricht. Sprechtext auf Englisch, rund 2,3 Wörter pro Sekunde.

## Ablauf auf einen Blick

| Zeit | Akt | Was läuft | Quelle |
| :--- | :--- | :--- | :--- |
| 0:00–0:20 | 1 Aufhänger | Team-Video, ohne Sprache | Deck |
| 0:20–0:35 | 1 Statement | schwarze Folie, Sätze einzeln | Deck |
| 0:35–1:05 | 2 Emotional | **Clip A**: Szenen 1–4 | Klickdummy |
| 1:05–1:40 | 3 KI + Mensch | **Clip B**: Szenen 5–8 | Klickdummy |
| 1:40–2:15 | 4 Physisch | **Clip C**: Szenen 9–12, KettyBot fährt parallel live | Klickdummy + Bühne |
| 2:15–2:25 | 5 Loop | **Clip D**: Szene 13 | Klickdummy |
| 2:25–3:00 | 5 Schluss | Architektur-Satz, drei Säulen, Call to Action, IA | Deck |

KettyBot startet laut Christian, sobald das Video läuft, und ist zu Akt 4 am Gerät auf der Bühne.

## Akt 1: Aufhänger (0:00–0:35)

**Video (20 s).** Das Video des Teams. Kein Sprechtext.

**Statement (15 s), Fassung B aus v3 (gekürzt wegen 180 s):**
> "We are Aloha Robotics. We root for the invisible underdogs who keep hospitals running. They
> deserve technology they don't fear, but love to use. Meet C-ARMAGOTCHI."

Fassung A (voller Text) passt nur, wenn Clip B auf 25 s gekürzt wird.

## Akt 2: Emotional connectivity, Clip A (0:35–1:05, 30 s)

| Szene | Bild | Sprechtext |
| :--- | :--- | :--- |
| 1 Lonely | Handy, Cio traurig, rechts „Network off · 9 days ago“ | "This is Cio, a C-arm's digital twin, on the phone of its team. Lonely: nobody connected me for days." |
| 2 Hungry | Cio außer Rand und Band, „Power unplugged 3 days · patch due since Mon“ | "Hungry: my security patch is due." |
| 3 Happy | Cio glücklich, alles grün | "Happy: updated and connected." |
| 4 Data point | Kacheln des Teams mit Zustand („patch due since Mon“, „offline 9 days“), dann „Not a gimmick. You feel responsible for your C-arm.“, dann bekommen Cio und C-04 Prioritäts-Badges 1 und 2, die anderen verblassen, rechts die Liste „Priority for the next window“ | "Jokes aside: this is not a gimmick. When you have a bond with your C-arm, you feel responsible for it. And its mood shows at a glance how long it has gone without care. For planning, that is priority: Cio's patch first, then C-04." |

**Was hängen bleiben muss (Christian, 21:28):** Der Kern ist emotionale Bindung, sich
verantwortlich fühlen. Der Verlauf der Stimmung liefert für sich wenig, aber man sieht, wie lange
ein Gerät nicht gewartet wurde und in welchem Zustand es ist. Für das goldene Fenster ist das die
Information zur **Priorisierung**, nicht zur Uhrzeit. Die Uhrzeit kommt aus den Klinikdaten
(Akt 3).

## Akt 3: AI orchestration with human in the loop, Clip B (1:05–1:40, 35 s)

Das Fenster wird im Clip *gefunden*, nicht vorgegeben. Das ist die Kernbotschaft von Akt 3.

| Szene | Bild | Sprechtext |
| :--- | :--- | :--- |
| 5 Best moment | OP-Plan live aus dem KIS, gelbe Meldung „OR 3 · evening case cancelled 19:12“, Polytrauma: keins | "Finding the best moment is the heart of this challenge, and nobody knows it in advance. We collect it from hospital operations: OR plan, last-minute cancellations, trauma alerts, and what the machine tells us. Tonight a case in OR 3 was cancelled. That's our chance." |
| 6 One button | Plan & prioritise → Suche über OP-Plan, Absagen, Nutzung, Gerät → „FOUND · golden window“ → Published by medical physics | "One push of a button. Medical physics checks and publishes." |
| 7 Lena | Push „Cio needs a hand“ mit Jobkarte, dann „Not today“ | "The X-ray nurses on Cio's circle get a job card. Declining costs nothing." |
| 8 Ride request | Radar, sechs Personen werden grau, „Nobody available“, Knopf | "It asks everyone nearby, like a ride request. One of those days. Time for the invisible helper." |

## Akt 4: Physical connectivity, Clip C (1:40–2:15, 35 s)

Auf der Bühne fährt KettyBot zum C-Bogen. Der Clip läuft auf der Leinwand und zeigt, was der
Roboter „denkt“. Christian spricht über beides.

| Szene | Bild | Sprechtext |
| :--- | :--- | :--- |
| 9 Mission | **Eine** Szene in vier Schritten (Check, Find, Dock + Wake, Safe?): links der Grundriss mit KettyBot, darunter ein großer Satz pro Schritt und ein mitlaufendes Telemetrie-Log; rechts der KettyBot-Agent, der 14 Prüfpunkte live abhakt (Spinner, dann Haken, Muster wie der E-Rechnungs-Agent in Goebel OS). Am Ende grün: „14 / 14 checks · 0 warnings“ | "It checks itself, finds Cio where people usually park it, docks, makes sure it's the right machine, wakes it up and checks the surroundings. Fourteen checks. One fail, and it asks nobody." |
| 10 Human starts | Handy-Wizard: Right time? Surroundings OK? Start update. Kette Lena → Medizinphysik → IT, rechts „A human starts every update.“ | "Lena couldn't walk over. Thirty seconds on her phone are enough. **A human starts every update.**" |
| 11 Running | Fortschritt, „Started by Lena 19:31“, „Today is a good day.“ | "It watches and would flag early. Today is a good day." |
| 12 Report | Ergebnis, Rollback-Image, „Ready for clinical use“, Audit-Trail, KettyBot fährt zum nächsten Job | "Report, audit trail, next job." |

## Akt 5: Close the loop (2:15–3:00, 45 s)

**Clip D, Szene 13 (10 s):** Lockscreen mit Danke-Push „Team streak +1“ und „Back in the plan“.
> "And the loop closes where it started. Cio is happy, and the person who helped gets a thank-you."

**Deck, Säulen-Folie (10 s):**
> "Emotional connectivity. AI orchestration with a human in the loop. Physical connectivity.
> No patient data, signed packages, rollback ready."

**Deck, Call to Action (15 s):**
> "Three minutes only scratch the surface. We believe robots will be everywhere in hospitals sooner
> than we think. Let's brainstorm. Our robot already booked the room. Everyone talks about AI. We
> execute on IA: invisible autonomy."

Logo, KettyBot zwinkert.

## Screencast-Skripte

Aufnahme aus `../pitch-demo/index.html` im Vollbild (Taste F), 1920 × 1080, 30 fps, ohne Ton. Der
Ton kommt live von Christian. Zwischen den Klicks so lange warten, wie in der Spalte „Halten“
steht. Szenen mit Automatik laufen von selbst weiter, dort nur warten.

| Clip | Start-URL | Ablauf | Länge |
| :--- | :--- | :--- | :--- |
| A | `?s=1` | Szene 1 halten 6 s · → · Szene 2 halten 4 s · → · Szene 3 halten 4 s · → · Szene 4: 4 s, →, 5 s, →, 8 s | 30 s |
| B | `?s=5` | 5: 7 s · → · 6: Knopf, Suche läuft von selbst, Vorschlag 3 s, Publish, 3 s · → · 7: 5 s, →, 3 s · → · 8: Radar läuft von selbst 4 s, dann 3 s | 35 s |
| C | `?s=9&speed=1.6` | 9: Mission läuft von selbst durch Check, Find, Dock (rund 7 s bei Tempo 1,6), am Ende 3 s halten · → · 10: fünf Klicks à 2 s · 11: Automatik · 12: 5 s | 35 s |
| D | `?s=13` | 3 s, →, 7 s | 10 s |

`?speed=` beschleunigt alle Animationen und Automatik-Schritte (1.6 = 60 % schneller). Für Clip C ist das gewollt: Der Agent hakt die Prüfliste rasant ab, so wie Christian es sich wünscht („mit Checkliste und Validieren, deutlich schneller als in echt“). Im Clip unten rechts einblenden: „Zeitraffer“.

## Entscheidungen und Annahmen (bitte prüfen)

1. **Statement Fassung B** statt A, weil A allein rund 30 s braucht. Annahme, leicht umzustellen.
2. **Das goldene Fenster ist ein Ergebnis, keine Vorgabe (Christian, 13.11. 21:19).** Genau diese
   Uhrzeit herauszufinden ist die Challenge. Dafür sammeln wir Daten aus dem Krankenhausbetrieb.
   Der Klickdummy zeigt deshalb, wie das Fenster *gefunden* wird: Eine OP in Saal 3 fällt um 19:12
   aus, das Nutzungsmuster sagt „nach 19:00 selten gebraucht“, Cio steht seit 17:00. Daraus
   ergibt sich „FOUND · 19:30–22:45“. Die Uhrzeit selbst ist erfunden und dient nur als Beispiel.
   Ausfälle und kurzfristige Absagen sind der spannendste Fall, weil der Betrieb solche Lücken heute
   kaum sinnvoll neu belegt.
3. **Freigabe durch Medizinphysik** (oder IT), dann Kette ausgewählte X-ray Nurses → weitere
   Mitarbeitende, wie von Christian beschrieben.
4. **Architektur nur als Satz** auf der Säulen-Folie. Die eigene Architektur-Folie ist für den
   Folgetermin (Variante L).
5. **Plattform-Ausblick** (Tag/Nacht, Mesh) nur als Zeile in Szene 15, nicht gesprochen.
6. **Teaser „Update-Zeiten senken, Rollback einfacher“** gestrichen, weil nicht belegt und keine
   Zeit. Für den Folgetermin im Entwicklungs-Briefing begründet.
7. **Sprache der UI Englisch**, weil Deck und Pitch Englisch sind (CLAUDE.md sieht Deutsch vor, gilt
   hier nicht, Annahme).

## Selbstprüfung in drei Runden

1. **Runde 1 und 2 (eigene Prüfung):** Alle Schritte per Screenshot geprüft, Überlappungen,
   unsichtbare Texte und Zähler behoben.
2. **Runde 3 (unabhängiges Review mit Fable 5.2, 25 Befunde):** Eingearbeitet sind
   - Story: Lena lehnt das Hingehen ab, startet aber per Handy („30 seconds on the phone are
     enough“); Kette Lena → Medizinphysik → IT; „A human starts every update“ steht in Szene 13 von
     Anfang an im Bild; Szene 13 gehört zur Säule „human in the loop“.
   - Glaubwürdigkeit: Andocken über einen Service-Anschluss (Konzept) statt „230-V-Steckdose“;
     Identität über Seriennummer und Gerätezertifikat statt nur MAC; „4/4 hard checks, one fail = no
     request“ statt „Confidence 97 %“; Cio sieht erst nach dem Start nach Update aus; „Ready for
     clinical use“ im Bericht; Audit nennt keine Namen von Ablehnenden.
   - Technik: Uhrzeiten auf den Handys passen zur Geschichte (19:24, 19:30, 19:50), Animationen
     folgen `?speed=`, ← geht einen Schritt zurück, Screenshot-Tool erfasst jetzt jeden Schritt (37).
   - Lesbarkeit: kleinste Schriften am Beamer auf 19–23 px angehoben.
3. **Offen, bewusst nicht umgesetzt (Vorschlag für den Feinschliff mit Christian):**
   - Überschriften in Großbuchstaben und Teal-Betonung wie im Deck.
   - Klicks nur auf echten Knöpfen statt überall auf der Bühne.

## Runde 4 (13.11., 21:30–22:15, nach Christians Feedback)

- Akt 4 von vier Checklisten-Szenen auf **eine Mission** verdichtet, mit live abhakendem
  Roboter-Agent nach dem Vorbild des E-Rechnungs-Agenten in Goebel OS. Jetzt 13 statt 16 Szenen.
- Szene 4 neu: **Verantwortung** als Kern, die Stimmung wird zur **Priorität** (Badges 1 und 2,
  Liste „Priority for the next window“). Die Linien zum goldenen Fenster entfallen, weil das
  Fenster aus Klinikdaten kommt, nicht aus der Stimmung.
- Szene 5 ohne Umschalt-Schritt, Szene 7 zeigt Push und Jobkarte zusammen.
