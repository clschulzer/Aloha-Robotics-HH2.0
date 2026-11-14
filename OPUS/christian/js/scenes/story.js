/* ALOHA ROBOTICS / OPUS · Christian's storyboard v4 as a live keynote.
   Acts: statement → emotional connectivity (Cio on the team's phone, the mood becomes priority) →
   AI orchestration with a human in the loop (the window is FOUND from hospital data, medical physics
   publishes, a job card, a ride request) → physical connectivity (KettyBot's mission, 14 checks; a human
   starts every update; report) → the loop closes → three pillars → call to action, IA, logo.
   Each scene is a set of CSS states: .b0 .b1 … per beat (cumulative) and .k1 .k2 … for automatic steps. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const IMG = (n) => `assets/characters/${n}.webp`;
  function stagePos(node) { const r = node.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = OPUS.stageScale || 1; return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }; }
  const restart = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

  /* the three pillars ride along at the top: which one is lit, per scene */
  const PILL = { app: 'E', plan: 'A', lena: 'A', radar: 'A', mission: 'P', start: 'A', running: 'P', loop: 'E' };
  new MutationObserver(() => { stage.dataset.pill = PILL[stage.dataset.scene] || ''; }).observe(stage, { attributes: true, attributeFilter: ['data-scene'] });

  /* a scene whose beats are CSS states */
  function stateScene(def) {
    const el = $('s-' + def.id);
    let timers = [];
    const api = {
      el,
      later: (ms, fn) => timers.push(setTimeout(fn, ms)),
      k: (n) => el.classList.add('k' + n),
      title: (id, html, animate) => setTitle($(id), html, animate),
    };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const setBeat = (i) => { for (let j = 0; j < 8; j++) el.classList.toggle('b' + j, j <= i); };
    const clearK = () => { for (let j = 0; j < 10; j++) el.classList.remove('k' + j); };
    OPUS.scene({ id: def.id, el, beats: def.beats, theme: def.theme || 'dark',
      enter(ctx) {
        clear(); clearK(); setBeat(-1); def.reset && def.reset(api);
        if (ctx.instant || !ctx.forward) { setBeat(0); def.play(0, false, api, ctx); return; }
        void el.offsetWidth;
        requestAnimationFrame(() => { setBeat(0); def.play(0, true, api, ctx); });
      },
      beat(i, ctx) {
        clear();
        if (ctx.instant) { clearK(); def.reset && def.reset(api); setBeat(i); for (let j = 0; j <= i; j++) def.play(j, false, api, ctx); return; }
        setBeat(i); def.play(i, true, api, ctx);
      },
      leave(ctx) { clear(); return def.leave ? def.leave(ctx, api) || 0 : 0; },
      frame: def.frame || null,
    });
    return api;
  }
  function setTitle(h, html, animate) {
    const spans = h.querySelectorAll('span'), cur = h.querySelector('span.cur') || spans[0], nxt = cur === spans[0] ? spans[1] : spans[0];
    if (cur.innerHTML === html) return;
    if (!animate) { spans.forEach((s) => s.classList.remove('cur', 'old')); cur.innerHTML = html; cur.classList.add('cur'); nxt.innerHTML = ''; return; }
    nxt.classList.remove('old'); nxt.innerHTML = html; void nxt.offsetWidth; cur.classList.remove('cur'); cur.classList.add('old'); nxt.classList.add('cur');
  }
  function tap(finger, target, at, api, onTap) {
    api.later(at, () => { const p = stagePos(target); Object.assign(finger.style, { left: p.x + 'px', top: p.y + 'px' }); finger.classList.add('show'); });
    api.later(at + 620, () => {
      finger.classList.add('press'); A.sfx.tap(0.3);
      const rp = target.querySelector('.ripple'); if (rp) { rp.classList.remove('go'); void rp.offsetWidth; rp.classList.add('go'); }
      onTap && onTap();
    });
    api.later(at + 800, () => finger.classList.remove('press'));
  }
  function parkFinger(finger, x, y) { finger.classList.remove('show', 'press'); Object.assign(finger.style, { left: x + 'px', top: y + 'px' }); }

  /* ---------------- ACT 1 · statement ---------------- */
  stateScene({ id: 'statement', beats: 2,
    play(i, anim) { if (anim) A.sfx.thump(i ? 0.35 : 0.45); },
  });

  /* ---------------- ACT 2 · emotional connectivity ---------------- */
  const MOODS = [
    { cls: 'mood-lonely', img: 'lonely', word: 'Lonely', state: 'No connection · last logs 9 days ago', quote: 'Nobody has connected me for days. Is anyone out there?', data: [['Network', 'off'], ['Last logs', '9 days'], ['Location', 'Corridor B']], cta: 'Wake me up', point: [['Network', 'off'], ['Last logs', '9 days ago']], snd: 'sob' },
    { cls: 'mood-hungry', img: 'manic', word: 'Hungry', state: 'Unplugged · security patch due', quote: 'Plug me in! My security patch is waiting and I am starving.', data: [['Power', 'unplugged'], ['Patch', 'due'], ['Location', 'Corridor B']], cta: 'Feed me power', point: [['Power', 'unplugged since 17:00'], ['Security patch', 'due since Mon']], snd: 'boing' },
    { cls: 'mood-happy', img: 'bliss', word: 'Happy', state: 'Up to date · connected', quote: 'All synced. Thanks, team. I feel brand new.', data: [['Version', '2026.11'], ['Network', 'on'], ['Logs', 'today']], cta: 'Pet Cio', point: [['Version', '2026.11 · current'], ['Last logs', 'today 07:12']], snd: 'sparkle' },
  ];
  const TEAM = [['C-01', 'bliss', 'OR 1', 'all good', ''], ['C-02', 'bliss', 'OR 2', 'all good', ''], ['C-03 Cio', 'manic', 'Corridor B', 'patch due since Mon', '1'], ['C-04', 'lonely', 'Storage 2', 'offline 9 days', '2'], ['C-05', 'bliss', 'Hybrid OR', 'all good', ''], ['C-06', 'update', 'Trauma bay', 'updating now', '']];
  $('ap-tiles').innerHTML = TEAM.map(([d, m, l, st, pr], i) => `<div class="tile ${pr ? 'need' : ''}" style="transition-delay:${0.25 + i * 0.08}s">${pr ? `<em>${pr}</em>` : ''}<img alt="" src="${IMG(m)}"><b>${d}</b><span>${l}</span><i>${st}</i></div>`).join('');
  MOODS.forEach((m) => { const i = new Image(); i.src = IMG(m.img); });
  function setMood(k, animate) {
    const m = MOODS[k], app = $('ap-app');
    app.className = 'app ' + m.cls; $('s-app').style.setProperty('--moodc', getComputedStyle(app).getPropertyValue('--moodc'));
    const pet = $('ap-pet'); pet.src = IMG(m.img); if (animate) restart(pet, 'pop');
    $('ap-state').innerHTML = `<i></i>${m.state}`; $('ap-quote').textContent = `“${m.quote}”`;
    $('ap-data').innerHTML = m.data.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    $('ap-cta').textContent = m.cta;
    $('ap-moodn').textContent = `MOOD ${k + 1} OF 3`;
    const w = $('ap-word'); w.innerHTML = `${m.word}<b>.</b>`; w.style.setProperty('--moodc', getComputedStyle(app).getPropertyValue('--moodc'));
    const dp = $('ap-dp'); dp.innerHTML = m.point.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    if (animate) { restart(w, 'slam'); restart(dp, 'rise'); }
  }
  function moodSound(snd) { if (snd === 'sob') A.sfx.sob(0.22); else if (snd === 'boing') { A.sfx.boing(0.28); A.sfx.pop(700, 0.16); } else A.sfx.sparkle(0.24); }
  stateScene({ id: 'app', beats: 5, theme: 'paper',
    reset() { setMood(0, false); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { api.k(1); return; }
        A.sfx.whoosh(0.8, 0.16, true); api.later(300, () => A.sfx.pop(520, 0.22));
        api.later(1250, () => { api.k(1); setMood(0, true); moodSound('sob'); });
        return;
      }
      if (i <= 2) { api.k(1); setMood(i, anim); if (anim) api.later(80, () => moodSound(MOODS[i].snd)); return; }
      if (i === 3) { setMood(1, false); if (anim) { A.sfx.whoosh(0.7, 0.14, false); for (let t = 0; t < 6; t++) api.later(300 + t * 80, () => A.sfx.pop(480 + t * 60, 0.12)); } return; }
      if (i === 4 && anim) { api.later(120, () => A.sfx.pop(880, 0.22)); api.later(370, () => A.sfx.pop(980, 0.22)); api.later(700, () => A.sfx.tick(0.08, 1800)); }
    },
  });

  /* ---------------- ACT 3a · when is the best moment? ---------------- */
  const BX = (h) => 140 + ((h - 7) / 17) * 1090;
  const ROOMS = [
    ['OR 1', [[7.5, 11, 'Hip'], [11.5, 15.5, 'Spine'], [16, 18.5, 'Hip']]],
    ['OR 2', [[7.5, 10, 'Trauma'], [10.5, 14, 'Vascular'], [14.5, 19, 'Spine']]],
    ['OR 3', [[8, 12.5, 'Spine'], [13, 17, 'Ortho'], [19.5, 22.5, 'Ortho · evening', 'cxl']]],
    ['OR 4', [[7.5, 9.5, 'Hand'], [10, 13, 'Trauma'], [13.5, 18, 'Uro']]],
  ];
  const DEVS = [
    ['C-01', 'bliss', [[7.5, 11, 'use'], [11.5, 15.5, 'use'], [16, 18.5, 'use']]],
    ['C-02', 'bliss', [[7.5, 14, 'use'], [14.5, 19, 'use']]],
    ['C-03 Cio', 'manic', [[8, 12.5, 'use'], [13, 17, 'use'], [17, 24, 'idle']]],
    ['C-04', 'lonely', [[7.5, 24, 'off']]],
  ];
  const NOWH = 19.4, GOLD = [19.5, 22.75];
  (function buildPlan() {
    const b = $('pl-board'); let h = '';
    for (let t = 7; t <= 23; t += 2) h += `<div class="pl-axis" style="left:${BX(t)}px">${String(t).padStart(2, '0')}:00</div><div class="pl-vl" style="left:${BX(t)}px"></div>`;
    const blk = (a, e, txt, cls) => `<i class="blk ${cls}" style="left:${BX(a)}px;width:${BX(e) - BX(a) - 4}px">${txt}</i>`;
    h += `<div class="pl-rows rows-or">${ROOMS.map(([r, bl]) => `<div class="pl-row"><b>${r}</b>${bl.map(([a, e, t, c]) => blk(a, e, t, (c || '') + (e <= NOWH && !c ? ' done' : ''))).join('')}</div>`).join('')}</div>`;
    h += `<div class="pl-rows rows-dev">${DEVS.map(([d, m, bl]) => `<div class="pl-row"><b><img alt="" src="${IMG(m)}">${d}</b>${bl.map(([a, e, t]) => blk(a, e, t === 'use' ? 'in use' : t === 'idle' ? 'idle · parked' : 'offline', t === 'use' ? (e <= NOWH ? 'done' : '') : t)).join('')}</div>`).join('')}`;
    h += `<div class="pl-gold" style="left:${BX(GOLD[0])}px;top:${2 * 100 + 20}px;width:${BX(GOLD[1]) - BX(GOLD[0])}px">19:30–22:45</div></div>`;
    h += `<div class="pl-now" style="left:${BX(NOWH)}px"><span>now 19:24</span></div>`;
    b.innerHTML = h;
  })();
  const PL = OPUS.canvas($('pl-cv'), { cap: 1.5 }), pg = PL.ctx;
  let scan = null;
  function scanFrame(dt) {
    PL.clear(); if (!scan) return;
    scan.t += dt;
    const k = Math.min(1, scan.t / 1.6), x = 110 + BX(NOWH + (24 - NOWH) * M.easeInOut(k)), top = 316 + 46, h = 400;
    const gr = pg.createLinearGradient(x - 120, 0, x + 6, 0); gr.addColorStop(0, 'rgba(62,240,224,0)'); gr.addColorStop(1, 'rgba(62,240,224,.32)');
    pg.fillStyle = gr; pg.fillRect(x - 120, top, 126, h);
    pg.fillStyle = 'rgba(160,255,245,.9)'; pg.fillRect(x - 1.5, top, 3, h);
    // probes: one per device row as the scan passes
    [[0, 'no'], [1, 'no'], [3, 'no'], [2, 'ok']].forEach(([row, kind], j) => {
      const at = 0.25 + j * 0.3; if (scan.t < at) return;
      const a = Math.max(0, 1 - (scan.t - at) / 0.9), y = top + row * 100 + 20, px = 110 + BX(19.6);
      if (kind === 'no') { pg.strokeStyle = `rgba(255,80,95,${a})`; pg.lineWidth = 3; pg.beginPath(); pg.moveTo(px + 30, y + 14); pg.lineTo(px + 60, y + 44); pg.moveTo(px + 60, y + 14); pg.lineTo(px + 30, y + 44); pg.stroke(); }
      else { pg.strokeStyle = `rgba(255,199,74,${Math.min(1, (scan.t - at) * 3)})`; pg.lineWidth = 2; pg.strokeRect(110 + BX(GOLD[0]), y, BX(GOLD[1]) - BX(GOLD[0]), 58); }
    });
    if (scan.t > 2.2) { scan = null; PL.clear(); }
  }
  const plFinger = $('pl-finger');
  stateScene({ id: 'plan', beats: 4,
    reset(api) { scan = null; PL.clear(); api.title('pl-title', 'When is the <em>best</em> moment?', false); parkFinger(plFinger, 1620, 1000); },
    play(i, anim, api) {
      if (i === 0) { if (anim) api.later(200, () => A.sfx.grow(0.08, 1.2)); return; }
      if (i === 1) { if (anim) { A.sfx.glitch(0.12); api.later(120, () => A.sfx.notify(0.24)); } return; }
      if (i === 2) {
        api.title('pl-title', 'One push of a button.', anim);
        if (!anim) { api.k(2); api.k(3); return; }
        tap(plFinger, $('pl-go'), 700, api, () => { api.k(2); scan = { t: 0 }; A.sfx.whoosh(1.4, 0.1, true); });
        api.later(1700, () => plFinger.classList.remove('show'));
        api.later(3100, () => { api.k(3); A.sfx.chime(0.32, 784); api.later(120, () => A.sfx.shimmer(0.14, 1.4)); });
        return;
      }
      if (i === 3) {
        if (!anim) return;
        // replay the press on Publish, then the published state (CSS .b3 waits for it via delays)
        tap(plFinger, $('pl-pub'), 0, api, () => A.sfx.success(0.26));
        api.later(1300, () => plFinger.classList.remove('show'));
      }
    },
    frame: scanFrame,
  });

  /* ---------------- ACT 3b · Lena's job card ---------------- */
  const lnFinger = $('ln-finger');
  stateScene({ id: 'lena', beats: 2,
    reset() { parkFinger(lnFinger, 1100, 1000); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { api.k(1); api.k(2); return; }
        api.later(650, () => { api.k(1); A.sfx.notify(0.3); });
        api.later(1450, () => { api.k(2); A.sfx.pop(620, 0.16); });
        return;
      }
      if (!anim) { api.k(1); api.k(2); api.k(3); return; }
      tap(lnFinger, $('ln-nope'), 0, api, () => { api.k(3); A.sfx.pop(420, 0.18); });
      api.later(1300, () => lnFinger.classList.remove('show'));
    },
  });

  /* ---------------- ACT 3c · like a ride request ---------------- */
  const PEOPLE = [['Tom', 'in surgery'], ['Aylin', 'off shift'], ['Jonas', 'busy, OR 2'], ['Mara', 'on break, no reply'], ['Ben', 'in surgery'], ['Sofia', 'off shift']];
  const radar = $('rd-radar');
  const people = PEOPLE.map(([n, s], i) => {
    const a = ((i * 60 - 70) * Math.PI) / 180, d = document.createElement('div');
    d.className = 'person'; d.style.left = Math.cos(a) * 300 + 'px'; d.style.top = Math.sin(a) * 300 + 'px';
    d.innerHTML = `<span class="av">${n[0]}</span><b>${n}</b><small>${s}</small>`; radar.appendChild(d); return d;
  });
  stateScene({ id: 'radar', beats: 2,
    reset(api) { people.forEach((p) => p.classList.remove('in', 'no')); api.el.classList.remove('go'); api.title('rd-title', 'Asking 6 people nearby…', false); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { people.forEach((p) => p.classList.add('in', 'no')); return; }
        people.forEach((p, k) => api.later(150 + k * 120, () => { p.classList.add('in'); A.sfx.pop(700 + k * 50, 0.1); }));
        people.forEach((p, k) => api.later(1300 + k * 420, () => { p.classList.add('no'); A.sfx.tick(0.06, 900); }));
        return;
      }
      people.forEach((p) => p.classList.add('in', 'no'));
      api.title('rd-title', 'It’s one of <em>those</em> days.', anim);
      if (anim) { A.sfx.thump(0.35); api.later(800, () => A.sfx.whoosh(0.8, 0.14, true)); }
    },
    leave(ctx, api) { if (ctx.forward && !ctx.instant) { api.el.classList.add('go'); A.sfx.tap(0.3); A.sfx.whoosh(1.0, 0.16, true); return 300; } return 0; },
  });

  /* ---------------- ACT 4a · KettyBot's mission, 14 checks as it goes ---------------- */
  const CHECKS = [
    ['Patch CARM-SEC 2026.11', 'manufacturer signature ✓'], ['Checksum', 'sha256 ✓'], ['Cable packed', 'LAN-2 · service cable'], ['Battery 82 %', 'trip + 45 min docked'],
    ['Last known spot', 'empty'], ['Learned parking spots', '62 % · 21 %'], ['Cio found', 'camera match'],
    ['Docked', 'service port (concept)'], ['Right machine', 'serial + device certificate'], ['Woken over the cable', 'booted in 42 s'],
    ['Nobody within 2 m', 'camera + lidar'], ['No sterile drapes, no patient', 'camera'], ['Brakes on, arm parked', 'device status'], ['Power stable', 'docked connector'],
  ];
  $('ms-checks').innerHTML = CHECKS.map(([t, s]) => `<li><span class="tk"></span><b>${t}</b><small>${s}</small></li>`).join('');
  const checkEls = [...$('ms-checks').querySelectorAll('li')];
  const STEPS = [
    { title: 'Do I have everything?', cap: 'Patch on board. Cable packed. Battery 82 %.', pearl: 0 },
    { title: 'Where is Cio?', cap: 'Last known spot: empty. Usual spot: found.', pearl: 1 },
    { title: 'Right machine? Wake up.', cap: 'Docked. Right machine by certificate. Woken over the cable.', pearl: 2 },
    { title: 'Safe right now?', cap: 'Safe right now. Asking a human to start →', pearl: 4 },
  ];
  const route = $('ms-route'), routeLen = route.getTotalLength(), bot = $('ms-bot');
  let drive = null;
  function placeBot(d) { const p = route.getPointAtLength(M.clamp(d, 0, routeLen)); bot.style.left = p.x + 'px'; bot.style.top = p.y + 'px'; }
  function setStep(k, animate) {
    const s = STEPS[k];
    setTitle($('ms-title'), s.title, animate);
    const cap = $('ms-cap'); cap.textContent = s.cap; if (animate) restart(cap, 'swap');
    [...$('ms-pearls').children].forEach((li, j) => { li.classList.toggle('done', j < s.pearl); li.classList.toggle('now', j === s.pearl || (k === 2 && j === 3)); });
  }
  function check(i, api, at) { api.later(at, () => checkEls[i].classList.add('run')); api.later(at + 300, () => { checkEls[i].classList.remove('run'); checkEls[i].classList.add('ok'); A.sfx.tick(0.06, 2200 + i * 40); }); }
  stateScene({ id: 'mission', beats: 1,
    reset() { drive = null; checkEls.forEach((c) => c.classList.remove('run', 'ok')); ['ms-last', 'ms-usual'].forEach((id) => $(id).classList.remove('on')); $('ms-cio').classList.remove('on', 'wake'); placeBot(0); setStep(0, false); },
    play(i, anim, api) {
      if (!anim) {
        checkEls.forEach((c) => c.classList.add('ok')); ['ms-last', 'ms-usual'].forEach((id) => $(id).classList.add('on')); $('ms-cio').classList.add('on', 'wake'); placeBot(routeLen);
        setStep(3, false); [1, 2, 3, 4].forEach((n) => api.k(n)); return;
      }
      A.sfx.whoosh(0.6, 0.1, true);
      [0, 1, 2, 3].forEach((c) => check(c, api, 250 + c * 360));
      api.later(1750, () => { setStep(1, true); api.k(1); drive = { from: 0, to: 390, t: 0, dur: 1.2 }; A.sfx.grow(0.08, 1.2); });
      api.later(2950, () => { $('ms-last').classList.add('on'); A.sfx.pop(300, 0.14); });
      check(4, api, 3000);
      api.later(3200, () => { $('ms-usual').classList.add('on'); drive = { from: 390, to: routeLen, t: 0, dur: 1.15 }; });
      check(5, api, 3350);
      api.later(4400, () => { $('ms-cio').classList.add('on'); A.sfx.chime(0.22, 660); });
      check(6, api, 4450);
      api.later(4900, () => { setStep(2, true); api.k(2); A.sfx.tap(0.25); });
      check(7, api, 5050); check(8, api, 5450);
      api.later(5900, () => { $('ms-cio').classList.add('wake'); A.sfx.sparkle(0.2); });
      check(9, api, 6000);
      api.later(6550, () => { setStep(3, true); api.k(3); });
      [10, 11, 12, 13].forEach((c, j) => check(c, api, 6700 + j * 380));
      api.later(8500, () => { api.k(4); A.sfx.success(0.28); });
    },
    frame(dt) { if (!drive) return; drive.t += dt; const k = Math.min(1, drive.t / drive.dur); placeBot(M.lerp(drive.from, drive.to, M.easeInOut(k))); if (k >= 1) drive = null; },
  });

  /* ---------------- ACT 4b · a human starts every update ---------------- */
  const wzFinger = $('wz-finger');
  const wz = (n) => { const el = $('s-start'); ['w1', 'w2', 'w3', 'w4'].forEach((c) => el.classList.remove(c)); el.classList.add('w' + n); };
  stateScene({ id: 'start', beats: 2,
    reset() { wz(1); parkFinger(wzFinger, 1100, 1000); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { wz(4); return; }
        tap(wzFinger, $('wz1b'), 1000, api, () => api.later(150, () => { wz(2); A.sfx.whoosh(0.4, 0.08, true); }));
        tap(wzFinger, $('wz2b'), 2700, api, () => api.later(150, () => { wz(3); A.sfx.whoosh(0.4, 0.08, true); }));
        tap(wzFinger, $('wz3b'), 4300, api, () => api.later(150, () => { wz(4); A.sfx.success(0.3); }));
        api.later(5400, () => wzFinger.classList.remove('show'));
        return;
      }
      wz(4); if (anim) A.sfx.thump(0.4);
    },
  });

  /* ---------------- ACT 4c · update running → report ---------------- */
  let prog = null;
  function setProg(v) { $('rn-fill').style.width = (v * 100).toFixed(1) + '%'; $('rn-pct').textContent = Math.round(v * 100); }
  stateScene({ id: 'running', beats: 2,
    reset(api) { prog = null; setProg(0); api.title('rn-title', 'Update running.', false); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { setProg(1); api.k(2); return; }
        prog = { t: 0, dur: 3.4, done: () => { api.k(2); A.sfx.success(0.3); api.later(200, () => A.sfx.sparkle(0.2)); } };
        A.sfx.grow(0.08, 3.2);
        return;
      }
      setProg(1); api.k(2);
      api.title('rn-title', 'Health check. Report. Next job.', anim);
      if (anim) { A.sfx.whoosh(0.7, 0.12, false); api.later(1700, () => A.sfx.whoosh(1.2, 0.1, true)); }
    },
    frame(dt) { if (!prog) return; prog.t += dt; const k = Math.min(1, prog.t / prog.dur); setProg(M.easeInOut(k)); if (k >= 1) { const d = prog.done; prog = null; d(); } },
  });

  /* ---------------- ACT 5a · the loop closes ---------------- */
  stateScene({ id: 'loop', beats: 1, theme: 'paper',
    play(i, anim, api) {
      if (!anim) { api.k(1); api.k(2); return; }
      api.later(800, () => { api.k(1); A.sfx.notify(0.28); });
      api.later(1900, () => { api.k(2); A.sfx.notify(0.22); });
    },
  });

  /* ---------------- ACT 5b · three pillars ---------------- */
  stateScene({ id: 'pillars', beats: 1,
    play(i, anim, api) { if (anim) { [0, 450, 900].forEach((t, j) => api.later(t + 150, () => A.sfx.pop(520 + j * 140, 0.22))); api.later(1700, () => A.sfx.chime(0.26, 660)); } },
  });

  /* ---------------- ACT 5c · call to action → IA → logo ---------------- */
  function wink() { const k = $('ou-ketty'); k.classList.add('winking'); A.sfx.sparkle(0.2); setTimeout(() => k.classList.remove('winking'), 420); }
  stateScene({ id: 'outro', beats: 4,
    play(i, anim, api) {
      if (!anim) return;
      if (i === 0) A.sfx.thump(0.4);
      if (i === 1) { api.later(900, () => A.sfx.notify(0.24)); api.later(1250, () => A.sfx.boing(0.2)); }
      if (i === 2) { A.sfx.thump(0.35); api.later(1100, () => A.sfx.shimmer(0.2, 2.2)); }
      if (i === 3) { api.later(250, () => A.sfx.hit(0.45)); api.later(450, () => A.sfx.whoosh(0.9, 0.14, true)); api.later(2500, wink); api.later(5500, wink); }
    },
  });
})();
