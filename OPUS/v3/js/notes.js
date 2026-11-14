/* ALOHA ROBOTICS / OPUS v3 · ONE NIGHT — the spoken script, one entry per beat.
   `at` = target second on the pitch clock. Words in [brackets] are optional. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  OPUS.TEAM = [];
  OPUS.NOTES = {
    standby: [{ at: null, cue: 'STANDBY · black screen', say: 'Press F on this window once (fullscreen + sound). When the jury is ready: →. The film starts. Do not speak.' }],
    film: [{ at: 0, cue: 'FILM 0:00–0:30', say: '(Silence. It rolls into the title by itself.)' }],
    intro: [{ at: 30.4, auto: true, cue: 'BASED ON A TRUE STORY → ALOHA ROBOTICS', say: '(Silent. The title settles. One breath, then click.)' }],
    tama: [
      { at: 34, cue: 'TOY DROPS · LEFT ON READ', say: 'Meet the C-ARMAGOTCHI. Left on read: parked in a hallway, no socket, no network.' },
      { at: 39.5, cue: 'CLINGY', say: 'Clingy: a patch is waiting — and nobody thinks it’s their job.' },
      { at: 44, cue: 'BUSY', say: 'Busy: two hours, hands off, and somebody has to press start.' },
      { at: 48.5, cue: 'GLOWING', say: 'Glowing. [Updated. Briefly.]' },
      { at: 51.5, cue: 'FLATLINED', say: 'Flatlined: someone needed it, and pulled the plug mid-update.' },
      { at: 56, cue: 'PLOT TWIST', say: 'Plot twist: rollback. A technician, a phone call, a lost day.' },
      { at: 60.5, cue: 'REPEAT · faces loop', say: 'And repeat. Every patch, every C-arm, every hospital. — click: the TV dies.' },
    ],
    now: [
      { at: 65.5, cue: 'TV OFF · “Now.”', say: '(Wait for the word.) Now.' },
      { at: 68.5, cue: 'THE CLOCK · 15:20', say: 'Wednesday, 15:20. Let’s follow one C-arm through one night.' },
    ],
    calendar: [
      { at: 73, cue: 'A NORMAL WEDNESDAY · the day builds', say: 'Here’s the day: six C-arms, every case, who’s on duty, and how likely an emergency is, hour by hour.' },
      { at: 79, cue: 'THE SWARM', say: 'Aloha sends a swarm of agents. Each one tests a gap against hard rules — never touch a surgery, keep a rollback buffer, a human on duty — and scores the chance that nobody needs the machine. [Every click is our scheduler, live.]' },
      { at: 89, cue: 'GOLDEN WINDOW 19:10', say: 'Golden window: 19:10, on Cio. Ninety-five percent undisturbed.' },
      { at: 94.5, cue: '15:26 POLYTRAUMA → 22:20', say: '15:26. Polytrauma. The trauma C-arms are taken — the window breaks. Re-planned in milliseconds: Bogdan, 22:20.' },
      { at: 103, cue: 'ONE TAP', say: 'One question to the one person on duty. One tap. [No phone calls.]' },
    ],
    night: [
      { at: 109, cue: 'THE WINDOW FLIES INTO THE CLOCK · 22:00 KettyBot rolls', say: '22:00. KettyBot leaves its dock: battery, cable, and the signed package. It finds Bogdan, checks it’s the right machine, plugs in power and network — no Wi-Fi in the OR, no changes to the C-arm — and makes sure nobody is near.' },
      { at: 123, cue: '22:20 A HUMAN STARTS IT → 00:20', say: '22:20: a human taps start. Two hours later — installed, verified, the rollback image kept, and the logs go home to Siemens.' },
    ],
    morning: [
      { at: 132, cue: 'SUNRISE · 07:00', say: '07:00. The morning team rolls Bogdan into OR 2 for the first case.' },
      { at: 137, cue: 'NOBODY NOTICED', say: 'Nobody noticed. [pause] That’s invisible connectivity.' },
    ],
    hood: [
      { at: 143, cue: 'BRAIN', say: 'Under the hood: a brain. Agents propose, the rules decide, emergency odds hour by hour, re-planned in milliseconds.' },
      { at: 150, cue: 'HANDS', say: 'Hands: KettyBot — or a simple battery companion — bringing power, network and the package to the machine.' },
      { at: 156, cue: 'HEART + A HUMAN STARTS EVERY UPDATE', say: 'And a heart: the C-ARMAGOTCHI makes people care, and its mood sets the priority. A human starts every update. [The rule core and the scorer are tested — and running live in this deck.]' },
    ],
    outro: [
      { at: 166, cue: 'EVERY C-ARM. EVERY NIGHT.', say: '(Slow down.) Every C-arm. Every night.' },
      { at: 170, cue: 'ALOHA ROBOTICS · questions', say: 'We’re Aloha Robotics. Any technical questions? (Stop. Hold the frame.)' },
    ],
    'app-score': [{ at: null, cue: 'Q&A · how the window is chosen', say: 'Hard rules first, as code — then the probability that the window runs undisturbed. Argmax over every legal window. Re-planned on every alarm.' }],
    'app-real': [{ at: null, cue: 'Q&A · what is real', say: 'Built: rule core with 15 tests, scorer with 12 tests, the clickable prototype, and the live calendar you just saw. To validate in a pilot: remote start path, power draw, package hand-over.' }],
    'app-robot': [{ at: null, cue: 'Q&A · the robot', say: 'KettyBot carries power, network and the package; it never starts an update and never enters an OR. Without a robot: the companion box does the same job.' }],
  };
})();
