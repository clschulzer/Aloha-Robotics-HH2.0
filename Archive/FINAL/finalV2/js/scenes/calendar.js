/* ALOHA ROBOTICS · FINAL v1 — the invisible: a real hospital day, a swarm of scouts, one golden window.
   Ported from ASTRA/versions/04-constellation (constellation.mjs + scoring/scenario.js) onto the OPUS engine.
   Same data and same scorer: the team's synthetic day (js/data/day.js) and golden.js on top of the rule core
   planner.js. Every scout that arrives at a candidate really calls golden.evaluate(). The window it settles on is
   the scorer's answer: Cio (C-03), 19:10–21:10, backup Fritzi (C-05).
   Decluttered on purpose (Marc's notes): no brand, no status chip, no roster line, no running captions. The date
   shows with the board, then gives way to "Care has right of way." Only what matters stays on screen. */
(function () {
  'use strict';
  const OPUS = window.OPUS, A = OPUS.audio, G = window.AlohaGolden, D = window.AlohaDay;
  const el = document.getElementById('s-calendar');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- the day and the answer (as in ASTRA 04's scenario.js) ---------- */
  const ids = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-08'];
  const devices = ids.map((id) => JSON.parse(JSON.stringify(D.DEVICES.find((d) => d.id === id))));
  const context = { now: D.NOW, horizon: D.HORIZON, rate: D.EMERGENCY_RATE, confirmers: D.CONFIRMERS, robotBusy: [], blocks: [] };
  const result = G.golden(devices, context);
  const best = result.best;
  const byId = new Map(devices.map((d) => [d.id, d]));
  const nameOf = (id) => (byId.get(id) || {}).name || id;

  /* ---------- the board (constellation.mjs geometry) ---------- */
  const frame = { x: 93, y: 313, w: 1734, h: 606, left: 265, t0: 420, t1: 1560 };
  const rx = (t) => frame.left + (t - frame.t0) / (frame.t1 - frame.t0) * (frame.w - frame.left - 28);
  const rowY = (i) => 20 + i * 91;
  const point = (c) => ({ x: frame.x + rx((c.from + c.to) / 2), y: frame.y + rowY(ids.indexOf(c.id)) + 45 });
  const winRect = (c) => ({ x: frame.x + rx(c.from), y: frame.y + rowY(ids.indexOf(c.id)) + 11, w: rx(c.to) - rx(c.from), h: 70 });
  const label = (p) => p.split(' · ')[0].toLowerCase().replace(/\b[a-z]/g, (x) => x.toUpperCase());
  const pool = result.all.filter((c) => c.reason !== 'current' && c.guardEnd <= frame.t1);

  el.innerHTML =
    `<h1 class="cl-title" id="cl-title"><span class="cur"></span><span></span></h1>` +
    `<div class="cl-sub" id="cl-sub">Illustrative hospital day · synthetic data</div>` +
    `<div class="const-day" id="cl-day"><div class="const-frame">` +
      Array.from({ length: 10 }, (_, i) => { const t = (8 + i * 2) * 60; return `<span class="const-axis" style="left:${rx(t)}px">${G.hh(t)}</span><i class="const-guide" style="left:${rx(t)}px"></i>`; }).join('') +
      devices.map((d, i) => `<div class="const-row" style="top:${rowY(i)}px"><div class="const-rowname"><b>${esc(d.name)}</b><small>${d.id === 'C-05' ? 'Reserve' : d.id === 'C-08' ? 'Emergency' : 'OR ' + (i + 1)}</small></div>` +
        d.cases.filter((c) => c.from < frame.t1 && c.to > frame.t0).map((c) => {
          const a = Math.max(frame.t0, c.from), b = Math.min(frame.t1, c.to);
          return `<div class="const-case ${c.to < context.now ? 'done' : ''}" style="left:${rx(a)}px;width:${rx(b) - rx(a) - 4}px"><b>${esc(label(c.proc))}</b></div>`;
        }).join('') + `</div>`).join('') +
      `<div class="const-now" style="left:${rx(context.now)}px"></div>` +
      `<div class="const-gold" id="cl-gold"><span></span><div class="const-tail"></div></div>` +
    `</div></div>` +
    `<canvas class="const-swarm" id="cl-swarm"></canvas>` +
    `<div class="cl-pub"><b>✓ Published</b><span>by medical physics · backup ${esc(nameOf(best.backup))}</span></div>` +
    `<div class="cl-ask">Who plugs <em>${esc(nameOf(best.id))}</em> in?</div>`;

  const goldEl = document.getElementById('cl-gold');
  (function placeGold() {
    const r = winRect(best);
    Object.assign(goldEl.style, { left: `${r.x - frame.x}px`, top: `${r.y - frame.y}px`, width: `${r.w}px` });
    goldEl.querySelector('span').textContent = `${G.hh(best.from)}–${G.hh(best.to)}`;
    goldEl.querySelector('.const-tail').style.width = `${rx(best.guardEnd) - rx(best.to)}px`;
  })();

  function title(html, animate) {
    const h = document.getElementById('cl-title'), spans = h.querySelectorAll('span');
    const cur = h.querySelector('span.cur') || spans[0], nxt = cur === spans[0] ? spans[1] : spans[0];
    if (cur.innerHTML === html) return;
    if (!animate) { spans.forEach((s) => s.classList.remove('cur', 'old')); cur.innerHTML = html; cur.classList.add('cur'); nxt.innerHTML = ''; return; }
    nxt.classList.remove('old'); nxt.innerHTML = html; void nxt.offsetWidth; cur.classList.remove('cur'); cur.classList.add('old'); nxt.classList.add('cur');
  }
  const TITLES = ['Wednesday, 18 November.', 'Care has right of way.', 'The <em>golden</em> window.', 'The <em>golden</em> window.'];

  /* ---------- the swarm (constellation.mjs drawSwarm) ---------- */
  const sl = OPUS.canvas(document.getElementById('cl-swarm')), sg = sl.ctx, rng = OPUS.rng(404);
  const agents = Array.from({ length: 144 }, (_, i) => ({ x: i % 2 ? -80 : 2000, y: 150 + rng() * 760, vx: 0, vy: 0, tx: 0, ty: 0, trail: [], alpha: 0, size: 0.62 + rng() * 0.42, wait: rng() * 0.6, candidate: null }));
  let hunting = false, gather = false, age = 0, rings = [], inspected = 0;
  function pick(a) { a.candidate = pool[Math.floor(rng() * pool.length)]; const p = point(a.candidate); a.tx = p.x + (rng() - 0.5) * 40; a.ty = p.y + (rng() - 0.5) * 30; a.wait = 0.12 + rng() * 0.22; }
  function hunt() {
    gather = false; hunting = true; age = 0; rings = [];
    agents.forEach((a, i) => { a.x = i % 2 ? -80 : 2000; a.y = 150 + rng() * 760; a.vx = a.vy = 0; a.alpha = 0; a.trail = []; pick(a); });
  }
  function gatherAt(c) {
    gather = true; hunting = false; age = 0;
    const r = winRect(c), per = 2 * (r.w + r.h);
    agents.forEach((a, i) => {
      let d = i / agents.length * per;
      if (d < r.w) { a.tx = r.x + d; a.ty = r.y - 7; } else if ((d -= r.w) < r.h) { a.tx = r.x + r.w + 7; a.ty = r.y + d; }
      else if ((d -= r.h) < r.w) { a.tx = r.x + r.w - d; a.ty = r.y + r.h + 7; } else { d -= r.w; a.tx = r.x - 7; a.ty = r.y + r.h - d; }
      a.wait = 0;
    });
    goldEl.classList.remove('on');
  }
  function halt() { hunting = gather = false; agents.forEach((a) => { a.alpha = 0; a.trail = []; }); sl.clear(); }
  function draw(dt) {
    sl.clear(); age += dt;
    if (gather && age > 0.55) goldEl.classList.add('on');
    if (gather && age > 3) { gather = false; agents.forEach((a) => { a.alpha = 0; a.trail = []; }); }
    for (const a of agents) {
      if (!hunting && !gather) a.alpha = Math.max(0, a.alpha - dt * 5);
      else {
        a.wait -= dt; const w = gather ? 10 : 7.7;
        a.vx += (w * w * (a.tx - a.x) - 1.8 * w * a.vx) * dt; a.vy += (w * w * (a.ty - a.y) - 1.8 * w * a.vy) * dt;
        a.x += a.vx * dt; a.y += a.vy * dt;
        const target = gather ? Math.max(0, 1 - (age - 0.6) / 0.9) : 0.75;
        a.alpha = Math.max(0, Math.min(0.8, a.alpha + (target - a.alpha) * Math.min(1, dt * 7)));
        if (hunting && a.wait <= 0 && Math.hypot(a.tx - a.x, a.ty - a.y) < 20) {
          const ev = G.evaluate(devices, byId.get(a.candidate.id), a.candidate.from, context); inspected++;      // a real check, every arrival
          rings.push({ x: a.x, y: a.y, age: 0, ok: ev.status === 'ok' }); if (rings.length > 50) rings.shift(); pick(a);
        }
      }
      if (a.alpha < 0.01 || reduced) continue;
      a.trail.push([a.x, a.y]); if (a.trail.length > 9) a.trail.shift();
      const rgb = gather ? '244,203,131' : '148,241,215';
      sg.beginPath(); a.trail.forEach(([x, y], i) => (i ? sg.lineTo(x, y) : sg.moveTo(x, y))); sg.strokeStyle = `rgba(${rgb},${a.alpha * 0.13})`; sg.lineWidth = 1; sg.stroke();
      sg.save(); sg.translate(a.x, a.y); sg.rotate(Math.atan2(a.vy, a.vx) + Math.PI / 2);
      const k = a.size * (gather ? Math.max(0.15, 1 - age * 0.5) : 1); sg.scale(k, k); sg.globalAlpha = a.alpha;
      sg.fillStyle = `rgba(${rgb},.28)`; sg.strokeStyle = `rgb(${rgb})`; sg.lineWidth = 1.3;
      sg.beginPath(); sg.moveTo(0, -9); sg.lineTo(6, 7); sg.lineTo(0, 3); sg.lineTo(-6, 7); sg.closePath(); sg.fill(); sg.stroke(); sg.restore();
    }
    for (const r of rings) {
      r.age += dt; if (r.age > 0.5) continue;
      sg.strokeStyle = r.ok ? `rgba(148,241,215,${(0.5 - r.age) * 0.4})` : `rgba(218,157,176,${(0.5 - r.age) * 0.5})`; sg.lineWidth = 1;
      sg.beginPath(); sg.arc(r.x, r.y, 5 + r.age * 25, 0, Math.PI * 2); sg.stroke();
    }
    rings = rings.filter((r) => r.age < 0.5);
  }

  /* ---------- beats: the date and the board · care has right of way (search) · the golden window · published, who plugs it in? ---------- */
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const setBeat = (i) => { for (let j = 0; j < 6; j++) el.classList.toggle('b' + j, j <= i); };
  const clearK = () => { for (let j = 0; j < 8; j++) el.classList.remove('k' + j); };
  let anims = [];
  function unfold() {
    if (reduced) return;
    el.style.perspective = '2100px';
    const day = document.getElementById('cl-day');
    const a = day.animate([{ transform: 'translateY(110px) rotateX(27deg) rotateZ(-2deg) scale(.86)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1450, easing: 'cubic-bezier(.16,1,.3,1)' });
    anims.push(a); a.finished.then(() => { el.style.perspective = 'none'; }).catch(() => {});
    el.querySelectorAll('.const-row').forEach((r, i) => anims.push(r.animate([{ transform: 'translateZ(-80px) translateY(42px) rotateX(14deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 960, delay: 180 + i * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })));
  }
  function play(i, anim) {
    title(TITLES[i], anim);
    if (i === 0) { halt(); goldEl.classList.remove('on'); if (anim) { unfold(); A.sfx.thump(0.3); } return; }
    el.classList.add('k2');                                                     // the date gives way
    if (i === 1) { goldEl.classList.remove('on'); hunt(); if (anim) A.sfx.whoosh(0.8, 0.1, true); return; }
    if (i === 2) { if (anim) { gatherAt(best); A.sfx.success(0.14); } else { halt(); goldEl.classList.add('on'); } return; }
    if (i === 3) {
      halt(); goldEl.classList.add('on');
      if (anim) { A.sfx.notify(0.24); later(1400, () => { el.classList.add('k5'); A.sfx.pop(620, 0.2); }); } else el.classList.add('k5');
    }
  }

  OPUS.scene({ id: 'calendar', el, beats: 4, theme: 'dark',
    enter(ctx) {
      clearTimers(); anims.forEach((a) => a.cancel()); anims = []; clearK(); setBeat(-1); el.style.perspective = 'none';
      if (ctx.instant || !ctx.forward) { setBeat(0); play(0, false); return; }
      void el.offsetWidth;
      requestAnimationFrame(() => { setBeat(0); play(0, true); });
    },
    beat(i, ctx) {
      clearTimers();
      if (ctx.instant) { clearK(); setBeat(i); for (let j = 0; j <= i; j++) play(j, false); if (i === 1) hunt(); return; }
      setBeat(i); play(i, true);
    },
    leave() { clearTimers(); halt(); return 0; },
    frame(dt) { if (hunting || gather || rings.length) draw(dt); },
  });

  OPUS.calendar = { best, inspected: () => inspected, pool: pool.length };
})();
