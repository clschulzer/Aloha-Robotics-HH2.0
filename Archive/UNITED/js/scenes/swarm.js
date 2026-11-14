/* ALOHA ROBOTICS / OPUS — scene 5: the agentic scheduler.
   A synthetic but realistic day for eight C-arms. Hard rules stamp out the impossible, then a swarm
   of agents tests every legal gap. Every flash, label, log line and the golden window itself come
   from OPUS/js/lib/golden.js (tested) running live in the browser — nothing here is pre-baked. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio, G = window.AlohaGolden, D = window.AlohaDay;
  const el = document.getElementById('s-swarm');
  const $ = (id) => document.getElementById(id);
  const chart = $('sw-chart');
  const X0 = 330, X1 = 1810, T0 = 360, T1 = 1800, PPM = (X1 - X0) / (T1 - T0);
  const Y0 = 236, RH = 76, NROW = D.DEVICES.length;
  const tx = (min) => X0 + (min - T0) * PPM;
  const rowTop = (r) => Y0 + r * RH;
  const rowMid = (r) => rowTop(r) + RH / 2;
  const hhmm = G.hh;
  const ctxBase = () => ({ now: D.NOW, horizon: D.HORIZON, rate: D.EMERGENCY_RATE, confirmers: D.CONFIRMERS, blocks: [], robotBusy: [] });
  const CONFIRM_END = Math.max(...D.CONFIRMERS.map((c) => c.to));
  const DUTY_START = Math.min(...D.CONFIRMERS.map((c) => c.from));

  /* ---------- static chart ---------- */
  const node = (cls, css, html) => { const n = document.createElement('div'); n.className = cls; Object.assign(n.style, css || {}); if (html != null) n.innerHTML = html; chart.appendChild(n); return n; };
  for (let h = 6; h <= 30; h += 2) {
    node('sw-axis', {}, `<span style="left:${tx(h * 60)}px">${String(h % 24).padStart(2, '0')}:00</span>`);
    node('sw-grid', { left: tx(h * 60) + 'px', top: Y0 + 'px', height: NROW * RH + 'px' });
  }
  const emMax = Math.max(...D.EMERGENCY_RATE);
  for (let h = 6; h < 30; h++) { const v = D.EMERGENCY_RATE[h % 24] / emMax; node('sw-emerg', { left: (tx(h * 60) + 3) + 'px', width: (60 * PPM - 6) + 'px', top: (190 - 4 - v * 16) + 'px', height: (4 + v * 16) + 'px', background: `rgba(255,59,78,${(0.25 + v * 0.7).toFixed(2)})`, borderRadius: '3px 3px 0 0', transitionDelay: (300 + (h - 6) * 25) + 'ms' }); }
  node('sw-emerg-label', { left: '110px', top: '172px' }, 'EMERGENCY ODDS<br>PER HOUR');
  document.querySelectorAll('#sw-chart .sw-axis span').forEach((s) => (s.style.top = '196px'));
  node('sw-past', { left: X0 + 'px', width: (tx(D.NOW) - X0) + 'px', top: Y0 + 'px', height: NROW * RH + 'px' });
  node('sw-night', { left: tx(CONFIRM_END) + 'px', width: (X1 - tx(CONFIRM_END)) + 'px', top: Y0 + 'px', height: NROW * RH + 'px' }, '<b>☾ NO START AFTER 22:30 — NOBODY ON DUTY TO CONFIRM</b>');
  node('sw-duty', { left: tx(DUTY_START) + 'px', width: (tx(CONFIRM_END) - tx(DUTY_START)) + 'px', top: (Y0 + NROW * RH + 10) + 'px' }, '<b>A HUMAN CAN CONFIRM A START · MEDICAL PHYSICS 07–17 · IT ON CALL 17–22:30</b>');
  const nowLine = node('sw-now', { left: tx(D.NOW) + 'px', top: Y0 + 'px', height: (NROW * RH) + 'px' }, `<b>NOW ${hhmm(D.NOW)}</b>`);

  const rows = [], stamps = [], hatches = [], locks = [];
  D.DEVICES.forEach((d, r) => {
    const row = node('sw-row', { top: rowTop(r) + 'px', height: RH + 'px', transitionDelay: (r * 45) + 'ms' });
    const status = !d.update ? `${d.home} · ${d.sw} ✓` : d.update.art === 'arm' ? `${d.home} · MOTION FIRMWARE` : !d.socket ? `${d.home} · NO SOCKET` : `${d.home} · PATCH DUE`;
    row.innerHTML = `<div class="sw-label"><b>${d.id}<span>${d.name}</span></b><small class="${d.socket ? '' : 'nosocket'}">${status}</small></div>`;
    d.cases.forEach((c, k) => {
      const cs = document.createElement('div');
      cs.className = 'sw-case' + (/ADD-ON|NIGHT/.test(c.proc) ? ' addon' : '');
      cs.style.left = (tx(c.from) - 110) + 'px'; cs.style.width = Math.max(6, (c.to - c.from) * PPM - 2) + 'px'; cs.style.top = '16px';
      cs.style.transitionDelay = (200 + (tx(c.from) - X0) * 0.55) + 'ms';
      if (c.to <= D.NOW) cs.classList.add('past');
      cs.innerHTML = `<span>${c.proc}</span>`; row.appendChild(cs);
    });
    rows.push(row);
    // rule verdicts for devices the agents never need to search
    let verdict = null;
    if (!d.update) verdict = { ok: true, text: `✓ ${d.sw} — ALREADY UP TO DATE` };
    else if (d.update.art === 'arm') verdict = { ok: false, text: 'RULE: MOTION UPDATE → TECHNICIAN ON SITE' };
    else if (d.weeks < 4) verdict = { ok: false, text: `RULE: ${d.weeks} WEEKS OF DATA → NO GUESS` };
    if (verdict) {
      const hx = tx(D.NOW + 20) - 110, hw = X1 - tx(D.NOW + 20);
      const h = document.createElement('div'); h.className = 'sw-hatch' + (verdict.ok ? ' ok' : ''); h.style.left = hx + 'px'; h.style.width = hw + 'px'; row.appendChild(h); hatches.push(h);
      const s = document.createElement('div'); s.className = 'sw-stamp ' + (verdict.ok ? 'ok' : 'no'); s.textContent = verdict.text; s.style.left = (hx + 40 + (r % 2) * 120) + 'px'; row.appendChild(s); stamps.push(s);
    }
    if (D.ALARM.area.includes(d.area)) {
      const lk = document.createElement('div'); lk.className = 'sw-lock'; lk.style.left = (tx(D.ALARM.from) - 110) + 'px'; lk.style.width = (D.ALARM.to - D.ALARM.from) * PPM + 'px';
      lk.innerHTML = '<span>LOCKED · POLYTRAUMA</span>'; row.appendChild(lk); locks.push(lk);
    }
  });
  const gold = node('sw-gold', {}, '<div class="core"></div><div class="buf"></div>');
  const callout = node('sw-callout', {});

  /* ---------- canvases ---------- */
  const L = OPUS.canvas($('sw-cv'), { cap: 1.5 });
  const heat = OPUS.canvas(document.createElement('canvas'), { cap: 1.5 });
  const trail = OPUS.canvas(document.createElement('canvas'), { cap: 1.5 });
  const g = L.ctx;
  const SPR = { teal: OPUS.glow([62, 240, 224], 32, 0.2), gold: OPUS.glow([255, 199, 74], 32, 0.2), red: OPUS.glow([255, 70, 90], 32, 0.2), white: OPUS.glow([255, 255, 255], 32, 0.3) };
  const COL = { reject: [255, 77, 94], risky: [255, 181, 71], ok: [62, 240, 224], best: [255, 199, 74] };

  /* ---------- simulation state ---------- */
  const rnd = OPUS.rng(2026);
  let res = null, cands = [], agents = [], ghosts = [], chatter = [], shards = [], visits = [];
  let alarmDone = false, mode = 'idle', modeT = 0, stopBuzz = null, best = null, bestSoFar = 0, stats = { tested: 0, legal: new Set() }, lastLog = 0, statsT = 0, replanMs = 0, phase = 0;
  const N = 230;

  function computeCands(result) {
    const rowOf = Object.fromEntries(D.DEVICES.map((d, i) => [d.id, i]));
    return result.all.filter((c) => !['current', 'motion', 'thin-data', 'no-data', 'horizon'].includes(c.reason))
      .map((c) => ({ c, r: rowOf[c.id], x: tx(c.from), y: rowMid(rowOf[c.id]), w: (c.guardEnd - c.from) * PPM, kind: c.status === 'ok' ? 'ok' : c.status === 'risky' ? 'risky' : 'reject' }));
  }
  function spawnAgents(fromX, fromY, spread) {
    agents = [];
    for (let i = 0; i < N; i++) {
      const r = Math.floor(rnd() * NROW);
      agents.push({ x: fromX != null ? fromX + (rnd() - 0.5) * spread : tx(D.NOW) + (rnd() - 0.5) * 10, y: fromY != null ? fromY + (rnd() - 0.5) * spread : rowMid(r) + (rnd() - 0.5) * 40,
        vx: 200 + rnd() * 500, vy: (rnd() - 0.5) * 300, c: -1, st: 'fly', t: 0, px: 0, py: 0, ox: 0, oy: 0, a: 0, alpha: 1, seed: rnd() * 100 });
    }
    agents.forEach(pick);
  }
  function pick(a) {
    if (!cands.length) return;
    let ci;
    if (a.c >= 0 && rnd() < 0.62) { const base = cands[a.c]; const near = cands.map((c, i) => i).filter((i) => Math.abs(cands[i].r - base.r) <= 1 && Math.abs(cands[i].x - base.x) < 150); ci = near[Math.floor(rnd() * near.length)]; }
    else { let bestI = -1; for (let k = 0; k < 3; k++) { const i = Math.floor(rnd() * cands.length); if (bestI < 0 || visits[i] < visits[bestI]) bestI = i; } ci = bestI; }
    a.c = ci; a.st = 'fly'; a.t = 0;
    a.ox = (rnd() - 0.5) * 8; a.oy = (rnd() - 0.5) * 16;
  }
  function logLine(cls, text) {
    const now = performance.now(); if (cls !== 'gd' && now - lastLog < 95) return; lastLog = now;
    const log = $('sw-log'), d = document.createElement('div'); d.className = cls; d.textContent = text; log.appendChild(d);
    while (log.children.length > 7) log.removeChild(log.firstChild);
  }
  function evaluated(a) {
    const k = cands[a.c]; if (!k) return;
    visits[a.c] = (visits[a.c] || 0) + 1; stats.tested++;
    const c = k.c;
    if (k.kind === 'ok') { stats.legal.add(c.id + c.from); if (c.p > bestSoFar && mode === 'hunt') bestSoFar = c.p; }
    ghosts.push({ x: k.x, y: rowTop(k.r) + 16, w: k.w, kind: k.kind, t: 0, full: rnd() < (k.kind === 'ok' ? 0.16 : 0.05) });
    // heat: what the swarm has learned about the day
    const hc = heat.ctx, col = k.kind === 'ok' ? OPUS.color.mix(COL.ok, COL.best, M.clamp((c.p - 0.86) / 0.1, 0, 1)) : k.kind === 'risky' ? COL.risky : COL.reject;
    hc.fillStyle = OPUS.color.rgba(col, k.kind === 'reject' ? 0.022 : k.kind === 'risky' ? 0.05 : 0.075); hc.fillRect(k.x - 3, rowTop(k.r) + 22, 7, RH - 44);
    if (rnd() < (mode === 'hunt' ? 0.11 : 0.05) && chatter.length < 7 && !chatter.some((o) => Math.abs(o.y - (rowTop(k.r) + 8)) < 30 && Math.abs(o.x - k.x) < 230)) {
      const text = k.kind === 'reject' ? '✕ ' + c.label : k.kind === 'risky' ? '⚠ ' + c.label : (c.needsRobot ? '⚡ ' : '✓ ') + Math.round(c.p * 100) + '%' + (c.needsRobot ? ' · KETTYBOT' : '');
      chatter.push({ x: k.x, y: rowTop(k.r) + 8, text, kind: k.kind, t: 0 });
    }
    const line = `${c.id} · ${hhmm(c.from)}  ${k.kind === 'reject' ? '✕ ' + c.label : k.kind === 'risky' ? '⚠ ' + c.label : '✓ ' + Math.round(c.p * 100) + '% UNDISTURBED' + (c.needsRobot ? ' · NO SOCKET → KETTYBOT' : '') + ' · BACKUP ' + c.backup}`;
    logLine(k.kind === 'ok' ? 'ok' : k.kind === 'risky' ? 'rk' : 'no', line);
  }

  /* ---------- the golden window, in DOM for crisp text ---------- */
  function placeGold(b, extra) {
    const r = D.DEVICES.findIndex((d) => d.id === b.id);
    const x = tx(b.from), w = (b.guardEnd - b.from) * PPM, wc = (b.to - b.from) * PPM;
    Object.assign(gold.style, { left: x + 'px', top: (rowTop(r) + 12) + 'px', width: w + 'px' });
    gold.querySelector('.core').style.width = wc + 'px'; gold.querySelector('.buf').style.width = (w - wc) + 'px';
    const dev = D.DEVICES[r], bk = D.DEVICES.find((d) => d.id === b.backup);
    const pct = Math.round(b.p * 100);
    callout.innerHTML = `<div class="k">★ GOLDEN WINDOW</div>
      <div class="t">${dev.id} ${dev.name} <small>· ${hhmm(b.from)} → ${hhmm(b.to)}</small></div>
      <div class="p">${pct}% chance it runs undisturbed</div>
      <ul><li>rollback buffer until ${hhmm(b.guardEnd)}</li>
      ${b.needsRobot ? `<li>no socket → KettyBot brings power</li>` : `<li>socket in ${dev.home} · no robot needed</li>`}
      <li>backup: ${bk.id} ${bk.name} stays free</li></ul>${extra ? `<div class="ms">${extra}</div>` : ''}`;
    let left = x + w + 26; if (left + 470 > 1840) left = x - 26 - 470;
    const top = M.clamp(rowTop(r) - 70, 200, 600);
    Object.assign(callout.style, { left: left + 'px', top: top + 'px' });
    return { x, y: rowTop(r) + 12, w, h: 52, r };
  }

  function converge(target, then) {
    best = target; mode = 'converge'; modeT = 0;
    const box = placeGold(target);
    agents.forEach((a, i) => { a.st = 'conv'; a.gx = box.x + rnd() * box.w; a.gy = box.y + 6 + rnd() * (box.h - 12); a.ang = Math.atan2(a.y - a.gy, a.x - a.gx); a.rad = Math.hypot(a.x - a.gx, a.y - a.gy); a.t = 0; a.alpha = 1; });
    if (stopBuzz) { stopBuzz(0.9); stopBuzz = null; }
    setTimeout(() => { if (mode !== 'converge' || best !== target) return; mode = 'done'; gold.classList.remove('dead'); gold.classList.add('show'); callout.classList.add('show'); A.sfx.chime(0.42, phase >= 3 ? 740 : 660); bestSoFar = target.p; logLine('gd', `★ GOLDEN WINDOW → ${target.id} ${hhmm(target.from)}–${hhmm(target.to)} · ${Math.round(target.p * 100)}% · BACKUP ${target.backup}`); if (then) then(); }, 1050);
  }

  function shatter() {
    const r = gold.getBoundingClientRect(); // not used for coords (stage is scaled); use style values
    const x = parseFloat(gold.style.left), y = parseFloat(gold.style.top), w = parseFloat(gold.style.width);
    for (let i = 0; i < 140; i++) shards.push({ x: x + rnd() * w, y: y + rnd() * 52, vx: (rnd() - 0.5) * 900, vy: -200 - rnd() * 600, t: 0, life: 0.9 + rnd() * 0.8, s: 1 + rnd() * 2.5 });
    gold.classList.add('dead'); gold.classList.remove('show'); callout.classList.remove('show');
    A.sfx.shatter(0.4);
  }

  function resetVisuals() {
    heat.clear(); trail.clear(); L.clear();
    agents = []; ghosts = []; chatter = []; shards = []; visits = []; stats = { tested: 0, legal: new Set() }; bestSoFar = 0;
    $('sw-log').innerHTML = '';
    gold.classList.remove('show', 'dead'); callout.classList.remove('show'); gold.style.zIndex = '';
    stamps.forEach((s) => s.classList.remove('show')); hatches.forEach((h) => h.classList.remove('show')); locks.forEach((l) => l.classList.remove('show'));
    ['sw-banner', 'sw-dim', 'sw-phone', 'ph-finger', 'ph-after'].forEach((id) => $(id).classList.remove('show'));
    $('ph-yes').classList.remove('done'); $('ph-yes').firstChild.textContent = 'Approve';
    if (stopBuzz) { stopBuzz(0.2); stopBuzz = null; }
    mode = 'idle'; alarmDone = false;
  }
  function prefillHeat(list) { // used when settling instantly: paint what a full hunt would have found
    cands = computeCands(list); visits = new Array(cands.length).fill(1);
    const hc = heat.ctx;
    cands.forEach((k) => { const col = k.kind === 'ok' ? OPUS.color.mix(COL.ok, COL.best, M.clamp((k.c.p - 0.86) / 0.1, 0, 1)) : k.kind === 'risky' ? COL.risky : COL.reject; hc.fillStyle = OPUS.color.rgba(col, k.kind === 'reject' ? 0.06 : k.kind === 'risky' ? 0.16 : 0.3); hc.fillRect(k.x - 3, rowTop(k.r) + 22, 7, RH - 44); stats.tested += 3; if (k.kind === 'ok') stats.legal.add(k.c.id + k.c.from); });
  }

  function showRules(instant) {
    stamps.forEach((s, i) => { if (instant) s.classList.add('show'); else setTimeout(() => { s.classList.add('show'); A.sfx.thump(0.4); }, 120 + i * 170); });
    hatches.forEach((h, i) => { if (instant) h.classList.add('show'); else setTimeout(() => h.classList.add('show'), 120 + i * 170); });
  }
  function startHunt(instant) {
    res = G.golden(D.DEVICES, ctxBase());
    cands = computeCands(res); visits = new Array(cands.length).fill(0);
    showRules(instant);
    const go = () => { mode = 'hunt'; modeT = 0; spawnAgents(); if (!instant) stopBuzz = A.buzz(0.07); A.sfx.whoosh(0.6, 0.18, true); };
    if (instant) { mode = 'hunt'; modeT = 0; spawnAgents(); } else setTimeout(() => { if (phase === 1) go(); }, 820);
  }
  function setPhone(b) {
    const d = D.DEVICES.find((x) => x.id === b.id), bk = D.DEVICES.find((x) => x.id === b.backup);
    const confirmer = G.confirmerAt(b.from, ctxBase());
    $('ph-q').textContent = `Patch ${d.name} (${d.id}) tonight, ${hhmm(b.from)} – ${hhmm(b.to)}?`;
    $('ph-ctx').textContent = `Backup ${bk.id} ${bk.name} stays free. ${confirmer ? confirmer.role : 'IT on call'} confirms the start once the area is reported clear.`;
    $('ph-after').textContent = `✓ APPROVED · LOGGED · NO CALL, NO EMAIL`;
  }
  function stagePos(n) {
    const st = document.getElementById('stage').getBoundingClientRect(), r = n.getBoundingClientRect(), k = OPUS.stageScale || 1;
    return { x: (r.left - st.left) / k, y: (r.top - st.top) / k, w: r.width / k, h: r.height / k };
  }
  function approve(instant) {
    const b = best; setPhone(b);
    $('sw-dim').classList.add('show'); gold.style.zIndex = '10'; callout.classList.remove('show');
    const phone = $('sw-phone'), finger = $('ph-finger'), yes = $('ph-yes');
    if (instant) { phone.classList.add('show'); yes.classList.add('done'); yes.firstChild.textContent = '✓ Approved'; $('ph-after').classList.add('show'); return; }
    phone.classList.add('show'); A.sfx.notify(0.3);
    Object.assign(finger.style, { left: '1700px', top: '930px' });
    setTimeout(() => { finger.classList.add('show'); const p = stagePos(yes); Object.assign(finger.style, { left: (p.x + p.w * 0.42) + 'px', top: (p.y + p.h * 0.55) + 'px' }); }, 650);
    setTimeout(() => { finger.classList.add('press'); A.sfx.tap(0.35); const rp = $('ph-ripple'); rp.style.left = '120px'; rp.style.top = '18px'; rp.classList.remove('go'); void rp.offsetWidth; rp.classList.add('go'); }, 1350);
    setTimeout(() => { finger.classList.remove('press'); yes.classList.add('done'); yes.firstChild.textContent = '✓ Approved'; A.sfx.success(0.3); $('ph-after').classList.add('show'); }, 1520);
    setTimeout(() => finger.classList.remove('show'), 2300);
  }

  function settle(i) {
    resetVisuals();
    el.classList.add('built');
    if (i >= 1) showRules(true);
    if (i === 1) { startHunt(true); return; }
    if (i >= 2) {
      res = G.golden(D.DEVICES, ctxBase());
      if (i === 2) { prefillHeat(res); best = res.best; placeGold(best); gold.classList.add('show'); callout.classList.add('show'); mode = 'done'; }
      else {
        const t0 = performance.now(); const r2 = G.golden(D.DEVICES, Object.assign(ctxBase(), { blocks: [D.ALARM] })); replanMs = r2.ms || (performance.now() - t0);
        prefillHeat(r2); locks.forEach((l) => l.classList.add('show')); $('sw-banner').classList.add('show');
        best = r2.best; placeGold(best, `RE-PLANNED IN ${replanMs.toFixed(1)} MS · ${r2.all.length} WINDOWS RE-CHECKED`); gold.classList.add('show'); callout.classList.add('show'); mode = 'done'; alarmDone = true;
        if (i >= 4) approve(true);
      }
      bestSoFar = best.p;
    }
    phase = i; updateStats(true);
  }
  function updateStats(force) {
    if (!force && performance.now() - statsT < 90) return; statsT = performance.now();
    $('st-agents').textContent = mode === 'idle' ? '0' : String(agents.length || N);
    $('st-tested').textContent = stats.tested.toLocaleString('en-US');
    $('st-legal').textContent = String(stats.legal.size);
    $('st-best').textContent = bestSoFar ? Math.round(bestSoFar * 100) + '%' : '—';
  }

  OPUS.scene({ id: 'swarm', el, beats: 3,   /* UNITED: ends on the golden window; the robot mission and the human start follow from the click dummy */ theme: 'dark',
    enter(ctx) {
      phase = 0; resetVisuals();
      el.classList.remove('built');
      if (ctx.instant) { settle(0); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('built')));
      setTimeout(() => A.sfx.whoosh(0.9, 0.1, true), 150);
      updateStats(true);
    },
    beat(i, ctx) {
      phase = i;
      if (ctx.instant) { settle(i); return; }
      if (i === 1) startHunt(false);
      if (i === 2) { if (mode === 'idle') startHunt(true); converge((res || G.golden(D.DEVICES, ctxBase())).best); }
      if (i === 3) {
        alarmDone = true; A.sfx.alarm(0.34); const f = $('sw-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
        $('sw-banner').classList.add('show');
        locks.forEach((l, k) => setTimeout(() => l.classList.add('show'), 260 + k * 110));
        setTimeout(() => {
          shatter();
          const t0 = performance.now();
          const r2 = G.golden(D.DEVICES, Object.assign(ctxBase(), { blocks: [D.ALARM] }));
          replanMs = r2.ms || (performance.now() - t0);
          cands = computeCands(r2); visits = new Array(cands.length).fill(0);
          const gx = parseFloat(gold.style.left) + 60, gy = parseFloat(gold.style.top) + 26;
          spawnAgents(gx, gy, 60); mode = 'hunt'; modeT = 0; stopBuzz = A.buzz(0.08);
          logLine('no', `⚠ POLYTRAUMA PRE-ALERT ${hhmm(D.ALARM.at)} → TRAUMA AREA LOCKED ${hhmm(D.ALARM.from)}–${hhmm(D.ALARM.to)} · RE-PLANNING`);
          setTimeout(() => { if (phase === 3) converge(r2.best, () => { placeGold(r2.best, `RE-PLANNED IN ${replanMs.toFixed(1)} MS · ${r2.all.length} WINDOWS RE-CHECKED`); callout.classList.add('show'); }); }, 1250);
        }, 700);
      }
      if (i === 4) { if (!alarmDone) settle(3); const go = () => { if (phase !== 4) return; if (mode === 'done') approve(false); else setTimeout(go, 120); }; go(); }
    },
    leave(ctx) {
      if (stopBuzz) { stopBuzz(0.3); stopBuzz = null; } mode = 'idle';
      // the golden nugget becomes the seed of the platform in the next scene
      if (ctx.forward && ctx.to === 'arch' && gold.classList.contains('show') && !ctx.instant) {
        const x = parseFloat(gold.style.left) + parseFloat(gold.style.width) * 0.42, y = parseFloat(gold.style.top) + 26;
        const seed = document.createElement('div'); seed.className = 'seed'; document.getElementById('stage').appendChild(seed);
        seed.animate([{ left: x + 'px', top: y + 'px', transform: 'translate(-50%,-50%) scale(1.6)', opacity: 1 },
                      { left: '960px', top: '455px', transform: 'translate(-50%,-50%) scale(.9)', opacity: 1, offset: 0.82 },
                      { left: '960px', top: '455px', transform: 'translate(-50%,-50%) scale(5)', opacity: 0 }],
                     { duration: 1250, easing: 'cubic-bezier(.6,0,.25,1)', fill: 'forwards' }).onfinish = () => seed.remove();
        OPUS.audio.sfx.whoosh(0.9, 0.14, true);
      }
      return 0;
    },
    frame(dt, T) {
      if (mode === 'idle' && !shards.length && !ghosts.length && !gold.classList.contains('show')) { updateStats(); return; }
      modeT += dt;
      // trails fade
      const tc = trail.ctx;
      tc.save(); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'destination-out'; tc.fillStyle = 'rgba(0,0,0,0.34)'; tc.fillRect(0, 0, trail.cv.width, trail.cv.height); tc.restore();
      tc.globalCompositeOperation = 'lighter'; tc.lineWidth = 1.6; tc.lineCap = 'round';
      for (const a of agents) {
        a.px = a.x; a.py = a.y;
        if (a.st === 'conv') {
          a.t += dt; const k = M.clamp(a.t / 1.0, 0, 1), e = M.easeInOut(k);
          a.ang += dt * (5 + 4 * (1 - k)); const rad = a.rad * (1 - e);
          a.x = a.gx + Math.cos(a.ang) * rad; a.y = a.gy + Math.sin(a.ang) * rad * 0.6;
          if (k >= 1) a.alpha = Math.max(0, a.alpha - dt * 2.4);
        } else {
          const k = cands[a.c]; if (!k) continue;
          const txx = k.x + a.ox, tyy = k.y + a.oy;
          const dx = txx - a.x, dy = tyy - a.y, d = Math.hypot(dx, dy) || 1;
          if (a.st === 'fly') {
            const vmax = mode === 'hunt' && phase >= 3 ? 1250 : 820, want = Math.min(1, d / 60);
            const n = OPUS.noise(a.x * 0.01 + a.seed, a.y * 0.01 + T * 2) * Math.PI * 2;
            a.vx += ((dx / d) * vmax * want - a.vx) * 10 * dt + Math.cos(n) * 1300 * dt;
            a.vy += ((dy / d) * vmax * want - a.vy) * 10 * dt + Math.sin(n) * 1300 * dt;
            a.x += a.vx * dt; a.y += a.vy * dt;
            if (d < 6) { a.st = 'eval'; a.t = 0; a.dur = 0.16 + rnd() * 0.28; }
          } else {
            a.t += dt; const ang = T * 26 + a.seed; a.x = txx + Math.cos(ang) * 6; a.y = tyy + Math.sin(ang) * 4;
            if (a.t >= a.dur) { evaluated(a); pick(a); }
          }
        }
        tc.strokeStyle = a.st === 'conv' ? 'rgba(255,205,110,.55)' : 'rgba(62,240,224,.42)';
        tc.globalAlpha = a.alpha; tc.beginPath(); tc.moveTo(a.px, a.py); tc.lineTo(a.x, a.y); tc.stroke();
      }
      tc.globalAlpha = 1;
      // compose
      L.clear();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.85; g.drawImage(heat.cv, 0, 0, 1920, 1080); g.globalAlpha = 1;
      for (let i = ghosts.length - 1; i >= 0; i--) {
        const gh = ghosts[i]; gh.t += dt; const a = 1 - gh.t / 0.6; if (a <= 0) { ghosts.splice(i, 1); continue; }
        const col = COL[gh.kind];
        if (gh.full) { g.fillStyle = OPUS.color.rgba(col, 0.05 * a); g.fillRect(gh.x, gh.y, gh.w, 44); g.strokeStyle = OPUS.color.rgba(col, 0.42 * a); g.lineWidth = 1.2; g.strokeRect(gh.x + 0.5, gh.y + 0.5, gh.w - 1, 43); }
        g.fillStyle = OPUS.color.rgba(col, 0.85 * a); g.fillRect(gh.x - 1, gh.y + 6 + (1 - a) * 6, 3, 32 - (1 - a) * 12);
      }
      g.globalCompositeOperation = 'lighter';
      g.drawImage(trail.cv, 0, 0, 1920, 1080);
      for (const a of agents) { if (a.alpha <= 0.02) continue; g.globalAlpha = a.alpha; const s = a.st === 'eval' ? 19 : 14; g.drawImage(a.st === 'conv' ? SPR.gold : SPR.teal, a.x - s / 2, a.y - s / 2, s, s); }
      g.globalAlpha = 1;
      for (let i = shards.length - 1; i >= 0; i--) { const s = shards[i]; s.t += dt; if (s.t > s.life) { shards.splice(i, 1); continue; } s.vy += 1400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; g.globalAlpha = 1 - s.t / s.life; g.drawImage(SPR.gold, s.x - s.s * 2, s.y - s.s * 2, s.s * 4, s.s * 4); }
      if (gold.classList.contains('show') && !gold.classList.contains('dead')) {        // glints around the nugget
        const gx = parseFloat(gold.style.left), gy = parseFloat(gold.style.top), gw = parseFloat(gold.style.width);
        for (let k = 0; k < 7; k++) { const ph = (T * 0.9 + k * 0.37) % 1, s = Math.sin(ph * Math.PI) * 18; const x = gx + ((k * 97.3) % gw), y = gy + ((k * 31.7) % 56) - 4; g.globalAlpha = Math.sin(ph * Math.PI) * 0.9; g.drawImage(SPR.white, x - s / 2, y - s / 2, s, s); g.drawImage(SPR.gold, x - s, y - s / 6, s * 2, s / 3); g.drawImage(SPR.gold, x - s / 6, y - s, s / 3, s * 2); }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      // agent chatter
      g.font = '600 12px "JetBrains Mono"'; g.textBaseline = 'middle';
      for (let i = chatter.length - 1; i >= 0; i--) {
        const c = chatter[i]; c.t += dt; const a = c.t < 0.12 ? c.t / 0.12 : 1 - (c.t - 0.12) / 0.85; if (a <= 0) { chatter.splice(i, 1); continue; }
        const y = c.y - 10 - c.t * 16, w = g.measureText(c.text).width + 14, x = M.clamp(c.x - 6, 340, 1800 - w);
        const col = COL[c.kind];
        g.globalAlpha = a; g.fillStyle = 'rgba(6,10,14,.88)'; g.beginPath(); g.roundRect ? g.roundRect(x, y - 10, w, 20, 5) : g.rect(x, y - 10, w, 20); g.fill();
        g.strokeStyle = OPUS.color.rgba(col, 0.8); g.lineWidth = 1; g.stroke();
        g.fillStyle = OPUS.color.rgba(col, 1); g.fillText(c.text, x + 7, y + 0.5);
      }
      g.globalAlpha = 1;
      if (mode === 'converge' && modeT > 1.6) agents = agents.filter((a) => a.alpha > 0.02);
      updateStats();
    },
  });
})();
