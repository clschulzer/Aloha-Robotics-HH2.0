/* ALOHA ROBOTICS / OPUS v3 — the night clock. A 24-style digital clock that ticks in real seconds,
   fast-forwards between moments of the night, and lives top-right from "Now." to 07:00.
   API: OPUS.clock24.show(bool) · big(bool) · set(minutes, seconds) · run(bool) · ff(toMinutes, ms, done) */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('clock24'), H = $('ck-h'), Mi = $('ck-m'), S = $('ck-s');
  const st = { min: 15 * 60 + 20, sec: 0, running: false, ff: null, acc: 0 };
  const pad = (n) => String(n).padStart(2, '0');
  function draw() { const m = ((Math.floor(st.min) % 1440) + 1440) % 1440; H.textContent = pad(Math.floor(m / 60)); Mi.textContent = pad(m % 60); S.textContent = pad(Math.floor(st.sec) % 60); }
  draw();
  const api = {
    show(v) { el.classList.toggle('on', !!v); },
    big(v) { el.classList.toggle('big', !!v); },
    set(min, sec = 0) { st.ff = null; st.min = min; st.sec = sec; draw(); },
    run(v) { st.running = !!v; },
    get() { return st.min; },
    ff(to, ms, done) {
      const from = st.min; if (to < from) to += 1440;
      st.ff = { from, to, t: 0, dur: Math.max(0.2, ms / 1000), done, lastTick: 0 };
      el.classList.add('ffwd');
    },
  };
  OPUS.clock24 = api;
  OPUS.ticker.add((dt) => {
    if (st.ff) {
      const f = st.ff; f.t += dt;
      const k = Math.min(1, f.t / f.dur), e = M.easeInOut(k);
      st.min = Math.floor(M.lerp(f.from, f.to, e)); st.sec = (f.t * 997) % 60;
      if (f.t - f.lastTick > 0.05 && k < 1) { f.lastTick = f.t; A.sfx.tick(0.03, 2600 + k * 900); }
      if (k >= 1) { st.min = f.to % 1440; st.sec = 0; st.ff = null; el.classList.remove('ffwd'); f.done && f.done(); }
      draw(); return;
    }
    if (st.running) { st.acc += dt; if (st.acc >= 1) { st.acc -= 1; st.sec += 1; if (st.sec >= 60) { st.sec = 0; st.min += 1; } draw(); } }
  });
  // which scenes show the clock, and how
  const stage = $('stage');
  const MODE = { now: 'none', calendar: 'small', night: 'small', morning: 'small' };
  new MutationObserver(() => {
    const m = MODE[stage.dataset.scene] || 'none';
    if (m === 'none' && stage.dataset.scene !== 'now') { api.show(false); api.big(false); api.run(false); }
    if (m === 'small') { api.show(true); api.big(false); }
  }).observe(stage, { attributes: true, attributeFilter: ['data-scene'] });
})();
