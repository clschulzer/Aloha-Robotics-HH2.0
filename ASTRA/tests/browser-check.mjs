// Real-time, full-film Firefox WebDriver BiDi rehearsal. Node 24, no packages.
// Start the local server and Firefox endpoint described in research/VALIDATION.md.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const base = path.dirname(fileURLToPath(import.meta.url));
const output = process.env.ASTRA_TEST_OUTPUT || path.resolve(base, '../research/previews');
const url = process.env.ASTRA_TEST_URL || 'http://127.0.0.1:8765/';
const socket = new WebSocket(process.env.ASTRA_BIDI_URL || 'ws://127.0.0.1:9229/session');
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map(), logs = [];
socket.onmessage = ({data}) => {
  const result = JSON.parse(data);
  if (result.id) {
    const job = pending.get(result.id);
    if (job) { clearTimeout(job.timeout); pending.delete(result.id); result.type === 'error' ? job.reject(new Error(JSON.stringify(result))) : job.resolve(result.result); }
  } else logs.push(result);
};
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id, timeout = setTimeout(() => { pending.delete(n); reject(new Error(`Timeout: ${method}`)); }, 30000);
  pending.set(n, {resolve, reject, timeout}); socket.send(JSON.stringify({id:n, method, params}));
});
let context, session;
const evaluate = async expression => {
  const result = await command('script.evaluate', {expression:`(async()=>JSON.stringify(await (${expression}))??'null')()`, target:{context}, awaitPromise:true});
  if (result.type === 'exception') throw new Error(JSON.stringify(result.exceptionDetails));
  return JSON.parse(result.result.value);
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const screenshot = async name => {
  const {data} = await command('browsingContext.captureScreenshot', {context, origin:'viewport', format:{type:'image/png'}});
  await fs.writeFile(path.join(output, `${name}.png`), Buffer.from(data, 'base64'));
};
const click = async selector => {
  const p = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await command('input.performActions', {context, actions:[{type:'pointer', id:'mouse', parameters:{pointerType:'mouse'}, actions:[
    {type:'pointerMove',x:Math.round(p.x),y:Math.round(p.y),duration:0},{type:'pointerDown',button:0},{type:'pointerUp',button:0}
  ]}]});
};
const report = {url, viewport:'1440×810', kind:'Real-time full-film 180-second rehearsal', observations:[]};
try {
  session = await command('session.new', {capabilities:{alwaysMatch:{browserName:'firefox'}}});
  await command('network.setCacheBehavior', {cacheBehavior:'bypass'});
  await command('session.subscribe', {events:['log.entryAdded']});
  ({context} = await command('browsingContext.create', {type:'tab'}));
  await command('browsingContext.setViewport', {context, viewport:{width:1440,height:810},devicePixelRatio:1});
  await command('browsingContext.navigate', {context,url,wait:'complete'});
  await fs.mkdir(output,{recursive:true});
  await evaluate('document.fonts.ready.then(()=>true)');
  await screenshot('00-launch');
  await click('#timed-launch');
  const began = performance.now();
  const marks = [
    [2,0,0,'01-original-film'],[28.9,0,0,'02-film-finale'],[32,0,0,'03-introducing'],
    [35.2,1,0,'04-lonely'],[41.2,1,1,'05-manic'],[47.2,1,2,'06-updating'],
    [53.2,1,3,'07-bliss'],[59.2,1,4,'08-failure'],[64.2,1,5,'09-rollback'],
    [71.1,2,0,'10-dark-shift'],[75,2,1,'11-invisible-connectivity'],
    [80,3,0,'12-surgery-schedule'],[87,3,1,'13-scout-swarm'],[100,3,2,'14-risk-rejection'],
    [114,3,3,'15-golden-window'],[122,3,4,'16-human-decision'],
    [128,4,0,'17-architecture-inputs'],[133,4,1,'18-architecture-agents'],
    [143,4,2,'19-architecture-policy'],[153,4,3,'20-power-data'],
    [163,4,4,'21-verification-return'],[168,5,0,'22-machine-ready'],[176,5,1,'23-back-to-patient'],
    [180.1,5,1,'24-final-hold']
  ];
  for (const [time, index, step, name] of marks) {
    let state;
    do {
      await delay(100);
      state = await evaluate('window.CarmDeck.getState()');
      if ((performance.now()-began)/1000 > 215) throw new Error(`Rehearsal stalled at ${JSON.stringify(state)}`);
    } while (state.elapsed < Math.min(time,180));
    assert.equal(state.index,index,`Scene at ${time}s`);
    assert.equal(state.step,step,`Step at ${time}s`);
    if (time === 2) {
      assert.equal(state.film.muted,false,'Original audio is enabled');
      assert.equal(state.film.paused,false,'Film is playing');
      assert.ok(Math.abs(state.film.duration-30.442667)<0.05,'Full current movie');
      await evaluate('window.CarmDeck.next()');
      const guarded = await evaluate('window.CarmDeck.getState()');
      assert.equal(guarded.auto,true,'Next cannot interrupt full film');
      assert.equal(guarded.introDone,false,'No premature title');
    }
    if (time === 32) {
      assert.equal(state.introDone,true,'Native movie ended before live title');
      assert.ok(state.film.currentTime>=30.4,'Full video reached its actual end');
    }
    const resources = await evaluate('(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src))()');
    assert.deepEqual(resources,[],'Every original character and visual asset loads');
    await screenshot(name);
    report.observations.push({time:Math.round(state.elapsed*100)/100,index,step,name,filmTime:state.film.currentTime});
    console.log(`${name} · ${state.elapsed.toFixed(2)}s · scene ${index+1}.${step+1}`);
  }
  await delay(500);
  assert.equal((await evaluate('window.CarmDeck.getState()')).elapsed,180,'Final hold stops at 180 seconds');
  report.wallSeconds = Math.round((performance.now()-began)/10)/100;
  report.consoleErrors = logs.filter(m=>m.method==='log.entryAdded'&&m.params.level==='error').map(m=>m.params.text);
  assert.deepEqual(report.consoleErrors,[],'No browser console errors');
  report.result = 'passed';
  await fs.writeFile(path.join(output,'rehearsal.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`PASS: full real-time rehearsal (${report.wallSeconds}s wall clock).`);
} finally {
  if(context) await command('browsingContext.close',{context}).catch(()=>{});
  if(session) await command('session.end').catch(()=>{});
  socket.close();
}
