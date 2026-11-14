# Aloha Robotics · 3-minute pitch · Christian's storyboard

**Healthcare Hackathon Bavaria · Erlangen 2026 · Siemens Healthineers Challenge 04: Invisible Connectivity for mobile C-arms**

This version follows **Christian's storyboard v4** (`CARMAGOTCHI_Web_Pitch/pitch-demo-christian/docs/storyboard-pitch-v4.md`, 13 Nov 22:00), his killer-features briefing and his pitch click dummy. It uses his story, his words and his three pillars, built as one live keynote in the same coded template as OPUS: no screencasts and no PowerPoint. Where the storyboard leaves the look open, the gaps follow the team's style: big type, light for the emotional part, dark for the serious part, and quick, clean animation.

```
FILM → BASED ON A TRUE STORY → ALOHA ROBOTICS
→ "We root for the invisible underdogs who keep hospitals running." · "They deserve technology they don't fear, but love to use."
EMOTIONAL CONNECTIVITY (light)
→ Meet C-ARMAGOTCHI: Cio on its team's phone · Lonely · Hungry · Happy
→ Every mood is a data point · you feel responsible · the mood becomes PRIORITY (Cio 1, C-04 2)
AI ORCHESTRATION · HUMAN IN THE LOOP (dark)
→ When is the best moment? OR plan live · OR 3 cancelled 19:12 · four signals
→ One push of a button: the window is FOUND (19:30–22:45) · medical physics publishes
→ Lena's job card · "Not today" · declining costs nothing
→ Like a ride request: six people, nobody available → send the invisible helper
PHYSICAL CONNECTIVITY
→ KettyBot's mission: Check · Find · Dock · Wake · Safe? · 14 checks tick off live · 14/14
→ Lena's phone: right time? surroundings OK? start → "A human starts every update."
→ Update running · today is a good day · report, audit trail, next job
CLOSE THE LOOP
→ Loop closed: a thank-you, fresh data, a safe current C-arm (light)
→ The three pillars · no patient data · signed packages · rollback ready
→ Three minutes only scratch the surface · Let's brainstorm, our robot booked the room · Everyone talks about AI, we execute on IA: invisible autonomy · ALOHA ROBOTICS
```

The three pillars ride along as a small strip at the top and light up per act. At the end they grow into the pillar slide.

| Read this | For |
|---|---|
| [`SCRIPT.md`](SCRIPT.md) | the exact words, beat by beat, with target times |

## Run it

```bash
python3 OPUS/serve.py          # from the repo root → http://localhost:8000/OPUS/christian/
```

Press **F** on the projector window (fullscreen; this also unlocks the film's sound) and **P** for the presenter view (script, next cue, clock). The black screen is standby: **→** starts the film. `index.html?auto` rehearses hands-free.

Christian's storyboard has the real **KettyBot drive to a C-arm on stage** during the mission. The mission slide shows what the robot "thinks" (14 checks), so it works with or without the live robot.

## Decisions to check with Christian

- **The film is the full 30 s** (his storyboard planned 20 s). To make room, a few words are optional in the script (marked [ ]).
- **"BASED ON A TRUE STORY"** stays before the statement because UNITED kept it. Cut it if he prefers the statement straight after the film.
- **Update duration:** his click dummy says *expected 18 min (manufacturer)*, and the run shows 17 min 40 s. Siemens said about 2 h for an install in the interviews, and his own rule core (`planner.js`) also uses 120 min. Decide which number to say. The golden window (19:30–22:45) fits either.
- **Ending:** his storyboard ends on the logo and KettyBot's wink. "Any technical questions?" is added under the logo (team preference).

All data is invented. No patient data. Not a Siemens Healthineers or PUDU product. The characters carry the Siemens Healthineers logo: for the pitch only.

## Files

```
OPUS/christian/
├── index.html · presenter.html
├── css/christian.css · fonts.css (embedded, OFL)
├── js/core.js · engine.js · notes.js (the script)
├── js/scenes/embers.js · film.js   film → true-story title
├── js/scenes/story.js              all 11 acts (each beat is a CSS state)
└── assets/characters/              the team's characters
```

The film is shared with OPUS (`../assets/video/aloha_intro.mp4`).
