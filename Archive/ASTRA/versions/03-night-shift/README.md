# Night Shift

[Open the presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/03-night-shift/) · [Speaker script](SCRIPT.md) · [Presenter window](../presenter.html?v=03-night-shift)

A different creative interpretation of the same solution: a machine enters the team chat, an evening opportunity appears, and a single golden thread follows the work until somebody has accounted for the result.

## The three minutes

| Time | On stage |
|---|---|
| 0:00–0:36 | Original film, true-story joke, ember Aloha reveal |
| 0:36–1:08 | Six original characters as short messages; accelerating loop and TV shutdown |
| 1:08–1:12 | The hard turn to “Now.” |
| 1:12–2:02 | A realistic horizontal theatre board; cancellation, searching scouts, emergency cover and the golden window |
| 2:02–2:42 | A single continuous handoff: find, decide, connect, report |
| 2:42–3:00 | A quiet horizon and “Ready for what comes next.” |

The horizontal board is new. Case geometry and the golden window come from the original team's `IAPlanner` and synthetic case plan; the highlighted replacement is checked against its own calendar for the entire maintenance period and buffer. The swarm is a visualization of search, not a claim that a trained clinical AI is running.

The role handoff and physical connectivity are based on Christian's material and the challenge-owner interviews. The robot connection and clinical service interfaces remain concepts. The presentation does not imply that a result receipt is a clinical release.

## Run it

Serve the repository root, then open this folder. For example:

```sh
python3 -m http.server 8000
```

Choose **Present live** or **Watch 3-minute preview**. Effects after the film are optional. The original film retains its audio. Arrow keys advance/back; `P` pauses; `N` shows notes; `F` enters fullscreen; `S` toggles effects; `Home` resets. A reduced-motion preference replaces ornamental movement with settled states.

All new code is inside this folder. Shared original movie, characters, fonts and planner are read from `ASTRA/assets` and `ASTRA/team`. Existing team files are unchanged.
