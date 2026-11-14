/* ALOHA ROBOTICS / OPUS v3 — scene 9: Every C-arm. Every night. → ALOHA ROBOTICS · Any technical questions? */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('s-outro');
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const FINAL = ['ou-logo', 'ou-tag', 'ou-q', 'ou-ketty', 'ou-foot'];
  const blockA = $('ou-a');
  const setA = (cls) => { blockA.classList.remove('in', 'out'); if (cls) blockA.classList.add(cls); };
  function wink() { const k = $('ou-ketty'); k.classList.add('winking'); A.sfx.sparkle(0.2); setTimeout(() => k.classList.remove('winking'), 420); }
  function show(i, animate) {
    clear();
    if (!animate) { setA(i === 0 ? 'in' : null); FINAL.forEach((id) => $(id).classList.toggle('show', i >= 1)); return; }
    if (i === 0) { setA(null); void blockA.offsetWidth; setA('in'); A.sfx.thump(0.4); later(760, () => A.sfx.chime(0.24, 660)); }
    if (i === 1) {
      setA('out');
      later(260, () => { $('ou-logo').classList.add('show'); A.sfx.hit(0.5); });
      later(420, () => { ['ou-tag', 'ou-q', 'ou-ketty', 'ou-foot'].forEach((id) => $(id).classList.add('show')); A.sfx.whoosh(0.9, 0.16, true); });
      later(2400, wink); later(5400, wink);
    }
  }
  OPUS.scene({ id: 'outro', el, beats: 2, theme: 'dark',
    enter(ctx) { clear(); setA(null); FINAL.forEach((id) => $(id).classList.remove('show', 'winking')); if (ctx.instant || !ctx.forward) { show(0, false); return; } later(250, () => show(0, true)); },
    beat(i, ctx) { show(i, !ctx.instant); },
    leave() { clear(); return 0; },
  });
})();
