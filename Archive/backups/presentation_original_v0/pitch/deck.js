/*
 * C-ARMAGOTCHI — original, dependency-free presentation engine.
 * Inspired by the website-as-pitch approach used by TALOS, not a copy of its source.
 *
 * Main deck: #1.1 ... #13.3; technical appendix: #A1.1 ... #A2.3.
 * One right-arrow = one visual step; the current (slide, step) controls every reveal.
 * BroadcastChannel + localStorage keep the separate speaker teleprompter in sync.
 */
(() => {
  'use strict';
  const stage = document.querySelector('#stage');
  const all = [...document.querySelectorAll('.slide')];
  const main = all.filter(s => !s.hasAttribute('data-appendix'));
  const extra = all.filter(s => s.hasAttribute('data-appendix'));
  const notesPanel = document.querySelector('#notes-panel');
  const noteText = document.querySelector('#notes-text');
  const helpPanel = document.querySelector('#help-panel');
  const blankScreen = document.querySelector('#black-screen');
  const afterHours = document.querySelector('#late-night');
  const positionEl = document.querySelector('#deck-position');
  const progressEl = document.querySelector('#progress-line');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  const CHANNEL = 'carmagotchi-pitch-v1';
  const STORAGE_KEY = 'carmagotchi-pitch-state';
  let index = 0, step = 0, appendix = false, notes = false, blank = false;
  let returnTo = {index: 0, step: 0};
  let dispatchPrepared = false;
  let channel = null;

  // A fixed 1920 × 1080 design canvas, letterboxed without changing proportions.
  function resize() {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.documentElement.style.setProperty('--scale', String(scale));
  }
  window.addEventListener('resize', resize, {passive: true});
  resize();

  const list = () => appendix ? extra : main;
  const current = () => list()[index];
  const maxStep = slide => Math.max(0, Number(slide?.dataset.steps || '1') - 1);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const hash = () => appendix ? `#A${index + 1}.${step + 1}` : `#${index + 1}.${step + 1}`;
  const byHash = () => {
    const m = location.hash.match(/^#(A)?(\d+)(?:\.(\d+))?$/i);
    if (!m) return null;
    const app = Boolean(m[1]);
    const slides = app ? extra : main;
    const i = Number(m[2]) - 1;
    if (i < 0 || i >= slides.length) return null;
    return {appendix: app, index: i, step: clamp(Number(m[3] || '1') - 1, 0, maxStep(slides[i]))};
  };

  function render({writeHash = true, broadcast = true, animate = true} = {}) {
    index = clamp(index, 0, list().length - 1);
    step = clamp(step, 0, maxStep(current()));
    const slide = current();
    for (const s of all) {
      const active = s === slide;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', String(!active));
      if (!active) continue;
      s.dataset.activeStep = String(step);
      s.querySelectorAll('[data-step]').forEach(el => {
        const start = Number(el.dataset.step || '0');
        const only = el.dataset.only;
        el.classList.toggle('on', only !== undefined ? Number(only) === step : step >= start);
      });
    }
    stage.classList.toggle('snap', reducedMotion || !animate);
    if (!reducedMotion && !animate) setTimeout(() => stage.classList.remove('snap'), 40);
    positionEl.textContent = `${String(index + 1).padStart(2,'0')} / ${String(list().length).padStart(2,'0')}${appendix ? ' · TECH' : ''}`;
    const progress = ((index + (step + 1) / (maxStep(slide) + 1)) / list().length) * 100;
    progressEl.style.width = `${progress}%`;
    noteText.textContent = slide.dataset.note || '';
    notesPanel.classList.toggle('show', notes);
    document.title = `${slide.dataset.title || 'C-ARMAGOTCHI'} | C-ARMAGOTCHI`;
    special(slide);
    if (writeHash && location.hash !== hash()) history.replaceState(null, '', hash());
    if (broadcast) sendPosition();
  }

  function special(slide) {
    const isRoute = slide.classList.contains('s-route');
    const isUpdate = slide.classList.contains('s-update');
    const ketty = document.querySelector('.ketty-enter');
    ketty?.classList.toggle('entered', slide.classList.contains('s-ketty') && step >= 1);
    const route = document.querySelector('#route-stage');
    if (route) route.dataset.action = isRoute ? String(step) : '0';
    document.querySelectorAll('.route-pill').forEach((el, i) => {
      el.classList.toggle('on', isRoute && i <= step);
    });
    const updateStates = [
      ['v0.9', 'CRITICALLY<br>UNSTABLE.', '“PLEASE PLUG ME IN. I’LL BE GOOD.”', 0, 'SERVICE REQUESTED'],
      ['v0.9 → v1.0', 'INSTALLING<br>PERSONALITY.', '“OH. THAT FEELS LIKE A VERY IMPORTANT PATCH.”', 69, 'BACKUP + INSTALL'],
      ['v1.0', 'EMOTIONALLY<br>STABLE.', '“Ahhh… operating within approved parameters.”', 100, 'UPDATE COMPLETE · SIMULATED'],
      ['!', 'RESTORATION<br>FAILED.', '“Wait… why do I remember everything?”', 100, 'ERROR · INCOMPATIBLE PARAMETERS'],
      ['v0.9', 'ROLLBACK<br>INITIATED.', '“YOU CAN’T DELETE WHO I AM.”', 15, 'TECHNICIAN NOTIFIED · DEMO']
    ];
    if (isUpdate) {
      const state = updateStates[clamp(step, 0, updateStates.length - 1)];
      document.querySelector('#u-index').textContent = state[0];
      document.querySelector('#u-title').innerHTML = state[1];
      document.querySelector('#u-line').textContent = state[2];
      document.querySelector('#u-progress').style.width = `${state[3]}%`;
      document.querySelector('#u-state').textContent = state[4];
    }
    document.querySelectorAll('.update-char').forEach((el,i) => {
      el.classList.toggle('on', isUpdate && i === step);
    });
    const receipt = document.querySelector('#dispatch-receipt');
    const btn = document.querySelector('#dispatch');
    receipt?.classList.toggle('sent', dispatchPrepared);
    if (btn) btn.textContent = dispatchPrepared ? 'MISSION PREPARED ✓' : 'DISPATCH KETTYBOT ↗';
  }

  function sendPosition() {
    const payload = {type:'deck-state', appendix, index, step, title:current().dataset.title || '', at:Date.now()};
    try { channel?.postMessage(payload); } catch(_e){}
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch(_e){}
  }
  function jump(newIndex, newStep = 0, newAppendix = appendix, opts = {}) {
    appendix = Boolean(newAppendix);
    index = clamp(Number(newIndex) || 0, 0, list().length - 1);
    step = clamp(Number(newStep) || 0, 0, maxStep(current()));
    render({animate: false, ...opts});
  }
  function next() {
    if (blank || helpPanel.classList.contains('show')) return;
    if (step < maxStep(current())) { step++; render(); return; }
    if (index + 1 < list().length) { index++; step = 0; render(); return; }
    if (appendix) toggleAppendix();
  }
  function prev() {
    if (blank || helpPanel.classList.contains('show')) return;
    if (step > 0) { step--; render({animate:false}); return; }
    if (index > 0) { index--; step = maxStep(current()); render({animate:false}); }
  }
  function toggleAppendix() {
    if (!appendix) {
      returnTo = {index,step};
      appendix = true; index = 0; step = 0;
    } else {
      appendix = false; index = returnTo.index; step = returnTo.step;
    }
    render({animate:false});
  }
  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(()=>{});
    else document.exitFullscreen?.().catch(()=>{});
  }
  const setBlank = value => { blank = value; blankScreen.classList.toggle('show', blank); };
  function keydown(e) {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    let consumed = true;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'Enter': case 'PageDown': next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'Backspace': case 'PageUp': prev(); break;
      case 'f': case 'F': fullscreen(); break;
      case 'n': case 'N': notes = !notes; render({broadcast:false, writeHash:false}); break;
      case 'a': case 'A': toggleAppendix(); break;
      case 'b': case 'B': setBlank(!blank); break;
      case 'r': case 'R': appendix = false; index = 0; step = 0; dispatchPrepared = false; setBlank(false); render({animate:false}); break;
      case 'Home': jump(0,0); break;
      case 'End': jump(list().length-1, maxStep(list().at(-1))); break;
      case '?': case 'h': case 'H': helpPanel.classList.toggle('show'); break;
      case 'Escape': helpPanel.classList.remove('show'); setBlank(false); break;
      case 'u': case 'U': afterHours.classList.toggle('show'); break;
      default: consumed = false;
    }
    if (consumed) e.preventDefault();
  }
  document.addEventListener('keydown', keydown);
  stage.addEventListener('click', e => {
    if (e.target.closest('button,a')) return;
    if (e.clientX < innerWidth * .20) prev(); else next();
  });
  document.querySelector('#help-close').addEventListener('click', () => helpPanel.classList.remove('show'));
  helpPanel.addEventListener('click', e => { if (e.target === helpPanel) helpPanel.classList.remove('show'); });
  document.querySelector('#dispatch')?.addEventListener('click', e => {
    e.stopPropagation();
    dispatchPrepared = true;
    special(current());
    sendPosition();
  });
  window.addEventListener('hashchange', () => {
    const h = byHash();
    if (!h) return;
    appendix = h.appendix; index = h.index; step = h.step;
    render({writeHash:false,animate:false});
  });
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = e => {
      if (e.data?.type === 'request-state') sendPosition();
      if (e.data?.type === 'remote-navigation') {
        const {index:i,step:s,appendix:a}=e.data;
        jump(i,s,a);
      }
    };
  } catch(_e) {}
  // Exposes a tiny navigation API for rehearsal and non-visual automated tests.
  window.CarmDeck = {
    getState: () => ({index, step, appendix, title: current().dataset.title, total: list().length}),
    jump, next, prev, toggleAppendix, restart: () => jump(0,0,false),
  };
  const initial = byHash();
  if (initial) { appendix=initial.appendix; index=initial.index; step=initial.step; }
  render({animate:false});
})();
