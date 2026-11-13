# C-ARMAGOTCHI / original media and performance review

## Editorial decision

Use the team's **complete current film with its original audio**, the original character illustrations, the original six-state comic walkthrough, and the existing pitch/encore design language. The film is the opening act, including the outrageous update sequence, rollback, explosions, KettyBot entrance and wink. Do not shorten, mute, retime, recut, re-encode or narrate over it.

The earlier five-second Cora-centered standalone treatment is superseded. The opening identity is **C-ARMAGOTCHI / Aloha Robotics**, with **KettyBot** as the service robot. Cora is an existing device name in the team's prototype; the restored schedule retains the team's names Cora, Bogdan, Cio, Arcus, Fritzi and Otto.

## Exact film identity and provenance

The lead deliberately selected the latest current team film. The file copied into ASTRA is byte-identical to that source:

| Property | Current selected film |
|---|---|
| Source | `CARMAGOTCHI_Web_Pitch/pitch/media/chaos_intro.mp4` |
| Identical current copies | `CARMAGOTCHI_Web_Pitch/encore/media/chaos_30s.mp4`, `CARMAGOTCHI_Web_Pitch/encore-christian/media/chaos_30s.mp4` |
| ASTRA copy | `ASTRA/assets/video/chaos_intro.mp4` |
| File size | 37,150,021 bytes |
| SHA-256 | `b5ba0eaaaa37c1622e754fc57ca9b9825a2f24554705379b261eb53626299f30` |
| Container duration | 30.442667 seconds |
| Video | H.264, 1920 × 1080, 30 fps, 30.433333 seconds |
| Original audio | AAC, 48,000 Hz, stereo, 30.442667 seconds |

There is also an **older 40.633333-second generation** in `backups/presentation_v2/pitch/media/chaos_intro.mp4`, `presentation_v3`, and `presentation_v4`. Those copies are 8,440,959 bytes with SHA-256 `f011c55464b84f5e71dbe2c1609460131e3474d55407886f2fba72501656e4cd`. They show the same overall story with longer earlier scenes. The original team README and speaker script still describe a forty-second original even though the current source bytes have changed. This is stale source documentation, not a reason to replace the current film.

This review verified the current source and ASTRA movie hashes after the lead copied the file. **No movie encoding was performed in this revision.**

## Actual final sequence

Decoded frames were inspected across both film generations. The current selected film ends as follows:

| Current film time | Actual picture |
|---|---|
| 26–28 seconds | KettyBot approaches with cables and a knowing expression |
| 28.8 seconds | Bright wink in KettyBot's eye |
| 29.0 seconds | White/cyan flare with an orange circular shockwave |
| 29.5 seconds | Explosive orange burst and black smoke at screen center |
| 30.0–30.4 seconds | Orange embers and fragments against near-black |
| 30.442667 seconds | Native playback ends, including the original audio tail |

The original's explosion already creates a cinematic transition to darkness. It needs no inserted flash, stock transition, replacement sound, interruption or apology.

**No burned-in “INTRODUCING” title is present in the decoded endings inspected**, and no such title is defined in the current original pitch/encore HTML. “INTRODUCING ALOHA ROBOTICS” should be the live HTML continuation requested for this version.

Two authorized still images were extracted without changing the movie:

- `ASTRA/assets/video/poster-start.jpg` — actual frame at 0.000 seconds, the operating-room setup.
- `ASTRA/assets/video/poster-end.jpg` — actual frame at 30.400 seconds, the embers on black.

Both stills were opened and visually verified. Use the first as the preload poster and the second only to preserve continuity if the browser would otherwise clear the ended video.

## Recommended bridge: the explosion introduces the team

Use the original `1920 × 1080` stage and the existing charcoal/white/orange/teal typography system. The bridge should feel like the next frame of this film, not the opening of a different application.

1. **Until native `ended`:** display the entire film with its original sound. Do not start the bridge at an assumed 30.0 seconds; that would cover the final embers and cut the sound tail.
2. **At `ended`:** retain the last video frame, or the verified end poster. Introduce a dark layer over approximately 400 ms so the remaining embers settle naturally into the original deck's `--night` background.
3. **Title build, beginning immediately after the film:** fade in a small, tracked “INTRODUCING” over about 300 ms. Bring in the huge original-style **ALOHA** lettering over about 500 ms, with **ROBOTICS** following about 120 ms later. A restrained scale settle from 1.015 to 1 is enough. Use the existing bold/outlined-word treatment and orange punctuation; avoid new portraits, card systems or unrelated iconography.
4. **Hold:** let the complete identity read clearly for the rest of the planned **3.557333-second bridge**. The film plus bridge is exactly **34.000 seconds**. The live speaker says: “Introducing Aloha Robotics.”
5. **Next cue:** cut to the original paper-colored large character stage, beginning with `lonely.webp`. Preserve the sudden high-contrast theatrical shift and the existing expression crossfades.

The movie's center-screen explosion motivates a central title, while its black final frame makes the transition seamless. The title should carry only the team identity and a small C-ARMAGOTCHI identifier if needed. The optional Palmer/America interruption is separate from the film and need not be inserted into this bridge.

Playback requirements:

- Start the film from an explicit user gesture with `muted = false` and unchanged normal volume.
- If sound autoplay is blocked, keep the play affordance visible and let the user start the full film; do not silently substitute muted playback.
- Do not add the synthetic screech or impact WAV on top of the original explosion.
- Buffering or paused playback must not trigger an elapsed-time cut to the title.
- Native `ended` owns the film-to-title transition. The movie's audio track remains untouched.

Audio review limitation: metadata and preservation are verified, but I did not reliably audition or transcribe the source audio with the available tools. I therefore make no claim about exact spoken dialogue, music or effects. This does **not** justify changing the audio: the user explicitly requested the original film and sound.

## Preserve the existing six-character performance

The existing `encore/encore.js` and `pitch/deck.js` define the same sequence. Keep this order and its original comic meaning:

| Order | Original asset | Original headline | Original punchline | Meaning |
|---|---|---|---|---|
| 1 | `lonely.webp` | GHOSTED BY THE NETWORK. | “It’s been 43 days since someone connected me.” | The device has been disconnected and ignored |
| 2 | `manic.webp` | CRITICALLY UNSTABLE. | “PLEASE PLUG ME IN. I’LL BE GOOD.” | The device's needy personality becomes unhinged |
| 3 | `update.webp` | INSTALLING IMPULSE CONTROL. | “Oh. That feels like a very important patch.” | The update becomes the suggestive comic intervention |
| 4 | `bliss.webp` | EMOTIONALLY STABLE. | “Ahhh... operating within approved parameters.” | Exaggerated relief; hold long enough for the expression to land |
| 5 | `failure.webp` | RESTORATION FAILED. | “Wait... why do I remember everything?” | The attempt to restore the prior configuration causes the reversal |
| 6 | `rollback.webp` | ROLLBACK INITIATED. | “YOU CAN’T DELETE WHO I AM.” | The grin returns; finish the comic story on this punchline |

Original status lines are respectively `STATE / DISCONNECTED`, `PERSONALITY v0.9 / UNSTABLE`, `BACKUP → INSTALL / SIMULATED`, `v1.0 / SATISFIED`, `ERROR / INCOMPATIBLE PARAMETERS`, and `EXCEPTION / TECHNICIAN NOTIFIED`.

Keep the fiction and innuendo within the character performance. Do not replace it with a sanitized phone workflow or convert the sequence into a real-device readiness claim. The original transition afterward—**NOW. / INVISIBLE CONNECTIVITY.**—is retained as the hinge into the technical idea.

The source template also contains a separate KettyBot service scene and lines such as “Finally. Someone who understands my needs.”, “Ahhh. Connection restored.” and “Any TECHNICAL questions?” These are source references, not additional scenes in the restored three-minute show. The current implementation carries KettyBot into the service architecture and preserves the original Ketty/bliss pair at the edge of the final patient slide.

The current six-act flow, checked against `index.html` and `SPEAKER_SCRIPT.md`, is:

1. **0:00–0:34:** complete current film, then live **INTRODUCING ALOHA ROBOTICS**.
2. **0:34–1:10:** the six original character moods, in the order above.
3. **1:10–1:18:** **NOW. / INVISIBLE CONNECTIVITY.**
4. **1:18–2:06:** the schedule search, rejected candidates and proposed golden window.
5. **2:06–2:46:** **IT ALL CONNECTS.** Inputs, specialist nodes, authorization, KettyBot/companion and return loop.
6. **2:46–3:00:** **THE MACHINE IS READY.** becomes **NOW, BACK TO THE PATIENT.** The final spoken line is “Now, back to the patient.” There is no separate KettyBot scene or technical-questions ending.

## Assets and existing visual system

The original art is visually consistent across the six C-arm moods and the KettyBot companion. All files have 940 × 940 canvases. Plain `.webp` assets contain real alpha transparency; `_white.webp` variants are opaque white. The original deck correctly uses the transparent assets in the large character stage.

Use the exact source files. Do not replace the original cartoon style or manufacture new “more professional” expressions. Keep `object-fit: contain`, preserve the line work, and avoid multiply filters that erase the white equipment body.

The original encore already enlarges the character to a `1090 × 900` region, with its copy at x1100 and a 730-pixel column. The existing `.update-char` transitions use 460 ms opacity and 780 ms movement/scale. Reuse those mechanics; the art already supplies most of the personality. On each click, the current expression should replace the previous one at the same visual anchor.

The established palette and type are:

- Charcoal `#090d10`, paper `#f2f1eb`, white `#f9faf6`.
- Teal `#00b8ac`, pale teal `#59e4d7`, orange `#fb7637`.
- Arial/Helvetica for huge tightly tracked headlines; Courier New for small stage labels and technical status.
- Large original art, deliberate hard tonal cuts, progressive reveals and limited explanatory copy.

## Evidence generated for this revision

- `ASTRA/research/v2-media/current-ending-sheet.jpg`: current ending sampled at 26, 27, 28, 28.8, 29, 29.5, 30.0, 30.1, 30.2, 30.3 and 30.4 seconds.
- `ASTRA/research/v2-media/backup-ending-sheet.jpg`: older generation sampled through its 40.5-second tail, with representative earlier frames.
- Individual extracted frames in the same folder.
- Verified start/end posters in `ASTRA/assets/video/`.

## Restored-template rendered visual review

I opened all thirteen actual browser PNGs supplied in `/tmp/astra-v2-first-review/`: `launch`, `lonely`, `manic`, `update`, `bliss`, `failure`, `rollback`, `cut`, `scan`, `risk`, `gold`, `architecture` and `patient`. The review contact sheet is saved as `ASTRA/research/v2-media/restored-deck-first-review.jpg`. These captures show the restored implementation at 1440 × 832; they supersede screenshots of the discarded standalone treatment.

**No visual layout blockers were found in the reviewed captures.**

- **Launch:** the original manic character is large, complete and clearly separated from the headline and launch controls.
- **Six moods:** every original illustration is visible at a large scale on the paper stage. Original headlines, punchlines, status lines and mood selectors fit without clipping or character occlusion. Failure and rollback have smaller inherent silhouettes within their source canvases, but remain prominent and readable. The expression changes retain a consistent visual anchor.
- **Light/dark sequence:** the paper character act contrasts clearly with the film, serious hinge, technical acts and close. The restored typography and white/teal/orange system remain coherent across these scenes.
- **Schedule:** all six team device names are visible. Search, risk and gold captures have a clear hierarchy, and the highlighted Cio 17:00–19:00 interval is easy to identify. The proposal and human-approval wording remains visible. Small block annotations are secondary detail; projector-distance legibility is a possible polish area, not a blocker for the principal message.
- **Architecture:** the directional flow, specialist nodes, human gate, KettyBot/C-arm endpoint and return path fit without collisions. Characters are deliberately smaller here to serve the diagram. Fine node annotations would benefit from checking on the actual presentation projector, while the principal title and flow are readable in the supplied render.
- **Patient close:** the huge final sentence dominates, with the preserved KettyBot/bliss pair and heart at lower right. The pair does not cover the text or signature. It provides the original emotional payoff within the patient ending.

I also opened the actual live-playback captures `ASTRA/research/previews/02-film-finale.png` and `03-introducing.png`. The finale capture shows the source KettyBot wink/flare with no presentation chrome covering the film. The title capture shows the complete centered **INTRODUCING / ALOHA. / ROBOTICS** composition: near-black, warm embers and the orange period carry the film's explosive ending into the deck's existing visual system. The large identity reads immediately and no title elements overlap. The tiny baseline acts as secondary atmosphere; the team identity does not depend on reading it.

The lead reports that native playback reached the complete 30.442667-second end with original audio enabled and no seek or cut before capturing the title. My direct checks here are the preserved source hash, decoded source frames, static source and the rendered PNGs. Those PNGs establish composition and continuity of the visual language; they do not independently establish motion smoothness, complete rehearsal timing or subjective audio quality. The audio-audition limitation above remains unchanged.

## OPUS comparison and focused visual recommendations

After the user's request to inspect OPUS, I read the current `OPUS/index.html`, `css/pitch.css` and the `embers`, `tama`, `arch`, `outro` scene implementations. I also rendered its independent scenes in a separate headless Firefox instance and visually opened the settled architecture, growing branches, rollback character, title and outro captures. The screenshots are `ASTRA/research/v2-media/opus-*.png`; the partial-run console log is `opus-partial-review-log.json`.

The current OPUS checkout lacks `js/lib/golden.js` and `js/lib/planner.js`. Its scheduler therefore cannot initialize as supplied. No OPUS files were repaired or modified, and this partial review does not claim a successful full OPUS rehearsal.

OPUS's most useful visual idea is continuity: the film's sparks become typography, a seed grows into a branching network, and the network eventually disappears into the close. Its architecture source implements actual advancing, seeded paths with correlated directional variation, delayed side branches, smaller secondary branches, tapering strokes, growing tips and pulses. The rendered result visibly feels more organic than a set of smooth curved connectors. Its Tamagotchi scene has expressive state-specific arrivals, but also a smaller central character, six ring stations, vitals and a separate explanatory panel. ASTRA should retain its large original art, original dialogue and existing six-act density.

Recommended refinements for ASTRA, without extra acts or additional information:

1. **Grow the architecture from its existing orchestrator.** Use an asymmetric field of advancing fibers, with the strongest trunks about 2–3 stage pixels and secondary strands about 0.5–1 pixel at 20–35% opacity. A branch should start when the parent tip reaches its origin, and taper as it grows. Brief bright tips create the sense of exploration; low-opacity settled fibers create depth. Keep node labels and character silhouettes in exclusion zones. Reveal labels as the relevant main paths arrive. The existing flow and authorization wording remain the reading structure.
2. **Carry one gold spark through the existing transitions.** The chosen schedule window releases one small gold point that moves into the orchestrator over roughly 0.7–1.0 seconds; the surrounding schedule fades while the core wakes. Echo the same point along the physical-service branch and into the final thin line above the patient statement. This is a visual motif connecting the argument, not an approval-state change. It should fit inside existing cues and leave the human gate explicitly pending where appropriate.
3. **Give each mood one characteristic arrival, then let the audience read.** A short 350–600 ms overshoot for manic, a settling motion for update, a gentle lift for bliss, one small jolt for failure and a brief displacement/glitch for rollback would give the original expressions more theatrical contrast. Preserve the shared art anchor, exact assets and original quotes. Avoid perpetual fast shaking or extra badges; the expression and punchline need a quiet hold.

The existing ASTRA title composition already reads strongly and continues the full film's palette. OPUS's longer “BASED ON A TRUE STORY” and particle-title sequence should not be inserted into ASTRA's 3.557333-second bridge. Its extra loop beat, explanatory character panels and IAI/questions outro likewise do not belong in the current approved six-act flow. The recommendations above concern visual craft only; the complete original film and audio, original character performance and patient ending remain intact.
