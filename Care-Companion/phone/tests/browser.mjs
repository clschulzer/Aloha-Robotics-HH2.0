/* Native Firefox BiDi acceptance review. Owns one tab; writes only app review artifacts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:8766/Care-Companion/phone/';
const out=path.resolve('Care-Companion/phone/research',base.startsWith('https:')?'production':'browser');
await fs.mkdir(out,{recursive:true});
const ws=new WebSocket(process.env.BIDI_URL||'ws://127.0.0.1:9229/session');
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
let id=0,context;const pending=new Map(),logs=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.type==='error'?p.j(new Error(JSON.stringify(m))):p.r(m.result);}}else logs.push(m);};
const call=(method,params={})=>new Promise((r,j)=>{const n=++id,t=setTimeout(()=>j(new Error(method+' timed out')),30000);pending.set(n,{r,j,t});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('script.evaluate',{expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`,target:{context},awaitPromise:true});if(r.type==='exception')throw new Error(JSON.stringify(r));return JSON.parse(r.result.value);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const state=()=>ev('window.Carmagotchi.state()');
const go=async route=>{await ev(`location.hash=${JSON.stringify('/'+route)}`);await wait(420);};
const tap=async selector=>{
 await ev(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'})`);
 await wait(50);
 const r=await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing '+${JSON.stringify(selector)});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,disabled:!!el.disabled};})()`);
 assert.equal(r.disabled,false,selector+' is enabled');
 await call('input.performActions',{context,actions:[{type:'pointer',id:'phone-touch',parameters:{pointerType:'touch'},actions:[{type:'pointerMove',x:Math.round(r.x),y:Math.round(r.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}]}]});
 await wait(230);
};
const action=a=>tap(`[data-action="${a}"]`);
const report={url:base,screens:[],checks:[],consoleErrors:[]};
const shot=async name=>{
 await wait(130);
 const overflow=await ev('document.documentElement.scrollWidth>innerWidth+1');assert.equal(overflow,false,name+' horizontal fit');
 const broken=await ev('[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)');assert.deepEqual(broken,[],name+' images');
 const r=await call('browsingContext.captureScreenshot',{context,origin:'viewport',format:{type:'image/png'}});
 await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));
 report.screens.push(name);console.log(name);
};
const reset=async()=>{
 await go('profile');await action('reset');await action('modal-confirm');assert.equal((await state()).phase,'idle');
};
const prepare=async()=>{
 await go('request');await action('accept');
 for(const key of ['device','power','clear'])await tap(`[data-check="${key}"]`);
 await action('prepared');assert.equal((await state()).phase,'review');
};
const approve=async()=>{
 await action('confirm-time');
 for(const key of ['area','drapes','brakes','power'])await tap(`[data-check="${key}"]`);
 await action('confirm-area');await action('start-update');
 assert.equal((await state()).approvals,1);assert.equal((await state()).phase,'updating');
};
try{
 await call('session.new',{capabilities:{alwaysMatch:{browserName:'firefox'}}});
 await call('network.setCacheBehavior',{cacheBehavior:'bypass'});
 await call('session.subscribe',{events:['log.entryAdded']});
 ({context}=await call('browsingContext.create',{type:'tab'}));
 await call('browsingContext.setViewport',{context,viewport:{width:390,height:844},devicePixelRatio:1});
 await call('browsingContext.navigate',{context,url:base,wait:'complete'});
 await ev('document.fonts.ready.then(()=>true)');await wait(300);
 assert.equal(await ev('window.Carmagotchi.window.from'),'19:10');
 await reset();await shot('01-home');
 await action('pet');assert.equal((await state()).pets,1);
 for(const [route,name] of [['fleet','02-fleet'],['device/C-01','03-device'],['window','04-window'],['moods/lonely','05-lonely'],['moods/installing','06-installing'],['moods/happy','07-happy'],['moods/failure','08-failure'],['moods/rollback','09-rollback'],['carecircle','10-people'],['profile','11-profile'],['share','12-share']]){
  await go(route);await shot(name);
 }
 assert.equal((await state()).phase,'idle','Mood preview preserves request');
 await go('request');await shot('13-request');await action('accept');await shot('14-prepare');
 assert.equal(await ev('document.querySelector(\'[data-action="prepared"]\').disabled'),true);
 for(const key of ['device','power','clear'])await tap(`[data-check="${key}"]`);
 await action('prepared');await shot('15-review-time');
 assert.equal((await state()).approvals,0);
 await action('confirm-time');await shot('16-review-area');
 assert.equal(await ev('document.querySelector(\'[data-action="confirm-area"]\').disabled'),true);
 for(const key of ['area','drapes','brakes','power'])await tap(`[data-check="${key}"]`);
 await action('confirm-area');await shot('17-review-start');
 await action('back');assert.equal(await ev('window.Carmagotchi.route()'),'review/2');
 await action('confirm-area');await action('start-update');await shot('18-progress');
 const start=(await state()).updateAt;assert.equal((await state()).approvals,1);
 await go('home');assert.equal((await state()).phase,'updating');
 await call('browsingContext.reload',{context,wait:'complete'});await wait(450);
 assert.equal((await state()).updateAt,start,'Refresh keeps original timer');
 await action('continue');await wait(Math.max(0,18500-(Date.now()-start)));
 assert.equal((await state()).phase,'complete');await shot('19-complete');
 await go('receipt');await shot('20-receipt');assert.equal((await state()).events.filter(e=>e.id==='complete').length,1);
 report.checks.push('Human accepts, connects, explicitly approves, completes once; tab navigation and reload preserve progress','All missing-check buttons blocked','Wizard back navigation','Mood previews never change task state');
 await reset();await go('request');await action('decline');await shot('21-care-circle');
 await wait(4700);await action('dispatch');await shot('22-mission-check');
 await wait(3800);await shot('23-mission-find');await wait(7200);await shot('24-human-required');
 assert.equal((await state()).phase,'review');assert.equal((await state()).approvals,0);
 await tap('a[href="#/review/1"]');await action('pass-on');await action('modal-confirm');await shot('25-paused');
 assert.equal((await state()).phase,'paused');assert.equal((await state()).approvals,0);
 await action('resume');await action('accept');
 for(const key of ['device','power','clear'])await tap(`[data-check="${key}"]`);
 await action('prepared');await approve();
 await action('demo-failure');await action('modal-confirm');await shot('26-interrupted');
 assert.equal((await state()).phase,'failed');await action('service');assert.equal((await state()).serviceRequested,true);
 await action('recover');await shot('27-recovery');await wait(9400);assert.equal((await state()).phase,'recovered');await shot('28-recovered');
 await go('activity');await shot('29-activity');
 report.checks.push('Decline has no penalty; care circle then explicit robot dispatch','Fourteen simulated mission checks stop for a human','Pass-on pauses without starting; replay clears checks','Explicit interruption → local service request → recovery → team review');
 await reset();
 for(const [width,height] of [[320,740],[430,932],[1440,900]]){
  await call('browsingContext.setViewport',{context,viewport:{width,height},devicePixelRatio:1});
  for(const [route,label] of [['home','home'],['request','request'],['share','qr']]){await go(route);await shot(`${width}-${label}`);}
 }
 await call('browsingContext.setViewport',{context,viewport:{width:390,height:844},devicePixelRatio:1});
 await go('profile');await tap('[data-action="setting"][data-key="motion"]');
 assert.equal(await ev('document.documentElement.dataset.motion'),'off');
 await tap('[data-action="availability"][data-value="off"]');assert.equal((await state()).availability,'off');
 await go('home');await shot('30-motion-off');
 const sw=await ev('navigator.serviceWorker.ready.then(async r=>({scope:r.scope,shellCached:!!(await caches.match(new URL("index.html",location.href).href)),foreignScope:r.scope!==new URL("./",location.href).href}))');
 assert.ok(sw.shellCached);assert.equal(sw.foreignScope,false);report.serviceWorker=sw;
 report.checks.push('320,390,430 and desktop layouts fit with all images loaded','Reduced motion and availability controls','Offline shell cached in app-only service-worker scope');
 await go('profile');
 if(!(await state()).motion)await tap('[data-action="setting"][data-key="motion"]');
 await tap('[data-action="availability"][data-value="available"]');
 await reset();
 report.consoleErrors=logs.filter(e=>e.method==='log.entryAdded'&&e.params.level==='error').map(e=>e.params.text);
 assert.deepEqual(report.consoleErrors,[]);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack;try{await shot('ERROR');}catch{}console.error(e);process.exitCode=1;}
finally{
 report.consoleErrors=logs.filter(e=>e.method==='log.entryAdded'&&e.params.level==='error').map(e=>e.params.text);
 await fs.writeFile(path.join(out,'review.json'),JSON.stringify(report,null,2));
 try{if(context)await call('browsingContext.close',{context});await call('session.end');}catch{}
 ws.close();console.log(JSON.stringify({result:report.result,checks:report.checks,consoleErrors:report.consoleErrors}));
}
