# C-ARMAGOTCHI click dummy, detailed version (Christian)

Live: https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/klickdummy-christian/

The detailed click dummy behind the 3-minute pitch. Same look and feel as the pitch demo
(`../pitch-demo-christian/`), but more complex: it shows the jury there is a clickable system with
tested rules behind the slides. German and English (switch at the top), night and paper theme.

**All data is invented. Concept demo, not a medical device, not a Siemens Healthineers product.**

## What is in it

- Eight areas: Overview, Today, Planning board, Devices and device file, Companion, Robot, Control
  room, More services, Helpers and rules.
- A phone pops up on push notifications: Lena (radiographer, late shift) and Dr Seidel (medical
  physics). Job offers nearby, “Cio is ready, confirm the start?”, polytrauma with only your own
  change, Guardian warnings, thank-you with the care streak. An answer on the phone runs through the
  same safety rules as the button on screen (`canStart` in `planner.js`).
- Guided demo along five key journeys plus the 13-scene tour: speaker notes, the next click pulses in
  orange, “Show me” does the click. Arrow keys change the step, H hides notes and bar.

## Run and check

Open `index.html`, offline, no build. Source of truth is the hackathon repo
(`challenges/04-invisible-connectivity/klickdummy/`); this folder is a copy for GitHub Pages.

```bash
node --test planner.test.cjs   # 15 rule tests
node tools/journeys.mjs /tmp/journeys en   # plays all journeys, needs Playwright
```

The figures come from the team deck (see `assets/carmagotchi/README.md`) and carry the Siemens
Healthineers logo: for pitch and demo only.
