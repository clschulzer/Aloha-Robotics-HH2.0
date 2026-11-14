# Aloha Robotics

### Let care keep moving.

Mobile C-arms deserve a little care of their own. Aloha brings together a character people understand, a planner that finds an opportunity for maintenance, and a clear handover to someone who can help. **The system gets attention. The clinical team gets back to the patient.**

Built for **Healthcare Hackathon Bavaria · Erlangen 2026**, Siemens Healthineers Challenge 04: *Invisible Connectivity*.

## Explore Aloha

| Start here | What you’ll find |
| --- | --- |
| **[Watch the submitted presentation ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v5/?s=1)** | The team’s final three-minute pitch, preserved exactly as submitted. |
| **[Visit the website ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/)** | The idea, an interactive care loop, technical explanations and the code behind them. |
| **[Play C-Arcade ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/C-Arcade/)** | C-CHOMP and PLUG PANIC. One very hungry C-arm; one very busy KettyBot. |
| **[Try Care Companion ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Care-Companion/)** | The phone experience and the detailed platform prototype, ready to explore. |

**[Read the documentation](Documentation/README.md)** · **[Browse the archive](Archive/README.md)** · **[Download the QR kit](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/share/)**

## Take a little Aloha with you

| Explore the system | Play the chaos | Try the platform |
| :---: | :---: | :---: |
| <a href="https://clschulzer.github.io/Aloha-Robotics-HH2.0/ALOHA/"><img src="Website/share/explore-card.png" width="240" alt="QR card: Explore Aloha — technical guide and source code"></a> | <a href="https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_APP/arcade/"><img src="Website/share/play-card.png" width="240" alt="QR card: Play C-CHOMP and PLUG PANIC"></a> | <a href="https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/klickdummy-christian/"><img src="Website/share/app-card.png" width="240" alt="QR card: Try Christian’s interactive planning platform"></a> |
| [PNG](Website/share/explore-qr.png) · [SVG](Website/share/explore-qr.svg) | [PNG](Website/share/play-qr.png) · [SVG](Website/share/play-qr.svg) | [PNG](Website/share/app-qr.png) · [SVG](Website/share/app-qr.svg) |

[Download the full three-card sheet](Website/share/three-qr-cards.png) · [Vector sheet for slides or print](Website/share/three-qr-cards.svg)

The codes retain their original public destinations. Existing QR links and installed companion apps continue to work through the preserved legacy routes.

## What we built

The project combines a cinematic web pitch, an interactive service-planning prototype, a mobile companion and two original games. The planning prototype uses explicit JavaScript rules for maintenance windows and human approval; its rules can be run and tested separately from the interface.

**HTML · CSS · JavaScript · Canvas · WebGL · Node’s test runner.** The public experiences run without a build step. Schedules, notifications, robot checks and device updates are demonstrations using invented data; live hospital and manufacturer integrations remain proposed work.

[Explore the technical guide ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/technical.html) for the implementation, architecture, source evidence and next steps.

## Find your way around

| Folder | Purpose |
| --- | --- |
| [Presentation/](Presentation/README.md) | Launch instructions and controls for the unchanged submitted pitch in `FINAL/v5/`. |
| [Website/](Website/README.md) | Public project website, technical guide and downloadable QR assets. |
| [Care-Companion/](Care-Companion/README.md) | Companion experiences and their source code. |
| [C-Arcade/](C-Arcade/README.md) | Both games, controls and implementation notes. |
| [Documentation/](Documentation/README.md) | Research, transcripts, architecture options, specifications and evidence. |
| [Archive/](Archive/README.md) | Earlier presentations, experiments and preserved development history. |

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the website](http://localhost:8000/Website/), [Care Companion](http://localhost:8000/Care-Companion/), [C-Arcade](http://localhost:8000/C-Arcade/) or [the submitted pitch](http://localhost:8000/FINAL/v5/?s=1). Each project’s README contains its controls and relevant checks.

## Preservation and credits

The submitted presentation and its dependencies are frozen. The full state before repository organization is preserved by **[backup/pre-cleanup-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/pre-cleanup-2026-11-14)** at commit [`01b14a9`](https://github.com/clschulzer/Aloha-Robotics-HH2.0/commit/01b14a9). See [ROLLBACK.md](ROLLBACK.md) for restoration instructions.

**Marc, Sid and Chris · Aloha Robotics.** Team-created film, characters, prototypes and presentation code are preserved with their source material. Font licenses and asset provenance remain beside the relevant assets. This repository documents a hackathon concept; it is not a medical device or a Siemens Healthineers product.
