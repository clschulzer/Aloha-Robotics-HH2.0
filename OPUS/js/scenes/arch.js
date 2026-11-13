/* ALOHA ROBOTICS / OPUS — scene 6: the architecture grows like mycelium.
   One spore (the Aloha core) germinates; hyphae reach the hospital, Siemens, the parked C-arm and
   the people who decide. Data flows as pulses along the network. Deterministic (seeded) growth,
   drawn incrementally on a persistent canvas so it stays smooth on projector laptops. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const el = document.getElementById('s-arch');
  const layer = document.getElementById('ar-layer');
  const CORE = { x: 960, y: 455 };
  const C = { teal: [62, 240, 224], orange: [255, 138, 61], gold: [255, 199, 74], white: [220, 255, 250], power: [255, 214, 90] };

  /* ---------- the nodes ---------- */
  const NODES = [
    { id: 'or', g: 1, x: 520, y: 240, side: 'lt', col: 'teal', t: 'OR PLAN', s: 'room + time only · no patient data' },
    { id: 'roster', g: 1, x: 445, y: 455, side: 'lt', col: 'teal', t: 'DUTY ROSTER', s: 'who is awake to confirm' },
    { id: 'alarm', g: 1, x: 520, y: 670, side: 'lt', col: 'red', t: 'TRAUMA ALARM', s: 'pre-alert → instant re-plan' },
    { id: 'fleet', g: 2, x: 1420, y: 196, side: 'rt', col: 'orange', t: 'TEAMPLAY FLEET', s: 'signed packages · recalls · status' },
    { id: 'backend', g: 2, x: 1500, y: 318, side: 'rt', col: 'orange', t: 'SERVICE BACKEND', s: 'logs come home → predictive service' },
    { id: 'companion', g: 3, x: 470, y: 900, side: 'lt', col: 'teal', t: 'COMPANION', s: 'battery box · same job, no wheels' },
    { id: 'medphys', g: 4, x: 1470, y: 528, side: 'rt', col: 'gold', t: 'MEDICAL PHYSICS', s: 'approves the window' },
    { id: 'it', g: 4, x: 1525, y: 640, side: 'rt', col: 'gold', t: 'IT ON CALL', s: 'confirms the start · remotely' },
    { id: 'nurse', g: 4, x: 1470, y: 752, side: 'rt', col: 'gold', t: 'OR NURSE', s: 'never asked to decide' },
  ];
  const KETTY = { x: 800, y: 838, w: 205, from: 540 };
  const CARM = { x: 1122, y: 846, w: 215 };
  const GROUPS = [
    { g: 1, x: 112, y: 168, t: 'HOSPITAL', col: '#41d9cb' },
    { g: 2, x: 1420, y: 128, t: 'SIEMENS HEALTHINEERS', col: '#ff9a55' },
    { g: 4, x: 1470, y: 462, t: 'PEOPLE · ONE QUESTION EACH', col: '#ffcf6a' },
    { g: 3, x: 112, y: 832, t: 'AT THE DEVICE', col: '#41d9cb' },
  ];
  const AGENTS = ['SCOUT', 'SENTINEL', 'COURIER', 'GUARDIAN', 'INTERPRETER', 'RULES = CODE'];

  /* DOM */
  const mk = (cls, html, css) => { const n = document.createElement('div'); n.className = cls; if (html != null) n.innerHTML = html; Object.assign(n.style, css || {}); layer.appendChild(n); return n; };
  const core = mk('ar-core', '<b>ALOHA</b><span>CORE</span>', { left: CORE.x + 'px', top: CORE.y + 'px' });
  const coreSub = mk('ar-core-sub', 'device twin · calendar · audit log', { left: CORE.x + 'px', top: (CORE.y + 178) + 'px' });
  const agentEls = AGENTS.map((a, i) => { const n = mk('ar-agent', a); if (i === 5) { n.style.color = '#ffd2b0'; n.style.borderColor = 'rgba(255,138,61,.6)'; n.style.background = 'rgba(40,18,6,.9)'; } return n; });
  const nodeEls = {};
  NODES.forEach((n) => {
    const e = mk('ar-node ' + (n.side === 'lt' ? 'r' : ''), `<i class="ar-dot"></i><div class="ar-txt"><b>${n.t}</b><small>${n.s}</small></div>`, { left: n.x + 'px', top: n.y + 'px' });
    e.style.transform = n.side === 'lt' ? 'translate(calc(-100% + 11px), -50%)' : 'translate(-11px, -50%)';
    const col = n.col === 'red' ? '#ff5a6a' : n.col === 'orange' ? '#ff8a3d' : n.col === 'gold' ? '#ffc74a' : '#3ef0e0';
    e.querySelector('.ar-dot').style.setProperty('--c', col);
    nodeEls[n.id] = e;
  });
  const groupEls = GROUPS.map((gr) => { const e = mk('ar-group', gr.t, { left: gr.x + 'px', top: gr.y + 'px' }); e.style.setProperty('--c', gr.col); e.dataset.g = gr.g; return e; });
  const ketty = mk('ar-img', '<img class="main" alt="KettyBot" src="assets/characters/ketty.webp">', { left: KETTY.from + 'px', top: KETTY.y + 'px', width: KETTY.w + 'px', height: KETTY.w + 'px', transition: 'opacity .4s ease, left 1.3s cubic-bezier(.3,0,.2,1)' });
  const carm = mk('ar-img', '<img class="main" alt="Parked C-arm" src="assets/characters/lonely.webp"><img class="alt" alt="" src="assets/characters/bliss.webp">', { left: CARM.x + 'px', top: CARM.y + 'px', width: CARM.w + 'px', height: CARM.w + 'px' });
  const kLabel = mk('ar-node', '<div class="ar-txt" style="text-align:center"><b>KETTYBOT</b><small>power · package · guard · logs</small></div>', { left: KETTY.x + 'px', top: (KETTY.y + 136) + 'px' });
  const cLabel = mk('ar-node', '<div class="ar-txt" style="text-align:center"><b>C-ARM · UNCHANGED</b><small>zero modifications</small></div>', { left: CARM.x + 'px', top: (CARM.y + 136) + 'px' });
  const tags = [
    mk('ar-tag', '⚡ POWER', { left: '958px', top: '806px' }),
    mk('ar-tag', '⇅ PACKAGE + LOGS', { left: '952px', top: '756px' }),
    mk('ar-tag', '✓ AREA CLEAR', { left: (CARM.x + 56) + 'px', top: (CARM.y - 136) + 'px' }),
  ];
  tags[0].style.setProperty('--c', '#ffd65a'); tags[1].style.setProperty('--c', '#ff9a55');
  const qChips = ['medphys', 'it', 'nurse'].map((id, i) => { const n = NODES.find((x) => x.id === id); return mk('ar-q', i === 2 ? 'ZERO DECISIONS' : '1 TAP', { left: (n.x - 64) + 'px', top: (n.y - 26) + 'px' }); });

  /* ---------- hyphae ---------- */
  const grow = OPUS.canvas(document.getElementById('ar-grow'), { cap: 1.5, onResize: () => redraw() });
  const fx = OPUS.canvas(document.getElementById('ar-fx'), { cap: 1.5 });
  const gg = grow.ctx, fg = fx.ctx;
  const SPR = { teal: OPUS.glow(C.teal, 32), orange: OPUS.glow(C.orange, 32), gold: OPUS.glow(C.gold, 32), white: OPUS.glow([255, 255, 255], 32, 0.3), power: OPUS.glow(C.power, 32) };

  function edge(x, y, tx, ty, rad) { const a = Math.atan2(ty - y, tx - x); return [x + Math.cos(a) * rad, y + Math.sin(a) * rad]; }
  function makeHypha(x0, y0, x1, y1, seed, opts) {
    const r = OPUS.rng(seed), o = Object.assign({ step: 6, branchP: 0.07, branchLen: 120, w0: 2.6, col: C.teal, speed: 520 }, opts);
    const pts = [[x0, y0]]; let x = x0, y = y0, dir = Math.atan2(y1 - y0, x1 - x0) + (r() - 0.5) * 0.9, wob = 0, guard = 0;
    const branches = [];
    while (Math.hypot(x1 - x, y1 - y) > o.step * 1.5 && guard++ < 3000) {
      const want = Math.atan2(y1 - y, x1 - x); let d = want - dir; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const rem = Math.hypot(x1 - x, y1 - y);
      wob = wob * 0.84 + (r() - 0.5) * 0.95;
      dir += d * (rem < 110 ? 0.42 : 0.13) + wob * 0.2;
      x += Math.cos(dir) * o.step; y += Math.sin(dir) * o.step; pts.push([x, y]);
      if (pts.length > 8 && rem > 70 && r() < o.branchP) branches.push(makeBranch(x, y, dir + (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.9), r, o.branchLen * (0.35 + r() * 0.9), pts.length - 1, 0, o));
    }
    pts.push([x1, y1]);
    return { pts, branches, o, done: 0, prog: 0, active: false, len: pts.length };
  }
  function makeBranch(x, y, dir, r, len, at, depth, o) {
    const pts = [[x, y]]; let n = Math.max(4, Math.floor(len / 5)), wob = 0; const subs = [];
    for (let i = 0; i < n; i++) {
      wob = wob * 0.8 + (r() - 0.5) * 1.1; dir += wob * 0.25; const st = 5 * (1 - (i / n) * 0.5);
      x += Math.cos(dir) * st; y += Math.sin(dir) * st; pts.push([x, y]);
      if (depth < 1 && i > 3 && r() < 0.06) subs.push(makeBranch(x, y, dir + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.7), r, len * 0.45, i, depth + 1, o));
    }
    return { pts, at, subs, done: 0, depth, len: pts.length };
  }

  const LINKS = [];
  function link(g, from, to, seed, opts) { const h = makeHypha(from[0], from[1], to[0], to[1], seed, opts); h.g = g; h.from = from; h.to = to; LINKS.push(h); return h; }
  const nodeXY = (id) => { const n = NODES.find((x) => x.id === id); return [n.x, n.y]; };
  const L = {};
  NODES.forEach((n, i) => {
    const col = n.g === 2 ? C.orange : n.g === 4 ? C.gold : C.teal;
    L[n.id] = link(n.g, edge(CORE.x, CORE.y, n.x, n.y, 100), [n.x, n.y], 100 + i * 37, { col, branchP: n.g === 3 ? 0.05 : 0.075 });
  });
  L.ketty = link(3, edge(CORE.x, CORE.y, KETTY.x, KETTY.y - 96, 100), [KETTY.x + 8, KETTY.y - 92], 991, { col: C.teal, w0: 3 });
  L.cable = link(3, [KETTY.x + 86, KETTY.y + 10], [CARM.x - 84, CARM.y + 22], 1203, { col: C.power, w0: 3.4, branchP: 0.0, step: 5, speed: 240 });
  // germination: short hyphae around the core
  const SPORES = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.3, r = OPUS.rng(7 + i); SPORES.push(Object.assign(makeBranch(...edge(CORE.x, CORE.y, CORE.x + Math.cos(a), CORE.y + Math.sin(a), 102), a, r, 50 + r() * 70, 0, 0, {}), { g: 0, col: C.teal })); }
  // slow background growth that keeps spreading
  const WILD = [];
  function wild(h, k) { const r = OPUS.rng(500 + k * 13 + LINKS.indexOf(h)); for (let i = 0; i < 4; i++) { const idx = Math.floor((0.2 + r() * 0.7) * h.pts.length); const [x, y] = h.pts[idx]; const prev = h.pts[Math.max(0, idx - 1)]; const dir = Math.atan2(y - prev[1], x - prev[0]) + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.9); const b = makeBranch(x, y, dir, r, 90 + r() * 170, 0, 0, {}); b.col = h.o.col; b.wild = true; b.speed = 55 + r() * 35; WILD.push(b); } }

  /* ---------- drawing ---------- */
  function seg(ctx, a, b, w, col, alpha) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = OPUS.color.rgba(col, alpha * 0.10); ctx.lineWidth = w * 4.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = OPUS.color.rgba(col, alpha); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  function drawRange(h, from, to) { const n = h.len; for (let i = Math.max(1, from); i <= to && i < n; i++) seg(gg, h.pts[i - 1], h.pts[i], h.o.w0 * (1 - 0.5 * i / n) + 0.5, h.o.col, 0.85); }
  function drawBranch(b, col, from, to, alpha) { const n = b.len; for (let i = Math.max(1, from); i <= to && i < n; i++) seg(gg, b.pts[i - 1], b.pts[i], (b.depth ? 0.8 : 1.25) * (1 - 0.6 * i / n) + 0.35, col, alpha); }
  gg.lineCap = 'round'; gg.lineJoin = 'round';

  let beat = -1, T = 0, pulses = [], tips = [], groupAt = {};
  function activate(g, instant) {
    groupAt[g] = T;
    LINKS.filter((h) => h.g === g).forEach((h, i) => {
      h.active = true; h.delay = instant ? 0 : (h === L.cable ? 1.25 : i * 0.16);
      if (instant) { h.prog = 1; drawRange(h, 1, h.len - 1); h.done = h.len - 1; h.branches.forEach((b) => { drawBranch(b, h.o.col, 1, b.len - 1, 0.5); b.done = b.len - 1; b.subs.forEach((s) => { drawBranch(s, h.o.col, 1, s.len - 1, 0.35); s.done = s.len - 1; }); }); }
    });
  }
  function redraw() { // after a resize the backing store is new: repaint everything grown so far
    grow.clear(); gg.lineCap = 'round'; gg.lineJoin = 'round';
    SPORES.forEach((b) => { if (b.done) drawBranch(b, b.col, 1, b.done, 0.45); });
    LINKS.forEach((h) => { if (h.done) { drawRange(h, 1, h.done); h.branches.forEach((b) => { if (b.done) drawBranch(b, h.o.col, 1, b.done, 0.5); b.subs.forEach((s) => { if (s.done) drawBranch(s, h.o.col, 1, s.done, 0.35); }); }); } });
    WILD.forEach((b) => { if (b.done) drawBranch(b, b.col, 1, b.done, 0.22); });
  }
  function resetAll() {
    grow.clear(); fx.clear(); pulses = []; tips = []; WILD.length = 0; groupAt = {};
    LINKS.forEach((h) => { h.active = false; h.prog = 0; h.done = 0; h.branches.forEach((b) => { b.done = 0; b.subs.forEach((s) => (s.done = 0)); }); h.wilded = false; });
    SPORES.forEach((b) => (b.done = 0));
    [core, coreSub, ...agentEls, ...Object.values(nodeEls), ...groupEls, ketty, carm, kLabel, cLabel, ...tags, ...qChips].forEach((e) => e.classList.remove('show', 'happy'));
    el.querySelector('.ar-head').classList.remove('final');
    ketty.style.left = KETTY.from + 'px';
  }

  function show(i, instant) {
    if (i >= 0) { core.classList.add('show'); coreSub.classList.add('show'); agentEls.forEach((e, k) => instant ? e.classList.add('show') : setTimeout(() => e.classList.add('show'), 500 + k * 110)); if (instant) SPORES.forEach((b) => { drawBranch(b, b.col, 1, b.len - 1, 0.45); b.done = b.len - 1; }); }
    const groupDom = (g, delay) => {
      groupEls.filter((e) => +e.dataset.g === g).forEach((e) => instant ? e.classList.add('show') : setTimeout(() => e.classList.add('show'), delay));
      NODES.filter((n) => n.g === g).forEach((n, k) => instant ? nodeEls[n.id].classList.add('show') : setTimeout(() => nodeEls[n.id].classList.add('show'), delay + 650 + k * 160));
    };
    if (i >= 1 && (instant || i === 1)) { activate(1, instant); groupDom(1, 100); }
    if (i >= 2 && (instant || i === 2)) { activate(2, instant); groupDom(2, 100); }
    if (i >= 3 && (instant || i === 3)) {
      groupDom(3, 100);
      ketty.classList.add('show'); carm.classList.add('show');
      if (instant) { ketty.style.transition = 'none'; ketty.style.left = KETTY.x + 'px'; requestAnimationFrame(() => (ketty.style.transition = '')); kLabel.classList.add('show'); cLabel.classList.add('show'); tags.forEach((t) => t.classList.add('show')); carm.classList.add('happy'); }
      else {
        requestAnimationFrame(() => (ketty.style.left = KETTY.x + 'px'));
        setTimeout(() => kLabel.classList.add('show'), 900); setTimeout(() => cLabel.classList.add('show'), 600);
        [1500, 1900, 2350].forEach((t, k) => setTimeout(() => { tags[k].classList.add('show'); A.sfx.pop(600 + k * 120, 0.18); }, t));
        setTimeout(() => { carm.classList.add('happy'); A.sfx.sparkle(0.25); }, 2350);
      }
      activate(3, instant);
    }
    if (i >= 4 && (instant || i === 4)) {
      activate(4, instant); groupDom(4, 100);
      qChips.forEach((q, k) => instant ? q.classList.add('show') : setTimeout(() => q.classList.add('show'), 1200 + k * 200));
      const head = el.querySelector('.ar-head');
      if (instant) head.classList.add('final'); else setTimeout(() => { head.classList.add('final'); A.sfx.heartbeat(0.4); }, 2000);
    }
    if (!instant) A.sfx.grow(0.1, 1.4);
  }

  /* pulses travel along finished links: data in, packages out, logs home, questions & approvals */
  function spawnPulses(dt) {
    const want = [
      [1, 'or', -1, 'teal', 1.1], [1, 'roster', -1, 'teal', 1.6], [1, 'alarm', -1, 'teal', 2.2],
      [2, 'fleet', -1, 'orange', 1.0], [2, 'backend', 1, 'teal', 1.3],
      [3, 'ketty', 1, 'orange', 1.2], [3, 'ketty', -1, 'teal', 1.5], [3, 'cable', 1, 'power', 0.45], [3, 'companion', 1, 'orange', 1.8],
      [4, 'medphys', 1, 'gold', 1.6], [4, 'medphys', -1, 'white', 1.6], [4, 'it', 1, 'gold', 2.1], [4, 'nurse', 1, 'gold', 3.2],
    ];
    for (const [g, id, dir, col, every] of want) {
      const h = L[id]; if (!h.active || h.prog < 1 || groupAt[g] == null) continue;
      h._acc = (h._acc || 0) + dt;
      if (h._acc > every) { h._acc = 0; pulses.push({ h, s: dir > 0 ? 0 : 1, dir, col, v: id === 'cable' ? 0.9 : 0.55 + Math.random() * 0.2 }); }
    }
  }
  function at(h, s) { const f = s * (h.len - 1), i = Math.floor(f), t = f - i; const a = h.pts[M.clamp(i, 0, h.len - 1)], b = h.pts[M.clamp(i + 1, 0, h.len - 1)]; return [M.lerp(a[0], b[0], t), M.lerp(a[1], b[1], t)]; }

  OPUS.scene({ id: 'arch', el, beats: 5, theme: 'dark',
    enter(ctx) {
      resetAll(); beat = 0; el.classList.remove('collapse');
      if (ctx.instant) { show(0, true); return; }
      const seeded = ctx.from === 'swarm';
      setTimeout(() => { if (beat === 0) { show(0, false); A.sfx.heartbeat(0.3); } }, seeded ? 1020 : 0);
    },
    beat(i, ctx) {
      if (ctx.instant) { resetAll(); show(i, true); beat = i; return; }
      if (!core.classList.contains('show')) show(0, false);
      beat = i; show(i, false);
    },
    leave(ctx) { if (ctx.forward && ctx.to === 'outro' && !ctx.instant) { el.classList.add('collapse'); return 900; } el.classList.remove('collapse'); return 0; },
    frame(dt) {
      T += dt;
      gg.lineCap = 'round'; gg.lineJoin = 'round';
      // germination
      for (const b of SPORES) if (core.classList.contains('show') && b.done < b.len - 1) { const nd = Math.min(b.len - 1, b.done + Math.ceil(dt * 18)); drawBranch(b, b.col, b.done + 1, nd, 0.45); b.done = nd; }
      // main hyphae
      tips = [];
      for (const h of LINKS) {
        if (!h.active) continue;
        if (h.delay > 0) { h.delay -= dt; continue; }
        if (h.done < h.len - 1) {
          const nd = Math.min(h.len - 1, h.done + Math.max(1, Math.round((h.o.speed * dt) / h.o.step)));
          drawRange(h, h.done + 1, nd); h.done = nd; h.prog = h.done / (h.len - 1);
          tips.push({ p: h.pts[h.done], col: h.o.col });
          if (h.done >= h.len - 1 && !h.wilded) { h.wilded = true; wild(h, LINKS.indexOf(h)); if (h === L.cable) A.sfx.thump(0.35); }
        }
        for (const b of h.branches) {
          if (h.done < b.at) continue;
          if (b.done < b.len - 1) { const nd = Math.min(b.len - 1, b.done + Math.max(1, Math.round(dt * 26))); drawBranch(b, h.o.col, b.done + 1, nd, 0.5); b.done = nd; if (nd < b.len - 1) tips.push({ p: b.pts[nd], col: h.o.col, small: true }); }
          for (const s of b.subs) { if (b.done < s.at) continue; if (s.done < s.len - 1) { const nd = Math.min(s.len - 1, s.done + Math.max(1, Math.round(dt * 22))); drawBranch(s, h.o.col, s.done + 1, nd, 0.35); s.done = nd; } }
        }
      }
      for (const b of WILD) { if (b.done < b.len - 1) { b._acc = (b._acc || 0) + dt * b.speed / 5; const steps = Math.floor(b._acc); if (steps > 0) { b._acc -= steps; const nd = Math.min(b.len - 1, b.done + steps); drawBranch(b, b.col, b.done + 1, nd, 0.22); b.done = nd; } } }
      spawnPulses(dt);
      // fx layer
      fx.clear(); fg.globalCompositeOperation = 'lighter';
      const breath = 0.5 + 0.5 * Math.sin(T * 2.2);
      if (core.classList.contains('show')) { fg.globalAlpha = 0.35 + 0.25 * breath; const s = 360 + breath * 40; fg.drawImage(SPR.teal, CORE.x - s / 2, CORE.y - s / 2, s, s); }
      for (const tp of tips) { const s = tp.small ? 12 : 22; fg.globalAlpha = 0.95; fg.drawImage(tp.col === C.orange ? SPR.orange : tp.col === C.gold ? SPR.gold : tp.col === C.power ? SPR.power : SPR.white, tp.p[0] - s / 2, tp.p[1] - s / 2, s, s); }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.s += (p.dir * p.v * dt * 240) / Math.max(60, p.h.len * p.h.o.step) * 2;
        if (p.s < 0 || p.s > 1) { pulses.splice(i, 1); continue; }
        const [x, y] = at(p.h, p.s), spr = SPR[p.col] || SPR.teal;
        for (let k = 0; k < 4; k++) { const [tx2, ty2] = at(p.h, M.clamp(p.s - p.dir * k * 0.012, 0, 1)); const s = 16 - k * 3; fg.globalAlpha = 0.9 - k * 0.2; fg.drawImage(spr, tx2 - s / 2, ty2 - s / 2, s, s); }
        fg.globalAlpha = 1; fg.drawImage(SPR.white, x - 4, y - 4, 8, 8);
      }
      fg.globalAlpha = 1; fg.globalCompositeOperation = 'source-over';
      // agents orbit the core
      if (core.classList.contains('show')) agentEls.forEach((e, k) => { const a = T * 0.22 + (k / AGENTS.length) * Math.PI * 2; e.style.left = (CORE.x + Math.cos(a) * 218) + 'px'; e.style.top = (CORE.y + Math.sin(a) * 140) + 'px'; });
    },
  });
})();
