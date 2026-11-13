# Aloha Robotics — Healthcare Hackathon 2.0 (HH2.0)

Team repository for Healthcare Hackathon 2.0 featuring the **C-ARMAGOTCHI** presentation series, interactive web pitch decks, synchronized teleprompters, media assets, run-of-show cues, and hackathon project materials.

---

## 🚀 Live Presentation & Demo (GitHub Pages)

The latest interactive presentation is deployed live and fully clickable on GitHub Pages:

### 🌟 Latest (Version 4 — 3-Minute Encore & Full Deck)
- **🚀 Main Landing Page**: [Open Presentation Hub](https://clschulzer.github.io/Aloha-Robotics-HH2.0/)
- **⚡ 3-Minute Encore Pitch (Recommended for Judges)**: [Launch 3-Min Deck](https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/encore/)
- **🎙️ 3-Minute Speaker Teleprompter**: [Open 3-Min Prompter](https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/encore-prompter/)
- **📽️ Full 14-Scene Presentation**: [Launch Full 14-Scene Deck](https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/pitch/)
- **📝 Full-Deck Speaker Notes**: [Open Full Teleprompter](https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/teleprompter/)
- **📋 Run of Show (Script & Timings)**: [`THREE_MINUTE_RUN_OF_SHOW.md`](CARMAGOTCHI_Web_Pitch/THREE_MINUTE_RUN_OF_SHOW.md)

---

## 💻 Local Presentation & Two-Screen Sync

For the most reliable offline presentation and multi-screen synchronization (projector + speaker display):

```bash
# 1. Run local web server from repo root
python3 -m http.server 8000
```

Then open in your browser:
- **Presentation Hub**: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/`
- **Projector (3-Min Pitch)**: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/encore/`
- **Speaker Screen (3-Min Prompter)**: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/encore-prompter/`
- **Full Deck (Projector)**: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/pitch/`
- **Full Deck Notes**: `http://localhost:8000/CARMAGOTCHI_Web_Pitch/teleprompter/`

*(When opened in the same browser, speaker notes advance automatically as you step through the deck!)*

---

## 🎮 Presentation Controls

| Key | Action |
| :--- | :--- |
| `→` / `Space` / Click right | Next beat / reveal |
| `←` / Click left edge | Previous reveal |
| `F` | Toggle fullscreen |
| `N` | Toggle speaker notes overlay |
| `A` | Jump to / return from Technical Q&A Appendix |
| `B` | Blackout screen |
| `R` | Restart presentation from Scene 1 |
| `P` | Play / Pause embedded video |
| `S` | Toggle video audio |
| `V` | Replay video from beginning |
| `?` | Show on-screen keyboard shortcuts help |

---

## 📁 Repository Structure

```
├── CARMAGOTCHI_Web_Pitch/       # Active presentation website & deck (Version 4)
│   ├── index.html               # Hub landing page (Encore vs Full Deck)
│   ├── encore/                  # ★ NEW: 3-Minute 9-scene Encore deck
│   │   ├── index.html           # 3-Minute deck HTML
│   │   ├── encore.css           # 3-Minute deck styles
│   │   ├── encore.js            # 3-Minute interaction engine
│   │   └── media/chaos_30s.mp4  # 30-second opening film
│   ├── encore-prompter/         # ★ NEW: 3-Minute synchronized teleprompter
│   │   ├── index.html
│   │   └── data.js
│   ├── pitch/                   # Preserved 14-scene full pitch deck
│   │   ├── assets/              # Character artwork (manic, bliss, rollback, etc.)
│   │   ├── media/               # 40-second intro video & sound effects
│   │   ├── deck.css             # Presentation design & styles
│   │   ├── deck.js              # Presentation engine
│   │   └── index.html           # 14-scene slide deck
│   ├── teleprompter/            # 14-scene synchronized teleprompter
│   ├── THREE_MINUTE_RUN_OF_SHOW.md # Timing cues and stage directions
│   ├── speaker_script.md        # Full stage cues for 14-scene deck
│   ├── source/brainstorm.md     # Concept & brainstorming notes
│   └── build_teleprompter.py    # Script to regenerate teleprompter data
├── backups/                     # Frozen snapshots for rollback
│   ├── presentation_original_v0/ # Frozen snapshot: Version 1 (baseline)
│   ├── presentation_v2/         # Frozen snapshot: Version 2
│   ├── presentation_v3/         # Frozen snapshot: Version 3
│   └── presentation_v4/         # Frozen snapshot: Version 4
└── index.html                   # Root redirect for GitHub Pages
```

---

## ⏪ Rollback & Version Matrix

Every version is preserved across multiple layers (Git tags, GitHub branches, and local frozen folders):

| Version | Description | Git Tags | GitHub Branch | Local Backup Snapshot |
| :--- | :--- | :--- | :--- | :--- |
| **V1** | Initial presentation baseline (13 scenes) | `v1`, `v1.0-presentation`, `v0-presentation-baseline` | `backup/presentation-v1`, `backup/presentation-original` | `backups/presentation_original_v0/` |
| **V2** | 14 scenes + chaos intro film & sound effects | `v2`, `v2.0-presentation` | `backup/presentation-v2` | `backups/presentation_v2/` |
| **V3** | Refined 14-scene CSS, JS & teleprompter data | `v3`, `v3.0-presentation` | `backup/presentation-v3` | `backups/presentation_v3/` |
| **V4 (Latest)** | 3-minute encore (`encore/`), 3-min prompter, run-of-show | `v4`, `v4.0-presentation`, `latest` | `main`, `backup/presentation-v4` | `backups/presentation_v4/` |

---

## 🔄 How to Roll Back Between Versions

You can roll back the working tree to any version at any time:

### To roll back to Version 1:
```bash
git checkout v1 -- CARMAGOTCHI_Web_Pitch/
git commit -m "Rollback to Version 1"
git push origin main
```

### To roll back to Version 2:
```bash
git checkout v2 -- CARMAGOTCHI_Web_Pitch/
git commit -m "Rollback to Version 2"
git push origin main
```

### To roll back to Version 3:
```bash
git checkout v3 -- CARMAGOTCHI_Web_Pitch/
git commit -m "Rollback to Version 3"
git push origin main
```

### To restore the latest Version 4:
```bash
git checkout v4 -- CARMAGOTCHI_Web_Pitch/
git commit -m "Restore Version 4"
git push origin main
```

### Compare versions:
```bash
# Compare Version 1 against Version 4
git diff v1 v4 -- CARMAGOTCHI_Web_Pitch/

# Compare Version 3 against Version 4
git diff v3 v4 -- CARMAGOTCHI_Web_Pitch/
```
