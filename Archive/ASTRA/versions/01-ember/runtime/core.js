/* Copied from OPUS at 6a58092. ASTRA adds a pause-aware ticker; preserves its sound synthesis. */
/* ALOHA ROBOTICS / OPUS — core utilities: math, seeded randomness, glow sprites, stage-sized
   canvases, a single animation ticker, and a small WebAudio sound designer (no audio files).
   Classic script on purpose: the deck must also open from file:// without a server. */
(function () {
  'use strict';
  const OPUS = (window.OPUS = window.OPUS || {});
  const W = 1920, H = 1080;
  OPUS.W = W; OPUS.H = H;

  /* ---------- math ---------- */
  const M = (OPUS.math = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    inv: (a, b, v) => (v - a) / (b - a),
    smooth: (t) => t * t * (3 - 2 * t),
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeIn: (t) => t * t * t,
    easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    expOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    backOut: (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    elastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
  });
  M.seq = (t, a, b) => M.clamp((t - a) / (b - a), 0, 1);

  /* Deterministic RNG (mulberry32) so rehearsals look identical every run. */
  OPUS.rng = function (seed) {
    let a = seed >>> 0;
    const r = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.range = (lo, hi) => lo + (hi - lo) * r();
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.gauss = () => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    return r;
  };

  /* Cheap smooth 2D value noise for organic motion (curl-ish flow for embers and agents). */
  OPUS.noise = (function () {
    const p = new Uint8Array(512), r = OPUS.rng(1337);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 256; i++) p[i + 256] = p[i];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
    return function (x, y) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
      const u = fade(x), v = fade(y), a = p[X] + Y, b = p[X + 1] + Y;
      return M.lerp(M.lerp(grad(p[a], x, y), grad(p[b], x - 1, y), u), M.lerp(grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1), u), v);
    };
  })();

  /* ---------- colors ---------- */
  OPUS.color = {
    teal: [62, 240, 224], petrol: [0, 153, 153], orange: [236, 102, 2], gold: [255, 199, 74],
    red: [255, 59, 78], white: [245, 241, 234], paper: [243, 239, 230],
    rgba: (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`,
    mix: (c1, c2, t) => [M.lerp(c1[0], c2[0], t), M.lerp(c1[1], c2[1], t), M.lerp(c1[2], c2[2], t)],
  };

  /* Pre-rendered radial glow sprites, cached per color; drawing images is far cheaper than arcs. */
  const spriteCache = new Map();
  OPUS.glow = function (rgb, size = 64, hard = 0.18) {
    const key = rgb.join(',') + '|' + size + '|' + hard;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), r = size / 2, grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(255,255,255,1)`);
    grad.addColorStop(hard, OPUS.color.rgba(rgb, 0.95));
    grad.addColorStop(0.45, OPUS.color.rgba(rgb, 0.28));
    grad.addColorStop(1, OPUS.color.rgba(rgb, 0));
    g.fillStyle = grad; g.fillRect(0, 0, size, size);
    spriteCache.set(key, c);
    return c;
  };

  /* ---------- stage canvases ---------- */
  OPUS.stageScale = 1;
  const canvases = new Set();
  OPUS.canvas = function (el, opts) {
    const o = Object.assign({ cap: 1.5 }, opts || {});
    const cv = el.tagName === 'CANVAS' ? el : el.appendChild(document.createElement('canvas'));
    const ctx = cv.getContext('2d');
    const rec = { cv, ctx, k: 0, cap: o.cap, w: o.w || W, h: o.h || H, onResize: o.onResize || null };
    rec.fit = function () {
      const k = M.clamp(OPUS.stageScale * (window.devicePixelRatio || 1), 1, rec.cap);
      if (Math.abs(k - rec.k) < 0.01 && cv.width) return;
      rec.k = k; cv.width = Math.round(rec.w * k); cv.height = Math.round(rec.h * k);
      cv.style.width = rec.w + 'px'; cv.style.height = rec.h + 'px';
      ctx.setTransform(k, 0, 0, k, 0, 0);
      if (rec.onResize) rec.onResize();
    };
    rec.clear = function () { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(rec.k, 0, 0, rec.k, 0, 0); };
    rec.fit(); canvases.add(rec);
    return rec;
  };
  OPUS.fitCanvases = () => canvases.forEach((c) => { c.k = 0; c.fit(); });

  /* Sample the pixels of a text (or any drawing) into points: used for particle typography. */
  OPUS.samplePoints = function (draw, step, w = W, h = H) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g);
    const data = g.getImageData(0, 0, w, h).data, pts = [];
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { if (data[(y * w + x) * 4 + 3] > 140) pts.push([x + (Math.random() - 0.5) * step * 0.6, y + (Math.random() - 0.5) * step * 0.6]); }
    return pts;
  };

  /* ---------- one ticker for the whole deck ---------- */
  const subs = new Set();
  let last = performance.now();
  OPUS.ticker = { add: (fn) => subs.add(fn), remove: (fn) => subs.delete(fn) };
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    subs.forEach((fn) => { try { fn(OPUS.paused ? 0 : dt, t / 1000); } catch (e) { console.error(e); } });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* Scene-local timeline: schedule callbacks in seconds; cleared when a scene leaves. */
  OPUS.timeline = function () {
    let items = [], time = 0, running = false;
    const tl = {
      at(sec, fn) { items.push({ sec, fn, done: false }); return tl; },
      start() { time = 0; running = true; return tl; },
      stop() { running = false; items = []; return tl; },
      get time() { return time; },
      update(dt) { if (!running) return; time += dt; for (const it of items) if (!it.done && time >= it.sec) { it.done = true; it.fn(); } },
    };
    return tl;
  };

  /* ---------- sound design: everything synthesized, nothing to download ---------- */
  const A = (OPUS.audio = { ctx: null, master: null, muted: false, volume: 0.8 });
  A.unlock = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    A.ctx = new AC();
    A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : A.volume;
    const comp = A.ctx.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4;
    A.master.connect(comp); comp.connect(A.ctx.destination);
    A.noiseBuf = (function () { const n = A.ctx.sampleRate * 2, b = A.ctx.createBuffer(1, n, A.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; })();
    A.brownBuf = (function () { const n = A.ctx.sampleRate * 3, b = A.ctx.createBuffer(1, n, A.ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } return b; })();
  };
  A.setMuted = function (m) { A.muted = m; if (A.master) A.master.gain.setTargetAtTime(m ? 0 : A.volume, A.ctx.currentTime, 0.02); };
  const ok = () => A.ctx && A.ctx.state === 'running' && !A.muted;
  const env = (g, t0, a, peak, d, end = 0.0001) => { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(end, t0 + a + d); };
  function noise(buf, loop) { const s = A.ctx.createBufferSource(); s.buffer = buf || A.noiseBuf; s.loop = !!loop; return s; }
  function osc(type, f) { const o = A.ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
  function out(node, gain) { const g = A.ctx.createGain(); g.gain.value = gain; node.connect(g); g.connect(A.master); return g; }

  A.sfx = {
    /* the explosion keeps rumbling after the film's hard audio cut */
    boomTail(dur = 3.2, level = 0.55) {
      if (!ok()) return; const t = A.ctx.currentTime;
      const n = noise(A.brownBuf, true), lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(90, t + dur);
      const g = A.ctx.createGain(); g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(lp); lp.connect(g); g.connect(A.master); n.start(t); n.stop(t + dur + 0.1);
      const s = osc('sine', 52); s.frequency.exponentialRampToValueAtTime(32, t + dur * 0.7); const sg = A.ctx.createGain(); sg.gain.setValueAtTime(level * 0.8, t); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8); s.connect(sg); sg.connect(A.master); s.start(t); s.stop(t + dur);
      A.sfx.crackle(dur * 0.9, level * 0.6);
    },
    crackle(dur = 2.5, level = 0.4) {
      if (!ok()) return; const t0 = A.ctx.currentTime; const r = OPUS.rng(7);
      for (let i = 0; i < 70; i++) {
        const t = t0 + Math.pow(r(), 1.8) * dur; const n = noise(); const bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500 + r() * 5000; bp.Q.value = 2;
        const g = A.ctx.createGain(); env(g, t, 0.002, level * (0.2 + r() * 0.8) * (1 - (t - t0) / dur), 0.03 + r() * 0.05); n.connect(bp); bp.connect(g); g.connect(A.master); n.start(t, r() * 1.5); n.stop(t + 0.12);
      }
    },
    whoosh(dur = 1.6, level = 0.35, rise = true) {
      if (!ok()) return; const t = A.ctx.currentTime; const n = noise(null, true); const bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(rise ? 250 : 3000, t); bp.frequency.exponentialRampToValueAtTime(rise ? 3200 : 200, t + dur);
      const g = A.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
      n.connect(bp); bp.connect(g); g.connect(A.master); n.start(t); n.stop(t + dur + 0.1);
    },
    hit(level = 0.9) {
      if (!ok()) return; const t = A.ctx.currentTime;
      const s = osc('sine', 120); s.frequency.exponentialRampToValueAtTime(38, t + 0.45); const g = A.ctx.createGain(); env(g, t, 0.004, level, 0.9); s.connect(g); g.connect(A.master); s.start(t); s.stop(t + 1.1);
      const n = noise(); const hp = A.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500; const ng = A.ctx.createGain(); env(ng, t, 0.002, level * 0.45, 0.25); n.connect(hp); hp.connect(ng); ng.connect(A.master); n.start(t); n.stop(t + 0.4);
      [1046, 1568, 2093].forEach((f, i) => { const o = osc('sine', f); const og = A.ctx.createGain(); env(og, t, 0.01, level * 0.07 / (i + 1), 1.8); o.connect(og); og.connect(A.master); o.start(t); o.stop(t + 2); });
    },
    pop(f = 520, level = 0.35) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('sine', f * 1.8); o.frequency.exponentialRampToValueAtTime(f, t + 0.08); const g = A.ctx.createGain(); env(g, t, 0.004, level, 0.16); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.25);
    },
    boing(level = 0.3) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('triangle', 180); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.12); o.frequency.exponentialRampToValueAtTime(260, t + 0.35);
      const lfo = osc('sine', 18); const lg = A.ctx.createGain(); lg.gain.value = 30; lfo.connect(lg); lg.connect(o.frequency);
      const g = A.ctx.createGain(); env(g, t, 0.01, level, 0.45); o.connect(g); g.connect(A.master); o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5);
    },
    tick(level = 0.18, f = 2400) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('square', f); const g = A.ctx.createGain(); env(g, t, 0.001, level, 0.03); const hp = A.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200; o.connect(hp); hp.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.05);
    },
    sob(level = 0.25) {
      if (!ok()) return; const t = A.ctx.currentTime; [0, 0.18].forEach((d, i) => { const o = osc('sine', 660 - i * 90); o.frequency.exponentialRampToValueAtTime(330 - i * 40, t + d + 0.28); const g = A.ctx.createGain(); env(g, t + d, 0.02, level, 0.3); o.connect(g); g.connect(A.master); o.start(t + d); o.stop(t + d + 0.4); });
    },
    zap(level = 0.3) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('sawtooth', 1800); o.frequency.exponentialRampToValueAtTime(90, t + 0.35); const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; const g = A.ctx.createGain(); env(g, t, 0.005, level, 0.4); o.connect(lp); lp.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.45);
    },
    glitch(level = 0.25) {
      if (!ok()) return; const t0 = A.ctx.currentTime; const r = OPUS.rng(99);
      for (let i = 0; i < 9; i++) { const t = t0 + i * 0.045; const o = osc('square', 120 + r() * 1400); const g = A.ctx.createGain(); env(g, t, 0.002, level * r(), 0.035); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.05); }
    },
    sparkle(level = 0.22) {
      if (!ok()) return; const t0 = A.ctx.currentTime; [1318, 1760, 2093, 2637].forEach((f, i) => { const t = t0 + i * 0.06; const o = osc('sine', f); const g = A.ctx.createGain(); env(g, t, 0.005, level / (1 + i * 0.3), 0.7); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.8); });
    },
    chime(level = 0.4, f0 = 660) {
      if (!ok()) return; const t = A.ctx.currentTime; [1, 2.0, 2.76, 4.07, 5.4].forEach((m, i) => { const o = osc('sine', f0 * m); const g = A.ctx.createGain(); env(g, t + i * 0.012, 0.004, level / (1 + i * 0.9), 2.4 - i * 0.3); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 2.6); });
      A.sfx.sparkle(level * 0.4);
    },
    crtOff(level = 0.45) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('sawtooth', 3200); o.frequency.exponentialRampToValueAtTime(60, t + 0.42); const g = A.ctx.createGain(); env(g, t, 0.003, level * 0.6, 0.45); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.5);
      const n = noise(); const bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6000; const ng = A.ctx.createGain(); env(ng, t, 0.002, level * 0.5, 0.18); n.connect(bp); bp.connect(ng); ng.connect(A.master); n.start(t); n.stop(t + 0.3);
      const s = osc('sine', 70); const sg = A.ctx.createGain(); env(sg, t + 0.38, 0.005, level, 0.5); s.connect(sg); sg.connect(A.master); s.start(t + 0.38); s.stop(t + 1);
    },
    thump(level = 0.5) {
      if (!ok()) return; const t = A.ctx.currentTime; const o = osc('sine', 95); o.frequency.exponentialRampToValueAtTime(45, t + 0.2); const g = A.ctx.createGain(); env(g, t, 0.003, level, 0.25); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.3);
      const n = noise(); const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const ng = A.ctx.createGain(); env(ng, t, 0.002, level * 0.35, 0.08); n.connect(lp); lp.connect(ng); ng.connect(A.master); n.start(t); n.stop(t + 0.15);
    },
    alarm(level = 0.32) {
      if (!ok()) return; const t0 = A.ctx.currentTime; for (let i = 0; i < 4; i++) { const t = t0 + i * 0.26; const o = osc('square', i % 2 ? 740 : 988); const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; const g = A.ctx.createGain(); env(g, t, 0.01, level, 0.22); o.connect(lp); lp.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.25); }
    },
    shatter(level = 0.35) {
      if (!ok()) return; const t0 = A.ctx.currentTime; const r = OPUS.rng(5);
      for (let i = 0; i < 26; i++) { const t = t0 + r() * 0.35; const o = osc('sine', 2000 + r() * 4000); const g = A.ctx.createGain(); env(g, t, 0.002, level * r() * 0.5, 0.12 + r() * 0.2); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.4); }
      const n = noise(); const hp = A.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000; const ng = A.ctx.createGain(); env(ng, t0, 0.003, level * 0.6, 0.35); n.connect(hp); hp.connect(ng); ng.connect(A.master); n.start(t0); n.stop(t0 + 0.5);
    },
    notify(level = 0.3) {
      if (!ok()) return; const t = A.ctx.currentTime; [[988, 0], [1319, 0.11]].forEach(([f, d]) => { const o = osc('sine', f); const g = A.ctx.createGain(); env(g, t + d, 0.005, level, 0.5); o.connect(g); g.connect(A.master); o.start(t + d); o.stop(t + d + 0.6); });
    },
    tap(level = 0.3) {
      if (!ok()) return; const t = A.ctx.currentTime; const n = noise(); const bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 3; const g = A.ctx.createGain(); env(g, t, 0.001, level, 0.04); n.connect(bp); bp.connect(g); g.connect(A.master); n.start(t); n.stop(t + 0.08);
    },
    success(level = 0.3) {
      if (!ok()) return; const t0 = A.ctx.currentTime; [523, 659, 784, 1047].forEach((f, i) => { const t = t0 + i * 0.07; const o = osc('triangle', f); const g = A.ctx.createGain(); env(g, t, 0.01, level / (1 + i * 0.2), 0.9); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 1); });
    },
    shimmer(level = 0.22, dur = 2.4) {
      if (!ok()) return; const t = A.ctx.currentTime; [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, i) => { const o = osc('sine', f); const o2 = osc('sine', f * 1.003); const g = A.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level / (2 + i), t + 0.6 + i * 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); o2.connect(g); g.connect(A.master); o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1); });
    },
    grow(level = 0.12, dur = 1.6) {
      if (!ok()) return; const t0 = A.ctx.currentTime; const r = OPUS.rng(11);
      for (let i = 0; i < 26; i++) { const t = t0 + r() * dur; const o = osc('sine', 300 + r() * 900); const g = A.ctx.createGain(); env(g, t, 0.01, level * (0.3 + r() * 0.7), 0.25); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.3); }
    },
    heartbeat(level = 0.5) {
      if (!ok()) return; const t = A.ctx.currentTime; [0, 0.22].forEach((d, i) => { const o = osc('sine', 62 - i * 6); const g = A.ctx.createGain(); env(g, t + d, 0.006, level * (i ? 0.7 : 1), 0.22); o.connect(g); g.connect(A.master); o.start(t + d); o.stop(t + d + 0.3); });
    },
  };

  /* A loop for the swarm: band-limited buzz with a fast tremolo; returns a stop() function. */
  A.buzz = function (level = 0.08) {
    if (!ok()) return () => {};
    const t = A.ctx.currentTime, n = noise(null, true), bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 6;
    const g = A.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level, t + 0.4);
    const trem = osc('sine', 23), tg = A.ctx.createGain(); tg.gain.value = level * 0.6; trem.connect(tg); tg.connect(g.gain);
    const sweep = osc('sine', 0.37), sg = A.ctx.createGain(); sg.gain.value = 180; sweep.connect(sg); sg.connect(bp.frequency);
    n.connect(bp); bp.connect(g); g.connect(A.master); n.start(t); trem.start(t); sweep.start(t);
    return function stop(fade = 0.5) { const s = A.ctx.currentTime; g.gain.cancelScheduledValues(s); g.gain.setValueAtTime(g.gain.value, s); g.gain.exponentialRampToValueAtTime(0.0001, s + fade); [n, trem, sweep].forEach((x) => x.stop(s + fade + 0.05)); };
  };

  window.addEventListener('keydown', () => A.unlock(), { capture: true });
  window.addEventListener('pointerdown', () => A.unlock(), { capture: true });
})();
