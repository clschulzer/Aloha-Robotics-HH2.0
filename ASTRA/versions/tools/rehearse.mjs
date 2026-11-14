// Real-time rehearsal. Full media, trusted launch gesture, every timed cue and final hold.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const slug=process.argv[2]||'01-ember',out=path.resolve('ASTRA/versions',slug,'research/rehearsal');
const ws=new WebSocket('ws://127.0.0.1:9229/session');
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
let id=0,context;const pending=new Map(),logs=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.type==='error'?p.j(new Error(JSON.stringify(m))):p.r(m.result);}}else logs.push(m);};
const call=(method,params={})=>new Promise((r,j)=>{const n=++id,t=setTimeout(()=>j(new Error(method+' timeout')),30000);pending.set(n,{r,j,t});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('script.evaluate',{expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`,target:{context},awaitPromise:true});if(r.type==='exception')throw new Error(JSON.stringify(r));return JSON.parse(r.result.value);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async name=>{const r=await call('browsingContext.captureScreenshot',{context,origin:'viewport',format:{type:'image/png'}});await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
const report={version:slug,kind:'Native playback; real-time 180-second rehearsal',observations:[]};
try{
 await call('session.new',{capabilities:{alwaysMatch:{browserName:'firefox'}}});
 await call('network.setCacheBehavior',{cacheBehavior:'bypass'});
 await call('session.subscribe',{events:['log.entryAdded']});
 ({context}=await call('browsingContext.create',{type:'tab'}));
 await call('browsingContext.setViewport',{context,viewport:{width:1440,height:810},devicePixelRatio:1});
 await call('browsingContext.navigate',{context,url:`http://127.0.0.1:8766/ASTRA/versions/${slug}/`,wait:'complete'});
 await ev('document.fonts.ready.then(()=>true)');await fs.mkdir(out,{recursive:true});
 const cues=await ev('window.ASTRA.cues');
 if(cues[0].scene!=='film')report.kind='Real-time 180-second engineering rehearsal; no film in this cut';
 const p=await ev('(()=>{const r=document.querySelector("#preview").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
 await call('input.performActions',{context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:Math.round(p.x),y:Math.round(p.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
 const began=performance.now();
 await ev(`(()=>{
  window.__fps={frames:0,start:performance.now(),byScene:{}};
  let scene=window.ASTRA.getState().scene,last=performance.now();
  document.addEventListener('astra:cue',e=>{scene=e.detail.scene;});
  function tick(now){
   const f=window.__fps;f.frames++;
   const s=f.byScene[scene]??={frames:0,milliseconds:0};s.frames++;s.milliseconds+=now-last;last=now;
   requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);return true;
 })()`);
 for(let i=0;i<cues.length;i++){
   const time=cues[i].at+Math.min(1.4,((cues[i+1]?.at??180)-cues[i].at)/2);
   let s;
   do{await wait(120);s=await ev('window.ASTRA.getState()');if((performance.now()-began)>220000)throw new Error('Rehearsal stalled: '+JSON.stringify(s));}while(s.elapsed<time);
   assert.equal(s.cue,i,`Cue ${i} at ${time}s`);
   if(i===0&&cues[0].scene==='film'){
     assert.equal(s.film.muted,false);assert.equal(s.film.paused,false);assert.ok(Math.abs(s.film.duration-30.442667)<.05);
     await ev('window.ASTRA.next()');assert.equal((await ev('window.ASTRA.getState()')).cue,0);assert.equal((await ev('window.ASTRA.getState()')).auto,true);
   }
   if(i===1&&cues[0].scene==='film')assert.ok(s.film.currentTime>=30.4);
   if(cues[i].scene==='crew'&&(cues[i].step===2||cues[i].step===3)){
     const demo=await ev('window.COMEDY?.metrics?.() || null');
     if(demo){
       assert.equal(demo.gate.ok,cues[i].step===3,'The illustrated start must respect the actual rule gate');
       assert.equal(demo.simulatedStart,cues[i].step===3,'Only the illustrated human tap starts the demonstration');
     }
   }
   if(cues[i].scene==='gates'){
     const engineering=await ev('window.ENGINEERING?.metrics?.() || null');
     if(engineering){assert.equal(engineering.gate.ok,cues[i].step===3);assert.equal(engineering.starts,0,'An eligible gate must not automatically start');}
   }
   if(cues[i].scene==='demo'){
     const encore=await ev('window.ENCORE?.metrics?.() || null');
     if(encore&&cues[i].step>=13){
       assert.equal(encore.product.approvals,cues[i].step>=16?1:0,'Only the single illustrated human decision records approval');
       assert.equal(encore.product.proposal.from,encore.proposal.from,'The phone must carry the calculated window');
       assert.equal(encore.product.proposal.to,encore.proposal.to,'The report must carry the same update interval');
     }
   }
   const name=`${String(i).padStart(2,'0')}-${cues[i].scene}-${cues[i].step}`;
   await shot(name);report.observations.push({cue:i,scene:s.scene,step:s.step,elapsed:s.elapsed,filmTime:s.film?.currentTime});
   console.log(slug,name,s.elapsed.toFixed(2));
 }
 let s;do{await wait(150);s=await ev('window.ASTRA.getState()');}while(s.elapsed<180);
 await wait(600);assert.equal((await ev('window.ASTRA.getState()')).elapsed,180);
 await shot('final-hold');
 report.averageFps=await ev('window.__fps.frames/((performance.now()-window.__fps.start)/1000)');
 report.sceneFps=await ev('Object.fromEntries(Object.entries(window.__fps.byScene).map(([scene,v])=>[scene,Math.round(v.frames/(v.milliseconds/1000)*10)/10]))');
 const scoring=await ev('window.CONSTELLATION?.metrics?.() || null');
 if(scoring){
  assert.ok(scoring.inspected>100,'The visible swarm must actually evaluate candidates');
  const expected=await ev('window.CONSTELLATION.after.best');
  assert.equal(scoring.selected.id,expected.id);assert.equal(scoring.selected.from,expected.from);
  report.scoring=scoring;
 }
 const comedy=await ev('window.COMEDY?.metrics?.() || null');
 if(comedy){
  assert.ok(comedy.checks>100,'Scouts must call the actual planner');
  assert.equal(comedy.startEvents.length,1,'One illustrated human start in one rehearsal');
  assert.equal(comedy.gate.ok,true);assert.equal(comedy.simulatedStart,true);
  report.comedy=comedy;
 }
 const engineering=await ev('window.ENGINEERING?.metrics?.() || null');
 if(engineering){
   assert.ok(engineering.evaluations>0);assert.equal(engineering.starts,0);
   assert.ok(engineering.displayedChecks.length>=8);assert.ok(engineering.displayedChecks.every(c=>c.pass));
   report.engineering=engineering;
 }
 const encore=await ev('window.ENCORE?.metrics?.() || null');
 if(encore){
   assert.ok(encore.evaluations>100,'The final-cut swarm must evaluate actual candidates');
   assert.ok(encore.checks.length>=7&&encore.checks.every(c=>c.pass),'Cancellation, backup, emergency and authorization scenarios');
   assert.equal(encore.product.approvals,1,'Exactly one illustrated approval during the entire show');
   assert.equal(encore.product.approved,true);
   assert.equal(encore.product.proposal.from,encore.proposal.from);
   assert.equal(encore.product.proposal.to,encore.proposal.to);
   report.encore=encore;
 }
 report.wallSeconds=(performance.now()-began)/1000;
 report.consoleErrors=logs.filter(x=>x.method==='log.entryAdded'&&x.params.level==='error').map(x=>x.params.text);
 assert.deepEqual(report.consoleErrors,[]);report.result='passed';console.log('PASS',slug,report.wallSeconds.toFixed(2),'seconds',report.averageFps.toFixed(1),'fps');
}catch(e){report.result='failed';report.error=e.stack;throw e;}
finally{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'rehearsal.json'),JSON.stringify(report,null,2));try{if(context)await call('browsingContext.close',{context});await call('session.end');}catch{}ws.close();}
