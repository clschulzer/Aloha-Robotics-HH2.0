// Capture actual browser animation phases, sequentially. Use after the full rehearsal.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const slug=process.argv[2],specs=process.argv.slice(3).map(s=>{const [scene,step]=s.split(':');return{scene,step:Number(step)};});
if(!slug||!specs.length)throw new Error('Usage: node motion.mjs <folder> scene:step ...');
const output=path.resolve('ASTRA/versions',slug,'research/motion'),ws=new WebSocket('ws://127.0.0.1:9229/session');
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
let id=0,context;const pending=new Map(),logs=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.type==='error'?p.j(new Error(JSON.stringify(m))):p.r(m.result);}}else logs.push(m);};
const call=(method,params={})=>new Promise((r,j)=>{const n=++id;pending.set(n,{r,j});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('script.evaluate',{expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`,target:{context},awaitPromise:true});if(r.type==='exception')throw new Error(JSON.stringify(r));return JSON.parse(r.result.value);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const report={version:slug,captures:[],errors:[]};
try{
 await call('session.new',{capabilities:{alwaysMatch:{browserName:'firefox'}}});await call('session.subscribe',{events:['log.entryAdded']});
 ({context}=await call('browsingContext.create',{type:'tab'}));
 await call('browsingContext.setViewport',{context,viewport:{width:1440,height:810},devicePixelRatio:1});
 await call('browsingContext.navigate',{context,url:`http://127.0.0.1:8766/ASTRA/versions/${slug}/`,wait:'complete'});
 await ev('document.fonts.ready.then(()=>true)');await wait(500);await fs.mkdir(output,{recursive:true});
 for(const spec of specs){
  const n=await ev(`window.ASTRA.cues.findIndex(c=>c.scene===${JSON.stringify(spec.scene)}&&c.step===${spec.step})`);
  assert.ok(n>1,'Use a non-film cue with a preceding cue');
  await ev(`window.ASTRA.go(${n-1})`);await wait(150);await ev('window.ASTRA.next()');
  const start=performance.now();
  for(const ms of [100,550,1100,2200,3800]){
   await wait(Math.max(0,ms-(performance.now()-start)));
   assert.equal((await ev('window.ASTRA.getState()')).cue,n);
   const image=await call('browsingContext.captureScreenshot',{context,origin:'viewport',format:{type:'image/png'}});
   const filename=`${spec.scene}-${spec.step}-${String(ms).padStart(4,'0')}.png`;
   await fs.writeFile(path.join(output,filename),Buffer.from(image.data,'base64'));report.captures.push({scene:spec.scene,step:spec.step,milliseconds:ms,filename});
  }
  console.log(slug,spec.scene,spec.step,'motion captured');
 }
 report.errors=logs.filter(m=>m.method==='log.entryAdded'&&m.params.level==='error').map(m=>m.params.text);assert.deepEqual(report.errors,[]);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack;throw e;}
finally{await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'review.json'),JSON.stringify(report,null,2));try{if(context)await call('browsingContext.close',{context});await call('session.end');}catch{}ws.close();}
