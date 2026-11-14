# C-Arcade — The Carecade

**[Play both games](https://clschulzer.github.io/Aloha-Robotics-HH2.0/C-Arcade/)** · **[QR code](share/qr.png)** · **[Printable QR card](share/qr-card.png)** · **[Phone app](../Care-Companion/phone/)**

Two original browser games beside the C-ARMAGOTCHI app. No installation, account, build step or backend. All game files live here; no presentations are edited.

![Both games running on phone-sized screens](research/phone-games.webp)

## C-CHOMP

**[Play C-CHOMP](c-chomp/)**

A Pac-Man-inspired pocket-toy maze game starring a tiny, pixel-drawn C-arm. The open C is its mouth, with tube and detector jaws, a wheeled base, and a completely unreasonable appetite.

- Eat every patch bit across three original, connected mazes.
- Plug powerups turn the tables: chase the software bugs for combo points.
- Three lives, escalating difficulty, extra lives and a local personal best.
- Arrow keys or WASD; on a phone, swipe or use the D-pad.
- Pause, reboot, optional synthesized sound and reduced-motion support.

The joke is the metaphor: even an imaging device needs feeding. Maze layouts, sprites, effects and sounds are original.

## PLUG PANIC

**[Play PLUG PANIC](plug-panic/)**

Play KettyBot on a two-minute, fast-forward night shift. Find the dramatic C-arms, bring power and data, and close five care loops.

1. Tap a C-arm to route KettyBot through the hospital, or move with arrow keys / WASD.
2. Hold the action button to connect during a suitable window.
3. Give the explicit human go-ahead. Updates only begin when the game’s checks pass.
4. Collect the resulting logs and take them to the dock. Refill, then make another round.

Fritzi remains protected as backup. Procedures, too-short windows and emergency periods block new maintenance. An already approved update finishes; the game does not teach pulling its power. Close loops, build combos and beat your own score. Sound is optional; **E** is the keyboard action and **Escape** pauses.

The original pitch characters are reused from the app. These are deliberately compressed, invented arcade rules, not the pitch’s production planner or a medical-device procedure.

## How this belongs with the pitch

Use the arcade as an **after-pitch QR extra**, while people ask questions or try the app. It is an invitation to interact without spending the three-minute pitch on game instructions.

| The audience plays | The idea they take away |
| --- | --- |
| Feed a comically hungry C-arm | The machine’s state becomes something people notice and care about. |
| Find stranded devices and bring power + data | Connectivity includes a physical last step. |
| Wait for a usable gap, keep reserve coverage | An empty slot alone is not enough to start maintenance. |
| Explicitly approve the start | The helper prepares the work; a person decides. |
| Return the logs and close the loop | Success needs to be reported back, not just attempted. |

The hub connects back to the phone app for the fuller product story. The phone app’s home and **You** screens link here. Existing presentation content stays as it was.

## Files and local review

- `index.html`, `arcade.css`, `arcade.mjs`: game selection and sharing.
- `c-chomp/`: original tile engine, renderer, controls and rule tests.
- `plug-panic/`: original dispatch game, rules, renderer, controls and rule tests.
- `share/`: QR assets, generator and independent decode verification.
- `assets/`: bundled original characters, icons and embedded fonts; no runtime asset dependency on the legacy phone folder.

From the repository root, run `python3 -m http.server 8766`, then open `http://localhost:8766/C-Arcade/`. Open each game’s test file with Node for its rule checks.

```sh
node C-Arcade/c-chomp/tests.mjs
node --test C-Arcade/plug-panic/engine.test.mjs
```

Validation: 12 C-CHOMP engine tests and 21 PLUG PANIC engine tests pass. Firefox playtests covered phone and desktop layouts, real touch and keyboard input, pause/restart, sound, scoring, explicit approval and a complete log-return loop. Both games produced no console errors. QR decode checks are recorded in `share/verification.json`.

Personal bests stay in browser storage. There is no analytics, multiplayer server or real device connection. The games pause when their tab is hidden.

## Canonical source and compatibility

This is the current arcade source, copied from `CARMAGOTCHI_APP/arcade/` with its own assets. The hub and both games link to `../Care-Companion/phone/` (relative to this folder) for the phone experience. No presentation or legacy application files were changed.

Keep the original public `CARMAGOTCHI_APP/arcade/` route and its games available: it is encoded in previously shared QR codes, including the immutable `FINAL/v5` presentation. That legacy copy also remains inside the original phone app's offline scope. This canonical copy has no service worker and needs a connection to load; it is not covered by the new phone app's separate offline cache.

Personal-best storage keys are unchanged: `carmagotchi-c-chomp-highscore-v1` and `carmagotchi.plug-panic.best`. Scores remain shared between the canonical and legacy games on the same browser origin.

The QR images under `share/` now encode the canonical `C-Arcade/` URL. Their generator and verification receipt live beside them. Existing legacy QR images remain untouched. Copied images under `research/` document the earlier visual review; run the commands above for the current game-rule checks.
