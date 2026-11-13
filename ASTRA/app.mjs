import { STORY } from './story.mjs';
import { createScenario, evaluateSlots, getRecommendation, getStartChecks, canStart, transition, formatTime } from './engine.mjs';

const $ = (id) => document.getElementById(id);
const titles = ['The unanswered request','The missing handover','Finding the moment','The last metre','The human has the key','Closing the loop','Prove the handover','Time for the patient'];
const scenes = STORY.map((cue) => $(cue.id));
let sceneIndex = Math.max(0, STORY.findIndex((cue) => `#${cue.id}` === location.hash));
let state = createScenario();
let launched = false;
let introTimeout = null;
let filmTimeout = null;
let punchlineTimeout = null;
let noticeTimeout = null;
let calendarInspected = false;
let finaleRevealed = false;
let clockElapsed = 0;
let clockStartedAt = null;
let labState = createScenario();
let labTab = 'system';

const text = (id, value) => { $(id).textContent = value; };
const make = (tag, className, content) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
};
const elapsed = () => clockElapsed + (clockStartedAt === null ? 0 : (performance.now() - clockStartedAt) / 1000);
const stamp = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const escapeJSON = (value) => JSON.stringify(value, null, 2);

function resize() {
  const width = $('viewport').clientWidth;
  const height = $('viewport').clientHeight;
  $('stage').style.setProperty('--scale', Math.min(width / 1440, height / 810));
}
new ResizeObserver(resize).observe($('viewport'));
window.addEventListener('resize', resize);

function notify(message) {
  text('notice', message);
  $('notice').classList.add('visible');
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => $('notice').classList.remove('visible'), 4400);
}

function hideFilm() {
  clearTimeout(introTimeout);
  clearTimeout(filmTimeout);
  $('intro-video').pause();
  $('film-layer').hidden = true;
  $('stage').classList.remove('film-active');
  if (sceneIndex === 0 && launched) $('arrival').classList.add('request-ready');
}
function resetOpening() {
  clearTimeout(punchlineTimeout);
  $('arrival').classList.remove('request-ready');
  $('arrival-title').innerHTML = 'Meet<br><em>Cora.</em>';
}
function revealPunchline() {
  if (sceneIndex !== 0) return;
  $('arrival').classList.add('request-ready');
  $('arrival-title').innerHTML = 'Left<br>on <em>read.</em>';
}
function playFilm() {
  if (sceneIndex !== 0) showScene(0);
  $('film-layer').hidden = false;
  $('stage').classList.add('film-active');
  const video = $('intro-video');
  video.currentTime = 0;
  video.muted = true;
  video.play().catch(() => {
    hideFilm();
    notify('Film unavailable. Cora and the stage script are your fallback.');
  });
  clearTimeout(filmTimeout);
  filmTimeout = setTimeout(hideFilm, 7500);
}
$('intro-video').addEventListener('ended', hideFilm);
$('intro-video').addEventListener('error', () => {
  if (!$('film-layer').hidden) {
    hideFilm();
    notify('The film could not load. Continue with Cora’s request.');
  }
});
$('skip-film').addEventListener('click', hideFilm);
$('replay-film').addEventListener('click', playFilm);

function clockRun() {
  if (clockStartedAt === null) clockStartedAt = performance.now();
  renderClock();
}
function clockPause() {
  clockElapsed = elapsed();
  clockStartedAt = null;
  renderClock();
}
function clockReset() {
  clockElapsed = 0;
  clockStartedAt = null;
  renderClock();
}
function renderClock() {
  const seconds = elapsed();
  text('clock-time', stamp(seconds));
  text('clock-toggle', clockStartedAt === null ? 'Start timer' : 'Pause timer');
  const cue = STORY[sceneIndex];
  let message = 'Ready when you are.';
  if (seconds > 0) {
    if (seconds >= 180) message = 'Three minutes. Hold the final frame.';
    else if (seconds > cue.start + cue.duration) message = `${Math.ceil(seconds - cue.start - cue.duration)}s past this cue. Keep moving.`;
    else if (seconds < cue.start) message = `${Math.ceil(cue.start - seconds)}s ahead. Give the story space.`;
    else message = `${Math.ceil(cue.start + cue.duration - seconds)}s left in this cue.`;
  }
  text('pace', message);
}
setInterval(renderClock, 250);
$('clock-toggle').addEventListener('click', () => clockStartedAt === null ? clockRun() : clockPause());
$('clock-reset').addEventListener('click', clockReset);

function startPitch() {
  hideFilm();
  resetOpening();
  state = createScenario();
  calendarInspected = false;
  finaleRevealed = false;
  launched = true;
  $('launch').classList.add('started');
  $('launch').replaceChildren(document.createTextNode('Restart pitch'), make('span', '', '↺'));
  showScene(0);
  clockReset();
  clockRun();
  introTimeout = setTimeout(() => { if (sceneIndex === 0) playFilm(); }, 3000);
  punchlineTimeout = setTimeout(revealPunchline, 12000);
}
$('launch').addEventListener('click', startPitch);

function showScene(index, updateHash = true) {
  const nextIndex = Math.max(0, Math.min(STORY.length - 1, index));
  if (nextIndex !== 0) { hideFilm(); clearTimeout(punchlineTimeout); }
  if (nextIndex === 7 && sceneIndex !== 7) finaleRevealed = false;
  sceneIndex = nextIndex;
  scenes.forEach((scene, i) => {
    scene.hidden = i !== nextIndex;
    scene.classList.toggle('active', i === nextIndex);
  });
  $('stage').dataset.scene = STORY[nextIndex].id;
  $('finale').classList.toggle('finale-reveal', finaleRevealed);
  $('finale-title').innerHTML = finaleRevealed ? 'Time for<br>the <em>patient.</em>' : 'Tomorrow<br><em>morning.</em>';
  $('notice').classList.remove('visible');
  if (updateHash) history.replaceState(null, '', `#${STORY[nextIndex].id}`);
  text('chapter-name', titles[nextIndex].toUpperCase());
  text('scene-counter', `${String(nextIndex + 1).padStart(2, '0')} / 08`);
  $('previous').disabled = nextIndex === 0;
  [...$('chapter-progress').children].forEach((button, i) => {
    button.classList.toggle('current', i === nextIndex);
    button.classList.toggle('past', i < nextIndex);
    button.setAttribute('aria-current', i === nextIndex ? 'step' : 'false');
  });
  const cue = STORY[nextIndex];
  text('note-title', `${stamp(cue.start)} · ${titles[nextIndex]}`);
  $('note-speech').replaceChildren(...cue.speech.map((paragraph) => make('p', '', paragraph)));
  text('note-action', cue.cue);
  text('note-next', nextIndex < 7 ? `${stamp(STORY[nextIndex + 1].start)} · ${titles[nextIndex + 1]}` : 'Hold. Then open Under the hood for questions.');
  renderState();
  renderClock();
  resize();
}

STORY.forEach((cue, index) => {
  const button = make('button');
  button.type = 'button';
  button.title = titles[index];
  button.setAttribute('aria-label', `Go to ${titles[index]}`);
  button.addEventListener('click', () => showScene(index));
  $('chapter-progress').append(button);
});
window.addEventListener('hashchange', () => {
  const index = STORY.findIndex((cue) => `#${cue.id}` === location.hash);
  if (index >= 0) showScene(index, false);
});
document.querySelector('.wordmark').addEventListener('click', (event) => { event.preventDefault(); showScene(0); });

function send(event, { announce = true } = {}) {
  state = transition(state, typeof event === 'string' ? { type:event } : event);
  renderState();
  if (announce && state.lastAction?.ok === false) notify(state.lastAction.message);
  return state;
}

function injectEmergency() {
  if (!calendarInspected && state.phase === 'planning' && !state.emergency) {
    calendarInspected = true;
    renderState();
    return;
  }
  calendarInspected = true;
  send('EMERGENCY');
  $('window').classList.remove('replanning');
  requestAnimationFrame(() => $('window').classList.add('replanning'));
}

function nextCue() {
  if (!$('film-layer').hidden) { hideFilm(); return; }
  if (!launched && sceneIndex === 0) { startPitch(); return; }
  const id = STORY[sceneIndex].id;
  if (id === 'window' && (!calendarInspected || !state.emergency)) { injectEmergency(); return; }
  if (id === 'connect' && state.phase === 'planning') { send('PREPARE'); return; }
  if (id === 'authorize') {
    if (state.phase === 'planning') { notify('Prepare the connection first. The start remains blocked.'); return; }
    if (state.phase === 'prepared') { send('ATTEST'); return; }
    if (state.phase === 'approved') {
      send('START');
      if (state.lastAction.ok) showScene(sceneIndex + 1);
      return;
    }
  }
  if (id === 'return') {
    if (state.phase === 'installing') { send('VERIFY_SUCCESS'); return; }
    if (state.phase === 'verified') { send('RELEASE'); return; }
    if (state.phase !== 'released') { notify('This device has not completed an authorized service. Use the stage workflow or restart.'); return; }
  }
  if (sceneIndex < 7) showScene(sceneIndex + 1);
  else if (!finaleRevealed) {
    finaleRevealed = true;
    $('finale').classList.add('finale-reveal');
    $('finale-title').innerHTML = 'Time for<br>the <em>patient.</em>';
    renderState();
  } else clockPause();
}
$('next').addEventListener('click', nextCue);
$('previous').addEventListener('click', () => showScene(sceneIndex - 1));
$('emergency-button').addEventListener('click', injectEmergency);
$('connect-button').addEventListener('click', () => send('PREPARE'));
$('approve-button').addEventListener('click', () => send('ATTEST'));
$('start-button').addEventListener('click', () => { send('START'); if(state.lastAction.ok) showScene(5); });
$('return-button').addEventListener('click', () => {
  if (state.phase === 'installing') send('VERIFY_SUCCESS');
  else if (state.phase === 'verified') send('RELEASE');
  else if (state.phase === 'released') showScene(6);
  else notify('No installation is underway. Complete the preparation and authorization first.');
});

function addBlock(track, start, end, className, label = '') {
  const left = Math.max(0, (start - 17 * 60) / 360 * 100);
  const right = Math.min(100, (end - 17 * 60) / 360 * 100);
  if (right <= left) return;
  const block = make('div', `schedule-block ${className}`, label);
  block.style.setProperty('--left', `${left}%`);
  block.style.setProperty('--width', `${right-left}%`);
  block.title = `${label || className}: ${formatTime(start)}–${formatTime(end)}`;
  track.append(block);
}
function renderCalendar() {
  const recommendation = getRecommendation(state);
  const firstCandidate = evaluateSlots(state)[0];
  const inspecting = !calendarInspected && state.phase === 'planning' && !state.emergency;
  const active = ['installing','verified','failed'].includes(state.phase);
  const completed = state.phase === 'released';
  const displaySlot = inspecting ? firstCandidate : recommendation;
  $('window').classList.toggle('no-window', !recommendation && !inspecting);
  const oldBlocks = new Map([...$('calendar-rows').querySelectorAll('.schedule-block.service,.schedule-block.coverage,.schedule-block.reserve')].map((block) => [`${block.parentElement.dataset.device}-${block.className}`, block.style.getPropertyValue('--left')]));
  const rows = [state.target, ...state.backups].map((device) => {
    const row = make('div', 'calendar-row');
    const label = make('div', 'device-label', device.name);
    label.append(make('small', '', device.id === 'CORA' ? 'SERVICE DUE' : 'BACKUP POOL'));
    const track = make('div', 'track');
    track.dataset.device = device.id;
    (device.busy || []).forEach((busy) => addBlock(track, busy.start, busy.end, 'busy', 'Clinical use'));
    if (device.id === 'CORA') {
      addBlock(track, 17*60, 17*60+20, 'handover', '');
      state.emergencyBlocks.forEach((block) => addBlock(track, block.start, block.end, 'emergency', 'Emergency'));
      if (displaySlot) {
        addBlock(track, displaySlot.start, displaySlot.end, inspecting ? 'rejected' : 'service', inspecting ? 'Handover conflict' : 'Service');
        if (!inspecting) addBlock(track, displaySlot.end, displaySlot.bufferEnd, 'reserve');
      }
    } else if (!inspecting && recommendation?.backupId === device.id) {
      const currentBackup = evaluateSlots(state).find((slot)=>slot.id===recommendation.id)?.backupChecks.find((backup)=>backup.id===device.id);
      const confirmed = currentBackup?.accepted && state.conditions.planFresh === true && state.conditions.alarmFresh === true;
      addBlock(track, recommendation.start, recommendation.bufferEnd, confirmed ? 'coverage' : 'coverage-unconfirmed', confirmed ? 'Covers Cora' : 'Cover unconfirmed');
    }
    row.append(label, track);
    return row;
  });
  $('calendar-rows').replaceChildren(...rows);
  // Preserve a visible movement between proposals even though the rows are derived afresh.
  if (oldBlocks.size && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('calendar-rows').querySelectorAll('.schedule-block.service,.schedule-block.coverage,.schedule-block.reserve').forEach((block) => {
      const before = oldBlocks.get(`${block.parentElement.dataset.device}-${block.className}`);
      const after = block.style.getPropertyValue('--left');
      if (before && before !== after) block.animate([{left:before},{left:after}], {duration:800,easing:'cubic-bezier(.2,.8,.2,1)'});
    });
  }
  text('chosen-time', displaySlot?.label || 'No eligible window');
  text('chosen-backup', inspecting ? 'Rejected. Handover is still underway.' : recommendation ? `${recommendation.backupName} is the named backup.` : 'A human planner must resolve the constraints.');
  text('calendar-subtitle', inspecting ? 'The room is free. The handover isn’t finished.' : state.phase === 'installing' ? 'Installation is underway. Preserve the existing plan.' : state.phase === 'verified' ? 'Technical result received. Local checks and handback pending.' : state.phase === 'failed' ? 'Failed return. Service intervention required.' : completed ? 'The service handover is complete.' : !recommendation ? 'The current inputs do not permit a service appointment.' : 'Cora’s appointment, with clinical cover.');
  const traces = inspecting
    ? [['Candidate', 'A gap appears after the procedure.'],['Policy',firstCandidate.reasons[0]],['Decision','Reject this window. Keep looking.']]
    : state.continuityAlert && active
    ? [['Alert','The existing service window is preserved.'],['Continuity','Follow the validated procedure; no forced interruption.'],['Backup',state.backupRequest?.status === 'human-coordination-required' ? `Coordinate ${state.backupRequest.name} with the clinical team.` : 'Backup coverage unconfirmed; escalate.']]
    : active
    ? [['Service',state.phase === 'installing' ? 'Human start recorded. Installation underway.' : state.phase === 'verified' ? 'Result received. Local release pending.' : 'Failed return. Service intervention required.'],['Continuity','Cora remains unavailable until human release.'],['Plan',`${recommendation?.backupName || 'The selected device'} is the named backup.`]]
    : completed
    ? [['State','The service handover is complete.'],['Clinical team','Allocate equipment for the next patient.'],['Policy','A completed update is not replanned.']]
    : state.emergency
    ? [['Emergency','Cora is needed before installation.'],['Policy','Old plan withdrawn. Approval required again.'],['Planner',recommendation ? `${recommendation.backupName} is free for the revised window.` : 'No permitted window remains.']]
    : !recommendation
    ? [['Policy','No candidate meets the current constraints.'],['Reason',(evaluateSlots(state).flatMap((slot)=>slot.reasons).find((reason)=>!reason.startsWith('Overlaps')) || 'No eligible candidate.').replace('No ready, compatible, reachable backup is free for the whole protection interval','No ready backup covers the full service and reserve interval.')],['Decision','Resolve the missing conditions before planning.']]
    : [['Scout','17:10 looks empty. Handover still blocks it.'],['Continuity','Arcus is booked. Fritzi is available.'],['Planner','Service and reserve fit before the next case.']];
  $('reason-trace').replaceChildren(...traces.map(([role, message]) => {
    const line = make('div', `trace-line ${role === 'Emergency' ? 'emergency-trace' : ''}`);
    const copy = make('div');
    copy.append(make('b','',`${role}. `),document.createTextNode(message));
    line.append(make('span'),copy);
    return line;
  }));
  const incidentHandled = active ? state.continuityAlert : state.emergency;
  $('emergency-button').disabled = incidentHandled;
  $('emergency-button').replaceChildren(make('span','',incidentHandled ? '✓' : inspecting ? '→' : '↯'),document.createTextNode(inspecting ? 'Check the next window' : incidentHandled ? active ? 'Coordinate backup. Preserve the plan.' : completed ? 'Refer to the clinical team.' : 'Replanned. Care comes first.' : 'An emergency arrives'));
  text('calendar-state', inspecting ? 'CANDIDATE REJECTED BY POLICY' : active ? 'EXISTING INSTALLATION WINDOW PRESERVED' : completed ? 'COMPLETED APPOINTMENT' : state.emergency ? 'PLAN REVISED BEFORE INSTALLATION' : 'SYNTHETIC LIVE DEMONSTRATION');
  text('calendar-verdict', inspecting ? 'An empty calendar slot is not enough.' : active ? state.continuityAlert ? 'Preserve power. Escalate. Coordinate clinical cover.' : 'The appointment remains open until human handback.' : completed ? 'An authorized handover closes the appointment.' : !recommendation ? 'No eligible window. A person must resolve the constraints.' : state.emergency ? 'The appointment moves. The patient doesn’t.' : 'A whole service window. An available backup. A proposal.');
}

function renderState() {
  renderCalendar();
  const prepared = ['prepared','approved','installing','verified','released','failed'].includes(state.phase);
  const connected = prepared && ['powerConnected','networkConnected','powerAvailable','networkAvailable','networkPermitted'].every((key)=>state.conditions[key]===true);
  $('connect').classList.toggle('connected',connected);
  $('connection-cora').src = `assets/characters/${connected ? 'manic' : 'lonely'}.webp`;
  $('connection-cora').alt = connected ? 'Cora with a simulated power and data connection' : 'Cora awaiting a supported connection';
  text('connection-status', connected ? 'Power and data established · simulated' : prepared ? 'Connection not confirmed. Human help required.' : 'Waiting for a supported connection');
  $('connect-button').disabled = prepared;
  $('connect-button').replaceChildren(document.createTextNode(connected ? 'Connection established' : prepared ? 'Check connection' : 'Dispatch companion'),make('span','',connected?'✓':'↗'));
  const slot = state.selectedSlot || getRecommendation(state);
  text('approval-window',slot?.label || 'No candidate');
  text('approval-backup',slot?.backupName || 'Unconfirmed');
  const checks = getStartChecks(state);
  const checkIDs = ['identity','idle','power','connection','package','backup'];
  $('approval-checks').replaceChildren(...checkIDs.map((id) => {
    const check = checks.find((entry) => entry.id === id);
    const row = make('div',`approval-check ${check.ok ? 'ok' : ''}`);
    row.title = check.reason;
    row.append(make('i','',check.ok ? '✓' : '·'),make('span','',check.label));
    return row;
  }));
  $('approve-button').disabled = state.phase !== 'prepared';
  text('approve-button', state.approval ? '✓ This exact appointment is approved' : 'Approve this appointment');
  $('start-button').disabled = !canStart(state).ok;
  text('approval-message', state.phase === 'planning' ? 'Prepare a connection before seeking approval.' : state.phase === 'approved' ? 'One explicit human action still stands between a plan and an update.' : state.phase === 'installing' ? 'A human started the simulated installation.' : 'Approval is tied to this device, task and window.');
  const received = ['verified','released'].includes(state.phase);
  const released = state.phase === 'released';
  document.querySelectorAll('.return-row').forEach((row) => {
    const done = row.dataset.return === 'received' ? received : released;
    row.classList.toggle('done',done);
    row.querySelector('i').textContent = done ? '✓' : '○';
  });
  $('return-cora').src = `assets/characters/${released ? 'bliss' : state.phase === 'failed' ? 'failure' : received ? 'manic' : state.phase === 'installing' ? 'update' : 'lonely'}.webp`;
  $('return-cora').alt = `Cora: ${state.phase === 'verified' ? 'result received, awaiting authorized release' : state.phase}`;
  const returnLabel = {planning:'NO INSTALLATION STARTED',prepared:'PREPARED. NOT STARTED.',approved:'AWAITING HUMAN START',installing:'INSTALLATION IN PROGRESS',verified:'RESULT RECEIVED. RELEASE PENDING.',released:'APPOINTMENT COMPLETE',failed:'EXCEPTION. SERVICE TEAM REQUIRED.'}[state.phase];
  text('return-state',returnLabel);
  const returnButtonLabel = released ? 'Continue to the pilot' : received ? 'Confirm local checks & release' : 'Receive simulated result';
  $('return-button').replaceChildren(document.createTextNode(returnButtonLabel),make('span','',released?'→':'↗'));
  $('return-button').disabled = !['installing','verified','released'].includes(state.phase);
  text('return-note',released ? 'Authorized handover recorded. Cora is available in this demo.' : state.phase === 'failed' ? 'Cora stays unavailable. The backup plan remains with the clinical team.' : state.availability === 'unavailable' ? `${slot?.backupName || 'The named device'} is the planned backup. Cora stays unavailable until release.` : 'Preparation does not take Cora out of clinical service.');
  $('finale-cora').src = `assets/characters/${released ? 'bliss' : 'lonely'}.webp`;
  $('finale-cora').alt = released ? 'Cora after the simulated authorized release' : 'Cora waiting for the handover we are building';
  $('finale-badge').replaceChildren(make('i'),document.createTextNode(released ? 'APPOINTMENT COMPLETE' : 'THE HANDOVER WE’RE BUILDING'));
  const cueText = !launched && sceneIndex === 0 ? 'Start'
    : sceneIndex === 2 && !calendarInspected ? 'Next candidate'
    : sceneIndex === 2 && !state.emergency ? 'Emergency'
    : sceneIndex === 3 && state.phase === 'planning' ? 'Dispatch'
    : sceneIndex === 4 && state.phase === 'prepared' ? 'Approve'
    : sceneIndex === 4 && state.phase === 'approved' ? 'Human start'
    : sceneIndex === 5 && state.phase === 'installing' ? 'Result'
    : sceneIndex === 5 && state.phase === 'verified' ? 'Release'
    : sceneIndex === 7 ? finaleRevealed ? 'Hold' : 'Reveal' : 'Next';
  $('next').replaceChildren(document.createTextNode(cueText),make('span','','→'));
  $('next').setAttribute('aria-label',`${cueText}: next presentation cue`);
}

function toggleNotes(force) {
  $('presenter').hidden = force === undefined ? !$('presenter').hidden : !force;
  $('notes-button').setAttribute('aria-pressed', String(!$('presenter').hidden));
  resize();
}
$('notes-button').addEventListener('click',() => toggleNotes());
$('close-presenter').addEventListener('click',() => toggleNotes(false));
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { notify('Fullscreen is unavailable in this viewer. The presentation still fits the window.'); }
}
$('fullscreen-button').addEventListener('click',fullscreen);
document.addEventListener('fullscreenchange',resize);

function selectTab(name) {
  labTab = name;
  ['system','test','character','evidence'].forEach((id) => {
    $(`lab-${id}`).hidden = id !== name;
    document.querySelector(`[data-tab="${id}"]`).classList.toggle('selected', id === name);
  });
}
function openLab(tab = 'system') {
  clockPause();
  selectTab(tab);
  renderLab();
  if (!$('lab').open) $('lab').showModal();
}
$('lab-button').addEventListener('click',() => openLab());
$('lab-close').addEventListener('click',() => $('lab').close());
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click',() => selectTab(button.dataset.tab)));
$('lab').addEventListener('click',(event) => {
  if (event.target === $('lab')) {
    const rect = $('lab').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('lab').close();
  }
});

const faults = [
  ['routeClear','Route blocked',false],['powerAvailable','Power unavailable',false],
  ['networkAvailable','Connection lost',false],['identityMatched','Wrong device identity',false],
  ['planFresh','Stale calendar',false],['alarmFresh','Stale emergency feed',false],
  ['backupReady','Backup unavailable',false],['packageRecalled','Package recalled',true],
  ['clinicalInUse','Patient examination active',true],['authorizedOperator','Operator unauthorized',false],
];
faults.forEach(([key,label,bad]) => {
  const wrapper = make('label');
  const input = make('input'); input.type='checkbox'; input.dataset.condition=key;
  input.addEventListener('change',() => { labState = transition(labState,{type:'SET_CONDITION',key,value:input.checked?bad:!bad}); renderLab(); });
  wrapper.append(input,document.createTextNode(label));
  $('fault-options').append(wrapper);
});
const unknownClinical = make('label');
const unknownInput = make('input');
unknownInput.type='checkbox';
unknownInput.id='unknown-clinical';
unknownInput.addEventListener('change',()=>{
  labState=transition(labState,{type:'SET_CONDITION',key:'clinicalInUse',value:unknownInput.checked?null:false});
  renderLab();
});
unknownClinical.append(unknownInput,document.createTextNode('Clinical state unknown'));
$('fault-options').append(unknownClinical);
document.querySelectorAll('[data-event]').forEach((button) => button.addEventListener('click',() => {
  labState = transition(labState,{type:button.dataset.event});
  renderLab();
}));
$('lab-reset').addEventListener('click',() => { labState=createScenario(); renderLab(); });
function renderLab() {
  text('lab-phase',`State: ${labState.phase} · Plan revision ${labState.planRevision}`);
  $('lab-checks').replaceChildren(...getStartChecks(labState).map((check) => {
    const row=make('div',`lab-check ${check.ok?'ok':''}`);
    const copy=make('div','',check.label);
    if (!check.ok) copy.append(make('small','',check.reason));
    row.append(make('span','',check.ok?'✓':'×'),copy);
    row.title=check.reason;
    return row;
  }));
  faults.forEach(([key,,bad]) => { document.querySelector(`[data-condition="${key}"]`).checked=labState.conditions[key]===bad; });
  unknownInput.checked=labState.conditions.clinicalInUse===null;
  text('lab-message',labState.lastAction?.message || 'Synthetic sandbox. Try a normal workflow, then change a condition.');
  text('event-trace',escapeJSON({synthetic:true,phase:labState.phase,approval:labState.approval,availability:labState.availability,backupRequest:labState.backupRequest,audit:labState.audit}));
}
$('export-trace').addEventListener('click',() => {
  const blob = new Blob([escapeJSON({synthetic:true,source:'ASTRA local demonstration',state:labState})],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=make('a');link.href=url;link.download='astra-synthetic-trace.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

const moods=[
  ['lonely','Waiting','“Have you forgotten me?”','No contact. Ask for a service handover.'],
  ['manic','Attention','“I have a small request.”','Make an unresolved service need visible.'],
  ['update','Working','“Please don’t unplug me.”','An installation is underway. Preserve power and follow the validated procedure.'],
  ['bliss','Complete','“That was exactly what I needed.”','The fictional happy state follows an authorized release in our demonstration.'],
  ['failure','Exception','“I need a human.”','Keep the device unavailable. Route the failure and coordinate backup.'],
  ['rollback','Recovery','“This part takes a professional.”','Recovery follows the manufacturer procedure. Duration is not guaranteed.'],
];
function setMood(index) {
  const [asset,,title,copy]=moods[index];
  $('lab-character-image').src=`assets/characters/${asset}.webp`;
  $('lab-character-image').alt=`Cora: ${moods[index][1]}`;
  text('lab-character-title',title);text('lab-character-copy',copy);
  [...$('mood-buttons').children].forEach((button,i) => button.classList.toggle('selected',i===index));
}
moods.forEach((mood,i) => { const button=make('button','',mood[1]);button.addEventListener('click',()=>setMood(i));$('mood-buttons').append(button); });
setMood(0);

document.addEventListener('keydown',(event) => {
  if (event.target.closest('input,textarea,select') || event.altKey || event.ctrlKey || event.metaKey) return;
  if ($('lab').open) return; // Native dialog owns Escape and focus; no hidden slide changes.
  if (event.target.closest('button,a,summary') && [' ','Enter'].includes(event.key)) return;
  if (['ArrowRight','PageDown',' '].includes(event.key)) {event.preventDefault();nextCue();}
  if (['ArrowLeft','PageUp'].includes(event.key)) {event.preventDefault();showScene(sceneIndex-1);}
  if (event.key==='Home') {event.preventDefault();showScene(0);}
  if (event.key==='End') {event.preventDefault();showScene(7);}
  if (event.key.toLowerCase()==='n') toggleNotes();
  if (event.key.toLowerCase()==='q') openLab();
  if (event.key.toLowerCase()==='f') fullscreen();
  if (event.key.toLowerCase()==='p') clockStartedAt===null?clockRun():clockPause();
});

// Stable public controls for rehearsal assistants. No eval, hidden actions or network.
window.astra = Object.freeze({
  version:'1.0.0',
  getState:() => structuredClone({scene:STORY[sceneIndex].id,sceneIndex,elapsed:elapsed(),workflow:state,lab:labState}),
  next:nextCue,
  previous:() => showScene(sceneIndex-1),
  goTo:(id) => { const index=STORY.findIndex((cue)=>cue.id===id); if(index<0) throw new RangeError(`Unknown scene: ${id}`);showScene(index); },
  start:startPitch,
  dispatch:(event) => structuredClone(send(event)),
  notes:toggleNotes,
  appendix:openLab,
  reset:() => {hideFilm();resetOpening();state=createScenario();calendarInspected=false;finaleRevealed=false;clockReset();launched=false;$('launch').classList.remove('started');$('launch').replaceChildren(document.createTextNode('Start pitch'),make('span','','▶'));showScene(0);},
});

showScene(sceneIndex);
if (new URLSearchParams(location.search).has('notes')) toggleNotes(true);
renderLab();
resize();
