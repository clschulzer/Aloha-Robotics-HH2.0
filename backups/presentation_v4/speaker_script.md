# C-ARMAGOTCHI — Stage Script & Cue Sheet (v2)

> An unofficial, fictionalized pitch for Challenge 04 — Invisible Connectivity for Mobile C-arms. The robot, scheduling agents, phone UI, shadow preflight, and device integrations are **concept simulations**, not connected products.

## Main pitch — approximately 4 min 40 sec including the 40-second film

**Before presenting:** replace all `TEAMMATE 0X` labels in `pitch/index.html` with your real names. Rehearse the 40-second video from the actual presentation browser and check audio output. Use a clicker mapped to `ArrowRight`.

### 01 — C-ARMAGOTCHI / TEAM INTRO

[LIVE, 10 seconds] The opening needs to feel as considered as TALOS: give the project and challenge a proper introduction. Say: 'We're team C-ARMAGOTCHI. Challenge four: Invisible Connectivity for Mobile C-arms, presented by Siemens Healthineers.' These are placeholder team slots—replace them with actual team member names before the final. Then: 'We have a short case study.' Advance directly into the supplied video, without explaining the joke.

*Reveals: 2 states (1 advance clicks before the next scene).*

### 02 — CHAOS / THE PROBLEM IN 40 SECONDS

[FULL 40-second supplied video] This is a deliberately exaggerated creative film, not actual clinical footage or a claim that medical devices behave this way. Do not narrate over it. The clip is deliberately allowed to be absurd. On the last frame, pause for one beat, then advance to the Palmer-inspired interruption. If autoplay with sound is blocked, click the PLAY FILM button; S toggles sound, P pauses, V replays.

*Reveals: 1 states (0 advance clicks before the next scene).*

### 03 — THE PALMER LUCKEY INTERRUPTION

[LIVE COMEDY, 9 seconds] Completely straight face. Advance one click and yell: 'AUTONOMY!' Advance again: 'AMERICAAAA!' Optionally play the intentionally terrible synthetic eagle screech, if audio is enabled. Your teammate who looks like Palmer Luckey can enter unexpectedly for one second and say: 'I heard you needed autonomous systems.' That is a teammate lookalike—NOT Palmer Luckey, and not an Anduril endorsement. Next click cuts from the joke into the team introductions. No explanation. The subtitle is intentionally tiny because the joke lives on stage.

*Reveals: 3 states (2 advance clicks before the next scene).*

### 04 — THE TEAM / THREE ENTRANCES

[LIVE, 15 seconds] Three names are placeholders. Replace text in this slide and (optionally) SVG avatars with your actual names or photos. Hit each right arrow with the team member entering or posing in sync; each card slams into position with a sharp screen impact. 'Our team. Three people. One problem.' Each person states just their role or a short joke, then the final click tightens into the promise: 'We'll make maintenance feel invisible.' Do not spend more than 15 seconds on biography.

*Reveals: 4 states (3 advance clicks before the next scene).*

### 05 — C-ARMAGOTCHI / THE APP

[DEMO, 20 seconds] Play this as a genuine product demonstration. 'The C-arm has a state the staff can understand.' The app uses a phone-like form factor only as an interface concept; no real hospital device is connected. Step through: disconnected / check equipment ID / request service / mission queued. Click the phone button or use the clicker. The interface intentionally communicates only essential states. Say: 'Our actual innovation isn't an app that makes radiographers play Tamagotchi. It's removing friction so the device can ask for help without demanding new clinical work.'

*Reveals: 4 states (3 advance clicks before the next scene).*

### 06 — THE PERSONALITY STATES

[DEMO, 20 seconds] Keep the original image crossfade behavior; these are the character expressions the team already liked. Click through: lonely, chaos, installing, blissful, restoration failure, rollback. Keep the innuendo just below the surface: a tiny 'Ahhh...' at the stable state is enough for a mixed-age room. Note that the restoration failure is based on a failure mode observed in the team's conversations, but the update sequence shown is an artistic representation. Pause on the manic grin. Then say, suddenly without joking: 'Of course, none of this matters if we don't solve the clinical workflow.'

*Reveals: 6 states (5 advance clicks before the next scene).*

### 07 — NOW THE REAL PROBLEM

[SHIFT IN TONE, 7 seconds] Leave a small silence after the last manic pose. No jokes here. First step: 'That was entertaining.' Second: 'But here is the real problem.' Let the room feel the switch. The remaining presentation is evidence-driven: clinical scheduling, secure connectivity, isolated testing, risk controls and human responsibility. This is the hinge from brand mascot to serious service design.

*Reveals: 2 states (1 advance clicks before the next scene).*

### 08 — INVISIBLE CONNECTIVITY

[TECHNICAL, 20 seconds] Name the need plainly. Mobile C-arms follow the clinical day: active in surgery, then moved, parked and often switched off. Device service needs a narrow opportunity to connect and exchange logs; radiographers are occupied with patient care. We cannot assume powered-off devices can be contacted. The problem is a mismatch of two timelines, the clinical schedule and the maintenance schedule. Our system identifies when the two can safely meet. Every diagram shown is synthetic and illustrative, not a live hospital schedule.

*Reveals: 4 states (3 advance clicks before the next scene).*

### 09 — THE INVISIBLE AGENTIC SERVICE LAYER

[TECHNICAL, 25 seconds] Introduce the architecture as a concept, not an installed Siemens service stack. Source inputs: an approved hospital theatre schedule, device identity/version/power/connectivity status, maintenance catalog, plus hospital-specific clearance policy. Three specialist agent roles: Schedule Scout finds idle windows; Risk Sentinel discounts emergency and overrun exposure; Preflight checks service compatibility in an isolated shadow environment. An orchestrator combines suggestions. Crucially, a deterministic safety policy and authorized humans gate the plan; LLM agents do not sign firmware or unilaterally deploy it. The robot is an optional physical endpoint. These are proposed modules, not deployed AI agents.

*Reveals: 5 states (4 advance clicks before the next scene).*

### 10 — THE GOLDEN WINDOW

[TECHNICAL LIVE SIMULATION, 30 seconds] This schedule is SYNTHETIC, not real patient data. Show that the AI is not merely looking for empty white space. Schedule Scout proposes idle windows. Risk Sentinel rejects a short midday gap and a high-uncertainty on-call interval; estimated emergency exposure is a scenario input, not a clinically validated prediction. Device Preflight checks whether the specific C-arm is available, powered, compatible and eligible for the task. The recommended 19:30–22:45 slot is marked pending approval. Distinguish short log-sync tasks from long backup/install/restore updates. Tell the audience: 'A golden window is a safe candidate, not permission to start an update.'

*Reveals: 5 states (4 advance clicks before the next scene).*

### 11 — THE SHADOW ENVIRONMENT

[TECHNICAL, 23 seconds] Here is the sandboxing concept. Before an authorized update window, capture an approved configuration snapshot or use authorized test data. In a segregated test environment, verify package identity and test the configuration migration against the proposed software version. If rehydration is incompatible, surface the exception before touching the clinical device. Critical caveat: this needs manufacturer-supplied compatibility hooks and test fidelity; it cannot establish device safety on its own or substitute for a validated update procedure. The real device stays unchanged until the service gate is approved.

*Reveals: 4 states (3 advance clicks before the next scene).*

### 12 — THE ROBOT GOES TO WORK

[WORKFLOW, 22 seconds] It is now time to show the physical service hypothesis. A hospital IT user approves a job. A service robot navigates to a parked machine where this is allowed, identifies the specific device, establishes a physically and cryptographically approved connection, and transmits permitted logs or stages an approved package. Mechanically supervised recalibration remains a technician task. This animation is a concept; we have not demonstrated a KettyBot navigating and connecting to a Siemens C-arm. Use the sound effect 'beep' and give the robot one moment to dock. Keep the actors' exaggeration for the intro, not this technical section.

*Reveals: 5 states (4 advance clicks before the next scene).*

### 13 — HUMAN IN CONTROL

[SERIOUS, 18 seconds] The robot should take the boring part, never the responsibility. Data access stays on approved manufacturer and hospital interfaces, with role-scoped authentication and audit logs. The planner must not assume that a powered-off device can be contacted. Anything involving motion, room clearance, parameter mismatch or clinical readiness routes to authorized people. The distinction between 'can recommend' and 'can execute' is a feature, not a failure of our design. The predictive risk values were synthetic. No actual patient data is in the demo.

*Reveals: 3 states (2 advance clicks before the next scene).*

### 14 — INVISIBLE AGENTIC INTELLIGENCE / THANK YOU

[FINALE, 20 seconds] Silence first. 'Surgeons need time. Their job is to save human lives. Our job is to give them that time back.' Reveal the contrast: 'AI is everywhere.' Then say 'What hospitals need is IAI'—tiny pause—'Invisible Agentic Intelligence.' On the last click, KettyBot winks. End deadpan: 'Thank you for listening. Do you have any TECHNICAL questions?' Do not claim results or imply the system is deployed; it is a tested conceptual workflow and a hypothesis for the next pilot. The wink is the only joke in the technical ending.

*Reveals: 4 states (3 advance clicks before the next scene).*

## Technical appendix

### A1 — APPENDIX / SYSTEM INTERFACES

[TECHNICAL Q&A] Interfaces require owner-approved access. No actual manufacturer API has been obtained. The proposed event schema needs device ID, firmware version, connection status, power state, update class, package eligibility, maintenance constraints, permitted roles, and audit trail. Clinical systems remain authoritative for schedule, not the LLM. The physical robot is an optional service endpoint, not a substitute for existing remote services. The recommendation becomes a work order only after human authorization.

*Reveals: 3 states (2 advance clicks before the next scene).*

### A2 — APPENDIX / WHAT TO VALIDATE

[TECHNICAL Q&A] Next pilot questions: what exact C-arm model, which power states permit connectivity, what hardware connection is possible, what service APIs are approved, and what update classes permit remote handling? We must measure staff touches, sync coverage, aborted maintenance jobs, early-detected incompatibilities, manual exception rates and device availability. Emergency-risk values and schedules in the presentation are synthetic and NOT clinically validated forecasts. Only an approved pilot can establish ROI.

*Reveals: 3 states (2 advance clicks before the next scene).*

## Live production checklist

- Use the introductory cover to give team name and challenge number before the comedy begins.
- Let the supplied video play with sound; do not narrate it. Do not skip directly into the serious architecture.
- Palmer Luckey / Anduril is a parody **performed by a teammate who happens to resemble him**; avoid stating the real person or company is involved.
- The optional screech is original synthesized audio, not a real bird recording or copyrighted audio.
- On the team scene, each of the three entrances is triggered by one `→` click; practice the timing.
- The app, schedule, and robot route support both keyboard steps and (where available) click interactions.
- Maintain the serious tone starting with scene 07, and keep caveats concise but explicit.
- The synthetic interruption percentages are hypothetical scenario inputs, not validated emergency predictions.
- A shadow test is not a substitute for manufacturer software validation.
- The robot and software cannot update or communicate with a fully powered-off, physically inaccessible C-arm without supported interfaces or power.
- Make time for one proper laugh after the final KettyBot wink and the phrase “TECHNICAL questions?”.
