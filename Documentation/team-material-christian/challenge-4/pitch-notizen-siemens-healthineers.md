# Pitch-Notizen: Challenge-Vorstellung Siemens Healthineers

**Quelle:** Christians Notizen aus der Challenge-Präsentation von Siemens Healthineers am
12.11.2026 (Hackathon-Auftakt), ergänzt um das automatische Transkript der Präsentation
(bereinigt, siehe unten). Vortragende: Dr. Sebastian Glawion (spielt den Chirurgen) und
Dr. Christoph Luckner (spielt die OP-Pflegekraft „Chris“).

> Notizen sinngemäß übernommen und geordnet. Englische Zitate wie im Transkript.

## Was Siemens im Pitch gesagt hat

- **Cybersecurity ist der Aufhänger.** Der Pitch nutzte einen Virus- bzw. Cybersecurity-Fall als
  Beispiel: Ein Sicherheitsupdate muss auf das Gerät, und zwar schnell.
- **Das Schmerz-Szenario:** Nach einer OP ruft die IT an: wegen eines Virus muss sofort ein
  Sicherheitsupdate drauf. Die nächste OP beginnt in **2 Stunden**, das Update dauert laut Gerät
  **2 Stunden**. Die Pflegekraft drückt den einen Knopf, das Update **bricht ab**, das Gerät ist
  vor der nächsten Operation weder aktuell noch einsatzbereit.
- **Leitsätze:**
  - „Everything that I have to do on top of that needs to be dead simple.“
  - „I don't have time to check anything in advance.“
  - „Make my life easier and keep the systems connected, up and running, and safe to operate.“
- **Angebot:** Siemens Training Center, ca. 200 m vom Veranstaltungsort. Am **13.11.** Einführung am
  echten Gerät mit einem Applikationstrainer, die beiden Challenge-Geber beantworten Fragen.
  **Nachmittags** können Teams **Hands-on-Sessions buchen**, um Ideen am Gerät zu prüfen.

## Was das für unser Konzept heißt (Lesart)

1. **Bestätigt unsere Rahmung.** Einfachheit für Bediener und IT steht über Technik. Das passt zu
   „unsichtbarer Service: erst Hilfe, dann Updates“ im [Briefing](briefing.md).
2. **Das 2-Stunden-Szenario gehört in die Demo.** Es ist genau der Fall, den die Idee „Gute Nacht,
   C-Bogen“ (Update im Aus-Zustand, Update-Ampel, Rollback) lösen soll: Update nie im Einsatzfenster,
   bei Fehler automatisch zurück auf die alte Version, Gerät morgens trotzdem einsatzbereit. Die 2 Stunden
   sind ein gespieltes Szenario im Pitch, keine gemessene Update-Dauer. Echte Dauer im Training
   Center erfragen.
3. **Cybersecurity ist ihr Business Case.** Das stützt den Compliance-Hebel (NIS2, MPBetreibV) aus
   der Idee „Flotten-Cockpit“. Sicherheitsupdates sind der Grund, warum Verbindung Pflicht wird.
4. **Trainings-Center-Besuch annehmen**, möglichst früh: echte Geräte sehen, Update-Dauer, Anschlüsse
   und Bedienung prüfen, Fotos/Abläufe für die Demo sammeln (keine Patientendaten).

5. **Der Bediener ist hier die OP-Pflege, nicht die MTR.** Im Pitch bedient „Chris“, eine
   OP-Pflegekraft, den C-Bogen neben Steril-Abdeckung, Lagerung, Instrumenten und Gerät-Holen.
   Unsere Personas setzen mit Sabine (MTR) als Hauptbedienerin an, Jonas (OTA) im Spät- und Nachtdienst. Für
   die Demo Jonas bzw. die OP-Pflege nach vorn holen; im Training Center fragen, wer in deutschen
   Kliniken typischerweise bedient.
6. **Der Anstoß kommt von der IT, die Last trägt die Pflege.** Die IT ruft an, die Pflege muss
   es irgendwie erledigen, der Chirurg schimpft, wenn es schiefgeht („just tools“). Das
   stützt Cockpit (IT plant und sieht den Stand) plus Update im Aus-Zustand (Pflege muss nichts tun).
7. **Geparkt heißt aus und offline.** „If you don't need it, it's parked somewhere, it's usually
   switched off. There is no connection possible.“ Siemens bestätigt damit die Kernannahme unserer
   Recherche. Die Parkposition im Flur ist der natürliche Ort für Verbindung (Dock, WLAN, Strom).
8. **Patientendaten kommen im OP über das RIS.** Die Pflege zieht die Patientendaten zu Beginn
   aus RIS bzw. OP-Informationssystem. Heißt: Zumindest für die Worklist gibt es im OP eine
   Datenverbindung. Klären, ob derselbe Weg für Logs nutzbar wäre (siehe Frage 1).

## Christians Brainstorming nach dem Pitch (12.11. abends)

Erste Gedanken von Christian direkt nach der Präsentation, sinngemäß übernommen und geordnet. Als
Ideen 15 bis 18 ausgearbeitet in [ideen-vergleich.md](ideen-vergleich.md), gegen das Transkript
bewertet in [bewertung-nach-pitch.md](bewertung-nach-pitch.md).

**Leitgedanke: eine „Dreifaltigkeit“ in einer Lösung abliefern.**

1. **Download vorab und in Etappen.** Das Update wird vorher geladen, zum Beispiel in der Zeit der
   Sterilisierung bzw. Aufbereitung. Ein Update muss nicht in einem Stück laufen, sondern kann in
   mehreren Schritten eingespielt werden. (Idee 15)
2. **Scheduling der Geräte für OPs.** Die Einsätze der Geräte planen und dazu die Vergangenheit
   auswerten, um Einsätze vorherzusagen. Zusätzlich regelmäßige Abfragen (Cron-Jobs), ob in der
   Gegend etwas Schlimmes passiert, zum Beispiel Autounfälle oder Großereignisse. Dafür wäre es
   spannend zu wissen, welche Use Cases es im Notfallbereich gibt. Das Scheduling soll die echte
   Downtime minimieren. (Idee 16)
3. **Systemarchitektur überdenken: gespiegeltes Betriebssystem.** Zwei Partitionen, sodass am Ende
   nur ein Neustart nötig ist und beide Partitionen auswählbar sind. Ist die eine auf dem neuen
   Stand, lädt sich die andere beim nächsten Mal neu. Mit Architektur und Verifizierung prüfen, ob
   das so leicht geht. (Idee 17)

**Dazu: Ownership für die Person am Gerät.** Die im Pitch gespielte Person, die sich um das Gerät
kümmert (Christian nennt sie Techniker bzw. Technikerin, im Pitch ist es die OP-Pflegekraft
„Chris“), könnte animiert werden, am täglichen Lebenszyklus des C-Bogens teilzunehmen und echte
Ownership zu haben: zum Beispiel das Waschen bzw. Reinigen verfolgen, aber auch Updates. (Idee 18)

## Team-Brainstorming: Fragen und Notizen (12.11., ca. 19:40 Uhr)

Vom Team direkt vor dem Gespräch mit den Challenge-Gebern gesammelt, sinngemäß, Rechtschreibung geglättet.

**Fragen an die Challenge-Geber**

- Why the fuck does the person have to stand there to initiate the update?
- Why is it two hours?
- Is there a schedule for this right now?
- Why not in downtime?
- Does the technician have other technology at hand?

Eingeordnet in Top 3 und Shortlist in [bewertung-nach-pitch.md](bewertung-nach-pitch.md), Abschnitt 5.

**Notizen**

- Feedback mechanism: off for updates, anticipate, then back on again, and if not, check in and warn
  other systems. (Idee 19, Rückmelde-Wächter)
- Was wäre ganz avantgarde mit Swap-Systemen, also PCs, die man rein- und rausschiebt wie bei
  E-Rollern? (Idee 20, Wechsel-Rechner)

## Ergänzung von Christian (12.11., 20:50 Uhr)

- „So the critical thing is to find the ‚golden window‘ of opportunity. Three persons in theory are
  responsible.“ (sinngemäß, Rechtschreibung geglättet)
- Neue Ergänzung zur Idee: Bau eines AI-Orchestrators, der den einzelnen Personen hilft, dieses Fenster
  zu finden. (Idee 21, Fenster-Lotse)

Geklärt am selben Abend: Die Aussage stammt vom Challenge-Geber. Die drei sind die Person am Gerät, die
Medizinphysik bzw. Medizintechnik und der IT-Admin, siehe
[gespraech-challenge-geber.md](gespraech-challenge-geber.md), Abschnitt 5.

## Offene Fragen an Siemens (von Christian)

### 1. Wie sind die Geräte heute verbunden?

Was wir schon wissen (aus [research/03-klinik-it-netzwerk.md](research/03-klinik-it-netzwerk.md)):

- Smart Remote Services (SRS) verbindet ausgehend vom Gerät (TLS bzw. IPsec-VPN), die Klinik-IT gibt
  den Weg frei.
- Mobile C-Bögen sprechen DICOM; der Cios Connect listet zusätzlich WLAN (länderabhängig).
- Im OP ist WLAN oft schwach oder nicht vorhanden (Bleiwände, keine Access Points).

Zu klären:

- Wie kommt die Worklist aus dem RIS in den OP (Kabel, WLAN, vorher geladen)? Kann der Service
  diesen Weg mitnutzen?
- Welche Schnittstellen haben die Geräte konkret: Ethernet, WLAN, beides? Je Modell und Baujahr?
- Läuft SRS beim C-Bogen über dieselbe Strecke wie bei CT/Angio, oder gibt es Sonderwege?
- Wo wird heute verbunden, wenn überhaupt: Parkposition, Geräteraum, im OP per Kabel?
- Wer richtet die Verbindung ein (Siemens-Techniker, Medizintechnik, Klinik-IT), und wie lange dauert das?

### 2. Gibt es alte Geräte, wie sieht es mit Abwärtskompatibilität aus?

Was wir schon wissen: Die Bestandsflotte soll laut Interview mit **kleinen reinen
Software-Änderungen** erreicht werden. Regulatorisch sind das Legacy-Geräte (Art. 120 MDR,
MDCG 2020-3), also Service-Schicht ändern, klinische Funktion nicht anfassen.

Zu klären:

- Welche Gerätegenerationen sind im Feld, und wie groß ist ihr Anteil?
- Welche davon können überhaupt Software-Updates aus der Ferne bekommen, welche nur vor Ort?
- Ab welcher Generation gibt es WLAN, A/B-Speicher oder ein steuerbares Herunterfahren?
- Muss unser Konzept für die älteste Generation funktionieren, oder reicht die aktuelle?

Diese Fragen ergänzen die Liste „Offene Fragen an die Mentoren“ im [Briefing](briefing.md).

Beste Gelegenheit für beide Fragen: die Einführung im Training Center am 13.11. Die vollständige,
nach Wichtigkeit sortierte Fragenliste für diesen Termin steht in
[bewertung-nach-pitch.md](bewertung-nach-pitch.md), Abschnitt 5.

## Transkript (bereinigt)

Automatische Transkription der Präsentation, von Christian am 12.11.2026 bereitgestellt.
Offensichtliche Hörfehler sind korrigiert (z. B. „Dr. Clavion“ → Dr. Glawion, „mobile C on“ →
mobile C-arm, „roots“ → RIS, „dills“ → dose, „grapes“ → drapes, „death simple“ → dead simple),
Moderation nach dem Pitch und Füllwörter sind gekürzt. Gesprochen wurde Englisch.

**Glawion (als Chirurg):** Imagine the following situation. Someone you love is on the operating
table. The clinical team relies on real-time imaging, providing visibility. Until suddenly, it
doesn't. Every minute of downtime means less visibility, harder decisions, greater stress, and higher
risk for the patient on the table. This is not just equipment downtime. It's patient care on the
line. Dramatic, is it? Good evening. I'm your surgical doctor of today, and somewhere back there is
one person from my medical staff, Chris. I think he's still looking for one of our main actors,
namely a so-called mobile C-arm. Yes, here he comes.

It's not only in life-threatening situations where it is important that everything in an OR works.
Even if it's just a broken leg which has to be fixed with screws and wires, or a planned spine
surgery because you have back pain: you don't want to be the person who goes into the OR, falls
asleep, wakes up, and the doctor tells you "come back tomorrow, we had issues installing our
updates". That's why in a hospital we have very clear roles and responsibilities about who has to
prepare what for an OR. This is where I rely a lot on people like Chris, who will tell you what he
has to do as an OR nurse.

**Luckner (als OP-Pflegekraft Chris):** First of all, I need to look for the system. It's usually
parked somewhere out there on the hallway, and you bring it in whenever you need it for the surgery.
If you don't need it, it's parked somewhere, it's usually switched off. There is no connection
possible because it's switched off. If we need it, we roll it into the OR, and the first question
is: what are we going to do today, and from where do you want your imaging? From the left side, from
the right side? Where is the patient positioned on the table, and from where do the doctors need
access?

The environment in such an operating theater is quite challenging. It's narrow and small, there's a
lot going on: life-supporting devices in the back, the C-arm here, the instruments in the front, and
a lot of people around the patient making sure the operation runs smoothly.

What do I have to do? First, position the C-arm and make sure the draping is on, so everything is
sterile and no harm comes to the patient. Then I support positioning and cleaning the patient. I'm
responsible for all the instruments, that they are prepared, here at the right time and in the right
size. And I'm also responsible for operating the system. Once everything is set up, I need to pull
the patient information from the RIS, the radiology or surgery information system, to make sure we
operate on the right patient. During the surgery I take images at the right time of the right
anatomy. That involves repositioning the C-arm and changing the X-ray acquisition parameters, so
image quality is sufficient without applying too much dose to the patient and the staff.

**Glawion:** And frankly, this is already a mouthful. And he has to do that on my orders. I have to
take care of the patient. I cannot take care of whether I use the right words or say please. He
better does it the way I want, right now. For me, this and all the other things here are just tools.
I want to take them off the shelf, use them the way I need to, and put them back. And if something
goes wrong, he's the one I'll be shouting at. I know it can be tough. But frankly, I don't care.

*(Szene)* Now we went through this surgery, it luckily went smooth. But wait a second, what? We
really need an update on the system now? Can somebody else take care of that? No, it's urgent. How
much time do we have until the next surgery? The next surgery starts in two hours. Whatever you have
to do, get it done.

**Luckner:** So IT just called. I have to install the update because there's apparently some kind
of virus going around, and we need to make sure we are cybersecure. Cybersecurity is key, you don't
want to lose your patient data. Even though I'm not very keen on IT, let's look what the system can
do. Looks easy to me: there's this one button. It says two hours. What a coincidence, I have two
hours. Software update takes two hours. What could possibly go wrong? Let's click the button.
*(Update bricht ab.)* I guess we do have a problem here. **Glawion:** No, not we. You. Told you so.

**Luckner:** In a nutshell: I love my job. I'm here to take care of patients, but I'm also
responsible for moving those C-arms around. They are impressive, they can do a lot, but I'm already
busy moving them, making sure they're in the right position. They need to be cleaned, they need to be
maintained. And I'm supporting the surgery staff, looking for another set of drapes, another set of
instruments, and so on. So I really don't have a lot of time during surgery. Also, I'm not an IT
person. So everything I have to do on top of that needs to be dead simple. I know how to operate the
system, but that's about it. I don't have time to check anything in advance. So what I would like
from you is a smart solution that makes my life easier and keeps the systems connected, up and
running, and safe to operate.

**Glawion:** That's what we need you for. As you may have guessed, we are doctors, but not medical
doctors. We will give you the opportunity for more insights into the background, the real workflows
in an OR and the responsibilities of the people. Just down the street, 200 meters from here, is the
Siemens Training Center. For those of you who opt for our challenge, tomorrow there will be
introductory sessions at the system with one of our application trainers, who knows all the
workflows inside out. He will explain in detail the tasks and responsibilities you have to consider
and where your solution might fit in. The two of us will be there to answer questions. In the
afternoon, the groups can book hands-on sessions in the training center to validate their ideas and
ask further questions. And it will not be made of cardboard.
