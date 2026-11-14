# C-CHOMP

A tiny C-arm with an unreasonable appetite. Eat every patch bit, grab the four plug powerups, and turn the software bugs into lunch.

Open `index.html` through the repository's HTTP server or GitHub Pages. No installation, build step, API, account, or external dependency is required. Fonts are bundled locally at `../assets/fonts/fonts.css`.

## Play

- **Move:** arrow keys, WASD, swipe on the maze, or the on-screen D-pad. Turns can be queued before a junction; reversing direction is immediate.
- **Pause:** P, Escape, Space, or the pause button. Enter starts or continues when the game surface has focus. Buttons and navigation retain their normal keyboard activation.
- **Restart:** R or Reboot.
- **Sound:** use the music button. Synthesized sound is optional and starts only after a user gesture.

Clear three different mazes: **Patch Tuesday**, **Firmware Fever**, and **CEO of Uptime**. Each round adds a bug and increases the pace. You have three lives, a short grace period after respawning, and an extra life every 5,000 points, up to five lives.

Patch bits score 10 points. Plugs score 50 and open a 7.5-second bug buffet. Eating bugs during one powerup scores 200, 400, 800, then 1,600 points. Clearing a round gives a bonus. Pausing or hiding the browser tab freezes play.

The best score stays on this device in local storage under `carmagotchi-c-chomp-highscore-v1`. Sound preference uses `c-chomp-sound`. No gameplay data is sent anywhere.

## Files and verification

- `engine.mjs`: deterministic tile movement, original seeded and braided mazes, pathfinding, collision handling, scoring, and game states. Independent of the browser.
- `game.mjs`: canvas pixel art, interface, input, optional synthesized audio, and rendering.
- `style.css`: responsive pocket-console shell with reduced-motion support.
- `tests.mjs`: 12 engine acceptance tests.

Run the tests from this folder:

```sh
node tests.mjs
```

Tests cover all pellets being reachable in all three distinct mazes; legal player and bug movement; queued turns and continuous reversal; plug and combo scoring; damage cooldown, life reset, and retained pellets; paused timers; all round transitions; final victory; game over; restart; and extra lives.

For browser inspection, `window.CChomp.inspect()` returns a fresh, read-only snapshot of phase, positions, score, pellets, powerup and grace timers, input count, best score, audio preference, and frame rate. It does not expose controls or mutable engine state.

Verified in headless Firefox at 390 × 844 and 1440 × 1000 with real pointer, touch-swipe, and keyboard input. The phone layout includes the full game and controls without horizontal scrolling. Real start, movement, pellet collection, pause/resume, D-pad, swipe, sound, and restart were exercised without console errors.

The maze layouts, C-arm sprites, bugs, sound effects, and code were created for this arcade. This is an arcade game, not a clinical control interface.
