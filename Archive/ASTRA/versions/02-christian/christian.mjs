// Christian's original template remains the renderer. The outer cue clock owns the performance.
import './presentation.mjs';
const C=window.PITCH,O=window.OPUS,frame=document.querySelector('#product'),origin=location.origin;
let active=null;
document.querySelector('.statement-scene').innerHTML='<div class="smallbrand">ALOHA</div><div class="statement-copy"><small>FOR THE PEOPLE WHO KEEP HOSPITALS RUNNING</small><h1>Technology<br>they <em>love.</em></h1></div>';
document.querySelector('.pillars-scene').innerHTML='<div class="smallbrand">ALOHA</div><h1 class="pillar-title">One connected story.</h1><div class="pillar-line"></div><div class="pillars-grid"><div><img src="../../assets/characters/bliss.webp" alt="Cio"><h2>Someone cares.</h2><p>Emotional connection</p></div><div><div class="coord-mark"><i></i><i></i><i></i><b>IA</b></div><h2>It coordinates.</h2><p>Agents and people</p></div><div><img src="../../assets/characters/ketty.webp" alt="KettyBot"><h2>Help arrives.</h2><p>Physical connection</p></div></div>';
function send(){if(active?.scene!=='demo'){frame.contentWindow.postMessage({demo:'pause',value:true},origin);return;}const [s,step]=C.demoSteps[active.step];frame.contentWindow.postMessage({demo:'go',s,step},origin);frame.contentWindow.postMessage({demo:'pause',value:window.ASTRA.getState().paused},origin);}
frame.addEventListener('load',send);
addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.origin===origin&&e.data?.demo==='ready')send();});
document.addEventListener('astra:cue',({detail:c})=>{
 active=c;send();
 document.querySelector('.demo-caption').textContent=c.scene==='demo'&&c.step>=14&&c.step<=23?'ILLUSTRATIVE MISSION · TIME COMPRESSED':'';
 if(window.ASTRA.getState().sfx){
  if(c.scene==='demo'&&c.step===0)O.audio.sfx.sob(.10);
  else if(c.scene==='demo'&&c.step===1)O.audio.sfx.boing(.15);
  else if(c.scene==='demo'&&[2,9,21,24].includes(c.step))O.audio.sfx.success(.055);
  else if(c.scene==='demo'&&[10,18].includes(c.step))O.audio.sfx.pop(780,.13);
  else if(c.scene==='demo'&&c.step>=14&&c.step<=17)O.audio.sfx.tick(.06,650+c.step*35);
  else if(c.scene==='pillars')O.audio.sfx.grow(.06,.8);
 }
});
document.addEventListener('astra:pause',({detail:value})=>frame.contentWindow.postMessage({demo:'pause',value},origin));
const c=window.ASTRA.cues[window.ASTRA.getState().cue];active=c;send();
