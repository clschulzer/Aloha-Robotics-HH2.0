# Care Companion — C-ARMAGOTCHI phone app

**[Open the app](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Care-Companion/phone/)** · **[QR code](share/qr.png)** · **[Printable QR card](share/qr-card.png)** · **[Vector QR](share/qr.svg)**

A mobile interactive prototype originally built from **`FINAL/v1`** at repository revision `86c8bda`, now copied into the organized Care Companion source folder. The [presentation used at the hackathon](../../Presentation/hackathon/?s=1) is preserved separately. The original OPUS/Christian phone design survives in that pitch: warm cream, Manrope, large pastel character cards, a dark request screen, and the three-step human decision.

All implementation and copied assets live inside this folder. No presentation files are changed.

## Try it

1. Open the app or scan the QR. Cio has a security patch waiting.
2. Tap **Feed me power** to open the request from the pitch.
3. **Take it** follows the human connection checklist. **Not today** asks the care circle, then lets you send KettyBot.
4. Review **Right time? → Surroundings OK? → Start the update**. Only your explicit tap starts the local update.
5. See Cio become happy, pet the character, and open the service receipt.

During the update, **Explore an interrupted update** opens a separate failure/service/recovery journey. No real service request is sent.

Other screens include the six C-arms, all five pitch moods plus recovery, the care circle, the golden-window explanation, request status, activity, availability, sound/motion preferences, and sharing. Mood previews never change an ongoing task. You can leave a screen or refresh and resume the same local story.

**[The after-hours arcade](../../C-Arcade/)** adds two standalone games: **C-CHOMP**, a retro C-arm maze chomper, and **PLUG PANIC**, KettyBot’s hospital night shift. Find them from the app’s home screen or **You** tab. [Arcade QR card](../../C-Arcade/share/qr-card.png).

The **You** tab can reset the demo. Preferences survive a reset. Use the browser's **Add to Home Screen** option to launch it like an app. Its own service worker caches the app shell; its scope is confined to `Care-Companion/phone/`. The separate arcade requires a connection to load.

## Source and behavior

- Original characters and embedded fonts copied from `FINAL/v1`.
- Five explicit pitch moods: **Lonely, Hungry, Installing, Happy, Dead on arrival**.
- The original rule core, scorer and synthetic day are copied unchanged into `engine/`.
- The calculated result is **Cio, 19:10–21:10**, with **Fritzi** as backup and a recovery margin to **21:40**.
- The original source pitch has older 18-minute text in some phone screens. This app uses the planner's consistent **120-minute example**, accelerated to 18 seconds for the clickdummy. Recovery is also accelerated.
- Camera, signatures, device connections, mission checks, people, approvals, and installation are explicitly scenario demonstrations. Completion means **ready for team review**, not clinical release.

## Implementation

Buildless HTML, CSS and ES modules; no package installation or backend required. GitHub Pages serves it directly.

| File | Responsibility |
|---|---|
| `app.mjs` | Screens, tap actions, sound, navigation and UI |
| `app.css` | Mobile styling and animation |
| `state.mjs` | Local state machine and connection to the team's planner |
| `engine/` | Unmodified planner, scorer and synthetic day from FINAL/v1 |
| `sw.js` | Offline shell, restricted to this app |
| `manifest.webmanifest` | Home-screen app metadata |
| `share/` | QR images, generator and independent decode verification |
| `tests/` | State and real-browser acceptance checks |
| `research/` | Source provenance, reviews and screenshots |

State is stored only in this browser under `aloha-carmagotchi-app-v1`. There is no authentication, analytics, patient data, push subscription, hospital integration, or physical device control.

## Review

**29 state acceptance tests pass.** The Firefox browser review covers the complete human and helper paths, explicit approval, interruption/recovery, refresh persistence, missing-check blocks, mobile/desktop layouts, all image assets, motion preference and app-only service-worker scope. QR assets independently decode to the exact deployed URL.

```sh
node Care-Companion/phone/tests/state.test.mjs
node --test Care-Companion/phone/tests/offline.test.mjs
python3 -m http.server 8766
```

Open `http://localhost:8766/Care-Companion/phone/` after starting the repository-root server. The optional `tests/browser.mjs` uses a running Firefox BiDi endpoint at port 9229 by default; set `BIDI_URL` to use another existing endpoint. It creates and closes its own tab and writes only this copied app's review artifacts. Example: `BIDI_URL=ws://127.0.0.1:9231/session node Care-Companion/phone/tests/browser.mjs`. Coordinate browser ownership before running it.

[Browser review](research/browser/review.json) · [State review](research/state-review.md) · [Source record](research/source.json) · [QR verification](share/verification.json)

## Canonical source and compatibility

This folder is a self-contained copy of the mobile app, excluding the arcade. [Care Companion's detailed demo](../) is the main professional app; this `phone/` subfolder preserves the separate mobile Cio experience. Navigation links lead to the canonical `C-Arcade/` and the old `FINAL/v5/?s=1` entry, which now forwards to the [hackathon presentation](../../Presentation/hackathon/?s=1).

The original `CARMAGOTCHI_APP/` public route stays intact for existing QR codes and installed apps. Do not replace that original with a redirect: its installed service worker and offline cache cover the old URL. New installs from this folder use their own relative manifest identity, start URL and scope.

The copied worker uses the independent `aloha-care-companion-phone-` cache prefix. It precaches only files beneath this phone folder and never deletes or reads the old `carmagotchi-phone-app-` caches. Local story and preferences still use `aloha-carmagotchi-app-v1`, so same-origin browser progress carries across both copies.

Sharing QR assets in this folder encode the new canonical phone URL. Their generator and decode receipt were regenerated for this path; legacy QR files were left untouched. Source records and previously captured browser screenshots remain historical evidence from the original app.
