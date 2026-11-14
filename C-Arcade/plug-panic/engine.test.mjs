import test from 'node:test';
import assert from 'node:assert/strict';
import {RULES,MAP,createGame,command,step,pathBetween,floor,near,windowFor,gate,isEmergency,nearestJob,panelFor} from './engine.mjs';

function advance(s,seconds){for(let time=0;time<seconds-1e-8;time+=.05)s=step(s,Math.min(.05,seconds-time));return s;}
function start(){return command(createGame(),'start');}
function travel(s,id){
  s=command(s,'target',{id});
  for(let n=0;n<1000&&s.path.length;n++)s=step(s,.05);
  assert.equal(near(s),id);return s;
}
function connect(s){s=command(s,'connect-down');s=advance(s,1.3);s=command(s,'connect-up');assert.equal(s.connection?.connected,true);return s;}
function finishAndDeliver(s,id){
  s=travel(s,id);
  // Wait for a sufficiently wide safe window; the real player sees this on the device.
  for(let n=0;n<1200&&!gate(s,id,true).ok;n++)s=step(s,.05);
  assert.equal(gate(s,id,true).ok,true);
  s=connect(s);s=command(s,'approve',{confirmed:true});s=advance(s,RULES.install+.1);
  assert.ok(s.bag.some(x=>x.device===id));s=travel(s,'dock');return command(s,'upload');
}

test('new shift is idle until the player starts, and starts fully stocked',()=>{
  const ready=createGame();assert.equal(ready.phase,'ready');assert.deepEqual(step(ready,1),ready);
  const s=command(ready,'start');assert.equal(s.phase,'playing');assert.equal(s.power,2);assert.equal(s.packages,2);assert.equal(near(s),'dock');
});
test('routes follow walkable orthogonal corridors and never cut through an operating room',()=>{
  const route=pathBetween(MAP.dock,{x:2,y:3});assert.equal(route.length,9);
  let prev=MAP.dock;for(const p of route){assert.ok(floor(p.x,p.y));assert.equal(Math.abs(prev.x-p.x)+Math.abs(prev.y-p.y),1);prev=p;}
  assert.deepEqual(pathBetween(MAP.dock,{x:4,y:3}),[]);
});
test('tap-to-route genuinely moves over time; retargeting mid-segment does not teleport',()=>{
  let s=command(start(),'target',{id:'cio'});s=step(s,.1);assert.notDeepEqual(s.bot,MAP.dock);assert.notEqual(near(s),'cio');
  const position=structuredClone(s.bot);s=command(s,'target',{id:'cora'});assert.deepEqual(s.bot,position);
  for(let i=0;i<200&&s.path.length;i++)s=step(s,.05);assert.equal(near(s),'cora');
});
test('keyboard movement stops at walls and releases without continuing through the map',()=>{
  let s=start();s=command(s,'direction',{dx:1,dy:0});s=advance(s,1);assert.deepEqual(s.bot,MAP.dock);
  s=command(s,'direction',{dx:0,dy:-1});s=step(s,.1);s=command(s,'release-direction');s=advance(s,1);
  assert.deepEqual(s.bot,{x:6,y:7});assert.equal(s.direction,null);
});
test('short holds cancel and never consume supplies or silently approve',()=>{
  let s=travel(start(),'cio');s=command(s,'connect-down');s=advance(s,.5);assert.ok(s.connection.charge>0);
  s=command(s,'connect-up');assert.equal(s.connection,null);assert.equal(s.approvals,0);assert.equal(s.power,2);
  s=command(s,'approve',{confirmed:true});assert.equal(s.approvals,0);
});
test('full hold stops at a separate human approval, even when time continues',()=>{
  let s=connect(travel(start(),'cio'));assert.equal(panelFor(s).kind,'approve');assert.equal(s.approvals,0);
  s=advance(s,2);assert.equal(s.devices[0].status,'hungry');assert.equal(s.approvals,0);
  s=command(s,'approve');assert.equal(s.approvals,0);
  s=command(s,'approve',{confirmed:'true'});assert.equal(s.approvals,0);
  s=command(s,'approve',{confirmed:true});assert.equal(s.approvals,1);assert.equal(s.devices[0].status,'updating');
  assert.equal(s.power,1);assert.equal(s.packages,1);
});
test('duplicate approval and upload actions cannot create duplicate jobs or receipts',()=>{
  let s=connect(travel(start(),'cio'));s=command(s,'approve',{confirmed:true});s=command(s,'approve',{confirmed:true});
  assert.equal(s.approvals,1);assert.equal(s.devices[0].job,1);assert.equal(s.power,1);
  s=advance(s,5.1);assert.equal(s.bag.length,1);s=advance(s,.5);assert.equal(s.bag.length,1);
  s=travel(s,'dock');s=command(s,'upload');const score=s.score;
  s=command(s,'upload');assert.equal(s.receipts,1);assert.equal(s.score,score);
});
test('quiet windows reserve both the install and recovery margin',()=>{
  let s=start();s.elapsed=RULES.quiet-RULES.install-RULES.recovery+.1;
  assert.equal(windowFor(s,'cio').quiet,true);assert.equal(gate(s,'cio').code,'short');
  s.elapsed=22;assert.equal(gate(s,'cio').code,'busy');
  s.elapsed=30;assert.equal(gate(s,'cio',true).ok,true);
});
test('Fritzi is protected; no command sequence starts maintenance on the backup',()=>{
  let s=travel(start(),'fritzi');assert.equal(panelFor(s).kind,'reserve');
  assert.equal(gate(s,'fritzi').code,'reserve');s=command(s,'connect-down');s=advance(s,2);
  s=command(s,'approve',{confirmed:true});assert.equal(s.connection,null);assert.equal(s.approvals,0);
});
test('emergency arrival cancels an unapproved connection and blocks new maintenance',()=>{
  let s=start();s.elapsed=31;s.bot={x:2,y:4};s=connect(s);assert.equal(s.connection.connected,true);
  s=advance(s,3);assert.equal(isEmergency(s),true);assert.equal(s.connection,null);
  assert.equal(gate(s,'cio').code,'emergency');s=command(s,'approve',{confirmed:true});
  assert.equal(s.approvals,0);s=command(s,'connect-down');assert.equal(s.connection,null);
  s=advance(s,10);assert.equal(isEmergency(s),false);assert.ok(s.events.some(e=>e.type==='emergency'&&e.reserveProtected===true));
});
test('an explicitly approved update keeps its power and completes during an emergency',()=>{
  let s=start();s.elapsed=31;s.bot={x:2,y:4};s=connect(s);s=command(s,'approve',{confirmed:true});
  const power=s.power;s=advance(s,5.1);
  assert.equal(isEmergency(s),true);assert.equal(s.devices[0].status,'happy');assert.equal(s.bag.length,1);
  assert.equal(s.power,power);assert.equal(s.approvals,1);
});
test('only one C-arm updates at a time while the separate reserve remains available',()=>{
  let s=connect(travel(start(),'cio'));s=command(s,'approve',{confirmed:true});
  assert.equal(gate(s,'cora',true).code,'active');
  assert.equal(s.events.find(e=>e.type==='approved').reserve,'fritzi');
});
test('moving away invalidates the physical connection and approval cannot follow remotely',()=>{
  let s=connect(travel(start(),'cio'));s=command(s,'target',{id:'dock'});assert.equal(s.connection,null);
  s=command(s,'approve',{confirmed:true});assert.equal(s.approvals,0);
});
test('a stale golden window cannot be approved after it has become too short',()=>{
  let s=connect(travel(start(),'cio'));s=advance(s,13);
  assert.equal(s.connection,null);s=command(s,'approve',{confirmed:true});assert.equal(s.approvals,0);
});
test('supplies are consumed at approval; restocking is possible only at the dock',()=>{
  let s=start();s.power=0;assert.equal(gate(s,'cio').code,'stock');assert.equal(nearestJob(s),'dock');
  s=travel(s,'cio');s=command(s,'upload');assert.equal(s.power,0);
  s=travel(s,'dock');s=command(s,'upload');assert.equal(s.power,2);assert.equal(s.packages,2);
});
test('install completion is not a win: logs must be collected and uploaded home',()=>{
  let s=start();s.goal=1;s=connect(travel(s,'cio'));s=command(s,'approve',{confirmed:true});
  s=command(s,'target',{id:'dock'});s=advance(s,5.1);
  assert.equal(s.devices[0].status,'logs');assert.equal(s.receipts,0);assert.equal(s.phase,'playing');
  s=command(s,'upload');assert.equal(s.receipts,0);
  s=travel(s,'cio');s=step(s,.05);assert.equal(s.bag.length,1);assert.equal(s.receipts,0);
  s=travel(s,'dock');s=command(s,'upload');assert.equal(s.phase,'won');assert.equal(s.receipts,1);
  assert.equal(s.uploaded.length,1);assert.ok(s.score>100);
});
test('pausing freezes the shift, movement, and updates, and cancels an unfinished hold',()=>{
  let s=travel(start(),'cio');s=command(s,'connect-down');s=advance(s,.4);s=command(s,'pause');
  assert.equal(s.connection,null);const saved=structuredClone(s);assert.deepEqual(advance(s,20),saved);
  s=command(s,'approve',{confirmed:true});assert.equal(s.approvals,0);
  s=command(s,'resume');assert.equal(s.phase,'playing');s=connect(s);s=command(s,'approve',{confirmed:true});
  s=command(s,'pause');const updating=structuredClone(s);assert.deepEqual(advance(s,10),updating);
  s=command(s,'resume');s=advance(s,5.1);assert.equal(s.bag.length,1);
});
test('missed deadline loses cleanly, cannot score after shift, and replay resets all progress',()=>{
  let s=start();s.duration=1;s=advance(s,2);assert.equal(s.phase,'lost');
  const ended=structuredClone(s);assert.deepEqual(command(s,'upload'),ended);assert.deepEqual(step(s,.1),ended);
  s=command(s,'restart');assert.equal(s.phase,'playing');assert.equal(s.elapsed,0);assert.equal(s.score,0);assert.equal(s.receipts,0);assert.equal(s.approvals,0);
});
test('releasing a direction during pause cannot leave movement latched after resume',()=>{
  let s=start();s=command(s,'direction',{dx:0,dy:-1});s=step(s,.1);
  s=command(s,'pause');s=command(s,'release-direction');assert.equal(s.direction,null);
  s=command(s,'resume');s=advance(s,2);
  // Finish the already-entered corridor segment; never start another without new input.
  assert.deepEqual(s.bot,{x:6,y:7});assert.equal(s.path.length,0);
});
test('a whole five-receipt shift is winnable using real movement, waits and explicit approvals',()=>{
  let s=start();
  for(const id of ['cio','cora','bogdan','arcus','cio'])s=finishAndDeliver(s,id);
  assert.equal(s.phase,'won');assert.equal(s.receipts,5);assert.equal(s.approvals,5);
  assert.ok(s.elapsed<120);assert.ok(s.score>500);assert.equal(s.uploaded.length,5);
  assert.equal(new Set(s.uploaded).size,5);assert.ok(s.events.some(e=>e.type==='emergency'));
  const ended=structuredClone(s);assert.deepEqual(advance(s,5),ended);
});
test('game actions and ticks are immutable, finite dt is required, and large tick gaps are bounded',()=>{
  const s=start(),saved=structuredClone(s);const next=step(s,10);
  assert.deepEqual(s,saved);assert.equal(next.elapsed,.25);
  assert.deepEqual(step(s,NaN),s);assert.deepEqual(step(s,Infinity),s);assert.deepEqual(step(s,-1),s);
  command(s,'target',{id:'cio'});assert.deepEqual(s,saved);
});
