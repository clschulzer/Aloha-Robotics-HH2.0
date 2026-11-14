# PLUG PANIC

An original, playable Carmagotchi arcade game. KettyBot makes a night-shift round through a tiny hospital, finds quiet maintenance windows, connects dramatic C-arms, and brings their logs home.

Open `index.html` through the repository's HTTP server or GitHub Pages. No build step or external dependencies. The game shares the phone app's locally hosted original characters and fonts. All new source lives in this folder.

## Play

Tap a C-arm to route KettyBot through the hospital. Hold **Connect** to deliver power and a software package, then release. A separate **Start update** press is the human approval. Once the update finishes, move to the C-arm to collect its logs. Return to the dock and **Upload logs + restock** to close the loop.

Close five loops before the two-minute shift ends. Fast deliveries build a score multiplier; a new device adds a small bonus. Early finishes earn a time bonus. The local best score stays in this browser. Sound is optional and starts off.

On desktop, use arrow keys or WASD to move, **E** to perform the current action, and **Escape** to pause. Hold E to connect, release, and press it separately to approve. Clicking a device also works.

The **Next C-arm** button suggests a target and routes there; it never connects or approves automatically.

## Game rules and product meaning

- The loop is power → data → explicit human go-ahead → update → logs → receipt.
- Only a wide enough quiet window permits starting. The game reserves both installation time and recovery margin.
- Fritzi is always the protected backup and cannot be updated.
- Emergency calls block new maintenance. Already approved updates keep power and finish; the game never teaches unplugging an active update.
- One device updates at a time.
- Connection takes a continuous hold. Releasing the hold cannot count as the separate approval.
- A connection expiring or a changed window invalidates pending approval.
- Power and software packages are consumed on approval. Supplies refill only at the dock.
- Finishing an installation alone does not score a receipt. Logs have to come home.
- Pausing freezes the game. Hiding or leaving the tab pauses automatically.

All routes, device states, event frequencies, scores, and timings are invented arcade mechanics. There is no patient data, medical integration, real device command, or clinical scheduling claim.

## Engineering

- `engine.mjs`: deterministic, immutable game rules and corridor pathfinding, independent of the browser.
- `game.mjs`: native Canvas environment, DOM character stations, audio synthesis, controls, and modal/focus management.
- `game.css`: responsive layout, original motion, reduced-motion support.
- `engine.test.mjs`: acceptance tests for actual game behavior.

Test with:

```sh
node engine.test.mjs
```

The tests include a complete, winnable five-receipt shift with real movement and waiting. They also check no automatic approval, short holds, duplicate actions, emergency entry, continued approved updates, protected reserve, quiet/recovery gates, local supplies, stale connections, pause, timeout, and clean replay.

For read-only browser inspection:

```js
window.PlugPanic.inspect()
```

The returned value is a deep copy containing `state`, current `panel`, `near`, `suggested`, score, and settings. It cannot mutate the live game. Test the game through its visible controls.

## Live QA route

1. Start a shift.
2. Tap Cio and wait for KettyBot to arrive.
3. Hold Connect for at least 1.3 seconds.
4. Release. Verify that **Start update** appears and approvals are still zero.
5. Press Start update separately. Wait for the five game seconds to finish.
6. Return to dock; upload the logs. Verify one receipt and replenished supplies.
7. Visit Fritzi; verify maintenance cannot start.
8. Pause during movement and verify clock/bot freeze. Resume.
9. Observe an emergency at 35 elapsed seconds; no new maintenance may start.
10. Complete a shift or let the clock expire, then replay.

Check phone viewports at 390×844 and 320×740, and desktop at 1440×1000. No server-side persistence or analytics is used.
