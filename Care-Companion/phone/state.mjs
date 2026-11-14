/* Local clickdummy state. No network calls, clinical commands, accounts or patient data. */
import './engine/planner.js';
import './engine/golden.js';
import './engine/day.js';

const G = globalThis.AlohaGolden, D = globalThis.AlohaDay;
export const DEVICES = D.DEVICES.filter(d => ['C-01','C-02','C-03','C-04','C-05','C-08'].includes(d.id));
const context = {now:D.NOW, horizon:D.HORIZON, rate:D.EMERGENCY_RATE, confirmers:D.CONFIRMERS, robotBusy:[], blocks:[]};
const answer = G.golden(DEVICES, context).best;
export const WINDOW = Object.freeze({
  device:answer.id, from:G.hh(answer.from), to:G.hh(answer.to), guard:G.hh(answer.guardEnd),
  backup:DEVICES.find(d => d.id === answer.backup).name, backupId:answer.backup,
  duration:G.RULES.DUR, package:'CARM-SEC 2026.11', software:'4.2.1',
  publication:'18:48', request:'18:52', date:'Wednesday, 18 November',
});
export const DURATION = {circle:4500, mission:10500, update:18000, recovery:9000};
export const MOODS = {
  lonely:{name:'Lonely',image:'lonely',bg:'#dbe2ec',color:'#476b9b',quote:'Nobody has connected me for days. Is anyone out there?',state:'No connection · last logs 9 days ago',cta:'Wake me up',data:[['Network','off'],['Last logs','9 days'],['Location','Corridor B']],meaning:'A missing connection. A little attention would go a long way.'},
  hungry:{name:'Hungry',image:'manic',bg:'#ffd6b8',color:'#c64c00',quote:'Plug me in! My security patch is waiting and I am starving.',state:'Unplugged · security patch due',cta:'Feed me power',data:[['Power','unplugged'],['Patch','due'],['Location','Corridor B']],meaning:'There is an update waiting. Hospital data finds the right time.'},
  installing:{name:'Installing',image:'update',bg:'#e8ddff',color:'#7241df',quote:'Installing… whatever you do, don’t pull my plug.',state:'Updating · please don’t unplug',cta:'Watch Cio',data:[['Update','running'],['Power','on'],['Location','Corridor B']],meaning:'An update is in progress. Stable power and an uninterrupted window matter.'},
  happy:{name:'Happy',image:'bliss',bg:'#c3f0ea',color:'#087f73',quote:'All synced. Thanks, team. I feel brand new.',state:'Up to date · connected',cta:'Pet Cio',data:[['Version','4.2.1'],['Network','on'],['Logs','today']],meaning:'Current software, a connection, and fresh logs. A small thank-you is deserved.'},
  failure:{name:'Dead on arrival',image:'failure',bg:'#ffd9d9',color:'#bd2337',quote:'Someone pulled my plug halfway. Call a technician.',state:'Update failed · out of service',cta:'Call service',data:[['Update','failed'],['Status','down'],['Location','Corridor B']],meaning:'Something went wrong. Keep the device out of use and pass it to service.'},
  rollback:{name:'Recovering',image:'rollback',bg:'#e5e0f1',color:'#71588d',quote:'Going back to my last good self. A little patience, please.',state:'Recovery in progress',cta:'Watch recovery',data:[['Recovery','running'],['Image','retained'],['Power','on']],meaning:'Service is restoring the previous version. The team will review the result.'},
};
export const PEOPLE = [
  {name:'Lena',initial:'L',role:'X-ray nurse',status:'You',color:'#ffd6b8'},
  {name:'Tom',initial:'T',role:'X-ray nurse',status:'In surgery',color:'#dce6f5'},
  {name:'Aylin',initial:'A',role:'Medical physics',status:'Off shift',color:'#ddd7ef'},
  {name:'Jonas',initial:'J',role:'X-ray nurse',status:'Busy in OR 2',color:'#d7e9e2'},
  {name:'Mara',initial:'M',role:'X-ray nurse',status:'On break',color:'#ffe8bb'},
  {name:'Ben',initial:'B',role:'X-ray nurse',status:'In surgery',color:'#f0d8db'},
  {name:'Sofia',initial:'S',role:'IT on call',status:'Unavailable',color:'#d7e8ec'},
];
export const CHECKS = [
  ['Approved package','Manufacturer signature in this scenario'],
  ['Checksum','Package integrity'],
  ['Cable packed','Approved connection'],
  ['Charge available','Enough for the mission'],
  ['Last known spot','Empty. Keep looking.'],
  ['Usual parking spot','Check Equipment Room 2'],
  ['Cio found','Visual candidate'],
  ['Docked','Proposed service connection'],
  ['Right machine','Serial + device certificate'],
  ['Woken over the cable','Manufacturer-approved path'],
  ['Area clear','Simulated surroundings check'],
  ['No patient or drapes','Human review still follows'],
  ['Brakes on, arm parked','Scenario device status'],
  ['Stable power','Connection checked'],
];

export function initialState(now=Date.now()) {
  return {
    schema:1, phase:'idle', path:null, checks:{time:false,area:false,drapes:false,brakes:false,power:false},
    prep:{device:false,power:false,clear:false}, circleAt:null,circleReady:false,missionAt:null,updateAt:null,recoveryAt:null,
    approvals:0,serviceRequested:false,reason:'',pets:0,availability:'available',sound:false,motion:true,haptics:true,
    events:[{id:'published',time:WINDOW.publication,title:'A golden window for Cio',detail:`Medical physics published ${WINDOW.from}–${WINDOW.to}. ${WINDOW.backup} stays available.`,kind:'calendar'},
      {id:'request',time:WINDOW.request,title:'Cio needs a hand',detail:'A small request for Cio’s care circle.',kind:'heart'}],
    createdAt:now,
  };
}
const PHASES = ['idle','preparing','circle','mission','review','updating','complete','paused','failed','recovering','recovered'];
export function restoreState(raw,now=Date.now()) {
  try {
    const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!saved || saved.schema !== 1 || !PHASES.includes(saved.phase)) return initialState(now);
    const base=initialState(now), s={...base,...saved,checks:{...base.checks,...saved.checks},prep:{...base.prep,...saved.prep}};
    s.events=Array.isArray(saved.events)?saved.events.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string').slice(-60):base.events;
    if(!Object.values(s.checks).every(v=>typeof v==='boolean')||!Object.values(s.prep).every(v=>typeof v==='boolean'))return base;
    if(!['available','procedure','off'].includes(s.availability)||![null,'human','robot'].includes(s.path))return base;
    if(!Number.isInteger(s.pets)||s.pets<0||s.pets>999||![0,1].includes(s.approvals))return base;
    if(!['sound','motion','haptics','circleReady','serviceRequested'].every(k=>typeof s[k]==='boolean'))return base;
    for(const key of ['circleAt','missionAt','updateAt','recoveryAt']) if(s[key]!==null&&!Number.isFinite(s[key])) return base;
    if(['updating','complete','failed','recovering','recovered'].includes(s.phase)&&(s.approvals!==1||s.updateAt===null))return base;
    if((s.phase==='mission'&&s.missionAt===null)||(s.phase==='circle'&&s.circleAt===null)||(s.phase==='recovering'&&s.recoveryAt===null))return base;
    return reduce(s,{type:'tick'},now);
  } catch { return initialState(now); }
}
function event(s,id,time,title,detail,kind='check') {
  if(!s.events.some(e=>e.id===id))s.events.push({id,time,title,detail,kind});
}
export function progress(s,now=Date.now()) {
  const key=s.phase==='mission'?'mission':s.phase==='updating'?'update':s.phase==='recovering'?'recovery':s.phase==='circle'?'circle':null;
  return key ? Math.min(1,Math.max(0,(now-s[`${key}At`])/DURATION[key])) : (['complete','recovered','review'].includes(s.phase)?1:0);
}
export function canStart(s) {
  return s.phase==='review' && s.availability==='available' && s.checks.time===true &&
    ['area','drapes','brakes','power'].every(k=>s.checks[k]===true) &&
    G.startGate(answer,{freigabe:true,umgebungFrei:true,imEinsatz:false,alarm:false,paketGeprueft:true,paketZurueckgerufen:false}).ok;
}
export function deviceMood(s) {
  return ({updating:'installing',complete:'happy',failed:'failure',recovering:'rollback',recovered:'lonely'})[s.phase] || 'hungry';
}
export function reduce(old,a,now=Date.now()) {
  const s=structuredClone(old);
  switch(a.type) {
    case 'accept':
      if(s.phase!=='idle')break;
      s.phase='preparing';s.path='human';
      event(s,'accepted','18:53','You took the request','Lena will help connect Cio.','heart');break;
    case 'decline':
      if(s.phase!=='idle')break;
      s.phase='circle';s.path='robot';s.circleAt=now;
      event(s,'circle','18:53','The care circle is being asked','No problem. Asking the next people.','people');break;
    case 'dispatch':
      if(s.phase!=='circle'||!s.circleReady)break;
      s.phase='mission';s.missionAt=now;
      event(s,'mission','18:54','KettyBot is on its way','Checking, finding, connecting. A person still decides.','bot');break;
    case 'prep':
      if(s.phase==='preparing'&&Object.hasOwn(s.prep,a.key))s.prep[a.key]=!!a.value;break;
    case 'prepared':
      if(s.phase!=='preparing'||!Object.values(s.prep).every(v=>v===true))break;
      s.phase='review';
      event(s,'prepared','19:09','Cio is connected','Lena completed the preparation checklist.','plug');break;
    case 'check':
      if(s.phase==='review'&&Object.hasOwn(s.checks,a.key))s.checks[a.key]=!!a.value;break;
    case 'start':
      if(!a.confirmed||!canStart(s))break;
      s.phase='updating';s.updateAt=now;s.approvals=1;
      event(s,'approved',WINDOW.from,'Lena started the demo update','Right time and clear surroundings explicitly confirmed.','finger');break;
    case 'pause':
      if(!['idle','preparing','circle','mission','review'].includes(s.phase))break;
      s.phase='paused';s.reason=a.reason==='emergency'?'An emergency needs priority.':a.reason==='unsure'?'Medical physics has the request.':'The request is paused.';
      s.checks=initialState(now).checks;s.missionAt=null;
      event(s,`paused-${s.events.length}`,'19:09','Request paused',s.reason,'pause');break;
    case 'resume':
      if(s.phase!=='paused')break;
      s.phase='idle';s.reason='';s.checks=initialState(now).checks;s.prep=initialState(now).prep;
      s.circleAt=null;s.circleReady=false;s.path=null;
      event(s,`resumed-${s.events.length}`,WINDOW.request,'Demo window available again','Replaying the original scenario. New checks are required.','calendar');break;
    case 'fail':
      if(s.phase!=='updating')break;
      s.phase='failed';
      event(s,'interrupted','19:11','Demo interruption detected','Simulated power loss. Cio is kept out of service.','warning');break;
    case 'service':
      if(s.phase!=='failed'||s.serviceRequested)break;
      s.serviceRequested=true;
      event(s,'service','19:12','Demo service request prepared','Example SR-003 includes the device status and activity trail. Nothing was sent externally.','tool');break;
    case 'recover':
      if(s.phase!=='failed'||!s.serviceRequested)break;
      s.phase='recovering';s.recoveryAt=now;
      event(s,'recover','19:13','Service recovery demonstration','Restoring the retained image.','refresh');break;
    case 'tick':
      if(s.phase==='circle'&&progress(s,now)>=1)s.circleReady=true;
      if(s.phase==='mission'&&progress(s,now)>=1){
        s.phase='review';event(s,'ready','19:09','Ready for a human','14 simulated checks passed. No update has started.','finger');
      }else if(s.phase==='updating'&&progress(s,now)>=1){
        s.phase='complete';
        event(s,'complete',WINDOW.to,'Cio’s update is complete','Software 4.2.1. Fresh logs. Ready for the team to review.','check');
        event(s,'thanks',WINDOW.to,'Cio says thank you','A little help made a difference.','heart');
      }else if(s.phase==='recovering'&&progress(s,now)>=1){
        s.phase='recovered';event(s,'recovered','19:22','Previous version restored','The team must review the device. The security patch still needs a new window.','tool');
      }break;
    case 'pet': s.pets=Math.min(999,s.pets+1);break;
    case 'setting':
      if(['sound','motion','haptics'].includes(a.key))s[a.key]=!!a.value;break;
    case 'availability':
      if(['available','procedure','off'].includes(a.value))s.availability=a.value;break;
  }
  return s;
}
