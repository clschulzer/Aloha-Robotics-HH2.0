# C-ARMAGOTCHI — Interactive Website Pitch (v2)

**Healthcare Hackathon Bayern 2026 · Siemens Healthineers Challenge 04 · Invisible Connectivity for Mobile C-arms**

A deliberately theatrical **14-scene, 16:9 website presentation** with a sharply more restrained technical second half. Built on the *presentation approach* showcased by [TALOS](https://github.com/ibrahimify/talos): static HTML/CSS/JS, deterministic per-click reveals, an offline 1920 × 1080 stage, keyboard/clicker navigation, speaker notes and a separate teleprompter. This is an original implementation, **not a copy of the TALOS files**.

## Running it

Unzip the folder. The quickest way is to open `pitch/index.html` in Chrome, Edge or Firefox. All necessary files are local; the presentation does not require a network connection.

For reliable embedded-film playback and teleprompter synchronization, run from the project root:

```bash
python3 -m http.server 8000
```

Then open:

- Project landing: `http://localhost:8000/`
- Projector: `http://localhost:8000/pitch/`
- Presenter notes: `http://localhost:8000/teleprompter/`

## Presenter controls

| Key | Action |
|---|---|
| `→` / `Space` / click right half | Advance one reveal |
| `←` / click left edge | Previous reveal |
| `F` | Fullscreen |
| `N` | Overlay speaker notes |
| `A` | Jump to/return from 2-scene technical appendix |
| `B` | Blackout |
| `R` | Restart from scene one |
| `Home` / `End` | First / final scene |
| `?` | Help |
| `S`, `P`, `V` | Toggle film audio, play/pause film, restart film |

Direct state links: `pitch/index.html#10.3` (scene 10, reveal 3) and `#A2.1` (appendix scene 2).

## Story / approximate timing

1. **Title and challenge identity** — 10 seconds. Introduce the team and Siemens Challenge 04.
2. **Attached chaotic film** — 40 seconds. The original user-supplied MP4, included at `pitch/media/chaos_intro.mp4`.
3. **Palmer Luckey lookalike / AMERICA!** — 9 seconds; deliberately brief theatrical interruption.
4. **Three team entrances** — 15 seconds; each deliberately slams onto the screen.
5. **Live Tamagotchi phone** — 20 seconds; synthetic stateful demonstration.
6. **C-ARMAGOTCHI mood morphs** — 20 seconds; retains the established character-image transitions.
7. **Sharp tonal cut** — 7 seconds; intentional silence before technical proof.
8. **Invisible Connectivity problem** — 20 seconds; clinical time vs maintenance time.
9. **Proposed multi-agent architecture** — 25 seconds; Scout / Risk / Preflight + deterministic human gate.
10. **Synthetic surgical schedule and golden window** — 30 seconds; constraints applied across separate reveals.
11. **Isolated preflight sandbox** — 23 seconds; mocked compatibility mismatch prevents deployment.
12. **Robot service route** — 22 seconds; proposed physical service endpoint.
13. **Human authority** — 18 seconds; clear hard limits and safety rules.
14. **IAI finale** — 20 seconds; Invisible Agentic Intelligence and KettyBot wink.

The 40-second film brings the total to about **4 min 40 seconds** at the suggested pace, plus human pauses and Q&A. Shorten or hide selected steps if the event imposes a stricter time limit.

## Edit the team identity (important)

`C-ARMAGOTCHI` is used as the **working team name** because no official team name was provided. In `pitch/index.html`:

- Replace `TEAMMATE 01`, `TEAMMATE 02`, `TEAMMATE 03` and their role descriptions with real names.
- Swap the three inline vector portrait illustrations with actual approved photos or SVGs if desired.
- Edit the cover team name/challenge label if the official branding changes.
- Keep the Palmer Luckey moment clearly framed as a **teammate lookalike gag**, not an actual appearance or endorsement.

After editing `data-note` attributes, regenerate the teleprompter data:

```bash
python build_teleprompter.py
```

Or edit `speaker_script.md` as a rehearsal document; the `data-note` attributes in `pitch/index.html` are the teleprompter's source of truth.

## Engineering honesty

The connected-device dashboard, OR schedules, interruption percentages, service identities, agent outputs, shadow environment, robotic docking and update actions are **all illustrative**. No hospital API or Siemens/PUDU equipment was accessed. Emergency-risk percentages are **synthetic scenario inputs**, not clinical predictions. The automation never treats an agent recommendation as authorization for a firmware installation.

Real production work would require device-specific connectivity and power support, approved service interfaces, manufacturer update validation, physical robot clearance, hospital cybersecurity/privacy controls and human supervision for mechanical calibration, failure recovery and clinical release.

## Files modified from the original pitch

The project preserves the previous character assets in `pitch/assets/` and the original brainstorm in `source/brainstorm.md` unmodified. Only the following were changed or added:

- `pitch/index.html` — redesigned 14-scene story and notes.
- `pitch/deck.css` — new editorial design and controlled transitions.
- `pitch/deck.js` — deterministic navigation, richer simulations and per-scene state.
- `pitch/media/` — user-supplied intro MP4 + two original short synthesized UI sound effects.
- `speaker_script.md` — revised stage cues.
- `teleprompter/data.js` — regenerated from notes.
- `README.md`, `DEPLOY.md`, `index.html` — refreshed launch and usage instructions.

The original art is used unchanged under `pitch/assets/`.


## v2.1 presentation polish (2026-11-13)

This is a targeted, non-destructive update of the existing 14-scene website:

- Phone personality layers now crossfade instead of swapping `img.src` abruptly.
- The technical tone-shift has its own controlled typographic reveal.
- The schedule first scans candidates, then visibly rejects risky idle windows, then proposes an authorization-pending window.
- The multi-agent diagram draws distinct signal paths per click.
- The isolated preflight adds visible verification and a no-deployment failure state.
- The service robot moves first, docks second, and only then reveals a cable for permitted log sync. A completed job changes the C-arm expression.
- Team entrances settle with subtle impact cues. The closing KettyBot receives one brief wink.
- Jumping backwards or using deep links settles visual states instantly; forward clicker steps animate normally.
- Both the inline notes and the second-screen teleprompter include per-click performance cues.

Preserved without changes: supplied chaos MP4, original character image assets, scene and appendix ordering, presentation controls and project design language. This revision does not claim device integration, validated emergency predictions, or autonomous software deployment.
