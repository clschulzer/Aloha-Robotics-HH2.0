# ASTRA validation

The revised presentation uses the team's full original film and character assets, copied encore/template code and original deterministic planner. Checks below concern this browser demonstration, not a connected medical device.

## Source preservation

[source-integrity.json](source-integrity.json) records SHA-256 comparisons for twelve original movie/art/code copies and byte-for-byte checks of all 27 files in the copied service prototype. All local changes are confined to `ASTRA/`.

The full current movie is 37,150,021 bytes, 30.442667 seconds, with its original AAC stereo audio. Its SHA-256 remains `b5ba0eaaaa37c1622e754fc57ca9b9825a2f24554705379b261eb53626299f30`. The movie was not re-encoded. The original `OPUS/` and other team folders were not edited.

## Planner and visual model

Twenty tests pass: the team's fifteen copied planner tests and five ASTRA checks. They cover eligibility, booked time and buffers, missing history, forbidden motion updates, overlapping robot/replacement use, approval prerequisites and alarm rescheduling. ASTRA's checks verify use of the original data without mutation, backup calendar observations, actual candidate checks, risk-proxy ranking and explicit failure when dependencies are absent.

```bash
node --test ASTRA/tests/visuals.test.mjs ASTRA/prototype/planner.test.cjs
```

The visual ranks eligible starts using the team's supplied hourly-use proxy. It does not claim a calibrated emergency probability or a globally optimal fleet schedule.

## Full-film rehearsal

[previews/rehearsal.json](previews/rehearsal.json) records an uninterrupted full-film rehearsal followed through the entire timed sequence. The harness uses a real browser pointer click to start playback and does not seek, accelerate or skip the film.

It checks original audio enabled, normal playback through native movie end, protection from premature Next, the live Aloha title, all six characters, dark transition, schedule search and rejections, gold proposal, architecture, and final patient hold. Twenty-five screenshots capture the launch and actual timed states. The clock stops at exactly 180 seconds; buffering and explicit pauses can extend wall-clock duration.

## Manual controls and visual motion

[controls.json](controls.json) records twenty passing control and animation checks with no console errors, including keyboard navigation, film protection, pause restoration, delayed-play races, reset, presenter synchronization, full-screen requests and a narrow viewport. These checks exercise real DOM state and moving SVG geometry; the race cases deliberately delay media promises to reproduce asynchronous scheduling.

The first passes exposed two defects: remote navigation could restart the full film, and a pending resume could restart the clock after reset. Generation guards and remote-navigation guards now cover those paths. The browser checks bypass cache so stale modules do not conceal the repaired behavior.

## Reproduce in Firefox

Use Node.js 24 or newer for native WebSocket support. Start these two long-running processes separately from the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory ASTRA
```

```bash
mkdir -p /tmp/astra-firefox-qa
firefox --headless --no-remote --profile /tmp/astra-firefox-qa --remote-debugging-port 9229 about:blank
```

Then run the checks sequentially; a Firefox endpoint accepts one active WebDriver session:

```bash
node ASTRA/tests/browser-check.mjs
node ASTRA/tests/controls-check.mjs
```

Override `ASTRA_TEST_URL` or `ASTRA_BIDI_URL` for a different server or WebDriver endpoint. The full rehearsal takes just over three minutes.

## Practical limits

Testing used headless Firefox 159.0.1 at 1440×810, plus a 390×844 viewport for control reachability. Screenshots were visually reviewed. This establishes browser playback and geometry, not physical projector quality, room acoustics or a speaker's delivery pace. Audio preservation and unmuted playback are verified; subjective listening is not claimed.

The script has 250 spoken words and deliberate silence. A human should rehearse the jokes and pauses with the presenter desk. The source notes separate the working prototype from proposed agents, forecasting, robot coupling and manufacturer integration.
