/* PLUG PANIC: deterministic, browser-independent arcade rules.
   All timings, routes and device states are invented game mechanics. No device commands. */
export const RULES = Object.freeze({shift:120,goal:5,speed:4.15,connect:1.2,install:5,recovery:2,quiet:21,cycle:30,stock:2,cooldown:14});
export const MAP = Object.freeze({width:13,height:11,dock:{x:6,y:8},reserve:{id:'fritzi',name:'Fritzi',x:6,y:1.1,dock:{x:6,y:3}}});
export const DEVICES = Object.freeze([
  {id:'cio',name:'Cio',room:'OR 3',x:2,y:2,dock:{x:2,y:4},offset:0,quote:'I have needs. And firmware.'},
  {id:'cora',name:'Cora',room:'OR 1',x:10,y:2,dock:{x:10,y:4},offset:8,quote:'My love language is electricity.'},
  {id:'bogdan',name:'Bogdan',room:'OR 2',x:2,y:8,dock:{x:2,y:6},offset:15,quote:'Have you tried caring about me?'},
  {id:'arcus',name:'Arcus',room:'OR 4',x:10,y:8,dock:{x:10,y:6},offset:22,quote:'Emotionally available. Electrically not.'},
]);
export const EMERGENCIES = Object.freeze([[35,45],[77,87]]);
const copy=s=>structuredClone(s);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const spot=p=>`${p.x},${p.y}`;
export function floor(x,y) {
  return (y===5&&x>=1&&x<=11)||(x===6&&y>=2&&y<=8)||([2,10].includes(x)&&y>=3&&y<=7);
}
export function pathBetween(from,to) {
  const start={x:Math.round(from.x),y:Math.round(from.y)},end={x:Math.round(to.x),y:Math.round(to.y)};
  if(!floor(start.x,start.y)||!floor(end.x,end.y))return[];
  const queue=[start],seen=new Set([spot(start)]),previous=new Map();
  for(let i=0;i<queue.length;i++){
    const p=queue[i];if(p.x===end.x&&p.y===end.y)break;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const n={x:p.x+dx,y:p.y+dy},k=spot(n);
      if(floor(n.x,n.y)&&!seen.has(k)){seen.add(k);previous.set(k,p);queue.push(n);}
    }
  }
  if(!seen.has(spot(end)))return[];
  const result=[];let p=end;
  while(spot(p)!==spot(start)){result.unshift(p);p=previous.get(spot(p));}
  return result;
}
export function createGame(options={}) {
  return {
    schema:1,phase:'ready',elapsed:0,duration:options.duration??RULES.shift,goal:options.goal??RULES.goal,
    bot:{...MAP.dock},path:[],target:null,direction:null,connection:null,
    power:RULES.stock,packages:RULES.stock,bag:[],receipts:0,score:0,combo:0,lastDelivery:null,
    devices:DEVICES.map(d=>({...d,status:'hungry',job:0,finishAt:null,nextNeedAt:null})),
    emergency:false,approvals:0,uploaded:[],seenDevices:[],events:[],eventId:0,
    message:{id:0,text:'Cio could use a little attention.',kind:'hello'},
  };
}
function say(s,text,kind='info') {s.message={id:++s.eventId,text,kind};}
function log(s,type,detail) {
  s.events.push({id:++s.eventId,at:Number(s.elapsed.toFixed(2)),type,...detail});
  if(s.events.length>80)s.events.shift();
}
export function isEmergency(s) {return EMERGENCIES.some(([a,b])=>s.elapsed>=a&&s.elapsed<b);}
export function windowFor(s,id) {
  const d=s.devices.find(d=>d.id===id);if(!d)return{quiet:false,remaining:0,wait:0};
  const t=(s.elapsed+d.offset)%RULES.cycle,quiet=t<RULES.quiet;
  return {quiet,remaining:quiet?RULES.quiet-t:0,wait:quiet?0:RULES.cycle-t,phase:t};
}
export function near(s) {
  if(s.path.length)return null;
  if(distance(s.bot,MAP.dock)<.3)return'dock';
  if(distance(s.bot,MAP.reserve.dock)<.3)return'fritzi';
  return s.devices.find(d=>distance(s.bot,d.dock)<.3)?.id??null;
}
export function gate(s,id,connecting=false) {
  const d=s.devices.find(d=>d.id===id),w=windowFor(s,id);
  if(s.phase!=='playing')return{ok:false,reason:'The shift is paused.'};
  if(id==='fritzi')return{ok:false,reason:'Fritzi is the backup. Keep her ready.',code:'reserve'};
  if(!d||d.status!=='hungry')return{ok:false,reason:d?.status==='updating'?'Already updating. Keep the power on.':'This C-arm is feeling fine.',code:'status'};
  if(isEmergency(s))return{ok:false,reason:'Emergency cover first. New updates can wait.',code:'emergency'};
  if(!w.quiet)return{ok:false,reason:'A procedure is running. Care has right of way.',code:'busy'};
  if(w.remaining<RULES.install+RULES.recovery+(connecting?RULES.connect:0))return{ok:false,reason:'Too little room for the update and recovery buffer.',code:'short'};
  if(s.devices.some(x=>x.status==='updating'))return{ok:false,reason:'One update at a time. Keep the rest available.',code:'active'};
  if(s.power<1||s.packages<1)return{ok:false,reason:'Back to the dock for power and a fresh package.',code:'stock'};
  return{ok:true,reason:'Quiet window. Backup ready. You make the call.',code:'ready'};
}
function route(s,to,target=null) {
  if(!floor(Math.round(to.x),Math.round(to.y)))return;
  s.connection=null;
  // Finish the current corridor segment before following a replacement route.
  const start=s.path.length?s.path[0]:{x:Math.round(s.bot.x),y:Math.round(s.bot.y)};
  const prefix=distance(s.bot,start)>.01?[{...start}]:[];
  s.path=[...prefix,...pathBetween(start,to)];
  s.target=target;s.direction=null;
}
function upload(s) {
  if(near(s)!=='dock')return;
  const amount=s.bag.length;
  s.power=RULES.stock;s.packages=RULES.stock;
  if(!amount){say(s,'Power packed. Data packed. Emotional support: unlimited.','restock');return;}
  s.combo=s.lastDelivery!==null&&s.elapsed-s.lastDelivery<=28?Math.min(4,s.combo+1):1;
  s.lastDelivery=s.elapsed;
  for(const receipt of s.bag){
    if(s.uploaded.includes(receipt.id))continue;
    s.uploaded.push(receipt.id);s.receipts++;
    const first=!s.seenDevices.includes(receipt.device);
    s.score+=100*s.combo+(first?25:0);
    if(first)s.seenDevices.push(receipt.device);
    log(s,'receipt',{receipt:receipt.id,device:receipt.device,explicitApproval:true});
  }
  s.bag=[];
  say(s,amount===1?'Logs home. Loop closed. One very happy C-arm.':`${amount} receipts delivered. That is some quality care.`, 'delivery');
  if(s.receipts>=s.goal){
    s.score+=Math.ceil(Math.max(0,s.duration-s.elapsed))*3;s.phase='won';s.path=[];s.connection=null;
    log(s,'won',{receipts:s.receipts,score:s.score});
  }
}
export function command(original,type,payload={}) {
  const s=copy(original);
  if(type==='start'||type==='restart'){const n=createGame({duration:s.duration,goal:s.goal});n.phase='playing';return n;}
  if(type==='pause'){if(s.phase==='playing'){s.phase='paused';s.direction=null;if(s.connection&&!s.connection.connected)s.connection=null;}return s;}
  if(type==='resume'){if(s.phase==='paused')s.phase='playing';return s;}
  if(s.phase!=='playing')return s;
  if(type==='target'){
    const id=payload.id,p=id==='dock'?MAP.dock:id==='fritzi'?MAP.reserve.dock:s.devices.find(d=>d.id===id)?.dock;
    if(p)route(s,p,id);
  }else if(type==='move'){
    route(s,{x:payload.x,y:payload.y});
  }else if(type==='direction'){
    const {dx,dy}=payload;if(Math.abs(dx)+Math.abs(dy)!==1)return s;
    if(s.path.length)s.path=[s.path[0]];
    s.direction={dx,dy};s.target=null;s.connection=null;
  }else if(type==='release-direction'){
    s.direction=null;
  }else if(type==='stop'){
    if(s.path.length)s.path=[s.path[0]];s.direction=null;s.target=null;
  }else if(type==='connect-down'){
    const id=near(s),allowed=gate(s,id,true);
    if(allowed.ok){s.connection={id,charge:0,holding:true,connected:false};say(s,'Hold steady. Power first, then the package.','connecting');}
    else say(s,allowed.reason,allowed.code==='reserve'?'reserve':'wait');
  }else if(type==='connect-up'){
    if(s.connection&&!s.connection.connected)s.connection=null;
  }else if(type==='approve'){
    const c=s.connection,id=near(s),allowed=gate(s,id);
    if(payload.confirmed===true&&c?.connected&&c.id===id&&allowed.ok){
      const d=s.devices.find(d=>d.id===id);d.status='updating';d.job++;d.finishAt=s.elapsed+RULES.install;
      s.power--;s.packages--;s.approvals++;s.connection=null;
      log(s,'approved',{device:id,job:d.job,quietRemaining:Number(windowFor(s,id).remaining.toFixed(2)),reserve:'fritzi'});
      say(s,`${d.name}: “Whatever you do, don’t pull my plug.”`,'started');
    }else say(s,allowed.ok?'Connect first. Then give the explicit go-ahead.':allowed.reason,'wait');
  }else if(type==='upload')upload(s);
  return s;
}
export function step(original,seconds) {
  const s=copy(original);
  if(s.phase!=='playing'||!Number.isFinite(seconds)||seconds<=0)return s;
  const dt=Math.min(seconds,.25);
  s.elapsed=Math.min(s.duration,s.elapsed+dt);
  const emergency=isEmergency(s);
  if(emergency!==s.emergency){
    s.emergency=emergency;
    if(emergency){s.connection=null;say(s,'Emergency incoming. Fritzi is ready. New updates wait.','emergency');log(s,'emergency',{reserveProtected:true});}
    else say(s,'Emergency cover released. Find your next golden window.','clear');
  }
  if(s.direction&&!s.path.length){
    const x=Math.round(s.bot.x)+s.direction.dx,y=Math.round(s.bot.y)+s.direction.dy;
    if(floor(x,y))s.path=[{x,y}];
  }
  let travel=RULES.speed*dt;
  while(s.path.length&&travel>0){
    const next=s.path[0],d=distance(s.bot,next);
    if(d<=travel){s.bot={...next};s.path.shift();travel-=d;}
    else{s.bot.x+=(next.x-s.bot.x)/d*travel;s.bot.y+=(next.y-s.bot.y)/d*travel;travel=0;}
  }
  if(s.connection?.holding){
    if(near(s)!==s.connection.id||!gate(s,s.connection.id).ok)s.connection=null;
    else {
      s.connection.charge=Math.min(1,s.connection.charge+dt/RULES.connect);
      if(s.connection.charge>=1){s.connection.connected=true;s.connection.holding=false;say(s,'Power + data connected. A human starts every update.','connected');}
    }
  }
  if(s.connection?.connected&&!gate(s,s.connection.id).ok){s.connection=null;say(s,'The window changed. Care first. Try another gap.','wait');}
  for(const d of s.devices){
    if(d.status==='updating'&&s.elapsed>=d.finishAt){
      d.status='logs';d.receipt={id:`${d.id}-${d.job}`,device:d.id};
      log(s,'updated',{device:d.id,job:d.job});
      say(s,`${d.name}: “New software. New me.” Pick up the logs.`,'updated');
    }
    if(d.status==='logs'&&near(s)===d.id){
      s.bag.push({...d.receipt});d.receipt=null;d.status='happy';d.nextNeedAt=s.elapsed+RULES.cooldown;
      say(s,`${d.name}’s logs collected. Bring them back to the dock.`,'collected');
      log(s,'logs',{device:d.id});
    }
    if(d.status==='happy'&&s.elapsed>=d.nextNeedAt){d.status='hungry';say(s,`${d.name}: “Okay, one tiny thing…” A new game job is waiting.`,'new-job');}
  }
  if(s.elapsed>=s.duration){
    s.phase='lost';s.path=[];s.connection=null;s.direction=null;
    log(s,'shift-over',{receipts:s.receipts,score:s.score});
  }
  return s;
}
export function nearestJob(s) {
  if(s.power<1||s.packages<1||s.bag.length>=2)return'dock';
  const pending=s.devices.filter(d=>d.status==='logs');
  if(pending.length)return pending.sort((a,b)=>distance(s.bot,a.dock)-distance(s.bot,b.dock))[0].id;
  const candidates=s.devices.filter(d=>d.status==='hungry');
  candidates.sort((a,b)=>Number(gate(s,b.id,true).ok)-Number(gate(s,a.id,true).ok)||distance(s.bot,a.dock)-distance(s.bot,b.dock));
  return candidates[0]?.id??'dock';
}
export function panelFor(s) {
  const id=near(s),d=s.devices.find(x=>x.id===id);
  if(s.path.length)return{kind:'moving',id:s.target,name:s.target==='dock'?'the dock':s.target==='fritzi'?'Fritzi':s.devices.find(x=>x.id===s.target)?.name??'your next stop'};
  if(id==='dock')return{kind:'dock',id};
  if(id==='fritzi')return{kind:'reserve',id,name:'Fritzi'};
  if(!d)return{kind:'idle'};
  if(d.status==='updating')return{kind:'updating',id,name:d.name,remaining:Math.max(0,d.finishAt-s.elapsed)};
  if(d.status==='happy')return{kind:'happy',id,name:d.name};
  if(d.status==='logs')return{kind:'logs',id,name:d.name};
  if(s.connection?.id===id)return{kind:s.connection.connected?'approve':'connecting',id,name:d.name};
  const allowed=gate(s,id,true);
  return{kind:allowed.ok?'connect':'wait',id,name:d.name,reason:allowed.reason,code:allowed.code};
}
