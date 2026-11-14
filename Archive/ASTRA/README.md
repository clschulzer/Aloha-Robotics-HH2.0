# Aloha Robotics / C-ARMAGOTCHI — ASTRA web pitch

A three-minute web pitch that improves the team's existing encore: the complete original AI film, six Tamagotchi character states in light mode, a serious dark transition, a visual search for the golden maintenance window, a flowing architecture, and a short return to the patient.

All pitch changes and copies live in `ASTRA/`. The original team files elsewhere in the repository remain untouched.

## Launch

**[Open the published ASTRA pitch](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/)** · **[Presenter desk](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/presenter/)**

From the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open **[http://localhost:8765/ASTRA/](http://localhost:8765/ASTRA/)**. If that server is already running, open the URL directly. Serve over HTTP because the pitch uses JavaScript modules. No package installation or build step is needed.

- **[Pitch](index.html)** — the audience screen.
- **[Presenter desk](presenter/index.html)** — open in a second window in the same browser, at `http://localhost:8765/ASTRA/presenter/`. It receives the current cue, clock and notes from the audience screen.
- **[Team prototype](prototype/index.html)** — the copied interactive service-planning demonstration, separate from the six-act show.

Click **START PITCH** for a live presentation with manual cue advances. Click **WATCH TIMED PREVIEW** for the automatic 180-second rehearsal. Both begin with the complete film and its original audio.

## The 180-second clock

| Act | Clock | Duration | On screen |
|---|---|---:|---|
| 1 | 0:00–0:34 | 34 s | Full film, then the live **INTRODUCING ALOHA ROBOTICS** title |
| 2 | 0:34–1:10 | 36 s | Lonely → manic → update → bliss → failure → rollback |
| 3 | 1:10–1:18 | 8 s | Dark transition to **INVISIBLE CONNECTIVITY** |
| 4 | 1:18–2:06 | 48 s | Full timetable → searching scouts → rejected gaps and emergency standby → golden candidate → human review |
| 5 | 2:06–2:46 | 40 s | Inputs → specialists → policy and authorization → physical connection → returning logs |
| 6 | 2:46–3:00 | 14 s | **THE MACHINE IS READY.** → **NOW, BACK TO THE PATIENT.** |
| **Total** | **0:00–3:00** | **180 s** | Final image holds |

The current full movie is **30.442667 seconds**. Its native end event reveals the live HTML title, held for **3.557333 seconds** to complete the opening 34 seconds. The title is not burned into the movie. Older backup films are a different generation.

The timed preview follows 21 stage cues from [show.mjs](show.mjs). Its clock measures active playback: pausing or buffering extends wall-clock time. Manual mode uses the same cue order and rehearsal clock; the speaker controls the actual pace. Follow the [speaker script](SPEAKER_SCRIPT.md), including silence and the final hold, to perform the live version in three minutes.

## Controls and rehearsal

| Control | Action |
|---|---|
| **Right / Down / Space / Enter / Page Down** | Advance one cue |
| **Left / Up / Page Up / Backspace** | Go back one cue |
| **Click the stage** | Advance; the leftmost edge goes back |
| **T** | Toggle timed/manual mode; enabling timed mode aligns the clock with the current cue |
| **P** | Pause/resume the film during the intro, or the cue clock afterward |
| **N** | Show/hide presenter notes; the clock continues |
| **F** | Enter/leave fullscreen |
| **A** | Open the research and prototype links |
| **B** | Black out the audience screen |
| **R / Home** | Reset to the launch screen |
| **V** | Restart the film and clock in the current mode |
| **S** | Toggle film audio for rehearsal |
| **? / H** | Show keyboard help |
| **Escape** | Close help, research or blackout |

Manual navigation turns automatic advancing off. The complete movie is protected from ordinary cue advances; wait for its ending and title reveal before advancing into the characters. Research, help and blackout pause playback and the clock while open. The operator controls appear when the pointer moves or the keyboard is used, then hide.

For rehearsal, open the presenter desk first, return focus to the pitch, start the timed preview, and speak only the script's spoken-word column. Use **N** only on a private rehearsal display; the separate presenter window keeps notes off the audience screen.

## Read the work behind the show

- [Research recap](RESEARCH_RECAP.md): challenge evidence, interview findings, existing implementation, proposed architecture, assumptions and source links.
- [Speaker script](SPEAKER_SCRIPT.md): the complete 180-second show call, exact spoken words, cue timing and technical detail.
- [Asset review](ASSET_REVIEW.md): current movie identity and duration, original character art, extraction checks and asset provenance.
- [Prototype README](prototype/README.md): the team's interactive demonstration and its planning model.

## Provenance and implementation boundary

The starting point is the team's [encore](../CARMAGOTCHI_Web_Pitch/encore/index.html) and [pitch template](../CARMAGOTCHI_Web_Pitch/pitch/deck.css). Their stage structure, character sequence and presenter pattern are retained and adapted. [polish.css](polish.css), [encore.js](encore.js) and [visuals.mjs](visuals.mjs) provide the ASTRA presentation and interactions.

The later [OPUS version](../OPUS/README.md) informed the visual continuity: [continuity.mjs](continuity.mjs) carries the selected gold window into the Aloha core, and fine SVG filaments grow from the architecture's service routes. These effects use ASTRA's existing scenes and timing. The comparison and technical distinctions are recorded in the recap.

The full [original film](../CARMAGOTCHI_Web_Pitch/pitch/media/chaos_intro.mp4) is copied to [assets/video/chaos_intro.mp4](assets/video/chaos_intro.mp4) without cutting, speeding up or re-encoding it. The character images are copied from the team's [original artwork](../CARMAGOTCHI_Web_Pitch/pitch/assets/). The [service prototype](../team-material-christian/challenge-4/klickdummy/index.html) is copied into `prototype/`; its deterministic [planner](team/planner.js) and [synthetic data](team/data.js) also power the visual scheduler.

**Implemented here:** a locally served web pitch, presenter controls and notes, the copied working prototype, and visualizations that use the team's planning rules on synthetic schedules. The search samples eligible starts, ranks them using the team's illustrative hourly-usage risk proxy, and shows a candidate for human assessment. It does not measure the probability of the next emergency.

**Proposed system:** specialist agents, live hospital and manufacturer interfaces, validated emergency forecasting, robot-assisted power/data connection, and a companion that caches packages while the main device sleeps. The architecture illustrates these integrations; this pitch does not execute medical-device updates. Installation authorization, calibration and clinical release remain human responsibilities.

## Source checks and validation

The script contains the timing data used to generate the browser cues and presenter notes. After an intentional script edit, regenerate them from the repository root:

```bash
python3 ASTRA/tools/build_notes.py
```

With Node.js available, run the scheduler visualization checks and the copied original planner tests:

```bash
node --test ASTRA/tests/visuals.test.mjs ASTRA/prototype/planner.test.cjs
```

The [validation report](research/VALIDATION.md) records the 20 passing planner/model tests, 20 passing Firefox control and motion checks, and the uninterrupted 180-second browser rehearsal. It includes reproducible harnesses, screenshots and source-file hashes. The full film retains its original bytes and plays with audio enabled. Physical projector quality, room acoustics and the speaker's delivery still require an in-room rehearsal.
