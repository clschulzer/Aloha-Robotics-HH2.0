# Aloha Robotics · 3-minute pitch (OPUS edition)

**Healthcare Hackathon Bavaria · Erlangen 2026 · Siemens Healthineers Challenge 04: Invisible Connectivity for mobile C-arms**

A coded keynote: one HTML page, no build step, no network needed, sound designed in code. It uses the team's AI film exactly as it is, the team's characters, and Christian's tested rule core (`planner.js`). Everything lives in this folder, and nothing outside `OPUS/` was changed.

```
FILM (0:00) → BASED ON A TRUE STORY → INTRODUCING ALOHA ROBOTICS (0:30)
→ ACT I · the world's most expensive Tamagotchi (0:37, light)
→ the screen dies: "Finding the window is." (1:13)
→ ACT II · the swarm hunts the golden window, live code (1:18, dark)
→ ACT II · the platform grows like mycelium (1:56)
→ OUTRO · their words · invisible · IAI · Aloha + wink (2:30 → 2:53)
```

| Read this | For |
|---|---|
| [`SCRIPT.md`](SCRIPT.md) | the exact words, beat by beat, with target times |
| [`RECAP.md`](RECAP.md) | the deep dive: challenge facts, judges, team assets, strategy, Q&A, risks |

## Run it

```bash
python3 OPUS/serve.py          # from the repo root → http://localhost:8000/OPUS/
```

Then press **F** for fullscreen on the projector and **P** to open the presenter view (script, next beat, clock, ± vs plan) on the laptop screen. Both windows stay in sync.

- After merge, GitHub Pages serves it at `https://clschulzer.github.io/Aloha-Robotics-HH2.0/OPUS/`.
- Double-clicking `index.html` also works (fonts are embedded). Use `serve.py` rather than `python -m http.server`, which can't seek in video.
- Chrome or Edge recommended. The film starts **with sound** on your first click.

## Controls

| Key | Action |
|---|---|
| `→` `Space` `PgDn` / click | next beat (presentation clickers work) |
| `←` `PgUp` | back: settles instantly, no replayed animations |
| `F` | fullscreen |
| `P` | presenter view (`presenter.html`) |
| `N` / `T` | script overlay / timer HUD (rehearsal) |
| `M` | mute the sound effects (the film keeps its sound) |
| `B` · `R` · `C` | blackout · restart to black · pause the pitch clock |
| `A` | Q&A appendix: golden-score formula, what is real, the robot |
| `1`–`8`, `#swarm.3` | jump to a scene / deep link to scene + beat |
| `→` twice during the film | skip the film |

Rehearse hands-free with `index.html?auto`: it advances on the target times from the script.

## What runs on stage is real code

`js/lib/golden.js` scores every legal 2.5-hour window for every C-arm (120 min install + 30 min rollback buffer, 20 min handover, from the team rules). It works out the **probability the window runs undisturbed**:

```
P = P(no unplanned use) × e^(−emergency rate × pull × Δt) × (1 − P(previous case overruns))
```

The hard rules run first and come straight from the team rule core: no window touching a case, no motion update remotely, no guess on thin data, a human on duty to confirm the start, the backup free for the whole window, and KettyBot never double-booked. The swarm's flashes, labels, log lines, counters, the golden window and the measured re-plan time all come from this code running in the browser.

```bash
node --test OPUS/tests/golden.test.cjs                                    # 12 tests · golden scorer
node --test team-material-christian/challenge-4/klickdummy/planner.test.cjs   # 15 tests · team rule core
```

All hospital data is synthetic (`js/data/day.js`). It's a concept demonstrator, not a Siemens Healthineers or PUDU product and not a medical device.

## Files

```
OPUS/
├── index.html            the stage (8 scenes + 3 Q&A slides)
├── presenter.html        presenter view, synced over BroadcastChannel
├── serve.py              local server with HTTP Range support
├── css/pitch.css · fonts.css (embedded, OFL)
├── js/core.js            math, seeded noise, glow sprites, ticker, WebAudio sound design
├── js/engine.js          navigation, beats, sync, clock, deep links, autoplay
├── js/notes.js           the script (single source for presenter / overlay / autoplay)
├── js/lib/planner.js     the team's rule core, verbatim copy
├── js/lib/golden.js      golden-window scorer on top of it
├── js/data/day.js        synthetic surgical day: 8 C-arms, emergencies, duty roster, alarm
├── js/scenes/            embers+film · tama · cut · swarm · arch · outro · appendix
├── assets/               film (untouched), 7 characters + a winking KettyBot frame, fonts
└── tests/golden.test.cjs
```

The film, characters and `planner.js` are byte-identical copies of the team files. Git stores identical files once, so the copies cost no repo space.
