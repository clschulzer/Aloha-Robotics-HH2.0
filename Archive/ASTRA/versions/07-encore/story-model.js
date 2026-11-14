/* Christian's cancellation story, evaluated by the team's rule core and OPUS scorer.
   Synthetic operational records only. No patient records, production endpoints or device commands. */
(function (root) {
  'use strict';
  const G = typeof module !== 'undefined' && module.exports ? require('./engine/golden.js') : root.AlohaGolden;
  const D = typeof module !== 'undefined' && module.exports ? require('./engine/day.js') : root.AlohaDay;
  const clone = value => JSON.parse(JSON.stringify(value));
  const devices = clone(D.DEVICES).filter(d => ['C-01','C-02','C-03','C-04','C-05','C-08'].includes(d.id));
  const cio = devices.find(d => d.id === 'C-03');
  // The cancelled booking replaces the evening add-on in the source fixture.
  cio.cases = cio.cases.filter(c => c.from < 19 * 60);
  const cancelled = {from:1170,to:1350,or:'OR 3',proc:'SPINAL FIXATION',cancelledAt:1152};
  const beforeDevices = clone(devices);
  beforeDevices.find(d => d.id === 'C-03').cases.push(clone(cancelled));
  const context = {
    now:1164, horizon:{from:420,to:1410}, rate:clone(D.EMERGENCY_RATE),
    blocks:[], robotBusy:[], minP:G.MIN_P,
    confirmers:[{role:'Authorized on-call team',from:1020,to:1440}]
  };
  const before = G.golden(beforeDevices, context);
  const after = G.golden(devices, context);
  // Christian: priority is determined by the need for service, not by the mood's animation.
  // The scorer determines the best eligible time within that selected device's calendar.
  const winner = after.perDevice['C-03'];
  if (!winner) throw new Error('The illustrated cancellation has no eligible window.');
  const backup = devices.find(d => d.id === winner.backup);
  function gate(overrides = {}) {
    return G.startGate(winner, Object.assign({
      freigabe:true,umgebungFrei:true,imEinsatz:false,alarm:false
    }, overrides));
  }
  function checkStory() {
    const noPeople = Object.assign({}, context, {confirmers:[]});
    const alarm = Object.assign({}, context, {blocks:[{area:['TRAUMA'],from:1164,to:1410,label:'POLYTRAUMA'}]});
    return [
      {name:'Cancellation opens Cio’s evening',pass:!before.perDevice['C-03'] && !!winner},
      {name:'Result is the highest-ranked eligible Cio window',pass:after.ranked.find(w=>w.id==='C-03').from===winner.from},
      {name:'Backup stays free through recovery margin',pass:!G.busyOf(backup,context).some(b=>b.from<winner.guardEnd&&b.to>winner.from)},
      {name:'Emergency hold removes Cio’s proposal',pass:!G.golden(devices,alarm).perDevice['C-03']},
      {name:'No confirmer means no proposal',pass:!G.golden(devices,noPeople).best},
      {name:'Missing authorization blocks the start gate',pass:gate().ok&&!gate({freigabe:false}).ok},
      {name:'Recalled package blocks the start',pass:!gate({paketZurueckgerufen:true}).ok}
    ];
  }
  const api = {G,D,devices,beforeDevices,context,cancelled,before,after,winner,backup,gate,checkStory};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CARE = api;
})(typeof window !== 'undefined' ? window : globalThis);
