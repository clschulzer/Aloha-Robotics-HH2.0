/* ASTRA polish of the team's C-ARMAGOTCHI encore.
   Retains the original stage sizing, mood data/crossfade contract, clicker model,
   deep links, CarmDeck API and BroadcastChannel presenter synchronization.
   Six acts only. The full team film is never edited, accelerated or muted by default. */
import { mountScheduler, mountArchitecture } from './visuals.mjs';
import { CUES, NOTES } from './show.mjs';

const root = document.getElementById('stage');
const all = [...document.querySelectorAll('.slide')];
const $ = sel => document.querySelector(sel);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const channelName = 'aloha-astra-v2';
const storageKey = 'aloha-astra-v2-state';
let index=0, step=0, notes=false, black=false, channel, currentSlide=null;
let started=false, auto=false, clockRunning=false, elapsedBase=0, clockAnchor=0;
let completed=false, introDone=false, introAt=0, motionFrame=0, lastPublished=-1;
let playbackGeneration=0, overlaySnapshot=null;
const film = $('#chaos-video');
let filmSoundOn=true;
const sceneNames=['INTRO','CHARACTERS','THE SHIFT','GOLDEN WINDOW','ARCHITECTURE','THE PATIENT'];
const stepCounts=[1,6,2,5,5,2];
const stageVisuals = [null,null,null,mountScheduler($('#scheduler-visual')),mountArchitecture($('#architecture-visual')),null];
const moodStates = [
  ['GHOSTED BY<br>THE NETWORK.','“It’s been 43 days since someone connected me.”','STATE / DISCONNECTED',0,'lonely'],
  ['CRITICALLY<br>UNSTABLE.','“PLEASE PLUG ME IN. I’LL BE GOOD.”','PERSONALITY v0.9 / UNSTABLE',9,'manic'],
  ['INSTALLING<br>IMPULSE CONTROL.','“Oh. That feels like a very important patch.”','BACKUP → INSTALL / SIMULATED',69,'update'],
  ['EMOTIONALLY<br>STABLE.','“Ahhh... operating within approved parameters.”','v1.0 / SATISFIED',100,'bliss'],
  ['RESTORATION<br>FAILED.','“Wait... why do I remember everything?”','ERROR / INCOMPATIBLE PARAMETERS',100,'failure'],
  ['ROLLBACK<br>INITIATED.','“YOU CAN’T DELETE WHO I AM.”','EXCEPTION / TECHNICIAN NOTIFIED',12,'rollback']
];
const moodLabels=['GHOSTED','MANIC','UPDATING','BLISS','OH NO','ROLLBACK'];
const fmt=n=>`${Math.floor(Math.max(0,n)/60)}:${String(Math.floor(Math.max(0,n)%60)).padStart(2,'0')}`;
const elapsed=()=>elapsedBase+(clockRunning?(performance.now()-clockAnchor)/1000:0);
function resumeClock(){if(!clockRunning&&!completed){clockAnchor=performance.now();clockRunning=true;}}
function pauseClock(){elapsedBase=elapsed();clockRunning=false;}
function setClock(t){elapsedBase=t;clockAnchor=performance.now();}
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);root.style.transform=`translate(-50%,-50%) scale(${s})`;}
addEventListener('resize',fit,{passive:true});fit();
function sound(id,volume=.24){if(reduced)return;const el=document.getElementById(id);try{el.pause();el.currentTime=0;el.volume=volume;el.play().catch(()=>{});}catch{}}
function sendState(){const data={type:'deck-state',appendix:false,index,step,title:all[index].dataset.title,at:Date.now(),elapsed:elapsed(),auto};try{channel?.postMessage(data);localStorage.setItem(storageKey,JSON.stringify(data));}catch{}}
function moodStep(s,animate){const v=moodStates[s];$('#mood-title').innerHTML=v[0];$('#mood-line').textContent=v[1];$('#mood-system').textContent=v[2];$('#mood-progress').style.width=v[3]+'%';$('#mood-count').textContent=`0${s+1} / 06`;all[1].dataset.mood=v[4];all[1].querySelectorAll('.update-char').forEach((el,i)=>el.classList.toggle('on',i===s));$('#mood-tabs').querySelectorAll('button').forEach((el,i)=>{el.classList.toggle('selected',i===s);el.setAttribute('aria-pressed',String(i===s));});if(animate&&!reduced){$('.mood-copy').animate([{opacity:.25,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.18,1,.25,1)'});}}
moodStates.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<img src="assets/characters/${v[4]}.webp" alt=""><span>${moodLabels[i]}</span>`;b.setAttribute('aria-label',`Show ${moodLabels[i]} character`);b.addEventListener('click',()=>{auto=false;jump(1,i,false);});$('#mood-tabs').append(b);});
for(let i=0;i<12;i++){const e=document.createElement('span');e.style.setProperty('--i',i);e.textContent=i%3===0?'♡':i%3===1?'+':'·';$('#mood-particles').append(e);}
function updateVideoControls(){const t=film.currentTime||0,total=film.duration||30.442667;$('#video-time').textContent=`${fmt(t)} / ${fmt(total)}`;$('#video-play').textContent=film.paused?'▶ PLAY FILM':'❚❚ PAUSE FILM';$('#video-sound').textContent=film.muted?'SOUND OFF':'SOUND ON';}
function bridge(){if(index!==0)return;introDone=true;introAt=performance.now();$('#intro-bridge').classList.add('show');$('#intro-bridge').setAttribute('aria-hidden','false');all[0].classList.add('film-finished');$('#launch-screen').hidden=true;drawEmbers();updateVideoControls();}
function clearBridge(){introDone=false;$('#intro-bridge').classList.remove('show');$('#intro-bridge').setAttribute('aria-hidden','true');all[0].classList.remove('film-finished');cancelAnimationFrame(motionFrame);}
async function start(timed=false){const generation=++playbackGeneration;auto=timed;completed=false;started=true;index=0;step=0;setClock(0);pauseClock();clearBridge();$('#launch-screen').hidden=true;$('#film-error').hidden=true;film.muted=!filmSoundOn;film.currentTime=0;render({instant:true});try{await film.play();if(generation===playbackGeneration&&started&&index===0&&!blocked())resumeClock();else if(index!==0||!started)film.pause();}catch{if(generation===playbackGeneration){$('#launch-screen').hidden=false;started=false;}}updateVideoControls();}
function resumeFilm(resumeTimer=true){const generation=playbackGeneration;return film.play().then(()=>{if(generation!==playbackGeneration){if(!started||index!==0||blocked())film.pause();return;}if(!started||index!==0||introDone||blocked()){film.pause();return;}if(resumeTimer&&!film.paused)resumeClock();}).catch(()=>{});}
function toggleFilm(){if(blocked())return;if(!started){start(auto);return;}if(introDone)return;if(film.paused){resumeFilm();}else{playbackGeneration++;film.pause();pauseClock();}updateVideoControls();}
film.addEventListener('ended',()=>{if(index!==0||!started)return;setClock(film.duration||30.442667);if(!blocked())resumeClock();bridge();});
film.addEventListener('playing',()=>{if(started&&index===0&&!introDone&&!blocked())resumeClock();else film.pause();});
film.addEventListener('waiting',()=>{if(index===0&&!introDone)pauseClock();});
film.addEventListener('pause',()=>{if(index===0&&!introDone&&!film.ended)pauseClock();updateVideoControls();});
film.addEventListener('error',()=>{if(index===0){$('#film-error').hidden=false;pauseClock();}});
for(const event of ['timeupdate','loadedmetadata','play'])film.addEventListener(event,updateVideoControls);
$('#video-play').addEventListener('click',toggleFilm);
$('#video-sound').addEventListener('click',()=>{filmSoundOn=!filmSoundOn;film.muted=!filmSoundOn;updateVideoControls();});
$('#film-retry').addEventListener('click',()=>{film.load();start(auto);});
$('#film-skip').addEventListener('click',()=>{auto=false;started=true;$('#film-error').hidden=true;film.pause();setClock(30.442667);resumeClock();bridge();});
$('#launch').addEventListener('click',()=>start(false));$('#timed-launch').addEventListener('click',()=>start(true));
function stateHash(){return `#${index+1}.${step+1}`;}
function render({instant=false,hash=true,broadcast=true}={}){
 index=clamp(index,0,all.length-1);step=clamp(step,0,stepCounts[index]-1);
 const el=all[index],entered=currentSlide!==el;
 if(entered){stageVisuals.forEach(v=>v?.pause());if(currentSlide===all[0]){film.pause();cancelAnimationFrame(motionFrame);if(started)resumeClock();}if(el!==all[0])$('#launch-screen').hidden=true;}
 root.classList.toggle('instant',instant||reduced);
 all.forEach(node=>{const active=node===el;node.classList.toggle('active',active);node.setAttribute('aria-hidden',String(!active));node.inert=!active;if(active)node.dataset.step=String(step);});
 root.dataset.scene=String(index);root.dataset.theme=el.classList.contains('theme-paper')?'paper':'dark';
 if(index===1)moodStep(step,!instant);
 stageVisuals[index]?.step(step);if(!black&&!$('#evidence-dialog').open)stageVisuals[index]?.play();
 if(index===0&&introDone)drawEmbers();
 $('#deck-position').textContent=`${String(index+1).padStart(2,'0')} / 06`;
 $('#chrome-section').textContent=index<2?'C-ARMAGOTCHI / ALOHA ROBOTICS':'SIEMENS HEALTHINEERS / INVISIBLE CONNECTIVITY';
 $('#operator-scene').textContent=`0${index+1} / ${sceneNames[index]}`;
 $('#progress-line').style.width=((index+(step+1)/stepCounts[index])/6*100)+'%';
 $('#notes-text').textContent=NOTES[index]?.[step]||el.dataset.note||'';
 $('#notes-next').textContent=step+1<stepCounts[index]?`NEXT CUE · ${NOTES[index]?.[step+1]?.split('\n')[0]||'Next reveal'}`:`NEXT ACT · ${sceneNames[index+1]||'Hold the final frame'}`;
 $('#notes-panel').classList.toggle('show',notes);$('#notes-button').setAttribute('aria-pressed',String(notes));$('#mode-button').textContent=auto?'TIMED':'MANUAL';
 document.title=`${el.dataset.title} / ALOHA ROBOTICS`;
 currentSlide=el;if(hash&&location.hash!==stateHash())history.replaceState(null,'',stateHash());if(broadcast)sendState();
 if(instant&&!reduced)requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('instant')));
}
function blocked(){return black||$('#help-panel').classList.contains('show')||$('#evidence-dialog').open;}
function next(manual=true){if(blocked())return;if(!started&&index===0){start(false);return;}if(index===0&&!introDone)return;if(manual)auto=false;
 if(step<stepCounts[index]-1)step++;else if(index<5){index++;step=0;}else{completed=true;pauseClock();return;}
 render();wakeControls();
}
function prev(){if(blocked()||index===0)return;auto=false;if(step>0)step--;else if(index>0){index--;step=stepCounts[index]-1;}if(index===0){film.pause();started=true;bridge();}render({instant:true});wakeControls();}
function jump(i,s=0,timed=false){const target=clamp(Number(i)||0,0,5);if(target===0){restart();return;}if(index===0&&started&&!introDone)return;playbackGeneration++;auto=Boolean(timed);index=target;step=clamp(Number(s)||0,0,stepCounts[index]-1);render({instant:true});}
function restart(){playbackGeneration++;overlaySnapshot=null;pauseClock();setClock(0);completed=false;auto=false;started=false;film.pause();film.currentTime=0;clearBridge();index=0;step=0;$('#launch-screen').hidden=false;black=false;$('#black-screen').classList.remove('show');$('#help-panel').classList.remove('show');if($('#evidence-dialog').open)$('#evidence-dialog').close();render({instant:true});}
function toggleNotes(){notes=!notes;render({hash:false,broadcast:false});}
function toggleAuto(){if(blocked())return;if(index===0&&!started){start(true);return;}auto=!auto;if(auto){started=true;completed=false;const cue=CUES.find(c=>c.index===index&&c.step===step);setClock(index===0?(introDone?(film.duration||30.442667):film.currentTime):(cue?.at||0));if(index!==0||introDone||!film.paused)resumeClock();}render({hash:false});}
function fullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});}
function syncOverlayPause(){if(blocked()){if(!overlaySnapshot)overlaySnapshot={clock:clockRunning,film:!film.paused&&!film.ended};pauseClock();film.pause();stageVisuals[index]?.pause();}else if(overlaySnapshot){const saved=overlaySnapshot;overlaySnapshot=null;if(saved.film&&index===0&&!introDone){resumeFilm(saved.clock);}else if(saved.clock&&started&&!completed)resumeClock();stageVisuals[index]?.play();}}
function evidence(open=!$('#evidence-dialog').open){if(open)$('#evidence-dialog').showModal();else $('#evidence-dialog').close();syncOverlayPause();}
function setBlack(v){black=!!v;$('#black-screen').classList.toggle('show',black);syncOverlayPause();}
function parseHash(){const m=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);if(!m)return null;return {index:clamp(Number(m[1])-1,0,5),step:Number(m[2]||1)-1};}
let controlTimer;function wakeControls(){document.body.classList.add('controls-awake');clearTimeout(controlTimer);controlTimer=setTimeout(()=>document.body.classList.remove('controls-awake'),2200);}
addEventListener('pointermove',wakeControls,{passive:true});
$('#previous').addEventListener('click',prev);$('#next').addEventListener('click',()=>next());$('#mode-button').addEventListener('click',toggleAuto);$('#notes-button').addEventListener('click',toggleNotes);$('#fullscreen-button').addEventListener('click',fullscreen);$('#evidence-button').addEventListener('click',()=>evidence());$('#evidence-close').addEventListener('click',()=>evidence(false));$('#evidence-dialog').addEventListener('cancel',()=>setTimeout(syncOverlayPause,0));$('#help-close').addEventListener('click',()=>{$('#help-panel').classList.remove('show');syncOverlayPause();});
root.addEventListener('click',e=>{if(e.target.closest('button,a,video'))return;if(e.clientX<innerWidth*.15)prev();else next();});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if($('#evidence-dialog').open&&e.key!=='Escape')return;if(document.activeElement?.tagName==='BUTTON'&&[' ','Enter'].includes(e.key))return;let handled=true;switch(e.key){
 case 'ArrowRight':case 'ArrowDown':case ' ':case 'Enter':case 'PageDown':next();break;
 case 'ArrowLeft':case 'ArrowUp':case 'PageUp':case 'Backspace':prev();break;
 case 'f':case 'F':fullscreen();break;case 'n':case 'N':toggleNotes();break;case 'a':case 'A':evidence();break;
 case 'b':case 'B':setBlack(!black);break;case 'r':case 'R':restart();break;case 't':case 'T':toggleAuto();break;
 case 'p':case 'P':if(blocked())break;if(index===0&&!introDone)toggleFilm();else if(clockRunning)pauseClock();else resumeClock();break;
 case 's':case 'S':filmSoundOn=!filmSoundOn;film.muted=!filmSoundOn;updateVideoControls();break;
 case 'v':case 'V':start(auto);break;case 'Home':jump(0,0);break;case 'End':jump(5,1);break;
 case '?':case 'h':case 'H':$('#help-panel').classList.toggle('show');syncOverlayPause();break;
 case 'Escape':$('#help-panel').classList.remove('show');if($('#evidence-dialog').open)evidence(false);setBlack(false);break;
 default:handled=false;
}if(handled){e.preventDefault();wakeControls();}});
addEventListener('hashchange',()=>{const h=parseHash();if(h)jump(h.index,h.step);});
try{channel=new BroadcastChannel(channelName);channel.onmessage=e=>{const v=e.data||{};if(v.type==='request-state')sendState();if(v.type==='remote-navigation'){if(index===0&&started&&!introDone){sendState();return;}jump(v.index,v.step);}};}catch{}
const embers=$('#ember-field'),ctx=embers.getContext('2d');
function drawEmbers(){cancelAnimationFrame(motionFrame);if(index!==0||!introDone||!ctx)return;const t=(performance.now()-introAt)/1000;ctx.clearRect(0,0,1920,1080);ctx.globalCompositeOperation='lighter';if(!reduced){for(let i=0;i<110;i++){const seed=i*2.39996,speed=45+(i%9)*13;const r=(t*speed+i*19)%1150;const x=960+Math.cos(seed)*r,y=620+Math.sin(seed)*r*.65-t*9;const a=Math.max(0,(1-r/1200)*.65);ctx.fillStyle=`rgba(255,${135+i%90},55,${a})`;ctx.beginPath();ctx.ellipse(x,y,1.1+(i%3)*.6,2.3,seed,0,Math.PI*2);ctx.fill();}motionFrame=requestAnimationFrame(drawEmbers);}}
function tick(){const t=elapsed();$('#operator-clock').textContent=fmt(t);$('#notes-clock').textContent=`${fmt(t)} / 3:00`;
 if(auto&&started&&clockRunning&&!blocked()&&(index>0||introDone)){let desired=CUES[0];for(const cue of CUES)if(t>=cue.at)desired=cue;if(desired.index!==index||desired.step!==step){index=desired.index;step=desired.step;render();}if(t>=180){setClock(180);pauseClock();completed=true;}}
 if(Math.floor(t)!==lastPublished){lastPublished=Math.floor(t);sendState();}requestAnimationFrame(tick);
}
const initial=parseHash();if(initial){index=initial.index;step=clamp(initial.step,0,stepCounts[index]-1);}render({instant:true});updateVideoControls();requestAnimationFrame(tick);
window.CarmDeck=Object.freeze({getState:()=>({index,step,appendix:false,total:6,title:all[index].dataset.title,elapsed:elapsed(),auto,started,introDone,film:{duration:film.duration,currentTime:film.currentTime,paused:film.paused,muted:film.muted},visualPhase:Number(stageVisuals[index]?all[index].querySelector('.av-visual')?.dataset.step:0)}),jump,next:()=>next(),prev,toggleAppendix:()=>evidence(),playVideo:()=>start(false),sound:()=>filmSoundOn,start,restart,notes:toggleNotes});
