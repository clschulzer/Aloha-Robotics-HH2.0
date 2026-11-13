/* ALOHA ROBOTICS / OPUS v2 — scene 5: the calendar.
   A realistic OR-device day (six mobile C-arms, real procedure names, live cases, on-call roster,
   emergency likelihood). A swarm of agents, drawn as cursors, clicks through every gap; each click
   is a real call to the golden-window scorer (js/model/golden.js). Rejected gaps flash red, possible
   ones leave a teal trace, and the swarm agrees on one golden window. Then a polytrauma alarm takes
   the trauma C-arms, the window breaks, the swarm re-plans in milliseconds, and one human taps yes.
   Beats: 0 the day · 1 the swarm · 2 the golden window · 3 the alarm + re-plan · 4 one tap. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio, G = window.AlohaGolden, D = window.AlohaDay;
  const $ = (id) => document.getElementById(id);
  const el = $('s-calendar'), grid = $('cl-grid');
  const L = OPUS.canvas($('cl-cv'), { cap: 1.5 }), g = L.ctx;

  /* ---------- the day ---------- */
  const SHOW = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-08'];
  const DEVS = D.DEVICES.filter((d) => SHOW.includes(d.id));
  const T0 = D.t(7, 0), T1 = D.t(30, 0), X0 = 340, X1 = 1820, Y0 = 290, RH = 90, BY = 16, BH = 58;
  const X = (t) => X0 + ((t - T0) * (X1 - X0)) / (T1 - T0);
  const rowOf = (id) => SHOW.indexOf(id);
  const barTop = (row) => Y0 + row * RH + BY;
  const hh = G.hh;
  const ctxBase = () => ({ now: D.NOW, horizon: D.HORIZON, rate: D.EMERGENCY_RATE, confirmers: D.CONFIRMERS, robotBusy: D.ROBOT.busy, blocks: [] });
  const AREA = { TRAUMA: 'Trauma', SPINE: 'Spine', VASCULAR: 'Vascular', RESERVE: 'Reserve', EMERGENCY: 'Emergency' };
  const ACR = ['ORIF', 'EVAR'];
  const nice = (s) => s.toLowerCase().replace(/\b[a-z]+\b/g, (w) => (ACR.includes(w.toUpperCase()) ? w.toUpperCase() : w)).replace(/^./, (c) => c.toUpperCase());
  const room = (r) => (r === 'SHOCK ROOM' ? 'Shock room' : r);

  function build() {
    grid.innerHTML = '';
    const add = (cls, style, html) => { const n = document.createElement('div'); n.className = cls; Object.assign(n.style, style); if (html != null) n.innerHTML = html; grid.appendChild(n); return n; };
    // hour lines + labels
    for (let h = 8; h <= 30; h += 2) {
      add('cl-vline', { left: X(h * 60) + 'px' });
      if (Math.abs(X(h * 60) - X(D.NOW)) > 60) add('cl-axis', { left: X(h * 60) + 'px', transitionDelay: (0.3 + (h - 8) * 0.012) + 's' }, String(h % 24).padStart(2, '0') + ':00');
    }
    // who can press start (synthetic roster) + the night nobody covers
    D.CONFIRMERS.forEach((c) => add('cl-roster', { left: X(c.from) + 'px', width: (X(c.to) - X(c.from) - 6) + 'px' }, `<span>${c.role.toUpperCase()} CAN PRESS START</span>`));
    const lastConf = Math.max(...D.CONFIRMERS.map((c) => c.to));
    add('cl-night', { left: X(lastConf) + 'px', width: (X(T1) - X(lastConf)) + 'px' }, '<span>NOBODY ON DUTY</span>');
    // rows
    DEVS.forEach((d, r) => {
      const y = Y0 + r * RH;
      if (r) add('cl-rowline', { top: y + 'px' });
      const due = !!d.update;
      const sub = d.id === 'C-03' ? 'C-03 · Hallway B · no socket' : `${d.id} · ${AREA[d.area] || d.area}${d.home && d.home.startsWith('OR') ? ' · ' + d.home : d.id === 'C-08' ? ' · shock room' : ''}`;
      add('cl-label', { top: (y + 20) + 'px', transitionDelay: (0.25 + r * 0.06) + 's' }, `<b>${d.name}<span class="st ${due ? 'due' : 'ok'}">${due ? 'PATCH DUE' : 'UP TO DATE'}</span></b><small>${sub}</small>`);
      d.cases.forEach((c) => {
        const x0 = Math.max(X(c.from), X0), x1 = X(c.to), w = x1 - x0;
        const parts = c.proc.split(' · ');
        let cls = 'cl-bar';
        if (c.to <= D.NOW) cls += ' done';
        else if (c.from < D.NOW) cls += ' live';
        if (/ADD-ON/.test(c.proc) || d.id === 'C-08') cls += ' addon';
        if (w < 56) cls += ' tiny'; else if (w < 112) cls += ' short';
        const label = parts[0] === 'TRAUMA' ? 'Trauma' : nice(parts[0]);
        const extra = parts[1] ? (parts[1] === 'ADD-ON' ? ' · add-on' : ' · ' + parts[1].toLowerCase()) : '';
        const n = add(cls, { left: x0 + 'px', top: barTop(r) + 'px', width: w + 'px', transitionDelay: (0.42 + r * 0.05 + ((x0 - X0) / (X1 - X0)) * 0.35) + 's' },
          `<b>${label}</b><small>${room(c.or)}${extra}</small>`);
        if (c.from < D.NOW && c.to > D.NOW) n.style.setProperty('--prog', (100 * (D.NOW - c.from) / (c.to - c.from)).toFixed(1) + '%');
      });
    });
    // now
    add('cl-now', { left: (X(D.NOW) - 1) + 'px' }, `<span>NOW ${hh(D.NOW)}</span>`);
    // emergency likelihood strip
    const em = add('cl-em', {}, '<span>EMERGENCY<br>LIKELIHOOD</span>');
    const max = Math.max(...D.EMERGENCY_RATE);
    for (let h = 7; h < 30; h++) {
      const v = D.EMERGENCY_RATE[h % 24], i = document.createElement('i');
      Object.assign(i.style, { left: (X(h * 60) - 110 + 3) + 'px', width: (X(60) - X(0) - 6) + 'px', height: (6 + (v / max) * 46) + 'px', opacity: (0.35 + 0.65 * v / max).toFixed(2) });
      em.appendChild(i);
    }
    $('cl-sub').textContent = D.label + ' · 6 mobile C-arms · synthetic data';
  }
  // the sub line gets an id for the label
  document.querySelector('.cl-sub').id = 'cl-sub';
  build();

  /* ---------- heading ---------- */
  const title = $('cl-title');
  function setTitle(html, animate) {
    const spans = title.querySelectorAll('span'), curS = title.querySelector('span.cur') || spans[0], nxt = curS === spans[0] ? spans[1] : spans[0];
    if (curS.innerHTML === html) return;
    if (!animate) { spans.forEach((s) => s.classList.remove('cur', 'old')); curS.innerHTML = html; curS.classList.add('cur'); nxt.innerHTML = ''; return; }
    nxt.classList.remove('old'); nxt.innerHTML = html; void nxt.offsetWidth;
    curS.classList.remove('cur'); curS.classList.add('old'); nxt.classList.add('cur');
  }
  const caption = (html) => { $('cl-caption').innerHTML = html; };

  /* ---------- gold window, locks, callout ---------- */
  let goldEl = null, callEl = null, locks = [];
  function placeGold(win, animate) {
    removeGold(false);
    const r = rowOf(win.id), x0 = X(win.from), x1 = X(win.to), xg = X(win.guardEnd || win.to);
    goldEl = document.createElement('div'); goldEl.className = 'cl-gold';
    Object.assign(goldEl.style, { left: x0 + 'px', top: barTop(r) + 'px', width: (x1 - x0) + 'px' });
    goldEl.textContent = `${hh(win.from)}–${hh(win.to)}`;
    const tail = document.createElement('div'); tail.className = 'cl-gold-tail';
    Object.assign(tail.style, { position: 'absolute', left: x1 + 'px', top: barTop(r) + 'px', width: (xg - x1) + 'px', height: BH + 'px', borderRadius: '0 10px 10px 0', background: 'repeating-linear-gradient(-45deg, rgba(255,199,74,.32) 0 6px, rgba(255,199,74,.12) 6px 12px)', zIndex: 4, opacity: 0, transition: 'opacity .4s ease .3s' });
    grid.appendChild(tail); goldEl._tail = tail;
    grid.appendChild(goldEl);
    const dev = DEVS.find((d) => d.id === win.id);
    callEl = document.createElement('div'); callEl.className = 'cl-call';
    const up = r > 0;
    Object.assign(callEl.style, { left: x0 + 'px', top: (up ? barTop(r) - 50 : barTop(r) + BH + 12) + 'px' });
    callEl.innerHTML = `★ ${dev.name.toUpperCase()} · ${Math.round(win.p * 100)} % UNDISTURBED<small>${win.needsRobot ? 'no socket → KettyBot brings power' : 'IT on call confirms the start'} · backup ready</small>`;
    grid.appendChild(callEl);
    if (animate) { void goldEl.offsetWidth; requestAnimationFrame(() => { goldEl.classList.add('show'); callEl.classList.add('show'); tail.style.opacity = 1; }); }
    else { goldEl.classList.add('show'); callEl.classList.add('show'); tail.style.opacity = 1; goldEl.style.transition = 'none'; }
  }
  function removeGold(shatter) {
    if (goldEl) {
      if (shatter) {
        const x0 = parseFloat(goldEl.style.left), y0 = parseFloat(goldEl.style.top), w = parseFloat(goldEl.style.width);
        for (let i = 0; i < 46; i++) shards.push({ x: x0 + Math.random() * w, y: y0 + Math.random() * BH, vx: (Math.random() - 0.5) * 260, vy: -80 - Math.random() * 220, r: Math.random() * 6, vr: (Math.random() - 0.5) * 9, s: 5 + Math.random() * 11, life: 1.1 + Math.random() * 0.5 });
      }
      goldEl._tail && goldEl._tail.remove(); goldEl.remove(); goldEl = null;
    }
    if (callEl) { callEl.remove(); callEl = null; }
  }
  function addLocks(animate) {
    clearLocks();
    const a = D.ALARM;
    DEVS.forEach((d, r) => {
      if (!a.area.includes(d.area)) return;
      const n = document.createElement('div'); n.className = 'cl-lock';
      Object.assign(n.style, { left: X(a.from) + 'px', top: barTop(r) + 'px', width: (X(a.to) - X(a.from)) + 'px' });
      n.innerHTML = '<span>RESERVED · POLYTRAUMA</span>';
      grid.appendChild(n); locks.push(n);
      if (animate) setTimeout(() => n.classList.add('show'), 80 + locks.length * 120); else n.classList.add('show');
    });
  }
  function clearLocks() { locks.forEach((n) => n.remove()); locks = []; }

  /* ---------- the swarm ---------- */
  const CUR = new Path2D('M0 0 L0 19 L4.6 14.7 L7.9 22.2 L11.1 20.8 L7.9 13.5 L14 13.5 Z');
  const N = 52;
  const agents = [], fx = [], shards = [];
  let pool = [], okSeen = new Map(), tested = new Set(), mode = 'idle', res = null, res2 = null, replanMs = 0, clickBudget = 0, gatherT = 0, gatherDone = false, target = null, buzzStop = null, speedK = 1;
  const rnd = OPUS.rng(77);

  function makePool(r) { return r.all.filter((c) => c.reason !== 'current'); }
  function spawnAgents(n) {
    agents.length = 0;
    for (let i = 0; i < n; i++) {
      const side = i % 4, e = rnd();
      const x = side === 0 ? -30 : side === 1 ? 1950 : 200 + e * 1600, y = side === 2 ? -30 : side === 3 ? 1110 : 200 + e * 700;
      agents.push({ x, y, vx: 0, vy: 0, tx: x, ty: y, state: 'wait', t: -rnd() * 0.7, cand: null, a: 0, s: 1, press: 0 });
    }
  }
  function pickCand(ag) {
    let c = null;
    if (ag.cand && rnd() < 0.55) {                                  // look next door: same C-arm, nearby start
      const near = pool.filter((p) => p.id === ag.cand.id && Math.abs(p.from - ag.cand.from) <= 70 && p !== ag.cand);
      if (near.length) c = near[Math.floor(rnd() * near.length)];
    }
    if (!c) c = pool[Math.floor(rnd() * pool.length)];
    ag.cand = c;
    const r = rowOf(c.id);
    ag.tx = M.clamp((X(c.from) + X(c.to)) / 2 + (rnd() - 0.5) * 60, X0 + 10, X1 - 10);
    ag.ty = barTop(r) + 10 + rnd() * (BH - 20);
    ag.state = 'fly';
  }
  function evaluateClick(ag) {
    const c = ag.cand, r = rowOf(c.id), key = c.id + c.from;
    tested.add(key);
    const x0 = X(c.from), x1 = X(c.to), y = barTop(r);
    fx.push({ kind: 'ring', x: ag.x, y: ag.y, t: 0, life: 0.35 });
    if (c.status === 'ok') { okSeen.set(key, c); fx.push({ kind: 'ok', x0, x1, y, t: 0, life: 0.7, p: c.p }); }
    else if (c.status === 'risky') fx.push({ kind: 'risky', x0, x1, y, t: 0, life: 0.5 });
    else fx.push({ kind: 'no', x0, x1, y, t: 0, life: 0.42, cx: ag.x, cy: ag.y });
    if (clickBudget > 0) { clickBudget--; A.sfx.tick(0.022, 3000 + rnd() * 900); }
  }
  function startHunt(r, fast) {
    res = r; pool = makePool(r); okSeen = new Map(); tested = new Set();
    spawnAgents(N); mode = 'hunt'; speedK = fast ? 1.7 : 1;
    if (buzzStop) buzzStop(0.2);
    buzzStop = A.buzz(0.035);
  }
  function gather(win) {
    target = win; mode = 'gather'; gatherT = 0; gatherDone = false;
    const r = rowOf(win.id), x0 = X(win.from), x1 = X(win.to), y0 = barTop(r), per = 2 * (x1 - x0) + 2 * BH;
    agents.forEach((ag, i) => {
      let d = (i / agents.length) * per; let px, py;
      if (d < x1 - x0) { px = x0 + d; py = y0 - 4; } else if ((d -= x1 - x0) < BH) { px = x1 + 4; py = y0 + d; } else if ((d -= BH) < x1 - x0) { px = x1 - d; py = y0 + BH + 4; } else { d -= x1 - x0; px = x0 - 4; py = y0 + BH - d; }
      ag.tx = px; ag.ty = py; ag.state = 'fly'; if (ag.t < 0) ag.t = 0;
    });
  }
  function stopBuzz() { if (buzzStop) { buzzStop(0.4); buzzStop = null; } }

  function update(dt) {
    // agents
    let arrived = 0;
    for (const ag of agents) {
      if (ag.state === 'wait') { ag.t += dt; if (ag.t >= 0) { if (mode === 'hunt') pickCand(ag); else ag.state = 'fly'; } continue; }
      if (mode === 'leave') { ag.a = Math.max(0, ag.a - dt * 1.8); ag.vx *= 0.96; ag.vy = ag.vy * 0.96 - 30 * dt; ag.x += ag.vx * dt; ag.y += ag.vy * dt; continue; }
      ag.a = Math.min(1, ag.a + dt * 4);
      if (ag.state === 'fly') {
        const w = (mode === 'gather' ? 11 : 8.5) * speedK, z = 0.9;
        ag.vx += (w * w * (ag.tx - ag.x) - 2 * z * w * ag.vx) * dt;
        ag.vy += (w * w * (ag.ty - ag.y) - 2 * z * w * ag.vy) * dt;
        ag.x += ag.vx * dt; ag.y += ag.vy * dt;
        if (Math.abs(ag.tx - ag.x) < 5 && Math.abs(ag.ty - ag.y) < 5) {
          if (mode === 'gather') { ag.state = 'hold'; }
          else { ag.state = 'press'; ag.t = 0; ag.press = 1; evaluateClick(ag); }
        }
      } else if (ag.state === 'press') {
        ag.t += dt; ag.press = Math.max(0, 1 - ag.t / 0.14);
        if (ag.t > 0.14 + (0.12 + rnd() * 0.25) / speedK) pickCand(ag);
      } else if (ag.state === 'hold') { arrived++; ag.x += (ag.tx - ag.x) * Math.min(1, dt * 10); ag.y += (ag.ty - ag.y) * Math.min(1, dt * 10); }
    }
    if (mode === 'hunt') clickBudget = Math.min(3, clickBudget + dt * 14);
    if (mode === 'gather') {
      gatherT += dt;
      if (!gatherDone && (arrived >= agents.length * 0.92 || gatherT > 1.1)) { gatherDone = true; onGathered(); }
    }
    // effects
    for (let i = fx.length - 1; i >= 0; i--) { fx[i].t += dt; if (fx[i].t > fx[i].life) fx.splice(i, 1); }
    for (let i = shards.length - 1; i >= 0; i--) { const s = shards[i]; s.vy += 620 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; s.life -= dt; if (s.life <= 0) shards.splice(i, 1); }
    // live counters while hunting
    if (mode === 'hunt' && res) caption(`<b>${agents.length} AGENTS</b> · ${tested.size} WINDOWS CHECKED · ${okSeen.size} POSSIBLE`);
  }

  let onGathered = () => {};
  function render() {
    L.clear();
    // persistent teal trace of every possible window found so far
    if (okSeen.size && mode !== 'idle') {
      g.fillStyle = 'rgba(62,240,224,0.06)';
      for (const c of okSeen.values()) { const r = rowOf(c.id); g.fillRect(X(c.from), barTop(r) + 2, X(c.to) - X(c.from), BH - 4); }
    }
    for (const f of fx) {
      const k = f.t / f.life, a = 1 - k;
      if (f.kind === 'ring') { g.strokeStyle = `rgba(255,255,255,${0.7 * a})`; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, 4 + 20 * M.easeOut(k), 0, Math.PI * 2); g.stroke(); }
      else if (f.kind === 'ok') { g.fillStyle = `rgba(62,240,224,${0.22 * a})`; g.fillRect(f.x0, f.y, f.x1 - f.x0, BH); g.strokeStyle = `rgba(62,240,224,${0.9 * a})`; g.lineWidth = 1.5; g.strokeRect(f.x0 + 0.5, f.y + 0.5, f.x1 - f.x0 - 1, BH - 1); }
      else if (f.kind === 'risky') { g.strokeStyle = `rgba(255,170,60,${0.5 * a})`; g.lineWidth = 1.5; g.strokeRect(f.x0 + 0.5, f.y + 0.5, f.x1 - f.x0 - 1, BH - 1); }
      else if (f.kind === 'no') {
        g.strokeStyle = `rgba(255,70,85,${0.3 * a})`; g.lineWidth = 1.2; g.strokeRect(f.x0 + 0.5, f.y + 0.5, f.x1 - f.x0 - 1, BH - 1);
        const s = 7; g.strokeStyle = `rgba(255,80,95,${0.95 * a})`; g.lineWidth = 2.6; g.beginPath(); g.moveTo(f.cx - s + 16, f.cy - s - 14); g.lineTo(f.cx + s + 16, f.cy + s - 14); g.moveTo(f.cx + s + 16, f.cy - s - 14); g.lineTo(f.cx - s + 16, f.cy + s - 14); g.stroke();
      }
    }
    for (const s of shards) { g.save(); g.translate(s.x, s.y); g.rotate(s.r); g.globalAlpha = Math.min(1, s.life * 1.6); g.fillStyle = '#ffd36a'; g.fillRect(-s.s / 2, -s.s / 3, s.s, s.s * 0.66); g.restore(); }
    g.globalAlpha = 1;
    for (const ag of agents) {
      if (ag.a <= 0.01 || ag.state === 'wait') continue;
      const sc = 1.25 * (1 - 0.18 * ag.press);
      g.save(); g.translate(ag.x, ag.y); g.scale(sc, sc); g.globalAlpha = ag.a;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.translate(1.5, 2); g.fill(CUR); g.translate(-1.5, -2);
      g.fillStyle = mode === 'gather' || mode === 'leave' ? '#ffe7a3' : '#ffffff'; g.fill(CUR);
      g.strokeStyle = '#0a0e13'; g.lineWidth = 1.3; g.stroke(CUR);
      g.restore();
    }
    g.globalAlpha = 1;
  }

  /* ---------- beats ---------- */
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearT = () => { timers.forEach(clearTimeout); timers = []; };
  function resetAll() {
    clearT(); stopBuzz(); agents.length = 0; fx.length = 0; shards.length = 0; okSeen = new Map(); tested = new Set(); mode = 'idle'; target = null;
    removeGold(false); clearLocks();
    el.classList.remove('dimrows');
    $('cl-banner').classList.remove('show'); $('cl-dim').classList.remove('show'); $('cl-phone').classList.remove('show');
    $('ph-yes').classList.remove('done'); $('ph-after').classList.remove('show'); $('ph-finger').classList.remove('show', 'press');
    caption(''); L.clear();
  }
  const R1 = () => res || G.golden(DEVS, ctxBase());
  const R2 = () => { if (!res2) { const t0 = performance.now(); res2 = G.golden(DEVS, Object.assign(ctxBase(), { blocks: [D.ALARM] })); replanMs = res2.ms || performance.now() - t0; } return res2; };
  const fmtMs = (ms) => (ms < 1 ? ms.toFixed(2) : ms < 10 ? ms.toFixed(1) : Math.round(ms)) + ' ms';
  function staticHeat(r) { okSeen = new Map(); tested = new Set(); makePool(r).forEach((c) => { tested.add(c.id + c.from); if (c.status === 'ok') okSeen.set(c.id + c.from, c); }); }

  function settle(i) {
    resetAll();
    el.classList.add('built');
    if (i === 0) { setTitle('When<b>?</b>', false); return; }
    const r1 = R1();
    if (i === 1) { setTitle('When<b>?</b>', false); staticHeat(r1); mode = 'static'; caption(`<b>${N} AGENTS</b> · ${tested.size} WINDOWS CHECKED · ${okSeen.size} POSSIBLE`); return; }
    if (i === 2) { setTitle(`Today, <b>${hh(r1.best.from)}</b>.`, false); placeGold(r1.best, false); caption(`<em>GOLDEN WINDOW</em> · ${makePool(r1).length} CHECKED · ${r1.ranked.length} POSSIBLE · BEST CHANCE WINS`); return; }
    const r2 = R2();
    addLocks(false); $('cl-banner').classList.add('show');
    setTitle(`Tonight, <b>${hh(r2.best.from)}</b>.`, false); placeGold(r2.best, false);
    caption(`RE-PLANNED IN <b>${fmtMs(replanMs)}</b> · NO SURGERY TOUCHED`);
    if (i === 4) { $('cl-banner').classList.remove('show'); $('cl-dim').classList.add('show'); liftGold(true); $('cl-phone').classList.add('show'); $('ph-yes').classList.add('done'); $('ph-after').classList.add('show'); caption('ONE QUESTION · ONE PERSON · ONE TAP'); }
  }
  function liftGold(on) { $('cl-caption').style.zIndex = on ? 8 : ''; if (goldEl) { goldEl.style.zIndex = on ? 8 : ''; goldEl._tail.style.zIndex = on ? 8 : ''; } if (callEl) callEl.style.zIndex = on ? 8 : ''; }

  function stagePos(node) { const r = node.getBoundingClientRect(), s = $('stage').getBoundingClientRect(), k = OPUS.stageScale || 1; return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }; }

  function play(i) {
    if (i === 1) {
      startHunt(R1(), false); A.sfx.whoosh(0.9, 0.12, true);
      return;
    }
    if (i === 2) {
      if (mode !== 'hunt') { startHunt(R1(), false); }
      const best = R1().best;
      onGathered = () => {
        placeGold(best, true); A.sfx.chime(0.38, 660); later(120, () => A.sfx.shimmer(0.16, 1.6));
        for (let k = 0; k < 6; k++) later(k * 28, () => A.sfx.tick(0.05, 2600 + k * 120));
        setTitle(`Today, <b>${hh(best.from)}</b>.`, true);
        caption(`<em>GOLDEN WINDOW</em> · ${pool.length} CHECKED · ${R1().ranked.length} POSSIBLE · BEST CHANCE WINS`);
        stopBuzz();
        later(650, () => { mode = 'leave'; agents.forEach((ag) => { ag.vx = (ag.x - (X(best.from) + X(best.to)) / 2) * 1.4; ag.vy = (ag.y - barTop(rowOf(best.id))) * 1.4; }); });
        later(1700, () => { okSeen = new Map(); });
      };
      gather(best);
      return;
    }
    if (i === 3) {
      $('cl-flash').classList.remove('go'); void $('cl-flash').offsetWidth; $('cl-flash').classList.add('go');
      $('cl-banner').classList.add('show'); A.sfx.alarm(0.3);
      addLocks(true);
      later(650, () => { removeGold(true); A.sfx.shatter(0.32); setTitle('When<b>?</b>', true); caption('THE TRAUMA C-ARMS ARE TAKEN · RE-PLANNING…'); });
      later(1050, () => {
        res2 = null; const r2 = R2();
        startHunt(r2, true);
        later(1500, () => {
          const best = r2.best;
          onGathered = () => {
            placeGold(best, true); A.sfx.chime(0.36, 784); later(120, () => A.sfx.shimmer(0.14, 1.4));
            setTitle(`Tonight, <b>${hh(best.from)}</b>.`, true);
            caption(`RE-PLANNED IN <b>${fmtMs(replanMs)}</b> · NO SURGERY TOUCHED`);
            stopBuzz();
            later(600, () => { mode = 'leave'; agents.forEach((ag) => { ag.vx = (ag.x - X(best.from)) * 1.2; ag.vy = (ag.y - barTop(rowOf(best.id))) * 1.2; }); });
            later(1600, () => { okSeen = new Map(); });
          };
          gather(best);
        });
      });
      return;
    }
    if (i === 4) {
      if (!goldEl) settle(3);
      okSeen = new Map(); mode = 'idle'; agents.length = 0; stopBuzz();
      $('cl-banner').classList.remove('show');
      $('cl-dim').classList.add('show'); liftGold(true);
      later(250, () => { $('cl-phone').classList.add('show'); A.sfx.notify(0.3); });
      const finger = $('ph-finger');
      later(1150, () => { Object.assign(finger.style, { left: '1080px', top: '860px' }); finger.classList.add('show'); });
      later(1350, () => { const p = stagePos($('ph-yes')); Object.assign(finger.style, { left: p.x + 'px', top: p.y + 'px' }); });
      later(2050, () => {
        finger.classList.add('press'); A.sfx.tap(0.32);
        const rp = $('ph-ripple'); rp.style.left = '45%'; rp.style.top = '35%'; rp.classList.remove('go'); void rp.offsetWidth; rp.classList.add('go');
        $('ph-yes').classList.add('done');
      });
      later(2230, () => finger.classList.remove('press'));
      later(2450, () => { $('ph-after').classList.add('show'); A.sfx.success(0.3); caption('ONE QUESTION · ONE PERSON · ONE TAP'); });
      later(3000, () => finger.classList.remove('show'));
    }
  }

  /* ---------- the title flies in from the previous scene's "When?" ---------- */
  function flyTitle() {
    title.style.transition = 'none';
    title.style.transformOrigin = '0 0';
    title.style.transform = 'translate(-10px, 276px) scale(3.947)';
    void title.offsetWidth;
    title.style.transition = 'transform .8s cubic-bezier(.6,0,.2,1)';
    title.style.transform = 'none';
    setTimeout(() => { title.style.transition = ''; }, 900);
  }

  OPUS.scene({ id: 'calendar', el, beats: 5, theme: 'dark',
    enter(ctx) {
      resetAll(); res = null; res2 = null;
      setTitle('When<b>?</b>', false);
      el.classList.remove('built');
      if (ctx.instant || !ctx.forward) { el.classList.add('built'); return; }
      if (ctx.from === 'now') flyTitle();
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('built')));
      later(300, () => A.sfx.grow(0.1, 1.4));
    },
    beat(i, ctx) {
      if (ctx.instant) { settle(i); return; }
      clearT();
      play(i);
    },
    leave(ctx) {
      clearT(); stopBuzz();
      if (ctx.forward && ctx.to === 'flow' && goldEl && !ctx.instant) {
        const x0 = parseFloat(goldEl.style.left), y0 = parseFloat(goldEl.style.top), w = parseFloat(goldEl.style.width);
        const seed = document.createElement('div'); seed.className = 'seed';
        Object.assign(seed.style, { left: (x0 + w / 2 - 17) + 'px', top: (y0 + BH / 2 - 17) + 'px' });
        $('stage').appendChild(seed);
        const to = OPUS.flowSeed || { x: 540, y: 560 };
        seed.animate([
          { transform: 'translate(0,0) scale(1.6)', opacity: 1 },
          { transform: `translate(${(to.x - (x0 + w / 2)) * 0.55}px, ${(to.y - (y0 + BH / 2)) * 0.55 - 160}px) scale(1.1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${to.x - (x0 + w / 2)}px, ${to.y - (y0 + BH / 2)}px) scale(1)`, opacity: 1 },
        ], { duration: 1000, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }).onfinish = () => seed.animate([{ transform: `translate(${to.x - (x0 + w / 2)}px, ${to.y - (y0 + BH / 2)}px) scale(1)`, opacity: 1 }, { transform: `translate(${to.x - (x0 + w / 2)}px, ${to.y - (y0 + BH / 2)}px) scale(3)`, opacity: 0 }], { duration: 320, fill: 'forwards' }).onfinish = () => seed.remove();
        A.sfx.whoosh(0.9, 0.14, true);
      }
      return 0;
    },
    frame(dt) { if (mode === 'idle' && !shards.length) return; update(dt); render(); },
  });
})();
