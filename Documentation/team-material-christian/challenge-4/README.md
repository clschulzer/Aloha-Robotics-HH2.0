# Challenge 4: Invisible Connectivity for Mobile C-Arms

**Challenge-Geber:** Siemens Healthineers
**Quelle:** [Healthcare Hackathon Bavaria – Erlangen 2026, Challenges](https://hackathon.medical-valley-emn.de/#challenges)

> Originaltext der Challenge-Seite, nur Formatierung angepasst.

## Invisible Connectivity: Smart Workflow Windows for Mobile C-Arms

Mobile C-Arms rely on software and AI to support surgery but suffer from lack of connectivity and time for maintenance during clinical routine. ‘Invisible Connectivity’ asks for concepts to seamlessly establish connectivity and automate software updates log transfers in the background – to stay up-to-date at minimal disruption of daily workflows.

As advanced medical systems used during surgery, Mobile C Arms combine elaborate software with built-in digital and AI capabilities. Keeping them running efficiently across their lifecycle depends on remote monitoring, servicing, and routine software updates alike.

In daily practice, these devices are frequently wheeled between sterile and non-sterile zones while switched off. Viewed by staff as “just another tool” in the operating room, they need to be clinically ready, the moment radiographers “have their hands on it”.

This is where your challenge begins:
Invisible Connectivity aims to reimagine how linking to remote services and installing updates can fit within clinical reality – rather than working against it.

Your mission is to develop concepts that encourage radiographers to willingly connect their Mobile C-Arm and keep its software up to date – in a manner that is smarter and more dependable yet leaves existing clinical routines untouched. The ideas you bring forward should make possible:

- Straightforward, reliable software updates
- Effortless transfer of logs and system data

### Who is this for?

Radiographers. Clinicians. Engineers. Designers. Innovators. Everyone eager to help shape where intelligent medical technology and connectivity are headed.

---

## Weitere Unterlagen

- [Briefing](briefing.md) für den Hackathon-Start
- [Interview](interview-siemens-healthineers.md) „Behind the Scenes“
- [Pitch-Notizen](pitch-notizen-siemens-healthineers.md) aus der Challenge-Präsentation am 12.11.2026, mit offenen Fragen
- **[Synthese nach dem Gespräch](synthese-nach-gespraech.md): aktueller Stand.** Leitmotiv „IA“, was beantwortet ist, was kippt, Plattform als Produkt, Roboter als Schau, offene Fragen
- **[Plattformkonzept](plattform-konzept.md): rund um die Maschine.** Das goldene Fenster als gemeinsame Währung, der Roboter als gemeinsame Hand, sechs Schritte je Dienst, Servicetermine, Einweisung, weitere Roboter-Dienste, Hypothesen (Entwurf vom 13.11.)
- [Menschen und ihre Ziele](menschen-und-ziele.md): Aufgabe, Sorge und Gefühl je Rolle, was IA abnimmt (Entwurf)
- [Architektur-Skizze](architektur-skizze.md): vier Schichten, Leitgedanken, Schnittstellen und Datenflüsse für einen Pilot (Entwurf)
- [Vorbereitung für die Entwicklung](entwicklung/README.md): Specs, Testfälle, Evals und Stresstests für Scheduling mit KI und Roboter-Cockpit, Architektur mit Klinik-IT und Security, QA des Klickdummys
- [Pitch- und Demo-Konzept](pitch-und-demo-konzept.md): der Pitch in drei Minuten und der Folgetermin mit den Challenge-Ownern in der Tiefe (Entwurf)
- [Gespräch mit dem Challenge-Geber](gespraech-challenge-geber.md): Faktenblatt vom 12.11. abends
- [Bewertung nach dem Pitch](bewertung-nach-pitch.md): 21 Ideen gegen das Transkript, Longlist der Fragen (in Teilen überholt)
- [Ideenvergleich](ideen-vergleich.md) mit allen 23 Ideen
- [Designrichtlinie](design-richtlinie-siemens-healthineers.md): öffentliche Siemens-Healthineers-Gestaltung (Farben, Raster, Schrift-Ersatz) für den Prototyp, mit Lizenzgrenzen
- **[Klickdummy](klickdummy/README.md):** klickbarer Entwurf der Plattform (Planungstafel mit goldenen Fenstern, Geräteakte mit Zwilling und Servicevertrag, Begleiter im Tamagotchi-Stil), erfundene Daten

## Passende Claude-Code-Hilfen im Repo

| Hilfe | Wofür in dieser Challenge |
|---|---|
| Skill `medtech-connectivity` | Rahmen für Updates an Medizingeräten (IEC 62304, IEC 81001-5-1, IEC 80001-1, MDR), Update-Muster (Zeitfenster, signierte Pakete, Rollback), Log-Transfer ohne Patientendaten |
| Skill `healthcare-phi-compliance` | Geräte-Logs können Patientendaten enthalten (DICOM-Header, Namen in Untersuchungslisten) |

Die übrigen Healthcare-Skills (EMR, CDSS) passen hier nicht, da es um Gerätesoftware und Workflow geht, nicht um Patientenakten.
