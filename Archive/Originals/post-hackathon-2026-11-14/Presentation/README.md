# Aloha Robotics — the submitted presentation

**[Open the submitted pitch from the beginning ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v5/?s=1)**

The submitted version is **`FINAL/v5/`**. This folder is its launch guide. The original 14-file presentation tree—including its video, artwork, QR images, code and README—is preserved unchanged.

## Present it

Open the link above, focus the presentation window and press **F** for fullscreen. Advance through the story with the arrow keys or a presentation clicker. Several animated steps advance automatically; the mission’s final step waits for your click.

| Control | Action |
| --- | --- |
| **→ / Space / Page Down / Enter** | Next step or scene |
| **Click the stage** | Next step; dedicated phone actions retain their own behavior |
| **← / Page Up** | Previous step or scene |
| **Home / 0** | Return to the first scene |
| **N** | Show or hide the speaker notes overlay |
| **F** | Enter or leave fullscreen |

These controls come from the submitted `demo.js`. The notes overlay appears in the presentation window, so use it on a private rehearsal screen.

## Rehearse locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open **[http://localhost:8000/FINAL/v5/?s=1](http://localhost:8000/FINAL/v5/?s=1)**.

For a specific passage, use `?s=8` to start at scene 8. Add `&notes=1` to show notes or `&auto=0` to disable the scene timer advances. The submitted team video has its faster timing baked into the video file; normal playback preserves that timing.

## Source and supporting material

- [Submitted source](../FINAL/v5/) · [original version notes](../FINAL/v5/README.md)
- [Project website](../Website/README.md) · [technical documentation](../Documentation/README.md)
- [Current QR download kit](../Website/share/) — separate from the frozen presentation’s original final-slide images
- [Earlier versions and experiments](../Archive/README.md)

The submitted closing slide retains its original arcade QR and technical placeholder. The separate QR kit provides the three working Explore, Play and Try destinations for handouts or future presentations.

## Preservation

The submitted presentation is not copied over, restyled or upgraded during repository organization. Its original public URL remains the canonical launch link. Legacy route folders are retained where existing QR codes, media links or installed companion apps depend on them.

The pre-organization repository is preserved at **[backup/pre-cleanup-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/pre-cleanup-2026-11-14)**, commit [`01b14a9`](https://github.com/clschulzer/Aloha-Robotics-HH2.0/commit/01b14a9). See [rollback instructions](../ROLLBACK.md).
