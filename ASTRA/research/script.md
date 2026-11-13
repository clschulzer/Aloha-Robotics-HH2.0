# ASTRA 180-second stage script

Eight scenes. Timing includes animation, interaction, pauses, and the opening sting. All clinical data and device events shown are synthetic. The muted opening uses only the chase excerpt from source time 2.000–6.333 seconds, plus 0.967 seconds of freeze/fades: 5.3 seconds in total. A readable Cora animation replaces the sting if video cannot play.

| Scene ID | Start | End | Budget |
|---|---:|---:|---:|
| `arrival` | 0:00 | 0:18 | 18 s |
| `handoff` | 0:18 | 0:36 | 18 s |
| `window` | 0:36 | 1:09 | 33 s |
| `connect` | 1:09 | 1:35 | 26 s |
| `authorize` | 1:35 | 1:58 | 23 s |
| `return` | 1:58 | 2:19 | 21 s |
| `pilot` | 2:19 | 2:37 | 18 s |
| `finale` | 2:37 | 3:00 | 23 s |
| **Total** | | | **180 s** |

## arrival — 0:00–0:18

**Screen:** Discreet identity: “ALOHA ROBOTICS / CARMAGOTCHI / Invisible Connectivity.” After the spoken introduction, play the brief chase sting, then cut to lonely Cora. One message appears: “Update available. Anyone?” The message remains unanswered. Let the silence carry the joke.

**Say:**

> Meet Cora. Our mobile X-ray machine.
>
> Left on read.

**Direction:** At Start, warmly introduce Cora. Let the sting play without narration. Once lonely Cora and her request are visible, wait about two seconds before “Left on read.” Deadpan, no explanation. Allow a small laugh; advance at 0:18.

**Opening cue budget:** 0:00–0:03 introduction; 0:03–0:08.3 muted chase sting including freeze/fades; 0:08.3–0:12 lonely Cora and unanswered request; 0:12–0:14 “Left on read”; 0:14–0:18 laugh/breath. The source excerpt is 2.000–6.333 seconds; the rendered clip is 5.3 seconds. Do not include an instantaneous installation, explosion, or other later sequence.

**Fallback:** Keep exactly the same spoken words and timing. In the media interval show a readable, animated Cora chase/arrival state, then the same lonely Cora and unanswered request. No browser troubleshooting narration and no repeated introduction.

## handoff — 0:18–0:36

**Screen:** The same request travels between three role positions. “With the patient.” “Responsible, but elsewhere.” “Waiting for a connection.” The roles are represented by calm work cues rather than dismissive declined invitations. Cora’s power/network indicators fade.

**Say:**

> The people with the machine are busy. The people responsible for the update are somewhere else. Cora is parked, unplugged, and offline. There is already software to send the update. What’s missing is a workable handover.

**Direction:** No comic impersonations of staff. The last sentence is the turn into the solution; advance directly.

## window — 0:36–1:09

**Screen:** Cora’s task becomes a calendar card. The calendar rejects the 17:10 candidate because the required twenty-minute handover after the preceding case is still in progress. A later candidate contains the task plus recovery allowance, with an available backup device. An emergency signal arrives before installation. The candidate is withdrawn, then a new proposal is placed. The old approval is absent or invalidated. Small explanation labels are attached to actions.

**Say:**

> CARMAGOTCHI gives her a service coordinator. It brings together the theatre calendar, device status, and the maintenance task.
>
> Looks empty. Still in handover.
>
> Here’s a useful window, with a backup C-arm reserved.
>
> Then an emergency arrives. Before installation, the plan is withdrawn and rebooked.
>
> Fixed rules protect the clinical schedule. The agents coordinate the work around them.

**Direction:** Point only at the item changing. Select the next candidate before “Here’s a useful window.” Cue the emergency after “reserved.” Let the cancelled candidate disappear before saying “rebooked.” The audience should see cause and effect, not just new copy. Do not speak probability values.

**Required implemented behavior:** No installation begins in this scene. The 17:10 candidate is rejected for the twenty-minute post-case handover rule; recovery duration is not the reason for this first rejection. An emergency withdraws the unstarted plan. The rebooked plan needs a fresh authorization. The synthetic backup must remain outside the service conflict.

## connect — 1:09–1:35

**Screen:** The calendar card becomes a service appointment. A companion queues “approved package” and “permitted logs.” At a reachable parking point, separate power and Ethernet paths connect. The robot is labeled “proposed mobile companion.” Cora changes from neglected to expectant.

**Say:**

> Now comes the last metre. Our proposed companion holds updates and previously collected logs while Cora is off.
>
> At an accessible parking point, an approved power and Ethernet connection completes the handover.
>
> A robot can bring that companion to the device. If access is blocked, it asks for help.
>
**Direction:** Give the robot one restrained entrance. Let the on-screen “Finally. Someone who brings a cable” land during a silent beat; do not add a spoken appointment joke. The power connection and data connection must be readable as separate dependencies. Do not animate a bare connector magically attaching itself to an unspecified clinical port.

**Honesty:** Queued logs were captured when the main device was available. This does not show collecting fresh logs from a powerless machine. The hardware connection remains a concept, and the required device power/wake behavior is unresolved.

## authorize — 1:35–1:58

**Screen:** A fictional authorized service lead, explicitly identified as a demo role, reviews the exact device, eligible software-only task, current window, and backup. Device identity and power pass. The final start button remains disabled until conditions are met. The human confirms. No motion or radiation is shown.

**Say:**

> Approval belongs to a person. The authorized service lead sees the exact device, task, window, and backup.
>
> Power and device identity are confirmed. The package is eligible.
>
> Only then can that person confirm the start.
>
> Calibration and device movement remain technician work.

**Direction:** The speaker pauses for the human confirmation. The operator triggers that action; an animation does not auto-approve. A quiet confirmation is sufficient.

**Honesty:** These are simulated checks and a simulated authorization. Real authority and permitted remote-start procedures depend on hospital policy, manufacturer interfaces, and update class.

## return — 1:58–2:19

**Screen:** A brief, clearly compressed demonstration transitions through “Return received,” “Technical result recorded,” “Local checks complete,” and “Released by authorized staff.” The final status requires a deliberate human action. The backup remains visible until release.

**Say:**

> Starting is only half the job.
>
> CARMAGOTCHI waits for the device to report back, records the result, and sends exceptions to the responsible service team.
>
> Then come the hospital’s required readiness checks and release.
>
> Now Cora’s appointment is actually finished.

**Direction:** Slow down for “Starting is only half the job.” The operator performs the synthetic release when the speaker says “release.” The final line is satisfaction rather than a second joke.

**Honesty:** This is a compressed synthetic sequence. Do not imply that the demonstrated update duration is real or that installation success alone establishes clinical readiness.

## pilot — 2:19–2:37

**Screen:** One small separation: “Built: interactive workflow prototype” / “Next: approved device integration.” One concrete test target: “Window → permitted logs → verified handover.” Avoid a roadmap of speculative products.

**Say:**

> The workflow runs here with synthetic data. Next: one approved C-arm and a real log connection.
>
> Prove the handover. Then use the same coordination for updates and service visits.

**Direction:** Clear and candid. This is the scope statement, not an apology. It gives the challenge owners a concrete next step without presenting a speculative platform catalog.

## finale — 2:37–3:00

**Screen:** Return to the same Cora from the beginning. This time the request is complete. The maintenance interface dissolves, leaving a quiet theatre doorway and Cora, ready after the synthetic authorized release. Keep the final care sentence hidden on entry. Reveal that one sentence on the operator’s cue near 2:51, as the speaker starts the last line. No competing tagline appears.

**Say:**

> Tomorrow, someone will wheel Cora into theatre.
>
> They won’t know who found the window, connected the machine, or watched her come back.
>
> They’ll just know she’s ready.
>
> CARMAGOTCHI.
>
> We take care of the machine, so they can take care of the patient.

**Direction:** No music swell over the words. Hold a beat before the name, and another before the final sentence. The operator reveals the final sentence near 2:51; this is a presentation cue, not a device action. Finish at about 2:57 and let the last frame breathe. A small Cora blink after the line is enough. No final joke, control toast, or extra “technical questions” line.

## Optional Q&A lines

**“What is actually AI?”**

> The prototype makes the workflow and its constraints inspectable. In the proposed system, agents coordinate tasks and explanations around a rule-based planner. They cannot authorize an update or override a failed readiness check.

**“Why a robot?”**

> A calendar cannot plug in a machine. A robot is one possible way to deliver power and a companion to a reachable parking point. The workflow also supports an approved fixed companion or a small task for someone on-site.

**“What if an emergency arrives after installation starts?”**

> That is a different state. We follow the validated installation procedure and activate the backup plan. We do not assume the installer can safely be interrupted.

**“What if it never comes back?”**

> The expected return becomes an overdue task for the responsible service team. The device remains unavailable and the backup plan stays active until the required checks and release are complete.

**“Can you connect a powered-off C-arm?”**

> The separate companion can remain powered and queue data. The C-arm itself still needs a supported power state and approved interface. Those details have to be established for the specific model.

**“Can your shadow test guarantee the update?”**

> No. A compatible test environment might detect certain problems earlier, but it needs manufacturer support and cannot replace the validated service procedure.

**“What have you measured?”**

> We have a synthetic workflow demonstration. A pilot would measure completed service handovers, staff interactions, blocked or abandoned jobs, permitted log delivery, and verified device returns. We are not claiming clinical impact numbers from this prototype.

## Operator cue data

This is the file’s only JSON code fence. Every `speech` array contains the exact spoken paragraphs for that scene. Times are seconds from pitch start; `openingBeats.at` and `finaleBeats.at` are relative to their scene. Media source bounds describe the original footage; the rendered clip includes freeze/fades and lasts 5.3 seconds.

```json
[
  {
    "id": "arrival",
    "start": 0,
    "duration": 18,
    "cue": "Introduce Cora; play chase sting; show lonely Cora and request; deadpan response.",
    "speech": [
      "Meet Cora. Our mobile X-ray machine.",
      "Left on read."
    ],
    "media": {"sourceStart": 2.0, "sourceEnd": 6.333, "freezeFadeDuration": 0.967, "displayDuration": 5.3, "maxDisplayDuration": 5.3, "muted": true, "fallback": "Readable Cora animation, same spoken words and timing."},
    "openingBeats": [
      {"at": 0, "kind": "speech", "text": "Meet Cora. Our mobile X-ray machine."},
      {"at": 3, "kind": "media", "text": "Muted 5.3-second chase sting including freeze/fades; no install or explosion."},
      {"at": 8.3, "kind": "screen", "text": "Lonely Cora: Update available. Anyone?"},
      {"at": 12, "kind": "speech", "text": "Left on read."},
      {"at": 14, "kind": "hold", "text": "Allow laugh or breath; advance at 18."}
    ]
  },
  {
    "id": "handoff",
    "start": 18,
    "duration": 18,
    "cue": "Three role locations; power and network fade; advance on handover.",
    "speech": [
      "The people with the machine are busy. The people responsible for the update are somewhere else. Cora is parked, unplugged, and offline. There is already software to send the update. What’s missing is a workable handover."
    ]
  },
  {
    "id": "window",
    "start": 36,
    "duration": 33,
    "cue": "Reject 17:10 because post-case handover is still active; show later candidate and backup; trigger emergency before start; rebook.",
    "speech": [
      "CARMAGOTCHI gives her a service coordinator. It brings together the theatre calendar, device status, and the maintenance task.",
      "Looks empty. Still in handover.",
      "Here’s a useful window, with a backup C-arm reserved.",
      "Then an emergency arrives. Before installation, the plan is withdrawn and rebooked.",
      "Fixed rules protect the clinical schedule. The agents coordinate the work around them."
    ]
  },
  {
    "id": "connect",
    "start": 69,
    "duration": 26,
    "cue": "Companion queue; separate power and Ethernet paths; robot cameo; silent beat for the on-screen cable joke.",
    "speech": [
      "Now comes the last metre. Our proposed companion holds updates and previously collected logs while Cora is off.",
      "At an accessible parking point, an approved power and Ethernet connection completes the handover.",
      "A robot can bring that companion to the device. If access is blocked, it asks for help."
    ]
  },
  {
    "id": "authorize",
    "start": 95,
    "duration": 23,
    "cue": "Readiness gates; authorized human explicitly confirms start.",
    "speech": [
      "Approval belongs to a person. The authorized service lead sees the exact device, task, window, and backup.",
      "Power and device identity are confirmed. The package is eligible.",
      "Only then can that person confirm the start.",
      "Calibration and device movement remain technician work."
    ]
  },
  {
    "id": "return",
    "start": 118,
    "duration": 21,
    "cue": "Return and technical result; required local checks; human release.",
    "speech": [
      "Starting is only half the job.",
      "CARMAGOTCHI waits for the device to report back, records the result, and sends exceptions to the responsible service team.",
      "Then come the hospital’s required readiness checks and release.",
      "Now Cora’s appointment is actually finished."
    ]
  },
  {
    "id": "pilot",
    "start": 139,
    "duration": 18,
    "cue": "Prototype versus integration; one device and permitted logs.",
    "speech": [
      "The workflow runs here with synthetic data. Next: one approved C-arm and a real log connection.",
      "Prove the handover. Then use the same coordination for updates and service visits."
    ]
  },
  {
    "id": "finale",
    "start": 157,
    "duration": 23,
    "cue": "Interface disappears; quiet morning; explicitly reveal the single final sentence near 2:51; hold without a toast.",
    "speech": [
      "Tomorrow, someone will wheel Cora into theatre.",
      "They won’t know who found the window, connected the machine, or watched her come back.",
      "They’ll just know she’s ready.",
      "CARMAGOTCHI.",
      "We take care of the machine, so they can take care of the patient."
    ],
    "finaleBeats": [
      {"at": 0, "kind": "screen", "text": "Quiet morning and released Cora; final care sentence remains hidden."},
      {"at": 14, "kind": "reveal", "text": "We take care of the machine, so they can take care of the patient."},
      {"at": 20, "kind": "hold", "text": "Let the final frame breathe; no toast or extra tagline."}
    ]
  }
]
```
