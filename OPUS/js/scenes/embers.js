/* ALOHA ROBOTICS / OPUS — the ember system that turns the film's explosion into the title.
   Lives on the global #fx-cv layer so particles survive the cut from <video> to the intro scene.
   Story: fireball → embers keep flying after the film's hard audio cut → "BASED ON A TRUE STORY."
   types itself → the line burns into embers → every ember is pulled into ALOHA ROBOTICS. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const L = OPUS.canvas(document.getElementById('fx-cv'), { cap: 1.6 });
  const g = L.ctx;
  const rnd = OPUS.rng(4242);
  const HEAT = [[110, 26, 8], [178, 54, 14], [232, 98, 26], [255, 150, 54], [255, 204, 118], [255, 244, 214]].map((c) => OPUS.glow(c, 48, 0.12));
  const sprite = (temp) => HEAT[M.clamp(Math.floor(temp * 5.999), 0, 5)];
  const P = [];
  const S = { on: false, t: 0, alpha: 1, fade: 0, story: null, burn: null, intro: 0, title: 0, heat: 1, sub: 0, pAlpha: 1, locked: false, ring: null, shake: 0, shineT: 0, seq: null, ambient: false, targets: null };
  const TITLE = 'ALOHA ROBOTICS', TITLE_FONT = '800 150px Manrope', TITLE_Y = 600;
  const STORY = 'BASED ON A TRUE STORY.', STORY_FONT = '500 37px ' + "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif", STORY_SP = 13, STORY_Y = 556;
  const INTRO = 'INTRODUCING', INTRO_FONT = '600 27px Manrope', INTRO_SP = 17, INTRO_Y = 414;
  const SUB = 'SIEMENS HEALTHINEERS  ·  CHALLENGE 04  ·  INVISIBLE CONNECTIVITY', SUB_FONT = '600 21px "JetBrains Mono"', SUB_SP = 6, SUB_Y = 712;

  /* letter-spaced text that renders identically everywhere (no reliance on ctx.letterSpacing) */
  function spacedWidth(ctx, text, sp) { let w = 0; for (const ch of text) w += ctx.measureText(ch).width + sp; return w - sp; }
  function drawSpaced(ctx, text, cx, y, sp, upto) {
    const w = spacedWidth(ctx, text, sp); let x = cx - w / 2, i = 0;
    for (const ch of text) { if (upto != null && i >= upto) break; ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; i++; }
    return { left: cx - w / 2, right: cx + w / 2, width: w };
  }

  function add(x, y, vx, vy, temp, life, size) {
    const p = { x, y, vx, vy, temp, life, max: life, size, mode: 'free', tx: 0, ty: 0, delay: 0, prog: 0, dur: 1.2, a: 1, seed: rnd() * 1000 };
    P.push(p); return p;
  }

  /* ---------- the fireball's leftovers, timed to the last 0.8 s of the film ---------- */
  function explode() {
    S.on = true; S.alpha = 1; S.fade = 0;
    for (let i = 0; i < 360; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 260, sp = 120 + Math.pow(rnd(), 1.6) * 900;
      add(960 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.7, Math.cos(a) * sp, Math.sin(a) * sp * 0.75 - 120, 0.65 + rnd() * 0.35, 2.4 + rnd() * 3.2, 1.1 + rnd() * 2.6);
    }
    for (let i = 0; i < 26; i++) { // slow, big, soft flakes for depth
      const a = rnd() * Math.PI * 2;
      add(960 + Math.cos(a) * 200, 560 + Math.sin(a) * 140, Math.cos(a) * 90, Math.sin(a) * 60 - 60, 0.5 + rnd() * 0.3, 3 + rnd() * 2.5, 5 + rnd() * 6).flake = true;
    }
  }

  /* ---------- intro sequence ---------- */
  function runIntro(instant) {
    S.on = true; S.alpha = 1; S.fade = 0; S.locked = false; S.title = 0; S.intro = 0; S.sub = 0; S.heat = 1; S.pAlpha = 1; S.ring = null; S.burn = null; S.ambient = false;
    S.story = { shown: 0, alpha: 1 };
    const tl = (S.seq = OPUS.timeline().start());
    if (instant) { lockNow(true); return; }
    if (!P.length) explode();                       // arrived without the film (direct jump)
    A.sfx.boomTail(3.6, 0.62);
    const n = STORY.length;
    for (let i = 0; i <= n; i++) tl.at(0.35 + i * 0.055, () => { S.story.shown = i; if (i < n && STORY[i] !== ' ') A.sfx.tick(0.035, 1700 + (i % 3) * 90); });
    tl.at(2.2, burnStory);
    tl.at(2.7, formTitle);
    tl.at(2.95, () => { S.introFade = 1; });
    tl.at(4.8, () => lockNow(false));
  }

  function burnStory() {
    const pts = OPUS.samplePoints((c) => { c.font = STORY_FONT; c.fillStyle = '#fff'; c.textBaseline = 'alphabetic'; drawSpaced(c, STORY, 960, STORY_Y, STORY_SP); }, 3);
    pts.sort((a, b) => a[0] - b[0]);
    const xs = pts.map((p) => p[0]);
    S.burn = { pts, i: 0, front: Math.min(...xs) - 6, end: Math.max(...xs) + 6, speed: (Math.max(...xs) - Math.min(...xs) + 12) / 0.5 };
    A.sfx.crackle(0.9, 0.35);
  }

  function formTitle() {
    let targets = OPUS.samplePoints((c) => { c.font = TITLE_FONT; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(TITLE, 960, TITLE_Y); }, 4);
    if (targets.length > 3400) targets = targets.filter((_, i) => i % Math.ceil(targets.length / 3400) === 0);
    targets.sort((a, b) => a[0] - b[0]);
    S.targets = targets;
    // flush any unburnt story pixels into particles
    if (S.burn) { while (S.burn.i < S.burn.pts.length) { const [x, y] = S.burn.pts[S.burn.i++]; add(x, y, (rnd() - 0.5) * 60, -40 - rnd() * 80, 1, 3, 1.2 + rnd()); } S.story.alpha = 0; }
    const live = P.filter((p) => p.life > 0.2).sort((a, b) => a.x - b.x);
    const need = targets.length - live.length;
    for (let i = 0; i < need; i++) { // extra sparks rise from the floor and the sides to fill the letters
      const fromEmber = live.length && rnd() < 0.45 ? live[Math.floor(rnd() * live.length)] : null;   // embers split, sparks rise
      const x = fromEmber ? fromEmber.x + (rnd() - 0.5) * 40 : 120 + rnd() * 1680, y = fromEmber ? fromEmber.y + (rnd() - 0.5) * 40 : 1090 + rnd() * 160;
      live.push(add(x, y, (rnd() - 0.5) * 80, -60 - rnd() * 120, 0.55 + rnd() * 0.3, 6, 1 + rnd() * 1.4));
    }
    live.sort((a, b) => a.x - b.x);
    const extra = live.length - targets.length;
    live.forEach((p, i) => {
      if (i >= targets.length) { p.life = Math.min(p.life, 1.2); return; }
      const [tx, ty] = targets[i];
      p.mode = 'seek'; p.tx = tx; p.ty = ty; p.prog = 0; p.dur = 1.05 + rnd() * 0.35;
      p.delay = M.inv(380, 1540, tx) * 0.42 + rnd() * 0.12; p.life = 99; p.max = 99; p.flake = false;
      p.size = 1.05 + rnd() * 0.9;
    });
    if (extra > 0) S.extra = extra;
    A.sfx.whoosh(1.55, 0.32, true);
  }

  function lockNow(instant) {
    if (S.locked) return;
    S.locked = true;
    if (instant) {
      P.length = 0; S.story = { shown: 0, alpha: 0 }; S.burn = null;
      S.intro = 1; S.introFade = 1; S.title = 1; S.heat = 0; S.sub = 1; S.pAlpha = 0; S.ambient = true;
      return;
    }
    for (const p of P) { if (p.mode === 'seek') { p.mode = 'hold'; p.x = p.tx; p.y = p.ty; p.vx = p.vy = 0; } }
    S.title = 1; S.heat = 1; S.pAlpha = 1; S.shake = 0.32; S.introFade = 1;
    S.ring = { r: 40, a: 0.9 };
    A.sfx.hit(0.95);
    S.seq.at(S.seq.time + 0.55, () => { S.subFade = 1; A.sfx.sparkle(0.12); });
    S.seq.at(S.seq.time + 1.2, () => { S.ambient = true; });
  }

  function fadeOut(sec) { S.fade = sec || 0.4; }
  function reset() { P.length = 0; S.on = false; S.story = null; S.burn = null; S.title = 0; S.intro = 0; S.sub = 0; S.introFade = 0; S.subFade = 0; S.locked = false; S.ring = null; S.ambient = false; S.seq && S.seq.stop(); L.clear(); }

  /* ---------- simulation ---------- */
  let T = 0;
  function update(dt) {
    T += dt;
    if (S.seq) S.seq.update(dt);
    if (S.fade > 0) { S.alpha -= dt / S.fade; if (S.alpha <= 0) { reset(); return; } }
    if (S.introFade) S.intro = Math.min(1, S.intro + dt / 0.7);
    if (S.subFade) S.sub = Math.min(1, S.sub + dt / 0.9);
    if (S.locked) { S.heat = Math.max(0, S.heat - dt / 1.5); S.pAlpha = Math.max(0, S.pAlpha - dt / 0.8); }
    if (S.ring) { S.ring.r += dt * 1700; S.ring.a -= dt * 1.1; if (S.ring.a <= 0) S.ring = null; }
    if (S.shake > 0) S.shake -= dt;
    if (S.burn) {
      const b = S.burn; b.front += b.speed * dt;
      while (b.i < b.pts.length && b.pts[b.i][0] < b.front) { const [x, y] = b.pts[b.i++]; if (b.i % 2) add(x, y, (rnd() - 0.5) * 50, -30 - rnd() * 90, 1, 2.5 + rnd() * 2, 1 + rnd() * 1.2); }
      if (b.front > b.end) { S.story.alpha = 0; }
    }
    if (S.ambient && rnd() < dt * 9) add(200 + rnd() * 1520, 1100, (rnd() - 0.5) * 20, -50 - rnd() * 60, 0.45 + rnd() * 0.35, 9, 0.8 + rnd() * 1.3);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      if (p.mode === 'hold') { p.temp = M.lerp(p.temp, 0.75, dt * 2); continue; }
      if (p.mode === 'seek' && p.delay <= 0) {
        p.prog = Math.min(1, p.prog + dt / p.dur);
        const w = M.lerp(2.6, 15, M.easeIn(p.prog)), z = 0.82;
        const n = OPUS.noise(p.x * 0.004 + p.seed, p.y * 0.004 + T * 0.3) * Math.PI * 2, swirl = 260 * (1 - p.prog);
        p.vx += (w * w * (p.tx - p.x) - 2 * z * w * p.vx + Math.cos(n) * swirl) * dt;
        p.vy += (w * w * (p.ty - p.y) - 2 * z * w * p.vy + Math.sin(n) * swirl) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.temp = M.lerp(p.temp, 0.95, dt * 1.5);
        if (p.prog >= 1 && Math.abs(p.tx - p.x) < 1.5 && Math.abs(p.ty - p.y) < 1.5) { p.mode = 'hold'; p.x = p.tx; p.y = p.ty; }
        continue;
      }
      if (p.mode === 'seek') p.delay -= dt;
      const n = OPUS.noise(p.x * 0.0035 + T * 0.12, p.y * 0.0035 - T * 0.08) * Math.PI * 2;
      const drag = Math.exp(-(p.flake ? 0.6 : 1.15) * dt);
      p.vx = p.vx * drag + Math.cos(n) * 70 * dt;
      p.vy = p.vy * drag + (Math.sin(n) * 70 - 46 * p.temp) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.temp = Math.max(0.06, p.temp - dt * (p.flake ? 0.12 : 0.2));
      p.life -= dt;
      p.a = M.clamp(p.life / Math.min(p.max, 1.2), 0, 1);
      if (p.life <= 0 || p.y < -60) P.splice(i, 1);
    }
  }

  /* ---------- render ---------- */
  const titleCv = document.createElement('canvas'), tg = titleCv.getContext('2d');
  function drawTitle(alpha) {
    const k = L.k, w = 1920, h = 260, y0 = TITLE_Y - 180;
    if (titleCv.width !== Math.round(w * k)) { titleCv.width = Math.round(w * k); titleCv.height = Math.round(h * k); }
    tg.setTransform(k, 0, 0, k, 0, -y0 * k); tg.clearRect(0, y0, w, h);
    tg.globalCompositeOperation = 'source-over';
    const col = OPUS.color.mix([255, 246, 236], [255, 172, 88], S.heat);
    tg.font = TITLE_FONT; tg.textAlign = 'center'; tg.textBaseline = 'alphabetic';
    tg.fillStyle = OPUS.color.rgba(col, 1); tg.fillText(TITLE, 960, TITLE_Y);
    S.shineT += 1 / 60;
    const ph = (S.shineT % 4.6) / 1.1;                 // shine sweeps for 1.1 s every 4.6 s
    if (S.heat < 0.3 && ph < 1) {
      tg.globalCompositeOperation = 'source-atop';
      const x = M.lerp(300, 1650, ph), gr = tg.createLinearGradient(x - 140, 0, x + 140, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,214,150,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      tg.fillStyle = gr; tg.fillRect(x - 160, y0, 320, h);
    }
    g.save();
    g.globalAlpha = alpha;
    g.shadowColor = OPUS.color.rgba([255, 140, 50], 0.18 + 0.55 * S.heat); g.shadowBlur = 14 + 40 * S.heat;
    g.drawImage(titleCv, 0, y0, w, h);
    g.restore();
  }

  function render() {
    if (!S.on) return;
    L.clear();
    g.save();
    if (S.shake > 0) { const s = S.shake * 22; g.translate((rnd() - 0.5) * s, (rnd() - 0.5) * s); }
    g.globalAlpha = 1;
    // text layers (normal blending)
    if (S.story && S.story.alpha > 0 && S.story.shown > 0) {
      g.font = STORY_FONT; g.textBaseline = 'alphabetic';
      g.save();
      if (S.burn) { g.beginPath(); g.rect(S.burn.front, 0, 1920, 1080); g.clip(); }
      g.fillStyle = `rgba(236,226,206,${0.92 * S.alpha * S.story.alpha})`;
      g.shadowColor = 'rgba(255,160,80,.25)'; g.shadowBlur = 10;
      drawSpaced(g, STORY, 960, STORY_Y, STORY_SP, S.story.shown);
      g.restore();
      if (S.burn && S.burn.front < S.burn.end) {
        const gr = g.createLinearGradient(S.burn.front - 26, 0, S.burn.front + 6, 0);
        gr.addColorStop(0, 'rgba(255,120,30,0)'); gr.addColorStop(1, 'rgba(255,200,120,.9)');
        g.fillStyle = gr; g.fillRect(S.burn.front - 26, STORY_Y - 34, 32, 46);
      }
    }
    if (S.intro > 0) { g.font = INTRO_FONT; g.fillStyle = `rgba(238,230,216,${0.82 * S.intro * S.alpha})`; drawSpaced(g, INTRO, 960, INTRO_Y + (1 - M.easeOut(S.intro)) * 10, INTRO_SP); }
    if (S.title > 0) drawTitle(S.alpha);
    if (S.sub > 0) { g.font = SUB_FONT; g.fillStyle = `rgba(168,190,196,${S.sub * S.alpha})`; drawSpaced(g, SUB, 960, SUB_Y, SUB_SP); g.fillStyle = `rgba(236,102,2,${0.8 * S.sub * S.alpha})`; g.fillRect(960 - 40, SUB_Y - 52, 80, 2); }
    // particles (additive)
    g.globalCompositeOperation = 'lighter';
    for (const p of P) {
      const a = (p.mode === 'hold' ? S.pAlpha : p.a) * S.alpha;
      if (a <= 0.01) continue;
      const s = p.size * (0.7 + p.temp * 0.9) * (p.flake ? 1.6 : 1);
      g.globalAlpha = Math.min(1, a * (p.flake ? 0.35 : 1));
      g.drawImage(sprite(p.temp), p.x - s * 2.2, p.y - s * 2.2, s * 4.4, s * 4.4);
    }
    if (S.ring) { g.globalAlpha = Math.max(0, S.ring.a) * S.alpha; g.strokeStyle = 'rgba(255,190,120,.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(960, TITLE_Y - 50, S.ring.r, S.ring.r * 0.32, 0, 0, Math.PI * 2); g.stroke(); }
    g.restore();
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }

  OPUS.ticker.add((dt) => { if (!S.on) return; update(dt); if (S.on) render(); });
  window.addEventListener('resize', () => { titleCv.width = 0; });

  OPUS.embers = { explode, runIntro, lockNow, fadeOut, reset, get locked() { return S.locked; }, get count() { return P.length; } };
})();
