# C-ARMAGOTCHI Pitch-Klickdummy

> Kopie für das Team, Stand 13.11.2026, 22:20. Die Quelle wird im Repo
> `clschulzer/healthcare-hackathon-erlangen-1` gepflegt
> (`challenges/04-invisible-connectivity/pitch-demo/`). In `docs/` liegen das getimte
> Pitch-Storyboard v4 und das Entwicklungs-Briefing. Links darin zeigen auf das Quell-Repo.

Vereinfachter Klickdummy für den 3-Minuten-Pitch der Challenge 4. Er erzählt eine einzige
Geschichte als geführten Ablauf (Wizard), im Look der Team-Präsentation
(`CARMAGOTCHI_Web_Pitch`, Aloha-Repo): Bühne 1920 × 1080, Arial 900, Courier-Labels,
Teal/Orange. Der volle Klickdummy (`../klickdummy/`) bleibt für den Folgetermin.

Alle Daten sind erfunden. Kein Medizinprodukt, kein Produkt von Siemens Healthineers. Die Figuren
stammen aus der Team-Präsentation und tragen das Siemens-Healthineers-Logo: nur für Pitch und
Demo verwenden.

## Starten

`index.html` im Browser öffnen, offline, ohne Server und ohne Build.

| Taste | Wirkung |
| :--- | :--- |
| → · Leertaste · Enter · Klick | nächster Schritt |
| ← | zurück |
| Home oder 0 | von vorn |
| N | Sprechernotizen ein/aus |
| F | Vollbild |

URL-Parameter: `?s=8` springt zu Szene 8, `?step=2` zu Schritt 2, `?speed=2` spielt Animationen
doppelt so schnell (für Screencasts), `?notes=1` zeigt die Notizen, `?auto=0` schaltet die automatischen Schritte ab.

## Szenen

| Nr. | Akt | Szene |
| :--- | :--- | :--- |
| 1–3 | Emotional | App: Cio einsam, hungrig, glücklich |
| 4 | Emotional | Every mood is a data point: Verantwortung, Stimmung wird Priorität |
| 5 | KI | Wann ist der beste Moment? OP-Plan, eine OP fällt aus, vier Signale |
| 6 | KI | Ein Knopfdruck: Fenster finden, prüfen, freigeben (Medizinphysik) |
| 7 | KI | Lenas Handy: Auftrag, Ablehnen kostet nichts |
| 8 | KI | Wie ein Fahrdienst: niemand frei → Roboter schicken |
| 9 | Physisch | Mission: Grundriss plus Roboter-Agent, der 14 Prüfpunkte live abhakt |
| 10 | KI + Mensch | Handy-Wizard: Mensch startet das Update (Lena → Medizinphysik → IT) |
| 11–12 | Physisch | Update läuft, Bericht, Audit-Trail, nächster Job |
| 13 | Emotional | Loop geschlossen: Danke, frische Daten |

## Prüfen

`node tools/shots.mjs <ordner>` läuft mit Playwright durch alle Szenen und Schritte, speichert je
Schritt einen Screenshot und bricht bei Konsolenfehlern ab.
