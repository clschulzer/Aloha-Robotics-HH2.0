/* ALOHA ROBOTICS / OPUS · Christian's storyboard v4 — the spoken script, one entry per beat.
   The words are Christian's (storyboard v4, 13 Nov 22:00, and his pitch click dummy), trimmed to fit a
   30-second film. `at` = target second on the pitch clock. Words in [brackets] are optional. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  OPUS.TEAM = [];
  OPUS.NOTES = {
    standby: [{ at: null, cue: 'STANDBY · black screen', say: 'Press F on this window once (fullscreen + sound). When the jury is ready: →. The film starts. Do not speak.' }],
    film: [{ at: 0, cue: 'FILM 0:00–0:30', say: '(Silence. KettyBot starts driving towards the C-arm on stage now, if you run the live robot.)' }],
    intro: [{ at: 30.4, auto: true, cue: 'BASED ON A TRUE STORY → ALOHA ROBOTICS', say: '(Silent. The title settles by itself. One breath, then click.)' }],
    statement: [
      { at: 34, cue: 'STATEMENT 1', say: 'We are Aloha Robotics. We root for the invisible underdogs who keep hospitals running.' },
      { at: 40, cue: 'STATEMENT 2', say: 'They deserve technology they don’t fear, but love to use.' },
    ],
    app: [
      { at: 45, cue: 'EMOTIONAL · the phone · LONELY', say: 'Meet C-ARMAGOTCHI. This is Cio, a C-arm’s digital twin, on the phone of its team. Lonely: nobody connected me for days.' },
      { at: 54, cue: 'HUNGRY', say: 'Hungry: my security patch is due.' },
      { at: 57, cue: 'HAPPY', say: 'Happy: updated and connected.' },
      { at: 59.5, cue: 'EVERY MOOD IS A DATA POINT', say: 'Jokes aside: this is not a gimmick. When you have a bond with your C-arm, you feel responsible for it.' },
      { at: 68, cue: 'PRIORITY 1 · 2', say: '[Its mood shows at a glance how long it has gone without care.] For planning, that is priority: Cio’s patch first, then C-04.' },
    ],
    plan: [
      { at: 76, cue: 'WHEN IS THE BEST MOMENT? · four signals', say: 'Finding the best moment is the heart of this challenge, [and nobody knows it in advance.] We collect it from hospital operations: OR plan, last-minute cancellations, trauma alerts, and what the machine tells us.' },
      { at: 89, cue: 'OR 3 CANCELLED 19:12', say: 'Tonight a case in OR 3 was cancelled. That’s our chance.' },
      { at: 93.5, cue: 'ONE PUSH OF A BUTTON · FOUND', say: 'One push of a button.' },
      { at: 98, cue: 'PUBLISHED by medical physics', say: 'Medical physics checks and publishes.' },
    ],
    lena: [
      { at: 100.5, cue: 'LENA’S PHONE · job card', say: 'The X-ray nurses on Cio’s circle get a job card.' },
      { at: 105, cue: 'NOT TODAY', say: 'Declining costs nothing.' },
    ],
    radar: [
      { at: 107, cue: 'LIKE A RIDE REQUEST', say: 'It asks everyone nearby, like a ride request.' },
      { at: 111, cue: 'NOBODY AVAILABLE → the invisible helper', say: 'One of those days. Time for the invisible helper.' },
    ],
    mission: [
      { at: 115, cue: 'KETTYBOT’S MISSION · 14 checks (runs by itself)', say: 'It checks itself, finds Cio where people usually park it, docks, makes sure it’s the right machine, wakes it up and checks the surroundings. Fourteen checks. One fail, and it asks nobody.' },
    ],
    start: [
      { at: 128.5, cue: 'LENA STARTS IT · the wizard runs by itself', say: 'Lena couldn’t walk over. Thirty seconds on her phone are enough.' },
      { at: 134, cue: 'A HUMAN STARTS EVERY UPDATE', say: 'A human starts every update.' },
    ],
    running: [
      { at: 136.5, cue: 'UPDATE RUNNING → good day', say: 'It watches and would flag early. Today is a good day.' },
      { at: 141.5, cue: 'REPORT · NEXT JOB', say: 'Report, audit trail, next job.' },
    ],
    loop: [{ at: 144, cue: 'LOOP CLOSED', say: 'And the loop closes where it started. Cio is happy, and the person who helped gets a thank-you.' }],
    outro: [
      { at: 152, cue: 'THREE MINUTES', say: 'Three minutes only scratch the surface. We believe robots will be everywhere in hospitals sooner than we think.' },
      { at: 160, cue: 'LET’S BRAINSTORM · three asks · room booked', say: 'Let’s brainstorm. [What we need next: status data, a C-arm to test, and a pilot. No robot needed to start.] Our robot already booked the room.' },
      { at: 169, cue: 'ALOHA ROBOTICS · KettyBot winks', say: '(Logo. Stop. Hold the frame for questions.)' },
    ],
  };
})();
