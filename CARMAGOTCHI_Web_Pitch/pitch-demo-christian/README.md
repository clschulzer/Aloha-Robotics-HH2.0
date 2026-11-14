# C-ARMAGOTCHI Pitch-Klickdummy

Vereinfachter Klickdummy für den 3-Minuten-Pitch der Challenge 4. Er erzählt eine einzige
Geschichte bis zum Call to Action als geführten Ablauf (Wizard), im Look der Team-Präsentation
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
| 1 | Aufhänger | Schwarzer Standby, Klick startet das Team-Video mit Ton, danach geht es von selbst weiter |
| 2 | Aufhänger | Statement: „We are Aloha Robotics … Meet C-ARMAGOTCHI.“ |
| 3–5 | Emotional | App: Cio einsam, hungrig, glücklich |
| 6 | Emotional | Every mood is a data point: Verantwortung, Stimmung wird Priorität |
| 7 | KI | Wann ist der beste Moment? OP-Plan, eine OP fällt aus, vier Signale |
| 8 | KI | Ein Knopfdruck: Fenster finden, prüfen, freigeben (Medizinphysik) |
| 9 | KI | Lenas Handy: Auftrag, Ablehnen kostet nichts |
| 10 | KI | Wie ein Fahrdienst: niemand frei → Roboter schicken |
| 11 | Physisch | Mission: Grundriss plus Roboter-Agent, der 14 Prüfpunkte live abhakt |
| 12 | KI + Mensch | Handy-Wizard: Mensch startet das Update (Lena → Medizinphysik → IT) |
| 13–14 | Physisch | Update läuft, Bericht, Audit-Trail, nächster Job |
| 15 | Emotional | Loop geschlossen: Danke, frische Daten |
| 16 | Alle drei | Schluss in einem Klick: Call to Action, drei nächste Schritte, KettyBot, „Room booked“ |

Das Team-Video liegt nicht hier, sondern neben dem Team-Deck im Aloha-Repo
(`CARMAGOTCHI_Web_Pitch/encore-christian/media/chaos_30s.mp4`, Pfad relativ `../encore-christian/…`).
Fehlt es, zeigt Szene 1 einen Hinweis und es geht per Klick weiter. Anderer Pfad: `?video=…`.

## Prüfen

`node tools/shots.mjs <ordner>` läuft mit Playwright durch alle Szenen und Schritte, speichert je
Schritt einen Screenshot und bricht bei Konsolenfehlern ab.
