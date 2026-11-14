# FINAL v3 · faster, with the agent calendar

Built from `FINAL/v2/`, which stays unchanged. Layout and design are the same; only the changes from Christian's notes of 14 Nov (late morning). All data is invented. Not a medical device, not a Siemens Healthineers product.

Open `index.html` (or https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v3/). The team video loads from `../../CARMAGOTCHI_Web_Pitch/encore-christian/media/chaos_30s.mp4`.

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
