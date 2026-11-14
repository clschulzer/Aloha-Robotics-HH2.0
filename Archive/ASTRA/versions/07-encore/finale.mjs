import './presentation.mjs';
const O=window.OPUS,C=window.PITCH,U=window.CARE,G=U.G;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const brand='<div class="smallbrand">ALOHA</div>',asset=n=>`../../assets/characters/${n}.webp`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sound=(name,...args)=>{if(window.ASTRA.getState().sfx)O.audio.sfx[name]?.(...args);};
let scene='',step=0,age=0,lastScene='',animations=[],humanShown=false;
const animate=(el,keys,options)=>{if(reduced||!el)return null;const a=el.animate(keys,options);animations.push(a);return a;};
const frame=$('#product'),origin=location.origin;
const proposal={from:G.hh(U.winner.from),to:G.hh(U.winner.to),guard:G.hh(U.winner.guardEnd),backup:U.backup.name,eligible:U.gate().ok};
function sendProduct(c){
  frame.contentWindow.postMessage({demo:'proposal',value:proposal},origin);
  if(c.scene!=='demo'){frame.contentWindow.postMessage({demo:'pause',value:true},origin);return;}
  const [s,n]=C.demoSteps[c.step];
  frame.contentWindow.postMessage({demo:'go',s,step:n},origin);
  frame.contentWindow.postMessage({demo:'pause',value:window.ASTRA.getState().paused},origin);
}
frame.addEventListener('load',()=>sendProduct(window.ASTRA.cues[window.ASTRA.getState().cue]));
addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.origin===origin&&e.data?.demo==='ready')sendProduct(window.ASTRA.cues[window.ASTRA.getState().cue]);});
document.addEventListener('astra:pause',({detail:value})=>frame.contentWindow.postMessage({demo:'pause',value:value||scene!=='demo'},origin));

// Calendar geometry is derived from the actual scenario and the scorer's result.
const F={x:96,y:316,w:1728,h:568,left:230,t0:420,t1:1440};
const rx=t=>F.left+(t-F.t0)/(F.t1-F.t0)*(F.w-F.left-24),rowY=i=>8+i*90;
const ids=U.devices.map(d=>d.id),byId=new Map(U.devices.map(d=>[d.id,d]));
const labels=['OR 1','OR 2','OR 3','OR 4','Reserve','Emergency'];
const rect=c=>({x:F.x+rx(c.from),y:F.y+rowY(ids.indexOf(c.id))+11,w:rx(c.to)-rx(c.from),h:66});
function caseCard(c,i){
  const width=rx(c.to)-rx(c.from)-3;
  let name=c.proc.split(' · ')[0].toLowerCase().replace(/\b[a-z]/g,x=>x.toUpperCase()).replace(/\b(?:Orif|Evar|Tevar)\b/g,x=>x.toUpperCase());
  if(width<150)name=name.split(' ')[0];
  const time=width<150?G.hh(c.from):`${G.hh(c.from)}–${G.hh(c.to)}`;
  return `<div class="op-case ${c.to<U.context.now?'past':''} ${i===5?'emergency':''}" style="left:${rx(c.from)}px;width:${width}px"><b>${esc(name)}</b><small>${time}</small></div>`;
}
const board=$('.opportunity');
board.innerHTML=brand+`<div class="op-head"><h1 class="op-title"></h1><div class="op-meta"><strong>WEDNESDAY · 18 NOVEMBER</strong>Illustrative hospital day</div></div>
  <div class="op-notice">19:12 · OR 3 evening case cancelled</div>
  <div class="op-board">${Array.from({length:9},(_,i)=>{const t=(8+i*2)*60;return `<span class="op-axis" style="left:${rx(t)}px">${G.hh(t)}</span><i class="op-guide" style="left:${rx(t)}px"></i>`;}).join('')}
  ${U.devices.map((d,i)=>`<div class="op-row" style="top:${rowY(i)}px"><div class="op-room"><b>${labels[i]}</b><small>${d.name}</small></div>
  ${d.cases.filter(c=>c.from<F.t1&&c.to>F.t0).map(c=>caseCard(c,i)).join('')}
  ${d.id==='C-03'?`<div class="op-vacancy" style="left:${rx(U.cancelled.from)}px;width:${rx(U.cancelled.to)-rx(U.cancelled.from)}px"></div><div class="op-case cancelled" style="left:${rx(U.cancelled.from)}px;width:${rx(U.cancelled.to)-rx(U.cancelled.from)-3}px"><b>Spinal fixation</b><small>${G.hh(U.cancelled.from)}–${G.hh(U.cancelled.to)}</small></div>`:''}
  ${i>=4?`<div class="op-reserve" style="left:${rx(1020)}px;width:${rx(i===5?1330:1410)-rx(1020)}px">${i===5?'EMERGENCY COVER':'KEEP AVAILABLE'}</div>`:''}</div>`).join('')}
  <div class="op-now" style="left:${rx(U.context.now)}px"></div><div class="op-gold"><b>${G.hh(U.winner.from)}–${G.hh(U.winner.to)}</b><div class="op-recovery"></div></div><div class="op-backup">${esc(U.backup.name)} · backup</div></div>
  <canvas class="op-scouts"></canvas><div class="op-bottom"><p class="op-message"></p><div class="op-token"><small>PROPOSAL · C-03 CIO</small><b>${G.hh(U.winner.from)}–${G.hh(U.winner.to)}</b><span>Recovery margin reserved</span></div></div>
  <div class="op-foot">LIVE RULES · SYNTHETIC RECORDS · SERVICE PROPOSAL</div>`;
const gold=$('.op-gold'),r=rect(U.winner);
Object.assign(gold.style,{left:`${r.x-F.x}px`,top:`${r.y-F.y}px`,width:`${r.w}px`});
$('.op-recovery').style.width=`${rx(U.winner.guardEnd)-rx(U.winner.to)}px`;
Object.assign($('.op-backup').style,{left:`${r.x-F.x}px`,top:`${rowY(ids.indexOf(U.backup.id))+11}px`,width:`${rx(U.winner.guardEnd)-rx(U.winner.from)}px`});
const layer=O.canvas($('.op-scouts')),g=layer.ctx,random=O.rng(701);
const agents=Array.from({length:84},(_,i)=>({x:i%2?-50:2000,y:280+random()*590,vx:0,vy:0,tx:0,ty:0,alpha:0,trail:[],wait:0,record:null}));
const historical=U.devices.flatMap(d=>d.cases.map(c=>({id:d.id,from:c.from,to:c.from+G.RULES.DUR})));
const pool=U.after.all.concat(historical);
let hunting=false,gathering=false,swarmAge=0,evaluations=0,marks=[];
function target(a){
  a.record=pool[Math.floor(random()*pool.length)];
  const i=ids.indexOf(a.record.id);
  a.tx=F.x+Math.min(F.w-16,rx((a.record.from+a.record.to)/2))+(random()-.5)*23;
  a.ty=F.y+rowY(i)+43+(random()-.5)*21;
  a.wait=.1+random()*.22;
}
function gather(){
  hunting=false;gathering=true;swarmAge=0;marks=[];
  const perimeter=(r.w+r.h)*2;
  agents.forEach((a,i)=>{
    let d=i/agents.length*perimeter;
    if(d<r.w){a.tx=r.x+d;a.ty=r.y-4;}
    else if((d-=r.w)<r.h){a.tx=r.x+r.w+4;a.ty=r.y+d;}
    else if((d-=r.h)<r.w){a.tx=r.x+r.w-d;a.ty=r.y+r.h+4;}
    else{d-=r.w;a.tx=r.x-4;a.ty=r.y+r.h-d;}
  });
}
function calendarStep(n,instant){
  board.dataset.step=n;swarmAge=0;hunting=gathering=false;gold.classList.toggle('on',instant&&n>=3);
  $('.op-title').textContent=['The right moment.','Plans change.','Find. Then challenge.','The golden window.','Ready for a human.'][n];
  $('.op-message').innerHTML=[
    'A real day has cases, turnover and uncertainty.',
    'The cancellation opens a possibility.',
    'Cases. Emergency demand. Backup. People.',
    `<strong>${esc(U.backup.name)} stays available.</strong> Emergency cover remains.`,
    'Reviewed and published by medical physics.'
  ][n];
  const token=$('.op-token');token.classList.toggle('on',n>=3);token.classList.toggle('published',n===4);
  token.querySelector('small').textContent=n===4?'PUBLISHED · MEDICAL PHYSICS':'PROPOSAL · C-03 CIO';
  if(n===0){
    evaluations=0;agents.forEach((a,i)=>{a.x=i%2?-50:2000;a.y=280+random()*590;a.vx=a.vy=a.alpha=0;a.trail=[];});marks=[];layer.clear();
    if(!instant){
      animate($('.op-board'),[{opacity:0,transform:'translateY(58px)'},{opacity:1,transform:'none'}],{duration:880,easing:'cubic-bezier(.16,1,.3,1)'});
      $$('.op-row').forEach((e,i)=>animate(e,[{opacity:0,transform:'translateX(45px)'},{opacity:1,transform:'none'}],{duration:700,delay:120+i*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));
    }
  }
  if(n===1)sound('tick',.07,940);
  if(n===2){hunting=true;agents.forEach(target);sound('whoosh',.6,.07,true);}
  if(n===3){if(instant){agents.forEach(a=>a.alpha=0);gold.classList.add('on');}else gather();sound('success',.065);}
  if(n===4){gold.classList.add('on');agents.forEach(a=>a.alpha=0);sound('pop',640,.12);}
}
function drawScouts(dt){
  layer.clear();swarmAge+=dt;
  if(gathering&&swarmAge>.48)gold.classList.add('on');
  if(gathering&&swarmAge>2.7){gathering=false;agents.forEach(a=>{a.alpha=0;a.trail=[];});}
  for(const a of agents){
    if(hunting||gathering){
      const k=gathering?10:8.5;
      a.vx+=(k*k*(a.tx-a.x)-1.9*k*a.vx)*dt;a.vy+=(k*k*(a.ty-a.y)-1.9*k*a.vy)*dt;
      a.x+=a.vx*dt;a.y+=a.vy*dt;a.wait-=dt;
      const dest=gathering?Math.max(0,1-(swarmAge-.4)/.8):.77;
      a.alpha+=(dest-a.alpha)*Math.min(1,dt*8);
      if(hunting&&a.wait<0&&Math.hypot(a.x-a.tx,a.y-a.ty)<19){
        const test=G.evaluate(U.devices,byId.get(a.record.id),a.record.from,U.context);
        evaluations++;marks.push({x:a.x,y:a.y,age:0,ok:test.status==='ok'});
        if(marks.length>50)marks.shift();target(a);
      }
    }else a.alpha=Math.max(0,a.alpha-dt*4);
    if(a.alpha<.01||reduced)continue;
    a.trail.push([a.x,a.y]);if(a.trail.length>8)a.trail.shift();
    const rgb=gathering?'245,211,144':'161,240,213';
    g.beginPath();a.trail.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.lineWidth=1;g.strokeStyle=`rgba(${rgb},${a.alpha*.14})`;g.stroke();
    g.save();g.translate(a.x,a.y);g.rotate(Math.atan2(a.vy,a.vx)+Math.PI/2);g.globalAlpha=Math.max(0,Math.min(1,a.alpha));g.fillStyle=`rgba(${rgb},.22)`;g.strokeStyle=`rgb(${rgb})`;g.lineWidth=1.2;
    g.beginPath();g.moveTo(0,-8);g.lineTo(5.5,6);g.lineTo(0,2.5);g.lineTo(-5.5,6);g.closePath();g.fill();g.stroke();g.restore();
  }
  for(const m of marks){m.age+=dt;g.strokeStyle=m.ok?`rgba(131,229,208,${Math.max(0,.5-m.age)*.6})`:`rgba(228,178,150,${Math.max(0,.5-m.age)*.4})`;g.lineWidth=1;g.beginPath();g.arc(m.x,m.y,5+m.age*25,0,Math.PI*2);g.stroke();}
  marks=marks.filter(m=>m.age<.5);
}
function carryProposal(){
  if(reduced)return;
  const ghost=document.createElement('div');ghost.className='travel-token';ghost.textContent=`Cio · ${G.hh(U.winner.from)}`;
  Object.assign(ghost.style,{left:'1214px',top:'932px',width:'610px',height:'104px'});
  $('#stage').append(ghost);
  const a=animate(ghost,[{transform:'translate(0,0) scale(1)',opacity:.9},{transform:'translate(-18px,-253px) scale(.68)',opacity:1,offset:.57},{transform:'translate(56px,-463px) scale(.48)',opacity:0}],{duration:770,easing:'cubic-bezier(.4,0,.12,1)',fill:'forwards'});
  a?.finished.then(()=>ghost.remove()).catch(()=>ghost.remove());
}
// Three pillars resolve into a single return path; line arrivals drive the reveal.
const syn=$('.synthesis'),paths=[
  'M535 536 C660 536 705 536 846 536',
  'M1074 536 C1190 536 1290 536 1384 536',
  'M1632 536 C1750 536 1780 670 1780 828 Q1780 923 1660 923 L248 923 Q140 923 140 826 L140 697 C140 597 202 536 283 536'
];
syn.innerHTML=brand+`<h1>One care loop.</h1><svg class="syn-paths" viewBox="0 0 1920 1080">${paths.map(p=>`<path d="${p}"/><path class="syn-growth" d="${p}" pathLength="1"/>`).join('')}</svg><div class="syn-grid">
 <div class="syn-node"><div class="syn-art"><img src="${asset('bliss')}" alt="Cio"></div><h2>Someone cares.</h2><p>Emotional connection</p></div>
 <div class="syn-node"><div class="syn-art"><div class="syn-orb"><b>IA</b></div></div><h2>It coordinates.</h2><p>Agents + people</p></div>
 <div class="syn-node"><div class="syn-art"><img src="${asset('ketty')}" alt="KettyBot"></div><h2>Help arrives.</h2><p>Physical connection</p></div></div><div class="syn-foot">FRESH DATA. A THANK-YOU. THE NEXT DECISION.</div>`;
let bloomed=0;
function synthesis(instant){
  bloomed=0;$$('.syn-node').forEach(n=>n.classList.remove('on'));$('.syn-foot').classList.remove('on');
  $$('.syn-growth').forEach(p=>p.style.strokeDashoffset=1);
  if(instant||reduced){$$('.syn-node').forEach(n=>n.classList.add('on'));$('.syn-foot').classList.add('on');$$('.syn-growth').forEach(p=>p.style.strokeDashoffset=0);bloomed=3;return;}
  $$('.syn-node')[0].classList.add('on');
  $$('.syn-growth').forEach((p,i)=>animate(p,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:i===2?1600:820,delay:i===0?360:i===1?1200:2030,fill:'both',easing:'cubic-bezier(.45,0,.2,1)'}));
  sound('grow',.045,1);
}
$('.care-scene').innerHTML=brand+`<h1 class="care-line"></h1><div class="care-portrait"><img src="${asset('bliss')}" alt="Cio, connected and current"></div><div class="care-pair"><img src="${asset('ketty')}" alt="KettyBot"><img src="assets/ketty_wink.webp" alt=""></div><div class="care-sign">ALOHA ROBOTICS<small>INVISIBLE AUTONOMY. HUMAN CARE.</small></div><div class="care-questions">Any <b>TECHNICAL</b> questions?</div>`;
function cue(c){
  animations.forEach(a=>a.cancel());animations=[];lastScene=scene;scene=c.scene;step=c.step;age=0;
  sendProduct(c);
  $('.demo-caption').textContent=scene==='demo'&&step>=9&&step<=18?'ILLUSTRATIVE SERVICE MISSION · TIME COMPRESSED':'';
  if(scene==='film'){humanShown=false;frame.contentWindow.postMessage({demo:'reset'},origin);}
  if(scene==='demo'){
    if(step===0){humanShown=false;sound('sob',.07);}
    if(step===1)sound('boing',.10);
    if([2,16,19].includes(step))sound('success',.052);
    if([5,13].includes(step))sound('pop',780,.14);
    if(step===5&&lastScene==='opportunity'&&!c.instant)carryProposal();
    if(step>=9&&step<=12)sound('tick',.065,580+step*24);
  }
  if(scene==='cut')sound('crtOff',.24);
  if(scene==='opportunity')calendarStep(step,c.instant);
  if(scene==='synthesis')synthesis(c.instant);
  if(scene==='care'){
    $('.care-scene').dataset.step=step;
    $('.care-line').innerHTML=step?'You take care<br><em>of the patient.</em>':'We take care<br><em>of the machine.</em>';
    if(!c.instant){animate($('.care-line'),[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});if(step===0)animate($('.care-portrait'),[{opacity:0,transform:'translateY(55px) scale(.94)'},{opacity:1,transform:'none'}],{duration:1050,easing:'cubic-bezier(.16,1,.3,1)'});}
    sound('success',.035);
  }
}
document.addEventListener('astra:cue',({detail:c})=>cue(c));
O.ticker.add(dt=>{
  if(O.paused)return;age+=dt;
  if(scene==='opportunity')drawScouts(dt);
  if(scene==='demo'&&step===15&&age>3.85&&!humanShown){humanShown=true;frame.contentWindow.postMessage({demo:'human'},origin);sound('tick',.065,730);}
  if(scene==='synthesis'){
    if(age>1.14&&bloomed<1){$$('.syn-node')[1].classList.add('on');sound('tick',.032,740);bloomed=1;}
    if(age>2&&bloomed<2){$$('.syn-node')[2].classList.add('on');sound('tick',.032,960);bloomed=2;}
    if(age>3.6&&bloomed<3){$('.syn-foot').classList.add('on');sound('success',.027);bloomed=3;}
  }
});
window.ENCORE={
  metrics:()=>({evaluations,winner:U.winner,backup:U.backup.id,checks:U.checkStory(),proposal,humanShown,
    product:frame.contentWindow.DEMO?.metrics?.()||null}),
  scenario:U
};
cue({...window.ASTRA.cues[window.ASTRA.getState().cue],instant:true});
