/* Presentation adapter over the team's unchanged rule core and OPUS scorer.
   All planning inputs are synthetic. It controls no hospital system or robot. */
(function(root){
 const node=typeof module!=='undefined'&&module.exports;
 const P=node?require('./engine/planner.js'):root.IAPlanner;
 const G=node?require('./engine/golden.js'):root.AlohaGolden;
 const D=node?require('./engine/day.js'):root.AlohaDay;
 const ctx={now:D.NOW,horizon:D.HORIZON,rate:D.EMERGENCY_RATE,confirmers:D.CONFIRMERS,blocks:[],robotBusy:[]};
 const evaluate=()=>G.golden(D.DEVICES,ctx),result=evaluate();
 const valid={art:'patch',freigabe:true,umgebungFrei:true,imEinsatz:false,alarm:false,paketGeprueft:true,paketZurueckgerufen:false};
 const variants=[
  {...valid,imEinsatz:true},
  {...valid,alarm:true},
  {...valid,paketZurueckgerufen:true},
  {...valid}
 ];
 let gateIndex=0,starts=0;
 const inspectGate=(i)=>{gateIndex=i;return P.canStart(variants[i]);};
 const start=()=>{const g=P.canStart(variants[gateIndex]);if(!g.ok)return{started:false,reasons:g.gruende};starts++;return{started:true,scope:'local browser simulation'};};
 function runChecks(){
  const again=evaluate(),w=result.best;
  const overlap=(a,b,c,d)=>a<d&&c<b;
  const byId=id=>D.DEVICES.find(d=>d.id===id);
  const noPeople=G.golden(D.DEVICES,{...ctx,confirmers:[]});
  const alarm={area:['TRAUMA'],from:w.from-20,to:w.guardEnd+20,label:'TEST ALARM'};
  const blocked=G.evaluate(D.DEVICES,byId(w.id),w.from,{...ctx,blocks:[alarm]});
  const missing={...byId(w.id),use:null};
  return [
   {label:'Cases remain protected',detail:'All selected windows + recovery margin',pass:result.ranked.every(c=>!byId(c.id).cases.some(b=>overlap(c.from-P.RULES.VORLAUF,c.guardEnd,b.from,b.to)))},
   {label:'Backup remains available',detail:'Entire window + recovery margin',pass:result.ranked.every(c=>c.backup!==c.id&&!byId(c.backup).cases.some(b=>overlap(c.from,c.guardEnd,b.from,b.to)))},
   {label:'Unknown stays unknown',detail:'Missing usage data → no proposal',pass:G.evaluate(D.DEVICES,missing,w.from,ctx).reason==='no-data'},
   {label:'Motion stays supervised',detail:'Motor calibration → on-site only',pass:result.all.filter(c=>c.id==='C-06').every(c=>c.reason==='motion')},
   {label:'Alarm closes the gate',detail:'Planning + start are blocked',pass:blocked.reason==='locked'&&!P.canStart({...valid,alarm:true}).ok},
   {label:'A human is required',detail:'No confirmer → no legal window',pass:noPeople.best===null&&!P.canStart({...valid,freigabe:false}).ok},
   {label:'Recall blocks a start',detail:'A valid old package is not enough',pass:!P.canStart({...valid,paketZurueckgerufen:true}).ok},
   {label:'Decisions are replayable',detail:'Same inputs → same ranked result',pass:JSON.stringify(result.ranked)===JSON.stringify(again.ranked)}
  ];
 }
 const reset=()=>{gateIndex=0;starts=0;};
 const api={P,G,D,ctx,result,variants,inspectGate,start,reset,runChecks,evaluate,get metrics(){return{gateIndex,gate:P.canStart(variants[gateIndex]),starts,best:result.best,checks:runChecks()};}};
 root.EngineeringKernel=api;
 if(node)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
