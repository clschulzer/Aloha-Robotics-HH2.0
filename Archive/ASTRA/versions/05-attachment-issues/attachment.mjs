import './presentation.mjs';
const O=window.OPUS,D=window.DAY,P=window.IAPlanner,C=window.PITCH,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,brand='<div class="smallbrand">ALOHA</div>';
const asset=n=>`../../assets/characters/${n}.webp`,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let scene='',step=0,age=0,clock=0,animations=[],moodIndex=-1,stamped=false,crt=false;
const sound=(name,...args)=>{if(window.ASTRA.getState().sfx)O.audio.sfx[name]?.(...args);};
function animate(el,frames,options){if(reduced)return;const a=el.animate(frames,options);animations.push(a);return a;}
function cancelAnimations(){animations.forEach(a=>a.cancel());animations=[];}

// A single portrait and a single thought. The joke never obscures the actual state.
const confession=$('.confessional');
confession.innerHTML=brand+`<div class="conf-label">C-ARMAGOTCHI</div><div class="conf-orbit"></div><div class="conf-intro-frame"></div><div class="conf-art">${C.moods.map(m=>`<img src="${asset(m[0])}" alt="${esc(m[2])}">`).join('')}</div><h1 class="conf-quote"></h1><div class="conf-state"></div><div class="conf-stamp">THE AUDIT LOG DISAGREES.</div>`;
const quotes=[
 'Attachment<br><em>issues.</em>',
 'I can see<br>your bones.<br><em>I can’t see<br>your Wi-Fi.</em>',
 'Feed me<br><em>the patch.</em>',
 'Emotionally<br>unavailable.<br><em>Technically<br>updating.</em>',
 'New firmware.<br><em>Who dis?</em>',
 'Get me your<br><em>developer.</em>',
 'This never<br><em>happened.</em>'
];
const fonts=[149,94,145,99,129,127,145];
function face(n,spin=false,instant=false){
 if(n===moodIndex&&!instant)return;moodIndex=n;
 $$('.conf-art img').forEach((e,i)=>e.classList.toggle('on',i===n));
 if(spin){sound('tick',.016,440+n*135);return;}
 if(!instant){
  const ways=[
   [{transform:'translateY(65px) rotate(-8deg) scale(.92)',opacity:0},{transform:'translateY(-9px) rotate(2deg) scale(1.01)',opacity:1,offset:.66},{transform:'none',opacity:1}],
   [{transform:'translateX(160px) rotate(22deg) scale(.8)',opacity:0},{transform:'translateX(-24px) rotate(-7deg) scale(1.04)',opacity:1,offset:.6},{transform:'none',opacity:1}],
   [{transform:'translateY(100px) scale(.9)',opacity:0},{transform:'translateY(-12px) scale(1.03)',opacity:1,offset:.7},{transform:'none',opacity:1}]
  ];
  animate($$('.conf-art img')[n],ways[n%3],{duration:780,easing:'cubic-bezier(.18,1,.3,1)'});
  sound(n===1?'boing':n===3?'sparkle':n===4?'thump':'pop',n===3?.08:n===1?.12:n===4?.085:720,.06);
 }
}
function setConfessional(n,instant){
 confession.dataset.step=n;confession.classList.remove('crt');$('.conf-stamp').classList.remove('on');stamped=false;
 const textIndex=Math.min(n,6);
 $('.conf-quote').innerHTML=quotes[textIndex];$('.conf-quote').style.fontSize=`${fonts[textIndex]}px`;
 $('.conf-state').textContent=n===0?'Meet Cio.':C.moods[Math.min(n-1,5)][2];
 face(n===0?0:Math.min(5,n-1),false,instant);
 if(!instant)animate($('.conf-quote'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});
 if(n===6&&instant){$('.conf-stamp').classList.add('on');stamped=true;}
}

// The theatre layout and rule core come from the team's earlier prototype.
const xf=t=>(t-480)/960*1518,board=$('.match-board');
const gx=282,gy=356,rh=92;
board.innerHTML=brand+`<h1 class="match-title"></h1><p class="match-sub">WED 18 NOV · OPERATING THEATRES · ILLUSTRATIVE DAY</p><div class="match-meta">18:40</div><div class="match-grid">${Array.from({length:9},(_,i)=>`<span class="match-hour" style="left:${i*189.75}px">${String(8+i*2).padStart(2,'0')}:00</span><i class="match-guide" style="left:${i*189.75}px"></i>`).join('')}${D.devices.map((d,i)=>`<div class="match-row" style="top:${i*rh}px"><div class="match-row-name"><b>${i===5?'Emergency':`OR ${i+1}`}</b><small>${esc(d.name)}</small></div>${d.busy[0].map(c=>`<div class="match-case" style="left:${xf(c.from)}px;width:${xf(c.to)-xf(c.from)-4}px"><b>${esc(c.fach)}</b><small>${D.format(c.from)}–${D.format(c.to)}</small></div>`).join('')}${d.id===D.winner.device.id?`<div class="match-case was-cancelled" style="left:${xf(D.cancelled.from)}px;width:${xf(D.cancelled.to)-xf(D.cancelled.from)}px"><b>Trauma list</b><small>19:00–22:20</small></div><div class="match-gold" style="left:${xf(D.winner.window.from)}px;width:${xf(D.winner.window.to)-xf(D.winner.window.from)}px"><b>${D.format(D.winner.window.from)}–${D.format(D.winner.window.to)}</b></div>`:''}${i===5?`<div class="match-cover" style="left:${xf(1140)}px;right:0">EMERGENCY COVER</div>`:''}${d.id===D.backup.id?`<div class="match-backup" style="left:${xf(D.winner.window.from)}px;width:${xf(D.winner.window.to+D.rules.PUFFER)-xf(D.winner.window.from)}px">BACKUP AVAILABLE</div>`:''}</div>`).join('')}<div class="match-now" style="left:${xf(D.now)}px"></div></div><canvas class="match-scouts"></canvas><p class="match-line"></p>`;
const titles=['A calendar full of bad dates.','Opportunity knocks.','Good gap? Prove it.','Care gets first dibs.','It’s a match.'];
const captions=['Everyone is busy. The machine is still waiting.','OR 3 · evening case cancelled','Read the plan. Check the rules. Keep searching.','Emergency cover. Backup. Recovery margin.',`${D.winner.device.name} · ${D.format(D.winner.window.from)}–${D.format(D.winner.window.to)} · ready for review`];
const layer=O.canvas($('.match-scouts')),g=layer.ctx,random=O.rng(5105);
const scouts=Array.from({length:56},(_,i)=>({x:1870,y:270+i*3,vx:0,vy:0,alpha:0,trail:[],lane:0,t:0,tx:0,ty:0,wait:0}));
const winnerRect={x:gx+xf(D.winner.window.from),y:gy+D.devices.findIndex(d=>d.id===D.winner.device.id)*rh+5,w:xf(D.winner.window.to)-xf(D.winner.window.from),h:66};
let checks=0,rings=[],found=false;
function nextTarget(a){
 a.lane=Math.floor(random()*D.devices.length);a.t=1140+Math.floor(random()*16)*10;
 a.tx=gx+xf(a.t+60)+(random()-.5)*16;a.ty=gy+a.lane*rh+38+(random()-.5)*18;a.wait=.22+random()*.45;
}
function setBoard(n,instant){
 board.dataset.step=n;$('.match-title').textContent=titles[n];$('.match-line').textContent=captions[n];$('.match-line').classList.toggle('gold',n===4);
 $('.match-meta').textContent=n===0?'18:40':n===1?'CASE CANCELLED':n===4?'PROPOSAL FOUND':'SCOUTS ACTIVE';
 found=n===4;rings=[];
 if(n===2){scouts.forEach((a,i)=>{a.x=1870;a.y=270+i*3;a.vx=a.vy=0;a.alpha=0;a.trail=[];nextTarget(a);});sound('whoosh',.65,.06,true);}
 if(n===3)scouts.forEach(nextTarget);
 if(found){
  scouts.forEach((a,i)=>{const angle=i/scouts.length*Math.PI*2;a.tx=winnerRect.x+winnerRect.w/2+Math.cos(angle)*(winnerRect.w/2+15);a.ty=winnerRect.y+33+Math.sin(angle)*48;if(instant)a.alpha=0;});
  sound('success',.07);if(!instant)animate($('.match-title'),[{transform:'scale(.9) rotate(-2deg)',opacity:0},{transform:'scale(1.025) rotate(1deg)',opacity:1,offset:.62},{transform:'none',opacity:1}],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'});
 }
 if(n===1){sound('pop',800,.08);if(!instant)animate($('.match-meta'),[{transform:'translateY(20px)',opacity:0},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});}
}
function drawScouts(dt){
 layer.clear();if(step<2||found&&age>2.2)return;
 for(const a of scouts){
  const w=found?9:6.5;a.vx+=(w*w*(a.tx-a.x)-1.85*w*a.vx)*dt;a.vy+=(w*w*(a.ty-a.y)-1.85*w*a.vy)*dt;
  a.x+=a.vx*dt;a.y+=a.vy*dt;a.wait-=dt;
  const targetAlpha=found?Math.max(0,1-age/1.05):.85;a.alpha+=(targetAlpha-a.alpha)*Math.min(1,dt*7);
  if(!found&&a.wait<0&&Math.hypot(a.tx-a.x,a.ty-a.y)<18){
   const d=D.devices[a.lane],r=P.findWindow(d,0,{...D.ctx,now:a.t-P.RULES.VORLAUF});checks++;
   rings.push({x:a.x,y:a.y,age:0,ok:r.ok&&r.from===a.t});if(rings.length>24)rings.shift();nextTarget(a);
  }
  if(reduced||a.alpha<.01)continue;
  a.trail.push([a.x,a.y]);if(a.trail.length>7)a.trail.shift();
  const rgb=found?'245,210,148':'250,184,139';
  g.beginPath();a.trail.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=`rgba(${rgb},${a.alpha*.17})`;g.lineWidth=1;g.stroke();
  g.save();g.translate(a.x,a.y);g.rotate(Math.atan2(a.vy,a.vx)+Math.PI/2);const scale=found?Math.max(.15,1-age*.6):1;g.scale(scale,scale);g.globalAlpha=a.alpha;g.fillStyle=`rgba(${rgb},.2)`;g.strokeStyle=`rgb(${rgb})`;g.lineWidth=1.2;g.beginPath();g.moveTo(0,-9);g.lineTo(6,6);g.lineTo(0,3);g.lineTo(-6,6);g.closePath();g.fill();g.stroke();g.restore();
 }
 for(const r of rings){r.age+=dt;if(r.age>.5)continue;g.strokeStyle=r.ok?`rgba(151,211,183,${.4-r.age*.8})`:`rgba(228,136,147,${.4-r.age*.8})`;g.lineWidth=1;g.beginPath();g.arc(r.x,r.y,4+r.age*24,0,Math.PI*2);g.stroke();}
 rings=rings.filter(r=>r.age<.5);
}

// A compact workflow. The same rule function powers the visible start gate.
const crew=$('.crew-scene'),positions=[320,745,1170,1590];
const routes=['M425 602 C530 602 553 602 612 602','M889 602 C958 602 1020 602 1073 602','M1268 602 C1360 602 1415 602 1469 602','M1712 602 C1805 602 1834 695 1834 820 L1834 885 Q1834 964 1755 964 L178 964 Q105 964 105 891 L105 681 Q105 602 215 602'];
crew.innerHTML=brand+`<h1 class="crew-title"></h1><p class="crew-sub"></p><svg class="crew-paths" viewBox="0 0 1920 1080">${routes.map((d,i)=>`<path class="crew-track" d="${d}"/><path class="crew-route" data-route="${i}" d="${d}" pathLength="1"/>`).join('')}</svg>
 <div class="crew-node" data-node="0" style="--x:${positions[0]}px"><div class="crew-object"><div class="crew-brain"><svg viewBox="0 0 64 64"><rect x="8" y="10" width="48" height="42" rx="8"/><path d="M8 23h48M21 5v12M43 5v12m-25 24 9 7 18-16"/></svg></div></div><h2>Find.</h2><p class="crew-caption">A window worth asking for</p></div>
 <div class="crew-node" data-node="1" style="--x:${positions[1]}px"><div class="crew-object"><img class="crew-bot" src="${asset('ketty')}" alt="KettyBot physical helper concept"></div><h2>Connect.</h2><p class="crew-caption">Power + approved data</p></div>
 <div class="crew-node" data-node="2" style="--x:${positions[2]}px"><div class="crew-object"><div class="crew-phone"><div class="crew-person">L</div><b>Cio needs care.</b><p>Right time?<br>Clear surroundings?</p><div class="crew-start">WAITING</div></div></div><h2>Authorize.</h2><p class="crew-caption">A human starts every update</p></div>
 <div class="crew-node" data-node="3" style="--x:${positions[3]}px"><div class="crew-object"><div class="crew-receipt"><small>SERVICE RECORD</small><b>Drama.<br>Documented.</b><span><em>✓</em> Result returned</span><span><em>↗</em> Team review</span></div></div><h2>Report.</h2><p class="crew-caption">Accountable to the team</p></div><div class="crew-packet"></div><div class="crew-cursor"><svg viewBox="0 0 48 54"><path d="M11 2v36l10-10 8 20 8-4-8-18h15Z"/></svg></div><p class="crew-bottom"></p>`;
$('.crew-brain').style.setProperty('--window-time',`"${D.format(D.winner.window.from)}"`);
const flow=$$('.crew-route').map(p=>({p,length:p.getTotalLength(),last:-1})),packet=$('.crew-packet'),finger=$('.crew-cursor');
const crewTitles=['Meet the calendar goblins.','Senior plugging-in engineer.','Our most sophisticated component.','A human presses start.','We brought receipts.'];
const crewSubs=['Medical physics reviews the proposal.','KettyBot · the physical connection concept','A person who knows what is happening around the machine.','The rules pass. The person decides.','The loop closes with status, logs and an owner.'];
const crewFeet=['Actual planner. Unnecessarily dramatic cast.','The machine gets a connection. The team gets a hand.','Every proposed start still has to pass the gate.','Only after readiness checks and explicit approval.','Good software has follow-through.'];
let gate=P.canStart({}),simulatedStart=false,pressed=false,crewInstant=false,startEvents=[];
function setCrew(n,instant){
 crewInstant=instant;pressed=false;if(n!==4)simulatedStart=false;
 $('.crew-title').textContent=crewTitles[n];$('.crew-sub').textContent=crewSubs[n];$('.crew-bottom').textContent=crewFeet[n];
 if(n===2)$('.crew-title').style.fontSize='89px';else $('.crew-title').style.fontSize='100px';
 gate=P.canStart({art:'patch',freigabe:n>=3,umgebungFrei:n>=3,imEinsatz:false,alarm:false,paketGeprueft:true,paketZurueckgerufen:false});
 const phone=$('.crew-phone');phone.classList.toggle('approved',n>=3);$('.crew-start').textContent=n===4?'STARTED BY LENA':n>=3?'START UPDATE':'WAITING';
 finger.classList.remove('on','press');flow.forEach(r=>r.p.classList.remove('on'));
 $$('.crew-node').forEach((e,i)=>e.classList.toggle('on',i===0));
 if(instant){updateCrew(10);if(n>=3){pressed=true;simulatedStart=gate.ok;$('.crew-start').textContent='STARTED BY LENA';}}
 if(!instant)animate($('.crew-title'),[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});
 if(n===1&&!instant)animate($('.crew-bot'),[{transform:'translateX(-130px) rotate(-9deg)',opacity:0},{transform:'translateX(13px) rotate(3deg)',opacity:1,offset:.72},{transform:'none',opacity:1}],{duration:1300,easing:'cubic-bezier(.16,1,.3,1)'});
 sound(n===1?'boing':n===4?'pop':'grow',n===1?.07:n===4?740:.025,n===4?.08:.8);
}
function updateCrew(t){
 const phase=step===4?3:Math.min(step,2);
 $$('.crew-node').forEach((n,i)=>n.classList.toggle('on',i===0||i<phase||i===phase&&(t>1.12||step===3)));
 for(let i=0;i<flow.length;i++){
  const r=flow[i];let progress=i<phase-1?1:i===phase-1?Math.min(1,t/1.18):0;
  if(step===4&&i===3)progress=Math.min(1,Math.max(0,(t-1.3)/2.4));
  if(step===3&&i<2)progress=1;
  if(crewInstant)progress=i<phase||step===4?1:0;
  if(progress!==r.last){r.last=progress;r.p.style.strokeDashoffset=String(1-progress);}
 }
 const active=step===4&&t>1.3?flow[3]:phase>0?flow[phase-1]:null,progress=step===4&&t>1.3?(t-1.3)/2.4:t/1.18;
 if(active&&progress>0&&progress<1&&!reduced&&!crewInstant&&step!==3){const p=active.p.getPointAtLength(progress*active.length);packet.style.cssText=`left:${p.x-5}px;top:${p.y-5}px;opacity:1`;}else packet.style.opacity='0';
 if(step===3&&!crewInstant){
  if(t>.4&&!finger.classList.contains('on')){
   const r=$('.crew-start').getBoundingClientRect(),s=$('#stage').getBoundingClientRect(),scale=O.stageScale||1;
   finger.style.left=`${(r.x+r.width*.62-s.x)/scale}px`;finger.style.top=`${(r.y+r.height*.5-s.y)/scale}px`;finger.classList.add('on');
  }
  if(t>1.22&&!pressed){pressed=true;finger.classList.add('press');if(gate.ok){simulatedStart=true;startEvents.push({source:'illustrated human tap',gatePassed:true});$('.crew-start').textContent='STARTED BY LENA';sound('tap',.1);}}
  if(t>1.5)finger.classList.remove('press');if(t>2.3)finger.style.opacity='0';else finger.style.opacity='';
 }
}

$('.care-scene').innerHTML=brand+`<h1>Less machine<br><em>drama.</em></h1><h1>More human<br><em>care.</em></h1><img class="care-art" src="${asset('bliss')}" alt="Cio, connected and current"><div class="care-sign">ALOHA ROBOTICS / INVISIBLE CONNECTIVITY</div>`;
function cueChanged(c){
 cancelAnimations();scene=c.scene;step=c.step;age=0;crt=false;
 if(scene==='film'){checks=0;startEvents=[];simulatedStart=false;}
 if(scene==='confessional')setConfessional(step,c.instant);
 if(scene==='match')setBoard(step,c.instant);
 if(scene==='crew')setCrew(step,c.instant||reduced);
 if(scene==='care'){$$('.care-scene h1').forEach((e,i)=>e.classList.toggle('on',i===step));if(step===0)sound('chime',.045,440);}
}
document.addEventListener('astra:cue',e=>cueChanged(e.detail));
O.ticker.add(dt=>{
 if(O.paused)return;age+=dt;clock+=dt;
 if(scene==='confessional'){
  if(step===6&&age>1.75&&!stamped){stamped=true;$('.conf-stamp').classList.add('on');sound('thump',.065);}
  if(step===7){if(reduced)face(3,true);else if(age<2.15)face(Math.floor(age*(9+age*13))%6,true);else if(!crt){crt=true;confession.classList.add('crt');sound('crtOff',.3);}if(age>2.85&&!window.ASTRA.getState().auto)window.ASTRA.next();}
 }
 if(scene==='match')drawScouts(dt);
 if(scene==='crew')updateCrew(crewInstant?10:age);
});
window.COMEDY={
 metrics:()=>({checks,winner:{id:D.winner.device.id,from:D.winner.window.from,to:D.winner.window.to},backup:D.backup.id,gate,simulatedStart,startEvents}),
 gateFor:state=>P.canStart(state)
};
cueChanged(window.ASTRA.cues[window.ASTRA.getState().cue]);
