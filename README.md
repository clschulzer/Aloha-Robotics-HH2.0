# Aloha Robotics — Healthcare Hackathon 2.0 (HH2.0)

Team repository for Healthcare Hackathon 2.0 featuring the **C-ARMAGOTCHI** interactive website pitch (v2), concept presentation, synchronized teleprompter, media assets, and hackathon project materials.

## Live Presentation & Demo (GitHub Pages)

- **Live Site**: [https://mteyra.github.io/Aloha-Robotics-HH2.0/](https://mteyra.github.io/Aloha-Robotics-HH2.0/)
- **Interactive Pitch Deck**: [Launch Deck (v2)](https://mteyra.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/pitch/)
- **Speaker Teleprompter**: [Open Teleprompter](https://mteyra.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/teleprompter/)
- **Web Pitch Landing Page**: [View Landing](https://mteyra.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/)

## What's New in Version 2

- **14 Scenes**: 14 directed scenes with a theatrical first half and an engineering-focused second act.
- **Embedded Chaos Intro Video**: Embedded local MP4 film (`pitch/media/chaos_intro.mp4`).
- **Sound Effects**: Audio impacts and cues (`pitch/media/impact.wav`, `pitch/media/screech.wav`).
- **Enhanced Deck Controls**:
  - `→` / `Space` / click right half: next reveal
  - `←` / click left edge: previous reveal
  - `F`: fullscreen | `N`: speaker notes | `A`: technical Q&A appendix | `B`: blackout | `R`: restart
  - `S`: toggle film audio | `P`: play/pause film | `V`: restart film
- **Updated Presenter Sync**: 16 synchronized teleprompter scenes via `BroadcastChannel` and `localStorage`.

## Quick Start (Offline / Local Host)

For optimal local presentation and two-window sync:

```bash
python3 -m http.server 8000
```

Then open in your browser:
- Projector: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/pitch/`
- Speaker screen: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/teleprompter/`

## Repository Structure

```
├── CARMAGOTCHI_Web_Pitch/       # Active presentation website & deck (v2)
│   ├── index.html               # Presentation landing page
│   ├── pitch/                   # Interactive 16:9 pitch canvas, animations & styles
│   │   ├── assets/              # Character artwork & illustrations
│   │   ├── media/               # Video (chaos_intro.mp4) & audio (impact, screech)
│   │   ├── deck.css             # Styles & animations
│   │   ├── deck.js              # Presentation engine & broadcast sync
│   │   └── index.html           # Main pitch slides (v2)
│   ├── teleprompter/            # Synchronized speaker view
│   ├── speaker_script.md        # Script & timing cues
│   ├── source/                  # Source brainstorming & concepts
│   └── build_teleprompter.py    # Script to regenerate teleprompter data
├── backups/
│   ├── presentation_original_v0/ # Frozen baseline backup of Version 1
│   └── presentation_v2/          # Frozen baseline backup of Version 2
└── index.html                   # Root redirect for GitHub Pages
```

## Rollback & Version History

Rollback between versions is supported at multiple levels:

### Version 1 (Original Baseline)
- **Git Tags**: `v1`, `v1.0-presentation`, `v0-presentation-baseline`
- **Git Branch**: `backup/presentation-original`
- **Local Directory**: `backups/presentation_original_v0/`

### Version 2 (Current Active Version)
- **Git Tags**: `v2`, `v2.0-presentation`
- **Git Branch**: `main`
- **Local Directory**: `backups/presentation_v2/`

### How to Rollback to Version 1

```bash
# Option A: Restore the presentation folder directly to Version 1 using Git
git checkout v1 -- CARMAGOTCHI_Web_Pitch/
git commit -m "Rollback presentation to Version 1"
git push origin main

# Option B: Restore from the local frozen backup folder
rm -rf CARMAGOTCHI_Web_Pitch
cp -a backups/presentation_original_v0 CARMAGOTCHI_Web_Pitch

# Option C: View differences between Version 1 and Version 2
git diff v1 v2 -- CARMAGOTCHI_Web_Pitch/
```
