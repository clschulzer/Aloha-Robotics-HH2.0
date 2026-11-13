/* ALOHA ROBOTICS / OPUS v2 — scene 4: the joke is over.
   The old TV has just switched off. Silence, then one word: "Now." Next click: "When?" and the
   four things a C-arm update needs at the same time. The calendar answers the question. */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const el = document.getElementById('s-now');
  const now = document.getElementById('nw-now'), when = document.getElementById('nw-when'), cond = document.getElementById('nw-cond');
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const set = (node, cls) => { node.classList.remove('in', 'out'); if (cls) node.classList.add(cls); };

  function show(i, animate) {
    clear();
    if (!animate) {
      set(now, i === 0 ? 'in' : 'out'); set(when, i === 1 ? 'in' : null); cond.classList.toggle('in', i === 1);
      return;
    }
    if (i === 0) { set(when, null); cond.classList.remove('in'); set(now, null); void now.offsetWidth; set(now, 'in'); A.sfx.thump(0.6); }
    if (i === 1) { set(now, 'out'); later(140, () => { set(when, 'in'); A.sfx.thump(0.45); }); later(260, () => cond.classList.add('in')); later(700, () => A.sfx.tick(0.05, 1500)); }
  }

  OPUS.scene({ id: 'now', el, beats: 2, theme: 'dark',
    enter(ctx) {
      set(now, null); set(when, null); cond.classList.remove('in'); clear();
      if (ctx.instant || !ctx.forward) { show(0, false); return; }
      later(ctx.from === 'tama' ? 880 : 120, () => show(0, true));   // let the CRT collapse and a beat of silence pass
    },
    beat(i, ctx) { show(i, !ctx.instant); },
    leave(ctx) {
      clear();
      if (ctx.forward && ctx.to === 'calendar' && !ctx.instant) { when.style.transition = 'none'; when.style.opacity = '0'; cond.classList.remove('in'); setTimeout(() => { when.style.transition = ''; when.style.opacity = ''; }, 600); }
      return 0;
    },
  });
})();
