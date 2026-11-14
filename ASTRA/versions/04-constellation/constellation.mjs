import './presentation.mjs';
const O=window.OPUS,U=window.CONSTELLATION,G=U.G,C=window.PITCH,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,asset=n=>`../../assets/characters/${n}.webp`,brand='<div class="smallbrand">ALOHA</div>';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let scene='',step=0,age=0,total=0,lastMood=-1,crt=false,activeAnimations=[];
const sound=(name,...args)=>{if(window.ASTRA.getState().sfx)O.audio.sfx[name]?.(...args);};
function animate(el,frames,options){if(reduced)return;const a=el.animate(frames,options);activeAnimations.push(a);return a;}
function clearAnimation(){for(const a of activeAnimations)a.cancel();activeAnimations=[];}
const show=$('.showcase');
show.innerHTML=brand+`<div class="phone-orbit"></div><h1 class="show-intro">A little<br>more human.</h1><div class="device-phone"><div class="device-screen"><div class="phone-clock">13:37</div><div class="island"></div><div class="phone-app">C-ARM<em>AGOTCHI</em></div><div class="phone-portrait">${C.moods.map(m=>`<img src="${asset(m[0])}" alt="${esc(m[2])}">`).join('')}</div><div class="phone-status"></div><div class="phone-action">Cio’s circle</div></div></div><div class="show-copy"><div class="show-kicker">MEET YOUR MACHINE</div><h1 class="show-title"></h1><p class="show-state"></p><p class="show-quote"></p></div>`;
function mood(n,spin=false,instant=false){
 if(n===lastMood&&!instant)return;lastMood=n;
 const m=C.moods[n];$$('.phone-portrait img').forEach((e,i)=>e.classList.toggle('current',i===n));
 $('.phone-status').textContent=m[2];$('.show-title').textContent=m[1];$('.show-state').textContent=m[2];$('.show-quote').textContent=m[3];
 if(!spin&&!instant){animate($$('.phone-portrait img')[n],[{transform:'translateY(18px) rotateY(-32deg) rotateZ(-6deg) scale(.88)',opacity:0},{transform:'translateY(-8px) rotateY(7deg) rotateZ(2deg) scale(1.02)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:840,easing:'cubic-bezier(.18,1,.3,1)'});animate($('.show-title'),[{opacity:0,transform:'translateY(34px)'},{opacity:1,transform:'none'}],{duration:640,easing:'cubic-bezier(.16,1,.3,1)'});sound(n===1?'boing':n===3?'sparkle':'tick',n===1?.085:n===3?.04:.045,660+n*90);}
}

// Each row is an actual device calendar from the team's synthetic day.
const frame={x:93,y:313,w:1734,h:606,left:265,t0:420,t1:1560},rx=t=>frame.left+(t-frame.t0)/(frame.t1-frame.t0)*(frame.w-frame.left-28);
const rowY=i=>20+i*91,point=c=>({x:frame.x+rx((c.from+c.to)/2),y:frame.y+rowY(U.ids.indexOf(c.id))+45});
const board=$('.constellation');
board.innerHTML=brand+`<h1 class="const-title">Find the opportunity.</h1><p class="const-sub">WED 18 NOV · ILLUSTRATIVE HOSPITAL DAY</p><div class="const-signal"><i></i><span>THEATRE PLAN</span></div><div class="const-day"><div class="const-frame">${Array.from({length:10},(_,i)=>{const t=(8+i*2)*60;return `<span class="const-axis" style="left:${rx(t)}px">${G.hh(t)}</span><i class="const-guide" style="left:${rx(t)}px"></i>`;}).join('')}${U.devices.map((d,i)=>`<div class="const-row" style="top:${rowY(i)}px"><div class="const-rowname"><b>${esc(d.name)}</b><small>${d.id==='C-05'?'Reserve':d.id==='C-08'?'Emergency':`OR ${i+1}`}</small></div>${d.cases.filter(c=>c.from<frame.t1&&c.to>frame.t0).map(c=>`<div class="const-case ${c.to<U.context.now?'done':''}" style="left:${rx(Math.max(frame.t0,c.from))}px;width:${rx(c.to)-rx(Math.max(frame.t0,c.from))-4}px"><b>${esc(c.proc.split(' · ')[0].toLowerCase().replace(/\b[a-z]/g,x=>x.toUpperCase()))}</b><small>${G.hh(c.from)}–${G.hh(c.to)}</small></div>`).join('')}${U.D.ALARM.area.includes(d.area)?`<div class="const-lock" style="left:${rx(U.D.ALARM.from)}px;width:${rx(U.D.ALARM.to)-rx(U.D.ALARM.from)}px">TRAUMA RESERVED</div>`:''}</div>`).join('')}<div class="const-now" style="left:${rx(U.context.now)}px"></div><div class="const-roster"><span><i></i>Medical physics → IT on call</span><span>Recovery margin + backup calendar checked</span></div><div class="const-gold"><span></span><div class="const-tail"></div></div></div><canvas class="const-swarm"></canvas></div><p class="const-summary"></p>`;
const sl=O.canvas($('.const-swarm')),sg=sl.ctx,rng=O.rng(404);
const agents=Array.from({length:144},(_,i)=>({x:i%2?-80:2000,y:150+rng()*760,vx:0,vy:0,tx:0,ty:0,trail:[],alpha:0,size:.62+rng()*.42,wait:rng()*.6,candidate:null,seed:rng()*99}));
let pool=[],context=U.context,selected=U.before.best,gather=false,hunting=false,scoutAge=0,rings=[],shards=[],inspected=0,goldVisible=false,goldKey='';
const goldEl=$('.const-gold'),goldText=goldEl.querySelector('span'),goldTail=goldEl.querySelector('.const-tail');
const devicesById=new Map(U.devices.map(d=>[d.id,d]));
const winRect=c=>({x:frame.x+rx(c.from),y:frame.y+rowY(U.ids.indexOf(c.id))+11,w:rx(c.to)-rx(c.from),h:70});
function pick(a){a.candidate=pool[Math.floor(rng()*pool.length)];const p=point(a.candidate);a.tx=p.x+(rng()-.5)*40;a.ty=p.y+(rng()-.5)*30;a.wait=.12+rng()*.22;}
function paintGold(c,on){
 const key=`${c.id}:${c.from}:${c.to}:${c.guardEnd}`;
 if(key!==goldKey){
  goldKey=key;const r=winRect(c);
  Object.assign(goldEl.style,{left:`${r.x-frame.x}px`,top:`${r.y-frame.y}px`,width:`${r.w}px`});
  goldText.textContent=`${G.hh(c.from)}–${G.hh(c.to)}`;goldTail.style.width=`${rx(c.guardEnd)-rx(c.to)}px`;
 }
 if(goldVisible!==on){goldVisible=on;goldEl.classList.toggle('on',on);}
}
function hunt(after=false,reset=false){
 context=after?U.alarmContext:U.context;pool=(after?U.after:U.before).all.filter(c=>c.reason!=='current'&&c.guardEnd<=frame.t1);
 gather=false;hunting=true;scoutAge=0;rings=[];
 agents.forEach((a,i)=>{if(reset){a.x=i%2?-80:2000;a.y=150+rng()*760;a.vx=a.vy=0;a.alpha=0;a.trail=[];}pick(a);});
}
function gatherAt(c){
 selected=c;gather=true;hunting=false;scoutAge=0;const r=winRect(c),perimeter=2*(r.w+r.h);
 agents.forEach((a,i)=>{let d=i/agents.length*perimeter;if(d<r.w){a.tx=r.x+d;a.ty=r.y-7;}else if((d-=r.w)<r.h){a.tx=r.x+r.w+7;a.ty=r.y+d;}else if((d-=r.h)<r.w){a.tx=r.x+r.w-d;a.ty=r.y+r.h+7;}else{d-=r.w;a.tx=r.x-7;a.ty=r.y+r.h-d;}a.wait=0;});
 paintGold(c,false);
}
function burst(){
 const r=winRect(U.before.best);for(let i=0;i<46;i++)shards.push({x:r.x+rng()*r.w,y:r.y+rng()*r.h,vx:(rng()-.5)*400,vy:-60-rng()*210,rot:rng()*6,size:2+rng()*5,life:1.2+rng()*.5});
}
function boardStep(n,instant){
 const folding=n===0&&!instant&&!reduced;
 const flatten=()=>{board.style.perspective='none';$('.const-day').style.willChange='auto';};
 board.style.perspective=folding?'2100px':'none';$('.const-day').style.willChange=folding?'transform':'auto';
 board.dataset.alarm=String(n>=4);
 $('.const-now').style.left=`${rx(n>=4?U.alarmContext.now:U.context.now)}px`;
 const titles=['Find the opportunity.','Every gap. Challenged.','Care has right of way.','The golden window.','Care comes first.','New situation. New plan.','A fresh proposal.'];
 const captions=['A real plan has cases, turnover and uncertainty.','Searching the day, with care in mind.','Case overlap · emergency demand · backup · human availability',`${U.before.best.id} · ${G.hh(U.before.best.from)} · ready for review`,'Trauma equipment reserved. No update has started.','The same rules. A different eligible window.',`${U.after.best.id} · ${G.hh(U.after.best.from)} · ready for a human decision`];
 $('.const-title').textContent=titles[n];$('.const-summary').textContent=captions[n];$('.const-summary').classList.toggle('gold',n===3||n===6);
 $('.const-signal span').textContent=n===4?'POLYTRAUMA ALERT':n===1||n===2||n===5?'SCOUTS ACTIVE':n===3||n===6?'PROPOSAL FOUND':'THEATRE PLAN';
 $('.const-signal').classList.toggle('alarm',n===4);
 if(n===0){hunting=gather=false;sl.clear();paintGold(U.before.best,false);if(folding){const opening=animate($('.const-day'),[{transform:'translateY(110px) rotateX(27deg) rotateZ(-2deg) scale(.86)',opacity:0},{transform:'none',opacity:1}],{duration:1450,easing:'cubic-bezier(.16,1,.3,1)'});opening.finished.then(flatten).catch(()=>{});$$('.const-row').forEach((r,i)=>animate(r,[{transform:'translateZ(-80px) translateY(42px) rotateX(14deg)',opacity:0},{transform:'none',opacity:1}],{duration:960,delay:180+i*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));}}
 if(n===1||n===2){paintGold(U.before.best,false);hunt(false,n===1);if(n===1)sound('whoosh',.8,.055,true);}
 if(n===3){gatherAt(U.before.best);sound('success',.065);}
 if(n===4){hunting=gather=false;paintGold(U.before.best,false);if(!instant)burst();sound('thump',.065);rings=[];}
 if(n===5){paintGold(U.after.best,false);hunt(true,true);sound('whoosh',.65,.05,true);}
 if(n===6){gatherAt(U.after.best);sound('success',.065);}
 if(instant&&(n===3||n===6)){scoutAge=3;paintGold(selected,true);agents.forEach(a=>a.alpha=0);}
}
function drawSwarm(dt){
 sl.clear();scoutAge+=dt;
 if(gather&&scoutAge>.55&&!goldVisible)paintGold(selected,true);
 if(gather&&scoutAge>3){gather=false;agents.forEach(a=>{a.alpha=0;a.trail=[];});}
 for(const a of agents){
  if(!hunting&&!gather){a.alpha=Math.max(0,a.alpha-dt*5);}
  else{
   a.wait-=dt;const w=gather?10:7.7;
   a.vx+=(w*w*(a.tx-a.x)-1.8*w*a.vx)*dt;a.vy+=(w*w*(a.ty-a.y)-1.8*w*a.vy)*dt;
   a.x+=a.vx*dt;a.y+=a.vy*dt;
   const alphaTarget=gather?Math.max(0,1-(scoutAge-.6)/.9):.75;
   a.alpha+=(alphaTarget-a.alpha)*Math.min(1,dt*7);
   a.alpha=Math.max(0,Math.min(.8,a.alpha));
   if(hunting&&a.wait<=0&&Math.hypot(a.tx-a.x,a.ty-a.y)<20){
    const d=devicesById.get(a.candidate.id),evaluation=G.evaluate(U.devices,d,a.candidate.from,context);inspected++;
    rings.push({x:a.x,y:a.y,age:0,ok:evaluation.status==='ok'});if(rings.length>50)rings.shift();pick(a);
   }
  }
  if(a.alpha<.01||reduced)continue;
  a.trail.push([a.x,a.y]);if(a.trail.length>9)a.trail.shift();
  const rgb=gather?'244,203,131':'148,241,215';
  sg.beginPath();a.trail.forEach(([x,y],i)=>i?sg.lineTo(x,y):sg.moveTo(x,y));sg.strokeStyle=`rgba(${rgb},${a.alpha*.13})`;sg.lineWidth=1;sg.stroke();
  sg.save();sg.translate(a.x,a.y);sg.rotate(Math.atan2(a.vy,a.vx)+Math.PI/2);const scale=a.size*(gather?Math.max(.15,1-scoutAge*.5):1);sg.scale(scale,scale);sg.globalAlpha=a.alpha;sg.fillStyle=`rgba(${rgb},.28)`;sg.strokeStyle=`rgb(${rgb})`;sg.lineWidth=1.3;sg.beginPath();sg.moveTo(0,-9);sg.lineTo(6,7);sg.lineTo(0,3);sg.lineTo(-6,7);sg.closePath();sg.fill();sg.stroke();sg.restore();
 }
 for(const r of rings){r.age+=dt;if(r.age>.5)continue;sg.strokeStyle=r.ok?`rgba(148,241,215,${(.5-r.age)*.4})`:`rgba(218,157,176,${(.5-r.age)*.5})`;sg.lineWidth=1;sg.beginPath();sg.arc(r.x,r.y,5+r.age*25,0,Math.PI*2);sg.stroke();}
 rings=rings.filter(r=>r.age<.5);
 for(const s of shards){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=220*dt;sg.save();sg.translate(s.x,s.y);sg.rotate(s.rot+scoutAge);sg.globalAlpha=Math.max(0,Math.min(1,s.life));sg.fillStyle='#efc58a';sg.fillRect(-s.size,-s.size,s.size*2,s.size);sg.restore();}
 shards=shards.filter(s=>s.life>0);
}

// Growth has arrival times. Every node blooms only when its incoming path is complete.
const paths=[
 ['M285 445 C420 445 411 575 527 575',0,.15,1.35,2],
 ['M285 725 C430 725 411 575 527 575',0,.5,1.5,2],
 ['M703 575 C797 575 850 575 958 575',1,0,1.35,3],
 ['M1082 575 C1225 575 1420 575 1555 575',2,0,1.55,4],
 ['M1082 575 C1180 575 1160 795 1238 795',2,.4,1.55,5],
 ['M1362 795 C1560 795 1810 815 1810 710 C1810 640 1780 575 1710 575',2,2,1.15,4],
 ['M1710 575 C1830 575 1840 650 1840 800 L1840 930 Q1840 986 1770 986 L1110 986 C1020 986 1010 870 840 870',3,0,1.9,6],
 ['M760 870 C470 1000 58 1000 58 835 C58 725 80 725 158 725',3,2.1,2.2,1]
];
const nodes=[
 {x:220,y:445,word:'Hospital plan',sub:'Cases + cancellations',icon:'calendar'},
 {x:220,y:725,word:'Device state',sub:'Readiness + history',icon:'device'},
 {x:615,y:575,word:'Orchestrate',sub:'Scout · risk · preflight',icon:'core',cls:'core'},
 {x:1020,y:575,word:'Authorize',sub:'A human decides',icon:'person',cls:'human'},
 {x:1630,y:575,word:'Service',sub:'Approved device path',img:'bliss',cls:'physical'},
 {x:1300,y:795,word:'Connect',sub:'Physical help, if needed',img:'ketty',cls:'physical'},
 {x:800,y:870,word:'Verify + report',sub:'Return every exception',icon:'log',cls:'compact'}
];
const icon={
 calendar:'<rect x="6" y="10" width="36" height="31" rx="5"/><path d="M6 21h36M16 5v10M33 5v10M14 29h7m8 0h6"/>',
 device:'<rect x="5" y="6" width="38" height="29" rx="4"/><path d="M17 43h14m-7-8v8M12 16h21m-21 9h15"/>',
 core:'<circle cx="24" cy="24" r="13"/><circle cx="24" cy="24" r="4"/><path d="M24 2v9m0 26v9M2 24h9m26 0h9M8 8l6 6m20 20 6 6M8 40l6-6m20-20 6-6"/>',
 person:'<circle cx="24" cy="13" r="8"/><path d="M8 43v-8c0-14 32-14 32 0v8Z"/>',
 log:'<path d="M11 5h26v38l-7-4-6 4-6-4-7 4Z"/><path d="m17 21 6 6 10-13M17 33h14"/>'
};
const myc=$('.mycelium');
myc.innerHTML=brand+`<h1 class="myc-title"></h1><p class="myc-sub"></p><svg class="myc-geometry" viewBox="0 0 1920 1080" style="position:absolute;width:1920px;height:1080px;visibility:hidden">${paths.map(p=>`<path d="${p[0]}"/>`).join('')}</svg><canvas class="myc-canvas"></canvas>${nodes.map((n,i)=>`<div class="myc-node ${n.cls||''}" data-node="${i}" style="left:${n.x}px;top:${n.y}px"><div class="myc-disc">${n.img?`<img src="${asset(n.img)}" alt="${n.word}">`:`<svg viewBox="0 0 48 48">${icon[n.icon]}</svg>`}</div><b>${n.word}</b><small>${n.sub}</small></div>`).join('')}<div class="myc-note"></div><div class="myc-foot"></div>`;
const ml=O.canvas($('.myc-canvas')),mg=ml.ctx;
const lines=$$('.myc-geometry path').map((p,i)=>{const length=p.getTotalLength(),count=Math.ceil(length/6);return{phase:paths[i][1],delay:paths[i][2],duration:paths[i][3],node:paths[i][4],points:Array.from({length:count+1},(_,j)=>{const q=p.getPointAtLength(j/count*length);return[q.x,q.y];}),grown:0};});
let mycAge=0,mycInstant=false,bloomed=new Set(),sprouts=[];
const glow=O.glow([178,255,211],44,.12);
function bloom(i,instant=false){
 if(bloomed.has(i))return;bloomed.add(i);$(`.myc-node[data-node="${i}"]`).classList.add('on');if(instant||reduced)return;
 const n=nodes[i],r=i===2?92:66;
 for(let k=0;k<9;k++){const a=k/9*Math.PI*2+.14;if(Math.sin(a)>-.35)continue;const pts=[];for(let j=0;j<14;j++){const d=r+j*3.4;pts.push([n.x+Math.cos(a+.09*Math.sin(j*.5))*d,n.y+Math.sin(a+.09*Math.sin(j*.5))*d]);}sprouts.push({pts,age:0});}
 sound('tick',.027,620+i*90);
}
function setMyc(n,instant){
 mycAge=0;mycInstant=instant;myc.dataset.step=n;bloomed.clear();sprouts=[];$$('.myc-node').forEach(e=>e.classList.remove('on'));
 $('.myc-title').textContent=['Everything. Connected.','A person in command.','Help, wherever it is needed.','The loop is the product.'][n];
 $('.myc-sub').textContent=['A signal becomes a plan someone can trust.','The agents reach the gate. A human opens it.','Existing connections, with a physical bridge where needed.','Results and exceptions return to the people responsible.'][n];
 $('.myc-note').textContent=n>=2?'KettyBot supplies power and approved data when the device has no connection.':'';
 $('.myc-foot').textContent=n===3?'Accountable from request to result.':'Agents propose. People authorize.';
 bloom(0,true);bloom(1,true);
 for(const l of lines){l.grown=l.phase<n?1:0;if(l.phase<n)bloom(l.node,true);}
 if(instant)for(const l of lines)if(l.phase<=n){l.grown=1;bloom(l.node,true);}
 sound('grow',.022,1.1);
}
function drawLine(pts,k,color){
 if(k<=0)return;const end=Math.max(1,Math.min(pts.length-1,k*(pts.length-1))),i=Math.floor(end),f=end-i;
 mg.beginPath();mg.moveTo(...pts[0]);for(let j=1;j<=i;j++)mg.lineTo(...pts[j]);
 let tip=pts[i];if(f&&i+1<pts.length){tip=[pts[i][0]+(pts[i+1][0]-pts[i][0])*f,pts[i][1]+(pts[i+1][1]-pts[i][1])*f];mg.lineTo(...tip);}
 mg.strokeStyle=color;mg.lineWidth=2;mg.stroke();return tip;
}
function drawMyc(dt){
 mycAge+=dt;ml.clear();
 for(const s of sprouts){s.age+=dt;drawLine(s.pts,Math.min(1,s.age/.65),`rgba(148,241,215,${Math.max(.08,.3-s.age*.15)})`);}
 for(let i=0;i<lines.length;i++){
  const l=lines[i];drawLine(l.points,1,'rgba(100,178,145,.08)');
  if(l.phase>step)continue;
  if(l.phase===step&&!mycInstant){const prev=l.grown;l.grown=Math.min(1,Math.max(0,(mycAge-l.delay)/l.duration));if(l.grown>=1&&prev<1)bloom(l.node);}
  const tip=drawLine(l.points,l.grown,i===4||i===5?'rgba(244,203,131,.8)':'rgba(148,241,215,.8)');
  if(tip&&l.grown>0&&l.grown<1&&!reduced)mg.drawImage(glow,tip[0]-18,tip[1]-18,36,36);
 }
 if(step===3&&mycAge>4.3&&!reduced){const r=lines[Math.floor((mycAge-4.3)*.5)%lines.length],k=((mycAge-4.3)*.5)%1,q=r.points[Math.min(r.points.length-1,Math.floor(k*(r.points.length-1)))];mg.drawImage(glow,q[0]-14,q[1]-14,28,28);}
}
$('.afterglow').innerHTML=`<canvas class="after-field"></canvas>${brand}<h1>Intelligence that<br><em>follows through.</em></h1><h1>Let care<br><em>keep moving.</em></h1><div class="after-sign">ALOHA ROBOTICS / INVISIBLE CONNECTIVITY</div><img class="after-art" src="${asset('bliss')}" alt="Cio, connected and current">`;
const al=O.canvas($('.after-field')),ag=al.ctx;
function drawAfter(){
 al.clear();for(let i=0;i<11;i++){ag.beginPath();for(let x=-50;x<=2000;x+=10){const y=850+i*19+Math.sin(x/510+total*.13+i*.06)*78;x===-50?ag.moveTo(x,y):ag.lineTo(x,y);}ag.strokeStyle=`rgba(148,241,195,${.035+i*.006})`;ag.lineWidth=1;ag.stroke();}
}
function cueChanged(c){
 clearAnimation();scene=c.scene;step=c.step;age=0;crt=false;
 if(scene==='showcase'){show.dataset.step=step;show.classList.remove('crt');mood(step===0?0:Math.min(5,step-1),false,c.instant);if(step===0&&!c.instant){animate($('.device-phone'),[{transform:'translateX(250px) rotateY(-65deg) rotateZ(12deg) scale(.6)',opacity:0},{transform:'translateX(90px) rotateY(-16deg) rotateZ(5deg)',opacity:1}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});sound('whoosh',.65,.045,true);}}
 if(scene==='constellation')boardStep(step,c.instant);
 if(scene==='mycelium')setMyc(step,c.instant||reduced);
 if(scene==='afterglow'){$$('.afterglow h1').forEach((e,i)=>e.classList.toggle('on',i===step));sound('success',.04);}
}
document.addEventListener('astra:cue',e=>cueChanged(e.detail));
O.ticker.add(dt=>{
 if(O.paused)return;age+=dt;total+=dt;
 if(scene==='showcase'&&step===7){if(reduced){mood(3,true);}else if(age<1.7)mood(Math.floor(age*(11+age*17))%6,true);else if(!crt){crt=true;show.classList.add('crt');sound('crtOff',.26);}if(age>2.7&&!window.ASTRA.getState().auto)window.ASTRA.next();}
 if(scene==='constellation')drawSwarm(dt);
 if(scene==='mycelium')drawMyc(dt);
 if(scene==='afterglow')drawAfter();
});
window.CONSTELLATION.metrics=()=>({inspected,selected:{id:selected.id,from:selected.from,to:selected.to},alarm:context.blocks.length>0,scouts:agents.length});
cueChanged(window.ASTRA.cues[window.ASTRA.getState().cue]);
