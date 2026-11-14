# Aloha Robotics · 3-minute pitch · OPUS v3 · *One night*

**Healthcare Hackathon Bavaria · Erlangen 2026 · Siemens Healthineers Challenge 04: Invisible Connectivity for mobile C-arms**

The free version. It keeps what works (the film, the true-story title, the C-ARMAGOTCHI, "Now.", the live golden-window calendar) and turns the serious half into **one night told against a ticking clock**. The challenge is called *Invisible Connectivity*, so the pitch ends on the proof: in the morning, **nobody noticed**.

```
FILM → BASED ON A TRUE STORY → ALOHA ROBOTICS
→ the C-ARMAGOTCHI: Left on read · Clingy · Busy · Glowing · Flatlined · Plot twist · Repeat → the TV dies
→ Now.  → the word becomes the time: 15:20:00, ticking (24-style)
→ 15:20 a normal Wednesday · the swarm tests every gap · Golden window: 19:10
→ 15:26 Polytrauma · re-planned in ms · New window: 22:20 · one question, one tap
→ the window flies into the clock → 22:00 KettyBot rolls: finds Bogdan, certificate ✓, power + network, area clear
→ 22:20 a human starts it → the clock races to 00:20: installed, verified, logs home
→ the sky turns: 07:00 · Good morning. → Nobody noticed. That's invisible connectivity.
→ Brain. Hands. Heart. · A human starts every update.
→ Every C-arm. Every night. → ALOHA ROBOTICS · Any technical questions?
```

| Read this | For |
|---|---|
| [`SCRIPT.md`](SCRIPT.md) | the exact words, beat by beat, with target times |

## Why this version

- **A spine.** The clock gives the dark half one direction (15:20 → 15:26 → 22:00 → 22:20 → 00:20 → 07:00) without act labels. The audience always knows where they are.
- **The whole solution, end to end.** Every part runs once, in order: planning, emergency, human approval, the robot, the start, the install, verification, the morning.
- **The ending is the proof.** “Nobody noticed” calls back the challenge name and states what it solves, not a number.
- **Christian's framework, compressed.** *Brain · Hands · Heart* is his brain / hands / personality platform in three words, plus his rule: a human starts every update.

## Run it

```bash
python3 OPUS/serve.py          # from the repo root → http://localhost:8000/OPUS/v3/
```

Press **F** on the projector window (fullscreen; this also unlocks sound) and **P** for the presenter view. The black screen is standby: **→** starts the film. `index.html?auto` rehearses hands-free. **A** opens the Q&A appendix.

## Real code on stage

The calendar's swarm calls `js/model/golden.js` on every click: hard rules from the team rule core (`planner.js`) first, then the probability that a window runs undisturbed. The golden window (Cio 19:10), the polytrauma re-plan (Bogdan 22:20) and the measured re-plan time come from that code. The night's times follow from that result. KettyBot's mission and the start are illustrated: they are the proposed physical layer, not hardware we ran.

```bash
node --test OPUS/v3/tests/golden.test.cjs     # 12 tests
```

All data is synthetic. Concept demonstrator, not a Siemens Healthineers or PUDU product, not a medical device.
