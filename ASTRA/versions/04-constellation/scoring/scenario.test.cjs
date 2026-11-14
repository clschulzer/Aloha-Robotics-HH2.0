const test=require('node:test'),assert=require('node:assert/strict');
const G=require('./golden.js'),D=require('./day.js');
const devices=D.DEVICES.filter(d=>['C-01','C-02','C-03','C-04','C-05','C-08'].includes(d.id));
const ctx={now:D.NOW,horizon:D.HORIZON,rate:D.EMERGENCY_RATE,confirmers:D.CONFIRMERS,robotBusy:[],blocks:[]};
test('the emergency replaces the proposal before authorization',()=>{
 const before=G.golden(devices,ctx).best,after=G.golden(devices,{...ctx,now:D.ALARM.at,blocks:[D.ALARM]}).best;
 assert.ok(before&&after);assert.notEqual(before.id,after.id);
 assert.equal(G.evaluate(devices,devices.find(d=>d.id===before.id),before.from,{...ctx,blocks:[D.ALARM]}).reason,'locked');
 assert.equal(after.status,'ok');
});
test('each selected backup is free for the complete maintenance and recovery window',()=>{
 for(const c of [ctx,{...ctx,blocks:[D.ALARM]}]){
  const best=G.golden(devices,c).best,backup=devices.find(d=>d.id===best.backup);
  assert.ok(backup);assert.notEqual(backup.id,best.id);
  assert.ok(!G.busyOf(backup,c).some(b=>b.from<best.guardEnd&&b.to>best.from));
  assert.ok(G.confirmerAt(best.from,c));
 }
});
test('without a confirmer the attractive night window is still rejected',()=>{
 assert.equal(G.golden(devices,{...ctx,confirmers:[]}).best,null);
});
