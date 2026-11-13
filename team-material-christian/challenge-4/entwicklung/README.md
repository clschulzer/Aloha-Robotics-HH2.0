# Challenge 4: Vorbereitung für die Entwicklung

Stand: 13.11.2026. Nichts davon ist gebaut. Die Dokumente zeigen, woran wir für eine Entwicklung nach dem
Hackathon gedacht haben, und sind Grundlage für das Gespräch mit den Challenge-Ownern. Sie werden sich
ändern, sobald wir wissen, was wirklich verfügbar ist. Alle Grenzwerte und Zielwerte sind `[Annahme]`.

| Dokument | Inhalt |
|---|---|
| [spec-scheduling-ki.md](spec-scheduling-ki.md) | Fenster-Lotse („goldenes Fenster“): Anforderungen, Trennung Regelkern, Optimierer, Nutzungsmodell und LLM, 40 Testfälle (15 schon durch `planner.test.cjs` abgedeckt), Evals mit Schwellen für einen Pilot, Stresstests und Invarianten, Lücken im heutigen `planner.js` |
| [spec-robot-cockpit.md](spec-robot-cockpit.md) | Robot Operational Cockpit (Roboter-Ansicht und Leitstand): Rollen und Rechte, Zustandsautomaten, Anforderungen, Gefährdungen durch Kabel und Strom, Testfälle, Evals für „Umgebung frei“ und Aufträge, Stresstests |
| [architektur-klinik-it-security.md](architektur-klinik-it-security.md) | Betriebsvarianten mit Empfehlung (Klinikknoten im Haus), Zonen und Conduits nach IEC 62443, Bedrohungsmodell, Vertrauenskette der Signaturen, Regulatorik-Landkarte (MDR, IEC 62304, 81001-5-1, 80001-1, MDS2, B3S, NIS2, AI Act, CRA, Maschinenverordnung, IEC 60601-1), Checkliste für die Klinik-IT, Notfallbetrieb, Pilot-Schnitt, Schwachstellen mit Rückfallpositionen |
| [qa-klickdummy.md](qa-klickdummy.md) | QA des Klickdummys vom 13.11.: 18 Befunde, Pitch-Blocker behoben, offene Punkte für den Feinschliff |

Die Architektur vertieft [../architektur-skizze.md](../architektur-skizze.md), ersetzt sie aber nicht.
Die Architektur wurde aus Sicht einer Informationssicherheitsbeauftragten, Regulatory Affairs und
Robotik-Sicherheit kritisch gegengelesen. Normaussagen sind nicht gegen die Originaltexte geprüft und
tragen dort, wo wir unsicher sind, `[Annahme, vor Nutzung prüfen]`.
