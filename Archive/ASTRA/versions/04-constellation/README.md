# Constellation

[Open the ultra-animated presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/04-constellation/) · [Speaker script](SCRIPT.md) · [Presenter window](../presenter.html?v=04-constellation)

The high-motion version. The film's embers become the title, a dimensional phone introduces the original characters, a theatre board unfolds into place, and a large coordinated swarm finds a window. An emergency interrupts the proposal. The swarm finds another one. The architecture then grows from signals into a human decision, a service path and a return loop.

## Three-minute sequence

| Time | Scene |
|---|---|
| 0:00–0:36 | Full original movie and the quick ember title |
| 0:36–1:13 | Phone reveal, six character states, accelerating loop and TV collapse |
| 1:13–1:17 | “Now.” |
| 1:17–2:10 | Theatre board, search, first proposal, trauma reservation, new proposal |
| 2:10–2:47 | Signals → orchestration → human → service, with optional robot connection and a returned result |
| 2:47–3:00 | “Intelligence that follows through.” / “Let care keep moving.” |

## The swarm really evaluates candidates

`scoring/golden.js`, `planner.js` and `day.js` are copied from the team's OPUS v2 work. Each arriving scout calls the scorer. The selected window is an actual result, and the polytrauma reservation invalidates the first proposal before any installation begins.

The model's case plan, rates and use histories are synthetic. Its probability formula is an illustrative implementation, not a calibrated clinical forecast. No probability percentage is presented to the audience.

The existing planner and its hard rules remain intact. The original planner in `ASTRA/team` and this copied rule core have identical hashes. The extra scenario tests check emergency replacement, full-window backup availability and refusal when there is no confirmer.

The two routes into service are deliberate: the alternative device already has a connection; a parked, disconnected device would need the proposed physical bridge. The slide does not pretend the example requires KettyBot when it does not.

## Present

Serve the repository root with `python3 -m http.server 8000`, then open this folder. Choose live mode or the timed preview. Use arrows to navigate, `P` to pause, `N` for notes, `S` for optional effects, `F` for fullscreen and `Home` to reset. The full film retains its original soundtrack.

Motion is bounded and choreographed: the phone finishes its entrance, rows settle before search, scouts clear the winning label, and nodes bloom when a connection arrives. Reduced motion selects settled states. The audience sees one decision at a time.

All changes are in this new ASTRA folder. The original movie and characters are reused.
