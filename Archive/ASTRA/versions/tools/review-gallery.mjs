// Final delivery check: responsive gallery, each presenter channel and the embedded final layout.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=path.resolve('ASTRA/versions'),out=path.join(base,'research/delivery');
const ws=new WebSocket('ws://127.0.0.1:9229/session');
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
let id=0;const pending=new Map(),logs=[],contexts=[];
ws.onmessage=({data})=>{
  const m=JSON.parse(data);
  if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.type==='error'?p.j(new Error(JSON.stringify(m))):p.r(m.result);}}
  else logs.push(m);
};
const call=(method,params={})=>new Promise((r,j)=>{
  const n=++id,t=setTimeout(()=>j(new Error(method+' timed out')),30000);
  pending.set(n,{r,j,t});ws.send(JSON.stringify({id:n,method,params}));
});
const ev=async(context,expression)=>{
  const r=await call('script.evaluate',{expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`,target:{context},awaitPromise:true});
  if(r.type==='exception')throw new Error(JSON.stringify(r));
  return JSON.parse(r.result.value);
};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const navigate=async(context,url)=>{
  await call('browsingContext.navigate',{context,url,wait:'complete'});
  await ev(context,'document.fonts.ready.then(()=>true)');await wait(450);
};
const shot=async(context,name)=>{
  const r=await call('browsingContext.captureScreenshot',{context,origin:'viewport',format:{type:'image/png'}});
  await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));
};
const click=async(context,selector)=>{
  const p=await ev(context,`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await call('input.performActions',{context,actions:[{type:'pointer',id:'delivery-mouse',parameters:{pointerType:'mouse'},actions:[
    {type:'pointerMove',x:Math.round(p.x),y:Math.round(p.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}
  ]}]});
};
const report={gallery:{},presenters:[],embedded:[],consoleErrors:[]};
try{
  await fs.mkdir(out,{recursive:true});
  await call('session.new',{capabilities:{alwaysMatch:{browserName:'firefox'}}});
  await call('network.setCacheBehavior',{cacheBehavior:'bypass'});
  await call('session.subscribe',{events:['log.entryAdded']});
  const make=async()=>{const{context}=await call('browsingContext.create',{type:'tab'});contexts.push(context);return context;};
  const gallery=await make();
  await call('browsingContext.setViewport',{context:gallery,viewport:{width:1440,height:1000},devicePixelRatio:1});
  await navigate(gallery,'http://127.0.0.1:8766/ASTRA/versions/');
  const entries=await ev(gallery,'[...document.querySelectorAll("article .cover")].map(a=>({url:a.href,slug:new URL(a.href).pathname.split("/").filter(Boolean).at(-1)}))');
  assert.equal(entries.length,7);
  assert.deepEqual(await ev(gallery,'[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)'),[]);
  assert.ok((await ev(gallery,'document.querySelector(".primary").href')).endsWith('/07-encore/'));
  await shot(gallery,'gallery-desktop');
  await ev(gallery,'window.scrollTo(0,650)');await shot(gallery,'gallery-choices');
  await call('browsingContext.setViewport',{context:gallery,viewport:{width:390,height:844},devicePixelRatio:1});
  await ev(gallery,'window.scrollTo(0,0)');await wait(150);
  assert.ok(await ev(gallery,'document.documentElement.scrollWidth<=innerWidth'),'Mobile gallery must not overflow horizontally');
  await shot(gallery,'gallery-mobile');
  report.gallery={versions:entries.map(e=>e.slug),coversLoaded:true,mobileWidth:390,noHorizontalOverflow:true,recommendation:'07-encore'};

  const stage=await make(),presenter=await make();
  for(const context of[stage,presenter])await call('browsingContext.setViewport',{context,viewport:{width:1440,height:810},devicePixelRatio:1});
  for(const entry of entries){
    await navigate(stage,entry.url);
    await navigate(presenter,`http://127.0.0.1:8766/ASTRA/versions/presenter.html?v=${entry.slug}`);
    const selected=await ev(stage,'window.ASTRA.cues.findIndex(c=>c.scene==="opportunity"&&c.step===2||c.scene==="calendar"&&c.step===2||c.scene==="compute"&&c.step===1)');
    const cue=selected>=2?selected:3;
    await ev(stage,`window.ASTRA.go(${cue})`);await wait(850);
    const s=await ev(stage,'window.ASTRA.getState()');
    assert.equal(await ev(presenter,'document.querySelector("#title").textContent'),s.title,entry.slug+' title synchronization');
    assert.equal(await ev(presenter,'document.querySelector("#note").textContent'),s.notes,entry.slug+' notes synchronization');
    await click(presenter,'#advance');await wait(850);
    assert.equal((await ev(stage,'window.ASTRA.getState()')).cue,cue+1,entry.slug+' presenter advances stage');
    await click(presenter,'#back');await wait(850);
    assert.equal((await ev(stage,'window.ASTRA.getState()')).cue,cue,entry.slug+' presenter goes back');
    if(entry.slug==='07-encore')await shot(presenter,'final-presenter');
    report.presenters.push({version:entry.slug,titleAndNotesMatch:true,next:true,previous:true});
    console.log('Presenter passed',entry.slug);
  }
  // The final stage is still open. Test the copied product's major layout boundaries.
  const cues=await ev(stage,'window.ASTRA.cues');
  for(let i=0;i<cues.length;i++){
    if(cues[i].scene!=='demo')continue;
    await ev(stage,`window.ASTRA.go(${i})`);await wait(950);
    const issues=await ev(stage,`(()=>{
      const w=document.querySelector('#product').contentWindow,d=w.document,root=d.querySelector('#view>.scene');
      const pairs=[['.mood-left','.phone'],['.team-left','.team-right'],['.ps-left','.phone'],['.msn-left','.agent'],['.mission-progress','.msn-body'],['.leave','.audit-list']];
      const visible=e=>{for(let n=e;n&&n.nodeType===1;n=n.parentElement){const c=w.getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0)return false;}return!!e;};
      return pairs.flatMap(([sa,sb])=>{
        const a=root.querySelector(sa),b=root.querySelector(sb);if(!a||!b||!visible(a)||!visible(b))return[];
        const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
        return x.left<y.right-1&&x.right>y.left+1&&x.top<y.bottom-1&&x.bottom>y.top+1?[sa+' overlaps '+sb]:[];
      });
    })()`);
    assert.deepEqual(issues,[],cues[i].title+' embedded layout');
    report.embedded.push({cue:i,title:cues[i].title,result:'passed'});
  }
  report.consoleErrors=logs.filter(m=>m.method==='log.entryAdded'&&m.params.level==='error').map(m=>m.params.text);
  assert.deepEqual(report.consoleErrors,[]);report.result='passed';
  console.log('PASS gallery, seven presenter channels and final embedded layout');
}catch(e){report.result='failed';report.error=e.stack;throw e;}
finally{
  await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'review.json'),JSON.stringify(report,null,2));
  for(const context of contexts)try{await call('browsingContext.close',{context});}catch{}
  try{await call('session.end');}catch{}ws.close();
}
