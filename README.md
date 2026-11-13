# Aloha Robotics — Healthcare Hackathon 2.0 (HH2.0)

Team repository for Healthcare Hackathon 2.0 featuring the **C-ARMAGOTCHI** interactive pitch, concept presentation, teleprompter, and hackathon project materials.

## Live Presentation & Demo
- **Live Pitch Deck**: [Launch Deck](CARMAGOTCHI_Web_Pitch/pitch/index.html)
- **Speaker Teleprompter**: [Open Teleprompter](CARMAGOTCHI_Web_Pitch/teleprompter/index.html)
- **Web Pitch Landing Page**: [View Landing](CARMAGOTCHI_Web_Pitch/index.html)

## Quick Start (Offline / Local Host)

To testPresenter Synchronization (two-screen sync between deck and teleprompter), run:

```bash
python3 -m http.server 8000
```

Then open:
- Projector: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/pitch/`
- Speaker screen: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/teleprompter/`

## Repository Structure

```
├── CARMAGOTCHI_Web_Pitch/       # Active presentation website & deck
│   ├── index.html               # Presentation landing page
│   ├── pitch/                   # Interactive 16:9 pitch canvas, animations & styles
│   │   ├── assets/              # Character artwork & media
│   │   ├── deck.css             # Styles & animations
│   │   ├── deck.js              # Presentation engine & broadcast sync
│   │   └── index.html           # Main pitch slides
│   ├── teleprompter/            # Synchronized speaker view
│   ├── speaker_script.md        # Script & timing cues
│   ├── source/                  # Source brainstorming & concepts
│   └── build_teleprompter.py    # Script to re-sync teleprompter data
├── backups/
│   └── presentation_original_v0/ # Frozen baseline backup of initial slides
└── index.html                   # Root redirect for GitHub Pages
```

## Rollback & Version History

- **Git Tag**: `v0-presentation-baseline` points to the original untouched version of the presentation.
- **Backup Branch**: `backup/presentation-original` is preserved as a permanent branch.
- **Local Backup Directory**: `backups/presentation_original_v0/` contains an untouched copy on disk.

To rollback or diff against the original baseline at any time:
```bash
# Compare changes against original baseline
git diff v0-presentation-baseline -- CARMAGOTCHI_Web_Pitch/

# Restore specific file from original baseline
git checkout v0-presentation-baseline -- CARMAGOTCHI_Web_Pitch/path/to/file

# Or copy from local backup folder
cp -r backups/presentation_original_v0/* CARMAGOTCHI_Web_Pitch/
```
