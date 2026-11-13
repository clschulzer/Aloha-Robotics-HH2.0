# Aloha Robotics · 3-minute pitch · OPUS v2

**Healthcare Hackathon Bavaria · Erlangen 2026 · Siemens Healthineers Challenge 04: Invisible Connectivity for mobile C-arms**

Version 2 of the OPUS pitch, rebuilt from the team's feedback on v1: the same opening, but simpler, bigger and calmer after it. One idea per screen.

```
FILM → BASED ON A TRUE STORY → ALOHA ROBOTICS            (kept; the title now forms fast and simply settles)
→ the C-ARMAGOTCHI drops in, its screen becomes the slide (light)
→ one face + one meaning per click · Lonely · Desperate · Installing · Bliss · Dead on arrival · Rollback
→ Again: the faces loop faster and faster → the old TV dies
→ Now.  →  When?                                           (dark; Talos-style single words)
→ a real surgical day · a swarm of cursor-agents tests every gap → Today, 19:10.
→ polytrauma: the window breaks, re-plan in milliseconds → Tonight, 22:20. → one tap
→ How?  the golden window lands as a seed, the workflow grows out of it: SEE · FIND · ASK · BRING · UPDATE · REPORT
→ Every C-arm. Always ready. → Nobody babysits a C-arm again. → ALOHA ROBOTICS · Any technical questions?
```

| Read this | For |
|---|---|
| [`SCRIPT.md`](SCRIPT.md) | the exact words, beat by beat, with target times |
| [`../RECAP.md`](../RECAP.md) | the deep dive: challenge facts, judges, strategy, Q&A |

## Run it

```bash
python3 OPUS/serve.py          # from the repo root → http://localhost:8000/OPUS/v2/
```

Press **F** on the projector window (fullscreen; this also unlocks the film's sound) and **P** for the presenter view. The black screen is standby: **→** starts the film. Rehearse hands-free with `index.html?auto`.

## What changed from v1, and why

| v1 | v2 | Why |
|---|---|---|
| Title formed from dots, then a hit, ring, shake and shine | The embers form the title quickly and it simply settles | The extra “bling” cost time |
| Tamagotchi ring with stations, sticker, quote, reality box, vitals | The toy drops in and its screen becomes the slide; then just the face, one word, one line | Clicked through fast; the audience must get it in a second |
| Text cut: “The update isn’t the problem…” | **Now.** then **When?** (one word, huge) | Impact through restraint (Talos); the question the calendar answers |
| Abstract swarm over a device timeline | A realistic OR-device day (procedures, rooms, live cases, roster, emergency likelihood); the agents are cursors clicking gaps | Instantly readable as “AI agents testing the calendar” |
| Mycelium architecture with nodes in every corner | One line, six steps, grown from the golden window, with a closing loop | Intuitive; growth from one point without clutter |
| Three closing statements + IAI | **Every C-arm. Always ready.** → **Nobody babysits a C-arm again.** | Solutions, not numbers; calls back the Tamagotchi |

## What runs on stage is real code

Every click of every cursor is a call to `js/model/golden.js`, which scores legal 2.5-hour windows (120 min install + 30 min rollback buffer, 20 min handover, from the team rule core `planner.js`) by the probability that the window runs undisturbed. The hard rules come first: never touch a case, a human on duty to confirm the start, a free backup C-arm, KettyBot never double-booked. The golden window, the alarm re-plan and the measured re-plan time on screen all come from this code.

```bash
node --test OPUS/v2/tests/golden.test.cjs     # 12 tests · golden scorer
```

All hospital data is synthetic (`js/data/day.js`). It's a concept demonstrator, not a Siemens Healthineers or PUDU product and not a medical device.

## Files

```
OPUS/v2/
├── index.html · presenter.html
├── css/v2.css · fonts.css (embedded, OFL)
├── js/core.js · engine.js · notes.js (the script)
├── js/model/planner.js (team rule core, verbatim) · golden.js (scorer)
├── js/data/day.js        synthetic surgical day
├── js/scenes/            embers+film · tama · now · calendar · flow · outro · appendix
├── assets/characters/    the team's characters + KettyBot wink frame
└── tests/golden.test.cjs
```

The film is shared with v1 (`../assets/video/aloha_intro.mp4`), so it is stored once.
