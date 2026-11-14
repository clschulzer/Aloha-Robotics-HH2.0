import {RULES,MAP,DEVICES,EMERGENCIES,createGame,command,step,near,gate,windowFor,isEmergency,nearestJob,panelFor,floor} from './engine.mjs';

const $=id=>document.getElementById(id);
const assets='../../assets/characters/';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state=createGame(),lastFrame=performance.now(),lastUI=0,lastPanel='',lastPhase='',lastMessage=-1,lastScore=0,highScore=0;
let soundEnabled=false,audio=null,holdingPointer=null,holdingKey=null,lastHoldRelease=-1000,pausedFocus=null;
const heldDirections=new Map();
let worldWidth=600,worldHeight=500,frameTime=0,particles=[],pointerMarker=null;
try{highScore=Math.max(0,Number(localStorage.getItem('carmagotchi.plug-panic.best'))||0);soundEnabled=localStorage.getItem('carmagotchi.plug-panic.sound')==='on';}catch{}
const canvas=$('world'),ctx=canvas.getContext('2d'),stationNodes=new Map();

// Public inspection is deliberately read-only. Gameplay always goes through visible controls.
Object.defineProperty(window,'PlugPanic',{value:Object.freeze({
  inspect:()=>structuredClone({version:'1.0.0',state,panel:panelFor(state),near:near(state),suggested:nearestJob(state),highScore,soundEnabled,
    controls:'Tap a C-arm to route. Hold Connect for 1.2s; release, then separately press Start update. Return logs to dock. WASD/arrows; E; Escape.',
    simulation:'All devices, windows and timings are invented game mechanics.'})
}),writable:false,configurable:false});

function setText(id,text){const el=$(id);if(el.textContent!==text)el.textContent=text;}
function act(type,payload){
  if(['pause','start','restart'].includes(type))heldDirections.clear();
  const old=state;state=command(state,type,payload);react(old);renderUI(true);
}
function initStations(){
  for(const d of DEVICES){
    const button=document.createElement('button');button.type='button';button.className='station hungry';button.dataset.target=d.id;
    button.style.left=`${(d.x+.5)/MAP.width*100}%`;
    button.style.top=`${(d.y<5?d.y:d.y+.9)/MAP.height*100}%`;
    button.innerHTML=`<span class="station-name">${d.name}<span class="room">${d.room}</span></span><span class="station-image"><img src="${assets}manic.webp" alt=""></span><span class="station-status">QUIET WINDOW</span>`;
    button.addEventListener('click',()=>{if(state.phase==='playing'){act('target',{id:d.id});sound('tap');}});
    $('stations').append(button);stationNodes.set(d.id,button);
  }
  const fritzi=document.createElement('button');fritzi.type='button';fritzi.className='station reserve';fritzi.dataset.target='fritzi';
  fritzi.innerHTML=`<span class="station-name">Fritzi <span aria-hidden="true">♧</span></span><span class="station-image"><img src="${assets}bliss.webp" alt=""></span><span class="station-status">BACKUP · HANDS OFF</span>`;
  fritzi.setAttribute('aria-label','Visit Fritzi, protected backup');
  fritzi.addEventListener('click',()=>{if(state.phase==='playing'){act('target',{id:'fritzi'});sound('tap');}});
  $('stations').append(fritzi);stationNodes.set('fritzi',fritzi);
  const dock=document.createElement('button');dock.type='button';dock.className='station dock';dock.dataset.target='dock';
  dock.innerHTML='<span class="dock-tile" aria-hidden="true"><span>ϟ</span><span>▤</span><span>↥</span></span><span class="station-name">HOME / DOCK</span>';
  dock.setAttribute('aria-label','Go to dock to upload logs and restock');
  dock.addEventListener('click',()=>{if(state.phase==='playing'){act('target',{id:'dock'});sound('tap');}});
  $('stations').append(dock);stationNodes.set('dock',dock);
}

function sound(type){
  if(!soundEnabled)return;
  try{
    if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    const notes={
      tap:[[420,0,.055]],connect:[[230,0,.06],[330,.09,.07]],connected:[[420,0,.08],[660,.09,.11]],
      started:[[360,0,.07],[540,.09,.07],[720,.18,.12]],collected:[[720,0,.08],[980,.08,.12]],
      delivery:[[460,0,.08],[580,.09,.08],[730,.18,.08],[920,.27,.19]],
      emergency:[[285,0,.12],[220,.2,.12],[285,.4,.12]],
      won:[[440,0,.12],[550,.13,.12],[660,.26,.12],[880,.39,.28]],
      lost:[[360,0,.17],[280,.18,.17],[210,.37,.25]]
    }[type]||[[380,0,.05]];
    for(const [frequency,delay,duration] of notes){
      const oscillator=audio.createOscillator(),volume=audio.createGain(),start=audio.currentTime+delay;
      oscillator.type=type==='emergency'?'triangle':'sine';oscillator.frequency.value=frequency;
      volume.gain.setValueAtTime(0,start);volume.gain.linearRampToValueAtTime(.065,start+.012);
      volume.gain.exponentialRampToValueAtTime(.001,start+duration);
      oscillator.connect(volume);volume.connect(audio.destination);oscillator.start(start);oscillator.stop(start+duration+.015);
    }
  }catch{}
}
function syncSound(){
  $('sound').setAttribute('aria-pressed',String(soundEnabled));
  $('sound').setAttribute('aria-label',`Turn game sound ${soundEnabled?'off':'on'}`);
  $('sound').title=`Sound ${soundEnabled?'on':'off'}`;
}
$('sound').addEventListener('click',()=>{
  soundEnabled=!soundEnabled;try{localStorage.setItem('carmagotchi.plug-panic.sound',soundEnabled?'on':'off');}catch{}
  syncSound();if(soundEnabled)sound('connected');
});
function burst(x,y,color='#f5d48a',count=15){
  if(reduced)return;
  for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*2.4,vy:(Math.random()-.65)*2.6,life:.6+Math.random()*.55,max:1.15,color,size:.025+Math.random()*.04});
}
function react(old){
  if(state.message.id!==lastMessage){
    lastMessage=state.message.id;setText('radio-text',state.message.text);
    $('radio').className=`radio new ${state.message.kind==='emergency'?'emergency':''}`;
    $('announcer').textContent=state.message.text;
    if(['connected','started','collected','delivery','emergency'].includes(state.message.kind))sound(state.message.kind);
    if(state.message.kind==='connected')burst(state.bot.x+.5,state.bot.y+.4,'#bce6bd');
    if(state.message.kind==='collected')burst(state.bot.x+.5,state.bot.y+.4);
  }
  if(state.score>lastScore){
    const diff=state.score-lastScore;lastScore=state.score;
    $('floating-score').textContent=`+${diff}`;
    $('floating-score').classList.remove('pop');void $('floating-score').offsetWidth;$('floating-score').classList.add('pop');
    burst(6.5,8.7,'#bfe9c5',28);
  }
  if(old.phase!==state.phase){
    if(state.phase==='won'||state.phase==='lost'){
      if(state.score>highScore){highScore=state.score;try{localStorage.setItem('carmagotchi.plug-panic.best',String(highScore));}catch{}}
      sound(state.phase);holdingKey=null;holdingPointer=null;
    }
    if(state.phase==='playing'&&old.phase!=='paused'){lastScore=0;lastPanel='';particles=[];}
  }
}

function setPrimary(label,action,{disabled=false,style=''}={}){
  $('primary').dataset.action=action;
  $('primary').className=`primary ${style}`;$('primary').disabled=disabled;
  $('primary-label').textContent=label;
}
function statusChips(texts){
  $('micro-status').hidden=!texts.length;
  $('micro-status').replaceChildren(...texts.map(text=>{const el=document.createElement('span');el.textContent=text;return el;}));
}
function renderPanel(){
  const p=panelFor(state),count=state.bag.length;
  const key=`${p.kind}:${p.id}:${p.code}:${count}:${state.phase}`;
  if(key!==lastPanel){
    lastPanel=key;statusChips([]);
    const content={
      idle:['ON YOUR ROUNDS','Someone needs a plug.','Tap a C-arm to send KettyBot down the corridor.'],
      moving:['KETTYBOT, EN ROUTE',`Next stop: ${p.name}.`,'A tiny robot with a surprisingly good sense of direction.'],
      dock:['HOME SWEET CHARGER',count?'Bring it home.':'Packed. Charged. Ready.',count?`${count} ${count===1?'log is':'logs are'} in your backpack. Upload to close the loop.`:'Two power packs. Two updates. A whole hospital of feelings.'],
      reserve:['FRITZI / PROTECTED BACKUP','She has one job.','Be ready when care needs her. Fritzi never gets an update this shift.'],
      connect:[`${p.name?.toUpperCase()} / GOLDEN WINDOW`,'Found a quiet moment.','Hold to plug in power and send the update package.'],
      connecting:['HOLD STEADY, GOOD BOT','A little connection.','Power first. Then the package. Keep holding.'],
      approve:['CONNECTED / YOUR CALL','Ready when you say.','You are the human in the loop. Start this simulated update?'],
      updating:['UPDATE IN PROGRESS','Nobody pull that plug.','Ketty can make rounds while the connected power pack does its job.'],
      happy:['LOGS IN YOUR BACKPACK','“I feel seen.”','The update is done. Bring the logs to the dock to finish the job.'],
      logs:['UPDATE COMPLETE','Proof of a good night.','Pick up the logs, then take them home.'],
      wait:['CARE GETS PRIORITY','This one needs a minute.',p.reason||'Find another quiet window.']
    }[p.kind]||['NIGHT SHIFT','Let’s make rounds.','Tap a C-arm to begin.'];
    setText('action-kicker',content[0]);setText('action-title',content[1]);setText('action-copy',content[2]);
    if(p.kind==='connect'||p.kind==='connecting')setPrimary(p.kind==='connecting'?'Hold… connecting':'Hold to connect ϟ','connect',{style:'hold'});
    else if(p.kind==='approve'){
      setPrimary('Start update — I give the go ✓','approve',{style:'approve'});
      statusChips(['✓ Quiet window','✓ Backup ready','✓ Recovery margin']);
    }else if(p.kind==='dock')setPrimary(count?'Upload logs + restock ↥':'Find a C-arm ↗',count?'upload':'next');
    else if(p.kind==='happy'||p.kind==='logs')setPrimary('Take the logs home ↙','dock');
    else if(p.kind==='moving')setPrimary('On my way…','none',{disabled:true,style:'waiting'});
    else if(p.kind==='updating')setPrimary('See the next C-arm ↗','next');
    else if(p.kind==='wait'&&p.code==='stock')setPrimary('Restock at the dock ↙','dock');
    else setPrimary(p.kind==='reserve'?'Find someone who needs me ↗':'Try the next C-arm ↗','next');
  }
  const progress=state.connection?.charge||0;$('button-fill').style.width=`${p.kind==='connecting'?progress*100:0}%`;
  if(p.kind==='connecting')setText('primary-label',progress<.48?'Hold… power connected ϟ':'Hold… sending package ▣');
  if(p.kind==='updating')setText('action-kicker',`UPDATE IN PROGRESS / ${Math.ceil(p.remaining)}s`);
  if(p.kind==='connect')setText('action-kicker',`${p.name.toUpperCase()} / ${Math.floor(windowFor(state,p.id).remaining)}s QUIET WINDOW`);
  if(p.kind==='wait'&&['busy','short'].includes(p.code)){
    const w=windowFor(state,p.id),wait=w.quiet?w.remaining+RULES.cycle-RULES.quiet:w.wait;
    setText('action-kicker',`${p.name.toUpperCase()} / NEXT WINDOW IN ${Math.ceil(wait)}s`);
  }
  $('dock').disabled=near(state)==='dock';
  $('auto').disabled=state.phase!=='playing';
}

function renderUI(force=false){
  if(!force&&performance.now()-lastUI<80)return;lastUI=performance.now();
  const seconds=Math.ceil(Math.max(0,state.duration-state.elapsed));
  setText('time',`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`);
  $('time').closest('.time-cell').classList.toggle('low',seconds<=20);
  $('clock-fill').style.transform=`scaleX(${Math.max(0,1-state.elapsed/state.duration)})`;
  setText('score',String(state.score).padStart(4,'0'));setText('best',String(highScore).padStart(4,'0'));
  setText('receipts',String(state.receipts));setText('power',String(state.power));setText('packages',String(state.packages));setText('logs',String(state.bag.length));
  setText('combo',state.combo>1?`GOOD BOT COMBO ×${state.combo}`:'LET’S MAKE ROUNDS');$('combo').classList.toggle('active',state.combo>1);
  [...$('receipt-dots').children].forEach((el,i)=>el.classList.toggle('filled',i<state.receipts));
  for(const d of state.devices){
    const button=stationNodes.get(d.id),w=windowFor(state,d.id),g=gate(state,d.id,true);
    const ready=g.ok||(state.phase==='ready'&&w.quiet&&w.remaining>=8.2);
    const busy=!w.quiet;
    const className=`station ${d.status} ${ready?'ready':''} ${busy&&d.status==='hungry'?'busy':''} ${state.target===d.id?'active':''}`;
    if(button.className!==className)button.className=className;
    const label=d.status==='updating'?`UPDATING · ${Math.ceil(Math.max(0,d.finishAt-state.elapsed))}s`:d.status==='logs'?'LOGS READY ↥':d.status==='happy'?'NEW SOFTWARE. NEW ME.':isEmergency(state)?'EMERGENCY COVER':busy?'IN A PROCEDURE':w.remaining<8.2?'WINDOW CLOSING':'QUIET WINDOW';
    const node=button.querySelector('.station-status');if(node.textContent!==label)node.textContent=label;
    button.setAttribute('aria-label',`Visit ${d.name}, ${d.room}, ${label.toLowerCase()}`);
    const image=d.status==='updating'?'update':d.status==='happy'||d.status==='logs'?'bliss':'manic';
    const img=button.querySelector('img');if(img.dataset.mood!==image){img.src=`${assets}${image}.webp`;img.dataset.mood=image;}
  }
  stationNodes.get('dock').classList.toggle('active',state.target==='dock');
  stationNodes.get('fritzi').classList.toggle('active',state.target==='fritzi');
  $('emergency-banner').hidden=!isEmergency(state);
  document.querySelector('.board-head').classList.toggle('emergency',isEmergency(state));
  if(isEmergency(state)){
    const until=EMERGENCIES.find(([a,b])=>state.elapsed>=a&&state.elapsed<b)?.[1]??state.elapsed;
    setText('emergency-time',`${Math.ceil(until-state.elapsed)}s`);setText('board-status','EMERGENCY COVER');
  }else setText('board-status',state.phase==='paused'?'SHIFT PAUSED':'NIGHT SHIFT');
  $('pause').disabled=state.phase==='ready'||state.phase==='won'||state.phase==='lost';
  $('pause').setAttribute('aria-label',state.phase==='paused'?'Resume game':'Pause game');
  $('pause').firstElementChild.textContent=state.phase==='paused'?'▷':'Ⅱ';
  renderPanel();
  if(state.phase!==lastPhase){lastPhase=state.phase;renderModal();}
}

function renderModal(){
  const visible=state.phase!=='playing';$('overlay').hidden=!visible;
  document.querySelector('.page').inert=visible;
  if(!visible){
    document.body.style.overflow='';
    (pausedFocus&&document.contains(pausedFocus)?pausedFocus:$('primary')).focus({preventScroll:true});pausedFocus=null;
    lastFrame=performance.now();return;
  }
  document.body.style.overflow='hidden';
  const paused=state.phase==='paused',won=state.phase==='won',lost=state.phase==='lost',end=won||lost;
  $('how-to').hidden=paused||end;$('end-stats').hidden=!end;$('modal-secondary').hidden=!paused;
  $('modal-character').src=`${assets}${won?'ketty_wink':lost?'lonely':'ketty'}.webp`;
  $('modal-character').alt=won?'KettyBot winking after a successful shift':lost?'A dramatic C-arm still waiting for care':'KettyBot, your night-shift companion';
  setText('art-caption',won?'EMPLOYEE OF THE NIGHT':lost?'STILL A GOOD BOT':paused?'MANDATORY SNACK BREAK':'CERTIFIED GOOD BOT');
  setText('modal-eyebrow',won?'THEY WERE NEVER ASKING FOR MUCH.':lost?'THE C-ARMS HAVE REQUESTED AN ENCORE.':paused?'EVEN GOOD BOTS NEED A BREATHER.':'THE HOSPITAL IS ASLEEP. THE C-ARMS ARE NOT.');
  $('modal-title').innerHTML=won?'A little care.<br>A hospital ready.':lost?'Shift happens.':paused?'Snack break.':'Big feelings.<br>Tiny night shift.';
  setText('modal-copy',won?'Five loops closed. Power delivered, updates approved, logs home. Care stayed first. That’s the whole idea.':lost?`${state.receipts} of five loops closed. The trick: choose a quiet window, give the go, and bring those logs home.`:paused?'Your shift clock has stopped. Fritzi is holding the fort. Take your time.':'You’re KettyBot. Close five care loops before your shift ends. Everyone would like a plug. Nobody would like a surprise update.');
  setText('modal-primary',won?'One more legendary shift →':lost?'Try the night shift again →':paused?'Back to my rounds →':'Start night shift →');
  setText('modal-note',won?'You didn’t just install something. You made sure it was ready.':lost?'A connected device is step one. A verified receipt closes the loop.':paused?'The clock stays paused until you return.':'Fritzi stays ready as backup. Emergencies pause new maintenance.');
  if(end)$('end-stats').innerHTML=`<div><strong>${state.score}</strong><span>GOOD BOT POINTS</span></div><div><strong>${state.receipts} / 5</strong><span>LOOPS CLOSED</span></div>`;
  requestAnimationFrame(()=>$('modal-primary').focus({preventScroll:true}));
}
$('modal-primary').addEventListener('click',()=>{
  if(state.phase==='paused')act('resume');else act(state.phase==='ready'?'start':'restart');
  sound('connected');
});
$('modal-secondary').addEventListener('click',()=>{act('restart');sound('tap');});
function pause(){if(state.phase==='playing'){releaseHold();pausedFocus=document.activeElement;act('pause');}else if(state.phase==='paused')act('resume');}
$('pause').addEventListener('click',pause);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.phase==='playing'){releaseHold();act('release-direction');act('pause');}});
window.addEventListener('blur',()=>{if(state.phase==='playing'){releaseHold();act('release-direction');act('pause');}});
document.addEventListener('keydown',e=>{
  if(state.phase!=='playing'){
    if(e.key==='Escape'&&state.phase==='paused'){e.preventDefault();act('resume');return;}
    if(e.key==='Tab'&&!$('overlay').hidden){
      const focusables=[...$('overlay').querySelectorAll('a,button')].filter(el=>!el.hidden&&!el.closest('[hidden]'));
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
    return;
  }
  if(e.key==='Escape'){e.preventDefault();pause();return;}
  const dirs={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  if(dirs[e.key]){e.preventDefault();if(!e.repeat){releaseHold();const[dx,dy]=dirs[e.key];heldDirections.delete(e.code);heldDirections.set(e.code,{dx,dy});act('direction',{dx,dy});}return;}
  const actionKey=e.key.toLowerCase()==='e'||([' ','Enter'].includes(e.key)&&document.activeElement===$('primary'));
  if(actionKey){
    e.preventDefault();if(e.repeat)return;
    if($('primary').dataset.action==='connect'){holdingKey=e.code;act('connect-down');sound('connect');}
    else performPrimary();
  }
});
document.addEventListener('keyup',e=>{
  if(e.code===holdingKey){e.preventDefault();holdingKey=null;act('connect-up');lastHoldRelease=performance.now();}
  if(heldDirections.delete(e.code)){
    const remaining=[...heldDirections.values()].at(-1);
    if(remaining){
      if(state.direction?.dx!==remaining.dx||state.direction?.dy!==remaining.dy)act('direction',remaining);
    }else act('release-direction');
  }
});
function releaseHold(){
  if(holdingPointer!==null||holdingKey!==null){holdingPointer=null;holdingKey=null;lastHoldRelease=performance.now();act('connect-up');}
}
function performPrimary(){
  if(state.phase!=='playing')return;
  switch($('primary').dataset.action){
    case'approve':act('approve',{confirmed:true});break;
    case'upload':act('upload');break;
    case'next':act('target',{id:nearestJob(state)});sound('tap');break;
    case'dock':act('target',{id:'dock'});sound('tap');break;
  }
}
$('primary').addEventListener('pointerdown',e=>{
  if(state.phase!=='playing'||$('primary').dataset.action!=='connect'||e.button!==0)return;
  e.preventDefault();holdingPointer=e.pointerId;$('primary').setPointerCapture(e.pointerId);act('connect-down');sound('connect');
});
function endPointer(e){
  if(holdingPointer!==e.pointerId)return;
  holdingPointer=null;lastHoldRelease=performance.now();act('connect-up');
}
$('primary').addEventListener('pointerup',endPointer);
$('primary').addEventListener('pointercancel',endPointer);
$('primary').addEventListener('lostpointercapture',endPointer);
$('primary').addEventListener('click',e=>{
  // A hold finishing changes this same button to "Start". Its release never counts as approval.
  if(performance.now()-lastHoldRelease<220||holdingPointer!==null||holdingKey!==null){e.preventDefault();return;}
  if($('primary').dataset.action==='connect')return;
  performPrimary();
});
$('auto').addEventListener('click',()=>{releaseHold();act('target',{id:nearestJob(state)});sound('tap');});
$('dock').addEventListener('click',()=>{releaseHold();act('target',{id:'dock'});sound('tap');});
$('board').addEventListener('click',e=>{
  if(e.target!==canvas&&e.target!==$('board'))return;
  if(state.phase!=='playing')return;
  const rect=$('board').getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*MAP.width),y=Math.floor((e.clientY-rect.top)/rect.height*MAP.height);
  if(floor(x,y)){releaseHold();act('move',{x,y});pointerMarker={x:x+.5,y:y+.5,time:frameTime};sound('tap');}
});

function rounded(x,y,w,h,r,fill,stroke){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function curve(points,stroke,width,dash=[]){
  ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);
  ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
}
function renderWorld(dt){
  const sx=worldWidth/MAP.width,sy=worldHeight/MAP.height,dpr=Math.min(devicePixelRatio||1,2);
  ctx.setTransform(dpr*sx,0,0,dpr*sy,0,0);ctx.clearRect(0,0,MAP.width,MAP.height);
  ctx.fillStyle='#152b2d';ctx.fillRect(0,0,13,11);
  // Architectural room footprints; corridors are deliberately broad enough to read on a phone.
  ctx.lineWidth=.025;
  const roomColors=['#203b37','#203737','#253832','#223938'];
  const boxes=[[.35,.36,4.2,3.86],[8.45,.36,4.2,3.86],[.35,6.77,4.2,3.88],[8.45,6.77,4.2,3.88]];
  for(let i=0;i<boxes.length;i++){
    const [x,y,w,h]=boxes[i],device=state.devices[i],window=windowFor(state,device.id),active=device.status==='updating';
    rounded(x,y,w,h,.27,roomColors[i],active?'#6e9a9a80':'#55736845');
    // Floorboards and a low luminous doorway.
    ctx.strokeStyle='#a0bdaa09';ctx.lineWidth=.018;
    for(let yy=y+.55;yy<y+h;yy+=.55)curve([[x+.15,yy],[x+w-.15,yy]],'#a0bdaa09',.018);
    const doorY=i<2?y+h:y;const center=device.x+.5;
    curve([[center-.55,doorY],[center+.55,doorY]],active?'#a4d6f2':window.quiet?'#d9bb7280':'#e9977855',.07);
    // Abstract bed and monitor furniture stays quiet behind the characters.
    rounded(i%2?11.65:.65,i<2?1.17:8.4,.45,1.15,.08,'#4b6c5930','#65867420');
    rounded(i%2?11.68:.68,i<2?1.25:8.48,.39,.28,.045,'#93b69a35');
  }
  rounded(4.97,.37,3.06,2.52,.28,'#2b3440','#7c829b45');
  rounded(4.87,8.5,3.25,2.13,.28,'#28423b','#87a88d4d');
  curve([[1.45,5.5],[11.55,5.5]],'#344c4540',1.5);
  curve([[6.5,2.5],[6.5,8.5]],'#344c4540',1.5);
  curve([[2.5,3.5],[2.5,7.5]],'#344c4540',1.45);
  curve([[10.5,3.5],[10.5,7.5]],'#344c4540',1.45);
  curve([[1.45,5.5],[11.55,5.5]],'#314943',1.1);
  curve([[6.5,2.5],[6.5,8.5]],'#314943',1.1);
  curve([[2.5,3.5],[2.5,7.5]],'#314943',1.05);
  curve([[10.5,3.5],[10.5,7.5]],'#314943',1.05);
  curve([[1.45,5.5],[11.55,5.5]],'#9aa48b18',.035,[.12,.23]);
  curve([[6.5,3.3],[6.5,8.5]],'#9aa48b18',.035,[.12,.23]);
  // A central hospital insignia, not another label to read.
  rounded(6.18,5.15,.65,.7,.2,'#53736437');
  curve([[6.5,5.34],[6.5,5.68]],'#97af946b',.09);
  curve([[6.34,5.51],[6.66,5.51]],'#97af946b',.09);
  for(const[x,y]of[[4.45,4.4],[8.55,4.4],[4.45,6.7],[8.55,6.7]]){
    rounded(x-.15,y-.12,.3,.3,.07,'#83987830');
    ctx.fillStyle='#76997150';ctx.beginPath();ctx.arc(x,y-.03,.16,0,Math.PI*2);ctx.fill();
  }
  // A thin living cable connects the local pack to each active device.
  for(const d of state.devices){
    const connected=state.connection?.id===d.id,installing=d.status==='updating',logs=d.status==='logs';
    if(!connected&&!installing&&!logs)continue;
    const top=d.y<5,px=d.x+.5,py=d.dock.y+.5,deviceY=d.y+(top?.55:.4);
    const cableColor=logs?'#bae3ab':connected?'#e2c579':'#a2d3e2';
    const charge=connected?state.connection.charge:1;
    ctx.save();ctx.globalAlpha=.85;
    const endY=py+(deviceY-py)*Math.min(1,charge*1.7);
    ctx.beginPath();ctx.moveTo(px+.31,py);ctx.bezierCurveTo(px+1.04,py,px+.99,endY,px+.34,endY);
    ctx.strokeStyle='#0c2027';ctx.lineWidth=.18;ctx.stroke();ctx.strokeStyle=cableColor;ctx.lineWidth=.06;ctx.stroke();
    rounded(px+.16,py-.18,.35,.34,.06,'#233c42',cableColor);
    const t=reduced?.5:(frameTime*.6)%1;
    if(installing||state.connection?.connected){
      ctx.fillStyle=cableColor;ctx.beginPath();ctx.arc(px+.69,py+(deviceY-py)*t,.075,0,Math.PI*2);ctx.fill();
    }
    if(logs){rounded(px-.25,py-.55,.45,.47,.07,'#f2d484');curve([[px-.14,py-.39],[px+.1,py-.39]],'#6f6144',.025);curve([[px-.14,py-.29],[px+.06,py-.29]],'#6f6144',.025);}
    ctx.restore();
  }
  if(state.path.length){
    const points=[[state.bot.x+.5,state.bot.y+.5],...state.path.map(p=>[p.x+.5,p.y+.5])];
    curve(points,'#091f2255',.2);
    ctx.lineDashOffset=reduced?0:-frameTime*.8;curve(points,'#f3d58b99',.057,[.08,.17]);
    const end=state.path.at(-1);ctx.strokeStyle='#efd28b80';ctx.lineWidth=.04;ctx.beginPath();ctx.arc(end.x+.5,end.y+.5,.21+Math.sin(frameTime*4)*.015,0,Math.PI*2);ctx.stroke();
  }
  if(pointerMarker&&frameTime-pointerMarker.time<.7){
    const t=(frameTime-pointerMarker.time)/.7;ctx.globalAlpha=1-t;ctx.strokeStyle='#d9e9ad';ctx.lineWidth=.035;ctx.beginPath();ctx.arc(pointerMarker.x,pointerMarker.y,.15+t*.45,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){
    p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=2.2*dt;
    ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);
  }
  ctx.globalAlpha=1;
  if(state.phase==='won'&&!reduced&&Math.random()<.22)burst(Math.random()*12+.5,.5,['#f4cc83','#bde5bd','#d2c7ed'][Math.floor(Math.random()*3)],1);
  const bot=$('bot');bot.style.left=`${(state.bot.x+.5)/13*100}%`;bot.style.top=`${(state.bot.y+.5)/11*100}%`;
  bot.classList.toggle('moving',state.phase==='playing'&&state.path.length>0);
}
new ResizeObserver(entries=>{
  const {width,height}=entries[0].contentRect;worldWidth=width;worldHeight=height;
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
}).observe($('board'));
function frame(now){
  const delta=Math.min(.08,Math.max(0,(now-lastFrame)/1000));lastFrame=now;frameTime=now/1000;
  if(state.phase==='playing'){const old=state;state=step(state,delta);react(old);}
  renderWorld(delta);renderUI();requestAnimationFrame(frame);
}
initStations();syncSound();renderUI(true);requestAnimationFrame(frame);
