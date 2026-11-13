# Aloha Robotics · 3-minute pitch (UNITED edition)

**Healthcare Hackathon Bavaria · Erlangen 2026 · Siemens Healthineers Challenge 04: Invisible Connectivity for mobile C-arms**

UNITED consolidates the three pitch versions in this repo into one show. Nothing outside `UNITED/` was changed.

| Taken from | What | Where in UNITED |
|---|---|---|
| `OPUS/` | the show: film, Tamagotchi act, the cut, the live golden-window swarm, architecture, outro, Q&A appendix, presenter view (`P`), rehearsal autoplay (`?auto`) | everything not listed below |
| `ASTRA/` | presenter desk and 180-second rehearsal | already covered by OPUS's presenter view (`P`: script, next beat, clock, ± vs plan) and `?auto`, so not duplicated |
| `CARMAGOTCHI_Web_Pitch/pitch-demo-christian/` | KettyBot's mission with 14 live checks, Lena's start wizard, "Loop closed" | `demo/` (a copy with an `?embed=1` mode), shown full-stage by `js/scenes/demo.js` and `js/scenes/loop.js` |

Changes against OPUS, so the story holds together:
- The swarm stops at the golden window (Cio 19:10 → 21:10). OPUS's polytrauma replan to Bogdan and the medical-physics tap are dropped from the stage, because the mission, the start and the loop all follow Cio. The replan is still in the code and the tests.
- The click-dummy scenes use the swarm's window and package: start 19:10, buffer until 21:40, security patch 4.2.1.
- The architecture's last-metre beat is shortened, because the mission already showed the robot.
- `js/lib/` was missing from OPUS on GitHub (the repo's `.gitignore` ignores `lib/`), so OPUS's swarm cannot run there. UNITED brings `planner.js` (verbatim copy of the team rule core) and a rebuilt `golden.js` that passes OPUS's 12 tests.
- Film, characters and fonts are not copied: they load from `../OPUS/assets/`.
- Presenter sync uses its own channel (`aloha-united-…`), so OPUS and UNITED can be open side by side.

```
FILM (0:00) → BASED ON A TRUE STORY → INTRODUCING ALOHA ROBOTICS (0:30)
→ ACT I · the world's most expensive Tamagotchi (0:37, light)
→ the screen dies: "Finding the window is." (1:13)
→ ACT II · the swarm hunts the golden window, live code (1:18, dark)
→ THE LAST METRE · KettyBot's mission, 14 checks (1:44)
→ A HUMAN STARTS IT · Lena's phone (1:55)
→ ACT II · the platform grows like mycelium (2:06)
→ LOOP CLOSED · thank-you and fresh data (2:29, light)
→ OUTRO · their words · invisible · IAI · Aloha + wink (2:37 → 2:58)
```

| Read this | For |
|---|---|
| [`SCRIPT.md`](SCRIPT.md) | the exact words, beat by beat, with target times |
| [`RECAP.md`](RECAP.md) | the deep dive: challenge facts, judges, team assets, strategy, Q&A, risks |

## Run it

```bash
python3 UNITED/serve.py        # from the repo root → http://localhost:8000/UNITED/
```

Then press **F** for fullscreen on the projector and **P** to open the presenter view (script, next beat, clock, ± vs plan) on the laptop screen. Both windows stay in sync.

> **Sound:** browsers only allow sound after a key or click *in that window*. Pressing **F** on the projector window does it. The tiny dot on the black standby screen turns from amber to green, and the presenter view shows "⚠ press F on the projector window" until it has happened. Driving the deck only from the presenter view without that one keypress plays the film silent.

Team names under the title: put them in `OPUS.TEAM` at the top of `js/notes.js` (e.g. `['Christian', 'Marc', 'Siddhant']`). Leave it empty for no names.

- After merge, GitHub Pages serves it at `https://clschulzer.github.io/Aloha-Robotics-HH2.0/UNITED/`.
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
| `1`–`9`, `#swarm.3`, `#mission` | jump to a scene / deep link to scene + beat |
| `→` twice during the film | skip the film |

Rehearse hands-free with `index.html?auto`: it advances on the target times from the script.

## What runs on stage is real code

`js/lib/golden.js` scores every legal 2.5-hour window for every C-arm (120 min install + 30 min rollback buffer, 20 min handover, from the team rules). It works out the **probability the window runs undisturbed**:

```
P = P(no unplanned use) × e^(−emergency rate × pull × Δt) × (1 − P(previous case overruns))
```

The hard rules run first and come straight from the team rule core: no window touching a case, no motion update remotely, no guess on thin data, a human on duty to confirm the start, the backup free for the whole window, and KettyBot never double-booked. The swarm's flashes, labels, log lines, counters, the golden window and the measured re-plan time all come from this code running in the browser.

```bash
node --test UNITED/tests/golden.test.cjs                                  # 12 tests · golden scorer
node --test team-material-christian/challenge-4/klickdummy/planner.test.cjs   # 15 tests · team rule core
```

All hospital data is synthetic (`js/data/day.js`). It's a concept demonstrator, not a Siemens Healthineers or PUDU product and not a medical device.

## Files

```
UNITED/
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
├── js/scenes/            embers+film · tama · cut · swarm · demo (mission, start) · arch · loop · outro · appendix
├── demo/                 Christian's pitch click dummy, embeddable (?embed=1)
└── tests/golden.test.cjs
```

`planner.js` is a byte-identical copy of the team file. Film, characters and fonts come from `../OPUS/assets/`, so UNITED needs `OPUS/` next to it.
