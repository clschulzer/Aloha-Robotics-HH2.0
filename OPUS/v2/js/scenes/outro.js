/* ALOHA ROBOTICS / OPUS v2 — scene 7: the close. Solutions, not numbers.
   Beats: 0 "Every C-arm. Always ready." · 1 "Nobody babysits a C-arm again." (the Tamagotchi,
   finally happy) · 2 ALOHA ROBOTICS · Any technical questions? (KettyBot winks). */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('s-outro');
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearT = () => { timers.forEach(clearTimeout); timers = []; };
  const blockA = $('ou-a'), blockB = $('ou-b'), bliss = $('ou-bliss');
  const FINAL = ['ou-logo', 'ou-tag', 'ou-q', 'ou-ketty', 'ou-foot'];
  const set = (node, cls) => { node.classList.remove('in', 'out'); if (cls) node.classList.add(cls); };

  function wink() { const k = $('ou-ketty'); k.classList.add('winking'); A.sfx.sparkle(0.2); setTimeout(() => k.classList.remove('winking'), 420); }
  function reset() { clearT(); [blockA, blockB, bliss].forEach((n) => set(n, null)); FINAL.forEach((id) => $(id).classList.remove('show', 'winking')); }

  function show(i, animate) {
    clearT();
    if (!animate) {
      set(blockA, i === 0 ? 'in' : null); set(blockB, i === 1 ? 'in' : null); set(bliss, i === 1 ? 'in' : null);
      FINAL.forEach((id) => $(id).classList.toggle('show', i >= 2));
      return;
    }
    if (i === 0) { set(blockA, null); void blockA.offsetWidth; set(blockA, 'in'); A.sfx.thump(0.4); later(760, () => A.sfx.chime(0.26, 660)); }
    if (i === 1) { set(blockA, 'out'); later(160, () => { set(blockB, 'in'); set(bliss, 'in'); A.sfx.sparkle(0.24); }); }
    if (i === 2) {
      set(blockB, 'out'); set(bliss, 'out');
      later(260, () => { $('ou-logo').classList.add('show'); A.sfx.hit(0.5); });
      later(420, () => { ['ou-tag', 'ou-q', 'ou-ketty', 'ou-foot'].forEach((id) => $(id).classList.add('show')); A.sfx.whoosh(0.9, 0.16, true); });
      later(2400, wink); later(5400, wink);
    }
  }

  OPUS.scene({ id: 'outro', el, beats: 3, theme: 'dark',
    enter(ctx) { reset(); if (ctx.instant || !ctx.forward) { show(0, false); return; } later(250, () => show(0, true)); },
    beat(i, ctx) { show(i, !ctx.instant); },
    leave() { clearT(); return 0; },
  });
})();
