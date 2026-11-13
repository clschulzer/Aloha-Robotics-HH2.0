/* ASTRA / Ember. OPUS provides the particle/audio primitives; this is a new presentation,
   cue clock, editorial character stage, theatre board and deliberately sparse service flow. */
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

const icons={
 calendar:'<rect x="6" y="9" width="36" height="33" rx="5"/><path d="M6 19h36M16 4v10M32 4v10M14 26h6m8 0h6m-20 8h6m8 0h6"/>',
 device:'<rect x="4" y="7" width="40" height="29" rx="4"/><path d="M17 43h14m-7-7v7M12 17h17m-17 7h10"/>',
 shield:'<path d="m24 4 17 7v13c0 12-17 20-17 20S7 36 7 24V11Z"/><path d="m15 24 7 7 13-15"/>',
 person:'<circle cx="24" cy="13" r="8"/><path d="M8 42v-7c0-13 32-13 32 0v7Z"/>',
 core:'<circle cx="24" cy="24" r="14"/><path d="M24 2v8m0 28v8M2 24h8m28 0h8M8 8l6 6m20 20 6 6M8 40l6-6m20-20 6-6"/><circle cx="24" cy="24" r="5"/>',
 log:'<path d="M11 5h25v39l-6-4-6 4-6-4-7 4Z"/><path d="m17 21 6 6 10-12M17 34h13"/>'
};
const icon=name=>`<svg viewBox="0 0 48 48" aria-hidden="true">${icons[name]||icons.core}</svg>`;

// One character, one meaning, one punchline. Every entrance has its own physical character.
const moodHost=$('.mood-scene');
moodHost.innerHTML=brand+`<div class="mood-kicker">MEET <span>C-ARMAGOTCHI</span></div><div class="mood-hero"><div class="mood-shadow"></div>${C.moods.map(m=>`<img data-mood="${m[0]}" src="${asset(m[0])}" alt="${esc(m[2])}">`).join('')}</div><div class="mood-copy"><h1></h1><div class="mood-meaning"></div></div><p class="mood-quote"></p><div class="mood-pips">${C.moods.map(()=>'<i></i>').join('')}</div><div class="mood-sign">THE PERSONALITY IS FICTION. THE NEED FOR CARE IS REAL.</div>`;
let moodAnims=[],lastMood=-1;
function setMood(i,spinning=false){
  i%=C.moods.length;if(i===lastMood&&!spinning)return;lastMood=i;
  for(const a of moodAnims)a.cancel();moodAnims=[];
  $$('.mood-hero img').forEach((img,k)=>img.classList.toggle('current',k===i));
  const m=C.moods[i],img=$(`.mood-hero img[data-mood="${m[0]}"]`);
  $('.mood-copy h1').textContent=m[1];$('.mood-meaning').textContent=m[2];$('.mood-quote').textContent=m[3];
  $$('.mood-pips i').forEach((p,k)=>p.classList.toggle('on',k===i));
  if(!reduce&&!spinning){
    const poses=[
      [{transform:'translateY(46px) rotate(-5deg) scale(.94)',opacity:0},{transform:'translateY(-8px) rotate(1deg) scale(1.01)',opacity:1,offset:.65},{transform:'none',opacity:1}],
      [{transform:'translateX(-125px) rotate(-15deg) scale(.7)',opacity:0},{transform:'translateX(20px) rotate(7deg) scale(1.07)',opacity:1,offset:.62},{transform:'none',opacity:1}],
      [{transform:'translateY(30px) scale(.92)',opacity:0,filter:'blur(5px)'},{transform:'none',opacity:1,filter:'blur(0px)'}],
      [{transform:'translateY(70px) rotate(4deg) scale(.92)',opacity:0},{transform:'translateY(-13px) rotate(-2deg)',opacity:1,offset:.67},{transform:'none',opacity:1}],
      [{transform:'translateY(-80px) rotate(-3deg)',opacity:0},{transform:'translateY(12px) rotate(2deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],
      [{transform:'translateX(100px) rotate(14deg) scale(.85)',opacity:0},{transform:'translateX(-9px) rotate(-2deg)',opacity:1,offset:.72},{transform:'none',opacity:1}]
    ];
    moodAnims.push(img.animate(poses[i],{duration:i===1?650:780,easing:'cubic-bezier(.16,1,.3,1)'}));
    moodAnims.push($('.mood-copy').animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{duration:540,easing:'cubic-bezier(.16,1,.3,1)'}));
    if(sfx){const fs=[440,880,560,660,180,520];A.sfx.tick(i===4?.09:.055,fs[i]);if(i===3)A.sfx.success(.035);}
  }
}

// Theatre calendar: all geometry derives from the case data and the planner's returned times.
const grid={x:176,y:280,cw:1648/6,h:675,start:480,scale:.75};
const yTime=m=>grid.y+(m-grid.start)*grid.scale;
const calendar=$('.calendar-scene');
calendar.innerHTML=brand+`<h1 class="scene-heading">${C.calendarTitle}</h1><div class="scene-label">OPERATING THEATRES · WED 18 NOV</div><div class="cancel-notice">OR 3 · evening case cancelled</div><div class="calendar-board"><div class="board-time">${Array.from({length:16},(_,i)=>`<span style="top:${i*45}px">${String(8+i).padStart(2,'0')}:00</span>`).join('')}</div>${D.devices.map((d,i)=>`<div class="theatre" data-device="${d.id}"><div class="theatre-head"><b>${i===5?'Emergency':`OR ${i+1}`}</b><small>${d.name}</small></div>${d.busy[0].map(b=>`<div class="case past ${i===5?'emergency':''}" style="top:${(b.from-grid.start)*grid.scale}px;height:${(b.to-b.from)*grid.scale-2}px"><b>${esc(b.fach)}</b><small>${D.format(b.from)}–${D.format(b.to)}</small></div>`).join('')}${i===2?`<div class="case cancelled" style="top:${(D.cancelled.from-grid.start)*grid.scale}px;height:${(D.cancelled.to-D.cancelled.from)*grid.scale}px"><b>${D.cancelled.fach}</b><small>19:00–22:20</small></div><div class="gold-slot" style="top:${(D.winner.window.from-grid.start)*grid.scale}px;height:${(D.winner.window.to-D.winner.window.from)*grid.scale}px"><b>${D.format(D.winner.window.from)}–${D.format(D.winner.window.to)}</b><span>Cio · proposed service</span><div class="buffer" style="height:${D.rules.PUFFER*grid.scale}px"></div></div>`:''}${i===5?'<div class="reserve-wash">KEEP AVAILABLE</div>':''}</div>`).join('')}<div class="now-line" style="top:${(D.now-grid.start)*grid.scale}px"></div></div><canvas class="scan-canvas"></canvas><div class="calendar-status"></div>`;
const scanLayer=O.canvas($('.scan-canvas')), sg=scanLayer.ctx, rng=O.rng(1241), scouts=[];
const scoutCount=C.scouts||36;
for(let i=0;i<scoutCount;i++)scouts.push({x:1780+rng()*50,y:190+rng()*60,vx:0,vy:0,seed:rng()*90,lane:i%6,trail:[],alpha:0,tx:0,ty:0});
let scanPhase=0,scanT=0,phaseT=0,lastTickSound=-1;
const goldBounds={x:grid.x+2*grid.cw+8,y:yTime(D.winner.window.from),w:grid.cw-16,h:(D.winner.window.to-D.winner.window.from)*grid.scale};
const goldCenter={x:goldBounds.x+goldBounds.w/2,y:goldBounds.y+goldBounds.h/2};
const captions=[
  'A day of care. Every case has a place.',
  'A cancellation changes what is possible.',
  'Reading the plan. Looking for the right opportunity.',
  'Enough time. Emergency cover. A ready replacement.',
  `Golden window found. ${D.backup.name} remains available.`,
  'A clear proposal for medical physics to review.'
];
function calendarStep(p){
  scanPhase=p;phaseT=0;calendar.dataset.phase=p;
  const status=$('.calendar-status');status.textContent=captions[p];status.classList.toggle('gold',p>=4);
  if(p===0){scanT=0;for(const s of scouts){s.x=1760+rng()*60;s.y=190;s.trail=[];s.alpha=0;}}
  if(sfx&&p===1)A.sfx.tick(.05,850);
  if(sfx&&p===2)A.sfx.whoosh(.45,.05,true);
  if(sfx&&p===4)A.sfx.success(.065);
}
function drawScouts(dt){
  scanT+=dt;phaseT+=dt;scanLayer.clear();
  if(scanPhase<2)return;
  const targetAlpha=scanPhase>=4?Math.max(0,1-(phaseT-1.5)/1.5):1;
  for(let i=0;i<scouts.length;i++){
    const s=scouts[i],cell=Math.floor((scanT+s.seed)*.38),col=(s.lane+Math.floor(cell/2))%6;
    if(scanPhase>=4){
      const a=(i/scouts.length)*Math.PI*2;const r=Math.max(0,80-phaseT*35);
      s.tx=goldCenter.x+Math.cos(a)*r;s.ty=goldCenter.y+Math.sin(a)*r*.45;
    }else{
      s.tx=grid.x+col*grid.cw+35+(Math.sin(s.seed+cell*2.31)*.5+.5)*(grid.cw-70);
      const focus=scanPhase===3?660:540;
      s.ty=yTime(focus+(Math.sin(cell*1.8+s.seed)*.5+.5)*(scanPhase===3?700:800));
      s.ty=Math.min(939,Math.max(300,s.ty));
    }
    const ease=scanPhase>=4?5.7:3.5,dx=s.tx-s.x,dy=s.ty-s.y;
    s.vx+=(dx*ease*ease-2*ease*s.vx)*dt;s.vy+=(dy*ease*ease-2*ease*s.vy)*dt;
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.alpha+=(targetAlpha-s.alpha)*Math.min(1,dt*4);
    s.trail.push([s.x,s.y]);if(s.trail.length>12)s.trail.shift();
    if(reduce){s.x=s.tx;s.y=s.ty;s.alpha=scanPhase>=4?0:.5;s.trail=[];}
    const gold=scanPhase>=4,colr=gold?'240,197,113':'128,229,209';
    sg.lineWidth=1.15;sg.strokeStyle=`rgba(${colr},${s.alpha*.17})`;sg.beginPath();
    s.trail.forEach(([x,y],k)=>k?sg.lineTo(x,y):sg.moveTo(x,y));sg.stroke();
    sg.save();sg.translate(s.x,s.y);sg.rotate(Math.atan2(s.vy,s.vx)+Math.PI/2);sg.globalAlpha=s.alpha*.85;
    sg.fillStyle=`rgba(${colr},.2)`;sg.strokeStyle=`rgba(${colr},.95)`;sg.lineWidth=1.2;sg.beginPath();
    sg.moveTo(0,-10);sg.lineTo(6,7);sg.lineTo(0,4);sg.lineTo(-6,7);sg.closePath();sg.fill();sg.stroke();
    sg.fillStyle=gold?'#f7dfab':'#ddfff7';sg.fillRect(-1.1,-1,2.2,2.2);sg.restore();
  }
  if(scanPhase===3){
    const p=(Math.sin(scanT*2)+1)/2;sg.strokeStyle=`rgba(219,135,142,${.25+p*.25})`;sg.lineWidth=1.5;
    sg.strokeRect(grid.x+5*grid.cw+8,yTime(1140),grid.cw-16,90);
    sg.fillStyle='#d68f99';sg.font='500 18px Manrope';sg.fillText('Emergency standby',grid.x+5*grid.cw+22,yTime(1140)+45);
  }
  sg.globalAlpha=1;
}

// A small number of service paths, grown in dependency order. No decorative hairball.
const flow=$('.workflow-scene');
const nodes=[
  {id:'plan',x:250,y:410,label:'Theatre plan',sub:'Cases and cancellations',icon:'calendar',phase:0},
  {id:'state',x:250,y:590,label:'Device state',sub:'Use, power, software',icon:'device',phase:0},
  {id:'rules',x:250,y:770,label:'Service rules',sub:'Package and readiness',icon:'shield',phase:0},
  {id:'core',x:670,y:575,label:'Aloha orchestration',sub:'Scout · risk · preflight',icon:'core',phase:1,cls:'core'},
  {id:'human',x:1040,y:575,label:'Human decision',sub:'Review and authorize',icon:'person',phase:2,cls:'human'},
  {id:'ketty',x:1370,y:575,label:'KettyBot',sub:'Power and approved data',image:'ketty',phase:3,cls:'physical'},
  {id:'carm',x:1670,y:575,label:'Cio',sub:'Authorized service',image:'lonely',phase:3,cls:'physical'},
  {id:'return',x:1000,y:867,label:'Verify and report',sub:'Escalate every exception',icon:'log',phase:4}
];
const routes=[
  [1,'M445 410 C540 410 480 530 589 575'],
  [1,'M445 590 C490 590 525 575 589 575'],
  [1,'M445 770 C530 770 495 635 589 575'],
  [2,'M751 575 C865 575 865 575 981 575'],
  [3,'M1099 575 C1170 575 1210 575 1270 575','gold'],
  [3,'M1480 575 C1510 575 1540 575 1575 575','gold'],
  [4,'M1660 690 C1660 867 1280 867 1059 867'],
  [4,'M941 867 C700 867 510 885 445 793']
];
flow.innerHTML=brand+`<h1 class="scene-heading">${C.workflowTitle}</h1><div class="scene-label">SERVICE ARCHITECTURE</div><svg class="workflow-svg" viewBox="0 0 1920 1080">${routes.map((r,i)=>`<path class="route-track" d="${r[1]}"/><path id="route-${i}" class="route-grow ${r[2]||''}" pathLength="1" d="${r[1]}" data-phase="${r[0]}"/>`).join('')}</svg>${nodes.map(n=>`<div class="workflow-node ${n.cls||''}" id="node-${n.id}" data-phase="${n.phase}" style="left:${n.x}px;top:${n.y}px">${n.image?`<img src="${asset(n.image)}" alt="${n.label}">`:`<div class="node-disc">${icon(n.icon)}</div>`}<b>${n.label}</b><small>${n.sub}</small></div>`).join('')}<div class="workflow-annotation">Agents propose. People authorize.</div><div class="workflow-bottom">The plan becomes <strong>a completed handoff.</strong></div><canvas class="workflow-canvas"></canvas>`;
const fl=O.canvas($('.workflow-canvas')),fg=fl.ctx,flowPaths=$$('.route-grow').map(p=>({p,length:p.getTotalLength(),phase:+p.dataset.phase}));let flowPhase=0,flowT=0;
function flowStep(p){flowPhase=p;flowT=0;flow.dataset.phase=p;$$('.workflow-node,.route-grow').forEach(n=>n.classList.toggle('on',+n.dataset.phase<=p));if(sfx&&p>0)A.sfx.grow(.016,.65);}
function drawFlow(dt){
  flowT+=dt;fl.clear();if(reduce)return;
  for(let i=0;i<flowPaths.length;i++){const r=flowPaths[i];if(r.phase>flowPhase)continue;
    const a=Math.max(0,Math.min(1,flowT-.5)),u=((flowT*.14+i*.17)%1);
    const pos=r.p.getPointAtLength(u*r.length);fg.globalAlpha=a*.8;
    fg.drawImage(O.glow(i===4||i===5?[240,197,113]:[128,229,209],40,.08),pos.x-10,pos.y-10,20,20);
  }fg.globalAlpha=1;
}
function handoff(){
  if(reduce)return;
  const p=document.createElement('div');p.className='gold-seed';
  Object.assign(p.style,{position:'absolute',left:`${goldBounds.x}px`,top:`${goldBounds.y}px`,width:`${goldBounds.w}px`,height:`${goldBounds.h}px`,border:'1.5px solid #f0c571',background:'#e7bd6950',boxShadow:'0 0 55px #f0c57170',borderRadius:'6px',zIndex:15,pointerEvents:'none'});
  stage.append(p);
  const dx=670-goldCenter.x,dy=575-goldCenter.y;
  const a=p.animate([{transform:'translate(0,0) scale(1)',opacity:.8},{transform:'translate(0,0) scale(.08)',opacity:1,offset:.25},{transform:`translate(${dx}px,${dy}px) scale(.07)`,opacity:1,offset:.82},{transform:`translate(${dx}px,${dy}px) scale(.9)`,opacity:0}],{duration:1200,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'});
  transitionAnimations.push(a);a.finished.then(()=>p.remove()).catch(()=>p.remove());
}

const outro=$('.outro-scene');
outro.innerHTML=brand+`<h1 class="outro-word" data-line="0">${C.closing[0]}</h1><h1 class="outro-word" data-line="1">${C.closing[1].replace(/(patient\.|people\.|care\.)/,'<em>$1</em>')}</h1><div class="outro-art"><img src="${asset('ketty')}" alt="KettyBot"><img src="${asset('bliss')}" alt="Happy C-arm"></div><div class="outro-sign">ALOHA ROBOTICS<small>INVISIBLE CONNECTIVITY</small></div>`;

function render({instant=false}={}){
  const c=cueList[cue],old=currentScene;const change=old!==c.scene;currentScene=c.scene;currentStep=c.step;sceneTime=0;epoch++;clearTimers();crt=false;
  for(const a of transitionAnimations)a.cancel();transitionAnimations=[];
  if(change){
    if(old==='intro')O.embers.fadeOut(.3);
    if(old==='film'&&c.scene!=='intro'){film.pause();O.embers.reset();}
    scenes.forEach(el=>{el.classList.remove('active','leaving','crt');el.dataset.step=c.step;el.style.transform='';el.style.opacity='';});
    const active=$(`.scene[data-scene="${c.scene}"]`);active.classList.add('active');
    if(c.scene==='cut'&&!instant&&!reduce)transitionAnimations.push(active.animate([{transform:'translateY(1080px)'},{transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.76,0,.24,1)'}));
    if(c.scene==='moods'&&!instant&&!reduce)transitionAnimations.push(active.animate([{clipPath:'circle(0% at 37% 57%)'},{clipPath:'circle(105% at 37% 57%)'}],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'}));
    if(c.scene==='workflow'&&old==='calendar')handoff();
  }
  const el=$(`.scene[data-scene="${c.scene}"]`);el.dataset.step=c.step;
  if(c.scene==='intro')O.embers.runIntro(instant);
  if(c.scene==='moods'){
    moodHost.classList.remove('crt');$('.mood-copy').style.opacity=c.step===6?'0':'1';$('.mood-quote').style.opacity=c.step===6?'0':'1';$('.mood-pips').style.opacity=c.step===6?'0':'1';
    lastMood=-1;setMood(Math.min(c.step,5));
  }
  if(c.scene==='calendar')calendarStep(c.step);
  if(c.scene==='workflow')flowStep(c.step);
  if(c.scene==='outro')$$('.outro-word').forEach((n,i)=>n.classList.toggle('on',i===c.step));
  $('#cue-label').textContent=`${c.title} · ${formatTime(c.at)}`;$('#cue-note').textContent=c.note;
  stage.dataset.scene=c.scene;stage.dataset.step=c.step;stage.dataset.cue=cue;
  history.replaceState(null,'',`#${cue+1}`);
  publish();
}
function formatTime(t){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function setPause(value){
  paused=!!value;O.paused=paused;document.body.classList.toggle('paused',paused);$('#pause').textContent=paused?'Resume':'Pause';
  if(paused){running=false;mediaResumeWanted=currentScene==='film'&&!film.paused;film.pause();A.ctx?.suspend();for(const anim of document.getAnimations())anim.pause();}
  else{
    if(started&&!freezeAtEnd)running=true;
    A.ctx?.resume();for(const anim of document.getAnimations())anim.play();
    if(currentScene==='film'&&(mediaResumeWanted||started)){const e=epoch;film.play().then(()=>{if(e!==epoch||paused||currentScene!=='film')film.pause();}).catch(()=>{running=false;});}
  }publish();
}
async function start(timed){
  epoch++;auto=timed;started=true;freezeAtEnd=false;elapsed=0;lastPublish=0;cue=0;paused=false;O.paused=false;filmTail=false;
  $('#launch').hidden=true;sfx=$('#sfx-choice').checked;A.unlock();A.setMuted(!sfx);$('#sound').textContent=sfx?'SFX ON':'SFX OFF';
  render();film.muted=false;film.currentTime=0;
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
  O.embers.reset();A.ctx?.resume();$('#launch').hidden=false;$('#notes').hidden=true;$('#help').hidden=true;$('#blackout').hidden=true;document.body.classList.remove('paused');render({instant:true});
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
function state(){return {version:C.id,cue,scene:currentScene,step:currentStep,elapsed,auto,running,paused,started,sfx,notes:cueList[cue].note,title:cueList[cue].title,film:{currentTime:film.currentTime,duration:film.duration,muted:film.muted,paused:film.paused},winner:D.winner.window,backup:D.backup.id};}
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
    if(film.currentTime>=29.62&&!filmTail){filmTail=true;O.embers.explode();}
  }
  if(!paused)sceneTime+=dt;
  if(auto&&running&&currentScene!=='film'){
    let n=cue;while(n+1<cueList.length&&elapsed>=cueList[n+1].at)n++;
    if(n!==cue)go(n);
    if(elapsed>=180){running=false;freezeAtEnd=true;elapsed=180;}
  }
  if(currentScene==='moods'&&currentStep===6&&!paused){
    if(sceneTime<1.38){const i=Math.floor(sceneTime*(10+sceneTime*16))%6;if(i!==lastMood){setMood(i,true);if(sfx)A.sfx.tick(.025,400+i*110);}}
    else if(!crt){crt=true;moodHost.classList.add('crt');if(sfx)A.sfx.crtOff(.3);}
    if(!auto&&sceneTime>2){go(cue+1);}
  }
  if(currentScene==='calendar')drawScouts(dt);
  if(currentScene==='workflow')drawFlow(dt);
  $('#time').textContent=formatTime(elapsed);
  if(elapsed-lastPublish>.35){lastPublish=elapsed;publish();}
});
window.ASTRA={getState:state,next,prev,start,pause:setPause,reset,go:(n)=>{started=true;auto=false;$('#launch').hidden=true;go(n,{instant:true,align:true});},cues:cueList,model:D};
await document.fonts.ready;
const initial=Number(location.hash.slice(1));
if(Number.isInteger(initial)&&initial>1&&initial<=cueList.length){$('#launch').hidden=true;started=true;cue=initial-1;elapsed=cueList[cue].at;render({instant:true});}
else render({instant:true});
addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1));if(n>0&&n<=cueList.length)window.ASTRA.go(n-1);});
