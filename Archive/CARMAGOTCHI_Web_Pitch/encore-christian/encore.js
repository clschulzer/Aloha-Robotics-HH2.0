/* C-ARMAGOTCHI v2 / TALOS-style deterministic slide and step presentation.
   Pure state + CSS for transitions. The synthetic schedule is one source of truth.
   Only forward single-step navigation animates; jumps and backward clicks settle.
*/
(() => {
  'use strict';
  const root = document.getElementById('stage');
  const all = [...document.querySelectorAll('.slide')];
  const main = all.filter(el => !el.hasAttribute('data-appendix'));
  const appendixSlides = all.filter(el => el.hasAttribute('data-appendix'));
  const channelName = 'carmagotchi-encore-christian-v1';
  const storageKey = 'carmagotchi-encore-christian-state';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  const $ = sel => document.querySelector(sel);
  let index = 0, step = 0, appendix = false, notes = false, black = false;
  let returnPosition = {index:0,step:0};
  let currentSlideId = null;
  let channel;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const deck = () => appendix ? appendixSlides : main;
  const slide = () => deck()[index];
  const steps = el => Math.max(1,Number(el?.dataset.steps||1));
  const stateHash = () => appendix ? `#A${index+1}.${step+1}` : `#${index+1}.${step+1}`;

  const film = $('#chaos-video');
  const playButton = $('#video-play');
  let filmSoundOn = true;
  const sound = (id,volume=.5) => {
    if (reduced) return;
    const el = document.getElementById(id);
    if (!el) return;
    try { el.pause(); el.currentTime=0; el.volume=volume; el.play().catch(()=>{}); } catch(_){}
  };
  function fit(){
    const s = Math.min(window.innerWidth/1920,window.innerHeight/1080);
    root.style.transform=`translate(-50%,-50%) scale(${s})`;
  }
  window.addEventListener('resize',fit,{passive:true}); fit();

  // Synthetic theatre timetable. These are scenarios, not patient records or learned probabilities.
  const START=6, END=24, SPAN=END-START;
  const cases = [
    {id:'CRM—041',theatre:'OR 01',work:[ [7,9.25,'TRAUMA'],[9.7,11.2,'SPINE'],[12.2,14.5,'ORTHO'],[16,17.9,'VASC'],[19,20.3,'ORTHO'] ]},
    {id:'CRM—042',theatre:'OR 02',work:[ [7.5,10.1,'SPINE'],[10.7,12.1,'ORTHO'],[13.3,15.4,'TRAUMA'],[16.1,19.2,'ORTHO'] ]},
    {id:'CRM—043',theatre:'OR 03',work:[ [8,10.9,'VASC'],[12,14.2,'SPINE'],[15.5,17.8,'TRAUMA'],[18.4,20.8,'ORTHO'] ]},
    {id:'CRM—044',theatre:'OR 04',work:[ [7,9.6,'ORTHO'],[10.3,13.9,'SPINE'],[14.9,17.2,'ORTHO'],[19,22.1,'TRAUMA'] ]},
    {id:'CRM—045',theatre:'OR 05',work:[ [8,11.3,'VASC'],[12.4,14.4,'ORTHO'],[15,17.7,'SPINE'],[18.4,21.1,'TRAUMA'] ]}
  ];
  const pos = hour => `${((hour-START)/SPAN)*100}%`;
  const width = (a,b) => `${((b-a)/SPAN)*100}%`;
  function buildSchedule(){
    const hours=$('#schedule-hours');
    for(let h=6;h<=24;h+=2){const s=document.createElement('span');s.textContent=`${String(h).padStart(2,'0')}:00`;hours.appendChild(s);}
    const holder=$('#schedule-lanes');
    cases.forEach((item,i)=>{
      const row=document.createElement('div');row.className='sched-row';row.dataset.lane=String(i);
      const name=document.createElement('div');name.className='sched-name';name.innerHTML=`<b>${item.id}</b><small>${item.theatre}</small>`;row.appendChild(name);
      const timeline=document.createElement('div');timeline.className='sched-lane';
      item.work.forEach(([a,b,label],j)=>{const e=document.createElement('div');e.className=`sched-case${j%3===2?' palecase':''}`;e.style.left=pos(a);e.style.width=width(a,b);e.textContent=label;timeline.appendChild(e);});
      if(i===0){const e=document.createElement('div');e.className='sched-rejected';e.style.left=pos(11.2);e.style.width=width(11.2,12.2);timeline.appendChild(e);}
      if(i===3){const e=document.createElement('div');e.className='sched-rejected';e.style.left=pos(17.2);e.style.width=width(17.2,19.0);timeline.appendChild(e);}
      if(i===1){const e=document.createElement('div');e.className='sched-candidate';e.style.left=pos(19.5);e.style.width=width(19.5,22.75);timeline.appendChild(e);}
      row.appendChild(timeline);holder.appendChild(row);
    });
  }
  buildSchedule();
  const scheduleStates = [
    ['00 / 04','A FULL THEATRE DAY','Five mobile C-arms, shifting procedures and an outstanding service queue.','SOURCE / MOCK CASE SCHEDULE','—','No recommendation before constraints are checked.'],
    ['01 / 04','SCHEDULE SCOUT','Searches for idle intervals long enough for the specific maintenance class.','SHORT WINDOW REJECTED · 11:12–12:12','CANDIDATES','Length is necessary. It is not sufficient.'],
    ['02 / 04','RISK SENTINEL','Discounts emergency exposure, procedure overruns and the need for reserve equipment.','P(INTERRUPTION): OR04 31% · OR02 7% · SYNTHETIC','RE-RANKED','Uncertainty can disqualify apparently empty slots.'],
    ['03 / 04','DEVICE PREFLIGHT','Checks identity, power, network, service type and configuration compatibility.','CRM—042 ELIGIBLE FOR REVIEW','19:30–22:45','Candidate slot found. Device must be reachable and eligible.'],
    ['04 / 04','HUMAN SAFETY GATE','Proposes a slot; hospital IT and an authorized service owner still approve execution.','P(INTERRUPTION) 7% · CLEARANCE PENDING','19:30–22:45','A golden window is not permission to start an update.']
  ];
  function scheduleStep(s){
    const state=scheduleStates[clamp(s,0,4)];
    ['insight-number','insight-name','insight-summary','insight-mini','candidate-time','candidate-desc'].forEach((id,i)=>{document.getElementById(id).textContent=state[i];});
    $('#schedule-lanes').querySelectorAll('.sched-row').forEach((row,i)=>{
      row.classList.toggle('scan-on',s>=1);
      row.classList.toggle('scout',s>=1 && i===1);
      row.classList.toggle('risk',s>=2 && (i===0||i===3));
      row.classList.toggle('recommended',s>=3 && i===1);
    });
    $('.schedule-insights').dataset.mode=String(s);
    $('.schedule-chart').dataset.scan=String(s);
  }
  const phoneStates=[
    ['lonely.webp','NO CONTACT FOR 43 DAYS','“Have you forgotten about me?”','43 DAYS AGO','REQUEST A SERVICE VISIT ↗','idle'],
    ['lonely.webp','IDENTITY CONFIRMED','“You found me. CRM—041.”','43 DAYS AGO','CHECK AVAILABLE SERVICE ↗','checking'],
    ['manic.webp','SERVICE REQUEST SENT','“OH. SOMEONE IS COMING.”','PENDING','VIEW SERVICE STATUS ↗','queued'],
    ['bliss.webp','SERVICE VISIT CONFIRMED','“Ahh… help is on its way.”','AWAITING SYNC','MISSION QUEUED ✓','connected']
  ];
  let phoneShown = -1;
  let activePhoneLayer = 0;
  function phoneStep(s){
    const v=phoneStates[clamp(s,0,phoneStates.length-1)];
    if (phoneShown !== s) {
      const current=document.getElementById(activePhoneLayer===0?'phone-mascot-a':'phone-mascot-b');
      const next=document.getElementById(activePhoneLayer===0?'phone-mascot-b':'phone-mascot-a');
      const target=`assets/${v[0]}`;
      const sameImage=current.getAttribute('src')===target;
      if (!sameImage) {
        next.setAttribute('src',target);
        next.classList.add('current');current.classList.remove('current');
        activePhoneLayer=1-activePhoneLayer;
      }
      if (phoneShown>=0 && !reduced) {
        const textElements=['phone-state','phone-quote','phone-sync','phone-action'];
        for(const id of textElements){document.getElementById(id).animate([
          {opacity:.30,transform:'translateY(7px)'},
          {opacity:1,transform:'translateY(0)'}
        ],{duration:430,fill:'none',easing:'cubic-bezier(.2,.8,.2,1)'});}
      }
    }
    $('#phone-state').textContent=v[1];$('#phone-quote').textContent=v[2];
    $('#phone-sync').textContent=v[3];$('#phone-action').textContent=v[4];
    $('#phone-shell').dataset.mode=v[5];
    phoneShown=s;
  }
  const moodStates=[
    ['GHOSTED BY<br>THE NETWORK.','“It’s been 43 days since someone connected me.”','STATE / DISCONNECTED',0],
    ['CRITICALLY<br>UNSTABLE.','“PLEASE PLUG ME IN. I’LL BE GOOD.”','PERSONALITY v0.9 / UNSTABLE',9],
    ['INSTALLING<br>IMPULSE CONTROL.','“Oh. That feels like a very important patch.”','BACKUP → INSTALL / SIMULATED',69],
    ['EMOTIONALLY<br>STABLE.','“Ahhh... operating within approved parameters.”','v1.0 / SATISFIED',100],
    ['RESTORATION<br>FAILED.','“Wait... why do I remember everything?”','ERROR / INCOMPATIBLE PARAMETERS',100],
    ['ROLLBACK<br>INITIATED.','“YOU CAN’T DELETE WHO I AM.”','EXCEPTION / TECHNICIAN NOTIFIED',12]
  ];
  function moodStep(s){
    const v=moodStates[clamp(s,0,moodStates.length-1)];
    $('.mood-copy h2').innerHTML=v[0];$('#mood-line').textContent=v[1];
    $('#mood-system').textContent=v[2];$('#mood-progress').style.width=v[3]+'%';
    $('#mood-count').textContent=`0${s+1} / 06`;
    document.querySelectorAll('.update-char').forEach((el,i)=>el.classList.toggle('on',i===s));
  }
  const routeStates=['AWAITING AN APPROVED MISSION','ROBOT DISPATCHED / ROUTE AUTHORIZED','DOCKED / DEVICE IDENTIFIED + AUTHENTICATED','SERVICE LOG TRANSFER / SIMULATED','HANDOFF COMPLETE / EXCEPTIONS TO ENGINEER'];
  function robotStep(s){
    $('#service-map').dataset.action=String(s);
    $('#map-status').textContent=routeStates[clamp(s,0,routeStates.length-1)];
    document.querySelectorAll('.mission-step').forEach((el,i)=>el.classList.toggle('active',i<=s));
  }
  function sandboxStep(s){
    const txt=['SNAPSHOT PREPARED / NO DEVICE CHANGE','IDENTITY + PACKAGE GATE / MOCK PASS','CONFIGURATION CONFLICT DETECTED IN SHADOW TEST','STOPPED / NOTIFY AUTHORIZED TECHNICIAN'];
    $('#shadow-status').textContent=txt[clamp(s,0,3)];
    $('.shadow-device').dataset.check=String(s);
  }

  function sendState(){
    const data={type:'deck-state',appendix,index,step,title:slide()?.dataset.title||'',at:Date.now()};
    try{channel?.postMessage(data);}catch(_){}
    try{localStorage.setItem(storageKey,JSON.stringify(data));}catch(_){}
  }
  function updateVideoControls(){
    const t=film.currentTime||0, total=film.duration||30;
    const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
    $('#video-time').textContent=`${fmt(t)} / ${fmt(total)}`;
    playButton.textContent=film.paused?'▶ PLAY FILM':'❚❚ PAUSE FILM';
    $('#video-sound').textContent=film.muted?'SOUND OFF':'SOUND ON';
  }
  function toggleFilm(){
    if(film.paused){film.play().catch(()=>{});}else{film.pause();}updateVideoControls();
  }
  function filmEnter(){
    film.muted=!filmSoundOn;
    film.currentTime=0;
    const promise=film.play();
    promise?.catch(()=>{playButton.textContent='▶ PLAY FILM';});
    updateVideoControls();
  }
  function filmLeave(){film.pause();updateVideoControls();}
  film.addEventListener('timeupdate',updateVideoControls);
  film.addEventListener('play',updateVideoControls);film.addEventListener('pause',updateVideoControls);
  film.addEventListener('ended',updateVideoControls);
  $('#video-play').addEventListener('click',e=>{e.stopPropagation();toggleFilm();});
  $('#video-sound').addEventListener('click',e=>{e.stopPropagation();filmSoundOn=!filmSoundOn;film.muted=!filmSoundOn;updateVideoControls();});
  $('#phone-action')?.addEventListener('click',e=>{e.stopPropagation();if(slide()?.classList.contains('scene-phone'))advance();});

  // Short, actionable presenter cues follow the CURRENT click; the full paragraph remains below.
  const beatCues = {
    1:['0:00–0:07 · TEAM + CHALLENGE'],
    2:['0:07–0:37 · VIDEO PLAYS / NO NARRATION'],
    3:['0:37–0:40 · AUTONOMY','0:40–0:43 · EAGLE SCREECH / PALMER LOOKALIKE','0:43–0:47 · ALL THREE TEAM MEMBERS SLAM'],
    4:['0:47 · LONELY','0:53 · MANIC / PLUG ME IN','0:59 · INSTALLING','1:06 · BLISS','1:11 · RESTORATION FAILURE','1:15 · THE GRIN RETURNS'],
    5:['1:18 · HARD SILENCE','1:22 · INVISIBLE CONNECTIVITY'],
    6:['1:25 · INVISIBLE SERVICE LAYER','1:29 · TRUSTED INPUTS','1:35 · SCOUT + RISK','1:41 · ISOLATED PREFLIGHT','1:47 · POLICY AND HUMAN GATE'],
    7:['1:52 · THEATRE SCHEDULE','1:58 · SCOUT IDLE WINDOWS','2:04 · RISK REJECTS WINDOWS','2:09 · GOLDEN CANDIDATE / APPROVAL PENDING'],
    8:['2:14 · PARKED C-ARM','2:19 · DISPATCH','2:23 · DOCK + VERIFY','2:29 · CONNECT AND SYNC','2:34 · LOVE ASCENSION / HUMAN HANDOFF'],
    9:['2:40 · SURGEONS SAVE LIVES','2:47 · REVEAL IAI','2:55 · WINK AND TECHNICAL QUESTIONS']
  };
  function render({forward=false,instant=false,hash=true,broadcast=true}={}){
    index=clamp(index,0,deck().length-1);step=clamp(step,0,steps(slide())-1);
    const el=slide(); const justEntered=currentSlideId!==el;
    if(justEntered && currentSlideId?.classList.contains('scene-video'))filmLeave();
    // Snap for backwards and direct jumps; animate only a single forward increment.
    root.classList.toggle('instant',instant||reduced);
    all.forEach(node=>{
      const active=node===el;
      node.classList.toggle('active',active);
      node.setAttribute('aria-hidden',String(!active));
      if(!active)return;
      node.dataset.step=String(step);
      node.querySelectorAll('.reveal').forEach(item=>{
        const k=Number(item.dataset.at||0), only=item.hasAttribute('data-only');
        item.classList.toggle('on',only?step===k:step>=k);
      });
    });
    if(el.classList.contains('scene-video') && justEntered)filmEnter();
    if(el.classList.contains('scene-phone'))phoneStep(step);
    if(el.classList.contains('scene-moods'))moodStep(step);
    if(el.classList.contains('scene-schedule'))scheduleStep(([0,1,2,4][step] ?? 0));
    if(el.classList.contains('scene-sandbox'))sandboxStep(step);
    if(el.classList.contains('scene-robot'))robotStep(step);
    if(el.classList.contains('scene-brain'))$('.brain-diagram').dataset.analysis=String(step);
    root.dataset.theme=el.classList.contains('theme-paper')?'paper':'dark';
    $('#deck-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(deck().length).padStart(2,'0')}${appendix?' · Q&A':''}`;
    $('#chrome-section').textContent=appendix?'TECHNICAL APPENDIX / Q&A':(index<4?'3-MINUTE ENCORE / ACT I · THE CHARACTERS':'3-MINUTE ENCORE / ACT II · INVISIBLE SERVICE');
    const progress=(index+(step+1)/steps(el))/deck().length*100;
    $('#progress-line').style.width=progress+'%';
    const beat = !appendix ? beatCues[index+1]?.[step] : null;
    $('#notes-text').textContent=(beat ? `CURRENT CLICK: ${beat}\n\n` : '')+(el.dataset.note||'');
    $('#notes-panel').classList.toggle('show',notes);
    if(forward && !reduced){
      if(el.classList.contains('scene-encore-team') && step===2)sound('impact-sound',.34);
      if(el.classList.contains('scene-encore-team') && step===1)sound('screech-sound',.36);
    }
    document.title=`${el.dataset.title||'C-ARMAGOTCHI'} / C-ARMAGOTCHI`;
    currentSlideId=el;
    if(hash&&location.hash!==stateHash())history.replaceState(null,'',stateHash());
    if(broadcast)sendState();
    if(instant&&!reduced){requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('instant')))}
  }
  function advance(){
    if(black||$('#help-panel').classList.contains('show'))return;
    if(step<steps(slide())-1){step++;render({forward:true});return;}
    if(index+1<deck().length){index++;step=0;render({forward:true});return;}
    if(appendix)toggleAppendix();
  }
  function previous(){
    if(black||$('#help-panel').classList.contains('show'))return;
    if(step>0){step--;render({instant:true});return;}
    if(index>0){index--;step=steps(slide())-1;render({instant:true});}
  }
  function jump(i,s=0,app=appendix){appendix=Boolean(app);index=clamp(Number(i)||0,0,deck().length-1);step=clamp(Number(s)||0,0,steps(slide())-1);render({instant:true});}
  function toggleAppendix(){
    if(!appendix){returnPosition={index,step};appendix=true;index=0;step=0;}
    else{appendix=false;index=returnPosition.index;step=returnPosition.step;}
    render({instant:true});
  }
  function parseHash(){
    const m=location.hash.match(/^#(A)?(\d+)(?:\.(\d+))?$/i);
    if(!m)return null;
    const app=!!m[1], list=app?appendixSlides:main, i=Number(m[2])-1;
    if(i<0||i>=list.length)return null;
    return {appendix:app,index:i,step:clamp(Number(m[3]||1)-1,0,steps(list[i])-1)};
  }
  function fullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});}
  const setBlack=v=>{black=Boolean(v);$('#black-screen').classList.toggle('show',black);};
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    let handled=true;
    switch(e.key){
      case 'ArrowRight':case 'ArrowDown':case ' ':case 'Enter':case 'PageDown':advance();break;
      case 'ArrowLeft':case 'ArrowUp':case 'Backspace':case 'PageUp':previous();break;
      case 'f':case 'F':fullscreen();break;
      case 'n':case 'N':notes=!notes;render({hash:false,broadcast:false,instant:true});break;
      case 'a':case 'A':toggleAppendix();break;
      case 'b':case 'B':setBlack(!black);break;
      case 'r':case 'R':appendix=false;index=0;step=0;setBlack(false);render({instant:true});break;
      case 'Home':jump(0,0);break;
      case 'End':jump(deck().length-1,steps(deck().at(-1))-1);break;
      case '?':case 'h':case 'H':$('#help-panel').classList.toggle('show');break;
      case 'Escape':$('#help-panel').classList.remove('show');setBlack(false);break;
      case 's':case 'S':filmSoundOn=!filmSoundOn;film.muted=!filmSoundOn;updateVideoControls();break;
      case 'p':case 'P':if(slide().classList.contains('scene-video'))toggleFilm();break;
      case 'v':case 'V':if(slide().classList.contains('scene-video')){film.currentTime=0;film.play().catch(()=>{});}break;
      default:handled=false;
    }
    if(handled)e.preventDefault();
  });
  root.addEventListener('click',e=>{
    if(e.target.closest('button,a,video'))return;
    if(e.clientX<window.innerWidth*.19)previous();else advance();
  });
  $('#help-close').addEventListener('click',()=>$('#help-panel').classList.remove('show'));
  $('#help-panel').addEventListener('click',e=>{if(e.target.id==='help-panel')$('#help-panel').classList.remove('show');});
  window.addEventListener('hashchange',()=>{const h=parseHash();if(h){appendix=h.appendix;index=h.index;step=h.step;render({hash:false,instant:true});}});
  try{channel=new BroadcastChannel(channelName);channel.onmessage=e=>{const v=e.data||{};if(v.type==='request-state')sendState();if(v.type==='remote-navigation')jump(v.index,v.step,v.appendix);};}catch(_){}
  const initial=parseHash();if(initial){appendix=initial.appendix;index=initial.index;step=initial.step;}
  render({instant:true});
  window.CarmDeck={getState:()=>({index,step,appendix,total:deck().length,title:slide().dataset.title}),jump,next:advance,prev:previous,toggleAppendix,playVideo:()=>film.play(),sound:()=>filmSoundOn};
})();
