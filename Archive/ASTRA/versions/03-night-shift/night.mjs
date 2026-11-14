import './presentation.mjs';
const O=window.OPUS,D=window.DAY,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,brand='<div class="smallbrand">ALOHA</div>';
const asset=n=>`../../assets/characters/${n}.webp`,xTime=t=>(t-480)/960*1504,board=$('.night-board');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const labels=['Fracture','Hip fixation','Trauma','Revision','Fracture'];
board.innerHTML=brand+`<div class="night-top"><h1>The evening opens up.</h1><div class="night-clock">18:40</div></div><div class="night-meta">OPERATING THEATRES / WED 18 NOV</div><div class="cancel-toast">OR 3 · evening case cancelled</div><div class="night-grid">${Array.from({length:9},(_,i)=>`<span class="night-hour" style="left:${i*188}px">${String(8+i*2).padStart(2,'0')}:00</span><i class="night-vline" style="left:${i*188}px"></i>`).join('')}${D.devices.map((d,i)=>`<div class="night-row" style="top:${i*92}px"><div class="night-row-label"><b>${i===5?'Emergency':`OR ${i+1}`}</b><small>${d.name}</small></div>${d.busy[0].map((c,j)=>`<div class="night-case" style="left:${xTime(c.from)}px;width:${xTime(c.to)-xTime(c.from)-4}px"><b>${escape(c.fach.replace(' arthroplasty',' surgery').replace(' fixation','').replace(' surgery','').replace(' list',''))}</b><small>${D.format(c.from)}–${D.format(c.to)}</small></div>`).join('')}${i===2?`<div class="night-case evening" style="left:${xTime(D.cancelled.from)}px;width:${xTime(D.cancelled.to)-xTime(D.cancelled.from)}px"><b>Trauma list</b><small>19:00–22:20</small></div><div class="night-gold" style="left:${xTime(D.winner.window.from)}px;width:${xTime(D.winner.window.to)-xTime(D.winner.window.from)}px"><b>${D.format(D.winner.window.from)}–${D.format(D.winner.window.to)}</b></div>`:''}${i===5?`<div class="night-emergency" style="left:${xTime(1140)}px;right:0">EMERGENCY COVER</div>`:''}${d.id===D.backup.id?`<div class="night-backup" style="left:${xTime(D.winner.window.from)}px;width:${xTime(D.winner.window.to+D.rules.PUFFER)-xTime(D.winner.window.from)}px">${d.name.toUpperCase()} AVAILABLE</div>`:''}</div>`).join('')}<div class="night-now" style="left:${xTime(D.now)}px"></div></div><canvas class="night-agents"></canvas><div class="night-message"></div><div class="night-source">SYNTHETIC THEATRE PLAN · ORIGINAL TEAM PLANNER</div>`;
const captions=['Every case has a place.','An opening, not yet a decision.','Reading the plan. Testing the possibilities.','Protect the next case. Keep a replacement available.','The golden window. Ready for review.'];
const layer=O.canvas($('.night-agents')),g=layer.ctx,random=O.rng(3403);
const scouts=Array.from({length:42},(_,i)=>({x:1775,y:253,vx:0,vy:0,seed:random()*100,lane:i%6,trail:[],opacity:0}));
const target={x:286+xTime((D.winner.window.from+D.winner.window.to)/2),y:353+2*92+38};
let current='',step=0,sceneAge=0,phaseAge=0,oldStep=-1,relayAge=0,relayLast=-1;
function sound(name,...args){if(window.ASTRA.getState().sfx)O.audio.sfx[name]?.(...args);}
function setScene(c){
 const changed=current!==c.scene;current=c.scene;step=c.step;phaseAge=0;if(changed)sceneAge=0;
 if(current==='night'){
  board.dataset.step=step;$('.night-message').textContent=captions[step];
  $('.night-clock').textContent=step===0?'18:40':'18:41';
  if(changed||step<oldStep)for(const a of scouts){a.x=1775;a.y=253;a.vx=0;a.vy=0;a.trail=[];a.opacity=0;}
  if(step===1)sound('tick',.04,850);if(step===2)sound('whoosh',.6,.05,true);if(step===4)sound('success',.065);
  oldStep=step;
 }
 if(current==='relay'){relayAge=c.instant?10:0;relayLast=-1;$('.relay-scene').dataset.step=step;$('.relay-head').innerHTML=relayWords[step][0];$('.relay-deck').textContent=relayWords[step][1];$('.relay-bottom').textContent=relayWords[step][2];if(c.instant)updateRelay(10);if(!reduced&&!c.instant)$('.relay-head').animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});if(changed&&!c.instant)seedHandoff();sound('grow',.015,.7);}
 if(current==='dawn'){$$('.dawn-scene h1').forEach((e,i)=>e.classList.toggle('on',i===step));if(changed)sound('success',.045);}
}
function drawScouts(dt){
 layer.clear();if(step<2)return;
 const found=step===4,end=found?Math.max(0,1-phaseAge/.7):1;
 for(let i=0;i<scouts.length;i++){
  const a=scouts[i],tick=Math.floor((sceneAge+a.seed)*.7);let tx,ty;
  if(found){const theta=i/scouts.length*Math.PI*2,r=Math.max(0,95-phaseAge*85);tx=target.x+Math.cos(theta)*r;ty=target.y+Math.sin(theta)*r*.4;}
  else {const lane=(a.lane+Math.floor(tick/4))%6;tx=286+xTime((step===3?1100:540)+(Math.sin(tick*1.79+a.seed)+1)*.5*(step===3?285:870));ty=353+lane*92+25+Math.sin(a.seed+tick)*16;}
  const omega=found?7:4.8;a.vx+=(omega*omega*(tx-a.x)-2*omega*a.vx)*dt;a.vy+=(omega*omega*(ty-a.y)-2*omega*a.vy)*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;a.opacity+=(end-a.opacity)*Math.min(1,dt*7);
  a.trail.push([a.x,a.y]);if(a.trail.length>10)a.trail.shift();
  if(reduced){a.x=tx;a.y=ty;a.opacity=found?0:.3;a.trail=[];}
  const rgb=found?'239,197,138':'162,219,201';
  g.lineWidth=1;g.strokeStyle=`rgba(${rgb},${a.opacity*.14})`;g.beginPath();a.trail.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
  g.save();g.translate(a.x,a.y);g.rotate(Math.atan2(a.vy,a.vx)+Math.PI/2);if(found)g.scale(Math.max(.15,1-phaseAge),Math.max(.15,1-phaseAge));g.globalAlpha=a.opacity*.88;g.strokeStyle=`rgb(${rgb})`;g.fillStyle=`rgba(${rgb},.17)`;g.lineWidth=1.3;g.beginPath();g.moveTo(0,-9);g.lineTo(6,6);g.lineTo(0,3);g.lineTo(-6,6);g.closePath();g.fill();g.stroke();g.restore();
 }
}

const relayWords=[
 ['One opportunity.<br>One connected handoff.','The plan becomes a job someone can own.','Find the moment. Check the requirements.'],
 ['A person<br>has the final word.','A clear request. A named decision.','Agents propose. People authorize.'],
 ['Then help arrives.','Power and approved data, where the machine is parked.','KettyBot · a physical connection concept'],
 ['And the result<br>comes back.','Service status, logs and exceptions return to the team.','An open problem always has an owner.']
];
const relay=$('.relay-scene');
const xs=[320,735,1150,1570];
const paths=[
 'M445 610 C540 610 554 610 655 610',
 'M813 610 C914 610 921 610 1020 610',
 'M1290 610 C1374 610 1405 610 1465 610',
 'M1570 875 C1570 969 320 969 320 800'
];
relay.innerHTML=brand+`<h1 class="relay-head"></h1><p class="relay-deck"></p><svg class="relay-line" viewBox="0 0 1920 1080">${paths.map((d,i)=>`<path class="relay-track" d="${d}"/><path class="relay-draw" data-i="${i}" d="${d}" pathLength="1"/>`).join('')}</svg>
 <div class="relay-node on" style="left:${xs[0]}px"><div class="relay-object"><div class="relay-window"><b>${D.format(D.winner.window.from)}</b><small>CIO · SERVICE WINDOW</small></div></div><h2>Find.</h2><p>Plan + state + rules</p></div>
 <div class="relay-node" style="left:${xs[1]}px"><div class="relay-object"><div class="relay-phone"><div class="initial">L</div><b>Cio needs care.</b><span>Right time?<br>Clear surroundings?</span><em>AUTHORIZE</em></div></div><h2>Decide.</h2><p>A person in the loop</p></div>
 <div class="relay-node" style="left:${xs[2]}px"><div class="relay-object"><img src="${asset('ketty')}" alt="Original KettyBot character"></div><h2>Connect.</h2><p>Power + approved data</p></div>
 <div class="relay-node receipt" style="left:${xs[3]}px"><div class="relay-object"><div class="relay-receipt"><small>SERVICE RECORD</small><b>Accounted for.</b><span><i>✓</i> Result returned</span><span><i>↗</i> Team review</span></div></div><h2>Report.</h2><p>Verify. Escalate. Learn.</p></div><div class="relay-bottom"></div><div class="relay-packet"></div>`;
const relayPaths=$$('.relay-draw').map(p=>({p,l:p.getTotalLength()})),packet=$('.relay-packet');
function updateRelay(t){
 $$('.relay-node').forEach((n,i)=>n.classList.toggle('on',i===0||i<step||i===step&&t>1.18));
 relayPaths.forEach((r,i)=>r.p.classList.toggle('on',i<step||step===3&&i===3&&t>1.35));
 const route=step===0?null:relayPaths[step-1];
 if(route&&!reduced&&t<1.4){const q=route.p.getPointAtLength(Math.min(1,t/1.3)*route.l);packet.style.cssText=`left:${q.x-4.5}px;top:${q.y-4.5}px;opacity:1`;}
 else if(step===3&&t>1.4&&t<4&&!reduced){const r=relayPaths[3],q=r.p.getPointAtLength(Math.min(1,(t-1.4)/2.3)*r.l);packet.style.cssText=`left:${q.x-4.5}px;top:${q.y-4.5}px;opacity:${t<3.6?1:Math.max(0,1-(t-3.6)*3)}`;}
 else packet.style.opacity='0';
}
function seedHandoff(){
 if(reduced)return;const e=document.createElement('i');e.className='relay-packet';e.style.cssText=`left:${target.x}px;top:${target.y}px;z-index:15;opacity:1;width:14px;height:14px`;$('#stage').append(e);
 const anim=e.animate([{transform:'translate(0,0) scale(12)',opacity:.3},{transform:`translate(${xs[0]-target.x}px,${610-target.y}px) scale(1)`,opacity:1,offset:.85},{transform:`translate(${xs[0]-target.x}px,${610-target.y}px) scale(14)`,opacity:0}],{duration:1250,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});anim.finished.then(()=>e.remove()).catch(()=>e.remove());
}
$('.dawn-scene').innerHTML=`<div class="dawn-glow"></div><div class="dawn-horizon"></div>${brand}<h1>The machine has<br>a care team, too.</h1><h1>Ready for<br><em>what comes next.</em></h1><img class="dawn-art" src="${asset('bliss')}" alt="Cio, connected and content"><div class="dawn-sign"><b>ALOHA ROBOTICS</b>INVISIBLE CONNECTIVITY</div>`;
document.addEventListener('astra:cue',e=>setScene(e.detail));
O.ticker.add(dt=>{if(O.paused)return;phaseAge+=dt;sceneAge+=dt;if(current==='night')drawScouts(dt);if(current==='relay'){relayAge+=dt;updateRelay(reduced?10:relayAge);}});
setScene(window.ASTRA.cues[window.ASTRA.getState().cue]);
