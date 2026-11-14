# Briefing: Wie wir die Killer-Features wirklich bauen könnten

Stand 13.11.2026, 22:00 Uhr. Für Christian, das Team und das Gespräch mit Siemens Healthineers nach
dem Pitch. Kurzfassung der Specs in diesem Ordner, sortiert nach den fünf Momenten, die der
Pitch-Klickdummy (`../pitch-demo/`) zeigt. Nichts davon ist gebaut. Zahlen und Grenzwerte sind
`[Annahme]`, sofern nicht anders markiert.

## Ergebnis zuerst

Drei der fünf Features lassen sich **ohne Roboter und ohne Eingriff in den C-Bogen** in einem
Pilot von rund acht Wochen zeigen: Begleiter-App, goldenes Fenster und Auftrag an Menschen. Sie
brauchen nur den OP-Plan (lesend), Gerätestatus aus dem bestehenden Remote-Service-Kanal und eine
Freigabe durch die Medizinphysik. Der Roboter ist die zweite Stufe und hängt an zwei Fragen, die nur
Siemens Healthineers beantworten kann: Darf ein Fremdgerät ein Netzwerkkabel am C-Bogen stecken,
und lässt sich das Gerät über das Kabel aufwecken?

| Feature | Im Pitch | Pilot-Stufe | Größte Unbekannte |
| :--- | :--- | :--- | :--- |
| 1 Begleiter mit Stimmungen | Szenen 1–4, 16 | Stufe 1 | Welche Statusdaten liefert der C-Bogen heute? |
| 2 Goldenes Fenster | Szenen 5–6 | Stufe 1 | Zugriff auf den OP-Plan (Schnittstelle des KIS) |
| 3 Auftrag wie ein Fahrdienst | Szenen 7–8 | Stufe 1 | Wer darf ein Kabel stecken (Einweisung, MPBetreibV) |
| 4 Roboter-Mission, Mensch startet | Szenen 9–15 | Stufe 2 | Kabel, Wake-on-LAN, Haftung, Umgebungsprüfung |
| 5 Audit und Rückmeldung | Szenen 13–15 | Stufe 1 | Format, das Medizinphysik und Hersteller akzeptieren |

## 1. Begleiter mit Stimmungen (C-ARMAGOTCHI)

**Kern:** Die Stimmung ist eine Übersetzung von Gerätestatus in etwas, um das man sich kümmert. Sie
ist kein Spiel, sondern ein Datenkanal: Wer sich kümmert, steckt ein, und dann kommen Daten.

**So bauen:**
- Regelwerk Status → Stimmung, deterministisch und getestet (z. B. „letzte Verbindung > 7 Tage“ →
  lonely, „Sicherheits-Patch fällig“ → hungry). Keine KI nötig.
- Statusquelle: der bestehende Remote-Service-Kanal (Smart Remote Services baut die Verbindung von
  innen auf, `[geprüft]` laut Recherche 03). Fehlt dort ein Wert, zeigt der Begleiter „weiß ich
  nicht“ statt einer Stimmung.
- App als PWA für Dienst-Handys, Push über das MDM der Klinik. Kein Personenbezug außer Rolle und
  Kreis (wer gehört zu welchem Gerät).
- Messen, ob es wirkt: Anteil der Geräte mit Verbindung in den letzten 7 Tagen, vorher und nachher.
  Das ist die eine Zahl, die den Pilot entscheidet.

**Risiken:** Gewöhnung (die Figur nervt nach drei Wochen), deshalb wenige Pushes und Team-Streaks
statt Einzelranking. Betriebsrat: keine Leistungsbewertung einzelner Personen.

## 2. Goldenes Fenster (Fenster-Lotse)

**Kern:** Regelcode entscheidet, ob ein Fenster zulässig ist. Die KI schätzt nur, wie
wahrscheinlich das Gerät im Fenster gebraucht wird, und formuliert die Begründung. Ein Mensch gibt
frei. Details: [spec-scheduling-ki.md](spec-scheduling-ki.md), 40 Testfälle, davon 15 schon im
Prototyp `planner.test.cjs`.

**Das Fenster ist das Ergebnis, nicht die Annahme.** Wann ein C-Bogen wirklich frei ist, weiß heute
niemand. Genau das herauszufinden ist der Kern der Challenge. Deshalb beginnt die Entwicklung mit
dem Sammeln von Daten aus dem Krankenhausbetrieb, nicht mit einer festen Uhrzeit:
- Geräte-Logs: wann wird geröntgt, je Gerät, Wochentag und Stunde.
- OP-Plan gegen Ist-Zeiten: geplante gegen tatsächliche Schnitt-Naht-Zeiten.
- **Ausfälle und kurzfristige Absagen** (OP fällt aus, Patient nicht nüchtern, Saal frei): Solche
  Lücken werden heute oft kaum sinnvoll neu belegt. Für ein Update sind sie ideal, weil sie kurzfristig
  und verlässlich frei sind. Das ist der spannendste Fall für den Pilot.
- Notfälle und Schockraum-Alarme, die Fenster wieder schließen.
In Phase 1 läuft der Fenster-Lotse zuerst nur im Schattenbetrieb: Er schlägt Fenster vor, ohne dass
etwas passiert, und wir vergleichen mit dem, was wirklich los war.

**So bauen:**
- Eingänge: OP-Plan (lesend, HL7 SIU oder FHIR `Appointment`/`Schedule`, je nach KIS), Nutzungsmuster
  aus Geräte-Logs (Röntgenzeiten je Wochentag und Stunde), Gerätestatus, Roboter-Belegung.
- Regelkern: kein Fall im Saal bis Fensterende plus Puffer, Ersatzgerät verfügbar, höchstens N
  Updates pro Nacht, Paket von der IT für das Haus zugelassen.
- Polytrauma-Signal: im Pilot ein Knopf „Schockraum aktiv“ für die Leitstelle, später eine
  Schnittstelle. Ist es aktiv, wird jedes offene Fenster pausiert.
- LLM nur für Begründung und Nachrichten, mit Vorlagen als Rückfall. Der Plan hängt nie am LLM.

**Prüfung:** Rückwärts-Simulation mit drei Monaten echter OP-Pläne (anonymisiert, nur Säle und
Zeiten): Wie oft hätte ein vorgeschlagenes Fenster einen Fall gestört? Ziel 0 bei 95 % gefundener
Fenster `[Annahme]`.

## 3. Auftrag wie ein Fahrdienst

**Kern:** Ein freigegebenes Fenster wird zum Auftrag. Erst der ausgewählte Kreis der X-ray Nurses,
dann weitere Mitarbeitende, dann der Roboter. Ablehnen kostet nichts.

**So bauen:**
- Eskalationskette aus Konfiguration je Gerät (wie von Christian beschrieben: Medizinphysik oder IT
  klärt Lücken, dann ausgewählter Kreis, dann weitere).
- Matching nach Nähe und Verfügbarkeit: im Pilot nur aus dem Dienstplan und einem Status „gerade
  frei“ in der App. Keine Ortung von Personen.
- Jede Annahme, Ablehnung und Zeitüberschreitung landet im Audit-Trail.

**Rechtlicher Punkt:** Ein Netzwerkkabel stecken ist eine Tätigkeit am Medizinprodukt. Wer das darf,
regelt die Einweisung nach MPBetreibV `[Annahme, vor Nutzung prüfen]`. Der Kreis muss deshalb aus
eingewiesenen Personen bestehen.

## 4. Roboter-Mission, Mensch startet

**Kern:** Der Roboter bringt Kabel, Strom und Paket zum Gerät. Er ist nie eine Netzwerk-Brücke: Er
gibt das Paket aus dem eigenen Speicher über ein Punkt-zu-Punkt-Kabel an genau ein Gerät. Den Start
löst immer ein Mensch aus. Details: [spec-robot-cockpit.md](spec-robot-cockpit.md) und
[architektur-klinik-it-security.md](architektur-klinik-it-security.md).

**So bauen, in drei Schritten:**
1. **Ohne Arm (Pilot Stufe 2a):** Service-Roboter (z. B. KettyBot, Pudu-SDK) fährt zum Gerät und
   bringt das Kabel. Ein Mensch steckt ein. Der Roboter liefert Paket, prüft MAC und meldet. Das
   ist mit heutiger Hardware machbar.
2. **Mit Steckhilfe (2b):** Andock-Station am Gerätewagen (Magnetstecker, z. B. wie bei
   Reinigungsrobotern), die der Hersteller vorsieht. Erst dann steckt der Roboter selbst.
3. **Umgebungsprüfung:** Kamera und Lidar des Roboters plus Gerätestatus (Bremsen, Arm geparkt).
   Ergebnis ist ein Vorschlag mit Konfidenz. Unter dem Schwellwert fragt er nicht, sondern bricht
   ab. Eval mit Szenen aus Trainingscenter und Flur.

**Aufwecken:** Wake-on-LAN setzt voraus, dass der C-Bogen es im ausgeschalteten Zustand unterstützt.
Das wissen wir nicht `[Annahme]`. Rückfall: Der Mensch schaltet ein, wenn er den Start bestätigt.

**Teaser aus dem Pitch, „Update-Zeiten senken, Rollback einfacher“:** Ansatz wäre ein
A/B-Partitionsschema (neues Image auf die inaktive Seite schreiben, Umschalten in einem Neustart,
die alte Seite bleibt als Rollback) und das Vorabladen des Pakets in den Roboter-Speicher, damit im
Fenster nur noch geschrieben wird. Ob die Plattform des C-Bogens das erlaubt, ist offen
`[Annahme]`. Deshalb im Pitch nicht als Versprechen formulieren.

## 5. Audit und Rückmeldung

**Kern:** Jeder Schritt ist nachvollziehbar, und die Person, die geholfen hat, bekommt ein Danke.

**So bauen:**
- Append-only Protokoll mit Hash-Kette im Klinikknoten, Export für Medizinphysik und Hersteller.
- Freigaben als signierte Entscheidung einer Person, gebunden an Gerät, Paket und Planversion.
- Logs vom Gerät nur gefiltert, ohne Patientendaten. Was hinausgeht, gibt die Klinik je Datenart frei.

## Fahrplan

| Phase | Dauer | Ergebnis |
| :--- | :--- | :--- |
| 0 Klärung mit Siemens Healthineers | 2 Wochen | Antworten auf die Fragen unten, Zugang zu Status-Schnittstelle oder Testgerät im Trainingscenter |
| 1 Pilot ohne Roboter | 8 Wochen, 1 Klinik, 4–6 C-Bögen | Daten sammeln (Nutzung, OP-Ist-Zeiten, Absagen), Fenster-Lotse im Schattenbetrieb, dann Begleiter, Aufträge, Audit. Messgrößen: gefundene Fenster ohne Störung, Anteil verbundener Geräte |
| 2a Roboter bringt Kabel | 6 Wochen, Trainingscenter, dann Nachtschicht | Mission bis zum Stecken durch Menschen |
| 2b Roboter steckt | offen | hängt an Andock-Lösung des Herstellers |

## Fragen an Siemens Healthineers

1. Welche Statuswerte (Version, letzte Verbindung, Akku, Netz, Nutzungszeiten) sind heute über
   Smart Remote Services lesbar, und dürfen wir sie in einem Pilot nutzen?
2. Unterstützt der mobile C-Bogen Wake-on-LAN oder ein anderes Aufwecken über das Kabel?
3. Ist ein A/B- oder Delta-Update auf der Plattform möglich, und wie lange dauert ein
   Sicherheits-Patch heute tatsächlich?
4. Wer darf aus Sicht des Herstellers das Netzwerkkabel stecken, und gibt es eine vorgesehene
   Andockstelle?
5. Dürfen wir ein Gerät im Trainingscenter für einen Test mit dem Roboter nutzen?
