/* ALOHA ROBOTICS / OPUS v2 — the spoken script, one entry per beat.
   `at` = target time on the pitch clock (seconds since the film started). The presenter view,
   the N overlay, the T timer HUD and ?auto rehearsal all read this file. Words in [brackets]
   are optional: drop them if you are behind the clock. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  /* Optional: presenter names shown small under ALOHA ROBOTICS, e.g. ['Christian', 'Marc', 'Siddhant']. Empty = hidden. */
  OPUS.TEAM = [];
  OPUS.NOTES = {
    standby: [
      { at: null, cue: 'STANDBY · black screen', say: 'Black screen. Press F on this window once (fullscreen + sound). When the jury is ready: press →. The film starts with sound. Do not speak.' },
    ],
    film: [
      { at: 0, cue: 'FILM 0:00–0:30', say: '(Silence. Let the film play. It ends in an explosion and rolls straight into the title — no click needed.)' },
    ],
    intro: [
      { at: 30.4, auto: true, cue: 'BASED ON A TRUE STORY → ALOHA ROBOTICS', say: '(Still silent. Let "Based on a true story." land. The title settles by itself. One breath, then click.)' },
    ],
    tama: [
      { at: 34.5, cue: 'TOY DROPS · LONELY', say: 'Every hospital has one of these. A mobile C-arm. And it’s lonely: parked in a hallway, no socket, no network.' },
      { at: 41, cue: 'DESPERATE', say: 'An update is waiting. The nurse, medical physics and IT could all start it — so nobody does.' },
      { at: 46, cue: 'INSTALLING', say: 'When someone finally does: two hours. And somebody has to press start.' },
      { at: 50.5, cue: 'BLISS', say: 'Bliss. Up to date. [Until the next patch.]' },
      { at: 54.5, cue: 'DEAD ON ARRIVAL', say: 'Or someone needs it halfway through and pulls the plug. Dead on arrival.' },
      { at: 59.5, cue: 'ROLLBACK', say: 'A technician. A phone call. A lost day.' },
      { at: 63.5, cue: 'AGAIN · faces loop faster and faster', say: 'And then the next patch arrives. Again. And again. [Every C-arm. Every hospital.] — click: the TV dies.' },
    ],
    now: [
      { at: 68.5, cue: 'TV OFF · silence · “Now.”', say: '(Wait for the word.) Now. [pause] Seriously.' },
      { at: 72, cue: '“When?” + the four conditions', say: 'An update needs four things at once: two hours, power and network, a C-arm nobody needs, and a human who presses start. In a hospital that runs on emergencies — when?' },
    ],
    calendar: [
      { at: 80, cue: 'THE DAY builds', say: 'This is a surgical day. Six mobile C-arms, every case, who is on duty, and how likely an emergency is, hour by hour.' },
      { at: 86, cue: 'THE SWARM · cursors test every gap', say: 'Aloha sends a swarm of agents. Every click tests one gap against the rules: never touch a surgery, keep a rollback buffer, a human on duty. Every click is our scheduler running live.' },
      { at: 96, cue: 'GOLDEN WINDOW · Today, 19:10', say: 'They agree on one. Today, 19:10, on Cio: ninety-five percent chance nobody needs it. No socket there? KettyBot brings the power.' },
      { at: 104, cue: 'POLYTRAUMA · window breaks · re-plan', say: 'Then: polytrauma incoming. The trauma C-arms are taken, the window breaks — and Aloha re-plans in milliseconds. Tonight, 22:20, on Bogdan.' },
      { at: 112, cue: 'ONE TAP', say: 'And a human decides. One question, to the one person on duty. One tap. [No phone calls.]' },
    ],
    flow: [
      { at: 119, cue: 'HOW? · the seed lands · SEE ← FIND', say: 'How does it work? It sees the OR plan, the device state and the rules — the hospital’s and Siemens’. Agents find the golden window.' },
      { at: 127, cue: 'ASK · BRING', say: 'It asks one person, once. KettyBot brings power, network and the signed package to the C-arm. No Wi-Fi in the OR, no changes to the machine.' },
      { at: 135, cue: 'UPDATE · REPORT · the loop closes', say: 'It installs, verifies, with the rollback always ready. And the logs come home to Siemens, so tomorrow’s plan is better.' },
      { at: 143, cue: 'ONE FULL NIGHT · title morphs', say: 'Agents propose. The rules are code. A human decides.' },
    ],
    outro: [
      { at: 150, cue: 'Every C-arm. Always ready.', say: '(Slow down.) So: every C-arm. Always ready.' },
      { at: 156, cue: 'Nobody babysits a C-arm again.', say: 'Nobody babysits a C-arm again. [pause] Nurses look after patients — not machines.' },
      { at: 163, cue: 'ALOHA ROBOTICS · questions', say: 'We’re Aloha Robotics. Any technical questions? (Stop. Hold the frame.)' },
    ],
    'app-score': [{ at: null, cue: 'Q&A · how the window is chosen', say: 'Hard rules first, as code — then the probability that the window runs undisturbed. Argmax over every legal window. Re-planned on every alarm.' }],
    'app-real': [{ at: null, cue: 'Q&A · what is real', say: 'Built: rule core with 15 tests, scorer with 12 tests, the clickable prototype, and the live calendar you just saw. To validate in a pilot: remote start path, power draw, package hand-over.' }],
    'app-robot': [{ at: null, cue: 'Q&A · the robot', say: 'KettyBot carries power, network and the package; it never starts an update and never enters an OR. Without a robot: the companion box does the same job.' }],
  };
})();
