/* ALOHA ROBOTICS / UNITED — scenes taken from Christian's pitch click dummy (demo/).
   Each scene shows the click dummy in an iframe and drives it by postMessage: the deck keeps
   navigation, clock, presenter view and rehearsal; the iframe only renders. Scene and step
   numbers refer to demo/demo.js (9 = robot mission, 10 = Lena's start wizard, 13 = loop closed). */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  OPUS.demoScene = function ({ id, beats, steps, theme }) {
    const el = document.getElementById('s-' + id);
    const frame = el.querySelector('iframe');
    let last = 0;
    const go = (b) => { last = b; const [s, step] = steps[Math.min(b, steps.length - 1)]; try { frame.contentWindow.postMessage({ demo: 'go', s, step }, '*'); } catch (_) {} };
    // A deep link can activate the scene before the iframe has loaded: replay the current beat then.
    frame.addEventListener('load', () => { if (el.classList.contains('active')) go(last); });
    return OPUS.scene({ id, el, beats, theme: theme || 'dark',
      enter() { go(0); },
      beat(i) { go(i); },
    });
  };
  /* After the golden window: the robot does the last metre, checking as it goes. Runs by itself. */
  OPUS.demoScene({ id: 'mission', beats: 1, steps: [[9, 0]] });
  /* One human starts it: push on the lock screen → start screen → started. */
  OPUS.demoScene({ id: 'start', beats: 3, steps: [[10, 0], [10, 3], [10, 4]] });
})();
