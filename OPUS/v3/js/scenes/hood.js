/* ALOHA ROBOTICS / OPUS v3 — scene 8: under the hood, in three words. Brain · Hands · Heart.
   One word per click; the last click adds the rule that holds it together. */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const el = document.getElementById('s-hood');
  const set = (i) => { for (let j = 0; j < 3; j++) el.classList.toggle('b' + j, j <= i); };
  OPUS.scene({ id: 'hood', el, beats: 3, theme: 'dark',
    enter(ctx) { set(-1); if (ctx.instant || !ctx.forward) { set(0); return; } requestAnimationFrame(() => { set(0); A.sfx.thump(0.35); }); },
    beat(i, ctx) { set(i); if (!ctx.instant) { A.sfx.thump(0.32); if (i === 2) setTimeout(() => A.sfx.chime(0.24, 660), 700); } },
  });
})();
