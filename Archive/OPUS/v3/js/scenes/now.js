/* ALOHA ROBOTICS / OPUS v3 — scene 4: "Now." The old TV has just died. Silence, then one word.
   Next click: the word becomes the time — a ticking 15:20 — and the night begins. */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const el = document.getElementById('s-now');
  const now = document.getElementById('nw-now'), lab = document.getElementById('nw-lab');
  const C = () => OPUS.clock24;
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const set = (node, cls) => { node.classList.remove('in', 'out'); if (cls) node.classList.add(cls); };
  function show(i, animate) {
    clear();
    if (i === 0) {
      C().show(false); C().big(true); C().run(false); lab.classList.remove('in');
      if (!animate) { set(now, 'in'); return; }
      set(now, null); void now.offsetWidth; set(now, 'in'); A.sfx.thump(0.6);
      return;
    }
    set(now, 'out'); C().set(15 * 60 + 20, 0); C().big(true);
    if (!animate) { C().show(true); C().run(true); lab.classList.add('in'); return; }
    later(160, () => { C().show(true); A.sfx.thump(0.4); });
    later(500, () => { lab.classList.add('in'); C().run(true); });
  }
  OPUS.scene({ id: 'now', el, beats: 2, theme: 'dark',
    enter(ctx) {
      clear(); set(now, null); lab.classList.remove('in'); C().show(false); C().big(true);
      if (ctx.instant || !ctx.forward) { show(0, false); return; }
      later(ctx.from === 'tama' ? 880 : 120, () => show(0, true));
    },
    beat(i, ctx) { show(i, !ctx.instant); },
    leave(ctx) {
      clear(); lab.classList.remove('in');
      if (ctx.forward && ctx.to === 'calendar' && !ctx.instant) { C().big(false); return 0; }   // the clock flies to the corner
      if (ctx.to !== 'calendar') { C().show(false); }
      return 0;
    },
  });
})();
