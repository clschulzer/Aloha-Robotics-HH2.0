/* ALOHA ROBOTICS / OPUS v3 — scene 6: the night.
   The golden window has flown into the clock; the clock runs to 22:00. KettyBot leaves its dock with a
   battery pack, a network cable and the signed package, finds Bogdan in OR 2, checks the certificate,
   plugs in power and network (no Wi-Fi in the OR, nothing changed on the C-arm), clears the area.
   Beat 2: one human, IT on call, taps Start; the install runs while the clock races to 00:20; verified,
   logs home, KettyBot drives back. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const $ = (id) => document.getElementById(id);
  const el = $('s-night');
  const C = () => OPUS.clock24;
  const t = (h, m) => h * 60 + m;
  OPUS.flowSeed = { x: 1700, y: 76 };          // the calendar's golden window flies into the clock

  const route = $('nt-route'), LEN = route.getTotalLength(), bot = $('nt-bot'), cv = $('nt-cv'), log = $('nt-log');
  const prg = $('nt-prg'), CIRC = 2 * Math.PI * 92;
  prg.style.strokeDasharray = `${CIRC} ${CIRC}`;
  const LOG = [
    ['22:00', 'KettyBot leaves the dock · battery · cable · signed package 4.2.1'],
    ['22:11', 'Bogdan found in OR 2 · serial + certificate ✓'],
    ['22:13', 'Power + network plugged in · no Wi-Fi needed'],
    ['22:15', 'Area clear · nobody within 2 m · no sterile field'],
    ['22:20', 'IT on call taps Start — a human starts every update'],
    ['22:20', 'Installing 4.2.1 · rollback image kept'],
    ['00:20', 'Verified ✓ · logs home to Siemens · KettyBot back to the dock'],
  ];
  let timers = [], drive = null, ring = null;
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  function place(d) { const p = route.getPointAtLength(M.clamp(d, 0, LEN)); bot.style.left = (p.x - 60) + 'px'; bot.style.top = (p.y - 92) + 'px'; }
  function addLog(i, animate) { const d = document.createElement('div'); d.className = 'lg' + (animate ? ' new' : ''); d.innerHTML = `<i>${LOG[i][0]}</i><span>${LOG[i][1]}</span>`; log.appendChild(d); }
  function setRing(v) { prg.style.strokeDashoffset = String(CIRC * (1 - v)); }
  const title = $('nt-title');
  function setTitle(html, animate) {
    const spans = title.querySelectorAll('span'), cur = title.querySelector('span.cur') || spans[0], nxt = cur === spans[0] ? spans[1] : spans[0];
    if (cur.innerHTML === html) return;
    if (!animate) { spans.forEach((s) => s.classList.remove('cur', 'old')); cur.innerHTML = html; cur.classList.add('cur'); nxt.innerHTML = ''; return; }
    nxt.classList.remove('old'); nxt.innerHTML = html; void nxt.offsetWidth; cur.classList.remove('cur'); cur.classList.add('old'); nxt.classList.add('cur');
  }
  function stagePos(node) { const r = node.getBoundingClientRect(), s = $('stage').getBoundingClientRect(), k = OPUS.stageScale || 1; return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k }; }
  const cls = (...c) => c.forEach((x) => el.classList.add(x));

  function reset() {
    clear(); drive = null; ring = null; log.innerHTML = ''; setRing(0); place(0);
    el.classList.remove('lit', 'found', 'wired', 'scan', 'card', 'started', 'upd', 'done', 'home');
    const f = $('nt-finger'); f.classList.remove('show', 'press');
    setTitle('KettyBot rolls<b>.</b>', false);
  }
  function settle(i) {
    reset();
    if (i === 0) { place(LEN); cls('lit', 'found', 'wired', 'scan'); [0, 1, 2, 3].forEach((k) => addLog(k)); C().set(t(22, 15), 0); return; }
    place(0); cls('lit', 'found', 'card', 'started', 'upd', 'done', 'home'); setRing(1); LOG.forEach((_, k) => addLog(k)); C().set(t(0, 20), 0);
    setTitle('Installed<b>.</b> Verified<b>.</b>', false);
  }
  function playRoll(delay) {
    later(delay, () => C().ff(t(22, 0), 900));
    later(delay + 950, () => { addLog(0, true); drive = { from: 0, to: LEN, t: 0, dur: 2.4 }; C().ff(t(22, 11), 2400); A.sfx.grow(0.08, 2.2); A.sfx.whoosh(1.6, 0.06, true); });
    later(delay + 3400, () => { cls('lit', 'found'); addLog(1, true); A.sfx.chime(0.24, 660); });
    later(delay + 3950, () => { cls('wired'); addLog(2, true); C().ff(t(22, 13), 400); A.sfx.tap(0.26); A.sfx.pop(900, 0.14); });
    later(delay + 4650, () => { cls('scan'); addLog(3, true); C().ff(t(22, 15), 400); A.sfx.shimmer(0.12, 1.2); });
  }
  function playStart() {
    const f = $('nt-finger');
    C().ff(t(22, 20), 500);
    setTitle('A human starts it<b>.</b>', true);
    later(300, () => { cls('card'); A.sfx.notify(0.3); });
    later(1150, () => { const p = stagePos($('nt-start')); Object.assign(f.style, { left: p.x + 'px', top: (p.y + 40) + 'px' }); f.classList.add('show'); });
    later(1250, () => { const p = stagePos($('nt-start')); Object.assign(f.style, { left: p.x + 'px', top: p.y + 'px' }); });
    later(1850, () => { f.classList.add('press'); A.sfx.tap(0.32); const r = $('nt-rip'); r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); cls('started'); addLog(4, true); });
    later(2050, () => f.classList.remove('press'));
    later(2300, () => { cls('upd'); addLog(5, true); ring = { t: 0, dur: 2.6 }; C().ff(t(24, 20), 2600); A.sfx.grow(0.1, 2.6); f.classList.remove('show'); });
    later(5000, () => { cls('done'); addLog(6, true); setTitle('Installed<b>.</b> Verified<b>.</b>', true); A.sfx.success(0.3); later(160, () => A.sfx.sparkle(0.22)); });
    later(5700, () => { el.classList.remove('wired', 'scan'); cls('home'); drive = { from: LEN, to: 0, t: 0, dur: 2.2 }; A.sfx.whoosh(1.4, 0.06, false); });
  }

  OPUS.scene({ id: 'night', el, beats: 2, theme: 'dark',
    enter(ctx) {
      reset();
      if (ctx.instant || !ctx.forward) { settle(0); return; }
      C().set(t(15, 27), 30); C().run(true);
      playRoll(ctx.from === 'calendar' ? 1150 : 200);
    },
    beat(i, ctx) {
      if (ctx.instant) { settle(i); return; }
      clear(); if (i === 1) { if (!el.classList.contains('scan')) { settle(0); } playStart(); }
    },
    leave() { clear(); drive = null; ring = null; return 0; },
    frame(dt) {
      if (drive) { drive.t += dt; const k = Math.min(1, drive.t / drive.dur); place(M.lerp(drive.from, drive.to, M.easeInOut(k))); if (k >= 1) drive = null; }
      if (ring) { ring.t += dt; const k = Math.min(1, ring.t / ring.dur); setRing(M.easeInOut(k)); if (k >= 1) ring = null; }
    },
  });
})();
