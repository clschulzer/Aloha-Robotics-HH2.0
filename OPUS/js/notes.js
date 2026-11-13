/* ALOHA ROBOTICS / OPUS — the spoken script, one entry per beat.
   `at` = target time on the pitch clock (seconds since the film started). The presenter view,
   the N overlay, the T timer HUD and ?auto rehearsal all read this file. Words in [brackets]
   are optional: drop them if you are behind the clock. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  OPUS.NOTES = {
    standby: [
      { at: null, cue: 'STANDBY · black screen', say: 'Black screen. When the jury is ready: press → (or the clicker). The film starts with sound. Do not speak.' },
    ],
    film: [
      { at: 0, cue: 'FILM 0:00–0:30', say: '(Silence. Let the film play. Sound up. It ends in an explosion and rolls straight into the title — no click needed.)' },
    ],
    intro: [
      { at: 30.4, auto: true, cue: 'BASED ON A TRUE STORY → INTRODUCING ALOHA ROBOTICS', say: '(Still silent. "Based on a true story" burns into embers, the embers become ALOHA ROBOTICS. Wait for the hit, one breath, then click.)' },
    ],
    tama: [
      { at: 37, cue: '01 LONELY', say: 'Meet the world’s most expensive Tamagotchi. When nobody needs it: parked in a hallway, switched off. No socket. No network.' },
      { at: 45, cue: '02 DESPERATE', say: 'The update is already on board. Three people could press install — the OR nurse, medical physics, IT. Nobody feels responsible.' },
      { at: 52, cue: '03 INSTALLING', say: 'Installing takes two hours. The next surgery starts in one.' },
      { at: 56, cue: '04 BLISS', say: 'When it works — bliss.' },
      { at: 59, cue: '05 DEAD ON ARRIVAL', say: 'Two percent of the time, it’s dead on arrival — [like when] someone unplugs it mid-update.' },
      { at: 64, cue: '06 ROLLBACK', say: 'Then it’s fire and pray. Siemens finds out from an angry phone call.' },
      { at: 69, cue: '07 THE LOOP', say: 'And every quarter… it starts all over again.' },
    ],
    cut: [
      { at: 73, cue: 'CRT OFF → TONE SHIFT', say: '(Wait for the screen to die. One beat of silence.) Jokes aside. The update isn’t the problem. Finding the window is.' },
    ],
    swarm: [
      { at: 78, cue: 'A REAL DAY', say: 'Here’s a day for eight C-arms. Grey is surgery. Everything else looks free. It isn’t.' },
      { at: 84, cue: 'RELEASE THE SWARM', say: 'So we release a swarm of agents. Hard rules kill the impossible first. Then they test every gap: two hours plus a rollback buffer, power, a free backup, someone awake to press start — and the odds an emergency needs this exact machine.' },
      { at: 98, cue: 'GOLDEN WINDOW', say: 'Golden window: Cio, tonight, seven-ten. [Ninety-five percent undisturbed.] No socket in the hallway — so KettyBot brings the power.' },
      { at: 104, cue: 'POLYTRAUMA → REPLAN', say: 'Polytrauma pre-alert. Trauma C-arms are locked — and the swarm re-plans the whole fleet in milliseconds.' },
      { at: 110, cue: 'ONE QUESTION, ONE TAP', say: 'Then exactly one human gets exactly one question. One tap. No phone calls.' },
    ],
    arch: [
      { at: 116, cue: 'THE CORE', say: 'Under the hood: a twin of every device, a calendar, and safety rules written as tested code — not AI.' },
      { at: 123, cue: 'HOSPITAL', say: 'It reads the OR plan — room and time only, never patient data — the duty roster, and the trauma alarm.' },
      { at: 129, cue: 'SIEMENS', say: 'It plugs into teamplay Fleet for signed packages — and sends the logs home.' },
      { at: 134, cue: 'THE LAST METRE', say: 'For the last metre, KettyBot drives to the parked C-arm: brings power and the package, checks the area, guards the install, carries the logs back. No robot? A battery companion — same job, no wheels.' },
      { at: 145, cue: 'HUMANS DECIDE', say: 'Agents propose. Rules constrain. Humans decide.' },
    ],
    outro: [
      { at: 150, cue: 'THEIR WORDS', say: 'So: every C-arm — connected, up and running, safe to operate.' },
      { at: 155, cue: 'THREE WITHOUTS', say: 'No surgery waits. Nobody makes a phone call. No nurse takes the risk.' },
      { at: 161, cue: 'INVISIBLE → IAI', say: 'And nobody even notices. … Everyone’s talking about AI. We built IAI: Invisible Agentic Intelligence.' },
      { at: 169, cue: 'ALOHA + WINK', say: 'We’re Aloha Robotics. Any technical questions?' },
    ],
    'app-score': [{ at: null, cue: 'Q&A · HOW THE GOLDEN SCORE WORKS', say: 'P(undisturbed) = unplanned use × emergencies that would pull this C-arm × overrun of the case before. Hard rules first (code, tested), probability second, human last. Same constants as the team planner: 120 min install, 30 min rollback buffer, 20 min handover.' }],
    'app-real': [{ at: null, cue: 'Q&A · WHAT IS REAL', say: 'Built: rule core with 15 tests (planner.js), golden scorer with 12 tests, clickable platform prototype, this live swarm. Assumed: remote-start interface, power draw during install, docking hardware. Next: one C-arm, one hospital, real logs.' }],
    'app-robot': [{ at: null, cue: 'Q&A · HARDWARE', say: 'KettyBot: 30 kg payload, LiDAR + vision SLAM, 1.2 m/s, single floor today. Carries a medical-grade battery pack plus a cable to the Schuko and LAN ports. Never moves the C-arm, never enters the OR, never starts an update.' }],
  };
})();
