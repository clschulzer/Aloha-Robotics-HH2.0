import './presentation.mjs';
const K=window.EngineeringKernel,O=window.OPUS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const brand='<div class="smallbrand">ALOHA</div>';
const fmt=K.G.hh,w=K.result.best,device=K.D.DEVICES.find(d=>d.id===w.id),backup=K.D.DEVICES.find(d=>d.id===w.backup);
const icons={
 calendar:'<rect x="7" y="10" width="34" height="31" rx="5"/><path d="M7 20h34M16 5v11M32 5v11M15 28h7m4 0h7m-18 7h7"/>',
 device:'<rect x="5" y="7" width="38" height="29" rx="5"/><path d="M17 43h14m-7-7v7M12 21h7l3-8 5 15 4-7h6"/>',
 history:'<path d="M10 8v33h32M16 32l6-11 6 6 12-17"/><circle cx="22" cy="21" r="2"/>',
 alarm:'<path d="M8 33h32l-5-8V16a11 11 0 0 0-22 0v9ZM20 39c0 6 8 6 8 0"/><path d="M5 12 2 22M43 12l3 10"/>',
 rules:'<path d="m24 3 17 8v14c0 12-17 20-17 20S7 37 7 25V11Z"/><path d="m15 24 7 7 13-15"/>',
 human:'<circle cx="24" cy="14" r="8"/><path d="M8 43v-7c0-15 32-15 32 0v7"/>',
 cloud:'<path d="M11 35c-14-1-10-21 3-19C18 0 42 5 39 20c11 0 12 15 0 15Z"/><path d="M17 24h14"/>',
 key:'<circle cx="16" cy="19" r="10"/><path d="m23 26 19 16m-9-8 5-5m-1 9 5-5"/>',
 packet:'<path d="m24 4 17 10v22L24 46 7 36V14Z"/><path d="m7 14 17 11 17-11M24 25v21m-7-37 18 11"/>'
};
const icon=n=>`<svg viewBox="0 0 48 48" aria-hidden="true">${icons[n]||icons.rules}</svg>`;
let scene='',step=0,age=0,instant=false,anims=[],seen=0,evals=0,proofResults=[];
function sound(name,...args){if(window.ASTRA.getState().sfx)O.audio.sfx[name]?.(...args);}
function animate(el,frames,opts){if(reduce||instant)return;const a=el.animate(frames,opts);anims.push(a);return a;}
function rise(el,delay=0){animate(el,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:700,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});}

$('.circuit-scene').innerHTML=brand+`<span class="tech-tag">ENGINEERING / ALOHA ROBOTICS</span><h1 class="circuit-head">Rules before<br><em>autonomy.</em></h1><p class="circuit-desc">One explainable decision.<br>A deliberate human handoff.</p><div class="circuit-stack">${[['Structured inputs','calendar',420],['Deterministic rules','rules',210],['Human authorization','human',0]].map(([n,i,y])=>`<div class="circuit-layer" style="--y:${y}px"><div>${n}<br><small>${i==='rules'?'EXECUTABLE CORE':i==='human'?'EXPLICIT PERMISSION':'PLAN · STATE · HISTORY'}</small></div>${icon(i)}</div>`).join('')}</div><p class="tech-foot live-tag">THE IMPLEMENTATION, AND THE SYSTEM AROUND IT.</p>`;

const matrix=K.D.DEVICES.flatMap(d=>{
 const all=K.result.all.filter(c=>c.id===d.id);
 return Array.from({length:22},(_,i)=>all[Math.round(i*(all.length-1)/21)]);
});
const top=K.result.ranked.filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,6);
const inputs=[['Theatre plan','ROOM · TIME · NEED','calendar'],['Device state','VERSION · NEED · POWER','device'],['Usage history','UNPLANNED USE','history'],['Alarm + roster','RESERVE · CONFIRMER','alarm']];
const kernelPaths=['M442 439 C495 439 505 620 555 620','M442 535 C495 535 505 620 555 620','M442 631 C495 631 505 620 555 620','M442 727 C495 727 505 620 555 620','M1327 620H1440'];
$('.kernel-scene').innerHTML=brand+`<span class="tech-tag">RUNNING IN THIS BROWSER / SYNTHETIC INPUTS</span><h1 class="tech-title"></h1><p class="tech-sub"></p><svg class="kernel-line" viewBox="0 0 1920 1080">${kernelPaths.map(p=>`<path d="${p}"/><path class="lit" d="${p}" pathLength="1"/>`).join('')}</svg><div class="kernel-inputs">${inputs.map(([label,detail,i])=>`<div class="kernel-input">${icon(i)}<div><b>${label}</b><small>${detail}</small></div></div>`).join('')}</div><div class="kernel-panel"><small class="kernel-panel-label">planner.js → golden.js</small><div class="kernel-matrix">${matrix.map(c=>`<i class="candidate" data-status="${c.status}" title="${c.id} · ${fmt(c.from)} · ${c.reason}"></i>`).join('')}</div><div class="kernel-ranks">${top.map(c=>`<div class="rank-row" style="--w:${(c.p/top[0].p*100).toFixed(2)}%"><span>${K.D.DEVICES.find(d=>d.id===c.id).name}</span><b>${fmt(c.from)}–${fmt(c.to)}</b></div>`).join('')}</div><div class="kernel-filter"></div><div class="kernel-key"><span>eligible</span><span>risk threshold</span><span>rejected</span></div></div><div class="kernel-card"><small>STRUCTURED PROPOSAL</small><h2>${fmt(w.from)}<br>— ${fmt(w.to)}</h2><div class="kernel-field"><span>device</span><b>${device.name}</b></div><div class="kernel-field"><span>backup</span><b>${backup.name}</b></div><div class="kernel-field"><span>physical help</span><b>${w.needsRobot?'required':'not required'}</b></div></div><div class="kernel-output">JSON → explanation / template</div><p class="kernel-foot"></p>`;
const kernelTitles=['Data becomes a decision.','Reject first.','Rank what survives.','An inspectable result.'];
const kernelSubs=['JavaScript · pure functions · no hidden network dependency','A filter before a score.','Usage · emergency pull · case overrun','A proposal with facts attached.'];
const kernelFeet=['Read only the operational fields needed for the decision.','No collision. Enough data. Someone to confirm. A free replacement.','Relative model score · illustrative assumptions, not a clinical forecast.','The explanation layer cannot change a time, a device or a rule.'];
const cells=$$('.candidate'),kPaths=$$('.kernel-line .lit');
function kernelStep(n){
 $('.tech-title').textContent=kernelTitles[n];$('.tech-sub').textContent=kernelSubs[n];$('.kernel-foot').textContent=kernelFeet[n];
 $('.kernel-panel-label').textContent=n<2?'planner.js → golden.js':'BEST WINDOW PER DEVICE / MODEL ORDER';
 $('.kernel-key').classList.toggle('hide',n>=2);seen=0;K.evaluate();evals+=K.result.all.length;
 cells.forEach(c=>c.classList.toggle('seen',instant||n>=2));kPaths.forEach((p,i)=>p.style.strokeDashoffset=(instant||n>0||i===4&&n>=2)?'0':'1');
 const s=$('#stage').getBoundingClientRect(),scale=O.stageScale;
 $$('.kernel-input').forEach((e,i)=>{const r=e.getBoundingClientRect(),y=(r.top+r.height/2-s.top)/scale,d=`M442 ${y} C495 ${y} 505 620 555 620`;kPaths[i].setAttribute('d',d);kPaths[i].previousElementSibling.setAttribute('d',d);});
 if(n===1)sound('grow',.025,.6);if(n===2){sound('chime',.045,540);$$('.rank-row').forEach((e,i)=>rise(e,i*65));}
 if(n===3)rise($('.kernel-card'));
}

const gateLabels=['No active procedure','No emergency alarm','Package checked + current','Window approved','Surroundings clear','No arm motion'];
const gateTruth=v=>[!v.imEinsatz,!v.alarm,v.paketGeprueft&&!v.paketZurueckgerufen,v.freigabe,v.umgebungFrei,v.art!=='arm'];
$('.gates-scene').innerHTML=brand+`<span class="tech-tag">planner.canStart / ACTUAL RULE FUNCTION</span><h1 class="gate-title">A proposal cannot press start.</h1><p class="gate-sub">Every condition must pass. The human decision stays explicit.</p><svg class="gate-wires" viewBox="0 0 1920 1080">${gateLabels.map((_,i)=>`<path class="gate-wire" d="M630 ${419+i*84} C733 ${419+i*84} 738 626 845 626"/>`).join('')}<path class="gate-out" d="M1070 626H1310"/></svg><div class="gate-inputs">${gateLabels.map(label=>`<div class="gate-check"><i>✓</i><span>${label}</span></div>`).join('')}</div><div class="gate-node"><b>AND</b><small>BLOCKED</small></div><div class="gate-button-wrap"><div class="gate-person">${icon('human')}</div><button class="gate-button" disabled>HUMAN CONFIRMATION</button><p>Local demonstration only</p></div><p class="gate-reason"></p>`;
const reasons=['Device in use. Proposal blocked.','Alarm active. Proposal blocked.','Package recalled. Proposal blocked.','Eligible for a human decision. Nothing has started.'];
function gateStep(n){
 const result=K.inspectGate(n),truth=gateTruth(K.variants[n]);
 $$('.gate-check').forEach((e,i)=>{e.classList.toggle('bad',!truth[i]);e.querySelector('i').textContent=truth[i]?'✓':'×';});
 $$('.gate-wire').forEach((e,i)=>e.classList.toggle('bad',!truth[i]));
 $('.gate-node').classList.toggle('good',result.ok);$('.gate-node small').textContent=result.ok?'ELIGIBLE':'BLOCKED';
 $('.gate-reason').textContent=reasons[n];$('.gate-button').disabled=!result.ok;$('.gate-button').textContent='HUMAN CONFIRMATION';
 // Actual card positions remain the source of wire geometry after fonts settle.
 const s=$('#stage').getBoundingClientRect(),scale=O.stageScale;
 $$('.gate-check').forEach((e,i)=>{const r=e.getBoundingClientRect(),y=(r.top+r.height/2-s.top)/scale;$$('.gate-wire')[i].setAttribute('d',`M630 ${y} C733 ${y} 738 626 845 626`);});
 sound(result.ok?'chime':'tick',result.ok?.035:.05,result.ok?570:250);
}
$('.gate-button').onclick=e=>{e.stopPropagation();const r=K.start();if(r.started){$('.gate-button').textContent='SIMULATION STARTED';$('.gate-reason').textContent='A recorded human click. No device command was sent.';sound('tap',.08);}};

const zoneRoutes=[
 [1,'M440 588H555'],
 [2,'M1290 500H1380Q1414 500 1414 466H1491'],
 [2,'M1655 573V724','gold'],
 [3,'M1820 802H1848V955Q1848 977 1826 977H923V802','gold']
];
$('.zones-scene').innerHTML=brand+`<span class="tech-tag">PROPOSED PILOT / SYSTEM BOUNDARIES</span><h1 class="zone-title"></h1><p class="zone-sub"></p><svg class="zone-lines" viewBox="0 0 1920 1080">${zoneRoutes.map(([n,p,cls])=>`<path class="zone-track" d="${p}"/><path class="zone-route ${cls||''}" d="${p}" pathLength="1" data-phase="${n}"/>`).join('')}</svg><div class="zone-box vendor-zone"><small>APPROVED VENDOR ROUTE</small>${icon('cloud')}<h2>teamplay Fleet<br>Remote services</h2><p>Packages · status</p></div><div class="zone-box hospital-zone"><small>HOSPITAL NODE / PROPOSED SERVICE</small><h2>Python · FastAPI</h2><div class="stack-grid"><div class="stack-part built">Rule core<small>RUNNING PROTOTYPE LOGIC</small></div><div class="stack-part">Explain / template<small>NO START AUTHORITY</small></div><div class="stack-part">SQLite journal<small>LOCAL STATE + HISTORY</small></div><div class="stack-part">SSE → browser<small>LIVE OPERATIONAL VIEW</small></div></div></div><div class="zone-box robot-zone"><small>ROBOT ADAPTER</small><h2>ROS 2 · Nav2</h2><p>Mission + transport</p></div><div class="zone-box endpoint-zone"><h2>C-arm endpoint</h2><p>Windows IoT LTSC*</p></div><div class="zone-label vendor">OUTBOUND HTTPS<br>via hospital proxy</div><div class="zone-label robot">mTLS<br>scoped mission</div><div class="zone-transport">APPROVED HANDOFF<br>identity · power · package</div><div class="zone-label logs">STATUS + PERMITTED TECHNICAL LOGS</div><div class="tech-packet zone-packet"></div><p class="tech-foot">* Target workstation stack; exact interfaces require manufacturer validation.</p>`;
const zpaths=$$('.zone-route').map(p=>({p,phase:+p.dataset.phase,length:p.getTotalLength(),last:-1}));
const zoneTitles=['Local decisions.','One approved route in.','Transport is not trust.','A returned result.'];
const zoneSubs=['Keep the rule core and operational data inside the hospital.','Packages are data. The cloud does not issue a start command.','A scoped mission and a manufacturer-approved endpoint.','The handoff closes with evidence, or an owned exception.'];
function zoneStep(n){$('.zone-title').textContent=zoneTitles[n];$('.zone-sub').textContent=zoneSubs[n];sound('grow',.021,.65);}
function zones(t){
 let active=null,progress=0;
 for(const r of zpaths){
  const delay=r.phase===2&&r.p.classList.contains('gold')?.8:0;
  const u=r.phase<step?1:r.phase===step?Math.max(0,Math.min(1,(t-delay)/1.35)):0;
  if(r.last!==u){r.last=u;r.p.style.strokeDashoffset=1-u;}
  if(u>0&&u<1){active=r;progress=u;}
 }
 const p=$('.zone-packet');if(active&&!reduce&&!instant){const pos=active.p.getPointAtLength(active.length*progress);p.style.cssText=`left:${pos.x-5}px;top:${pos.y-5}px;opacity:1`;}else p.style.opacity='0';
}

$('.attest-scene').innerHTML=brand+`<span class="tech-tag">PROPOSED AUTHORIZATION CONTRACT</span><h1 class="chain-title"></h1><p class="chain-sub"></p><div class="chain-document"><small>PERMISSION ENVELOPE</small><div class="chain-row"><span>device</span><b>${w.id}</b></div><div class="chain-row"><span>package</span><b>hash + signature</b></div><div class="chain-row plan-version"><span>planVersion</span><b>v3</b></div><div class="chain-row"><span>person</span><b>hospital identity</b></div><div class="chain-row"><span>valid until</span><b>window expiry</b></div></div><div class="chain-seals">${[['packet','Manufacturer','PACKAGE ORIGIN'],['key','Hospital','WebAuthn / PKI'],['rules','Endpoint','VERIFY BEFORE ACTING']].map(([i,n,s])=>`<div class="chain-seal">${icon(i)}<b>${n}</b><small>${s}</small></div>`).join('')}</div><p class="chain-outcome"></p><p class="chain-rule">Cache and robot carry the package. They do not become the trust anchor.</p>`;
function attestStep(n){
 $('.chain-title').textContent=n?'A changed plan needs new permission.':'Bind the permission.';
 $('.chain-title').style.fontSize=n?'85px':'98px';
 $('.chain-sub').textContent=n?'The old decision cannot travel into a different window.':'Person + device + package + plan version + expiry';
 $('.plan-version').classList.toggle('invalid',n===1);$('.plan-version b').textContent=n?'v3 → v4':'v3';
 $('.chain-outcome').innerHTML=n?'Previous approval expires.<br>Ask the authorized person again.':'Authentic package.<br>Explicit, scoped permission.';
 $$('.chain-seal').forEach((e,i)=>rise(e,i*170));if(n)sound('tick',.05,310);
}

$('.proof-scene').innerHTML=brand+`<span class="tech-tag">EXECUTABLE CHECKS / SYNTHETIC CASES</span><h1 class="proof-title"></h1><p class="proof-sub"></p><div class="proof-grid"></div><div class="proof-split"><div class="proof-block"><small>RUNS TODAY</small><h2>Workflow.<br>Rules. Replay.</h2><p>Browser presentation and product journey<br>Deterministic planning + start predicate<br>Inspectable synthetic scenarios</p></div><div class="proof-block"><small>VALIDATE NEXT</small><h2>Interfaces.<br>Physical handoff.</h2><p>Hospital and manufacturer adapters<br>Package trust + scoped authorization<br>Power, docking and exception handling</p></div></div><p class="proof-result"></p>`;
function proofStep(n){
 proofResults=K.runChecks();
 $('.proof-title').textContent=n?'One engineering boundary at a time.':'Run it. Break it. Replay it.';
 $('.proof-title').style.fontSize=n?'86px':'98px';$('.proof-sub').textContent=n?'The next layer builds on the same inspectable decision.':'These checks just ran against the code driving this presentation.';
 $('.proof-grid').innerHTML=proofResults.map(r=>`<div class="proof-check ${r.pass?'':'failed'}"><i>${r.pass?'✓':'×'}</i><div><b>${r.label}</b><small>${r.detail}</small></div></div>`).join('');
 $('.proof-result').textContent=n?'Prototype boundary explicit. Integration work scoped.':proofResults.every(r=>r.pass)?'PASS · no rule is delegated to a language model.':'A check failed. Inspect the scenario before proceeding.';
 if(!n)$$('.proof-check').forEach((e,i)=>rise(e,i*120));
}
$('.engineering-close').innerHTML=brand+`<span class="tech-tag">ALOHA ROBOTICS / INVISIBLE CONNECTIVITY</span><h1>An explainable plan.<br><em>An accountable handoff.</em></h1><div class="close-circuit"></div><p class="tech-foot">Built from a rule. Completed by a person.</p>`;

function onCue(c){
 anims.forEach(a=>a.cancel());anims=[];scene=c.scene;step=c.step;age=0;instant=c.instant||reduce;
 if(scene==='circuit'){
  K.reset();evals=0;proofResults=[];
  if(!c.instant)$$('.circuit-layer').forEach((e,i)=>{const y=[420,210,0][i];animate(e,[{opacity:0,transform:`translateY(${y+130}px) rotate(-8deg) skewX(9deg)`},{opacity:1,transform:`translateY(${y}px) rotate(-8deg) skewX(9deg)`}],{duration:1100,delay:i*130,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});});rise($('.circuit-head'));
 }
 if(scene==='kernel')kernelStep(step);
 if(scene==='gates')gateStep(step);
 if(scene==='zones'){zoneStep(step);zones(instant?10:0);}
 if(scene==='attest')attestStep(step);
 if(scene==='proof')proofStep(step);
 if(scene==='engineering-close'){rise($('.engineering-close h1'));animate($('.close-circuit'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1600,easing:'cubic-bezier(.65,0,.2,1)'});sound('chime',.045,480);}
}
document.addEventListener('astra:cue',e=>onCue(e.detail));
O.ticker.add(dt=>{
 if(O.paused)return;age+=dt;
 if(scene==='kernel'){
  if(step===0)kPaths.forEach((p,i)=>p.style.strokeDashoffset=i===4?'1':String(1-Math.min(1,age/(.9+i*.12))));
  if(step===1&&!instant){const upto=Math.min(cells.length,Math.floor(age*45));for(;seen<upto;seen++)cells[seen].classList.add('seen');}
  if(step>=2)kPaths[4].style.strokeDashoffset=String(1-Math.min(1,age/1.05));
 }
 if(scene==='zones')zones(instant?10:age);
});
window.ENGINEERING={K,metrics:()=>({evaluations:evals,...K.metrics,displayedChecks:proofResults}),check:()=>K.runChecks()};
onCue({...window.ASTRA.cues[window.ASTRA.getState().cue],instant:true});
