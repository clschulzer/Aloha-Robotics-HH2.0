/* ALOHA ROBOTICS · FINAL v2 — the spoken script, one entry per beat. `at` = target second on the pitch clock.
   Words: Christian's (statement, moods, phone part, close), the earlier OPUS toy (installing, dead on arrival),
   ASTRA 04 (the swarm), Marc's line "Now we have the physical. Introducing the invisible."
   Words in [brackets] are optional: drop them if you run long. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  OPUS.TEAM = [];
  OPUS.NOTES = {
    standby: [{ at: null, cue: 'STANDBY · black screen', say: 'Press F on this window once (fullscreen + sound). When the jury is ready: →. The film starts. Do not speak.' }],
    film: [{ at: 0, cue: 'FILM 0:00–0:30', say: '(Silence. Walk on stage while it plays.)' }],
    intro: [{ at: 30.4, auto: true, cue: 'BASED ON A TRUE STORY', say: '(Silent. Let the line land, it burns into embers by itself. Take your position.)' }],
    statement: [
      { at: 34, cue: 'WE ARE ALOHA ROBOTICS', say: 'We are Aloha Robotics.' },
      { at: 36.5, cue: 'INVISIBLE UNDERDOGS', say: 'We root for the invisible underdogs who keep hospitals running.' },
      { at: 41, cue: 'TECHNOLOGY THEY LOVE', say: 'They deserve technology they don’t fear, but love to use.' },
    ],
    app: [
      { at: 46, cue: 'MEET C-ARMAGOTCHI · the toy drops, blinks, becomes the phone · LONELY', say: 'Meet C-ARMAGOTCHI. This is Cio, a C-arm’s digital twin, on the phone of its team. Lonely: nobody connected me for days.' },
      { at: 53.5, cue: 'HUNGRY · each mood arrives as a notification', say: 'Hungry: my security patch is due.' },
      { at: 56.5, cue: 'INSTALLING', say: 'Installing: whatever you do, don’t pull my plug.' },
      { at: 59.5, cue: 'HAPPY', say: 'Happy: updated and connected.' },
      { at: 62, cue: 'DEAD ON ARRIVAL', say: 'And if someone does pull the plug: dead on arrival.' },
      { at: 65, cue: 'EVERY MOOD IS A DATA POINT · the loop', say: 'Jokes aside: every mood is a data point. When you have a bond with your C-arm, you feel responsible for it. [And it starts again with every patch.]' },
    ],
    now: [{ at: 72, cue: 'TV OFF → THE PHYSICAL · THE INVISIBLE', say: 'Now we have the physical. Introducing the invisible.' }],
    calendar: [
      { at: 75.5, cue: 'WEDNESDAY · the board unfolds', say: 'A normal Wednesday. Finding the right moment is the heart of this challenge.' },
      { at: 80, cue: 'CARE HAS RIGHT OF WAY · the swarm searches', say: 'Our agents test every gap in the OR plan: no case touched, a backup C-arm free, someone on duty to say yes. Care has right of way.' },
      { at: 90, cue: 'THE GOLDEN WINDOW', say: 'The golden window: Cio, tonight, 19:10.' },
      { at: 94, cue: 'PUBLISHED · who plugs Cio in?', say: 'Medical physics publishes. But who plugs Cio in?' },
    ],
    lena: [
      { at: 99.5, cue: 'LENA’S PHONE · it wakes up · tap → job card', say: 'The X-ray nurses on Cio’s circle get a job card.' },
      { at: 104, cue: 'NOT TODAY', say: 'Declining costs nothing.' },
    ],
    radar: [
      { at: 106.5, cue: 'LIKE A RIDE REQUEST', say: 'It asks everyone nearby, like a ride request.' },
      { at: 110.5, cue: 'NOBODY AVAILABLE → the invisible helper', say: 'One of those days. Time for the invisible helper.' },
    ],
    mission: [
      { at: 114.5, cue: 'KETTYBOT’S MISSION · 14 checks (runs by itself)', say: 'It checks itself, finds Cio where people usually park it, docks, makes sure it’s the right machine, wakes it up and checks the surroundings. Fourteen checks. One fail, and it asks nobody.' },
    ],
    start: [
      { at: 128, cue: 'LENA STARTS IT · the wizard runs by itself', say: 'Lena couldn’t walk over. Thirty seconds on her phone are enough.' },
      { at: 133.5, cue: 'A HUMAN STARTS EVERY UPDATE', say: 'A human starts every update.' },
    ],
    running: [
      { at: 136, cue: 'UPDATE RUNNING → good day', say: 'It watches and would flag early. Today is a good day.' },
      { at: 141, cue: 'REPORT · NEXT JOB', say: 'Report, audit trail, next job.' },
    ],
    loop: [{ at: 143.5, cue: 'LOOP CLOSED', say: 'And the loop closes where it started. Cio is happy, and the person who helped gets a thank-you.' }],
    outro: [
      { at: 151.5, cue: 'THREE MINUTES', say: 'Three minutes only scratch the surface. We believe robots will be everywhere in hospitals sooner than we think.' },
      { at: 159.5, cue: 'LET’S BRAINSTORM · room booked · QR · THE END (hold this frame)', say: 'Let’s brainstorm. [What we need next: status data, a C-arm to test, and a pilot. No robot needed to start.] Our robot already booked the room. Scan the code for everything we built. Thank you. (Stop. Hold this frame.)' },
    ],
  };
})();
