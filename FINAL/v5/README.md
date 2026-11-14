# FINAL v5 · click into the start, palm logo, QR codes, team names

Built from `FINAL/v4/`, which stays unchanged. Changes in v5:

- Mission (scene 12) no longer moves on to Lena's phone by itself: the last step waits for a click.
- Aloha Robotics logo on the last slide: a small palm tree in Siemens Healthineers petrol and orange instead of the dot.
- Last slide: KettyBot and the meeting ticket move up, and two QR codes sit below them: "For fun" (the arcade, `assets/qr-fun.png`) and "Technical" (placeholder `assets/qr-tech.svg`). To swap one, replace the file or change the path in `QR` in `demo.js`.
- Footer in two lines: the new disclaimer, then Marc, Sid and Chris and the outfit line.

Below, the v4 notes:


Built from `FINAL/v3/`, which stays unchanged. v4 changes only two things: the team video runs at 1.4× (about 21 s), and in scene 8 the first candidate is a midday gap on C-03 (11:30–13:30, between two cases); the polytrauma takes it, and the agents re-plan to tonight 19:30–22:45. That shows how fast the hospital day changes. Table below: v3 against v2. Layout and design are the same; only the changes from Christian's notes of 14 Nov (late morning). All data is invented. Not a medical device, not a Siemens Healthineers product.

Open `index.html` (or https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v5/). The team video loads from `../../CARMAGOTCHI_Web_Pitch/encore-christian/media/chaos_30s.mp4`.

Keys: → / Space / click next · ← back · F fullscreen · N speaker notes · Home restart. `?s=8` jumps to scene 8, `?rate=1` plays the video at normal speed.

17 scenes (v2 had 18).

| # | Scene | What changed against v2 |
|---|---|---|
| 1 | Team video | plays at 1.2× (30 s → about 25 s), still easy to follow |
| 2 | Statement | text is there at once, no line-by-line animation |
| 3 | Meet C-ARMAGOTCHI | text is there at once; the click still drops the toy |
| 8 | **v2 scenes 8 + 9 in one:** "When is the glorious golden window for an update?" | Inspired by `OPUS/v3/#calendar`. The four signals are now four agents (usage, OR plan, device, room & robot). Click "Plan & delegate": agent cursors swarm the gaps (✕ busy, ○ free), a candidate 17:15–19:15 appears, then "⚠ POLYTRAUMA INCOMING": the trauma team keeps C-01 and C-03, the slot is taken, the agents re-plan in 1.9 ms to 19:30–22:45 with backup C-02 free and risk Low · 0.08. About 5.5 s, runs by itself. Then the "Publish update" button below the agents; click → "✓ Published". |
| 12 | Mission | faster: about 5.5 s until it moves on by itself (v2: 7.8 s) |
| others | | as in v2, numbers shift by one from scene 10 |

Check: `node tools/shots.mjs <dir>` takes a screenshot of every step and fails on console errors.
