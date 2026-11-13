/* ALOHA ROBOTICS / OPUS — scene 7: the close.
   1) the challenge owners' own words, 2) three "withouts", 3) everything dissolves — the point of
   invisible connectivity is that nobody notices it — leaving IAI, 4) Aloha Robotics + KettyBot's wink. */
(function () {
  'use strict';
  const OPUS = window.OPUS, M = OPUS.math, A = OPUS.audio;
  const el = document.getElementById('s-outro');
  const L = OPUS.canvas(document.getElementById('ou-cv'), { cap: 1.6 });
  const g = L.ctx;
  const $ = (id) => document.getElementById(id);
  const SPR = OPUS.glow([200, 255, 250], 24, 0.3);
  const LINES = [
    { text: 'Every C-arm.', font: '800 96px Manrope', y: 372, col: [246, 248, 250], beat: 0, d: 0.05 },
    { text: 'Connected. Up and running. Safe to operate.', font: '300 58px Manrope', y: 466, col: [200, 210, 218], beat: 0, d: 0.55 },
    { text: 'No surgery waits.', font: '600 46px Manrope', y: 606, col: [214, 222, 228], beat: 1, d: 0.0, dash: true },
    { text: 'Nobody makes a phone call.', font: '600 46px Manrope', y: 676, col: [214, 222, 228], beat: 1, d: 0.85, dash: true },
    { text: 'No nurse takes the risk.', font: '600 46px Manrope', y: 746, col: [214, 222, 228], beat: 1, d: 1.7, dash: true },
  ];
  const S = { beat: -1, t: 0, lineA: LINES.map(() => 0), dissolved: false, parts: [], inv: 0, ai: 0, iai: 0, sub: 0, lift: 0, timers: [] };
  const later = (ms, fn) => S.timers.push(setTimeout(fn, ms));

  function colLeft(ctx) { ctx.font = LINES[3].font; const w = Math.max(...LINES.filter((l) => l.dash).map((l) => ctx.measureText(l.text).width)); return 960 - w / 2 + 22; }
  function drawLine(ctx, ln, a, dy) {
    ctx.font = ln.font; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = OPUS.color.rgba(ln.col, a);
    if (ln.dash) {
      const x = colLeft(ctx); ctx.font = ln.font; ctx.textAlign = 'left'; ctx.fillText(ln.text, x, ln.y + dy);
      ctx.fillStyle = `rgba(62,240,224,${a})`; ctx.fillRect(x - 46, ln.y + dy - 17, 26, 4);
    } else { ctx.textAlign = 'center'; ctx.fillText(ln.text, 960, ln.y + dy); }
  }
  function dissolve() {
    let pts = OPUS.samplePoints((c) => { LINES.forEach((ln, i) => { if (S.lineA[i] > 0.5) drawLine(c, ln, 1, 0); }); }, 3);
    if (pts.length > 7000) pts = pts.filter((_, i) => i % Math.ceil(pts.length / 7000) === 0);
    const r = OPUS.rng(77);
    S.parts = pts.map(([x, y]) => ({ x, y, vx: (r() - 0.5) * 40, vy: -20 - r() * 70, life: 0.9 + r() * 1.3, t: -r() * 0.5 * ((x - 300) / 1300), s: 0.8 + r() * 1.2 }));
    S.dissolved = true; S.lineA = LINES.map(() => 0);
    A.sfx.whoosh(1.6, 0.16, false);
  }
  function clearTimers() { S.timers.forEach(clearTimeout); S.timers = []; }
  function reset() { clearTimers(); LINES.forEach((ln) => (ln.go = 0)); Object.assign(S, { beat: -1, t: 0, lineA: LINES.map(() => 0), dissolved: false, parts: [], inv: 0, ai: 0, iai: 0, sub: 0, lift: 0, invTarget: 0, aiTarget: 0, iaiTarget: 0, subTarget: 0, liftTarget: 0 }); ['ou-logo', 'ou-q', 'ou-ketty', 'ou-foot'].forEach((id) => $(id).classList.remove('show', 'winking')); L.clear(); }

  function wink() { const k = $('ou-ketty'); k.classList.add('winking'); A.sfx.sparkle(0.22); setTimeout(() => k.classList.remove('winking'), 420); }

  function go(i, instant) {
    S.beat = i;
    if (instant) {
      clearTimers();
      S.lineA = LINES.map((ln) => (i <= 1 && ln.beat <= i ? 1 : 0));
      LINES.forEach((ln) => (ln.go = i <= 1 && ln.beat <= i ? 1 : 0));
      S.dissolved = i >= 2; S.parts = [];
      S.inv = S.invTarget = 0;
      S.ai = S.aiTarget = i >= 2 ? 1 : 0; S.iai = S.iaiTarget = i >= 2 ? 1 : 0; S.sub = S.subTarget = i >= 2 ? 1 : 0;
      S.lift = S.liftTarget = i >= 3 ? 1 : 0;
      ['ou-logo', 'ou-q', 'ou-ketty', 'ou-foot'].forEach((id) => $(id).classList.toggle('show', i >= 3));
      return;
    }
    if (i === 0) LINES.forEach((ln, k) => { if (ln.beat === 0) later((ln.d + (S.offset || 0)) * 1000, () => (ln.go = 1)); });
    if (i === 1) LINES.forEach((ln, k) => { if (ln.beat === 1) later(ln.d * 1000, () => { ln.go = 1; A.sfx.tick(0.05, 900); }); });
    if (i === 2) {
      LINES.forEach((ln, k) => { if (ln.beat <= 1) { ln.go = 0; S.lineA[k] = 1; } });
      dissolve();
      later(700, () => (S.invTarget = 0.9));
      later(1900, () => (S.invTarget = 0));
      later(2800, () => (S.aiTarget = 1));
      later(3550, () => { S.iaiTarget = 1; A.sfx.shimmer(0.24, 3); });
      later(4300, () => (S.subTarget = 1));
    }
    if (i === 3) {
      S.liftTarget = 1;
      later(350, () => { $('ou-logo').classList.add('show'); A.sfx.hit(0.55); });
      later(500, () => { $('ou-q').classList.add('show'); $('ou-foot').classList.add('show'); $('ou-ketty').classList.add('show'); });
      later(450, () => A.sfx.whoosh(0.9, 0.18, true));
      later(2300, wink); later(5200, wink);
    }
  }

  OPUS.scene({ id: 'outro', el, beats: 4, theme: 'dark',
    enter(ctx) { reset(); S.offset = ctx.forward && ctx.from === 'arch' && !ctx.instant ? 0.75 : 0; go(0, ctx.instant); },
    beat(i, ctx) { if (ctx.instant) { reset(); go(i, true); return; } go(i, false); },
    leave() { clearTimers(); return 0; },
    frame(dt, T) {
      S.t += dt;
      LINES.forEach((ln, k) => { if (ln.go) S.lineA[k] = Math.min(1, S.lineA[k] + dt / 0.75); });
      const ease = (cur, tgt, sp) => cur + (tgt - cur) * Math.min(1, dt * sp);
      S.inv = ease(S.inv, S.invTarget || 0, S.invTarget ? 2.2 : 3.4);
      S.ai = ease(S.ai, S.aiTarget || 0, 3); S.iai = ease(S.iai, S.iaiTarget || 0, 2.4); S.sub = ease(S.sub, S.subTarget || 0, 2.4);
      S.lift = ease(S.lift, S.liftTarget || 0, 3.2);
      L.clear();
      // headline lines
      LINES.forEach((ln, k) => { const a = S.lineA[k]; if (a > 0.01) { g.save(); g.filter = a < 0.98 ? `blur(${((1 - a) * 8).toFixed(1)}px)` : 'none'; drawLine(g, ln, M.easeOut(a), (1 - M.easeOut(a)) * 14); g.restore(); } });
      // dissolving particles
      if (S.parts.length) {
        g.globalCompositeOperation = 'lighter';
        for (let i = S.parts.length - 1; i >= 0; i--) {
          const p = S.parts[i]; p.t += dt; if (p.t < 0) { g.globalAlpha = 0.9; g.drawImage(SPR, p.x - 3, p.y - 3, 6, 6); continue; }
          if (p.t > p.life) { S.parts.splice(i, 1); continue; }
          const n = OPUS.noise(p.x * 0.006, p.y * 0.006 + T * 0.4) * Math.PI * 2;
          p.vx += Math.cos(n) * 60 * dt; p.vy += (Math.sin(n) * 60 - 30) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          g.globalAlpha = (1 - p.t / p.life) * 0.9; const s = p.s * 6 * (1 - p.t / p.life * 0.5); g.drawImage(SPR, p.x - s / 2, p.y - s / 2, s, s);
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      // "invisible." fades in, then away
      if (S.inv > 0.01) { g.font = '200 156px Manrope'; g.textAlign = 'center'; g.fillStyle = `rgba(236,242,246,${S.inv})`; g.fillText('invisible.', 960, 600); }
      // IAI
      const lift = M.easeInOut(S.lift), oy = -268 * lift, sc = 1 - 0.46 * lift;
      if (S.ai > 0.01) { g.font = '500 27px "JetBrains Mono"'; g.textAlign = 'center'; g.fillStyle = `rgba(138,151,165,${S.ai * (1 - lift)})`; g.fillText('Everyone’s talking about AI.', 960, 372); }
      if (S.iai > 0.01) {
        g.save(); g.translate(960, 660 + oy); g.scale(sc, sc);
        g.font = '800 300px Manrope'; g.textAlign = 'center';
        const gr = g.createLinearGradient(-260, -230, 260, 20); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#bff8f2'); gr.addColorStop(1, '#3ef0e0');
        g.shadowColor = `rgba(62,240,224,${0.45 * S.iai})`; g.shadowBlur = 50;
        g.globalAlpha = S.iai; g.fillStyle = gr; g.fillText('IAI', 0, (1 - S.iai) * 30);
        g.restore();
      }
      if (S.sub > 0.01) {
        g.save(); g.translate(960, 752 + oy * 1.12); g.scale(1 - 0.25 * lift, 1 - 0.25 * lift);
        g.font = '600 25px "JetBrains Mono"'; g.textAlign = 'center'; g.fillStyle = `rgba(62,240,224,${S.sub})`;
        const t = 'I N V I S I B L E   A G E N T I C   I N T E L L I G E N C E'; g.fillText(t, 0, 0);
        g.restore();
      }
    },
  });
})();
