import {DEVICES, WINDOW as W, MOODS, PEOPLE, CHECKS, initialState, restoreState, reduce, progress, canStart, deviceMood} from './state.mjs';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG=n=>`assets/characters/${n}.webp`;
const URL_APP=new URL('./',location.href).href.split('#')[0].split('?')[0];
const STORE='aloha-carmagotchi-app-v1';
const shapes={
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 arrow:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 sparkle:'<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 plug:'<path d="M8 2v5m8-5v5M5 7h14v3a7 7 0 0 1-14 0ZM12 17v5"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v2"/>',
 bot:'<rect x="5" y="7" width="14" height="13" rx="4"/><path d="M12 3v4M3 11v5m18-5v5M8 13h.1m7.8 0h.1M9 17h6"/><circle cx="12" cy="3" r="1"/>',
 finger:'<path d="M9 12V4a2 2 0 0 1 4 0v6l5 1a3 3 0 0 1 3 3l-1 5a3 3 0 0 1-3 3h-5a3 3 0 0 1-2-1L4 15a2 2 0 0 1 3-3l2 2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3m-10 4h3"/>',
 pause:'<path d="M9 5v14M15 5v14"/>',
 warning:'<path d="m12 3 10 18H2ZM12 9v5m0 3h.01"/>',
 tool:'<path d="m14 7 3 3 4-4a7 7 0 0 1-9 9l-6 6a2 2 0 0 1-3-3l6-6A7 7 0 0 1 18 3Z"/>',
 refresh:'<path d="M20 11a8 8 0 1 0-1 5M20 4v7h-7"/>',
 sound:'<path d="M4 9v6h4l5 4V5L8 9ZM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 motion:'<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
 share:'<path d="M12 16V3m-5 5 5-5 5 5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
 shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 10 3 3 5-6"/>',
 file:'<path d="M14 2H5v20h14V7Zm0 0v5h5M8 12h8m-8 4h6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 location:'<path d="M19 9c0 6-7 13-7 13S5 15 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
 link:'<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 8a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2"/>',
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${shapes[name]||shapes.info}</svg>`;
const button=(label,action,cls='primary',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const link=(label,to,cls='primary')=>`<a class="${cls}" href="#/${to}">${label}</a>`;
const img=(name,alt='',cls='')=>`<img src="${IMG(name)}" alt="${esc(alt)}" class="${cls}" draggable="false">`;
const title=(eyebrow,heading,text='')=>`<div class="page-title"><div class="eyebrow">${eyebrow}</div><h1>${heading}</h1>${text?`<p>${text}</p>`:''}</div>`;
const facts=rows=>`<ul class="stat-list">${rows.map(([a,b])=>`<li><span>${a}</span><b>${b}</b></li>`).join('')}</ul>`;
const callout=(head,text,name='info',warn=false)=>`<div class="callout${warn?' warn':''}">${icon(name)}<div><b>${head}</b><span>${text}</span></div></div>`;
let state;
try{state=restoreState(localStorage.getItem(STORE));}catch{state=initialState();}
let route=location.hash.slice(2)||'home',toastTimer,audio,modalCallback,lastScreen='';
const running=()=>['circle','mission','updating','recovering'].includes(state.phase);
const phaseRoute=()=>({idle:'request',preparing:'prepare',circle:'circle',mission:'mission',review:'review/1',updating:'progress',complete:'complete',paused:'paused',failed:'service',recovering:'progress',recovered:'service'})[state.phase]||'home';
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}}
function send(action,renderNow=true){state=reduce(state,action);persist();if(renderNow)render();}
function go(to){if(location.hash===`#/${to}`){route=to;render();window.scrollTo(0,0);}else location.hash=`/${to}`;}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function sound(kind='tap'){
 if(!state.sound)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();
  const notes=kind==='happy'?[523,659,784]:kind==='success'?[523,659,784,1047]:kind==='notify'?[660,880]:[440];
  notes.forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.075;o.type='sine';o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+.17);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.18);});
 }catch{}
}
function haptic(){if(state.haptics&&navigator.vibrate)navigator.vibrate(12);}
function pet(el){
 send({type:'pet'},false);sound('happy');haptic();
 el.classList.remove('petted');void el.offsetWidth;el.classList.add('petted');
 if(state.motion&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const r=el.getBoundingClientRect();
  for(let i=0;i<5;i++){const heart=document.createElement('span');heart.className='love';heart.textContent='♥';heart.style.cssText=`left:${r.x+r.width/2+(i-2)*18}px;top:${r.y+r.height*.45}px;--dx:${(i-2)*23}px;animation-delay:${i*.04}s`;$('#effects').append(heart);setTimeout(()=>heart.remove(),1400);}
 }
 const name=el.dataset.petName||'Cio',mood=el.dataset.petMood||deviceMood(state);
 toast(mood==='happy'?`${name} sends a little love back.`:`${name} appreciates you. A little care goes a long way.`);
}
function confirmModal(heading,text,cta,fn,danger=false){
 $('#dialog-content').innerHTML=`<div class="dialog-icon">${icon(danger?'refresh':'info')}</div><h2 id="dialog-title">${heading}</h2><p>${text}</p><div class="stack">${button(cta,'modal-confirm',danger?'danger-button':'primary teal')}${button('Cancel','modal-close','secondary')}</div>`;
 modalCallback=fn;$('#dialog').showModal();
}
function setting(key,label,description,name){
 return `<button class="setting" role="switch" aria-checked="${state[key]}" data-action="setting" data-key="${key}">${icon(name)}<div><b>${label}</b><small>${description}</small></div><i class="switch" aria-hidden="true"></i></button>`;
}
function header(){
 const names={home:'',fleet:'Your C-arms',request:'A small request',requests:'Your requests',prepare:'Give Cio a hand',circle:'Cio’s care circle',mission:'The invisible helper',review:'A human decides',progress:'Looking after Cio',complete:'The loop is closed',receipt:'Service receipt',moods:'Every mood is a data point',window:'The golden window',activity:'Activity',profile:'Your space',carecircle:'Cio’s people',service:'A little extra care',share:'Pass it on',paused:'Care has right of way',device:'Your C-arm'};
 const top=route.split('/')[0],home=top==='home',dark=['request','circle'].includes(top)&&['idle','circle'].includes(state.phase);
 document.body.classList.toggle('dark-mode',dark);
 $('meta[name="theme-color"]').content=dark?'#0b1219':'#f6f3ec';
 $('#header').innerHTML=home?`<div><span class="brand">C-ARMAGOTCHI<b>.</b></span><span class="sub-brand">your team’s C-arms <i class="demo-dot"></i> interactive demo</span></div><a class="icon-button" href="#/requests" aria-label="Your requests">${icon('bell')}${!['complete','recovered'].includes(state.phase)?'<i class="badge"></i>':''}</a>`:
 `<div class="back-heading">${button(icon('back'),'back','icon-button','aria-label="Go back"')}<strong>${names[top]||'C-ARMAGOTCHI'}</strong></div><span class="demo-label">DEMO</span>`;
 const tab=['requests','request','prepare','circle','mission','review','progress','paused'].includes(top)?'requests':['activity','receipt'].includes(top)?'activity':['profile','share'].includes(top)?'profile':'home';
 $('#navigation').className='nav';
 $('#navigation').innerHTML=[['home','heart','C-arms'],['requests','bell','Requests'],['activity','clock','Activity'],['profile','user','You']].map(([to,name,label])=>`<a href="#/${to}" class="${tab===to?'active':''}" ${tab===to?'aria-current="page"':''}>${icon(name)}<span>${label}</span>${to==='requests'&&!['complete','recovered'].includes(state.phase)?'<i class="nav-dot"></i>':''}</a>`).join('');
 document.documentElement.dataset.motion=state.motion?'on':'off';
}
function petCard(mood,name='Cio',explore=false){
 const m=MOODS[mood];return `<div class="pet-panel" style="--mood-bg:${m.bg};--mood-color:${m.color}">
  <span class="mood-tag"><i></i>${m.name}</span><button class="pet-tap" data-action="pet" data-pet-name="${name}" data-pet-mood="${mood}" aria-label="Give ${name} some love">${img(m.image,name)}</button>
  ${explore?'':`<a class="mood-help" href="#/moods/${mood}" aria-label="What does this mood mean?">${icon('info')}</a>`}
 </div><h1 class="pet-name">${name}</h1><div class="pet-state" style="--mood-color:${m.color}"><i class="state-dot"></i>${m.state}</div>
 <p class="pet-quote">“${m.quote}”</p><div class="pet-data">${m.data.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
}
function home(){
 const mood=deviceMood(state),m=MOODS[mood],label=state.phase==='idle'?m.cta:state.phase==='complete'?m.cta:({preparing:'Continue helping Cio',circle:'See the care circle',mission:'Follow KettyBot',review:'Ready for your review',paused:'View paused request',failed:'Call service',recovered:'View recovery report'})[state.phase]||m.cta;
 return `<div class="pet-meta"><span>C-03 · Corridor B</span><a class="text-button" href="#/fleet" style="padding:0;margin:0;min-height:30px">All 6 C-arms ${icon('arrow')}</a></div>
 ${petCard(mood)}${button(`${esc(label)} ${icon(state.phase==='complete'?'heart':'arrow')}`,state.phase==='complete'?'pet-home':'continue','primary pet-cta',`style="--mood-color:${m.color}"`)}
 <a class="window-link" href="#/window">${icon('sparkle')}<div><b>${state.phase==='complete'?'A little care made a difference.':'A golden window for Cio.'}</b><span>${W.from}–${W.to} · ${W.backup} stays available</span></div>${icon('arrow','chevron')}</a>
 <div class="section-heading"><h2>One machine. A whole team.</h2></div>
 <a class="card compact row" href="#/carecircle" style="text-decoration:none"><span class="avatar">L</span><div><h3>You’re in Cio’s circle.</h3><p>No one has to carry it alone.</p></div>${icon('arrow')}</a>
 <p class="small-footer">From Aloha Robotics’ latest pitch.<br>All devices, requests and actions here are simulated.</p>`;
}
function request(){
 if(state.phase!=='idle')return requests();
 return `<div class="lock-screen"><div class="lock-who">LENA · X-RAY NURSE</div><div class="lock-time">${W.request}</div><div class="lock-date">${W.date}</div>
 <button class="push" data-action="show-job"><span class="push-head">${img('bliss')}<b>C-ARMAGOTCHI</b><span>now</span></span><div class="push-title">Cio needs a hand</div><div class="push-body">C-03 · Corridor B · ${W.from}–${W.to}</div></button>
 <div class="job" id="job"><div class="row">${img('manic')}<div><h2>Cio needs a hand</h2><p>C-03 · Corridor B, outside OR 3</p></div></div>
 ${facts([['When',`${W.from}–${W.to}`],['Effort','Connect the device'],['Why you','Trained · in Cio’s circle']])}
 <div class="job-btns">${button('Take it','accept','primary teal')}${button('Not today','decline','secondary')}</div></div>
 <p class="dark-note">Declining costs nothing.<br>It simply asks the next people.</p></div>`;
}
function requests(){
 const labels={idle:['Cio needs a hand','A golden window is waiting.','manic'],preparing:['You’re helping Cio','The connection checklist is ready.','manic'],circle:['Asking the care circle','No problem. Someone else can help.','manic'],mission:['KettyBot is on its way','Watch the invisible helper at work.','ketty'],review:['Ready for a human','You review. You decide.','update'],updating:['Cio is updating','We’ll keep an eye on the demo.','update'],complete:['One happy Cio','The update is complete. Thank you.','bliss'],paused:['Request paused',state.reason,'lonely'],failed:['Cio needs service','An interruption needs extra care.','failure'],recovering:['Service recovery running','Returning to the previous version.','rollback'],recovered:['Ready for team review','A new update window will be needed.','lonely']};
 const [h,p,art]=labels[state.phase];
 return `${title('SMALL REQUESTS. SHARED RESPONSIBILITY.','A hand when<br>it matters.')}<a class="card row" href="#/${phaseRoute()}" style="text-decoration:none">${img(art)}<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>${icon('arrow')}</a><div class="card space-top">${facts([['Device','C-03 · Cio'],['Window',`${W.from}–${W.to}`],['Backup',W.backup]])}${button('Open request','continue','primary teal')}</div>
 <p class="small-footer">Requests stay here when you leave a screen.<br>This demo stores your progress on this browser.</p>`;
}
function checkRow(key,label,sub='',group='check'){
 const checked=(group==='prep'?state.prep:state.checks)[key];
 return `<label class="check-row"><input type="checkbox" data-group="${group}" data-check="${key}" ${checked?'checked':''}><span>${label}${sub?`<small>${sub}</small>`:''}</span></label>`;
}
function prepare(){
 return `${title('THANK YOU, LENA.','A little power.<br>A little care.','In this demo, you’re the person connecting Cio.')}<div class="card compact row">${img('manic')}<div><h3>C-03 · Cio</h3><p>Corridor B, outside OR 3</p></div>${icon('plug')}</div>
 <div class="check-list">${checkRow('device','This is Cio','Device C-03, in the example location.','prep')}${checkRow('power','Power is connected','Confirm the simulated connection.','prep')}${checkRow('clear','Cio is free for the planned window','No patient or procedure is using it.','prep')}</div>
 ${button('Cio is connected','prepared','primary teal',Object.values(state.prep).every(Boolean)?'':'disabled')}
 ${button('I need a hand after all','prepare-pause','text-button')}${callout('Connection is only the beginning.','You’ll still review the time and surroundings before starting.','finger')}`;
}
function circle(){
 return `<div class="circle-header"><div class="eyebrow">DECLINING COSTS NOTHING.</div><h1>No problem.</h1><p>${state.circleReady?'One of those days. Nobody’s available.':'Asking the next people.'}</p></div>
 <div class="radar"><i class="ring"></i><i class="ring outer"></i><div class="radar-center">${img('manic')}</div>${PEOPLE.slice(1).map((p,i)=>{const a=(i*60-90)*Math.PI/180;return `<div class="person-dot" data-person="${i}" style="left:calc(50% + ${Math.cos(a)*115}px);top:calc(50% + ${Math.sin(a)*108}px)"><b>${p.initial}</b><span>${p.name}</span></div>`;}).join('')}</div>
 <div class="helper-card"><div class="row">${img('ketty')}<div><h3>The invisible helper.</h3><p>It can make the trip.<br>You still make the decision.</p></div></div>
 ${button(state.circleReady?'Send KettyBot '+icon('arrow'):'Asking the care circle…','dispatch','primary',state.circleReady?'':'disabled')}</div>
 <p class="dark-note">A simulated request to Cio’s circle.<br>No messages are sent to real people.</p>`;
}
function mission(){
 const ready=state.phase==='review';
 return `<div class="mission-head"><div class="eyebrow">KETTYBOT → C-03 CIO</div><h1 id="mission-title">${ready?'Ready for a human.':'A small mission.'}</h1><p id="mission-caption">${ready?'The helper stops here. You decide what happens next.':'Checking the essentials before setting off.'}</p></div>
 <div class="mission-map"><svg viewBox="0 0 340 260" role="img" aria-label="Illustrative KettyBot route through Corridor B">
 <rect class="map-floor" x="0" y="0" width="340" height="260"/><rect class="map-room" x="14" y="15" width="89" height="91" rx="8"/><rect class="map-room" x="113" y="15" width="89" height="91" rx="8"/><rect class="map-room" x="212" y="15" width="114" height="91" rx="8"/>
 <rect class="map-room" x="14" y="180" width="98" height="67" rx="8"/><rect class="map-room" x="212" y="180" width="114" height="67" rx="8"/>
 <text class="map-text" x="27" y="36">OR 1</text><text class="map-text" x="126" y="36">OR 2</text><text class="map-text" x="224" y="36">EQUIPMENT 2</text><text class="map-text" x="25" y="199">ROBOT DOCK</text><text class="map-text" x="225" y="199">HYBRID OR</text><text class="map-corridor" x="135" y="164">CORRIDOR B</text>
 <path id="mission-route" class="map-route" d="M58 219 L58 135 L270 135 L270 77"/><path id="mission-line" class="map-progress" d="M58 219 L58 135 L270 135 L270 77"/>
 <circle cx="164" cy="135" r="6" fill="#e9ddc6" stroke="#ba9d64"/><text class="map-text" x="139" y="122">LAST SEEN</text>
 <image href="${IMG('manic')}" x="260" y="49" width="50" height="50"/>
 <g id="mission-bot"><circle r="18" fill="#d3e2cd" stroke="#88aa84"/><image href="${IMG('ketty')}" x="-22" y="-24" width="44" height="44"/></g></svg></div>
 <div class="mission-steps" id="mission-steps">${['Check','Find','Connect','Ask'].map(x=>`<span>${x}</span>`).join('')}</div>
 <div class="card compact"><div class="eyebrow" id="checks-label">BEFORE LEAVING</div><ul class="mission-checks" id="mission-checks">${CHECKS.map(([t,s],i)=>`<li data-check-index="${i}"><span class="check-indicator"></span><div><b>${t}</b><small>${s}</small></div></li>`).join('')}</ul><p class="mission-summary" id="mission-summary"></p></div>
 <div class="space-top">${ready?link('Review Cio’s update '+icon('arrow'),'review/1','primary teal'):button('Checks in progress…','noop','primary teal','disabled')}</div>
 ${button('Conditions changed','pause-options','text-button')}<p class="small-footer">Illustrative route and checks. No physical robot is connected.</p>`;
}
function review(step){
 step=Math.max(1,Math.min(3,Number(step)||1));
 if(step>1&&!state.checks.time)step=1;
 if(step===3&&!['area','drapes','brakes','power'].every(k=>state.checks[k]))step=2;
 const top=`<div class="wizard"><div class="step-head"><span class="step-count">${step} / 3 · YOUR DECISION</span><div class="step-dots">${[1,2,3].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div></div>`;
 const help=`${button('Not sure? Pass it on','pass-on','text-button')}${button('Conditions changed','pause-options','text-button')}`;
 if(step===1)return top+`<h1>Right time?</h1><p class="intro">Care has right of way. Take a moment to review Cio’s window.</p>
 <div class="card">${facts([['Window',`${W.from}–${W.to}`],['Next case',W.guard],['Emergency alert','<span class="green">None in this scenario</span>'],['Expected update',`${W.duration} minutes`],['Backup',`${W.backup} · available`]])}</div>
 ${callout('A real check. A simulated hospital.','This is the window from the latest pitch. Installation time is compressed in the demo.','calendar')}
 <div class="space-top">${button('Yes, right time '+icon('arrow'),'confirm-time','primary teal')}</div>${help}</div>`;
 if(step===2)return top+`<h1>Surroundings OK?</h1><p class="intro">The helper connects. A person confirms.</p>
 <div class="camera">${img('manic','Illustrative Cio in Corridor B')}<span class="camera-label">SIMULATED CAMERA VIEW</span><span class="camera-location">C-03 CIO · CORRIDOR B</span></div>
 <div class="check-list">${checkRow('area','Nobody in the working area')}${checkRow('drapes','No patient or sterile drapes')}${checkRow('brakes','Brakes on, arm parked')}${checkRow('power','Power is stable')}</div>
 ${button('Looks good '+icon('arrow'),'confirm-area','primary teal',['area','drapes','brakes','power'].every(k=>state.checks[k])?'':'disabled')}${help}</div>`;
 return top+`<h1>Start the update.</h1><p class="intro">A human starts every update. This one is yours.</p><div class="approval-pet">${img('update','Cio ready to install')}</div>
 ${callout('Cio · '+W.package,`Published by medical physics ${W.publication}. Signed package and rollback image are part of this scenario.`,'shield')}
 <div class="approval-person"><span class="avatar">L</span><div><b>Lena · X-ray nurse</b><p>${state.availability==='available'?'Demo reviewer · time and surroundings confirmed':'You are marked unavailable. Change availability to continue.'}</p></div>${icon('check')}</div>
 ${button('Start demo update '+icon('finger'),'start-update','primary',canStart(state)?'':'disabled')}
 <p class="small-footer">Your tap starts a local simulation.<br>No command is sent to a medical device.</p>${help}</div>`;
}
function updating(){
 const recover=state.phase==='recovering';
 return `<div class="progress-hero"><div class="eyebrow">C-03 CIO · ${recover?'SERVICE RECOVERY':W.package}</div><h1>${recover?'Finding my old self.':'Please don’t unplug.'}</h1><p class="muted space-top" style="font-size:12px">${recover?'The previous image is being restored.':'You’ve done your part. I’ll take it from here.'}</p></div>
 <div class="progress-art">${img(recover?'rollback':'update')}</div><div class="progress-track" role="progressbar" aria-label="${recover?'Recovery':'Update'} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-fill"></div></div>
 <div class="progress-numbers"><b><span id="percent">0</span><small>%</small></b><span>${recover?'Accelerated recovery demo':'120-minute example · time compressed'}</span></div>
 <div class="card compact"><div class="eyebrow">LOOKING AFTER THE LITTLE THINGS</div><div class="progress-phase" id="progress-phase">Preparing…</div><p class="tiny space-top">You can explore the app. Progress stays with you.</p></div>
 <div class="space-top">${link('Back to my C-arms','home','secondary')}</div>${!recover?button('Explore an interrupted update','demo-failure','text-button'):''}`;
}
function complete(){
 return `<div class="complete"><div class="complete-mark">${icon('check')}</div><h1>One happy Cio.<br>Thanks to you.</h1><p>The update is complete. Fresh logs are back with the team.</p><div class="complete-art">${img('bliss','Happy, connected Cio')}</div><div class="thank-note">“All synced. Thanks, team.<br>I feel brand new.”</div>
 ${button('Pet Cio '+icon('heart'),'pet-complete','primary teal')}<div class="stack space-top">${link('View the receipt '+icon('file'),'receipt','secondary')}${link('Back to my C-arms','home','text-button')}</div><p class="small-footer">Update complete · ready for team review.<br>Simulated result, no clinical release.</p></div>`;
}
function windowView(){
 return `${title('MOOD SETS PRIORITY. DATA FINDS TIME.','Care has<br>right of way.')}<div class="window-hero"><div class="eyebrow">CIO’S GOLDEN WINDOW</div><h2>${W.from}–${W.to}</h2><p>${W.date} · published by medical physics</p><div class="mini-schedule"><div class="free">Free</div><div class="gold">Cio’s update</div><div class="margin">Buffer</div><div class="case">Next case</div></div><div class="mini-label" style="margin:10px 0 0"><span>${W.from}</span><span>${W.to} → ${W.guard}</span></div></div>
 <div class="check-facts">${[['No case touched','Cio is free for the update and recovery margin.'],[`${W.backup} stays available`,'A backup C-arm is free throughout.'],['Someone can confirm','An on-call role covers the start of this window.'],['Emergencies have priority','An active emergency can pause the request.']].map(([a,b])=>`<div>${icon('check')}<div><b>${a}</b><p>${b}</p></div></div>`).join('')}</div>
 <div class="space-top">${button('See Cio’s request '+icon('arrow'),'continue','primary teal')}</div>
 <p class="small-footer">Calculated with the actual planner from FINAL/v1.<br>Synthetic hospital data. An illustrative proposal.</p>`;
}
function fleet(){
 const moods={'C-01':'lonely','C-02':'hungry','C-03':deviceMood(state),'C-04':'happy','C-05':'happy','C-08':'hungry'};
 return `${title('YOUR TEAM’S C-ARMS','Everyone needs<br>a little attention.','Every mood is a data point.')}<div class="fleet-grid">${DEVICES.map(d=>{const m=MOODS[moods[d.id]];return `<a href="#/device/${d.id}" class="device-tile" style="--mood-bg:${m.bg};--mood-color:${m.color}"><div class="tile-art">${img(m.image)}</div><h3>${d.name}</h3><small>${d.id} · ${d.id==='C-03'?'Corridor B':esc(d.home)}</small><p>${m.name}${d.id===W.backupId?' · Cio’s backup':''}</p></a>`;}).join('')}</div>`;
}
function device(id){
 if(id==='C-03')return home();
 const d=DEVICES.find(x=>x.id===id);if(!d)return fleet();
 const mood=d.id==='C-01'?'lonely':d.update?'hungry':'happy',m=MOODS[mood];
 return `${title(`${d.id} · ${esc(d.home)}`,d.name,'Part of your team.')}<div class="pet-panel" style="--mood-bg:${m.bg};--mood-color:${m.color}"><span class="mood-tag"><i></i>${m.name}</span><button class="pet-tap" data-action="pet" data-pet-name="${d.name}" data-pet-mood="${mood}" aria-label="Pet ${d.name}">${img(m.image,d.name)}</button></div><p class="pet-quote space-top">“${mood==='happy'?'All synced. I’ve got the team’s back.':mood==='lonely'?'It’s been a while. Did you forget about me?':'I have needs. And firmware.'}”</p>
 <div class="card">${facts([['Software',d.sw],['Home',esc(d.home)],['Care',d.id===W.backupId?'Reserved as Cio’s backup':d.update?'Patch waiting for a window':'Current software']])}</div>
 <div class="space-top">${button(mood==='happy'?`Pet ${d.name} ${icon('heart')}`:'See what this mood means','device-action','primary teal',`data-mood="${mood}"`)}</div>${link('Return to Cio’s story','home','text-button')}`;
}
function timeline(events=state.events){
 return `<ol class="timeline">${events.map(e=>`<li><span class="event-icon">${icon(e.kind)}</span><div class="event-content"><small>${esc(e.time)} · DEMO</small><h3>${esc(e.title)}</h3><p>${esc(e.detail)}</p></div></li>`).join('')}</ol>`;
}
function activity(){return `${title('THE LITTLE THINGS ADD UP.','Care, recorded.','Follow the story from the window to the thank-you.')}${timeline([...state.events].reverse())}${state.phase==='complete'?link('Open service receipt','receipt','secondary'):''}`;}
function receipt(){
 if(state.phase!=='complete')return `${title('CIO’S SERVICE RECEIPT','Still writing<br>this story.','The receipt appears after the demo update finishes.')}${button('Continue the story','continue','primary teal')}`;
 return `${title('THE LOOP, CLOSED.','A small act.<br>A complete record.')}<div class="card"><div class="receipt-head">${icon('file')}<h2>Update complete</h2><p>DEMO RECEIPT · C-03 · 2026.11</p></div>${facts([['Device','Cio · C-03'],['Package',W.package],['Started by','Lena · '+W.from],['Completed',W.to],['Software',W.software],['Recovery image','Retained'],['Next step','Team review']])}</div>
 ${timeline(state.events.filter(e=>['published','approved','complete'].includes(e.id)))}
 ${button('Download demo receipt '+icon('file'),'download-receipt','primary teal')}${link('Back to Cio','home','text-button')}<p class="small-footer">A local demonstration record. Not a clinical certificate.</p>`;
}
function moods(key='lonely'){
 if(!MOODS[key])key='lonely';const m=MOODS[key];
 return `<div class="page-title"><div class="eyebrow">MEET THE PERSONALITIES</div><h1>Every mood is<br>a data point.</h1></div><div class="mood-tabs" aria-label="Explore moods">${Object.entries(MOODS).map(([k,v])=>`<button style="--mood-bg:${v.bg};--mood-color:${v.color}" class="${k===key?'on':''}" data-action="mood" data-mood="${k}" ${k===key?'aria-current="true"':''}>${v.name}</button>`).join('')}</div>
 <div class="mini-label"><span>MOOD PREVIEW</span><span>CIO · C-03</span></div>${petCard(key,'Cio',true)}
 <p class="mood-explainer">${m.meaning}</p>${callout('A personality, backed by status.','Previewing a mood doesn’t change Cio’s actual demo request.','heart')}
 <div class="space-top">${link('Try Cio’s story '+icon('arrow'),'home','primary teal')}</div>`;
}
function carecircle(){
 return `${title('NO ONE HAS TO CARRY IT ALONE.','Cio’s people.','A small circle with the right skills. A request can always be passed on.')}<div class="settings-list">${PEOPLE.map(p=>`<div class="setting"><span class="avatar" style="background:${p.color}">${p.initial}</span><div><b>${p.name}${p.name==='Lena'?' · you':''}</b><small>${p.role}</small></div><span class="tiny">${p.name==='Lena'?({available:'Available',procedure:'In a procedure',off:'Off shift'})[state.availability]:p.status}</span></div>`).join('')}</div>
 <div class="space-top">${callout('Not today is a complete answer.','A declined request moves on. There’s no guilt, penalty, or score.','heart')}</div><p class="small-footer">Example people and availability from the pitch story.</p>`;
}
function profile(){
 return `<div class="profile-card"><span class="avatar">L</span><div><h1>Hi, Lena.</h1><p>X-ray nurse · Cio’s care circle</p></div></div><div class="eyebrow" style="margin-bottom:10px">YOUR AVAILABILITY IN THIS DEMO</div><div class="availability">${[['available','Available'],['procedure','In a procedure'],['off','Off shift']].map(([v,l])=>button(l,'availability',state.availability===v?'on':'',`data-value="${v}" aria-pressed="${state.availability===v}"`)).join('')}</div>
 <div class="section-heading"><h2>Make yourself at home.</h2></div><div class="settings-list">
 ${setting('sound','Little sounds','Soft taps and happy moments. Off by default.','sound')}${setting('haptics','A little tap back','Gentle vibration where your phone supports it.','phone')}${setting('motion','Character animations','Your system’s reduced-motion setting also applies.','motion')}</div>
 <div class="section-heading"><h2>A little more to explore.</h2></div><div class="settings-list">
 ${[['moods','Every mood','Meet all five pitch personalities, plus recovery.','heart'],['carecircle','Cio’s care circle','The people behind a small good deed.','people'],['share','Share the experience','A QR code for your team.','share']].map(([to,h,p,i])=>`<a class="setting" href="#/${to}" style="text-decoration:none">${icon(i)}<div><b>${h}</b><small>${p}</small></div>${icon('arrow')}</a>`).join('')}
 ${button(`${icon('refresh')}<div><b>Start the story again</b><small>Reset this browser’s demo progress.</small></div>${icon('arrow')}`,'reset','setting')}</div>
 <div class="section-heading"><h2>Made for the invisible underdogs.</h2></div><p class="tiny">A touchable version of the phone app in Aloha Robotics’ <a href="../FINAL/v1/" target="_blank" rel="noopener">latest pitch</a>. Original characters. The team’s real browser planner. A simulated hospital.</p>
 <p class="tiny space-top">Progress stays in this browser. No login, patient data, real notifications, robot dispatch, or medical-device connection.</p>
 ${button('Add to your home screen','install-help','text-button')}`;
}
function paused(){
 return `${title('CARE HAS RIGHT OF WAY.','It can wait.',esc(state.reason))}<div class="service-art">${img('lonely')}</div>
 ${callout('No update was started.','The request is paused. The window and surroundings need to be checked again.','pause')}
 <div class="stack space-top">${button('Replay the available-window scenario','resume','primary teal')}${link('Back to Cio','home','secondary')}</div>
 <p class="small-footer">In a connected product, the responsible team would review the changed conditions. This button replays the demo.</p>`;
}
function service(){
 if(state.phase==='recovered')return `${title('A SECOND CHANCE.','Back to my<br>last good self.','The retained image has been restored in this demonstration.')}<div class="service-art">${img('lonely')}</div>${callout('Ready for team review.','The patch is still outstanding. The team needs a new window and fresh checks.','tool')}<div class="space-top">${button('Try the good-day story again','reset','primary teal')}</div>${link('View the activity trail','activity','text-button')}`;
 if(state.phase!=='failed')return `${title('WHEN THINGS NEED EXTRA CARE.','Service is<br>part of the story.','If the demo update is interrupted, the service flow appears here.')}<div class="service-art">${img('rollback')}</div>${button('Continue Cio’s story','continue','primary teal')}`;
 return `${title('C-03 CIO · DEMO INTERRUPTION','Well. That<br>wasn’t the plan.','A simulated power loss interrupted the update.')}<div class="service-art">${img('failure')}</div>
 ${callout('Cio stays out of service.','The device state and activity trail travel with the service request.','warning',true)}
 <div class="card space-top">${facts([['Device','C-03 · Cio'],['Update','Interrupted'],['Recovery image','Retained'],['Service request',state.serviceRequested?'SR-003 · demo only':'Not prepared']])}</div>
 <div class="space-top">${state.serviceRequested?button('Watch the recovery demo '+icon('refresh'),'recover','primary teal'):button('Prepare demo service request '+icon('tool'),'service','primary')}</div>
 ${link('See the activity trail','activity','text-button')}<p class="small-footer">No request is sent to an external service team.</p>`;
}
function share(){
 return `${title('A LITTLE CARE IS CONTAGIOUS.','Meet Cio.<br>Pass it on.','Scan this code on another phone. No installation needed.')}<img class="qr-image" src="share/qr.png" alt="QR code opening this C-ARMAGOTCHI app"><p class="code-url">${esc(URL_APP)}</p>
 <div class="stack">${button('Share the app '+icon('share'),'share','primary teal')}${button('Copy link '+icon('link'),'copy-link','secondary')}<a class="text-button" href="share/qr-card.png" download="carmagotchi-qr-card.png">Download the QR card ${icon('file')}</a></div>`;
}
function guardRoute(){
 const top=route.split('/')[0];
 if(top==='prepare'&&state.phase!=='preparing')return phaseRoute();
 if(top==='circle'&&state.phase!=='circle')return phaseRoute();
 if(top==='mission'&&!['mission','review'].includes(state.phase))return phaseRoute();
 if(top==='review'&&state.phase!=='review')return phaseRoute();
 if(top==='review'){
  const step=Number(route.split('/')[1])||1;
  if(step<1||step>3||!state.checks.time)return 'review/1';
  if(step===3&&!['area','drapes','brakes','power'].every(k=>state.checks[k]===true))return 'review/2';
 }
 if(top==='progress'&&!['updating','recovering'].includes(state.phase))return phaseRoute();
 if(top==='complete'&&state.phase!=='complete')return phaseRoute();
 if(top==='paused'&&state.phase!=='paused')return phaseRoute();
 return route;
}
function render(){
 const guarded=guardRoute();if(guarded!==route){route=guarded;history.replaceState(null,'',`#/${route}`);}
 header();
 const [top,arg]=route.split('/');
 const views={home,fleet,request,requests,prepare,circle,mission,review:()=>review(arg),progress:updating,complete,receipt,moods:()=>moods(arg),window:windowView,activity,profile,carecircle,paused,service,share,device:()=>device(arg)};
 const renderView=views[top]||home;
 $('#main').innerHTML=`<div class="screen">${renderView()}</div>`;
 document.title=`${({home:'Cio',review:'Your decision',mission:'KettyBot',complete:'Thank you',progress:'Looking after Cio'})[top]||'Your care circle'} · C-ARMAGOTCHI`;
 updateDynamic();
 if(lastScreen!==route){lastScreen=route;window.scrollTo({top:0,behavior:'instant'});}
}
function updateDynamic(){
 const p=progress(state);
 if(route==='circle'){
  document.querySelectorAll('[data-person]').forEach((el,i)=>el.classList.toggle('done',state.circleReady||p>(i+1)/7));
 }
 if(route==='mission'){
  const ready=state.phase==='review',value=ready?1:p,count=ready?14:Math.min(14,Math.floor(value*15));
  const k=count<4?0:count<7?1:count<10?2:3;
  const captions=['Patch on board. Cable packed. Enough charge.','Last known spot: empty. Try another parking spot.','Found Cio. Check the identity and connection.','Clear surroundings. Stable power. A human still decides.'];
  $('#mission-title').textContent=ready?'Ready for a human.':['Do I have everything?','Where is Cio?','Right machine. Connected.','Safe right now?'][k];
  $('#mission-caption').textContent=ready?'The helper stops here. You decide what happens next.':captions[k];
  $('#checks-label').textContent=['BEFORE LEAVING','FINDING CIO','MAKING THE CONNECTION','BEFORE ASKING'][k];
  const groups=[[0,4],[4,7],[7,10],[10,14]];
  document.querySelectorAll('[data-check-index]').forEach((el,i)=>{el.hidden=i<groups[k][0]||i>=groups[k][1];el.style.display=el.hidden?'none':'flex';el.classList.toggle('done',i<count);el.classList.toggle('current',i===count);el.querySelector('.check-indicator').textContent=i<count?'✓':'';});
  [...$('#mission-steps').children].forEach((el,i)=>{el.classList.toggle('done',ready||i<k);el.classList.toggle('active',!ready&&i===k);});
  $('#mission-summary').textContent=ready?'14 checks passed in this simulation. No update started.':`${count} of 14 scenario checks complete.`;
  const path=$('#mission-route'),length=path.getTotalLength(),distance=Math.max(0,Math.min(1,(value-.15)/.51))*length,point=path.getPointAtLength(distance);
  $('#mission-bot').setAttribute('transform',`translate(${point.x},${point.y})`);
  $('#mission-line').style.strokeDasharray=length;$('#mission-line').style.strokeDashoffset=length-distance;
 }
 if(route==='progress'){
  const pct=Math.floor(p*100);$('#percent').textContent=pct;$('.progress-fill').style.width=`${pct}%`;$('.progress-track').setAttribute('aria-valuenow',pct);
  $('#progress-phase').textContent=(state.phase==='recovering'?['Checking the retained image','Restoring the previous version','Checking the recovered state','Preparing the service report']:['Checking the signed package','Preparing the update','Installing · keeping power stable','Restarting and checking','Returning status and logs'])[Math.min(state.phase==='recovering'?3:4,Math.floor(p*(state.phase==='recovering'?4:5)))];
 }
}
function downloadReceipt(){
 const text=`C-ARMAGOTCHI — DEMO SERVICE RECEIPT\n\nDevice: C-03 Cio\nPackage: ${W.package}\nSoftware: ${W.software}\nStarted by: Lena at ${W.from}\nCompleted: ${W.to}\nBackup: ${W.backup}\nRecovery margin until: ${W.guard}\nResult: update complete; ready for team review.\n\n${state.events.map(e=>`${e.time} — ${e.title}\n${e.detail}`).join('\n\n')}\n\nLocal simulated record. No medical-device action or clinical certification.\n`;
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Cio-demo-service-receipt.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your demo receipt is ready.');
}
async function copyLink(){
 try{await navigator.clipboard.writeText(URL_APP);toast('Link copied. A little care travels.');}
 catch{confirmModal('Here’s Cio’s link',esc(URL_APP),'Close',()=>{});}
}
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
 const a=el.dataset.action;
 if(!['pet','pet-home','pet-complete','noop'].includes(a))sound('tap');
 switch(a){
  case 'skip':e.preventDefault();$('#main').focus({preventScroll:true});break;
  case 'back':{const [top,step]=route.split('/');if(top==='review'&&Number(step)>1){go('review/'+(Number(step)-1));break;}const parent={review:'mission',prepare:'requests',request:'home',device:'fleet',receipt:'activity',moods:'home',window:'home',carecircle:'home',share:'profile'}[top]||'home';go(parent==='mission'&&state.path==='human'?'requests':parent);break;}
  case 'continue':go(phaseRoute());break;
  case 'pet':pet(el);break;
  case 'pet-home':pet($('.pet-tap'));break;
  case 'pet-complete':pet($('.complete-art'));break;
  case 'show-job':$('#job').scrollIntoView({behavior:state.motion?'smooth':'instant',block:'center'});break;
  case 'accept':send({type:'accept'},false);go('prepare');haptic();break;
  case 'decline':send({type:'decline'},false);go('circle');sound('notify');break;
  case 'dispatch':send({type:'dispatch'},false);go('mission');haptic();break;
  case 'prepared':send({type:'prepared'},false);go(phaseRoute());break;
  case 'confirm-time':send({type:'check',key:'time',value:true},false);go('review/2');break;
  case 'confirm-area':if(['area','drapes','brakes','power'].every(k=>state.checks[k]))go('review/3');break;
  case 'start-update':send({type:'start',confirmed:true},false);if(state.phase==='updating'){sound('success');haptic();go('progress');}else toast('Please complete the checks and confirm your availability.');break;
  case 'prepare-pause':confirmModal('Need a hand?','We’ll pause this request. You can replay it and ask the care circle instead.','Pause request',()=>{send({type:'pause'},false);go('paused');});break;
  case 'pass-on':confirmModal('Pass it to medical physics?','Being unsure is a good reason to ask. This pauses the demo request; no update will start.','Pass it on',()=>{send({type:'pause',reason:'unsure'},false);go('paused');});break;
  case 'pause-options':confirmModal('Care has right of way.','Simulate an emergency or changed conditions. The request will pause and the checks will need to be done again.','Pause this request',()=>{send({type:'pause',reason:'emergency'},false);go('paused');});break;
  case 'resume':send({type:'resume'},false);go('request');break;
  case 'demo-failure':confirmModal('Try the unexpected?','This simulates power loss during the update and opens Cio’s service and recovery story.','Simulate interruption',()=>{send({type:'fail'},false);go('service');});break;
  case 'service':send({type:'service'});toast('Demo request SR-003 prepared. Nothing sent externally.');break;
  case 'recover':send({type:'recover'},false);go('progress');break;
  case 'setting':send({type:'setting',key:el.dataset.key,value:!state[el.dataset.key]});if(el.dataset.key==='sound')sound('happy');break;
  case 'availability':send({type:'availability',value:el.dataset.value});break;
  case 'mood':go('moods/'+el.dataset.mood);break;
  case 'device-action':if(el.dataset.mood==='happy')pet($('.pet-tap'));else go('moods/'+el.dataset.mood);break;
  case 'download-receipt':if(state.phase==='complete')downloadReceipt();break;
  case 'reset':confirmModal('Another little adventure?','This resets only this browser’s demo progress. Your sound and motion preferences will stay.','Start again',()=>{const {sound,motion,haptics}=state;state={...initialState(),sound,motion,haptics};persist();go('home');toast('Cio is waiting for you.');},true);break;
  case 'install-help':confirmModal('Keep Cio close.','On iPhone: Share → Add to Home Screen. On Android: open the browser menu → Install app or Add to Home screen. You can also keep using this link.','Got it',()=>{});break;
  case 'copy-link':await copyLink();break;
  case 'share':try{if(navigator.share)await navigator.share({title:'Meet C-ARMAGOTCHI',text:'A little care for the machines that care for us.',url:URL_APP});else await copyLink();}catch(error){if(error.name!=='AbortError')await copyLink();}break;
  case 'modal-confirm':{const fn=modalCallback;modalCallback=null;$('#dialog').close();fn?.();break;}
  case 'modal-close':$('#dialog').close();modalCallback=null;break;
 }
});
document.addEventListener('change',e=>{
 const el=e.target.closest('[data-check]');if(!el)return;
 send({type:el.dataset.group,key:el.dataset.check,value:el.checked},false);
 if(route==='prepare')document.querySelector('[data-action="prepared"]').disabled=!Object.values(state.prep).every(Boolean);
 if(route==='review/2')document.querySelector('[data-action="confirm-area"]').disabled=!['area','drapes','brakes','power'].every(k=>state.checks[k]);
 haptic();
});
$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#dialog').close();}});
addEventListener('hashchange',()=>{route=location.hash.slice(2)||'home';render();$('#main').focus({preventScroll:true});});
addEventListener('storage',e=>{if(e.key===STORE){state=restoreState(e.newValue);render();}});
function tick(){
 if(!running())return;
 const before=state.phase,ready=state.circleReady,next=reduce(state,{type:'tick'});
 state=next;
 if(before!==state.phase||ready!==state.circleReady){persist();sound(state.phase==='complete'?'success':'notify');render();}
 else updateDynamic();
}
setInterval(tick,200);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
// Read-only inspection surface for acceptance checks. Mutations require the app's UI.
window.Carmagotchi=Object.freeze({state:()=>structuredClone(state),window:W,route:()=>route});
