/* ALOHA ROBOTICS / OPUS — scene 3: the Tamagotchi. Six faces, six real problems, one loop.
   Every "WHAT IT REALLY MEANS" line is a statement the Siemens challenge owners made to us. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const el = document.getElementById('s-tama');
  const ring = document.getElementById('tama-ring');
  const $ = (id) => document.getElementById(id);
  const CX = 450, CY = 450, R = 300, C = 2 * Math.PI * R;
  const IMG = (n) => `assets/characters/${n}.webp`;

  const STATES = [
    { img: 'lonely', name: 'LONELY.', hl: '#9fd0ff', burst: '#a9d4ff', sfx: 'sniff…', sfxc: '#5aa7ff', rot: -9,
      quote: '“Nobody has plugged me in for 43 days.”',
      real: 'Parked in a hallway, switched off. No socket, no network — Siemens can’t reach it.', v: [0, 0, 2], snd: 'sob' },
    { img: 'manic', name: 'DESPERATE.', hl: '#ffe066', burst: '#ffe27a', sfx: 'PRESS ME!!', sfxc: '#ffb300', rot: -7,
      quote: '“UPDATE READY!! SOMEBODY PRESS THE BUTTON!!”',
      real: 'The package is already on board. Nurse, medical physics or IT could press install. Nobody feels responsible.', v: [1, 1, 1], snd: 'boing' },
    { img: 'update', name: 'INSTALLING.', hl: '#86f3e6', burst: '#8ff2e6', sfx: 'DON’T. TOUCH.', sfxc: '#19c7b8', rot: 6,
      quote: '“Do not unplug me. Two hours. Maybe.”',
      real: 'Installing takes about two hours. The next surgery starts in one.', v: [3, 2, 3], snd: 'tick', lcd: true },
    { img: 'bliss', name: 'BLISS.', hl: '#ffc2e0', burst: '#ffc6e4', sfx: 'ahh~ ♥', sfxc: '#ff6fae', rot: -5,
      quote: '“I feel so… secure.”',
      real: 'When it works, it’s beautiful.', v: [5, 5, 5], snd: 'sparkle' },
    { img: 'failure', name: 'DEAD ON ARRIVAL.', hl: '#ff9a9a', burst: '#ffaaa6', sfx: 'BZZZT!', sfxc: '#ff3b4e', rot: 8,
      quote: '“WHO PULLED MY PLUG?!”',
      real: 'About 2 in 100 updates leave the C-arm unusable — e.g. unplugged mid-update by someone who didn’t know.', v: [0, 0, 0], snd: 'zap', shake: true },
    { img: 'rollback', name: 'ROLLBACK…', hl: '#d6b8ff', burst: '#d7bcff', sfx: 'FIRE & PRAY', sfxc: '#9b6bff', rot: -6,
      quote: '“Fire… and pray.”',
      real: 'Siemens finds out from an angry phone call — the next morning.', v: [2, 0, 1], snd: 'glitch' },
    { img: 'manic', name: 'AGAIN.', hl: '#ffb38a', burst: '#ffbf9a', sfx: 'EVERY 90 DAYS', sfxc: '#ec6602', rot: -8,
      quote: '“See you next quarter!!”',
      real: 'A new security patch every quarter. Every C-arm. Every hospital.', v: [1, 1, 1], snd: 'whoosh', loop: true },
  ];

  /* ---------- build static parts ---------- */
  const prog = $('ring-prog');
  prog.setAttribute('stroke-dasharray', `${C} ${C}`);
  prog.setAttribute('stroke-dashoffset', `${C}`);
  const angleOf = (i) => -Math.PI / 2 + i * (Math.PI / 3);
  const stations = [], labels = [];
  ['LONELY', 'DESPERATE', 'INSTALLING', 'BLISS', 'DEAD ON ARRIVAL', 'ROLLBACK'].forEach((name, i) => {
    const a = angleOf(i), x = CX + Math.cos(a) * R, y = CY + Math.sin(a) * R;
    const s = document.createElement('div'); s.className = 'station'; s.style.left = x + 'px'; s.style.top = y + 'px';
    s.innerHTML = `<img alt="" src="${IMG(STATES[i].img)}">`; ring.appendChild(s); stations.push(s);
    const l = document.createElement('div'); l.className = 'slabel'; l.textContent = name;
    let lx = x, ly = y;
    if (i === 0) ly = y - 86; else if (i === 3) ly = y + 86;
    else if (i === 1 || i === 2) { lx = x + 76; l.classList.add('side-r'); }
    else { lx = x - 76; l.classList.add('side-l'); }
    l.style.left = lx + 'px'; l.style.top = ly + 'px'; ring.appendChild(l); labels.push(l);
  });
  // starburst polygons
  (function burst() {
    const polys = ring.querySelectorAll('#tama-burst polygon');
    [[16, 96, 62], [16, 78, 50]].forEach(([n, ro, ri], k) => {
      const pts = []; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 + k * 0.2, r = i % 2 ? ri : ro; pts.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1)); }
      polys[k].setAttribute('points', pts.join(' '));
    });
  })();
  // vitals hearts
  ['row-pow', 'row-net', 'row-upd'].forEach((cls) => { const row = el.querySelector('.' + cls); for (let i = 0; i < 5; i++) row.appendChild(Object.assign(document.createElement('i'), { className: 'hp' })); });

  /* ---------- state ---------- */
  const marker = $('tama-marker');
  const imgs = [...$('tama-char').querySelectorAll('img')];
  let curImg = 0, angle = angleOf(0), anim = null, spin = null, cur = -1, lcdTimer = 0, lcdSecs = 7199;

  function placeMarker(a) { angle = a; marker.style.left = (CX + Math.cos(a) * R) + 'px'; marker.style.top = (CY + Math.sin(a) * R) + 'px'; }
  function setProgress(i, instant) {
    const frac = i <= 0 ? 0.0001 : Math.min(1, i / 6);
    if (instant) { prog.style.transition = 'none'; requestAnimationFrame(() => (prog.style.transition = '')); }
    prog.setAttribute('stroke-dashoffset', String(C * (1 - frac)));
  }
  function swapChar(src, instant) {
    const a = imgs[curImg], b = imgs[1 - curImg];
    if (a.getAttribute('src') === src && a.classList.contains('cur')) return;
    b.src = src; b.classList.remove('out', 'in'); a.classList.remove('in');
    if (!instant) { void b.offsetWidth; b.classList.add('in'); a.classList.add('out'); }
    b.classList.add('cur'); a.classList.remove('cur');
    curImg = 1 - curImg;
  }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  function setVitals(v) {
    ['row-pow', 'row-net', 'row-upd'].forEach((cls, r) => el.querySelectorAll('.' + cls + ' .hp').forEach((h, i) => h.classList.toggle('on', i < v[r])));
  }

  function show(i, instant) {
    const s = STATES[i]; cur = i;
    const isLoop = !!s.loop;
    // ring + stations
    stations.forEach((st, k) => { st.classList.toggle('on', !isLoop && k === i); st.classList.toggle('done', isLoop || k < i); st.classList.remove('flash'); });
    labels.forEach((l, k) => l.classList.toggle('on', isLoop || k === i));
    setProgress(isLoop ? 6 : i, instant);
    const target = angleOf(isLoop ? 6 : i);
    if (instant) { anim = null; placeMarker(target); }
    else { anim = { from: angle, to: target < angle ? target + Math.PI * 2 : target, t: 0, dur: i === 0 ? 0.001 : 0.5 }; A.sfx.tick(0.08, 1600); }
    // center
    $('tama-burst').style.setProperty('--burst', s.burst); $('tama-burst').style.color = s.burst;
    swapChar(IMG(s.img), instant);
    if (s.shake && !instant) restart($('tama-char'), 'shake');
    // text
    $('tama-count').innerHTML = isLoop ? '<b>↻</b> / LOOP' : `<b>${String(i + 1).padStart(2, '0')}</b> / 06`;
    const name = $('tama-name');
    name.innerHTML = `<span class="hl">${s.name}</span>`; name.style.setProperty('--hl', s.hl);
    name.style.fontSize = s.name.length > 12 ? '88px' : '';
    $('tama-quote').textContent = s.quote;
    $('tama-real-p').textContent = s.real;
    const sfx = $('tama-sfx'); sfx.textContent = s.sfx; sfx.style.setProperty('--sfx', s.sfxc); sfx.style.setProperty('--rot', s.rot + 'deg'); sfx.style.transform = `rotate(${s.rot}deg)`;
    if (!instant) { restart(name, 'slam'); restart($('tama-quote'), 'pop'); restart($('tama-real'), 'rise'); restart(sfx, 'pop'); }
    setVitals(s.v);
    const lcd = $('tama-lcd'); lcd.classList.toggle('show', !!s.lcd); lcdSecs = 7199; lcd.textContent = '1:59:59';
    ring.classList.toggle('spin', isLoop);
    spin = isLoop ? { speed: 2.2, t: 0, lastStation: -1 } : null;
    if (!instant) {
      const snd = s.snd;
      setTimeout(() => {
        if (snd === 'sob') A.sfx.sob(0.22);
        else if (snd === 'boing') { A.sfx.boing(0.3); A.sfx.pop(700, 0.2); }
        else if (snd === 'tick') { A.sfx.tick(0.12, 2000); }
        else if (snd === 'sparkle') A.sfx.sparkle(0.25);
        else if (snd === 'zap') { A.sfx.zap(0.32); A.sfx.glitch(0.18); }
        else if (snd === 'glitch') { A.sfx.glitch(0.25); A.sfx.whoosh(0.7, 0.14, false); }
        else if (snd === 'whoosh') A.sfx.whoosh(1.2, 0.2, true);
      }, 120);
    }
  }

  OPUS.scene({ id: 'tama', el, beats: STATES.length, theme: 'paper',
    enter(ctx) {
      el.classList.remove('crt', 'iris');
      if (ctx.forward && !ctx.instant) { void el.offsetWidth; el.classList.add('iris'); A.sfx.pop(420, 0.3); }
      show(0, true);
      if (ctx.forward && !ctx.instant) { swapChar(IMG('lonely'), true); restart(imgs[curImg], 'in'); restart($('tama-name'), 'slam'); restart($('tama-quote'), 'pop'); restart($('tama-real'), 'rise'); restart($('tama-sfx'), 'pop'); setTimeout(() => A.sfx.sob(0.22), 450); }
    },
    beat(i, ctx) { show(i, ctx.instant); },
    leave(ctx) {
      spin = null;
      if (ctx.forward && ctx.to === 'cut') { el.classList.remove('iris'); void el.offsetWidth; el.classList.add('crt'); A.sfx.crtOff(0.5); return 640; }
      el.classList.remove('iris'); return 0;
    },
    frame(dt) {
      if (anim) {
        anim.t = Math.min(1, anim.t + dt / anim.dur);
        placeMarker(M.lerp(anim.from, anim.to, M.easeInOut(anim.t)));
        if (anim.t >= 1) { const a = anim.to; anim = null; placeMarker(a); }
      }
      if (spin) {                               // the endless quarterly loop speeds up
        spin.t += dt; spin.speed = Math.min(14, spin.speed + dt * 3.2);
        placeMarker(angle + spin.speed * dt);
        const rel = ((angle + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const st = Math.floor(rel / (Math.PI / 3)) % 6;
        if (st !== spin.lastStation) {
          spin.lastStation = st;
          stations.forEach((s, k) => s.classList.toggle('flash', k === st));
          swapChar(IMG(STATES[st].img), true);
          A.sfx.tick(0.06, 1400 + spin.speed * 60);
        }
      }
      if (cur === 2 && $('tama-lcd').classList.contains('show')) {
        lcdTimer += dt;
        if (lcdTimer > 0.18) { lcdTimer = 0; lcdSecs = Math.max(0, lcdSecs - 37); const h = Math.floor(lcdSecs / 3600), m = Math.floor((lcdSecs % 3600) / 60), s = lcdSecs % 60; $('tama-lcd').textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
      }
    },
  });
})();
