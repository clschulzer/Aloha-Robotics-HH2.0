/**
 * C-ARMAGOTCHI: deterministic, synthetic workflow demonstrator.
 *
 * This module has no device, network, hospital, robot or AI-model integration.
 * "Verified" fields model inputs a validated integration would have to provide.
 * Time advances explicitly for the compressed demo; no real update is started.
 */
export const RULES = Object.freeze({
  installationMinutes: 120,
  handoverMinutes: 20,
  contingencyMinutes: 30,
  version: 'astra-demo-1',
});

export const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  return `${String(hour % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}${hour >= 24 ? ' +1d' : ''}`;
};
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const positive = (value) => value === true;
const lockedPhases = new Set(['installing', 'verified', 'failed', 'released']);
const clone = (value) => structuredClone(value);

export function createScenario(overrides = {}) {
  const base = {
    synthetic: true,
    phase: 'planning',
    planRevision: 1,
    selectedSlot: null,
    approval: null,
    startConfirmation: null,
    outcome: null,
    availability: 'available',
    emergency: false,
    emergencyBlocks: [],
    continuityAlert: false,
    backupRequest: null,
    lastAction: null,
    audit: [],
    conditions: {
      planFresh: true,
      alarmFresh: true,
      routeClear: true,
      identityMatched: true,
      environmentClear: true,
      packageVerified: true,
      packageRecalled: false,
      packageApproved: true,
      networkPermitted: true,
      powerAvailable: true,
      networkAvailable: true,
      powerConnected: false,
      networkConnected: false,
      authorizedOperator: true,
      clinicalInUse: false,
      backupReady: true,
    },
    target: {
      id: 'CORA',
      name: 'Cora',
      updateKind: 'security',
      packageId: 'SEC-DEMO-042',
      nextUse: 24 * 60 + 7 * 60,
      busy: [{ start: 8 * 60, end: 17 * 60 }],
    },
    backups: [
      {
        id: 'ARCUS',
        name: 'Arcus',
        compatible: true,
        ready: true,
        reachable: true,
        scheduleKnown: true,
        busy: [{ start: 17 * 60, end: 18 * 60 + 30 }],
      },
      {
        id: 'FRITZI',
        name: 'Fritzi',
        compatible: true,
        ready: true,
        reachable: true,
        scheduleKnown: true,
        busy: [{ start: 20 * 60, end: 23 * 60 }],
      },
    ],
    slots: [
      { id: 'early', start: 17 * 60 + 10 },
      { id: 'first', start: 17 * 60 + 30 },
      { id: 'later', start: 20 * 60 },
    ],
  };
  // Useful for synthetic tests and controlled fault injection. No persisted state.
  return {
    ...base,
    ...clone(overrides),
    conditions: { ...base.conditions, ...clone(overrides.conditions || {}) },
    target: { ...base.target, ...clone(overrides.target || {}) },
  };
}

function backupsFor(state, slot) {
  const interval = { start: slot.start, end: slot.bufferEnd };
  return state.backups.map((backup) => {
    const reasons = [];
    if (!positive(state.conditions.planFresh) || !positive(state.conditions.alarmFresh)) reasons.push('current plan or emergency status unavailable');
    if (!positive(state.conditions.backupReady) || !positive(backup.ready)) reasons.push('not confirmed ready');
    if (!positive(backup.compatible)) reasons.push('clinical compatibility unconfirmed');
    if (!positive(backup.reachable)) reasons.push('transfer route unconfirmed');
    if (!positive(backup.scheduleKnown) || !Array.isArray(backup.busy)) reasons.push('schedule unavailable');
    else if (backup.busy.some((block) => overlaps(interval, block))) reasons.push('already booked during protection interval');
    return { id: backup.id, name: backup.name, accepted: reasons.length === 0, reasons };
  });
}

/** Evaluate real constraints on synthetic candidate slots; explanations are derived from them. */
export function evaluateSlots(state) {
  return state.slots.map((candidate) => {
    const end = candidate.start + RULES.installationMinutes;
    const bufferEnd = end + RULES.contingencyMinutes;
    const protectedInterval = { start: candidate.start - RULES.handoverMinutes, end: bufferEnd };
    const reasons = [];
    if (!positive(state.conditions.planFresh)) reasons.push('Operating schedule missing or stale');
    if (!positive(state.conditions.alarmFresh)) reasons.push('Emergency feed missing or stale');
    if (!Array.isArray(state.target.busy)) reasons.push('Target schedule unavailable');
    else if (state.target.busy.some((block) => overlaps(protectedInterval, block))) {
      reasons.push('Overlaps a procedure or the 20-minute handover');
    }
    if (state.emergencyBlocks.some((block) => overlaps(protectedInterval, block))) {
      reasons.push('Emergency demand overlaps this protected window');
    }
    if (state.target.updateKind !== 'security') reasons.push('This update needs an on-site service workflow');
    if (!Number.isFinite(state.target.nextUse) || bufferEnd > state.target.nextUse) {
      reasons.push('Insufficient time before the next planned use');
    }
    const slot = { ...candidate, end, bufferEnd };
    const backupChecks = backupsFor(state, slot);
    const backup = backupChecks.find((item) => item.accepted);
    if (!backup) reasons.push('No ready, compatible, reachable backup is free for the whole protection interval');
    return {
      ...slot,
      accepted: reasons.length === 0,
      reasons,
      backupId: backup?.id || null,
      backupName: backup?.name || null,
      backupChecks,
      durationMinutes: RULES.installationMinutes,
      bufferMinutes: RULES.contingencyMinutes,
      label: `${formatTime(candidate.start)}–${formatTime(end)}`,
      protectionLabel: `${formatTime(candidate.start)}–${formatTime(bufferEnd)}`,
      explanation: reasons.length
        ? reasons.join(' · ')
        : `120 minutes to install, 30 minutes reserved; ${backup.name} is ready, compatible, reachable and free until ${formatTime(bufferEnd)}.`,
    };
  });
}

export function getRecommendation(state) {
  // Replanning an update already underway would imply an unsafe ability to stop it.
  if (lockedPhases.has(state.phase)) return state.selectedSlot;
  return evaluateSlots(state).find((slot) => slot.accepted) || null;
}

function currentSlot(state) {
  if (!state.selectedSlot) return null;
  return evaluateSlots(state).find((slot) => slot.id === state.selectedSlot.id) || null;
}

/** Gates are data, so the presentation can show the exact same checks used by START. */
export function getStartChecks(state) {
  const c = state.conditions;
  const slot = currentSlot(state);
  const sameInterval = slot
    && slot.start === state.selectedSlot.start
    && slot.end === state.selectedSlot.end
    && slot.bufferEnd === state.selectedSlot.bufferEnd;
  const matchingBackup = slot && slot.backupChecks.find((item) => item.id === state.selectedSlot.backupId && item.accepted);
  const approvalValid = state.approval
    && state.approval.planRevision === state.planRevision
    && state.approval.slotId === state.selectedSlot?.id
    && state.approval.deviceId === state.target.id
    && state.approval.packageId === state.target.packageId
    && state.approval.start === state.selectedSlot?.start
    && state.approval.end === state.selectedSlot?.end
    && state.approval.backupId === state.selectedSlot?.backupId;
  const rows = [
    ['schedule', 'Protected calendar window', !!slot?.accepted && !!sameInterval, slot?.explanation || 'Prepare a permitted window first'],
    ['freshness', 'Fresh plan and emergency feed', positive(c.planFresh) && positive(c.alarmFresh), 'Missing or stale inputs block a start'],
    ['backup', 'Backup coverage reserved', !!matchingBackup, state.selectedSlot ? `${state.selectedSlot.backupName}: readiness, compatibility, route and complete calendar interval` : 'A named backup must cover the full interval'],
    ['idle', 'C-arm idle', c.clinicalInUse === false, 'No start during a clinical examination; unknown state also blocks'],
    ['route', 'Robot route clear', positive(c.routeClear), 'Blocked physical access requires human help'],
    ['identity', 'Correct device identified', positive(c.identityMatched), 'Reported serial number must match the planned device'],
    ['surroundings', 'Surroundings reported clear', positive(c.environmentClear), 'Fresh local report required; the demo does not infer safety from a camera'],
    ['package', 'Package permitted and checked', positive(c.packageVerified) && positive(c.packageApproved) && c.packageRecalled === false, 'Package must be checked, locally approved and not recalled'],
    ['type', 'Eligible security update', state.target.updateKind === 'security', 'Motion/calibration updates use a supervised on-site workflow'],
    ['power', 'Power established', positive(c.powerAvailable) && positive(c.powerConnected), 'A real implementation must validate supply, load and runtime; this is a simulated signal'],
    ['connection', 'Approved connection established', positive(c.networkPermitted) && positive(c.networkAvailable) && positive(c.networkConnected), 'Connection policy and a verified link are both required'],
    ['operator', 'Authorized human operator', positive(c.authorizedOperator), 'The hospital determines the permitted role'],
    ['approval', 'Human approves this exact plan', !!approvalValid, `Approval is bound to plan v${state.planRevision}, device, package, window and backup`],
    ['state', 'Prepared for an explicit start', ['prepared', 'approved'].includes(state.phase), 'Only an explicit human START can begin installation'],
  ];
  return rows.map(([id, label, ok, reason]) => ({ id, label, ok, reason }));
}

export function canStart(state) {
  const checks = getStartChecks(state);
  return { ok: checks.every((check) => check.ok), checks, reasons: checks.filter((check) => !check.ok).map((check) => check.label) };
}

function record(state, type, message, ok = true) {
  state.lastAction = { type, ok, message };
  state.audit.push({
    sequence: state.audit.length + 1,
    type,
    ok,
    phase: state.phase,
    planRevision: state.planRevision,
    ruleVersion: RULES.version,
    message,
  });
  return state;
}

function invalidate(state) {
  state.approval = null;
  state.startConfirmation = null;
  state.selectedSlot = null;
  state.phase = 'planning';
  state.planRevision += 1;
  state.conditions.powerConnected = false;
  state.conditions.networkConnected = false;
}

function requestBackup(state, reason) {
  const slot = currentSlot(state);
  const reserved = slot?.backupChecks.find((item) => item.id === state.selectedSlot?.backupId && item.accepted);
  state.continuityAlert = true;
  state.backupRequest = {
    id: reserved?.id || null,
    name: reserved?.name || null,
    status: reserved ? 'human-coordination-required' : 'coverage-unconfirmed',
    reason,
  };
}

/**
 * Immutable reducer. Events:
 * PREPARE, ATTEST, START, VERIFY_SUCCESS, VERIFY_FAILURE, RELEASE, EMERGENCY,
 * SET_CONDITION {key,value}, RESET.
 * ATTEST, START and RELEASE are explicit simulated human actions.
 */
export function transition(previous, event) {
  if (!event || typeof event.type !== 'string') throw new TypeError('An event type is required');
  if (event.type === 'RESET') return createScenario();
  const state = clone(previous);
  const c = state.conditions;
  switch (event.type) {
    case 'PREPARE': {
      if (!['planning', 'prepared'].includes(state.phase)) {
        return record(state, event.type, 'Preparation cannot change an approved or active update. Reset the demo to begin another mission.', false);
      }
      const candidate = getRecommendation(state);
      if (!candidate) return record(state, event.type, 'No permitted window. A human planner must resolve the listed constraints.', false);
      const blockers = [
        [c.routeClear, 'route blocked'],
        [c.identityMatched, 'device identity unconfirmed'],
        [c.environmentClear, 'surroundings unconfirmed'],
        [c.networkPermitted, 'hospital connection policy denies access'],
        [c.powerAvailable, 'power supply unavailable'],
        [c.networkAvailable, 'approved connection unavailable'],
        [c.clinicalInUse === false, 'C-arm clinical use is active or unknown'],
      ].filter(([value]) => !positive(value)).map(([, reason]) => reason);
      if (blockers.length) return record(state, event.type, `Robot mission held: ${blockers.join('; ')}. Request human assistance.`, false);
      state.selectedSlot = candidate;
      state.approval = null;
      state.phase = 'prepared';
      c.powerConnected = true;
      c.networkConnected = true;
      return record(state, event.type, `Simulated robot mission: identify Cora, reach its accessible park position, establish power and approved Ethernet. ${candidate.label}; ${candidate.backupName} reserved through ${formatTime(candidate.bufferEnd)}. Package preparation is not installation.`);
    }
    case 'ATTEST': {
      const blocking = getStartChecks(state).filter((check) => check.id !== 'approval' && !check.ok);
      if (blocking.length) return record(state, event.type, `Human approval blocked: ${blocking.map((check) => check.label).join('; ')}.`, false);
      state.approval = {
        planRevision: state.planRevision,
        slotId: state.selectedSlot.id,
        packageId: state.target.packageId,
        deviceId: state.target.id,
        start: state.selectedSlot.start,
        end: state.selectedSlot.end,
        backupId: state.selectedSlot.backupId,
        role: 'authorized clinical engineering operator (simulated)',
      };
      state.phase = 'approved';
      return record(state, event.type, `Human approved plan v${state.planRevision}, Cora, ${state.target.packageId}, ${state.selectedSlot.label}, backup ${state.selectedSlot.backupName}. Installation has not started.`);
    }
    case 'START': {
      const decision = canStart(state);
      if (!decision.ok) return record(state, event.type, `Start blocked: ${decision.reasons.join('; ')}.`, false);
      state.phase = 'installing';
      state.availability = 'unavailable';
      state.startConfirmation = { planRevision: state.planRevision, role: 'authorized human (simulated)' };
      return record(state, event.type, `At simulated ${formatTime(state.selectedSlot.start)}, a human explicitly starts the 120-minute installation. Cora is unavailable; maintain power and monitor. No safe-abort claim.`);
    }
    case 'EMERGENCY': {
      state.emergency = true;
      if (state.phase === 'released') return record(state, event.type, 'Emergency received after handback. Cora is released; the clinical team allocates equipment.');
      if (lockedPhases.has(state.phase)) {
        requestBackup(state, 'Emergency arrived after installation started');
        const context = state.phase === 'installing'
          ? 'Emergency during installation: do not abort or unplug.'
          : state.phase === 'verified'
            ? 'Emergency before handback: technical completion is reported, but Cora is not yet released.'
            : 'Emergency while Cora requires recovery: keep the device unavailable.';
        return record(state, event.type, state.backupRequest.id
          ? `${context} Request ${state.backupRequest.name} through the clinical team. Cora remains unavailable until verified and released.`
          : `${context} Backup coverage is unconfirmed; escalate to the clinical team. Cora remains unavailable.`);
      }
      state.emergencyBlocks = [{ start: 17 * 60 + 20, end: 19 * 60 + 10 }];
      invalidate(state);
      const next = getRecommendation(state);
      return record(state, event.type, next
        ? `Emergency demand blocks 17:20–19:10. Old approval and physical readiness are withdrawn. Replanned ${next.label}, backup ${next.backupName}; prepare and obtain a fresh human approval.`
        : 'Emergency demand invalidates the plan. No feasible window remains; escalate to a human planner.');
    }
    case 'SET_CONDITION': {
      if (!Object.hasOwn(c, event.key)) throw new TypeError(`Unknown condition: ${event.key}`);
      if (![true, false, null].includes(event.value)) throw new TypeError('A condition must be true, false, or unknown (null)');
      if (c[event.key] === event.value) return record(state, event.type, `${event.key} is unchanged.`);
      c[event.key] = event.value;
      if (state.phase === 'released') return record(state, event.type, `Post-handback signal changed: ${event.key}. No new update starts automatically.`);
      if (lockedPhases.has(state.phase)) {
        requestBackup(state, `Signal changed: ${event.key}`);
        return record(state, event.type, `Signal changed during ${state.phase}: ${event.key}. Alert the responsible team; do not infer safe cancellation, a completed update, or restored readiness.`);
      }
      invalidate(state);
      return record(state, event.type, `Signal changed: ${event.key}. Plan v${state.planRevision}; previous preparation and approval invalidated.`);
    }
    case 'VERIFY_SUCCESS': {
      if (state.phase !== 'installing') return record(state, event.type, 'A completion receipt is only accepted for an installation underway.', false);
      if (![c.powerAvailable, c.powerConnected, c.networkPermitted, c.networkAvailable, c.networkConnected, c.identityMatched].every(positive)) {
        return record(state, event.type, 'Cannot accept a success receipt without confirmed power, communication and device identity. Keep unavailable and escalate.', false);
      }
      state.phase = 'verified';
      state.outcome = 'demo-version-and-self-test-confirmed';
      return record(state, event.type, `After simulated ${formatTime(state.selectedSlot.end)}: expected version and device-specific post-checks report success. Cora remains unavailable until human handback.`);
    }
    case 'VERIFY_FAILURE': {
      if (!['installing', 'verified'].includes(state.phase)) {
        return record(state, event.type, 'An update failure can be reported during installation or checks before handback.', false);
      }
      state.phase = 'failed';
      state.outcome = 'completion-missing-or-failed';
      requestBackup(state, 'No verified successful completion');
      return record(state, event.type, 'Completion missing or failed. Keep Cora unavailable, preserve diagnostic evidence, notify the responsible service team and coordinate backup. Recovery follows the manufacturer procedure; its duration is unknown.');
    }
    case 'RELEASE': {
      if (state.phase !== 'verified' || state.outcome !== 'demo-version-and-self-test-confirmed' || !positive(c.authorizedOperator)) {
        return record(state, event.type, 'Handback requires verified completion and an authorized human.', false);
      }
      if (![c.powerAvailable, c.powerConnected, c.networkPermitted, c.networkAvailable, c.networkConnected, c.identityMatched,
        c.environmentClear, c.packageApproved, c.packageVerified, c.packageRecalled === false, c.clinicalInUse === false].every(positive)) {
        return record(state, event.type, 'Handback blocked: readiness evidence is no longer current.', false);
      }
      state.phase = 'released';
      state.availability = 'available';
      return record(state, event.type, 'Authorized human confirms handback after verified completion. Cora is available. The mock receipt records the complete decision trail.');
    }
    default:
      throw new TypeError(`Unknown event: ${event.type}`);
  }
}
