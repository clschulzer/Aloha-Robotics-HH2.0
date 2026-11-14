/* ASTRA technical cut. Cue controls adapted from Ember; rendering and audio primitives from OPUS. */
const O=window.OPUS, A=O.audio, C=window.PITCH, D=window.DAY;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const stage=$('#stage'), film=$('#film'), scenes=$$('.scene'), reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const asset=name=>`../../assets/characters/${name}.webp`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brand='<div class="smallbrand">ALOHA</div>';
const cueList=C.cues.map((c,i)=>({at:c[0],scene:c[1],step:c[2],title:c[3],note:c[4],i}));
let cue=0,elapsed=0,auto=false,running=false,started=false,paused=false,overlay=null,wasRunning=false,sceneTime=0,lastNow=performance.now(),epoch=0,filmTail=false,freezeAtEnd=false,crt=false,sfx=true;
let currentScene='',currentStep=-1,transitionAnimations=[],mediaResumeWanted=false;
const timers=new Set();
function later(fn,ms){const token=epoch;const t=setTimeout(()=>{timers.delete(t);if(token===epoch)fn();},ms);timers.add(t);return t;}
function clearTimers(){for(const t of timers)clearTimeout(t);timers.clear();}
function fit(){O.stageScale=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform=`translate(-50%,-50%) scale(${O.stageScale})`;O.fitCanvases();}
addEventListener('resize',fit);fit();
document.documentElement.style.setProperty('--accent',C.accent);document.documentElement.style.setProperty('--gold',C.gold);document.documentElement.style.setProperty('--paper',C.paper);
document.body.dataset.version=C.id;
A.volume=.44;A.setMuted(false);

function render({instant=false}={}){
  const c=cueList[cue],old=currentScene;const change=old!==c.scene;currentScene=c.scene;currentStep=c.step;sceneTime=0;epoch++;clearTimers();crt=false;
  for(const a of transitionAnimations)a.cancel();transitionAnimations=[];
  if(change){
    scenes.forEach(el=>{el.classList.remove('active','leaving','crt');el.dataset.step=c.step;el.style.transform='';el.style.opacity='';});
    const active=$(`.scene[data-scene="${c.scene}"]`);active.classList.add('active');
    if(c.scene==='cut'&&!instant&&!reduce)transitionAnimations.push(active.animate([{transform:'translateY(1080px)'},{transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.76,0,.24,1)'}));
    if(c.scene==='moods'&&!instant&&!reduce)transitionAnimations.push(active.animate([{clipPath:'circle(0% at 37% 57%)'},{clipPath:'circle(105% at 37% 57%)'}],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'}));
  }
  const el=$(`.scene[data-scene="${c.scene}"]`);el.dataset.step=c.step;
  $('#cue-label').textContent=`${c.title} · ${formatTime(c.at)}`;$('#cue-note').textContent=c.note;
  stage.dataset.scene=c.scene;stage.dataset.step=c.step;stage.dataset.cue=cue;
  history.replaceState(null,'',`#${cue+1}`);
  publish();document.dispatchEvent(new CustomEvent('astra:cue',{detail:{...c,instant}}));
}
function formatTime(t){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function setPause(value){
  paused=!!value;O.paused=paused;document.body.classList.toggle('paused',paused);$('#pause').textContent=paused?'Resume':'Pause';
  if(paused){running=false;mediaResumeWanted=currentScene==='film'&&!film.paused;film.pause();A.ctx?.suspend();for(const anim of document.getAnimations())anim.pause();}
  else{
    if(started&&!freezeAtEnd)running=true;
    A.ctx?.resume();for(const anim of document.getAnimations())anim.play();
    if(currentScene==='film'&&(mediaResumeWanted||started)){const e=epoch;film.play().then(()=>{if(e!==epoch||paused||currentScene!=='film')film.pause();}).catch(()=>{running=false;});}
  }document.dispatchEvent(new CustomEvent('astra:pause',{detail:paused}));publish();
}
async function start(timed){
  epoch++;auto=timed;started=true;freezeAtEnd=false;elapsed=0;lastPublish=0;cue=0;paused=false;O.paused=false;filmTail=false;
  $('#launch').hidden=true;sfx=$('#sfx-choice').checked;A.unlock();A.setMuted(!sfx);$('#sound').textContent=sfx?'SFX ON':'SFX OFF';
  render();film.muted=false;film.currentTime=0;
  if(currentScene!=='film'){running=true;lastNow=performance.now();return;}
  const e=epoch;
  try{await film.play();if(e===epoch&&!paused&&currentScene==='film')running=true;else film.pause();}catch{if(e===epoch){$('#launch').hidden=false;started=false;running=false;}}
}
function go(n,{instant=false,align=false}={}){
  n=Math.max(0,Math.min(cueList.length-1,n));if(n===cue&&!instant)return;
  cue=n;if(align)elapsed=cueList[n].at;
  if(cueList[n].scene!=='film')film.pause();
  freezeAtEnd=false;render({instant});
}
function next(){if(overlay)return;if(currentScene==='film'&&started&&!film.ended)return;if(!started&&cue===0){start(false);return;}auto=false;go(cue+1);}
function prev(){if(overlay||currentScene==='film'&&started&&!film.ended)return;auto=false;go(cue-1);}
function reset(){
  epoch++;clearTimers();running=false;started=false;auto=false;paused=false;O.paused=false;elapsed=0;lastPublish=0;freezeAtEnd=false;film.pause();film.currentTime=0;mediaResumeWanted=false;filmTail=false;cue=0;overlay=null;
  A.ctx?.resume();$('#launch').hidden=false;$('#notes').hidden=true;$('#help').hidden=true;$('#blackout').hidden=true;document.body.classList.remove('paused');render({instant:true});
}
function toggleEffects(){sfx=!sfx;A.unlock();A.setMuted(!sfx);$('#sfx-choice').checked=sfx;$('#sound').textContent=sfx?'SFX ON':'SFX OFF';}
function toggleOverlay(name){
  if(overlay){$('#'+overlay).hidden=true;overlay=null;if(wasRunning)setPause(false);return;}
  overlay=name;wasRunning=!paused&&running;$('#'+name).hidden=false;if(!paused)setPause(true);
}
function toggleTimed(){if(!started&&cue===0){start(true);return;}auto=!auto;if(auto){elapsed=cueList[cue].at;started=true;freezeAtEnd=false;setPause(false);}publish();}
film.addEventListener('ended',()=>{if(currentScene==='film'&&started){elapsed=cueList[1].at;cue=1;running=!paused;render();}});
film.addEventListener('waiting',()=>{if(currentScene==='film')running=false;});
film.addEventListener('playing',()=>{if(currentScene==='film'&&started&&!paused&&!overlay)running=true;});
const channel=new BroadcastChannel(`astra-versions-${C.id}`);
function state(){return {version:C.id,cue,scene:currentScene,step:currentStep,elapsed,auto,running,paused,started,sfx,notes:cueList[cue].note,title:cueList[cue].title,film:{currentTime:film.currentTime,duration:film.duration,muted:film.muted,paused:film.paused},winner:D?.winner?.window??null,backup:D?.backup?.id??null};}
function publish(){channel.postMessage({type:'state',...state()});}
channel.onmessage=e=>{if(e.data?.type==='next')next();if(e.data?.type==='prev')prev();if(e.data?.type==='get')publish();};
$('#start').onclick=()=>start(false);$('#preview').onclick=()=>start(true);$('#next').onclick=next;$('#prev').onclick=prev;
$('#pause').onclick=()=>setPause(!paused);$('#sound').onclick=toggleEffects;
$('#note-toggle').onclick=()=>$('#notes').hidden=!$('#notes').hidden;
const fullscreen=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
$('#full').onclick=fullscreen;$('#help-close').onclick=()=>toggleOverlay('help');
let controlTimer;
function controls(){document.body.classList.add('controls-visible');clearTimeout(controlTimer);controlTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2000);}
addEventListener('pointermove',controls);
stage.addEventListener('click',e=>{if(e.target.closest('button,a,label,input,#help,#launch,#notes'))return;next();});
addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea'))return;controls();const k=e.key.toLowerCase();
  if(['arrowright','arrowdown',' ','enter','pagedown'].includes(k)){e.preventDefault();next();}
  else if(['arrowleft','arrowup','pageup','backspace'].includes(k)){e.preventDefault();prev();}
  else if(k==='home'||k==='r'){e.preventDefault();reset();}
  else if(k==='p')setPause(!paused);
  else if(k==='t')toggleTimed();
  else if(k==='s')toggleEffects();
  else if(k==='n')$('#notes').hidden=!$('#notes').hidden;
  else if(k==='f')fullscreen();
  else if(k==='b')toggleOverlay('blackout');
  else if(k==='h'||k==='?')toggleOverlay('help');
  else if(k==='escape'&&overlay)toggleOverlay(overlay);
});
let lastPublish=0;
O.ticker.add((dt)=>{
  const now=performance.now(),clockDt=Math.max(0,(now-lastNow)/1000);lastNow=now;
  if(running&&!paused&&currentScene!=='film')elapsed=Math.min(180,elapsed+clockDt);
  if(currentScene==='film'&&started){
    elapsed=film.currentTime;
  }
  if(!paused)sceneTime+=dt;
  if(auto&&running&&currentScene!=='film'){
    let n=cue;while(n+1<cueList.length&&elapsed>=cueList[n+1].at)n++;
    if(n!==cue)go(n);
    if(elapsed>=180){running=false;freezeAtEnd=true;elapsed=180;}
  }
  $('#time').textContent=formatTime(elapsed);
  if(elapsed-lastPublish>.35){lastPublish=elapsed;publish();}
});
window.ASTRA={getState:state,next,prev,start,pause:setPause,reset,go:(n)=>{started=true;auto=false;$('#launch').hidden=true;go(n,{instant:true,align:true});},cues:cueList,model:D};
await document.fonts.ready;
const initial=Number(location.hash.slice(1));
if(Number.isInteger(initial)&&initial>1&&initial<=cueList.length){$('#launch').hidden=true;started=true;cue=initial-1;elapsed=cueList[cue].at;render({instant:true});}
else render({instant:true});
addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1));if(n>0&&n<=cueList.length)window.ASTRA.go(n-1);});
