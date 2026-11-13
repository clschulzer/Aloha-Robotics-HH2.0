/* One visual thought crosses the act boundary: the golden proposal becomes
   the seed of the service architecture. No extra scene or time is added.
   Direction inspired by the team's OPUS continuity work; own SVG/WAAPI implementation. */
const stage = document.querySelector('#stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const layer = document.createElementNS(NS,'svg');
layer.setAttribute('viewBox','0 0 1920 1080');
layer.setAttribute('aria-hidden','true');
layer.classList.add('scene-continuity');
stage.append(layer);
let previous=stage.dataset.scene;
let generation=0;
const point = element => {
  const a=element.getBoundingClientRect(),b=stage.getBoundingClientRect(),scale=b.width/1920;
  return {x:(a.x+a.width/2-b.x)/scale,y:(a.y+a.height/2-b.y)/scale,w:a.width/scale,h:a.height/scale};
};
const node = (name,attrs) => {
  const e=document.createElementNS(NS,name);
  Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));layer.append(e);return e;
};
function clear(){generation++;layer.getAnimations({subtree:true}).forEach(a=>a.cancel());layer.replaceChildren();}
function carryWindow(){
  const source=document.querySelector('.av-gold-window');
  const target=document.querySelector('.av-node-policy .av-node-ring');
  if(!source||!target||reduce)return;
  const a=point(source),b=point(target),token=generation;
  const c={x:a.x+(b.x-a.x)*.55,y:a.y-160},d={x:b.x+100,y:b.y-130};
  const route=node('path',{d:`M${a.x} ${a.y}C${c.x} ${c.y} ${d.x} ${d.y} ${b.x} ${b.y}`,fill:'none',stroke:'#f8d681','stroke-width':1.6,pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,opacity:.7});
  route.animate([{strokeDashoffset:1,opacity:0},{strokeDashoffset:1,opacity:.8,offset:.15},{strokeDashoffset:0,opacity:.7,offset:.8},{strokeDashoffset:0,opacity:0}],{duration:1800,fill:'forwards',easing:'ease-in-out'});
  const seed=node('rect',{x:-a.w/2,y:-a.h/2,width:a.w,height:a.h,rx:7,fill:'#ffe7aa',stroke:'#fff5cf','stroke-width':1});
  seed.style.filter='drop-shadow(0 0 14px #ffd97a)';
  const keys=[];
  for(let i=0;i<=40;i++){
    const t=i/40,u=1-t;
    const x=u*u*u*a.x+3*u*u*t*c.x+3*u*t*t*d.x+t*t*t*b.x;
    const y=u*u*u*a.y+3*u*u*t*c.y+3*u*t*t*d.y+t*t*t*b.y;
    const squeeze=Math.min(1,t*5);
    keys.push({transform:`translate(${x}px,${y}px) scale(${1-squeeze*(1-11/a.w)},${1-squeeze*(1-11/a.h)})`,opacity:t<.85?.96:(1-t)/.15*.96,fill:t<.7?'#ffe7aa':'#a9f0cd',offset:t});
  }
  seed.animate(keys,{duration:1500,fill:'forwards',easing:'cubic-bezier(.6,0,.22,1)'}).finished.then(()=>{
    if(token!==generation)return;
    const ring=node('circle',{cx:b.x,cy:b.y,r:28,fill:'none',stroke:'#b8e9c5','stroke-width':2});
    ring.animate([{r:28,opacity:.8},{r:95,opacity:0}],{duration:1000,easing:'ease-out',fill:'forwards'}).finished.then(()=>{if(token===generation)clear();}).catch(()=>{});
  }).catch(()=>{});
}
const observer=new MutationObserver(()=>{
  const current=stage.dataset.scene;
  if(current===previous)return;
  const from=previous;previous=current;clear();
  if(from==='3'&&current==='4')carryWindow();
});
observer.observe(stage,{attributes:true,attributeFilter:['data-scene']});
