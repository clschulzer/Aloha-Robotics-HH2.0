# Aloha Robotics / C-ARMAGOTCHI — research recap

Prepared 13 November 2026 for the revised three-minute website pitch. Source snapshot: `HEAD` and `origin/main` at `eae716a1e03df701c7f84902906ba6cc189e6cd1`. This document distinguishes the team's evidence, working demonstrations, proposed product and longer-term technical ideas. It follows the requested presentation: **full original film → six unhinged character states in light mode → serious dark transition → visual search for the golden window → flowing architecture → short close.**

The team's formula remains the useful organizing idea: **the platform is the brain, the robot is the hands, the Tamagotchi is the personality.** The central product is a service platform around the machine. The robot gives it a physical presence and a memorable demonstration; the character makes an otherwise neglected maintenance state legible.

## 1. What the challenge actually asks

Siemens Healthineers' Challenge 4 is “Invisible Connectivity: Smart Workflow Windows for Mobile C-Arms.” A mobile C-arm provides imaging during procedures; its clinical users have many simultaneous tasks. Unlike a fixed CT or MRI installation, it moves between rooms, corridors and storage. When it is available for maintenance, it is often switched off and unplugged.

The challenge owners' opening sketch deliberately made the coordination failure visible: IT requests an urgent security update; the next operation is in two hours; the display estimates two hours; the operator presses the button; the update fails; the operator takes the blame. The subsequent interviews explain what is real beneath that theatrical setup.

Three short statements capture the brief:

- The operator: “Everything that I have to do on top of that needs to be dead simple.”
- The expert's two directions: find the “golden windows of opportunity” and establish backend connectivity independently of the main system being switched on.
- The meaning of invisible: users should not have to think, “Is the system connected?” It should simply work.

Sources: [challenge presentation and transcript](../team-material-christian/challenge-4/pitch-notizen-siemens-healthineers.md), [workflow interview](../transcripts/02_hospital_workflows_updates_and_remote_support.md), [merged challenge interview](../transcripts/04_invisible_connectivity_challenge_interview_merged.md).

## 2. Evidence from the conversations

The transcripts contain expert descriptions, participant proposals, recollections and rough estimates. They are not measurement reports or interface specifications. The cleaned recordings use role labels rather than identifying every speaker. Team notes identify the challenge presenters as Dr. Sebastian Glawion and Dr. Christoph Luckner.

| Evidence | What it means for the solution |
|---|---|
| Unused machines are usually parked, switched off, and sometimes nowhere near an outlet. Storage can be crowded or blocked. | A free calendar interval does not prove physical accessibility, power or connectivity. The robot/companion solves a concrete additional constraint. |
| Downloads already arrive in chunks when a connected system is available. | “Resumable download” alone is not the new product. Coordinate installation and make contact possible. |
| An update estimate around 120 minutes was described as realistic and fairly average. Many distributed components, backups, installation and restoration can be involved. | Keep installation duration in the scheduling model. Faster transfer does not imply a few-minute installation. |
| During an open examination, deeper operations are restricted. Risky background service must not disrupt the procedure. | The serious pitch should show a maintenance opportunity outside clinical use. The chaotic film is fictional exaggeration. |
| A human must confirm that it is the right time to start. | The golden window is a proposal; it does not authorize execution. |
| Clinical operators, medical physics/clinical engineering, and IT each hold part of the problem; the person receiving update information may be far from the machine. | Coordinate responsibilities and give each role a small, relevant decision. Do not make the operator learn a new IT workflow. |
| Failures may be discovered when the customer calls the next day. Rollback usually exists but takes a variable amount of time. | Watch for expected return, expose missing return, route the issue and identify backup equipment. “Installation finished” alone is not a clinical release. |
| A rollout can stop after faulty packages have already been downloaded to machines. | Package eligibility and revocation must be checked again before starting. |
| Logs are valuable for remote diagnosis, but staff may already have switched off the machine when service asks for them. | The return channel is as important as package delivery. Carry permitted logs back during contact. |
| Mechanical movement, detector/tube calibration and work involving radiation require an appropriate controlled area and an on-site service technician. | Keep these tasks supervised; do not turn the maintenance robot into an autonomous clinical operator. |
| Hospital policies can prohibit connectivity even if a radio works. The Erlangen no-WLAN example is local, not a universal rule. | Use a hospital-approved path. Moving data by robot does not remove authorization requirements. |
| Power enters via a regular mains connection; LAN, WLAN and USB exist on the discussed systems. The internal UPS supports safe shutdown. | Physical power/data are plausible connection points, but a service battery and coupling need engineering validation. The UPS is not an operating battery. |

Sources: [machine walkthrough](../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md), [workflow and remote support](../transcripts/02_hospital_workflows_updates_and_remote_support.md), [team debrief](../transcripts/03_team_debrief_on_the_core_problem.md), [challenge interview](../transcripts/04_invisible_connectivity_challenge_interview_merged.md).

### Important unresolved details

**Remote delivery and remote initiation are different.** In the walkthrough, the expert says teamplay Fleet informs users about updates but cannot start an update; someone presses the button at the system. Christian's later recollection says initiation is “more or less” possible remotely for common updates. The scheduling and security specifications correctly leave the exact supported start path as a question. The pitch can say an authorized person confirms through a supported service path; it should not invent a teamplay Fleet start API.

**The companion can stay connected while the C-arm is off; the C-arm cannot therefore be assumed reachable.** A separately powered device can cache an update and upload logs it already holds. New logs, configuration reads, transfer and installation require the main device to be available through a supported interface.

**Wake-on-LAN is a possibility, not a verified C-arm feature.** The expert thought it should normally boot the PC, but also described a manual power button and no direct customer access to the PC. Standby power, model, firmware and permitted operation remain open.

**The failure comedy has a technical origin.** The team debrief discusses backed-up parameters that cannot be restored into an updated configuration. That supports the restoration/rollback joke and a preflight research direction. It does not establish that a complete shadow twin or guaranteed rollback has been built.

**Numbers in the notes are not measured benefits.** Approximately 120 minutes, roughly 2% unusable after update, around 99% remote-capable security updates, 85–90% planned daytime procedures, and an estimated €80 per OR minute are oral figures or team notes. Do not turn them into fleet-wide failure forecasts, guaranteed savings or achieved results. The main performance can show time constraints and use actual calendar times without a slide of impact claims.

## 3. How the team's thinking developed

The documents are a history of learning, not a single consistent specification.

| Material | Contribution | How to read it now |
|---|---|---|
| [Research synthesis, 11 November](../team-material-christian/challenge-4/research/00-synthese.md) | Service-first framing, diagnostic logs, clinic IT as gatekeeper, delay-tolerant contact, regulatory questions, QR bridge and update classification. | Useful background, but its assumption that A/B updating was already available is superseded by the interviews. |
| [Early personas](../team-material-christian/challenge-4/personas/personas.md) and [journeys](../team-material-christian/challenge-4/personas/user-journeys.md) | Eight perspectives spanning operators, surgery, engineering, IT security, medical physics, remote service and field service. | Fictional people and invented times. The “unplug during installation and instantly boot the old version” journey is aspirational, not supported installed-base behavior. |
| [Kickoff notes](../team-material-christian/challenge-4/pitch-notizen-siemens-healthineers.md) | Captures the source sketch, “dead simple,” the blame problem, early parallel-install and replacement-PC ideas. | Early interpretation calls two hours theatrical; later expert conversation confirms it is a realistic duration. Preserve that correction. |
| [Post-interview synthesis, 13 November](../team-material-christian/challenge-4/synthese-nach-gespraech.md) | Makes the window planner central, retains the avant-garde robot, adds the return watcher, and defines the companion as “the hand without wheels.” | Main product synthesis. Some remote-start statements rely on Christian's recollection; use the later specification's explicit open question. |
| [People and goals](../team-material-christian/challenge-4/menschen-und-ziele.md) | “Unsichtbare Helfer bekommen Hilfe”: reduce calls, pressure and unnecessary interactions for the people keeping the hospital running. | Outcome hypothesis. Preserve the operator's dignity; the mascot is not an employee-performance game. |
| [Platform concept](../team-material-christian/challenge-4/plattform-konzept.md) | One maintenance window can also support checks, service visits, training, evidence and other services. Named helpers share device file, calendar and rules. | Breadth of product vision. Most additional services are labelled “Ausblick”; don't present all as implemented integrations. |
| [Scheduling, cockpit and clinic-IT specs](../team-material-christian/challenge-4/entwicklung/README.md) | Separate deterministic rules, proposed ML/LLM roles, authorization, robot control and security boundaries. Explicitly inventory missing functionality. | Development preparation, not evidence that those production systems exist. |

The five individual research files referenced by `research/00-synthese.md`, including regulatory and network studies, are **not present in this checkout**; only `00-synthese.md` is present in that directory. Several other historical links, such as `ideen-vergleich.md`, also point to material not included here. This recap uses the available synthesis and clearly marked statements; it does not imply the absent underlying sources were independently verified.

## 4. What the team has actually built

### A. A substantial interactive service-platform prototype

The [Klickdummy](../team-material-christian/challenge-4/klickdummy/README.md) is an offline browser application with no framework or build step, local fonts, German/English text, light/dark views, synthetic records and persisted demonstration state. It goes substantially beyond a slide mock-up.

- **Planning board:** device/room views, day/week planning, a “fill gaps” action, proposed maintenance windows, reasons, reserve devices, robot constraints and an alarm scenario.
- **Device files:** version, due work, six component illustrations, usage history, logs, contracts and checks. These are invented device data, not a connected digital twin.
- **Companion:** the same C-arm character artwork, needs, status, short requests and a diary; a way to explain device state.
- **Robot cockpit:** a map, a twelve-step service mission, simulated surroundings scan, holds, blocked route, communication loss and manual steering.
- **Control room and human jobs:** asks a person on duty and available to accept a small task. Declines move on; the platform does not answer for the person.
- **Other service views:** maintenance/checks, service-visit preparation, training, reporting, location planning, manufacturer feedback and a prospective night shift. These visibly distinguish later possibilities.
- **Guided presentations:** a six-scene three-minute route and a longer exploratory route.

The actual source is [app.js](../team-material-christian/challenge-4/klickdummy/app.js), [planner.js](../team-material-christian/challenge-4/klickdummy/planner.js), [data.js](../team-material-christian/challenge-4/klickdummy/data.js), [index.html](../team-material-christian/challenge-4/klickdummy/index.html) and [i18n.js](../team-material-christian/challenge-4/klickdummy/i18n.js).

### B. A real deterministic planning core

`planner.js` exposes pure functions usable in both Node and the browser:

| Function | Implemented behavior |
|---|---|
| `findWindow` | Searches a day's candidate starts on a grid; checks planned cases, post-case lead time, installation duration, reserve time, risk inputs and robot occupancy. Refuses arm-movement updates and insufficient/missing data. |
| `fillGaps` | Plans by update deadline then stable ID; applies a per-day concurrency cap, robot reservations and a replacement-device assignment; explains unresolved devices. |
| `windowRisk` | Returns the largest supplied hourly usage frequency in the interval. Missing values remain unknown. This is a historical-use proxy and a lower bound, not a calibrated probability of any emergency across the whole window. |
| `pickErsatz` | Excludes failed devices, overlapping update assignments and already-reserved replacements; prefers current software. It does not fully establish the replacement's own clinical availability or reachability. |
| `reschedule` | Recomputes a window on the same day after alarm blocks while respecting other robot/replacement assignments. |
| `canStart` | Requires the supplied approval, surroundings, device-use, alarm and package conditions; forbids remote arm-movement updates. |
| `urgency` | Produces an operational sorting score from deadlines, checks, contract availability and failure status. It is not a clinical risk score. |

The demonstration assumptions are visible in `RULES`: 120-minute installation, 30-minute reserve, 20-minute post-case lead time, ten-minute grid, at least four weeks of history, and at most two planned updates per day. The eight invented machines are Cora, Bogdan, Cio, Arcus, Fritzi, Rudi, Nova and Otto. Rudi exercises the arm-movement exclusion; Nova has thin history; Otto represents high emergency/standby usage; Cio needs physical power.

There are [15 planner tests](../team-material-christian/challenge-4/klickdummy/planner.test.cjs). The existing [QA report](../team-material-christian/challenge-4/entwicklung/qa-klickdummy.md) records a passing rule-test/browser run against its stated review snapshot and also records unresolved issues. This recap is source review, not a new browser-certification claim.

Production gaps are explicitly documented in [the scheduling spec](../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md): overnight/DST handling; actual source freshness; emergency-area propagation; replacement availability until next use; expiry of approval after plan changes; true role authentication; and authenticated device/package interfaces. The cap currently counts calendar days, not a night spanning midnight. The QA report also flags an inadequately guarded supervised-arm completion path. Browser role switches and disabled buttons are demonstration behavior, not server security.

### C. A cinematic, executable pitch system

[The current full deck](../CARMAGOTCHI_Web_Pitch/pitch/index.html) has fourteen main scenes and two technical appendix scenes. [The encore](../CARMAGOTCHI_Web_Pitch/encore/index.html) has nine main scenes, synchronized presenter notes, keyboard/clicker navigation and animated per-click reveals. HTML/CSS/JavaScript provides a fixed 1920×1080 stage that scales to the screen, controlled transitions, local media, blackout, fullscreen and hash-based navigation. The code uses `BroadcastChannel` and local storage for same-browser presenter synchronization.

The original encore is explicitly for judges who have already seen the longer solution presentation. It therefore compresses the technical explanation considerably. The requested ASTRA revision keeps its entertainment and visual language, expands the visual scheduler, puts it before architecture, and fits the result into six acts.

`encore-christian` was added in commit `2c5b37f`. At the reviewed snapshot it is still substantively the same story: its JavaScript differences are the isolated broadcast/storage names; the main HTML and assets do not supply a newly revised narrative. It is a useful independent editing entry point, not new technical evidence.

### D. What “built” does not establish

No reviewed file demonstrates a live connection to a C-arm, a working manufacturer API, an approved remote-update path, a physical KettyBot cable dock, a trained emergency-prediction model, a deployed LLM agent service, or a validated whole-device shadow simulation. The existing animations and testable planning logic make the concept concrete; hardware and clinical validation remain future work.

## 5. The proposed product and architecture

### The useful end-to-end loop

1. **Recognize:** a device needs an update, logs, a check or service.
2. **Plan:** combine theatre occupancy, update class/duration/deadline, usage history, reserve equipment, power/access and available resources.
3. **Prepare:** confirm package eligibility, physical access and the responsible roles. Bring connectivity to the parked machine when necessary.
4. **Authorize and execute:** the designated human confirms through an approved path; the device's supported maintenance process performs the update.
5. **Watch and report:** expect a return, collect permitted logs, surface an exception and reserve coverage.
6. **Record and improve:** keep the decision history and actual outcomes; later use them to improve estimates and service planning.

This loop lets software provide value even in a hospital that never buys a robot. A robot serves multiple parked devices; a separately powered companion is another way to decouple communication from the main device. They are alternatives or complements, not opposing pitches.

### Proposed division of software responsibilities

The more developed [clinic-IT architecture](../team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md) recommends a local hospital node containing adapters, rules, planning, cache, authorization, cockpit and audit services. The manufacturer side supplies approved packages, eligibility/revocation metadata and fleet/service information through an approved outward-established connection.

- **Inputs:** room, time and device need from the theatre plan; role, shift and area from staffing; device identity, software, service class, power/contact and package status; emergency alarms with timestamps.
- **Deterministic core:** controls admissibility and start prerequisites. Missing data does not become a free slot.
- **Usage model:** starts as historical frequency by hour/day; a learned model is a later proposal requiring calibration against that baseline.
- **Optimizer:** a future constraint solver can improve fleet allocation. The current planner is a transparent greedy search, not a globally optimal scheduler.
- **LLM:** explains structured decisions, drafts role-specific messages and translates questions into permitted queries. The specification gives it no ability to override rules or initiate an update; text templates remain a fallback.
- **Orchestration:** coordinates Scout/Lotse, Risk Sentinel, Preflight, Messenger/Bote, Watcher/Wächter and other service roles around the same device file, calendar and constraints.

The stage's three specialist names are a comprehensible rendering of these responsibilities. They should not imply three independently deployed clinical AI systems.

### Physical path and trust path

The robot is intended to carry power and cached data to one accessible, parked device, verify identity, make an approved connection, wait through service and take logs back. The [robot cockpit specification](../team-material-christian/challenge-4/entwicklung/spec-robot-cockpit.md) separates mission progress from hold reasons; clearing a software stop must not silently clear an underlying obstacle.

The security proposal treats cache, robot and companion as transport rather than trust authorities. Manufacturer package verification belongs at the device end. The proposed coupling is store-and-forward, with no routing between hospital network zones. Human decisions are intended to bind device, package, time window and plan version, with authenticated roles and audit evidence. Hardware-backed signatures and certificates are design proposals, not existing browser features.

Physical and software safety remain distinct: the cockpit's remote stop is not the robot's hardware emergency stop; a surroundings indication is not a guarantee of an empty clinical environment; calibration and clinical release remain with authorized people. The robot's installed battery must be sized from measured load, installation plus possible recovery duration, and approved electrical interfaces.

### The ambitious separate hardware architecture

[autonomous_c_arm_fleet_architecture.md](../autonomous_c_arm_fleet_architecture.md) offers a detailed future direction: a mobile pit crew with a ROS 2 hardware abstraction layer, KettyBot payload, optional arm-AMR, optical markers/location tags, external power, Wake-on-LAN, log collection and an A/B native-boot VHDX scheme. It also proposes worklist transfer and multiple data-coupling options.

That document is valuable as a catalogue of engineering ideas. Its claims of universal backward compatibility, known Windows internals, 30-second rollback, zero bricking risk, particular power figures and a guaranteed reduction in installation time are not supported by the machine interviews or the prototype. Its patient-worklist path and DoD/SCIF framing introduce additional scope absent from the minimal patient-free hospital-node design. The useful parts for this pitch are **external service embodiment, power plus data, physical identification and modular robot hardware**. The detailed OS swap and other extensions belong to research, not an achieved demo claim.

## 6. Assets and the original entertainment

The character showcase is part of the concept, not decoration to remove. The [brainstorm](../CARMAGOTCHI_Web_Pitch/source/brainstorm.md) deliberately asks for an absurd healthcare pitch, needy Tamagotchi behavior, a robot entrance, exaggerated relief and cable innuendo. The requested revision preserves that energy.

The original six states from [encore.js](../CARMAGOTCHI_Web_Pitch/encore/encore.js) are:

| Asset | Large text | Character quote |
|---|---|---|
| `lonely.webp` | GHOSTED BY THE NETWORK. | “It’s been 43 days since someone connected me.” |
| `manic.webp` | CRITICALLY UNSTABLE. | “PLEASE PLUG ME IN. I’LL BE GOOD.” |
| `update.webp` | INSTALLING IMPULSE CONTROL. | “Oh. That feels like a very important patch.” |
| `bliss.webp` | EMOTIONALLY STABLE. | “Ahhh... operating within approved parameters.” |
| `failure.webp` | RESTORATION FAILED. | “Wait... why do I remember everything?” |
| `rollback.webp` | ROLLBACK INITIATED. | “YOU CAN’T DELETE WHO I AM.” |

`ketty.webp` is the robot companion. Transparent and white-background variants are present. [The asset manifest](../team-material-christian/challenge-4/klickdummy/assets/carmagotchi/README.md) records their reuse from the team pitch. Existing generated artwork includes brand marks; this recap makes no new claim of endorsement.

The **current original film** in `pitch/media/chaos_intro.mp4`, `encore/media/chaos_30s.mp4` and `encore-christian/media/chaos_30s.mp4` is byte-identical. SHA-256: `b5ba0eaaaa37c1622e754fc57ca9b9825a2f24554705379b261eb53626299f30`. Media inspection reports **30.442667 seconds** including audio. Older v2/v3/v4 backup copies last about 40.6333 seconds, explaining stale “40-second film” notes.

The current film ends with Ketty's wink, a flash/explosion and embers fading on black. It contains **no burned-in “INTRODUCING ALOHA ROBOTICS” title**. The revised presentation therefore lets the entire movie finish unchanged and reveals that title in live HTML for 3.557333 seconds, making the opening act exactly 34 seconds. No narration competes with the movie.

The original large type, paper/light character stage, strong dark transition and moving agent lines are appropriate foundations. The [design research](../team-material-christian/challenge-4/design-richtlinie-siemens-healthineers.md) explains white, dark imaging surfaces, orange and petrol, with local open fonts. The entertainment section should feel theatrical; the serious section should reveal one mechanism at a time rather than become a dense product dashboard.

## 7. The requested three-minute presentation

| Act | Clock | Purpose |
|---|---|---|
| Full original AI film + live Aloha title | 0:00–0:34 | Play the complete team's film with audio. The title is its landing. |
| Six character states, light mode | 0:34–1:10 | Preserve the escalation, the relief, the restoration failure and the returning personality. Let the pictures earn the laugh. |
| Serious dark transition | 1:10–1:18 | Let the humor stop. State that free clinical time and maintenance readiness do not automatically coincide. |
| Visual agentic scheduler | 1:18–2:06 | Show searches, failed candidates, emergency standby/usage exposure, sufficient time and reserve coverage; converge on a proposed golden window. |
| Flowing architecture | 2:06–2:46 | Follow information into specialists and rules, through human authorization and the physical power/data path, then back as logs and return status. |
| Quick close | 2:46–3:00 | “The machine is ready” is the intended outcome. Reveal “NOW, BACK TO THE PATIENT.” Stop. |

The scheduler's animation can be frantic; its explanation should remain calm. Short rejected gaps and emergency standby communicate the constraint better than arbitrary interruption percentages. The actual proposed device/time should come from the planner, not a sentence hard-coded into the speech. The main visual does not introduce a separate emergency-arrival/replanning act; it shows emergency demand as a reason to challenge seemingly empty time.

The architecture carries the technical spoken content. Minimal on-screen labels are enough: schedule, device state, Scout, Risk, Preflight, rules, authorization, power/data, logs. Human confirmation, prototype boundaries and clinical release can each be communicated once in the corresponding action. They do not need separate slides.

The exact words and cue times are in [SPEAKER_SCRIPT.md](SPEAKER_SCRIPT.md).

## 8. What to validate after the hackathon

The next work follows directly from the evidence rather than invented impact targets:

1. Confirm the exact supported device, package, service and start interfaces with Siemens; resolve the difference between remote delivery and remote initiation.
2. Obtain a representative theatre schedule and device-usage history without patient identifiers; test planner rejection and reserve coverage against clinical review.
3. Measure actual installation and recovery distributions, service power draw, time in usable parking locations and the effort required to establish contact.
4. Validate the external coupling, battery, supported power states and physical access in an appropriate test setting.
5. Establish hospital authorization, alarm freshness, network/data permissions and responsibility for a missing return.
6. Compare completed maintenance, staff interactions, discovery time for failures and service preparation against a baseline. Treat any business case or new managed-service offering as a hypothesis until those measurements exist.

These are follow-up questions, not additional acts in the three-minute pitch.

## 9. OPUS comparison — 13 November 2026

Read the new [OPUS README](../OPUS/README.md), [research recap](../OPUS/RECAP.md) and [speaker script](../OPUS/SCRIPT.md) in full at commit **`09041bf74b0da82a4e586721b44acb1ae3d221b6`**. This is a later source snapshot than the research above. OPUS is another presentation interpretation of the same team material, not additional interview evidence. A final upstream check also incorporated merge `c7f125d`, which fixes OPUS's outro line/timer cleanup; it adds no new research or planning model.

Its most useful contribution is continuity between the pictures and the mechanism:

| OPUS idea | Learning for ASTRA |
|---|---|
| Apparently empty calendar space turns out to be unusable. | Make each rejected gap legible, then let the scouts converge on a checked candidate. The audience should see why that window survives. |
| Architecture grows from one core into the hospital, manufacturer, physical endpoint and people. | Carry the visual energy from the search into a growing service loop. Animate meaningful information paths and the returning logs; avoid a static wall of boxes. |
| The robot solves the “last metre”; a companion provides another physical form. | Keep power/data attached to the parked device in the architecture. Explain the companion once, without another robot scene. |
| The interviews' responsibility problem gives the characters a real basis. | Retain that evidence in the serious explanation and Q&A. Preserve the original six funny character beats; do not turn their light-mode showcase into a second problem lecture. |
| “Agents propose. Rules constrain. Humans decide.” | Preserve this division of responsibility throughout the animation. A swarm is a visual explanation of search, not evidence of deployed clinical agents. |

Several OPUS claims need a different evidential standard. Its documentation advertises a new probability scorer, 12 passing scorer tests, a 95% uninterrupted window and a millisecond fleet replan. At this commit, `git ls-tree` contains the test file but **does not contain the referenced `OPUS/js/lib/golden.js` or `OPUS/js/lib/planner.js`**. This review therefore cannot verify that scorer or reproduce its advertised tests. Even a functioning synthetic probability formula or measured browser execution time would not establish calibrated hospital emergency probabilities or clinical response time.

ASTRA keeps the available team's deterministic planner and its explicitly illustrative usage-risk proxy. It does not import the percentage, agent count, replan-speed claim, guaranteed absence of surgery delays or calls, compliance “for free,” or an already working teamplay Fleet integration. These go beyond what the reviewed implementation and interviews establish.

OPUS's criticism that ASTRA cuts and mutes the movie and drops the characters describes the superseded first version. The current ASTRA already restores the **full 30.442667-second film with original audio**, the live title through 0:34, and all six original character states. We preserve the agreed six-act **34 / 36 / 8 / 48 / 40 / 14-second** clock, the serious transition at 1:10, and the short patient-focused ending. No additional “true story,” repeated character loop, emergency-replan act, acronym reveal or extra closing scene is added. This comparison changes the research record; it does not change the speaker script.
