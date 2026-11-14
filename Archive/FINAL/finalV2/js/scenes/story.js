/* ALOHA ROBOTICS · FINAL v2. FINAL v1 plus Marc's notes of 14 Nov, 10:48:
   the film → "based on a true story" → Christian's statement → the C-ARMAGOTCHI toy drops in, blinks, and its
   screen becomes a real phone running the app (OPUS v2's transition, restored) → one mood at a time, each one
   arriving as a notification, then all moods faster and faster → the TV switches off → "Now we have the
   physical. Introducing the invisible." → ASTRA 04's swarm finds the golden window (calendar.js) → Lena's phone
   wakes up for the request, the ride request, KettyBot, a human starts it in the app, report, loop closed →
   three minutes only scratch the surface → let's brainstorm: the room is booked, and the QR code has the code.
   The top bar (brand + three pillars) is back. No "technical questions" slide.
   Each scene is a set of CSS states: .b0 .b1 … per beat (cumulative) and .k1 .k2 … for automatic steps. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio, PH = OPUS.phone;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const IMG = (n) => `assets/characters/${n}.webp`;
  function stagePos(node) { const r = node.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = OPUS.stageScale || 1; return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }; }
  const restart = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

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
        clear(); clearK(); setBeat(-1); def.reset && def.reset(api); def.pre && def.pre(ctx, api);
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
  stateScene({ id: 'statement', beats: 3,
    play(i, anim) { if (anim) A.sfx.thump(i ? 0.35 : 0.45); },
  });

  /* ---------------- MEET C-ARMAGOTCHI · the toy, then the app on a real phone, one mood at a time ---------------- */
  // Christian's three moods and words, plus the two the earlier OPUS toy had (installing, dead on arrival).
  // Each mood after the first arrives the way the app would send it: a notification with Cio's own sound.
  const MOODS = [
    { cls: 'mood-lonely', img: 'lonely', word: 'Lonely', tag: 'Lonely', state: 'No connection · last logs 9 days ago', quote: 'Nobody has connected me for days. Is anyone out there?', data: [['Network', 'off'], ['Last logs', '9 days'], ['Location', 'Corridor B']], cta: 'Wake me up', point: [['Network', 'off'], ['Last logs', '9 days ago']], snd: 'sob' },
    { cls: 'mood-hungry', img: 'manic', word: 'Hungry', tag: 'Hungry', state: 'Unplugged · security patch due', quote: 'Plug me in! My security patch is waiting and I am starving.', data: [['Power', 'unplugged'], ['Patch', 'due'], ['Location', 'Corridor B']], cta: 'Feed me power', point: [['Power', 'unplugged since 17:00'], ['Security patch', 'due since Mon']], snd: 'boing', ban: ['Cio is hungry', 'Plug me in! My security patch is waiting.'] },
    { cls: 'mood-update', img: 'update', word: 'Installing', tag: 'Updating', state: 'Updating · please don’t unplug', quote: 'Installing… whatever you do, don’t pull my plug.', data: [['Update', 'running'], ['Power', 'on'], ['Location', 'Corridor B']], cta: 'Watch Cio', point: [['Update', 'installing'], ['Needs', 'power + time']], snd: 'tick', ban: ['Cio is updating', 'Whatever you do, don’t pull my plug.'] },
    { cls: 'mood-happy', img: 'bliss', word: 'Happy', tag: 'Happy', state: 'Up to date · connected', quote: 'All synced. Thanks, team. I feel brand new.', data: [['Version', '2026.11'], ['Network', 'on'], ['Logs', 'today']], cta: 'Pet Cio', point: [['Version', '2026.11 · current'], ['Last logs', 'today 07:12']], snd: 'sparkle', ban: ['Cio is happy', 'All synced. Thanks, team. ♥'] },
    { cls: 'mood-failure', img: 'failure', word: 'Dead on arrival', tag: 'Out of service', state: 'Unplugged mid-update · out of service', quote: 'Someone pulled my plug halfway. Call a technician.', data: [['Update', 'failed'], ['Status', 'down'], ['Location', 'Corridor B']], cta: 'Call service', point: [['Update', 'failed · unplugged'], ['Status', 'out of service']], snd: 'zap', shake: true, ban: ['Cio is out of service', 'Someone pulled my plug mid-update.'] },
  ];
  const LOOP = ['lonely', 'manic', 'update', 'bliss', 'failure', 'rollback'];
  MOODS.forEach((m) => { const i = new Image(); i.src = IMG(m.img); });
  LOOP.forEach((n) => { const i = new Image(); i.src = IMG(n); });
  function setMood(k, animate) {
    const m = MOODS[k], app = $('ap-app');
    app.className = 'app ' + m.cls;
    const pet = $('ap-pet'); pet.src = IMG(m.img); if (animate) restart(pet, 'pop');
    $('ap-tag').innerHTML = `<i></i>${m.tag}`;
    $('ap-state').innerHTML = `<i></i>${m.state}`; $('ap-quote').textContent = `“${m.quote}”`;
    $('ap-data').innerHTML = m.data.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    $('ap-cta').innerHTML = m.cta + PH.icon(m.img === 'bliss' ? 'heart' : 'arrow');
    const w = $('ap-word'); w.innerHTML = `${m.word}<b>.</b>`; w.style.setProperty('--moodc', getComputedStyle(app).getPropertyValue('--moodc'));
    w.classList.toggle('long', m.word.length >= 9);
    const dp = $('ap-dp'); dp.innerHTML = m.point.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
    if (animate) { restart(w, 'slam'); restart(dp, 'rise'); if (m.shake) restart($('ap-phone'), 'shake'); }
  }
  function moodSound(snd) {
    if (snd === 'sob') A.sfx.sob(0.22);
    else if (snd === 'boing') { A.sfx.boing(0.28); A.sfx.pop(700, 0.16); }
    else if (snd === 'tick') { A.sfx.tick(0.12, 2000); setTimeout(() => A.sfx.tick(0.1, 2000), 260); }
    else if (snd === 'zap') { A.sfx.zap(0.3); A.sfx.glitch(0.16); }
    else A.sfx.sparkle(0.24);
  }
  // the notification banner: out of the island, a buzz, back in after a moment
  const ban = $('ap-ban');
  function banner(m, api) {
    $('ap-ban-t').textContent = m.ban[0]; $('ap-ban-b').textContent = m.ban[1];
    const th = $('ap-ban-i'); th.src = IMG(m.img); th.style.background = getComputedStyle($('ap-app')).getPropertyValue('--moodbg');
    ban.classList.remove('in'); void ban.offsetWidth; ban.classList.add('in');
    if (!m.shake) PH.buzz($('ap-phone'));
    api.later(2300, () => ban.classList.remove('in'));
  }

  // the toy (OPUS v2 · tama.js): it drops in, its LCD blinks, and the slide grows out of its screen
  const slide = $('tm-slide'), egg = $('tm-egg'), lcdbg = $('tm-lcdbg'), eggSvg = $('tm-eggsvg');
  const VB0 = '-700 -220 1920 1080';
  let zoom = null;
  (function paintLcd() {   // the LCD: the lonely face, downsampled to a few pixels
    const cv = $('tm-lcd'), g = cv.getContext('2d'), im = new Image();
    im.onload = () => { g.imageSmoothingEnabled = true; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(im, 4, 0, 66, 66); };
    im.src = IMG('lonely');
  })();
  // vector zoom: the SVG viewBox closes in on the LCD while the slide grows out of it, in lockstep
  function zoomFrame(dt) {
    zoom.t += dt;
    const k = Math.min(1, zoom.t / 0.62), e = M.easeInOut(k);
    const s = 0.1146 + (1 - 0.1146) * e, vbW = 220 / s, vbH = vbW * 1080 / 1920;
    eggSvg.setAttribute('viewBox', `${260 - vbW / 2} ${295 - 515 * vbH / 1080} ${vbW} ${vbH}`);
    slide.style.transform = `scale(${s})`;
    egg.style.opacity = k < 0.72 ? '1' : String(Math.max(0, 1 - (k - 0.72) / 0.28));
    if (k >= 1) settleToy();
  }
  function hideSlide() { zoom = null; slide.classList.add('hidden'); slide.style.transform = 'scale(.1146)'; egg.classList.remove('drop', 'zooming'); egg.style.opacity = ''; eggSvg.setAttribute('viewBox', VB0); }
  function settleToy() { zoom = null; egg.classList.remove('drop', 'zooming'); egg.style.opacity = '0'; eggSvg.setAttribute('viewBox', VB0); slide.classList.remove('hidden'); slide.style.transform = ''; }

  let loop = null;
  stateScene({ id: 'app', beats: MOODS.length + 1, theme: 'paper',
    reset() { loop = null; ban.classList.remove('in'); setMood(0, false); },
    pre(ctx, api) {   // before the first frame: from the statement, the iris opens on an empty table
      api.el.classList.remove('crt', 'iris');
      if (ctx.forward && !ctx.instant) { void api.el.offsetWidth; api.el.classList.add('iris'); hideSlide(); } else settleToy();
    },
    play(i, anim, api) {
      loop = null;
      if (i === 0) {
        if (!anim) { settleToy(); api.k(1); return; }
        restart(egg, 'drop'); A.sfx.pop(420, 0.26);                                                          // the toy drops in
        api.later(380, () => A.sfx.boing(0.28));
        api.later(820, () => { restart(lcdbg, 'blink'); A.sfx.pop(1800, 0.12); api.later(180, () => A.sfx.pop(1800, 0.12)); });   // it blinks
        api.later(1250, () => { slide.classList.remove('hidden'); egg.classList.remove('drop'); egg.classList.add('zooming'); zoom = { t: 0 }; A.sfx.whoosh(0.7, 0.2, true); });   // its screen becomes the phone
        api.later(1950, () => { api.k(1); restart($('ap-word'), 'slam'); restart($('ap-dp'), 'rise'); moodSound('sob'); });
        return;
      }
      settleToy(); api.k(1);
      if (i < MOODS.length) { setMood(i, anim); if (anim) { moodSound(MOODS[i].snd); banner(MOODS[i], api); } return; }
      // the last beat: every mood, faster and faster, until the presenter clicks and the TV switches off
      ban.classList.remove('in'); setMood(MOODS.length - 1, false);
      if (anim) { A.sfx.whoosh(1.0, 0.18, true); loop = { t: 0, next: 0, k: 0 }; }
    },
    leave(ctx, api) {
      loop = null; ban.classList.remove('in'); settleToy(); api.el.classList.remove('iris');
      if (ctx.forward && ctx.to === 'now' && !ctx.instant) { void api.el.offsetWidth; api.el.classList.add('crt'); A.sfx.crtOff(0.5); return 640; }
      return 0;
    },
    frame(dt) {
      if (zoom) zoomFrame(dt);
      if (!loop) return;
      loop.t += dt;
      const gap = Math.max(0.055, 0.26 - loop.t * 0.07);
      if (loop.t >= loop.next) {
        loop.next = loop.t + gap;
        const n = LOOP[loop.k++ % LOOP.length];
        $('ap-pet').src = IMG(n);
        A.sfx.tick(0.055, 1300 + Math.min(1200, loop.t * 260));
      }
    },
  });

  /* ---------------- NOW · the physical, then the invisible ---------------- */
  stateScene({ id: 'now', beats: 1,
    play(i, anim, api) {
      if (!anim) { api.k(1); return; }
      A.sfx.thump(0.4);
      api.later(1100, () => { api.k(1); A.sfx.whoosh(0.7, 0.14, true); });
    },
  });

  /* ---------------- ACT 3b · Lena's job card ---------------- */
  const lnFinger = $('ln-finger');
  stateScene({ id: 'lena', beats: 2,
    reset() { parkFinger(lnFinger, 1100, 1000); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { api.k(1); api.k(2); return; }
        api.later(650, () => { api.k(1); A.sfx.notify(0.3); PH.buzz($('ln-phone')); });                 // the phone wakes up
        tap(lnFinger, $('ln-push'), 1500, api, () => { api.k(2); A.sfx.whoosh(0.4, 0.08, true); });    // a tap opens the request
        api.later(2600, () => lnFinger.classList.remove('show'));
        return;
      }
      if (!anim) { api.k(1); api.k(2); api.k(3); return; }
      api.k(1); api.k(2);
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
  const ticks = (n) => { document.querySelectorAll('#wz2 .ck').forEach((c, k) => c.classList.toggle('on', k < n)); $('wz2b').classList.toggle('off', n < 4); };
  stateScene({ id: 'start', beats: 2,
    reset() { wz(1); ticks(0); parkFinger(wzFinger, 1100, 1000); },
    play(i, anim, api) {
      if (i === 0) {
        if (!anim) { wz(4); ticks(4); return; }
        tap(wzFinger, $('wz1b'), 1000, api, () => api.later(150, () => { wz(2); A.sfx.whoosh(0.4, 0.08, true); }));
        [0, 1, 2, 3].forEach((k) => api.later(2250 + k * 150, () => { ticks(k + 1); A.sfx.tick(0.1, 1500 + k * 140); }));
        tap(wzFinger, $('wz2b'), 2700, api, () => api.later(150, () => { wz(3); A.sfx.whoosh(0.4, 0.08, true); }));
        tap(wzFinger, $('wz3b'), 4300, api, () => api.later(150, () => { wz(4); A.sfx.success(0.3); }));
        api.later(5400, () => wzFinger.classList.remove('show'));
        return;
      }
      wz(4); ticks(4); if (anim) A.sfx.thump(0.4);
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
      api.later(800, () => { api.k(1); A.sfx.notify(0.28); PH.buzz($('lp-phone')); });
      api.later(1900, () => { api.k(2); A.sfx.notify(0.22); PH.buzz($('lp-phone')); });
    },
  });

  /* ---------------- ACT 5b · call to action: three asks, a booked room and the code. The pitch ends here. ---------------- */
  stateScene({ id: 'outro', beats: 2,
    play(i, anim, api) {
      if (!anim) return;
      if (i === 0) A.sfx.thump(0.4);
      if (i === 1) { [450, 800, 1150].forEach((t, j) => api.later(t + 100, () => A.sfx.pop(520 + j * 140, 0.22))); api.later(1650, () => A.sfx.notify(0.24)); api.later(2000, () => A.sfx.boing(0.2)); api.later(2400, () => A.sfx.sparkle(0.18)); }
    },
  });

  /* ---------------- the top bar: brand + the three pillars, lit per act (OPUS/christian) ---------------- */
  const PILL = { app: 'E', calendar: 'A', lena: 'A', radar: 'A', mission: 'P', start: 'A', running: 'P', loop: 'E' };
  new MutationObserver(() => { stage.dataset.pill = PILL[stage.dataset.scene] || ''; }).observe(stage, { attributes: true, attributeFilter: ['data-scene'] });
})();
