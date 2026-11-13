# ASTRA narrative direction

## The story in one breath

**A C-arm can help clinicians see inside a patient, yet its own need for care goes unseen. CARMAGOTCHI turns that unattended request into a planned, authorized, physically possible service job—and closes the loop with a verified return.**

The main route follows one machine, Cora, through one service appointment. It does not tour a platform. A changed clinical plan supplies the dramatic test. The ending is the next morning: the system recedes and a clinician finds the machine ready after the required release.

## What the audience must be able to say afterward

“They coordinate the time, the person, and the connection needed to service a parked C-arm, and they check that it comes back.”

That is the useful mechanism. Cora makes the machine memorable. The robot makes the physical gap visible. The calendar and the handover make the idea credible.

## Eight scenes, one continuous object

| ID | Time | Visible action | What the scene proves |
|---|---|---|---|
| `arrival` | 0:00–0:18 | “Meet Cora. Our mobile X-ray machine.” Brief chase sting; lonely Cora sends “Update available. Anyone?” Her request sits unanswered. | A machine can be essential during a case and overlooked afterward. |
| `handoff` | 0:18–0:36 | Three sides of the same request: staff with the patient, fleet responsibility elsewhere, service waiting for a connection. Cora powers down. | The gap is between roles, location, power, and timing. |
| `window` | 0:36–1:09 | Calendar rejects 17:10 because the post-case handover is still active, selects a later candidate with recovery allowance and backup, receives an emergency, withdraws the unstarted job, and finds another slot. | The planner handles constraints and a changed clinical plan. |
| `connect` | 1:09–1:35 | Data waits in a companion. Power and Ethernet connect at a reachable parking point. Robot makes one physical cameo. | A calendar invitation cannot supply power or reach a blocked device. |
| `authorize` | 1:35–1:58 | A named, fictional authorized service lead sees the exact device, package, window, and backup. Readiness gates pass; the person confirms start. | Human authorization has an object and a boundary. |
| `return` | 1:58–2:19 | Return message received; technical result recorded; local readiness checks and human release are explicitly shown. | Installation completion and clinical release are distinct events. |
| `pilot` | 2:19–2:37 | Prototype state separates from next integration step: one approved device and permitted logs. | The team knows what is built and what needs proving. |
| `finale` | 2:37–3:00 | Calendar, service chrome, and alerts quietly disappear. The same Cora waits beside tomorrow’s theatre. | The value is less attention demanded from clinical staff. |

Clock times on the calendar are functional information, not impact claims. No giant percentage, invented saving, interruption probability, or ROI number belongs in the main route.

## Creative decisions

- **The joke is the unanswered request.** “Left on read” belongs to the machine. The staff are doing valid work. Do not portray clinicians as lazy, incompetent, forgetful, or indifferent.
- **Cora is a character, not another duty.** Her expression changes with a real workflow state. Nobody earns points for feeding her, and staff are not asked to keep a virtual pet alive.
- **The second smile is the robot’s modest job.** The on-screen “Finally. Someone who brings a cable” gets a silent beat. The payoff is an arranged handover rather than robotic heroics.
- **The decisive action is withdrawing the plan.** A system that visibly declines to start when circumstances change shows judgment more convincingly than a moving glow labeled “AI.”
- **Keep the visual grammar consistent.** Cora, her device identity, and the service task travel from scene to scene. The calendar becomes a work order; the work order becomes a completion record. Avoid a different mock application in every scene.
- **The finale earns quiet.** A long closing slogan or a question joke would spend the emotion that the preceding demonstration creates.

## Major cuts

| Cut | Reason |
|---|---|
| Palmer/America/eagle parody | Requires unrelated context, shifts attention from hospital needs, and makes autonomy sound unbounded. |
| Three theatrical team entrances | The product has less than three minutes; team identity can stay on the first and final frames. |
| Thirty- or forty-second film | Consumes the time needed to show the actual mechanism. Final media uses only the chase excerpt from source 2.000–6.333 seconds plus 0.967 seconds of freeze/fades, for a muted 5.3-second clip. Exclude the instantaneous install and explosion. |
| Personality-state carousel | The mascot earns attention by responding to the plot. A catalog of expressions delays the plot. |
| “Now the real problem” tonal reset | Implies that the preceding material did not matter. Start with the real problem in a comic form. |
| Full agent architecture on the main stage | Agent role names, protocols, boxes, and clouds are evidence for Q&A. Show constraints, actions, decisions, and outcomes during the pitch. |
| Shadow-environment scene | Valuable future validation idea, but the actual compatibility hooks and fidelity are unknown. It would open a second product thesis in the main route. |
| IAI / “Invisible Agentic Intelligence” wordplay | Leaves the audience with an acronym rather than the service mechanism or human outcome. |
| Numerical impact promises | Interviews contain estimates and concept documents contain assumptions. The prototype has not established those outcomes. |
| Automatic READY after a simulated install | A completed install does not establish clinical readiness. Show the required human release first. |
| Failure-and-rollback branch in the timed main route | Keep this implemented and available for Q&A. The pre-start emergency already gives the main story its one necessary reversal. |

## Research findings that change the story

The transcripts are the strongest source for what the challenge owners actually described. They remain interview evidence, not product specifications or external validation.

1. **The failure starts when the machine stops being used.** The challenge owner says mobile systems are often switched off, parked, and without reliable access to a socket. A larger download pipe does not resolve that. See [`transcripts/04_invisible_connectivity_challenge_interview_merged.md`](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md), opening discussion.

2. **The roles have different locations, authority, and incentives.** The operator is physically present but fears responsibility if something fails; equipment owners need to coordinate with the department; IT may be remote. “There are three groups who could be responsible … but the task falls between them.” The story should resolve that handover instead of sending more reminders. Same interview, discussion preceding the log-data section.

3. **Some remote update capabilities already exist.** The team should not claim to invent remote service. The opportunity is to arrange a usable window and an authorized, physically possible action around existing manufacturer capabilities. Same interview, “most of our updates are remote-capable.” The exact start interfaces and permitted update classes remain to be verified.

4. **The live clinical device already has safety restrictions.** The interview explains that an open patient examination prevents deeper system operations; it does not endorse a premise that a random update can restart the device mid-surgery. Any supplied chaos film is fiction, not a depiction of current Siemens behavior. See [`transcripts/02_hospital_workflows_updates_and_remote_support.md`](../../transcripts/02_hospital_workflows_updates_and_remote_support.md), opening.

5. **No generic claim of easy atomic swaps survives the interviews.** The owners describe distributed subsystems, mixed hardware generations, compatibility work, and architecture that does not currently support the proposed container-like switch. See the merged interview’s dual-image discussion and the end of the hospital-workflow transcript.

6. **A powered independent companion is a direct challenge-owner hypothesis.** It can maintain its own communication and queue data while the main machine is off. That does not mean it can read fresh main-system logs or update a fully unpowered C-arm. The interface, power model, battery management, and transfer procedure need proving. See the merged interview’s final technical discussion and [`transcripts/01_robot_assisted_updates_and_machine_walkthrough.md`](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md).

7. **The robot’s hardest problem is access.** The walkthrough warns that machines can be tightly packed or blocked. It also leaves actual power draw, supported wake behavior, and docking mechanics open. The screen must show a reachable parking point and a blocked-access exception, not “finds and powers any machine anywhere.”

8. **The service loop currently can end in silence.** The walkthrough describes updates failing out of hours and being discovered the next morning; the merged interview describes learning about some failures when someone calls. Monitoring expected return and routing an exception is a strong mechanism to demonstrate. It cannot itself repair every failure or grant clinical clearance.

9. **Mechanical calibration remains outside this service example.** The challenge owner explicitly excludes uncontrolled autonomous movement and assigns calibration involving motion or radiation to technicians in controlled conditions. The main story should use an approved software-only task.

10. **Logs make a sensible first integration milestone.** The owners want a return channel for data and better remote diagnosis. A permitted log handover has a narrower integration scope than an autonomous installer. This is a proposed first pilot step, not a claim that log collection is always clinically harmless.

## Contradictions to quarantine in Q&A

The early [`research/00-synthese.md`](../../team-material-christian/challenge-4/research/00-synthese.md) contains an overconfident statement that “A/B … rollback” is solved and concepts such as guaranteed readiness and automatic stop. Later interviews narrow or contradict those ideas. Do not carry them into stage language.

[`autonomous_c_arm_fleet_architecture.md`](../../autonomous_c_arm_fleet_architecture.md) is useful as an idea inventory. It is not an implementation record. Unsupported specifics include native VHDX swaps on the installed fleet, zero bricking risk, timed rollback, exact workstation power sizing, backward compatibility, military-network requirements, and LiDAR-based safety guarantees. Its DICOM patient-list transport is also unnecessary to solve this maintenance story.

The later [`plattform-konzept.md`](../../team-material-christian/challenge-4/plattform-konzept.md), [`spec-scheduling-ki.md`](../../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md), and [`architektur-klinik-it-security.md`](../../team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md) are more careful about separating proposals, deterministic rules, human decisions, and technical transport. They remain design proposals except where working code is independently demonstrated.

## Honesty rules for the site and speaker

- A small persistent label reads **“Prototype · synthetic scenario.”** Do not put a disclaimer wall between the audience and the product.
- Call the scene an interactive workflow prototype; call the companion/robot connection a proposed implementation.
- The scheduling behavior is demonstrable code. Do not call it trained predictive AI unless that model exists and is evaluated.
- AI may coordinate, explain, and propose. The fixed rule layer validates the conditions; authorized people make the service decisions.
- Main-route “package verified,” device telemetry, approvals, update progress, and return messages are simulated events. They must not be described as live manufacturer integrations.
- A changed plan invalidates the previous approval. Replanning creates a new proposal and requires appropriate new authorization.
- Emergency before install: do not start. Emergency after install: follow the validated procedure and activate the backup plan; do not invent an instant safe cancellation.
- Return message received, technical checks passed, and local clinical release are separate statuses. The last can be a human-confirmed synthetic demonstration.
- Preserve hospital policy. The companion is not a means to bypass a network ban.

## Finale

Last spoken line: **“We take care of the machine, so they can take care of the patient.”**

The phrase is earned only because the audience has just seen the care: planning, power, authorized start, return verification, and release. Keep the screen visually quiet. A Cora blink can happen during the silence after the last line. Do not add “TECHNICAL questions?”, another punchline, or a sales metric.

## Practical rehearsal

One speaker and one operator. Each scene has one committed next action; the `window` scene has three meaningful internal beats. The operator follows the speaker’s cue rather than a hard auto-advance. Scene budgets sum to 180 seconds, but the spoken text is deliberately short enough to absorb a laugh, click, and breath.

If behind schedule, shorten the pilot to “The workflow runs here with synthetic data. Next: one approved C-arm and a real log connection.” Retain the human release and the complete final line. Never accelerate the finale.

## First-build editorial review

Source review of `index.html`, `stage.css`, `app.mjs`, `engine.mjs`, and `story.mjs`. No browser rendering was performed in this review.

The build has the right eight scenes and enough speaking room. The main improvements are choreography and removal of competing copy, not more content.

1. **Protect the opening reveal.** The initial HTML displays “Left on read” and the request before the sting. Start with “Meet Cora,” then sting, then the request, then the punchline. The joke should be new when the speaker says it.
2. **Show the first rejection.** The first calendar render immediately shows the accepted appointment. The rejected 17:10 option exists only as a small explanation. Show the early candidate collide with the handover interval before the later appointment appears.
3. **Make the mechanism readable.** The calendar explanation is meaningful stage content. Its current 12-pixel source type is too small for a projected explanation; aim for 18 pixels. Calendar event labels should also be larger. Supporting evidence can remain small.
4. **Use one secondary joke.** The on-screen “Finally. Someone who brings a cable” competes with the spoken appointment joke. Keep the cable line and a silent beat, or keep the spoken line and remove the on-screen joke.
5. **Show the return channel.** Power and package delivery are visible. One small outgoing permitted-log cue would make bidirectional connectivity as clear as the inbound update, without adding a scene.
6. **Give the finale one last reveal.** The first build exposes “Time for the patient,” the care statement, and a second tagline at once. Begin with the quiet morning and Cora; reveal the exact final care sentence near the speaker’s last line. Drop “Invisible connectivity. Human care.”
7. **Keep control messages off the final frame.** “Hold the final frame…” belongs in presenter notes, not a projected toast.
8. **Use the footer for the one persistent scope label.** “Prototype · synthetic scenario” is more useful to the audience than “ASTRA / Stage Edition.” Keep the hardware concept label beside the robot. Avoid repeating integration caveats as separate visual paragraphs.
9. **Keep claims tied to the demonstration.** Replace “A real backup” with “An available backup” and “No safe candidate” with “No eligible window.” The finale now says “who found the window, connected the machine, or watched her come back”; the earlier “logs were checked” implied analysis not shown in the main route.

The final sentence remains: **“We take care of the machine, so they can take care of the patient.”** Its strength comes from the complete service handover the audience has just witnessed.

## Upstream check — 13 November 2026

Observed remote commit: **`2c5b37f6bec0f68cfca92d6dd7717106684c49f4`** on `origin/main`, compared with the local base `4d227a8`. Inspected the new files through `git show`; no upstream files were checked out or edited.

This update adds `CARMAGOTCHI_Web_Pitch/encore-christian/` and `encore-christian-prompter/`. Their README describes an isolated copy of the existing Version 4 encore, made so Christian can implement later storyboard changes without steering the team version.

At this observed commit:

- `encore-christian/index.html` and `encore-christian/encore.css` match the existing `encore/` files exactly.
- The speaker notes in `encore-christian-prompter/data.js` match `encore-prompter/data.js` exactly.
- The JavaScript and prompter HTML change only the BroadcastChannel and localStorage identifiers to include `christian`.
- The copied film has the same Git blob as the earlier film: `79452fa114d76178b88bd6ff96effa46c1f87680`.
- No new transcript, technical evidence, clinical constraint, or revised narrative was added.

**ASTRA decision:** retain the current story. This is a new place for future work, not a new version of the story to incorporate. The retained encore still assumes an audience that has already seen the complete solution and spends its opening on the long film, lookalike gag, and expression carousel. Those are the same choices the ASTRA redesign intentionally replaced with one complete service handover.

One implementation lesson is useful if ASTRA later gains a separate synchronized prompter: give it its own communication channel and storage keys so open presentation variants cannot control each other. The current ASTRA presenter desk is part of the same page and does not need that addition.

## Rendered review — Firefox previews, 13 November 2026

Visually inspected the actual Firefox captures of [authorization](previews/09-human-authorization.png), [human release](previews/12-human-release.png), [pilot](previews/13-pilot.png), [quiet morning](previews/14-tomorrow-morning.png), [final reveal](previews/15-final-reveal.png), and [presenter desk](previews/16-presenter-desk.png).

**Verdict: the six reviewed scenes have no material layout blocker.** The result warrants rehearsal rather than another redesign.

- **Authorization:** the headline, person, device, time, backup, and start action have a clear hierarchy. The card fits without clipping. The six readiness labels are noticeably smaller than the fields they explain; increasing their source font from 10 to 12–13 pixels is the one useful readability adjustment.
- **Release:** the three stages read in order, and the completed character state is separate from the required checks and release. The wide headline fits. No additional content is needed.
- **Pilot:** the built/next division is clear, with enough separation to scan while listening to the shortened script. Keep it to its allotted eighteen seconds.
- **Finale:** the quiet-morning frame now precedes the payoff. The final care sentence has room to land, and the removed extra tagline is not missed. Retain the explicit reveal near 2:51 and the hold after about 2:57.
- **Presenter desk:** the entire final speech and operator cue fit in the captured notes panel without clipping. The pace display is distinct from the speech. The unusually early timer value in this test capture reflects a fast test traversal rather than a completed rehearsal.

The final script remains **304 spoken words in a 180-second budget**. Still captures confirm hierarchy and readability, not the duration of a live delivery. The root agent separately reports passing workflow assertions and no console errors; this review did not run those checks or change the README’s verification statement.
