# 01 — Ember

**The feedback-led cut.** [Open the presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/01-ember/) · [Speaker script](SCRIPT.md) · [Design review](research/REVIEW.md)

Original film → fast ember title → one character at a time → CRT shutdown → Now. → a readable theatre calendar → a growing service workflow → patient-facing close.

This version keeps the original ASTRA argument and replaces its visual treatment. Warm ivory character portraits give the comedy room; the dark half feels like a theatre planning board. A cancelled case opens a gap. Smooth, spring-driven scouts investigate the schedule, challenge emergency cover, and converge on one gold proposal. That window becomes the seed of the architecture.

## Present

Open over HTTP or GitHub Pages. Click **Present live**, then use the right arrow or clicker. The original 30.44-second movie plays fully before navigation continues. **Watch 3-minute preview** runs the complete cue sequence to a hold at 180 seconds.

- `→` / Space: next; `←`: previous.
- `F`: fullscreen; `N`: speaker notes; `P`: pause.
- `S`: optional effects; `T`: timed mode; `B`: blackout; `Home`: restart.
- Sound design can be disabled at launch without muting the original film.

No installation or build step. From the repository root: `python3 -m http.server 8766`; visit `/ASTRA/versions/01-ember/`.

## Source and scope

Built against `6a58092`. Original film, character artwork, Manrope font and the team's `IAPlanner` are referenced from the existing ASTRA copy. OPUS's canvas, particle and synthesized-audio primitives were copied into this version and adapted; OPUS itself is unchanged.

The calendar uses synthetic procedure blocks and the actual planner. Cio's cancellation creates an eligible 19:00–21:00 update window with the configured reserve. An additional check confirms that the replacement's own case calendar is clear. The use-history score is a proxy, not a calibrated emergency probability.

The architecture distinguishes the working planning/handoff prototype from proposed clinical interfaces and physical docking. The interview evidence and unresolved integration questions are documented in the [research recap](../../RESEARCH_RECAP.md).

## Review

The review artifacts are in `research/`. `../tools/inspect.mjs 01-ember` exercises every cue and keyboard controls; `../tools/rehearse.mjs 01-ember` runs the full presentation in real time. Both use the installed headless Firefox with the user's permission. Run commands from the repository root with Node 24.

The visual pass corrected a default-canvas sizing bug, spaced the workflow inputs and anchored paths to icon centres. The final verification receipt records the actual browser result.
