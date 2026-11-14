# The Care Loop

[Open the final presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/07-encore/) · [Speaker script](SCRIPT.md) · [Presenter window](../presenter.html?v=07-encore)

The final synthesis, built around Christian’s actual product template. The original movie lands in the title, three character states establish the emotional connection, and one calculated maintenance opportunity travels through the entire service journey.

This is my recommended starting point for the main pitch. It makes the solution tangible: somebody feels responsible, the system finds a suitable time, the request reaches a person, the helper connects the machine, and the result comes back to the team.

## The three minutes

| Time | On screen |
|---|---|
| 0:00–0:36 | The complete original film, the true-story joke and a fast ember title |
| 0:36–1:04 | Cio on the team’s phone: ghosted, needy, current; responsibility becomes priority |
| 1:04–1:07 | “Now.” The light stage gives way to dark |
| 1:07–1:35 | A surgical case is cancelled; scouts evaluate windows; medical physics publishes the proposal |
| 1:35–1:53 | Lena declines the trip without penalty; the care circle is asked; KettyBot is sent |
| 1:53–2:31 | Check, find, connect and ask; an authorized person makes the start decision |
| 2:31–2:46 | A compressed demonstration of watching, reporting and thanking |
| 2:46–3:00 | Three pillars become one care loop; “We take care of the machine. You take care of the patient.” |

The 223-word spoken script leaves room for the movie, the jokes and the visual handoffs. The small reveal steps share one clock; they are not separate long explanations.

## What is new in this version

Christian’s `pitch-demo-christian` renderer is copied into [demo/](demo/). Its phone, request card, care circle, mission map, checking agent, start wizard, progress indicator and thank-you remain the foundation.

The reskin removes competing side columns, persistent act labels, duplicated footers and the full checklist appearing at once. Each mission phase shows only its current checks. Large headlines explain the action while the phone or map demonstrates it. Optional sound marks arrivals and decisions rather than playing continuously.

The calendar is new and executable. It calls the copied team rule core and OPUS scorer; the visible scouts evaluate real candidate records. Christian’s priority rule selects Cio for attention. The scorer then finds Cio’s highest-ranked eligible window after a cancellation: **21:00–23:00**, with recovery margin to **23:30** and **Cora** available as backup. These are synthetic records, not a claimed hospital schedule or measured success probability.

That result is passed into the copied product’s job card, start screen and service receipt. The presentation now shows one consistent story instead of cutting between unrelated examples.

## What the demonstration establishes

- A working browser planner and scorer, including cancellation, emergency, backup and authorization checks.
- A polished rendering of the proposed human and robot workflow.
- A visible human decision before the illustrated update starts.
- A returned service result for team review.

The hospital interfaces, service dock, robot perception, remote clinical authorization and production deployment still require integration and manufacturer validation. The simulated tap, progress and service receipt do not control a device. An updated machine is not automatically declared clinically released.

[Source and design analysis](research/REVIEW.md) · [Validation evidence](research/VALIDATION.md)

## Present

Serve the repository root with `python3 -m http.server 8000`, or use the live link above. Choose **Watch 3-minute preview** for the full timed performance, or **Present live** for clicker control.

`←` / `→` navigate. `N` shows notes. `P` pauses the stage and embedded product together. `S` toggles optional sound effects. `F` enters fullscreen. `Home` resets. The movie retains its original soundtrack and plays in full.

Source checkpoint: `fb1ea23`. No open pull requests at the fresh source checks before and during this version. All authored changes are inside `ASTRA/versions/`.
