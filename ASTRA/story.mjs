// Timed rehearsal cues. Source: research/script.md. All device actions remain explicit.
export const STORY = [
  {
    "id": "arrival",
    "start": 0,
    "duration": 18,
    "cue": "Introduce Cora; play chase sting; show lonely Cora and request; deadpan response.",
    "speech": [
      "Meet Cora. Our mobile X-ray machine.",
      "Left on read."
    ],
    "media": {
      "sourceStart": 2.0,
      "sourceEnd": 6.333,
      "freezeFadeDuration": 0.967,
      "displayDuration": 5.3,
      "maxDisplayDuration": 5.3,
      "muted": true,
      "fallback": "Readable Cora animation, same spoken words and timing."
    },
    "openingBeats": [
      {
        "at": 0,
        "kind": "speech",
        "text": "Meet Cora. Our mobile X-ray machine."
      },
      {
        "at": 3,
        "kind": "media",
        "text": "Muted 5.3-second chase sting including freeze/fades; no install or explosion."
      },
      {
        "at": 8.3,
        "kind": "screen",
        "text": "Lonely Cora: Update available. Anyone?"
      },
      {
        "at": 12,
        "kind": "speech",
        "text": "Left on read."
      },
      {
        "at": 14,
        "kind": "hold",
        "text": "Allow laugh or breath; advance at 18."
      }
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
      {
        "at": 0,
        "kind": "screen",
        "text": "Quiet morning and released Cora; final care sentence remains hidden."
      },
      {
        "at": 14,
        "kind": "reveal",
        "text": "We take care of the machine, so they can take care of the patient."
      },
      {
        "at": 20,
        "kind": "hold",
        "text": "Let the final frame breathe; no toast or extra tagline."
      }
    ]
  }
];
