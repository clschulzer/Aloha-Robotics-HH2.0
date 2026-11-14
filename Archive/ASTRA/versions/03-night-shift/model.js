/* A readable theatre board over the team's original planner. All cases are synthetic.
   This adds actual replacement-calendar checks; it does not turn a usage proxy into a probability. */
(() => {
  const data={...window.IAData,DEVICES:structuredClone(window.IAData.DEVICES)}, planner=window.IAPlanner;
  const t=(h,m=0)=>h*60+m;
  const make=(from,to,label)=>({from,to,saal:'',fach:label});
  const cases=[
    [[8,0,9,40,'Fracture fixation'],[10,5,11,50,'Hip fixation'],[12,20,14,0,'Trauma list'],[14,25,16,20,'Revision surgery'],[16,45,18,20,'Fracture fixation']],
    [[8,0,10,10,'Knee arthroplasty'],[10,40,12,30,'Hip arthroplasty'],[13,15,15,15,'Revision knee'],[15,45,18,30,'Orthopaedic list']],
    [[8,0,9,20,'Wrist fixation'],[9,45,11,30,'Trauma list'],[12,10,14,0,'Tibial fixation'],[14,30,16,10,'Fracture fixation'],[16,40,18,30,'Trauma list']],
    [[8,15,10,30,'Vascular repair'],[11,0,13,30,'Endovascular list'],[14,0,17,0,'Vascular repair']],
    [[8,30,10,0,'Urology'],[10,30,12,0,'Stone treatment'],[13,0,15,20,'Urology list']],
    [[8,40,10,20,'Emergency case'],[12,10,13,40,'Emergency case'],[16,30,18,0,'Emergency case']]
  ];
  const ids=['C-01','C-02','C-03','C-04','C-05','C-08'];
  const devices=ids.map((id,i)=>{const d=data.DEVICES.find(d=>d.id===id);d.busy[0]=cases[i].map(c=>make(t(c[0],c[1]),t(c[2],c[3]),c[4]));return d;});
  const cancelled=make(t(19),t(22,20),'Trauma list');
  const now=t(18,40), ctx={now,blocked:{},robotBusy:[],weekendDays:data.WEEKEND};
  const before=structuredClone(devices);before[2].busy[0].push(cancelled);
  const eligible=devices.filter(d=>d.update).map(d=>({device:d,window:planner.findWindow(d,0,ctx)})).filter(x=>x.window.ok);
  eligible.sort((a,b)=>a.window.risk-b.window.risk || a.device.update.frist-b.device.update.frist || a.window.from-b.window.from);
  const winner=eligible.find(x=>devices.some(other=>other.id!==x.device.id&&!other.ausfall&&!other.update&&!other.busy[0].some(b=>b.from<x.window.to+planner.RULES.PUFFER&&b.to>x.window.from)));
  if(!winner)throw new Error('The synthetic scenario has no eligible golden window');
  const backup=devices.find(d=>d.id!==winner.device.id&&!d.update&&!d.ausfall&&!d.busy[0].some(b=>b.from<winner.window.to+planner.RULES.PUFFER&&b.to>winner.window.from));
  const format=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  window.DAY={devices,before,cancelled,now,ctx,winner,backup,format,source:'Synthetic case plan · original IAPlanner rules',rules:planner.RULES};
})();
