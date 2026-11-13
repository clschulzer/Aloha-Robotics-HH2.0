# Deploy / rehearse the C-ARMAGOTCHI project

No package manager or build step is required. All files—including the original full pitch, condensed encore, MP4s, artwork, and presenter pages—are local.

From the extracted `CARMAGOTCHI_Web_Pitch` folder:

```bash
python3 -m http.server 8000
```

Open:

- **3-minute encore (projector):** `http://localhost:8000/encore/`
- **3-minute encore (prompter):** `http://localhost:8000/encore-prompter/`
- **Original full presentation:** `http://localhost:8000/pitch/`
- **Original full presenter:** `http://localhost:8000/teleprompter/`
- **Launcher:** `http://localhost:8000/`

The two pairs of windows use different synchronization channels so they won't interfere with each other. Use the same origin for each pair. Browser `file://` navigation usually runs the deck, but may restrict synchronized notes and video autoplay; localhost is recommended.

## GitHub Pages

Upload the contents of `CARMAGOTCHI_Web_Pitch` to the root of a GitHub repository, then enable GitHub Pages from `main` / root. Open `https://<owner>.github.io/<repo>/encore/`. The relative asset links (`../pitch/assets/...`) work without a site-wide base URL. `.nojekyll` is included.

## Final-stage checklist

- Check the team name, role cards, and Palmer lookalike joke (no actual endorsement is implied).
- Replace **only** `encore/media/chaos_30s.mp4` with your final 30-second cut, keeping the filename.
- In Chrome or Edge, verify the video plays **with audio**, the clicker advances steps, and fullscreen works.
- Open both encore/ and encore-prompter/ on the same localhost origin, verify notes change with the stage.
- Rehearse to the 0:00–3:00 stage clock in `THREE_MINUTE_RUN_OF_SHOW.md`.
- Do not imply autonomous medical-device release: preflight checks and Golden Window output are proposals requiring authorized approval. Supervised calibration stays with humans.

This is a prototype pitch, not a deployable clinical service.
