/* C-ARMAGOTCHI cinematic film -> INTRODUCING handoff.
 * Scoped to the 3-minute encore. Does not replace the deck engine or media.
 * The last video frame becomes a dark ember field. After it has settled, the
 * slide engine advances ONCE, with the INTRODUCING impact masking the cut.
 * Early presenter clicks still work. Direct hashes and reverse navigation do
 * not replay the special effect.
 */
(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const film = document.getElementById('chaos-video');
  const filmScene = document.querySelector('.scene-video');
  const teamScene = document.querySelector('.scene-encore-team');
  const heading = teamScene?.querySelector('.encore-screech');
  if (!stage || !film || !filmScene || !teamScene || !heading) return;

  // No extra slide or click. INTRODUCING replaces the original first team beat.
  heading.innerHTML = 'INTRODUCING<span>.</span>';
  const bridge = document.createElement('div');
  bridge.id = 'ember-intro-bridge';
  bridge.setAttribute('aria-hidden','true');
  bridge.innerHTML = '<div class="bridge-shock"><div class="bridge-ember-field"></div><div class="bridge-streaks"></div><div class="bridge-intro-title">INTRODUCING<span>.</span></div></div>';
  stage.appendChild(bridge);
  const field = bridge.querySelector('.bridge-ember-field');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const sounds = document.getElementById('impact-sound');
  let autoTimer = 0, impactTimer = 0, exitTimer = 0, doneTimer = 0;
  let transitioning = false, pending = false, lastScene = filmScene.classList.contains('active') ? 'film' : 'other';
  let tailComplete = false;

  // Deterministic art direction: the same sparse amber embers on each run.
  let seed = 24119;
  function rand(){seed = (Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<68;i++){
    const dot = document.createElement('i');
    dot.className = 'bridge-ember';
    const style = dot.style;
    const spread = 2.5+rand()*7;
    style.setProperty('--x', (3+rand()*94)+'%');
    style.setProperty('--y', (-15+rand()*82)+'%');
    style.setProperty('--size', spread+'px');
    style.setProperty('--stretch', (1.2+rand()*2.3).toFixed(2));
    style.setProperty('--blur', (1+rand()*3.6)+'px');
    style.setProperty('--rotation', (-38+rand()*76)+'deg');
    style.setProperty('--brightness', (.26+rand()*.60).toFixed(2));
    style.setProperty('--duration',(740+rand()*410)+'ms');
    style.setProperty('--delay',(rand()*115)+'ms');
    style.setProperty('--drift',(-80+rand()*160)+'px');
    style.setProperty('--fall',(900+rand()*560)+'px');
    field.appendChild(dot);
  }
  function clearTimers(){
    for(const t of [autoTimer,impactTimer,exitTimer,doneTimer]) clearTimeout(t);
    autoTimer = impactTimer = exitTimer = doneTimer = 0;
  }
  function reset(){
    clearTimers();
    transitioning = false;
    pending = false;
    tailComplete = false;
    bridge.className = '';
    bridge.style.pointerEvents = 'none';
  }
  function videoIsActive(){return filmScene.classList.contains('active');}
  function teamIsActive(){return teamScene.classList.contains('active');}
  function playImpact(){
    if (film.muted) return;
    try {
      if(sounds){ sounds.pause();sounds.currentTime=0;sounds.volume=.36;sounds.play().catch(()=>{}); }
    } catch(_){}
  }
  function startTail(){
    if(!videoIsActive() || reduced) return;
    clearTimers();
    pending = true;
    tailComplete = false;
    bridge.className = '';
    // Flush animation reset so replaying the video restarts all particles.
    void bridge.offsetWidth;
    bridge.className = 'bridge-tail';
    autoTimer = setTimeout(() => {
      tailComplete = true;
      if(videoIsActive() && !transitioning) beginTransition(true);
    },1330);
  }
  function beginTransition(advanceDeck){
    if(reduced){
      if(advanceDeck && videoIsActive())window.CarmDeck?.next();
      reset(); return;
    }
    if(transitioning) return;
    transitioning = true;
    pending = false;
    clearTimers();
    // Do not expose the slide cut beneath the text impact.
    const waitedForFall = tailComplete;
    if (!bridge.classList.contains('bridge-tail')) {
      bridge.className = '';
      void bridge.offsetWidth;
      bridge.className = 'bridge-tail';
    }
    bridge.classList.add('bridge-transition');
    if(waitedForFall) bridge.classList.add('bridge-clear');
    if(advanceDeck && videoIsActive()) window.CarmDeck?.next();
    // Early clicks finish the ember fall before the title lands. When the
    // film has already finished, no new sparks restart from the top.
    const impactDelay = waitedForFall ? 145 : 520;
    impactTimer = setTimeout(() => {bridge.classList.add('bridge-impact');playImpact();},impactDelay);
    exitTimer = setTimeout(() => {bridge.classList.add('bridge-exit');},impactDelay+1000);
    doneTimer = setTimeout(() => { reset(); },impactDelay+1520);
  }

  film.addEventListener('ended',startTail);
  film.addEventListener('play',()=>{if(videoIsActive())reset();});
  film.addEventListener('seeking',()=>{if(videoIsActive())reset();});
  // Presentation engine toggles .active on the slide. Observe it rather than
  // monkey-patching advance() or relying on URL timing.
  const observer = new MutationObserver(() => {
    const scene = teamIsActive() ? 'team' : videoIsActive() ? 'film' : 'other';
    if (scene===lastScene) return;
    const prev = lastScene;
    lastScene = scene;
    if (scene==='team' && prev==='film' && !transitioning) beginTransition(false);
    else if (scene!=='team' && scene!=='film' && transitioning) reset();
    else if (scene==='film' && prev!=='film') reset();
  });
  observer.observe(filmScene,{attributes:true,attributeFilter:['class']});
  observer.observe(teamScene,{attributes:true,attributeFilter:['class']});

  // Suppress only accidental double-forward clicks during the 1.8s bridge.
  const forwardKeys = new Set(['ArrowRight','ArrowDown','PageDown','Enter',' ']);
  window.addEventListener('keydown',e=>{
    if(!transitioning || !forwardKeys.has(e.key)) return;
    e.preventDefault();e.stopImmediatePropagation();
  },true);
  bridge.addEventListener('click',e=>{e.stopPropagation();});
  // During the impact, prevent a second click from leaking to the deck.
  stage.addEventListener('click',e=>{
    if(transitioning){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  window.addEventListener('pagehide',()=>{observer.disconnect();reset();},{once:true});
  window.CarmIntroBridge = { replay:()=>{reset(); if(videoIsActive()&&film.ended)startTail();}, isTransitioning:()=>transitioning, reset };
})();
