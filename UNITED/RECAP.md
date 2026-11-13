# Aloha Robotics · HH2.0: recap and strategy (Opus)

Everything in the repo was read on 13 Nov 2026, 21:00–23:00: the four transcripts, Christian's whole Challenge 4 folder, the C-arm fleet architecture, the film, the seven characters, decks v1–v4, the encore, Christian's encore copy and ASTRA. This file is the short version of all of it, plus the reasoning behind the new pitch in `OPUS/`.

---

## TL;DR

1. **The real problem isn't the download, and it isn't the robot.** Siemens told us so directly. The bottleneck is a **window**: about 120 minutes when the device, power, network and *one responsible human* all line up. Today nobody finds that window, because three people could press the button and none of them feels responsible.
2. **Our answer, in one line:** an agentic scheduler finds the golden window. KettyBot (or a battery companion) brings power, network and the package to the parked C-arm. One human approves with one tap. Safety rules are tested code, not AI.
3. **We have genuinely built things.** Christian's rule core `planner.js` has 15 passing tests and runs inside a clickable platform prototype. On top of it, `OPUS/js/lib/golden.js` adds emergency-aware probabilities, a backup check and an "is a human awake to confirm" rule (12 passing tests). The swarm on stage runs this code live.
4. **The pitch keeps everything the team loved**: the film exactly as it is, the unhinged characters, light-then-dark, the swarm, the mycelium architecture, IAI and the wink. It cuts the America gag and adds one joke: "BASED ON A TRUE STORY".
5. **It ends on the judges' own words.** "Connected, up and running, safe to operate" is what Siemens asked for in their kick-off pitch. Then: no surgery waits, no phone call, no nurse takes the risk. Invisible. IAI.

---

## 1. The challenge, in their words

**Siemens Healthineers · Challenge 04 · "Invisible Connectivity: Smart Workflow Windows for Mobile C-Arms"** (Healthcare Hackathon Bavaria, Erlangen 2026). Challenge owners: **Dr. Sebastian Glawion** and **Dr. Christoph Luckner**. Siemens also sits on the jury; the briefing names Dr. Lars Hofmann.

At kick-off they acted out a skit. IT calls about a virus, so a security patch is needed now. The update takes 2 hours and the next surgery starts in 2 hours. The nurse presses the one button and the update aborts. Three lines from that pitch are the brief:
- *"Everything that I have to do on top of that needs to be dead simple."*
- *"I don't have time to check anything in advance."*
- *"Make my life easier and keep the systems **connected, up and running, and safe to operate**."*

### What Siemens told us (interviews 12–13 Nov; spoken estimates, not measurements)

| Fact | Source |
|---|---|
| When a mobile C-arm isn't needed it's parked in a hallway, **switched off, often with no socket**. The UPS only covers a safe shutdown. | transcript 04 L13–27, 61 |
| From plug-in to incision there is **at most ~1 hour**. Once surgery starts, no background activity is allowed. | 04 L19–23 |
| The download already happens **in parts** and is checked before the system says "update available". | 04 L29 |
| An update takes about **120 minutes**, which is "fairly average". The time goes into the amount of work, not CPU power. | 04 L195–205 |
| **A human must press the button.** Automatic start is not allowed, but ~99 % of security patches can be started remotely. | 04 L69–75 |
| **Three roles could press it, and none feels responsible**: the OR nurse, medical physics or biomed, and IT. "A problem of *feeling* responsible." | 04 L31–83, 353–357 |
| About **2 % of updates end "dead on arrival"**, for example because someone unplugs mid-update or a subsystem can't be reached. It's "fire and pray". | 04 L39–41, 179–193 |
| **Siemens learns about failures from angry phone calls.** Rollouts are staged, and a faulty package can stay "in the belly" of a device. | 04 L207–223 |
| 85–90 % of daytime cases are planned. Emergencies are polytrauma and open fractures, and the **polytrauma alarm is a usable trigger**. | 04 L145–175 |
| Their own favourite idea is a **battery companion device beside the C-arm**. R&D likes it but says it won't work: "I'd like to show that it can work." | 04 L335–347 |
| Mechanical calibration is **out of scope**. Focus on software updates, connectivity and the log return channel. | 04 L313–325 |
| Siemens has been trying to fix this connectivity problem for **about two decades**. Uniklinikum Erlangen doesn't allow Wi-Fi in its ORs. | 04 L237, 275 |
| Logs are a flight recorder with no patient data. Today they are only kept for about 2 weeks, and "can you send logs?" usually gets "I already switched it off". | 02 L121–131, 175 |

### How the judges will read us
Christian's briefing describes them as two product and tech people from X-ray imaging who want to move one metric: the share of the installed fleet that is connected and up to date. Their questions will be: does it fit SRS and teamplay Fleet? Is it a small software change? Does it disturb the OR? "Pure network or security architecture" will land as "we already have that". **Speak service business: downtime, on-site visits, service cost, phone calls.**

Scoring (from you): **presentation + technical + impact/solution**.

---

## 2. What the team already has: honest inventory

| Asset | Where | Verdict |
|---|---|---|
| **AI film**, 30.4 s, 1080p, with sound. OR → nurse chases a manic C-arm → plug-in → install → bliss → glitch, rollback, explosion → sooty surgeon → flirty KettyBot winks → fireball → black with embers. | `CARMAGOTCHI_Web_Pitch/pitch/media/chaos_intro.mp4` (= encore copies) | **Excellent. Kept untouched.** The audio is still loud on the very last frame (hard cut), and the new segue picks up from exactly that. |
| **7 characters** (lonely, manic, update, bliss, failure, rollback, KettyBot), 940 px transparent webp | `pitch/assets/` | Excellent and consistent. Each one maps onto one real problem, which is how the Tamagotchi slide now uses them. |
| Decks v1–v4 + encore (9 scenes) | `CARMAGOTCHI_Web_Pitch/` | Good engine and tone. Weak spots: the America gag eats 10 s; the tech part is boxy and reads like a slide; the schedule is small; the robot scene repeats the film. |
| **Christian's platform work**: briefing, synthesis, platform concept, specs (scheduling AI, robot cockpit, hospital IT security), personas, **clickable prototype** with a planning board, golden windows, device file, robot cockpit, control room, and **`planner.js` with 15 tests** | `team-material-christian/challenge-4/` | **The technical backbone.** The clearest thinking in the repo: rules are code, the AI only proposes, one question per role, no patient data. Under-used by the pitch so far. |
| Siddhant's fleet-architecture doc (KettyBot dock, WoL, VHDX A/B, DoD air-gap) | `autonomous_c_arm_fleet_architecture.md` | Big ideas, but too many unverified claims to put on stage ("zero bricking risk", exact power figures). Fine for Q&A. Don't put its numbers on a slide. |
| ASTRA | `ASTRA/` | Careful research and a well-tested engine. As a pitch it threw away what makes this team memorable (it cut the film to 5 s and muted it, dropped the characters). Good research notes, wrong direction for the stage. |
| Prior KettyBot experience? | Siddhant's public repo `Robotics_AI_Hackathon_Siemens_Healthineers_2026` (Oct 2026) has a PUDU KettyBot Pro spec sheet and robot dashboards | **Check with Siddhant.** If you really built on a KettyBot before, say so in Q&A: it's strong credibility. |

---

## 3. The solution we pitch (brain · hands · rules · humans)

- **Brain: an agentic scheduler (the "golden window").** It reads the OR plan (room and time only, never patient data), device usage history, the duty roster and the polytrauma alarm. It tests every legal gap and picks the window with the **highest probability of finishing undisturbed**: 120 min install + 30 min rollback buffer. It names a backup C-arm that is free for the whole window. On an alarm it replans the fleet in milliseconds.
- **Hands: KettyBot or the companion.** No socket in the hallway? KettyBot brings power, network and the signed package. It reports "area clear" (LiDAR, no stored images), guards the install ("hands off, I'm updating"), notices a device that doesn't come back, and carries the logs home on every visit. **The companion** is the same job without wheels: the challenge owners' own favourite idea, for hospitals without a robot.
- **Rules are code, not AI.** The rules: never during a case, never a motion or calibration update remotely, never without a human confirming, never on thin data, never the whole fleet in one night, lock on alarm. They are pure functions with tests, so no model can override them.
- **Humans decide, one tap each.** Medical physics approves the window and IT on call confirms the start remotely. The OR nurse is **never asked to decide**. Every decision is logged, which gives you the compliance evidence (NIS2, MPBetreibV) for free.
- **The heart: the Tamagotchi.** The expert agreed that "connection" can also be emotional ("Yes, if you can make that work"). The character turns "nobody feels responsible" into "somebody cares".

---

## 4. What changed in the pitch, and why

| Decision | Why |
|---|---|
| **Film plays untouched, full sound, cold open.** No title card before it. | You said it's perfect, and it is. A cold open is the strongest first 30 s you can have. |
| **Explosion → embers → "BASED ON A TRUE STORY." → embers form INTRODUCING ALOHA ROBOTICS.** It's automatic, with a synthesized boom tail that covers the film's hard audio cut. | It's your requested segue. "Based on a true story" gets a laugh *and* sets up the next slide: every absurd scene in the film is a real fact. |
| **America/Palmer gag removed.** | 10 seconds with no link to the problem. You suspected it already. |
| **Tamagotchi = a life-cycle ring.** Six faces, each with "WHAT IT REALLY MEANS" taken from the interviews, ending in a loop that speeds up: "every quarter, it starts again". | The characters stay unhinged, but each one now *proves research*. The loop dramatises "20 years, every 90 days". |
| **CRT power-off → "The update isn't the problem. Finding the window is."** | The tone flips in one sentence, and that sentence is the expert's own conclusion. |
| **The swarm runs real code.** Rules stamp out the impossible first (up to date, motion update, thin data), then 230 agents hammer about 300 candidate windows on the four eligible C-arms. The golden window appears (Cio, 19:10, 95 %, KettyBot brings power), a polytrauma pre-alert hits, and the fleet replans in about 2 ms (Bogdan 22:20). Then one tap. | It's your swarm and golden nugget, but true. Every label, number and log line on screen comes from `golden.js`, which is how "technical" turns into "they built it". |
| **Architecture grows like mycelium** from one spore (the Aloha core) to the hospital, Siemens, the device (KettyBot → C-arm turns happy) and the people. The title becomes "Agents propose. Rules constrain. Humans decide." | It's your fungus request. Organic growth reads as *a platform*, not a gadget, and the final line is the safety story in five words. |
| **Outro uses their own words**, then three "withouts", then the text dissolves ("invisible."), then IAI, Aloha Robotics, KettyBot winks, "Any technical questions?". | No numbers, only solutions. The judges hear their kick-off sentence back as solved, and the dissolving text *is* invisible connectivity. |

---

## 5. Run of show (3:00)

| Time | Scene | Click |
|---|---|---|
| 0:00–0:30 | Film (silent presenter) | 1 click starts it |
| 0:30–0:37 | True story → INTRODUCING ALOHA ROBOTICS | automatic |
| 0:37–1:13 | Tamagotchi ring: lonely, desperate, installing, bliss, dead on arrival, rollback, loop | 7 |
| 1:13–1:18 | CRT off → "Finding the window is." | 1 |
| 1:18–1:56 | Swarm: day → hunt → golden → polytrauma replan → one tap | 5 |
| 1:56–2:30 | Mycelium: core → hospital → Siemens → KettyBot/C-arm → people | 5 |
| 2:30–2:53 | Outro: their words → withouts → invisible → IAI → Aloha + wink | 4 |

The full spoken script is in [`SCRIPT.md`](SCRIPT.md), and the presenter view (`presenter.html`) shows it live with a clock.

---

## 6. Q&A: what they will ask

| Question | Answer (short) |
|---|---|
| "Is the AI starting updates on its own?" | No. The rule core forbids it and a human confirms every start. The agents only *propose* windows and write the one question for each role. |
| "Where does the emergency probability come from?" | Device usage history per weekday and hour, plus the emergency rate (polytrauma pre-alerts from the dispatch centre) times the share of emergencies that would pull this C-arm. The demo data is synthetic. In a pilot it is learned from 8+ weeks of logs and calibrated against what actually happened. |
| "Why a robot to plug in a cable?" | A calendar can't plug in a machine, and the hallway has no socket. The robot does the last metre *and* guards the 2 hours, because unplugging mid-update is a known cause of dead-on-arrival devices. No robot? The companion box does the same job without wheels. That was your own favourite. |
| "Does it make the 2 hours shorter?" | No, and we don't claim it does. It makes sure the 2 hours happen at the right time, with power, with a backup C-arm ready, and with someone watching for the device to come back. A/B images would be the next-gen step. |
| "Emergency after the install started?" | We never abort a running install. The backup C-arm is activated, and the guardian reports immediately if the device doesn't come back. |
| "Integration effort?" | Read-only OR plan (room + time), teamplay Fleet for package status, the alarm signal, and one approval in the tool each role already uses. No change to the C-arm. |
| "What did you actually build?" | A rule core with 15 tests, a golden-window scorer with 12 tests, a clickable platform prototype, and this live swarm running the scorer. Everything is offline, with synthetic data. |
| "Privacy and works council?" | No patient data at all. People appear as roles and shifts, never as performance data. Robot camera frames are evaluated on the robot and never stored. |
| "Business case?" | Fewer on-site visits just to install Windows patches (Siemens said those cost a lot), fewer dead-on-arrival callouts, logs on every visit enabling predictive service, and compliance evidence (NIS2, MPBetreibV) for the hospital. |

---

## 7. Risks and how they are handled

- **Autoplay or sound:** the film starts on the first keypress (a user gesture, so sound is allowed). If a browser still blocks it, a ▶ button appears. Rehearse once on the real laptop and projector.
- **Seeking:** `python -m http.server` can't seek in video. Use `python3 OPUS/serve.py` (range-capable) or GitHub Pages. Opening `index.html` straight from disk also works: the fonts are embedded.
- **Running long:** words in [brackets] in the script are optional, and the presenter view shows ± seconds against the plan. The cut-down version drops tama beat 4 (bliss) and arch beat 2 (Siemens).
- **Overclaiming:** the slides say "synthetic", "concept" and "proposed" where needed. The 120 min, 2 % and 99 % figures are attributed to Siemens' own statements. Don't add numbers on stage.
- **Weak projector:** the canvas effects are capped at 1.5× resolution, and there's no WebGL, so it runs smoothly on integrated graphics.

---

## 8. Day-of checklist

1. Chrome or Edge, laptop on power, notifications off, sound to the room.
2. `python3 OPUS/serve.py`, then open `localhost:8000/OPUS/` on the projector and press **F** there (this also unlocks the film's sound: the standby dot turns green). Press **P** to open the presenter view on the laptop screen.
3. Press **R** to make sure you're on the black standby screen. Speaker ready, clicker tested (→ / PgDn).
4. Run it once. Check the volume on the explosion and the title hit (**M** mutes only our sound effects, not the film).
5. Team names on screen: add them to `OPUS.TEAM` in `js/notes.js` (empty = no names). Decide who speaks Act I and who speaks Act II.

## 9. Open items for the team
- The **names** of the presenters and whether to show them (currently not shown).
- Is the KettyBot claim backed by hands-on experience (Siddhant)? It's a strong Q&A point if so.
- Christian's `encore-christian` copy suggests he is reworking the storyboard. Merge ideas, don't fork the story.
