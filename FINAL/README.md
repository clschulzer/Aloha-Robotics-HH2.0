# FINAL: the final versions of the pitch

Each version gets its own folder. Start with **[`v1/`](v1/)**.

| Version | What it is |
|---|---|
| [`v2/`](v2/) | Christian's pitch (`CARMAGOTCHI_Web_Pitch/pitch-demo-christian`) with his fine-tuning from 14 Nov: Tamagotchi intro, AI Scheduling Suite, "Who plugs it in?", Aloha PatchRover, new close. See [`v2/README.md`](v2/README.md). |
| [`v3/`](v3/) | v2, faster: video 1.2×, intro text without animation, faster mission, and v2 scenes 8 + 9 combined into one agent calendar with a polytrauma re-plan and a "Publish update" button. See [`v3/README.md`](v3/README.md). |
| [`v1/`](v1/) | One pitch assembled from all the existing presentations, following Marc's notes from 14 Nov. Nothing new was invented: every scene comes from code we already had. |

## v1 at a glance

| # | Scene | Taken from | What changed |
|---|---|---|---|
| 1 | The film (30 s) | `OPUS` | nothing |
| 2 | "Based on a true story." | `OPUS` ember intro | The particles no longer form the ALOHA ROBOTICS title. The line burns into embers that keep rising while the team walks on stage. |
| 3 | We are Aloha Robotics · we root for the invisible underdogs · technology they love to use | Christian's statement (pitch demo, `c37c417`) | 3 lines, one per click |
| 4 | Meet C-ARMAGOTCHI | Christian's phone (`OPUS/christian`) and the drop, blink, one-mood-per-click and sounds of the OPUS toy (`OPUS/v2`) | The phone drops in, blinks, opens: Lonely · Hungry · Installing · Happy · Dead on arrival. Then "Every mood is a data point" while all moods flicker faster and faster. No grid with every character at once. |
| 5 | TV switches off → "Now we have the physical. Introducing the invisible." | CRT switch-off from `OPUS/v2`, Marc's line | new line |
| 6 | The calendar and the swarm | `ASTRA/versions/04-constellation` (board + 144 scouts that really call `golden.js`) | Decluttered: the date shows with the board, then gives way to "Care has right of way." No brand, status chip, roster line or running captions. Ends with "✓ Published" → "Who plugs Cio in?" |
| 7 | Lena's phone · ride request · KettyBot's 14 checks · a human starts every update · update running · report · loop closed | `OPUS/christian` | No top bar. Clock times follow the window the swarm finds (Cio 19:10–21:10). |
| 8 | Three minutes only scratch the surface → let's brainstorm (three asks, room booked) → ALOHA ROBOTICS · Any technical questions? | `OPUS/christian` (Christian's closing, `14ae577`) | nothing |

The top bar is gone everywhere: no brand line and no pillar chips.

## Run it

```bash
python3 OPUS/serve.py 8000          # from the repo root
# projector:  http://localhost:8000/FINAL/v1/
# presenter:  http://localhost:8000/FINAL/v1/presenter.html
```

On the projector window, press **F** for fullscreen; this also unlocks sound. Press **P** to open the presenter view. The black screen is standby, and **→** starts the film. `index.html?auto` rehearses hands-free and runs for about 2:50.

The full script with timings is in [`v1/SCRIPT.md`](v1/SCRIPT.md).
