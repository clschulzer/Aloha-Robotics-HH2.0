// Sequential visual and interaction review for one version. No external packages.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const slug=process.argv[2]||'01-ember';
const output=path.resolve('ASTRA/versions',slug,'research/previews');
const url=`http://127.0.0.1:8766/ASTRA/versions/${slug}/`;
const ws=new WebSocket('ws://127.0.0.1:9229/session');
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
let id=0,context;const pending=new Map(),logs=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.type==='error'?p.j(new Error(JSON.stringify(m))):p.r(m.result);}}else logs.push(m);};
const call=(method,params={})=>new Promise((r,j)=>{const n=++id,t=setTimeout(()=>j(new Error(method+' timed out')),30000);pending.set(n,{r,j,t});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('script.evaluate',{expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`,target:{context},awaitPromise:true});if(r.type==='exception')throw new Error(JSON.stringify(r));return JSON.parse(r.result.value);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async name=>{const r=await call('browsingContext.captureScreenshot',{context,origin:'viewport',format:{type:'image/png'}});await fs.writeFile(path.join(output,name+'.png'),Buffer.from(r.data,'base64'));};
const key=async k=>{await call('input.performActions',{context,actions:[{type:'key',id:'keyboard',actions:[{type:'keyDown',value:k},{type:'keyUp',value:k}]}]});};
const report={version:slug,url,cues:[],checks:[],consoleErrors:[]};
try{
 await call('session.new',{capabilities:{alwaysMatch:{browserName:'firefox'}}});
 await call('network.setCacheBehavior',{cacheBehavior:'bypass'});
 await call('session.subscribe',{events:['log.entryAdded']});
 ({context}=await call('browsingContext.create',{type:'tab'}));
 await call('browsingContext.setViewport',{context,viewport:{width:1440,height:810},devicePixelRatio:1});
 await call('browsingContext.navigate',{context,url,wait:'complete'});
 await ev('document.fonts.ready.then(()=>true)');await wait(500);
 await fs.mkdir(output,{recursive:true});await shot('00-launch');
 const cues=await ev('window.ASTRA.cues');
 assert.ok(cues.length>10);assert.equal(cues[0].at,0);assert.ok(cues.at(-1).at<180);
 for(let n=1;n<cues.length;n++){
   await ev(`window.ASTRA.go(${n})`);await wait(cues[n].scene==='calendar'?1300:900);
   const s=await ev('window.ASTRA.getState()');assert.equal(s.cue,n);
   const collisions=await ev(`(window.PITCH.layoutPairs||[]).flatMap(([sa,sb])=>{const a=document.querySelector(sa),b=document.querySelector(sb);if(!a||!b||!a.closest('.scene.active')||!b.closest('.scene.active'))return[];const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top?[sa+' overlaps '+sb]:[];})`);
   assert.deepEqual(collisions,[],cues[n].title+' layout');
   const absent=await ev('[...document.images,...[...document.querySelectorAll("iframe")].flatMap(f=>[...f.contentDocument.images])].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)');assert.deepEqual(absent,[]);
   if(cues[n].scene==='demo'){
     const inside=await ev('document.querySelector("#product").contentWindow.DEMO.getState()');
     const wanted=await ev(`window.PITCH.demoSteps[${cues[n].step}]`);
     assert.equal(inside.scene,wanted[0]);assert.equal(inside.step,wanted[1]);
   }
   const name=`${String(n).padStart(2,'0')}-${cues[n].scene}-${cues[n].step}`;
   await shot(name);report.cues.push({n,...cues[n]});console.log(slug,name);
 }
 await key('\uE012');assert.equal((await ev('window.ASTRA.getState()')).cue,cues.length-2);
 await key('n');assert.equal(await ev('document.querySelector("#notes").hidden'),false);
 await key('n');assert.equal(await ev('document.querySelector("#notes").hidden'),true);
 await key('s');const soundOff=await ev('window.ASTRA.getState().sfx');await key('s');assert.notEqual(await ev('window.ASTRA.getState().sfx'),soundOff);
 await key('p');const paused=await ev('window.ASTRA.getState()');await wait(450);assert.equal((await ev('window.ASTRA.getState()')).elapsed,paused.elapsed);
 await key('p');await key('\uE011');assert.equal((await ev('window.ASTRA.getState()')).elapsed,0);assert.equal(await ev('document.querySelector("#launch").hidden'),false);
 const progressCue=await ev('window.PITCH.demoSteps ? window.ASTRA.cues.findIndex(c=>c.scene==="demo"&&window.PITCH.demoSteps[c.step][0]===11) : -1');
 if(progressCue>=0){
   await ev(`window.ASTRA.go(${progressCue})`);await wait(400);await ev('window.ASTRA.pause(true)');await wait(80);
   const pct=await ev('document.querySelector("#product").contentDocument.querySelector("#pct").textContent');
   await wait(450);assert.equal(await ev('document.querySelector("#product").contentDocument.querySelector("#pct").textContent'),pct);
   await ev('window.ASTRA.pause(false)');await wait(400);
   assert.notEqual(await ev('document.querySelector("#product").contentDocument.querySelector("#pct").textContent'),pct);
   await ev('window.ASTRA.reset()');report.checks.push('Embedded product timers pause and resume');
 }
 if(await ev('!!window.ENGINEERING')){
   const blocked=await ev('window.ASTRA.cues.findIndex(c=>c.scene==="gates"&&c.step===2)');
   const allowed=await ev('window.ASTRA.cues.findIndex(c=>c.scene==="gates"&&c.step===3)');
   await ev(`window.ASTRA.go(${blocked})`);assert.equal(await ev('document.querySelector(".gate-button").disabled'),true);
   await ev(`window.ASTRA.go(${allowed})`);await wait(150);
   assert.equal(await ev('window.ENGINEERING.metrics().starts'),0);
   const p=await ev('(()=>{const r=document.querySelector(".gate-button").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()');
   await call('input.performActions',{context,actions:[{type:'pointer',id:'gate-mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:Math.round(p.x),y:Math.round(p.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
   assert.equal(await ev('window.ENGINEERING.metrics().starts'),1);
   assert.equal(await ev('document.querySelector(".gate-button").textContent'),'SIMULATION STARTED');
   await ev('window.ASTRA.reset()');assert.equal(await ev('window.ENGINEERING.metrics().starts'),0);
   report.checks.push('Blocked gate disables button; trusted human click starts only eligible local simulation; reset clears it');
 }
 report.checks.push('All cues render','All image assets load','Previous navigation','Notes toggle','Optional sound toggle','Pause freezes cue clock','Home resets launcher');
 report.consoleErrors=logs.filter(e=>e.method==='log.entryAdded'&&e.params.level==='error').map(e=>e.params.text);
 assert.deepEqual(report.consoleErrors,[]);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack;report.consoleErrors=logs.filter(e=>e.method==='log.entryAdded'&&e.params.level==='error').map(e=>e.params.text);console.error(report.consoleErrors);throw e;}
finally{await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'review.json'),JSON.stringify(report,null,2));try{if(context)await call('browsingContext.close',{context});await call('session.end');}catch{}ws.close();}
