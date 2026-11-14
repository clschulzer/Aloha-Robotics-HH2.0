/* ALOHA ROBOTICS / OPUS v3 — scene 3: the C-ARMAGOTCHI (v3 captions).
   The toy drops in, beeps, and its screen grows into the slide. Then one face per click:
   the face, its mood, and the one real problem it stands for. Beat 7 loops the faces faster and
   faster until the presenter clicks: the old TV switches off (handled in leave). */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const el = document.getElementById('s-tama');
  const $ = (id) => document.getElementById(id);
  const IMG = (n) => `assets/characters/${n}.webp`;

  const STATES = [
    { img: 'lonely', head: 'Left on read', col: '#4b9dff', halo: '#d6e7ff', means: 'Parked in a hallway.<br>No socket, no network.', snd: 'sob' },
    { img: 'manic', head: 'Clingy', col: '#f0a800', halo: '#ffefb8', means: 'A patch is waiting.<br>Nobody thinks it’s their job.', snd: 'boing' },
    { img: 'update', head: 'Busy', col: '#12b3a3', halo: '#c9f3ed', means: 'Two hours, hands off.<br>And somebody has to press start.', snd: 'tick' },
    { img: 'bliss', head: 'Glowing', col: '#ff5fa2', halo: '#ffdcec', means: 'Updated. Secure.<br>Briefly.', snd: 'sparkle' },
    { img: 'failure', head: 'Flatlined', col: '#ff3b4e', halo: '#ffd9d9', means: 'Someone needed it —<br>and pulled the plug mid-update.', snd: 'zap', shake: true },
    { img: 'rollback', head: 'Plot twist', col: '#8b5cf6', halo: '#e8ddff', means: 'Rollback. A technician,<br>a phone call, a lost day.', snd: 'glitch' },
    { loop: true, head: 'Repeat', col: '#ec6602', halo: '#ffe2cc', means: 'Every patch. Every C-arm.<br>Every hospital.' },
  ];
  // preload so swaps never flash
  STATES.forEach((s) => { if (s.img) { const i = new Image(); i.src = IMG(s.img); } });

  const imgs = [...$('tm-char').querySelectorAll('img')];
  const pips = [...$('tm-pips').querySelectorAll('i')];
  const slide = $('tm-slide'), egg = $('tm-egg'), lcdbg = $('tm-lcdbg'), eggSvg = $('tm-eggsvg');
  const VB0 = '-700 -220 1920 1080';
  let curImg = 0, cur = -1, loop = null, zoom = null, timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const restart = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

  /* the toy's LCD: the lonely face, downsampled to a few pixels */
  (function paintLcd() {
    const cv = $('tm-lcd'), g = cv.getContext('2d'), im = new Image();
    im.onload = () => { g.imageSmoothingEnabled = true; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(im, 4, 0, 66, 66); };
    im.src = IMG('lonely');
  })();

  function swapChar(src, animate) {
    const a = imgs[curImg], b = imgs[1 - curImg];
    if (a.getAttribute('src') === src && a.classList.contains('cur')) return;
    b.src = src; b.classList.remove('out', 'in'); a.classList.remove('in', 'out');
    if (animate) { void b.offsetWidth; b.classList.add('in'); a.classList.add('out'); }
    b.classList.add('cur'); a.classList.remove('cur');
    curImg = 1 - curImg;
  }
  function setText(s, animate) {
    const head = $('tm-head'), means = $('tm-means');
    head.innerHTML = `${s.head}<b>.</b>`;
    el.style.setProperty('--col', s.col);
    means.innerHTML = s.means;
    $('tm-halo').style.backgroundColor = s.halo;
    if (animate) { restart(head, 'slam'); restart(means, 'rise'); }
  }
  function setPips(i) { pips.forEach((p, k) => { p.classList.toggle('on', k === i); p.classList.toggle('done', i < 0 || k < i); }); }
  function sound(snd) {
    if (snd === 'sob') A.sfx.sob(0.22);
    else if (snd === 'boing') { A.sfx.boing(0.3); A.sfx.pop(700, 0.18); }
    else if (snd === 'tick') { A.sfx.tick(0.12, 2000); setTimeout(() => A.sfx.tick(0.1, 2000), 260); }
    else if (snd === 'sparkle') A.sfx.sparkle(0.25);
    else if (snd === 'zap') { A.sfx.zap(0.32); A.sfx.glitch(0.16); }
    else if (snd === 'glitch') { A.sfx.glitch(0.24); A.sfx.whoosh(0.6, 0.12, false); }
  }

  function show(i, animate) {
    const s = STATES[i]; cur = i;
    loop = null; $('tm-spin').classList.remove('on');
    if (s.loop) {
      setText(s, animate); setPips(-1);
      loop = { t: 0, next: 0, k: 0, gap: 0.26, ang: 0, speed: 3 };
      $('tm-spin').classList.add('on');
      if (animate) A.sfx.whoosh(1.0, 0.18, true);
      return;
    }
    swapChar(IMG(s.img), animate);
    setText(s, animate); setPips(i);
    if (animate) { if (s.shake) restart($('tm-char'), 'shake'); later(110, () => sound(s.snd)); }
  }

  /* entering from the title: iris opens, the toy drops, beeps, and its screen becomes the slide */
  /* zoom into the toy's screen: the SVG viewBox closes in on the LCD while the slide grows out of it, in lockstep
     (vector zoom: no giant layers, smooth on any laptop) */
  function zoomFrame(dt) {
    zoom.t += dt;
    const k = Math.min(1, zoom.t / 0.62), e = M.easeInOut(k);
    const s = 0.1146 + (1 - 0.1146) * e, vbW = 220 / s, vbH = vbW * 1080 / 1920;
    eggSvg.setAttribute('viewBox', `${260 - vbW / 2} ${295 - 515 * vbH / 1080} ${vbW} ${vbH}`);
    slide.style.transform = `scale(${s})`;
    egg.style.opacity = k < 0.72 ? '1' : String(Math.max(0, 1 - (k - 0.72) / 0.28));
    if (k >= 1) { zoom = null; slide.style.transform = ''; egg.classList.remove('zooming'); egg.style.opacity = '0'; eggSvg.setAttribute('viewBox', VB0); }
  }
  function intro() {
    slide.classList.add('hidden'); slide.style.transform = 'scale(.1146)'; $('tm-text').classList.add('pre');
    eggSvg.setAttribute('viewBox', VB0); egg.classList.remove('zooming'); restart(egg, 'drop');
    A.sfx.pop(420, 0.26);
    later(380, () => A.sfx.boing(0.28));
    later(820, () => { restart(lcdbg, 'blink'); A.sfx.pop(1800, 0.12); later(180, () => A.sfx.pop(1800, 0.12)); });
    later(1250, () => {
      slide.classList.remove('hidden');
      egg.classList.remove('drop'); egg.classList.add('zooming'); zoom = { t: 0 };
      A.sfx.whoosh(0.7, 0.2, true);
    });
    later(1900, () => { $('tm-text').classList.remove('pre'); restart($('tm-head'), 'slam'); restart($('tm-means'), 'rise'); A.sfx.sob(0.22); });
  }
  function settleToy() { clearTimers(); zoom = null; egg.classList.remove('drop', 'zooming'); egg.style.opacity = '0'; eggSvg.setAttribute('viewBox', VB0); slide.classList.remove('hidden'); slide.style.transform = ''; $('tm-text').classList.remove('pre'); }

  OPUS.scene({ id: 'tama', el, beats: STATES.length, theme: 'paper',
    enter(ctx) {
      clearTimers(); zoom = null; el.classList.remove('crt', 'iris'); egg.style.opacity = '';
      show(0, false);
      if (ctx.forward && !ctx.instant) { void el.offsetWidth; el.classList.add('iris'); intro(); }
      else settleToy();
    },
    beat(i, ctx) { if (ctx.instant) { settleToy(); show(i, false); return; } settleToy(); show(i, true); },
    leave(ctx) {
      clearTimers(); loop = null;
      if (ctx.forward && ctx.to === 'now' && !ctx.instant) { el.classList.remove('iris'); void el.offsetWidth; el.classList.add('crt'); A.sfx.crtOff(0.5); return 640; }
      el.classList.remove('iris'); return 0;
    },
    frame(dt) {
      if (zoom) zoomFrame(dt);
      if (!loop) return;
      loop.t += dt;
      loop.speed = Math.min(16, loop.speed + dt * 4.2);
      loop.ang += loop.speed * dt * 57.3;
      $('tm-spin').style.transform = `rotate(${loop.ang % 360}deg)`;
      loop.gap = Math.max(0.055, 0.26 - loop.t * 0.07);
      if (loop.t >= loop.next) {
        loop.next = loop.t + loop.gap;
        const k = loop.k++ % 6, s = STATES[k];
        swapChar(IMG(s.img), false);
        $('tm-halo').style.backgroundColor = s.halo;
        pips.forEach((p, j) => { p.classList.toggle('on', j === k); p.classList.remove('done'); });
        A.sfx.tick(0.055, 1300 + Math.min(1200, loop.t * 260));
      }
    },
  });
})();
