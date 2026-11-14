/* ALOHA ROBOTICS / OPUS — deck engine.
   Scenes register themselves with OPUS.scene({...}); the engine owns navigation, the 1920x1080
   stage, presenter sync, the pitch clock and rehearsal autoplay.
   Contract per scene: enter(ctx) / beat(i, ctx) / leave(ctx) / frame(dt, t) / beats / theme.
   Forward single steps animate; backwards and jumps settle instantly (ctx.instant = true). */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage');
  const scenes = [];
  const appendix = [];
  const params = new URLSearchParams(location.search);
  const CHANNEL = 'aloha-opus-v3', KEY = 'aloha-opus-v3-state';
  const st = { list: scenes, index: 0, beat: 0, inAppendix: false, ret: null, lastNav: 0, black: false };
  const clock = { running: false, start: 0, acc: 0, get elapsed() { return this.acc + (this.running ? (performance.now() - this.start) / 1000 : 0); } };
  OPUS.clock = clock;

  /* ---------- stage fit ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / OPUS.W, window.innerHeight / OPUS.H);
    OPUS.stageScale = s;
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
    OPUS.fitCanvases();
  }
  window.addEventListener('resize', fit, { passive: true });

  /* ---------- registry ---------- */
  OPUS.scene = function (def) {
    const sc = Object.assign({ beats: 1, theme: 'dark', enter() {}, beat() {}, leave() {}, frame: null }, def);
    (sc.appendix ? appendix : scenes).push(sc);
    return sc;
  };
  const cur = () => st.list[st.index];

  /* ---------- navigation ---------- */
  function activate(sc, ctx) {
    stage.dataset.theme = sc.theme;
    stage.dataset.scene = sc.id;
    sc.el.classList.add('active');
    sc.el.setAttribute('aria-hidden', 'false');
    sc._t = 0;
    sc.enter(ctx);
  }
  function deactivate(sc, ctx) {
    const hold = sc.leave(ctx) || 0;
    sc.el.classList.remove('active');
    sc.el.setAttribute('aria-hidden', 'true');
    if (hold > 0) {
      sc.el.classList.add('leaving');
      clearTimeout(sc._holdTimer);
      sc._holdTimer = setTimeout(() => sc.el.classList.remove('leaving'), hold);
    } else sc.el.classList.remove('leaving');
  }
  function settleFlash() {
    stage.classList.add('instant');
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('instant')));
  }
  function go(index, beat, opts) {
    const o = Object.assign({ forward: false, instant: true }, opts || {});
    const from = cur();
    index = OPUS.math.clamp(index, 0, st.list.length - 1);
    const to = st.list[index];
    if (o.instant) settleFlash();
    if (from && from !== to) deactivate(from, { to: to.id, forward: o.forward, instant: o.instant });
    st.index = index;
    st.beat = OPUS.math.clamp(beat || 0, 0, to.beats - 1);
    if (from !== to) activate(to, { forward: o.forward, instant: o.instant, from: from && from.id });
    if (st.beat > 0 || (from === to)) to.beat(st.beat, { forward: o.forward, instant: o.instant });
    if (to.id === 'film' && o.forward && !clock.running) startClock(true);
    render();
  }
  OPUS.go = go;
  OPUS.goto = (id, beat = 0, opts) => { const i = st.list.findIndex((s) => s.id === id); if (i >= 0) go(i, beat, opts); };

  function next(force, remote) {
    const now = performance.now();
    if (!force && !remote && now - st.lastNav < 160) return;   // clicker bounce guard
    st.lastNav = now;
    if (st.black) { setBlack(false); return; }
    const sc = cur();
    if (!force && sc.onNext && sc.onNext() === true) return;
    if (st.beat < sc.beats - 1) { st.beat++; sc.beat(st.beat, { forward: true, instant: false }); render(); return; }
    if (st.index < st.list.length - 1) go(st.index + 1, 0, { forward: true, instant: false });
    else if (st.inAppendix) toggleAppendix();
  }
  function prev() {
    if (st.black) { setBlack(false); return; }
    const sc = cur();
    if (st.beat > 0) { st.beat--; settleFlash(); sc.beat(st.beat, { forward: false, instant: true }); render(); return; }
    if (st.index > 0) { const p = st.list[st.index - 1]; go(st.index - 1, p.beats - 1, { forward: false, instant: true }); }
  }
  OPUS.next = next; OPUS.prev = prev;

  function toggleAppendix() {
    if (!appendix.length) return;
    const from = cur();
    if (!st.inAppendix) { st.ret = { index: st.index, beat: st.beat }; deactivate(from, { to: 'appendix', instant: true }); st.list = appendix; st.inAppendix = true; st.index = -1; go(0, 0, { instant: true }); }
    else { deactivate(from, { to: 'main', instant: true }); st.list = scenes; st.inAppendix = false; st.index = -1; go(st.ret.index, st.ret.beat, { instant: true }); }
  }

  /* ---------- pitch clock ---------- */
  function startClock(reset) { if (reset) clock.acc = 0; clock.start = performance.now(); clock.running = true; }
  function toggleClock() { if (clock.running) { clock.acc = clock.elapsed; clock.running = false; } else startClock(false); }
  function resetClock() { clock.acc = 0; clock.running = false; }
  const fmt = (s) => { s = Math.max(0, s); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
  OPUS.fmt = fmt;

  /* ---------- overlays ---------- */
  function setBlack(v) { st.black = v; $('#blackout').classList.toggle('show', v); }
  function toggle(id) { $(id).classList.toggle('show'); }
  function noteFor(sc, beat) { const n = (OPUS.NOTES || {})[sc.id]; return n ? n[Math.min(beat, n.length - 1)] : null; }

  /* ---------- render + sync ---------- */
  let channel = null;
  try { channel = new BroadcastChannel(CHANNEL); } catch (_) {}
  function snapshot() {
    const sc = cur();
    const armed = !!(OPUS.audio.ctx && OPUS.audio.ctx.state === 'running') || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
    return { type: 'state', id: sc.id, index: st.index, beat: st.beat, beats: sc.beats, total: st.list.length, appendix: st.inAppendix, elapsed: clock.elapsed, running: clock.running, muted: OPUS.audio.muted, armed, ids: st.list.map((s) => s.id), at: Date.now() };
  }
  function broadcast() { const s = snapshot(); try { channel && channel.postMessage(s); } catch (_) {} try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {} }
  function render() {
    const sc = cur(), n = noteFor(sc, st.beat);
    $('#notes-body').textContent = n ? n.say : '';
    $('#notes-cue').textContent = `${sc.id.toUpperCase()} · BEAT ${st.beat + 1}/${sc.beats}` + (n && n.at != null ? ` · TARGET ${fmt(n.at)}` : '');
    const hash = `#${sc.id}${st.beat ? '.' + (st.beat + 1) : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
    broadcast();
  }
  setInterval(() => {
    broadcast();
    const hud = $('#hud');
    if (hud.classList.contains('show')) { const sc = cur(), n = noteFor(sc, st.beat); hud.textContent = `${fmt(clock.elapsed)}  ·  ${sc.id} ${st.beat + 1}/${sc.beats}` + (n && n.at != null ? `  ·  target ${fmt(n.at)}  (${(clock.elapsed - n.at >= 0 ? '+' : '')}${Math.round(clock.elapsed - n.at)}s)` : ''); }
  }, 250);
  function handleMsg(m) {
    m = m || {};
    if (m.type === 'hello') broadcast();
    if (m.type === 'nav') { if (m.action === 'next') next(false, true); if (m.action === 'prev') prev(); if (m.action === 'goto') OPUS.goto(m.id, m.beat || 0, { instant: true }); if (m.action === 'restart') restart(); }
    if (m.type === 'clock') { if (m.action === 'toggle') toggleClock(); if (m.action === 'reset') resetClock(); }
    if (m.type === 'mute') OPUS.audio.setMuted(!OPUS.audio.muted);
  }
  if (channel) channel.onmessage = (e) => handleMsg(e.data);

  function restart() { setBlack(false); resetClock(); if (st.inAppendix) toggleAppendix(); go(0, 0, { instant: true }); }

  /* ---------- input ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    let handled = true;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter': next(e.shiftKey); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': prev(); break;
      case 'f': case 'F': if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); break;
      case 'm': case 'M': OPUS.audio.unlock(); OPUS.audio.setMuted(!OPUS.audio.muted); toastMsg(OPUS.audio.muted ? 'SFX MUTED' : 'SFX ON'); break;
      case 'b': case 'B': case '.': setBlack(!st.black); break;
      case 'n': case 'N': toggle('#notes'); break;
      case 't': case 'T': toggle('#hud'); break;
      case 'h': case 'H': case '?': toggle('#help'); break;
      case 'a': case 'A': toggleAppendix(); break;
      case 'p': case 'P': window.open('presenter.html', 'aloha-presenter', 'width=1100,height=760'); break;
      case 'r': case 'R': restart(); break;
      case 'c': case 'C': toggleClock(); toastMsg(clock.running ? 'CLOCK RUNNING' : 'CLOCK PAUSED'); break;
      case 'Home': go(0, 0); break;
      case 'End': go(st.list.length - 1, st.list[st.list.length - 1].beats - 1); break;
      case 'Escape': ['#help', '#notes'].forEach((s) => $(s).classList.remove('show')); setBlack(false); break;
      default:
        if (/^[1-9]$/.test(e.key) && st.list[+e.key - 1]) go(+e.key - 1, 0); else handled = false;
    }
    if (handled) e.preventDefault();
  });
  stage.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input')) return;
    const r = stage.getBoundingClientRect();
    if (e.clientX < r.left + r.width * 0.16) prev(); else next();
  });
  let idle = 0;
  document.addEventListener('mousemove', () => { document.body.classList.remove('nocursor'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('nocursor'), 1400); });

  function toastMsg(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1100); }
  OPUS.toast = toastMsg;

  /* ---------- per-frame: active scene + lingering exits ---------- */
  OPUS.ticker.add((dt, t) => {
    const sc = cur(); if (!sc) return;
    sc._t = (sc._t || 0) + dt;
    if (sc.frame) sc.frame(dt, t);
    for (const other of scenes) if (other !== sc && other.el.classList.contains('leaving') && other.frame) other.frame(dt, t);
  });

  /* ---------- rehearsal autoplay (?auto): advances on the target clock in OPUS.NOTES ---------- */
  function autoplay() {
    const plan = [];
    scenes.forEach((sc, i) => { const n = (OPUS.NOTES || {})[sc.id] || []; for (let b = 0; b < sc.beats; b++) if (n[b] && n[b].at != null && !(i === 0 && b === 0)) plan.push({ i, b, at: n[b].at, auto: n[b].auto }); });
    let k = 0;
    OPUS.ticker.add(() => {
      if (!clock.running || k >= plan.length) return;
      const p = plan[k];
      if (clock.elapsed >= p.at) {
        k++;
        if (p.auto) return;                    // the scene advances itself (film end, etc.)
        if (st.index === p.i && st.beat === p.b) return;
        if (st.index < p.i || (st.index === p.i && st.beat < p.b)) next(true);
      }
    });
  }

  /* ---------- boot ---------- */
  OPUS.boot = function () {
    fit();
    scenes.forEach((s) => { s.el.classList.remove('active'); s.el.setAttribute('aria-hidden', 'true'); });
    appendix.forEach((s) => { s.el.classList.remove('active'); s.el.setAttribute('aria-hidden', 'true'); });
    if (params.has('mute')) OPUS.audio.setMuted(true);
    const fromHash = () => {
      const m = location.hash.match(/^#([a-z-]+|\d+)(?:\.(\d+))?/i);
      if (!m) return null;
      const i = /^\d+$/.test(m[1]) ? +m[1] - 1 : scenes.findIndex((s) => s.id === m[1]);
      return i >= 0 ? { index: i, beat: (+m[2] || 1) - 1 } : null;
    };
    const h0 = fromHash() || { index: 0, beat: 0 };
    go(h0.index, h0.beat, { instant: true });
    window.addEventListener('hashchange', () => { const h = fromHash(); if (h && !st.inAppendix && (h.index !== st.index || h.beat !== st.beat)) go(h.index, h.beat, { instant: true }); });
    if (params.has('auto')) { autoplay(); setTimeout(() => { if (st.index === 0) next(true); }, +(params.get('auto') || 600)); }
    if (!channel) window.addEventListener('storage', (e) => { if (e.key === 'aloha-opus-v3-cmd' && e.newValue) { try { handleMsg(JSON.parse(e.newValue)); } catch (_) {} } });
  };
  OPUS.state = () => snapshot();
})();
