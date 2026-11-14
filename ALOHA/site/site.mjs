const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionPaused = reducedMotion;
const motionButton = document.querySelector('#motion');
let palm;
const setMotionLabel = () => {
  if (!motionButton) return;
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionPaused ? 'Resume animation' : 'Pause animation');
  motionButton.textContent = motionPaused ? '▷' : 'Ⅱ';
};
setMotionLabel();
const palmContainer = document.querySelector('#palm-scene');
if (palmContainer) {
  try {
    const {mountPalm} = await import('./palm.mjs');
    palm = mountPalm(palmContainer, {reducedMotion});
  } catch (error) {
    palmContainer.innerHTML = '<img src="site/palm-fallback.svg" alt="Sculptural Aloha palm tree" style="width:100%;height:100%;object-fit:contain">';
    document.querySelector('#palm-hint').textContent = 'ROOTED IN CARE';
  }
  document.querySelector('#palm-mode').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    palm?.setTechnical(active);
  });
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    palm?.setPaused?.(motionPaused);
    setMotionLabel();
  });
}

const steps = [
  {kicker:'01 / THE HUMAN INTERFACE',title:'“A little attention?”',body:'C-ARMAGOTCHI gives the machine a personality. Its mood turns a hidden maintenance need into something a person can understand and act on.',character:'lonely',alt:'Cio, the lonely C-arm',tag:'A LITTLE LONELY',link:'../CARMAGOTCHI_Web_Pitch/klickdummy-christian/',label:'Meet Cio in the click dummy',proof:'Interactive prototype · invented device states'},
  {kicker:'02 / THE PLANNING CORE',title:'Find a gap that holds.',body:'The planner looks beyond an empty calendar slot. It considers update duration, recovery time, emergency pressure and whether enough equipment stays available.',character:'manic',alt:'Cio asking for an update',tag:'LOOKING FOR A GOLDEN WINDOW',link:'technical.html#planner',label:'Read how the planner works',proof:'Deterministic browser rules · illustrative schedules'},
  {kicker:'03 / THE HUMAN HANDOVER',title:'Ask someone who can help.',body:'A clear request reaches the person who can act locally. The demo makes ownership visible and lets them accept or decline, without turning the machine’s needs into everyone’s responsibility.',character:'ketty',alt:'KettyBot ready to help',tag:'A CLEAR NEXT STEP',link:'../CARMAGOTCHI_Web_Pitch/klickdummy-christian/',label:'Follow a guided journey',proof:'Simulated notifications · no messages sent'},
  {kicker:'04 / THE PHYSICAL LAST METRE',title:'Ready is a human decision.',body:'The proposed robot brings power and data. Someone at the device checks the surroundings and explicitly approves the start. Connecting the cable never counts as approval.',character:'update',alt:'Cio installing an update',tag:'CONNECTED. CHECKED. CONFIRMED.',link:'technical.html#architecture',label:'Explore the physical bridge',proof:'Robot and hospital connections are proposed integrations'},
  {kicker:'05 / THE FEEDBACK PATH',title:'“I’m ready for my next patient.”',body:'A completed task needs a result. The concept returns the outcome and logs, makes the machine’s state visible, and closes the care loop for the team.',character:'bliss',alt:'Cio happy and ready',tag:'LOOP CLOSED',link:'../CARMAGOTCHI_APP/arcade/plug-panic/',label:'Play the care loop',proof:'Demonstrated UI and game flow · no live device telemetry'}
];
let currentStep = 0;
const stepButtons = [...document.querySelectorAll('[data-step]')];
function selectStep(index) {
  currentStep = index;
  const step = steps[index];
  stepButtons.forEach((button, i) => {button.classList.toggle('active', i===index);button.setAttribute('aria-pressed',String(i===index));});
  for (const [id,key] of [['step-kicker','kicker'],['step-title','title'],['step-body','body'],['step-tag','tag'],['step-proof','proof']]) document.getElementById(id).textContent = step[key];
  const character = document.getElementById('loop-character');
  character.src = `../CARMAGOTCHI_APP/assets/characters/${step.character}.webp`;
  character.alt = step.alt;
  character.classList.remove('pop');
  if (!reducedMotion) requestAnimationFrame(() => character.classList.add('pop'));
  const link = document.getElementById('step-link');
  link.href = step.link; link.textContent = step.label + ' ↗';
}
stepButtons.forEach((button,i) => button.addEventListener('click',() => selectStep(i)));
document.querySelector('.next-step')?.addEventListener('click',() => selectStep((currentStep+1)%steps.length));
window.addEventListener('pagehide',event => { if (!event.persisted) palm?.destroy(); });
