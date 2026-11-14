# C-ARMAGOTCHI — Interactive Web Pitch

An **unofficial concept presentation** for a Siemens Healthineers mobile C-arm challenge. Built with the team's C-ARMAGOTCHI and KettyBot mascots and the supplied performance notes. This is not an endorsed Siemens or PUDU product.

## Start

Open `pitch/index.html` in Chrome, Edge, or Firefox. For the most reliable presenter sync, run `python3 -m http.server 8000` from this folder and open `http://localhost:8000/pitch/`, then `http://localhost:8000/teleprompter/` in a second window. Internet is not required (system fonts are used as fallbacks).

## Controls

- `→` / `Space` / click right side: next reveal
- `←` / `Backspace` / click left side: previous reveal
- `F`: fullscreen
- `N`: speaker notes
- `A`: technical Q&A appendix
- `B`: black screen
- `Home` / `End`: first / final slide
- `R`: restart
- `?`: help
- `U`: optional after-hours joke banner (not recommended for family audience)

## Content

13 main scenes (~4-minute scripted pitch), 2 technical appendix scenes, reactive dashboard demo, 5-state personality-update vignette, animated service-robot docking, and synchronized presenter notes. Images are local under `pitch/assets/`.

## Linkable states and presenter synchronization

The website supports direct links like `pitch/index.html#4.3` for scene 4, reveal 3, and `pitch/index.html#A1.2` for technical appendix scene 1, reveal 2. The separate teleprompter follows the deck using `BroadcastChannel` and a same-origin `localStorage` fallback. Both pages should be opened from one local server or the same hosted website. Browser clickers send `ArrowRight` / `ArrowLeft`.

## Source material and creative treatment

The story and deliberately theatrical lines come from the supplied [`source/brainstorm.md`](source/brainstorm.md) and the conversation's character images. Its Palmer Luckey moment is a **teammate lookalike**, not a real cameo. The after-hours line is hidden behind `U` so the default run is suitable for a mixed-age audience. The pitch adapts TALOS's **website presentation approach** (offline HTML/CSS/JS, 16:9 canvas, sequential reveals, presenter mode) with an original visual design and new code.

## Demo vs. real technology

All device records, hospital displays, robot dispatch and interaction are illustrative simulations. Any production integration would require approved Siemens device APIs, hardware interface verification, safety review, security authentication, hospital IT authorization, and human supervision for mechanical calibration and clinical release. We make no claim that KettyBot can currently service a C-arm.

## Edit

Content: `pitch/index.html`; styling: `pitch/deck.css`; interactions: `pitch/deck.js`. After changing speaker notes, run `python build_teleprompter.py`.

Built as a custom HTML/CSS/JavaScript presentation in the spirit of the TALOS website-deck approach, not by copying TALOS source code.

## Project structure

- `index.html` — project landing page
- `pitch/index.html` — the interactive presentation
- `pitch/deck.css` — visual design and step animations
- `pitch/deck.js` — original navigation engine, live simulated dashboard, Q&A, notes, and route transitions
- `pitch/assets/` — all images bundled locally, no web dependencies
- `teleprompter/` — presenter view (follows the deck over a same-origin BroadcastChannel)
- `speaker_script.md` — full stage cues, including the Palmer Luckey lookalike cameo
- `sources/original_brainstorm.md` — the supplied brainstorm for future revisions
- `build_teleprompter.py` — regenerates speaker-note data after editing slides

A non-interactive **PowerPoint backup** is provided as a separate `.pptx` download.

## Publishing with GitHub Pages

Create a repository, place the files from this ZIP at the repository root, and configure GitHub Pages to deploy the main branch's root directory. The published URL will be `https://<account>.github.io/<repository>/` and the actual deck is under `/pitch/`. No build command, backend, or third-party JavaScript packages are needed.
