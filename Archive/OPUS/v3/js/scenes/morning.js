/* ALOHA ROBOTICS / OPUS v3 — scene 7: 07:00. The sky turns from night to morning while the clock runs
   from 00:20 to 07:00; Bogdan rolls into OR 2 for the first case. Beat 2: "Nobody noticed." */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('s-morning');
  const C = () => OPUS.clock24;
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const ALL = ['dawn', 'a', 'carm', 'card', 'b'];
  function settle(i) { clear(); el.classList.remove(...ALL); el.classList.add('dawn', 'carm', 'card', i ? 'b' : 'a'); C().set(7 * 60, 0); C().run(true); }
  OPUS.scene({ id: 'morning', el, beats: 2, theme: 'paper',
    enter(ctx) {
      clear(); el.classList.remove(...ALL);
      if (ctx.instant || !ctx.forward) { settle(0); return; }
      C().run(true);
      requestAnimationFrame(() => el.classList.add('dawn'));
      C().ff(7 * 60, 1700); A.sfx.shimmer(0.14, 1.8);
      later(1000, () => { el.classList.add('a'); A.sfx.chime(0.22, 523); });
      later(1350, () => { el.classList.add('carm'); A.sfx.boing(0.2); });
      later(1900, () => { el.classList.add('card'); A.sfx.pop(760, 0.16); });
    },
    beat(i, ctx) {
      if (ctx.instant) { settle(i); return; }
      clear(); el.classList.add('dawn', 'carm', 'card'); el.classList.remove('a'); el.classList.add('b');
      A.sfx.thump(0.3); later(900, () => A.sfx.sparkle(0.18));
    },
    leave() { clear(); return 0; },
  });
})();
