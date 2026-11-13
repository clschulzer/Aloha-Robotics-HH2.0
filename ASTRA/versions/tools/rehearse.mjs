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
 const p=await ev('(()=>{const r=document.querySelector("#preview").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
 await call('input.performActions',{context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:Math.round(p.x),y:Math.round(p.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
 const began=performance.now();
 await ev('(()=>{window.__fps={frames:0,start:performance.now()};function tick(){window.__fps.frames++;requestAnimationFrame(tick)}requestAnimationFrame(tick);return true;})()');
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
   const name=`${String(i).padStart(2,'0')}-${cues[i].scene}-${cues[i].step}`;
   await shot(name);report.observations.push({cue:i,scene:s.scene,step:s.step,elapsed:s.elapsed,filmTime:s.film?.currentTime});
   console.log(slug,name,s.elapsed.toFixed(2));
 }
 let s;do{await wait(150);s=await ev('window.ASTRA.getState()');}while(s.elapsed<180);
 await wait(600);assert.equal((await ev('window.ASTRA.getState()')).elapsed,180);
 await shot('final-hold');
 report.averageFps=await ev('window.__fps.frames/((performance.now()-window.__fps.start)/1000)');
 report.wallSeconds=(performance.now()-began)/1000;
 report.consoleErrors=logs.filter(x=>x.method==='log.entryAdded'&&x.params.level==='error').map(x=>x.params.text);
 assert.deepEqual(report.consoleErrors,[]);report.result='passed';console.log('PASS',slug,report.wallSeconds.toFixed(2),'seconds',report.averageFps.toFixed(1),'fps');
}catch(e){report.result='failed';report.error=e.stack;throw e;}
finally{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'rehearsal.json'),JSON.stringify(report,null,2));try{if(context)await call('browsingContext.close',{context});await call('session.end');}catch{}ws.close();}
