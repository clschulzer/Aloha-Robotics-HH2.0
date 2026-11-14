# Attachment Issues

[Open the comedy presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ASTRA/versions/05-attachment-issues/) · [Speaker script](SCRIPT.md) · [Presenter window](../presenter.html?v=05-attachment-issues)

The deliberately unhinged version: an emotionally demanding C-arm, a calendar full of bad dates, a senior plugging-in engineer, and one extremely sophisticated human thumb. The jokes target the machine. The final message gives the room back to the people caring for patients.

## Three minutes

| Time | Scene |
|---|---|
| 0:00–0:36 | Complete original movie → true-story joke → Aloha |
| 0:36–1:19 | One original character, one actual state and one punchline at a time; personality roulette and TV shutdown |
| 1:19–1:23 | “Now. Let’s put the little menace to work.” |
| 1:23–2:01 | A cancelled case, a swarm checking the timetable, emergency cover, backup and a selected maintenance window |
| 2:01–2:45 | Find → Connect → Authorize → Report, with an actual rule gate behind the illustrated human tap |
| 2:45–3:00 | “Less machine drama.” / “More human care.” |

The speech is intentionally short. Leave time for laughter, the film, the character expressions and the final silence. Do not explain a joke that has already landed.

## The implementation beneath the joke

The swarm calls the team's `IAPlanner.findWindow` as its scouts arrive at candidate times. The selected result is the planner's actual Cio window, 19:00–21:00, with Arcus available as backup. The example case plan and use history are synthetic.

The waiting phone runs `IAPlanner.canStart` with missing approval and an uncleared environment. It remains blocked. On the following cue, the required checks pass and the illustrated human tap records the simulated start. The browser rehearsal verifies both states and exactly one simulated tap.

This is a working browser demonstration of planning and authorization logic. The Ketty mission, device connection, hospital interfaces and returned service receipt illustrate the proposed integration; they are not live hospital or robot operations. The legacy planner's hourly usage measure is a risk proxy, not a calibrated probability of an uninterrupted update.

## Present

Serve the repository root with `python3 -m http.server 8000` and open this folder. Choose live control or the timed preview. Arrows navigate, `P` pauses, `N` shows notes, `S` toggles optional effects, `F` requests fullscreen and `Home` resets.

The original film and soundtrack are intact. Optional effects punctuate the portrait changes, audit stamp, connecting paths and human tap. The outro deliberately becomes quiet.

The original ASTRA and team files remain untouched. [Design decisions](research/REVIEW.md) · [Browser validation](research/VALIDATION.md).
