# Aloha Robotics — Presentations

**[Watch the presentation used at the hackathon ↗](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Presentation/hackathon/?s=1)**

**4th place · Healthcare Hackathon Bavaria · Erlangen 2026.** The three-minute pitch used by Marc, Sid and Chris is preserved in [`hackathon/`](hackathon/). All 14 files—including the film, characters, QR codes, stylesheet, script and speaker notes—match the team's final used version.

The former [FINAL/v5 link](https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v5/?s=1) forwards here. Existing shared presentation links remain usable.

## Present and rehearse

| Control | Action |
| --- | --- |
| **→ / Space / Page Down / Enter** | Next step or scene |
| **Click the stage** | Next step; dedicated phone actions retain their own behavior |
| **← / Page Up** | Previous step or scene |
| **Home / 0** | Return to the first scene |
| **N** | Show or hide speaker notes in the presentation window |
| **F** | Enter or leave fullscreen |

Some animation steps advance automatically; others wait for the presenter. The notes overlay is visible in the presentation window, so use it on a private rehearsal screen.

From the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/Presentation/hackathon/?s=1>. Use `?s=8` to start at scene 8, `&notes=1` for notes, or `&auto=0` to disable timed scene advances. The faster team-video timing is baked into the video file.

## The longer Siemens pitch

Start with the [Siemens follow-up brief](../Documentation/siemens-follow-up.md), [research index](../Documentation/README.md) and [working Care Companion](../Care-Companion/README.md). The follow-up deck has not been created; its audience, duration and meeting date remain open.

Keep `hackathon/` as the record of what was presented. Develop a future cut in a separate named folder once the team agrees its scope. The existing pitch's scheduling and robot scenes are scripted demonstrations; use the runnable planner and specifications for technical discussion.

## Source and history

- [Used presentation source](hackathon/) · [original revision notes](hackathon/README.md)
- [Project website](../Website/README.md) · [QR kit](../Website/share/)
- [Earlier presentations](../Archive/README.md)
- [Used-version recovery tag](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/post-hackathon-2026-11-14) · [rollback guide](../ROLLBACK.md)

The original README inside `hackathon/` remains part of the preserved artifact. Its older version names and paths describe development history; this guide provides the current launch instructions.
