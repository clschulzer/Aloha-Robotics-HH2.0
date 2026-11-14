/* Presentation refinement around Christian's original SCENES, phone, mission and timer engine.
   The parent supplies one calculated proposal; this layer does not perform device actions. */
(() => {
  const $ = s => document.querySelector(s);
  let proposal={from:'21:00',to:'23:00',guard:'23:30',backup:'Cora',eligible:true};
  let frozen=false, previousScene=0, approvals=0, approved=false, lastKey='';
  const replaceText=(root,from,to)=>{
    const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const found=[];let n;while((n=walk.nextNode()))if(n.nodeValue.includes(from))found.push(n);
    found.forEach(n=>{n.nodeValue=n.nodeValue.replaceAll(from,to);});
  };
  const mean=(parent,text)=>{
    let el=parent.querySelector('.stage-meaning');
    if(!el){el=document.createElement('p');el.className='stage-meaning';parent.append(el);}
    el.textContent=text;
  };
  function polish(){
    const state=window.DEMO?.getState();if(!state)return;
    const {scene,step}=state,root=$('#view>.scene');if(!root)return;
    $('#stage').dataset.demoScene=scene;
    const key=`${scene}:${step}`,change=scene!==previousScene;
    replaceText(root,'19:30–22:45',`${proposal.from}–${proposal.guard}`);
    replaceText(root,'19:31',proposal.from);
    replaceText(root,'21:31',proposal.to);
    replaceText(root,'21:32','23:01');
    replaceText(root,'18 min', '120 min');
    replaceText(root,'17 min 40 s','120 min');
    replaceText(root,'Team streak +1 ♥','Thank you for helping. ♥');
    replaceText(root,'New data from Cio: version, logs, health. Next window ready.','Fresh device status and logs. Back with the care team.');
    replaceText(root,'Ready for clinical use','Ready for team review');
    replaceText(root,'40 m away','in Cio’s care circle');
    replaceText(root,'20 min · plug in, stay near','Connect the device');
    replaceText(root,'20 min ·','');
    replaceText(root,'expected 120 min (illustrative)','120 min · time compressed');
    if(scene<=3){
      $('.mood-word').textContent=['Ghosted.','Very needy.','New me.'][scene-1];
      $('.mood-left .eyebrow').textContent='MEET C-ARMAGOTCHI';
      mean($('.mood-left'),['Disconnected. Waiting for a little attention.','A security patch is waiting.','Connected and current.'][scene-1]);
      $('.pet-quote').textContent=['“Do you even think about me?”','“I have needs. And firmware.”','“New software. New me.”'][scene-1];
      $('.pet-state').textContent=['Disconnected','Security patch due','Connected · current'][scene-1];
      if(scene===1){approved=false;approvals=0;}
    }
    if(scene===4){
      $('.team-left>.eyebrow').textContent='YOUR TEAM’S MACHINES';
      $('.claim').innerHTML=step<2?'Someone<br>cares.':'Need becomes<br><em>priority.</em>';
      $('.why').innerHTML='The bond creates responsibility.';
      $('.queue').innerHTML='<p class="priority-contract">Clinical data finds the time.</p>';
      const other=root.querySelectorAll('.team-grid .tile.need')[1];
      if(other){
        other.querySelector('b').textContent='C-04 Arcus';
        other.querySelector('span').textContent='OR 4';
        other.querySelector('.tstate').textContent='Connection needs attention';
      }
    }
    if(scene===7){
      $('.ps-left .eyebrow').textContent='LENA · X-RAY NURSE';
      $('.ps-left h2').innerHTML=step?'Not today?<br><em>That’s okay.</em>':'One small<br><em>request.</em>';
      $('.ps-left p').textContent=step?'No guilt. It asks someone else.':'Cio needs a hand.';
      const items=[...root.querySelectorAll('.job li b')];
      if(items.length===3){items[0].textContent=`${proposal.from}–${proposal.guard}`;items[1].textContent='Connect the device';items[2].textContent='Trained · in Cio’s circle';}
      $('.push-body').textContent=`C-03 · Corridor B. Help prepare the ${proposal.from} window.`;
    }
    if(scene===8){
      $('.radar-head .eyebrow').textContent='ASK THE CARE CIRCLE';
      $('.radar-head .s0only').innerHTML='A little<br>help?';
      $('.radar-head .s1').innerHTML='Help is<br><em>on its way.</em>';
      $('.nobody b').textContent='Nobody can make the trip.';
      $('.send span').innerHTML='Send KettyBot <em>→</em>';
    }
    if(scene===9){
      const h=['Check before leaving.','Find the actual machine.','Make the connection.','Ready to ask.'];
      const head=root.querySelector(`.mission h2.k${step}`);if(head)head.textContent=h[step];
      let progress=$('.mission-progress');
      if(!progress){progress=document.createElement('div');progress.className='mission-progress';$('.msn').append(progress);}
      progress.innerHTML=['Check','Find','Connect','Ask'].map((s,i)=>`<span class="${i===step?'on':i<step?'done':''}"><i></i>${s}</span>`).join('');
      $('.ag-h').innerHTML='<i class="ag-dot"></i>'+['BEFORE LEAVING','FINDING CIO','DEVICE HANDOFF','BEFORE ASKING'][step];
      const captions=['Package, cable and enough charge.','The last known spot is empty. Keep looking.','Device identity, power and an approved data path.','Checks passed. A person still decides.'];
      root.querySelector(`.caption .k${step}`).textContent=captions[step];
      $('.found b').textContent=step<2?'Cio found.':step===2?'C-03 · identity checked':'Ready for review';
      const roomLabel=[...root.querySelectorAll('.plan-svg text')].find(n=>n.textContent.trim()==='HYBRID OR');
      if(roomLabel){roomLabel.setAttribute('x','1160');roomLabel.setAttribute('y','480');}
      $('.ag-res b').textContent='Ready to ask.';
      $('.ag-res span').textContent='Every check passed in this simulation.';
      const tx=[...root.querySelectorAll('.ag .tx')],sub=[...root.querySelectorAll('.ag li small')];
      const titles=['Approved package','Checksum','Cable packed','Charge available','Last known spot','Another parking spot','Cio found','Service dock','Right machine','Power on','Area clear','No patient or drapes','Brakes and arm','Stable power'];
      const subs=['Manufacturer signature','Integrity check','Approved device connection','Mission power budget','Empty — continue search','From known equipment locations','Visual candidate','Proposed interface','Serial + device certificate','Manufacturer-approved wake path','Camera + lidar concept','Human review follows','Device status check','Before any start request'];
      tx.forEach((t,i)=>{t.textContent=titles[i];});sub.forEach((t,i)=>{t.textContent=subs[i];});
    }
    if(scene===10){
      $('.ps-left .eyebrow').textContent='LENA’S DECISION';
      $('.ps-left h2').innerHTML='A human<br><em>starts it.</em>';
      $('.ps-left p').textContent=step<2?'She couldn’t walk over. She can review the request.':step===2?'The right time. Clear surroundings.':step===3?'The decision stays with the authorized person.':'The decision is recorded.';
      [...root.querySelectorAll('.status>span:first-child,.lock-time')].forEach(n=>n.textContent=proposal.from);
      const rows=[...root.querySelectorAll('.w1 .wz-row b')];
      if(rows.length===4){rows[0].textContent=`${proposal.from}–${proposal.guard}`;rows[1].textContent='None in this window';rows[2].textContent='No active alert';rows[3].textContent='120 min';}
      $('.cam-tag').textContent='ILLUSTRATIVE CAMERA VIEW';
      $('.wz-rel').innerHTML='Published by Medical physics<br>Approved package · recovery margin reserved';
      $('.wz-btn.hold').disabled=!proposal.eligible;
      $('.st-s').textContent=`by Lena · ${proposal.from} · recorded in the demo`;
    }
    if(scene===11){
      $('.mission h2').textContent='Stay with it.';
      $('.pmeta>span:last-child').textContent='120 min · time compressed';
      $('.courier').textContent='The device verifies the package. The robot carries it.';
      $('.run-right>.eyebrow').textContent=`C-03 · SECURITY PATCH · STARTED BY LENA ${proposal.from}`;
    }
    if(scene===12){
      $('.mission h2').textContent='Every result comes home.';
      $('.audit-list').innerHTML='<div class="eyebrow">SERVICE RECEIPT · C-03 CIO</div>'+[
        ['19:24','Window published by Medical physics'],
        ['20:45','Connection mission accepted'],
        ['20:58','Device identity checked'],
        [proposal.from,'Lena authorized the update'],
        [proposal.to,'Status and logs returned'],
        ['NEXT','Team review and exception handling']
      ].map(([t,v])=>`<div class="ae"><span>${t}</span>${v}</div>`).join('');
      $('.leave span').textContent='Then help the next machine.';
    }
    if(scene===13){
      $('.mood-left .eyebrow').textContent='BACK WHERE WE STARTED';
      $('.mood-word').innerHTML='Thanks,<br>Lena.';
      mean($('.mood-left'),'Fresh data for the next decision.');
      root.querySelectorAll('.lock-time,.status>span:first-child').forEach(n=>n.textContent='23:01');
    }
    if(change&&[1,7,10,13].includes(scene)&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
      const phone=root.querySelector('.phone');
      phone?.animate([{opacity:0,transform:'translateY(65px) rotateY(-17deg) rotateZ(3deg) scale(.96)'},{opacity:1,transform:'none'}],{duration:830,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    previousScene=scene;lastKey=key;
    if(frozen)document.getAnimations().forEach(a=>a.pause());
  }
  function illustrateHuman(){
    if(approved||!proposal.eligible||window.DEMO?.getState().scene!==10||window.DEMO?.getState().step!==3)return false;
    approved=true;approvals++;
    const button=$('.wz-btn.hold'),touch=document.createElement('div');
    const b=button.getBoundingClientRect(),r=$('#stage').getBoundingClientRect(),k=r.width/1920;
    touch.className='demo-touch on';touch.style.left=`${(b.x+b.width*.5-r.x)/k-31}px`;touch.style.top=`${(b.y+b.height*.5-r.y)/k-31}px`;
    $('#stage').append(touch);
    const animation=touch.getAnimations()[0];animation?.finished.then(()=>touch.remove()).catch(()=>touch.remove());
    return true;
  }
  document.addEventListener('christian:step',polish);
  addEventListener('message',e=>{
    if(e.source!==parent||e.origin!==location.origin)return;
    if(e.data?.demo==='proposal'){proposal={...proposal,...e.data.value};polish();}
    if(e.data?.demo==='human')illustrateHuman();
    if(e.data?.demo==='reset'){approvals=0;approved=false;previousScene=0;}
    if(e.data?.demo==='pause'){frozen=!!e.data.value;document.body.classList.toggle('final-paused',frozen);}
  });
  window.DEMO.illustrateHuman=illustrateHuman;
  window.DEMO.metrics=()=>({proposal,approvals,approved,scene:window.DEMO.getState(),lastKey});
  polish();
})();
