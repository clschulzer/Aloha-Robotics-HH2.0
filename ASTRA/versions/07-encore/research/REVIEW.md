# Final review — The Care Loop

## The source decision

I inspected both Christian directories, their history and their rendered output again before building this version.

`CARMAGOTCHI_Web_Pitch/encore-christian/` is the earlier deck host. Its README explains that it began as a copy of Encore with an independent synchronization channel. The newer `pitch-demo-christian/docs/storyboard-pitch-v4.md` explicitly assigns the product journey to that actual demo and uses the deck for the film and conclusion.

The final cut therefore uses the product renderer itself. It does not reproduce the older deck’s discarded content simply because that folder contains Christian’s name.

The storyboard’s most important correction is preserved: **the state of the machine establishes maintenance priority; hospital operations establish the time**. The film remains its full original 30.44 seconds instead of being cut to the storyboard’s placeholder 20 seconds.

## What the previous six versions taught me

| Source | Keep | Improve here |
|---|---|---|
| OPUS intro | A transition has a narrative cause: the movie’s explosion becomes the joke and the title | Form the title once and move on |
| Ember | One character, one state; a clear dark transition; a patient-facing close | Put the character inside the actual product phone |
| In Good Hands | Christian’s complete responsibility → request → help → thanks journey | Remove side columns and connect the example to a calculated result |
| Night Shift | One visual thread can make a service handoff understandable | Carry the window card into the phone, then preserve its times in the report |
| Constellation | Scouts should evaluate the actual model, and emergency constraints should be executable | Keep the calmer camera and reduce the swarm to 84 visible scouts |
| Attachment Issues | A joke is strongest when the audience recognizes the device state | Use three compact lines: left on read, firmware needs, new personality |
| Open Circuit | The system needs a clear separation between a proposal and permission to act | Keep a named human decision visible; leave the detailed permission contract for the technical cut |

The result has fewer competing visual anchors. Most frames have a headline and one demonstration. The mission uses a map and only the currently relevant checks. The final diagram has three nodes and one returning path.

## Animation decisions

The shared film and ember transition preserve OPUS’s causal continuity. Phone arrivals use a short perspective entrance and settle flat. The calendar has no persistent perspective layer, avoiding the compositing slowdown found and repaired in Constellation.

Scouts follow damped paths and briefly mark actual candidate evaluations. They converge on the computed window, fade, and leave the result readable. A cancelled case visibly withdraws before the search begins.

The published proposal becomes a travelling card that lands toward the phone. Christian’s own mission engine drives the robot, checking pattern and progress; the final skin reveals only the active group of checks. The conclusion draws the first connection, reveals the receiving node, then continues to the next. A single long return path closes the loop.

Optional audio accents the state changes: a needy character, a notification, a successful handoff and the CRT cut. It stays quiet underneath speech. The original film’s audio is independent of that option.

## The calculated story

`story-model.js` constructs a synthetic cancellation fixture from the existing OPUS day. Before the cancellation, Cio has no eligible evening window. Removing that booking makes an eligible window possible.

The copied `golden.js` evaluates future candidates against planned work, buffers, emergency assumptions, a backup and available confirming staff. Cio is the priority selected for this story. The displayed result is the highest-ranked eligible result **for Cio**, not a claim that the complete fleet has been globally optimized.

The result supplies the window and backup displayed by the browser. The same values are sent to the copied product with a same-origin message. The proposed job and subsequent receipt therefore agree with the calculation.

Seven scenario checks exercise the cancellation, ranking, complete backup interval, emergency hold, missing confirmer, missing authorization and recalled package. The original planner and scorer suites also pass.

The risk function is illustrative. It does not establish calibrated clinical probabilities. Historical data and all operational records here are synthetic. The technical cut explains the score’s assumptions and the proposed integration boundary in more depth.

## Template refinements and evidence corrections

The source renderer remains recognizable: the phone, mission floor plan, checklist groups, human wizard and thank-you are preserved. `demo/encore.js` refines their wording and binds the calculated proposal; `demo/final.css` controls the visual simplification.

The source’s invented short installation is replaced by a clearly compressed 120-minute example. No speaker line promises that the robot shortens installation. The service receipt ends with team review rather than clinical release. Camera and docking checks are presented as the mission concept. The robot carries a package; the device would verify its authorization and integrity.

Christian’s development briefing explicitly separates the envisioned system from deployed implementation. This presentation keeps that distinction. The browser model executes; hospital integration, trusted identity, a validated dock, power delivery, robot perception and a permitted remote start interface are still engineering work.

The illustrated human tap is a presentation event. It records exactly one local approval in the timed performance. It does not call a service, manipulate equipment or claim that an agent may authorize itself.

## Visual iteration

The first full cue pass exposed a duplicated footer beneath the mission. The outer stage now owns that caption. The hybrid-OR label was moved away from the machine identity label. Short surgical bookings show a concise procedure label and start time rather than squeezed time ranges.

The second full cue pass checked those changes, all phone scenes, the report, the three-pillar loop and the close. Motion review and a complete native-speed rehearsal are retained alongside this analysis.

The final rendering pass cached the formed title and its glow, preserving the choreography while avoiding repeated text blur. The complete show was replayed after that optimization. A separate delivery review also caught and corrected long technical notes pushing the shared presenter controls below the window.

## Source map

- `CARMAGOTCHI_Web_Pitch/pitch-demo-christian/`: copied product renderer and current storyboard.
- `CARMAGOTCHI_Web_Pitch/encore-christian/`: host-template and history review.
- `team-material-christian/challenge-4/klickdummy/planner.js`: copied deterministic rule core.
- `OPUS/v2/js/model/golden.js`: copied window scorer.
- `OPUS/v2/js/data/day.js`: copied synthetic operational fixture.
- `OPUS/christian/`, `OPUS/v3/`: intro, sound and presentation refinement references.
- `ASTRA/versions/01-ember/` through `06-open-circuit/`: sequential lessons and existing tested stage infrastructure.
- `ASTRA/RESEARCH_RECAP.md` and the four repository transcripts: research boundaries and clinical workflow.

[Source identity and scenario results](source-checks.json) · [Speaker script](../SCRIPT.md)
