# Team material from Christian (Challenge 4, Siemens Healthineers)

Key material for Challenge 4 "Invisible Connectivity", copied from Christian's working repo
`clschulzer/healthcare-hackathon-erlangen-1` (main, commit 7dcefba) so the whole team can read it
next to the C-ARMAGOTCHI pitch. Documents are in German. The working repo stays the source of
truth; this folder is a snapshot and is not kept in sync automatically.

All personas, devices, hospitals and data in here are fictional.

## Start here

| File | What it is |
| :--- | :--- |
| [`challenge-4/README.md`](challenge-4/README.md) | Overview of the challenge work and where everything lives |
| [`challenge-4/briefing.md`](challenge-4/briefing.md) | One-page briefing: problem, users, our idea, demo flow |
| [`challenge-4/plattform-konzept.md`](challenge-4/plattform-konzept.md) | Platform picture: guiding sentence, killer features, services |
| [`challenge-4/pitch-und-demo-konzept.md`](challenge-4/pitch-und-demo-konzept.md) | Pitch and demo concept (two formats: pitch and follow-up meeting) |
| [`challenge-4/pitch-notizen-siemens-healthineers.md`](challenge-4/pitch-notizen-siemens-healthineers.md) | Pitch notes |
| [`challenge-4/menschen-und-ziele.md`](challenge-4/menschen-und-ziele.md) | People involved and what each of them wants |
| [`challenge-4/synthese-nach-gespraech.md`](challenge-4/synthese-nach-gespraech.md), [`gespraech-challenge-geber.md`](challenge-4/gespraech-challenge-geber.md) | What we learned from the challenge owners |
| [`challenge-4/personas/`](challenge-4/personas/) | Personas and user journeys |
| [`challenge-4/entwicklung/`](challenge-4/entwicklung/) | Specs for AI scheduling and the robot cockpit, hospital IT and security architecture, QA of the click dummy |
| [`challenge-4/architektur-skizze.md`](challenge-4/architektur-skizze.md), [`design-richtlinie-siemens-healthineers.md`](challenge-4/design-richtlinie-siemens-healthineers.md) | Architecture sketch and design guideline |
| [`challenge-4/research/00-synthese.md`](challenge-4/research/00-synthese.md) | Research summary (the detailed research files stay in the working repo, so some links there point nowhere here) |

## Click dummy

`challenge-4/klickdummy/` is the clickable prototype (plain HTML/JS, runs offline). Screenshots are in
`challenge-4/klickdummy/screenshots/`, the C-ARMAGOTCHI figures from this repo's pitch are in
`challenge-4/klickdummy/assets/carmagotchi/`.

```bash
python3 -m http.server 8000
# then open http://localhost:8000/team-material-christian/challenge-4/klickdummy/
```
