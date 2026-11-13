# Media review for ASTRA

Reviewed 13 November 2026. This review inspected decoded video frames and the actual character pixels, rather than inferring contents from filenames or the old speaker script.

## Final media to use

- `ASTRA/assets/video/cora-intro.mp4` — **5.300 seconds**, 1920 × 1080, 30 fps, H.264, YUV 4:2:0, fast-start MP4, 6,132,084 bytes. **No audio stream.**
- `ASTRA/assets/video/cora-poster.jpg` — actual 1920 × 1080 chase frame from source time 4.100 seconds.
- Exact footage: source **2.000–6.333 seconds**, then a **0.967-second freeze** on the clear final chase frame. Entry fade 0.100 seconds; exit fade 0.220 seconds beginning at 5.080 seconds. Result verified by `ffprobe`.
- The shorter cut reflects the lead's final editorial direction: a quick comic introduction of Cora, followed by the large character and “Update available. Anyone?” The source's longer update story competes with the actual product explanation.
- The first hallway chase shot begins exactly at **2.000 seconds**, verified by scene detection and neighboring decoded frames. At 1.900 seconds the film still shows the surgeon. The exit becomes smeared around 6.600 seconds; freezing at 6.300 seconds preserves a clear C-arm and human. Cable insertion is visible by 7.200 seconds and is excluded.

This cut preserves the comic chase and recognizable character without the fictional instant update, restoration catastrophe, or explosion. It should remain visibly identified as a fictional concept film. Play muted with live narration. The file has no sound toggle requirement.

## Source film and observed contents

Source: `CARMAGOTCHI_Web_Pitch/pitch/media/chaos_intro.mp4`.

`CARMAGOTCHI_Web_Pitch/encore/media/chaos_30s.mp4` is **byte-identical**, despite the run-of-show describing a separate shortened extract. Both are 30.442667 seconds and 37,150,021 bytes, 1920 × 1080 H.264 at 30 fps, with AAC audio and a data stream.

SHA-256: `b5ba0eaaaa37c1622e754fc57ca9b9825a2f24554705379b261eb53626299f30`.

| Source time | Actual visual content | Editorial implication |
|---|---|---|
| 0.000–2.000 | Operating room, C-arm beside covered patient, surgeon speaking/pointing | Grounding, but requires hearing dialogue to assess meaning; omit from the short sting |
| 2.000–6.333 | Radiographer chases manic cartoon C-arm through hospital corridor, holding a yellow cable; sparks | Most immediately legible comic action; selected |
| 6.333–7.200 | Exit around corner, motion smear, whip-pan into next setup | Avoid as a final freeze |
| ~7.200–9.000 | Human inserts cable; C-arm face morphs into a box-headed robot | Suggestive physical gag; changes the character's visual identity |
| ~9.000–12.800 | “Installing Update” screen, sweating/spiraling robot face, 100% completion | Fictional instant update can blur technical claims |
| ~12.800–15.800 | White smiling robot face, pink hearts, levitation/bliss | Strong expression, but the character has become a different robot silhouette |
| ~15.800–19.000 | Glitch, manic face returns, rollback screen | Adds an entire second problem to explain |
| ~19.000–23.000 | Explosion, smoke, chaotic exit, staff reactions | Consumes time and risks leaving a product-failure impression |
| ~23.000–28.800 | Corridor reaction, then cheeky KettyBot appears with cables | Memorable, but separate hero reveal would duplicate the pitch's service reveal |
| ~28.800–30.443 | Sparks/explosion transition to end | Visually expensive finale with little additional meaning |

There is **no Palmer Luckey or America scene in the actual film**. Those are separate HTML scenes and sound effects added by earlier pitch versions.

Audio limitation: AAC audio presence was confirmed; decoded peak level reaches approximately 0 dBFS. I could not reliably audition or transcribe it with available tools. I therefore make **no claim about the spoken words, music, or innocuousness of the source sound**. The selected output intentionally strips audio.

The full 30-second source is not duplicated inside ASTRA. An initial 15.8-second candidate was discarded and removed once the shorter narrative direction was selected.

## Characters: what the actual files contain

All seven expressions have 940 × 940 pixel canvases. **Plain filenames (`lonely.webp`, etc.) are true RGBA transparency. `_white.webp` variants are opaque RGB on white.** The `_white` suffix must not be interpreted as “white character on transparency.”

| Asset | Visual reading | Useful stage role |
|---|---|---|
| `lonely.webp` | Big watery eyes, withdrawn hands, broken heart, disconnected signal | Open emotional hook, request for connection |
| `manic.webp` | Huge grin, tongue out, spiral and X eyes, raised hands | Quick comic escalation |
| `update.webp` | Similar mania with lightning and update icon | Transitional process state; needs an explicit label |
| `bliss.webp` | Half-lidded, satisfied face, pink heart, relaxed arms | Comic relief after a successful simulated service |
| `failure.webp` | Worried face, warning monitor, digital glitch accents | Exception or service intervention |
| `rollback.webp` | Wild spiral eyes, glitch accents, explicit “ROLLBACK…” bar | Recovery-path punchline; do not imply clinical availability |
| `ketty.webp` | Confident black service robot, coiled orange cables, service-tool icon, wink/hearts | Physical service arrival and final wink |

Use the transparent variants on ASTRA's colored stages. Their line work and white body already provide high contrast. Do not use `mix-blend-mode:multiply` or a white-color filter: these can destroy white robot surfaces or change the teal/orange art. Preserve `object-fit: contain`, common square containers, and consistent anchor position for expression swaps.

The six C-arm illustrations are visually consistent and feel like genuine expressions of the same character. Their small variations in wheel position and body pose support a crossfade. The film's midpoint box-head transformation is materially less consistent with this asset family.

Recommendation: a large character should carry the joke. Use a roughly 400–550 ms opacity crossfade plus a restrained 10–18 px shift. Avoid a new huge entrance animation on every expression; that distracts from the face. Give lonely, manic, and bliss sufficient time to read. In a three-minute pitch, do not spend 31 seconds and six manual advances narrating every update state.

The assets visibly include Siemens Healthineers and KettyBot branding. The source asset README describes them as material for this team's hackathon pitch/demo. No endorsement or deployed integration should be inferred from the art.

## Existing phone and deck treatment

Inspected `pitch/index.html`, `pitch/deck.js`, `pitch/deck.css`, and the actual `PREVIEW_3MIN.jpg` contact sheet.

The existing full pitch uses a 405 × 845 phone silhouette on a 1920 × 1080 stage, with a 285-pixel character region. It has real two-layer image crossfades, not one image with only changing copy:

1. Lonely / “No contact for 43 days.”
2. Same lonely expression / identity confirmed.
3. Manic / service requested.
4. Bliss / service visit confirmed, awaiting sync.

The final phone state uses a green status and a `connected` CSS mode even though text still says “awaiting sync.” In ASTRA, keep the exact operational state legible; a happy mascot must not silently indicate clinical readiness. The invented “43 days” is an illustrative detail, not field evidence.

The phone preserves product tactility, but its small facial region weakens the expressions on a projected stage. A giant character with a small status card can communicate the same idea more clearly. If ASTRA retains a phone, make it one short proof of interface behavior and use the larger character elsewhere.

The existing encore removed the phone and used a large character showcase. Its preview confirms a coherent dark/cream, orange/teal visual palette, but the oversized all-caps headlines repeat, and thin tiny diagrams/labels become hard to read. The America interruption is a separate stylistic detour, not needed to preserve the team's comedy.

The original deck's phone behavior above was verified from source code; its historic rendered layout was not interactively tested. During the first pass, the connected browser inventory returned **no browsers or apps**, and the temporary owned preview server on port 8766 was stopped. This initial limitation was later resolved for the assembled ASTRA pitch through the lead's authorized Firefox QA. The resulting actual browser images were visually reviewed below. The source audio limitation remains unchanged.

## Visual evidence

All review outputs are local to `ASTRA/research/media-review/`:

- `film-contact-sheet.jpg` — full film sampled every two seconds.
- `film-detail-sheet.jpg` — opening and update/rollback transition sampled more densely.
- `film-boundary-sheet.jpg` — precise chase and cable insertion boundary.
- `characters-contact-sheet.jpg` — all transparent and white variants shown together.
- `cora-final-freeze.jpg` — decoded actual final output freeze for QA.
- `final-chase-boundary-6s3.jpg` — clear source frame chosen for the hold.

Final output decode and metadata checks passed. Final freeze and poster were opened and visually inspected after export.

## Assembled ASTRA: static composition review

Reviewed the assembled `index.html`, `stage.css`, and `app.mjs` after the first integration. The measurements and findings in this subsection describe the initial source/asset geometry pass. They were subsequently checked against actual rendered Firefox images; the final results follow in the next subsection.

Measured nontrivial alpha bounds, using a 10% alpha threshold, inside the 940 × 940 source canvases:

| Character | Visible bounds |
|---|---|
| Lonely | 900 × 924 at x6, y8 |
| Manic | 907 × 920 at x11, y7 |
| Update | 860 × 925 at x24, y7 |
| Bliss | 852 × 920 at x20, y12 |
| Failure | 849 × 770 at x32, y101 |
| Rollback | 827 × 747 at x28, y114 |
| Ketty | 921 × 917 at x10, y14 |

The principal character images have almost no invisible top padding. The failure/recovery illustrations have smaller visible silhouettes and higher wheel baselines in the same square; this is inherent in the art, not a missing image.

Initial findings sent to the lead and subsequently resolved:

1. **Connection scene header/robot overlap.** With scene padding of 144 px, the eyebrow and its margin place the headline around y178. Its two 83 px lines at 1.06 line height end around y354. The connection stage starts at y296, with the Ketty image around y310. The equipment caption and upper robot artwork therefore occupy the second headline line's region. Resolve by shortening the headline to one line, or move/shrink the whole illustration stage and its cable coordinates together.
2. **Return scene header/character overlap.** Its two 92 px headline lines end around y369. The return illustration begins around y315 because the parent starts at y330 and the image has a −15 px top margin. The illustration overlaps “I’m back.” Resolve with a shorter headline or a coordinated stage position/size change. Moving only the image downward risks pushing its status into the source/footer area.
3. **Film overlaid by stage furniture.** Each `.scene` has `isolation:isolate`, so the film's z-index 40 stays within a scene stacking context. The root masthead/footer at z-index 30 are still above that scene. If the full-frame sting should have only its fictional-film label and skip control, hide the masthead/footer under a `film-active` state.

Compositions that are supported by the static geometry:

- Opening: the character box occupies x755–1375; the left headline has ample separate space. The message bubble overlays part of the C-arm's upper arc, but its face is below the bubble. This reads as an intentional message from the device rather than a face obstruction.
- Phone: its rotated frame occupies roughly x555–889 and y261–704, with clinical/IT columns safely outside. The internal art and dialogue fit the assigned phone height. The service caption is close to its lower edge; confirm this in browser QA.
- Calendar: the one-line headline and subtitle finish before the schedule begins at y328. The right proposal column has clear separation from the chart.
- Authorization: the left headline and right panel have separate horizontal regions.
- Finale: the character box sits x885–1320, y249–684, leaving the left copy clear. The appointment badge crosses the lower wheel region intentionally and disappears on Reveal; the final care sentence therefore has a cleaner stage.

The implemented opening timing is coherent with the actual media: Meet Cora at 0 seconds, film at 3 seconds, film ends naturally at 8.3 seconds and reveals the request, then “Left on read” at 12 seconds. The 7.5-second film watchdog does not determine normal playback length. The final headline and care sentence reveal only after the explicit final cue.

The assembled pitch correctly references the transparent character assets and the silent intro. No opaque white asset is accidentally placed on the cream/teal backgrounds.

## Final rendered browser evidence

After the lead completed authorized browser QA, I opened these actual Firefox screenshots individually with the image viewer:

- `previews/01-arrival-before-film.png`
- `previews/02-concept-film.png`
- `previews/03-opening-punchline.png`
- `previews/04-handoff.png`
- `previews/08-connected.png`
- `previews/10-installing.png`
- `previews/18-character-showcase.png`

I also read `previews/browser-checks.json`: Firefox 159.0.1 headless; desktop test viewport 1440 × 900; mobile test viewport 390 × 844; 23 screenshots; no recorded console errors. Its recorded checks cover muted film playback, delayed punchline, explicit approval/start/result/release/final reveal, and workflow failure states. I did not rerun those interactions myself; this media review evaluates their actual rendered outputs.

**No remaining film or character composition blockers were found in the reviewed images.**

- **Arrival:** Cora is large, sharp, and completely legible. The muted circular background supports the transparent silhouette without muddying the white body. Headline and character have clear separation.
- **Film:** clean full-frame chase with only its fictional-concept tag and skip control overlaid. The earlier masthead/footer stacking problem is resolved.
- **Punchline:** “Left on read” fits cleanly. The message overlays the upper equipment arc while leaving eyes, mouth, hands, broken-heart symbol and main body readable.
- **Phone:** the device artwork, quote and lower status fit inside its rotated frame. Side roles remain clear; the service caption sits below the phone without collision.
- **Connected:** the one-line headline fixes the earlier overlap. Both robots and their status chips are unclipped. Power and network paths remain distinct and join the lower equipment regions. The cable joke has sufficient space above the footer.
- **Installation/return:** the one-line headline fixes the earlier overlap. The character's complete silhouette and installation label have clear space below it; the right-hand workflow remains separate.
- **Character appendix:** the rollback illustration, including its glitch accents, feet and “ROLLBACK…” label, is fully visible. The larger preview area accommodates the art's wider silhouette, and the adjacent title/buttons do not collide.

The initial browser limitation is therefore **superseded for these assembled ASTRA views**. The report still makes no claim to have heard or transcribed the original source audio.
