# Open Circuit

[Open the engineering presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/06-open-circuit/) · [Speaker script](SCRIPT.md) · [Presenter window](../presenter.html?v=06-open-circuit)

A three-minute technical presentation of the code, the decision boundaries and the proposed integration stack. This is the deliberately different cut that uses the entire time for engineering. The original film and character walkthrough remain in the other versions.

## Sequence

| Time | What the audience sees |
|---|---|
| 0:00–0:09 | Inputs, deterministic rules and human authorization separate into three layers |
| 0:09–0:56 | Operational inputs → candidate rejection → ranked windows → a structured result |
| 0:56–1:30 | The actual start gate refuses an active procedure, an alarm and a recalled package; an eligible result still requires a human |
| 1:30–2:13 | The proposed hospital node, vendor route, robot adapter and returning technical status |
| 2:13–2:33 | A permission envelope bound to a person, device, package, plan version and expiry |
| 2:33–2:52 | Executable invariant checks and the next integration boundary |
| 2:52–3:00 | “An explainable plan. An accountable handoff.” |

## This demonstration executes code

The candidate matrix and selected result come from the team's original JavaScript rule core and OPUS scorer, copied into `engine/`. The chosen synthetic result is Cio at 19:10–21:10, with Fritzi as the available replacement. The score is illustrative; the presentation does not display it as a calibrated clinical confidence.

`kernel.js` connects those functions to the stage. The gate uses `planner.canStart`. Its button is disabled for blocked states. In the eligible state, a real click starts a **local browser simulation**. The timed presentation never presses it automatically.

The final check grid executes eight assertions against the same functions. Those checks cover case protection, full-window backup availability, missing data, motion updates, alarms, explicit human approval, recall and deterministic replay.

The Python/FastAPI hospital node, SQLite journal, SSE interface, ROS 2/Nav2 adapter and signed authorization contract are proposed integration work from the team's specifications. The stage labels that boundary. [Stack and source analysis](research/STACK.md) explains what is implemented, why each proposed component exists and what still requires manufacturer validation.

## Present and inspect

Serve the repository root with `python3 -m http.server 8000`. Open this folder and choose live control or timed preview. Arrows navigate, `N` opens notes, `P` pauses, `S` toggles optional sound and `Home` resets.

For a technical Q&A, return to the gate slide and click the enabled button. It sends no network request and controls no device. Reset clears the simulated start.

[Design review](research/REVIEW.md) · [Validation](research/VALIDATION.md).
