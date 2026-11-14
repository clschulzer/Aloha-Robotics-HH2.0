/* ALOHA ROBOTICS / OPUS v2 — scene 6: how it works.
   The golden window from the calendar lands as a seed and the workflow grows out of it: one clean
   line, six steps, each step blooming with a few fine hyphae when the line reaches it. Then the
   loop closes (logs come home) and one pulse runs a full night through the system.
   Beats: 0 seed → FIND, grows back to SEE · 1 ASK, BRING (KettyBot) · 2 UPDATE (C-arm), REPORT, loop · 3 one full run. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('s-flow');
  const L = OPUS.canvas($('fl-cv'), { cap: 1.6 }), g = L.ctx;
  const LY = 540;
  const ICON = {
    see: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    find: '<path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z"/><path d="M19 17.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    ask: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M9.8 12.4l1.7 1.7 3-3.4"/>',
    bring: '<path d="M13 2L6 13.2h5.2L10 22l7.2-11.4H12L13 2z"/>',
    update: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 3.5v5h-5"/>',
    report: '<path d="M7 18.5a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 11a3.8 3.8 0 0 1-.6 7.5H7z"/><path d="M12 16v-5.6m-2.4 2.3L12 10.3l2.4 2.4"/>',
  };
  const NODES = [
    { id: 'see', x: 290, w: 'SEE', d: 'OR plan · device state<br>hospital + Siemens rules' },
    { id: 'find', x: 570, w: 'FIND', d: 'agents test every gap<br>the golden window wins', gold: true },
    { id: 'ask', x: 850, w: 'ASK', d: 'one question to the<br>one person on duty' },
    { id: 'bring', x: 1130, w: 'BRING', d: 'KettyBot brings power,<br>network + the package', ch: { src: 'ketty', w: 280, top: 222 } },
    { id: 'update', x: 1410, w: 'UPDATE', d: 'installs · verifies<br>rollback always ready', ch: { src: 'bliss', w: 300, top: 200 } },
    { id: 'report', x: 1690, w: 'REPORT', d: 'logs go home<br>to Siemens' },
  ];
  OPUS.flowSeed = { x: 570, y: LY };

  /* ---------- DOM ---------- */
  const host = $('fl-nodes');
  NODES.forEach((n) => {
    const d = document.createElement('div'); d.className = 'fl-node' + (n.gold ? ' gold' : '');
    d.style.left = n.x + 'px'; d.style.top = LY + 'px';
    d.innerHTML = `<div class="fl-dot"><svg viewBox="0 0 24 24">${ICON[n.id]}</svg></div><div class="fl-word">${n.w}</div><div class="fl-desc">${n.d}</div>`;
    host.appendChild(d); n.el = d;
    if (n.ch) {
      const c = document.createElement('div'); c.className = 'fl-char';
      Object.assign(c.style, { left: (n.x - n.ch.w / 2) + 'px', top: n.ch.top + 'px', width: n.ch.w + 'px', height: n.ch.w + 'px' });
      c.innerHTML = `<img alt="" src="assets/characters/${n.ch.src}.webp">`;
      host.appendChild(c); n.chEl = c;
    }
  });
  const byId = (id) => NODES.find((n) => n.id === id);

  /* ---------- paths ---------- */
  function line(x0, x1, step = 6) { const pts = []; const n = Math.max(2, Math.ceil(Math.abs(x1 - x0) / step)); for (let i = 0; i <= n; i++) pts.push([M.lerp(x0, x1, i / n), LY]); return pts; }
  function line2(x0, x1, y, step = 8) { const pts = []; const n = Math.max(2, Math.ceil(Math.abs(x1 - x0) / step)); for (let i = 0; i <= n; i++) pts.push([M.lerp(x0, x1, i / n), y]); return pts; }
  function bez(p0, p1, p2, p3, n) { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return pts; }
  const R = 46;   // node radius: lines stop at the rim
  const SEG = {
    left: line(570 - R, 290 + R),
    r1: line(570 + R, 850 - R), r2: line(850 + R, 1130 - R), r3: line(1130 + R, 1410 - R), r4: line(1410 + R, 1690 - R),
    loop: bez([1690 + R, LY], [1872, LY], [1872, 866], [1590, 866], 50).concat(line2(1590, 390, 866).slice(1), bez([390, 866], [60, 866], [60, LY], [290 - R, LY], 50).slice(1)),
  };
  const lenOf = (pts) => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; };
  Object.keys(SEG).forEach((k) => { SEG[k] = { pts: SEG[k], len: lenOf(SEG[k]), grown: 0, target: 0, onDone: null, dash: k === 'loop' }; });
  const FULL = ['left', 'r1', 'r2', 'r3', 'r4', 'loop'];

  /* ---------- hyphae: a few fine threads sprout around a node when the line reaches it ---------- */
  const hyphae = [];
  function sprout(n, gold) {
    const rnd = OPUS.rng(n.x);
    const count = 9;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rnd() * 0.5, len = 26 + rnd() * 46;
      const sx = n.x + Math.cos(a) * (R + 4), sy = LY + Math.sin(a) * (R + 4);
      const bend = (rnd() - 0.5) * 1.4;
      const pts = []; let x = sx, y = sy, ang = a;
      for (let k = 0; k < 14; k++) { ang += bend * 0.12 + (rnd() - 0.5) * 0.3; x += Math.cos(ang) * len / 14; y += Math.sin(ang) * len / 14; pts.push([x, y]); }
      if (Math.abs(Math.sin(a)) < 0.35) continue;      // keep the main line clean: no threads along it
      hyphae.push({ sx, sy, pts, t: 0, dur: 0.5 + rnd() * 0.3, gold });
    }
  }

  /* ---------- state ---------- */
  let timers = [], pulse = null, beat = 0;
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearT = () => { timers.forEach(clearTimeout); timers = []; };
  function bloom(id, animate) {
    const n = byId(id);
    n.el.classList.add('on');
    if (n.chEl) n.chEl.classList.add('on');
    if (!n.bloomed) { n.bloomed = true; sprout(n, !!n.gold); if (!animate) hyphae.forEach((h) => (h.t = h.dur)); }
    if (animate) { if (n.gold) A.sfx.chime(0.3, 880); else A.sfx.pop(560 + NODES.indexOf(n) * 70, 0.2); if (n.ch) setTimeout(() => A.sfx.boing(0.18), 120); }
  }
  function grow(key, animate, onDone) {
    const s = SEG[key]; s.target = s.len; s.onDone = onDone || null;
    if (!animate) { s.grown = s.len; if (onDone) onDone(false); s.onDone = null; }
  }
  function resetAll() {
    clearT(); pulse = null; hyphae.length = 0;
    Object.values(SEG).forEach((s) => { s.grown = 0; s.target = 0; s.onDone = null; });
    NODES.forEach((n) => { n.el.classList.remove('on', 'flash'); n.bloomed = false; if (n.chEl) n.chEl.classList.remove('on'); });
    $('fl-loop').classList.remove('show'); $('fl-caption').classList.remove('show');
    setTitle('How<b>?</b>', false);
    L.clear();
  }
  const title = $('fl-title');
  function setTitle(html, animate) {
    const spans = title.querySelectorAll('span'), cur = title.querySelector('span.cur') || spans[0], nxt = cur === spans[0] ? spans[1] : spans[0];
    if (cur.innerHTML === html) return;
    if (!animate) { spans.forEach((s) => s.classList.remove('cur', 'old')); cur.innerHTML = html; cur.classList.add('cur'); nxt.innerHTML = ''; return; }
    nxt.classList.remove('old'); nxt.innerHTML = html; void nxt.offsetWidth; cur.classList.remove('cur'); cur.classList.add('old'); nxt.classList.add('cur');
  }
  const FINAL = 'Agents propose<b>.</b> A human decides<b class="g">.</b>';

  /* each beat's part, animated (the beat being played) or settled (everything before it) */
  function part(k, anim) {
    if (k === 0) {
      bloom('find', anim);
      if (anim) { later(380, () => grow('left', true, () => bloom('see', true))); A.sfx.grow(0.1, 0.8); }
      else { grow('left', false); bloom('see', false); }
    }
    if (k === 1) {
      if (anim) { grow('r1', true, () => { bloom('ask', true); grow('r2', true, () => bloom('bring', true)); }); A.sfx.grow(0.1, 1.0); }
      else { grow('r1', false); bloom('ask', false); grow('r2', false); bloom('bring', false); }
    }
    if (k === 2) {
      if (anim) { grow('r3', true, () => { bloom('update', true); grow('r4', true, () => { bloom('report', true); later(150, () => grow('loop', true, () => { $('fl-loop').classList.add('show'); A.sfx.tick(0.08, 1800); })); }); }); A.sfx.grow(0.1, 1.4); }
      else { grow('r3', false); bloom('update', false); grow('r4', false); bloom('report', false); grow('loop', false); $('fl-loop').classList.add('show'); }
    }
    if (k === 3) {
      if (anim) { runPulse(); later(500, () => setTitle(FINAL, true)); later(900, () => $('fl-caption').classList.add('show')); }
      else { setTitle(FINAL, false); $('fl-caption').classList.add('show'); }
    }
  }
  function stepTo(i, animate) { for (let k = 0; k <= i; k++) part(k, animate && k === i); }
  // one gold pulse runs the whole loop: SEE → … → REPORT → home → SEE
  const ROUTE = (() => { const r = []; const push = (pts) => pts.forEach((p) => r.push(p)); push(SEG.left.pts.slice().reverse()); [['r1'], ['r2'], ['r3'], ['r4']].forEach(([k]) => push(SEG[k].pts)); push(SEG.loop.pts); return r; })();
  const ROUTE_LEN = lenOf(ROUTE);
  function runPulse() { pulse = { d: 0, speed: ROUTE_LEN / 2.6, lastNode: -1 }; A.sfx.whoosh(2.4, 0.08, true); }
  function pointAt(d) {
    let acc = 0;
    for (let i = 1; i < ROUTE.length; i++) { const l = Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); if (acc + l >= d) { const t = (d - acc) / (l || 1); return [M.lerp(ROUTE[i - 1][0], ROUTE[i][0], t), M.lerp(ROUTE[i - 1][1], ROUTE[i][1], t)]; } acc += l; }
    return ROUTE[ROUTE.length - 1];
  }

  /* ---------- frame ---------- */
  const TIP = OPUS.glow([120, 255, 240], 40, 0.2), GOLD = OPUS.glow([255, 210, 110], 48, 0.2);
  function drawPts(pts, upto, dash) {
    if (upto <= 0) return null;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    let acc = 0, last = pts[0];
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + l >= upto) { const t = (upto - acc) / (l || 1); last = [M.lerp(pts[i - 1][0], pts[i][0], t), M.lerp(pts[i - 1][1], pts[i][1], t)]; g.lineTo(last[0], last[1]); break; }
      acc += l; g.lineTo(pts[i][0], pts[i][1]); last = pts[i];
    }
    g.setLineDash(dash ? [10, 9] : []);
    g.strokeStyle = 'rgba(62,240,224,0.10)'; g.lineWidth = 10; g.stroke();
    g.strokeStyle = dash ? 'rgba(62,240,224,0.55)' : 'rgba(62,240,224,0.9)'; g.lineWidth = dash ? 2 : 2.6; g.stroke();
    g.setLineDash([]);
    return last;
  }
  function frame(dt) {
    L.clear();
    // hyphae (under the line)
    for (const h of hyphae) {
      h.t = Math.min(h.dur, h.t + dt);
      const k = M.easeOut(h.t / h.dur), n = Math.max(1, Math.floor(h.pts.length * k));
      g.beginPath(); g.moveTo(h.sx, h.sy); for (let i = 0; i < n; i++) g.lineTo(h.pts[i][0], h.pts[i][1]);
      g.strokeStyle = h.gold ? `rgba(255,199,74,${0.16 + 0.3 * (1 - k)})` : `rgba(62,240,224,${0.13 + 0.3 * (1 - k)})`;
      g.lineWidth = 1.1; g.stroke();
    }
    // lines
    for (const key of FULL) {
      const s = SEG[key];
      if (s.grown < s.target) {
        s.grown = Math.min(s.target, s.grown + dt * (key === 'loop' ? 1500 : 760) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, s.grown / s.len))));
        if (s.grown >= s.target && s.onDone) { const f = s.onDone; s.onDone = null; f(true); }
      }
      const tip = drawPts(s.pts, s.grown, s.dash);
      if (tip && s.grown < s.len) { g.globalCompositeOperation = 'lighter'; g.drawImage(TIP, tip[0] - 20, tip[1] - 20, 40, 40); g.globalCompositeOperation = 'source-over'; }
    }
    // the pulse
    if (pulse) {
      pulse.d += pulse.speed * dt;
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 14; k++) { const p = pointAt(Math.max(0, pulse.d - k * 9)); g.globalAlpha = 1 - k / 14; const s = 54 - k * 2.4; g.drawImage(GOLD, p[0] - s / 2, p[1] - s / 2, s, s); }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      const p = pointAt(pulse.d);
      NODES.forEach((n, idx) => { if (Math.abs(p[0] - n.x) < 30 && Math.abs(p[1] - LY) < 30 && pulse.lastNode !== idx) { pulse.lastNode = idx; n.el.classList.add('flash'); A.sfx.tick(0.07, 1500 + idx * 160); setTimeout(() => n.el.classList.remove('flash'), 380); } });
      if (pulse.d >= ROUTE_LEN) { pulse = null; byId('see').el.classList.add('flash'); setTimeout(() => byId('see').el.classList.remove('flash'), 500); A.sfx.success(0.22); }
    }
  }

  OPUS.scene({ id: 'flow', el, beats: 4, theme: 'dark',
    enter(ctx) {
      resetAll(); beat = 0;
      if (ctx.instant || !ctx.forward) { stepTo(0, false); return; }
      later(ctx.from === 'calendar' ? 1150 : 150, () => { if (beat === 0) stepTo(0, true); });
    },
    beat(i, ctx) {
      beat = i;
      if (ctx.instant) { resetAll(); stepTo(i, false); return; }
      stepTo(i, true);   // earlier parts settle instantly (also if the presenter clicked before the seed landed)
    },
    leave() { clearT(); pulse = null; return 0; },
    frame,
  });
})();
