import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createScenario, evaluateSlots, getRecommendation, getStartChecks,
  canStart, transition,
} from '../engine.mjs';

const event = (state, type, extra = {}) => transition(state, { type, ...extra });
const ready = () => event(event(createScenario(), 'PREPARE'), 'ATTEST');
const running = () => event(ready(), 'START');

test('candidate search rejects handover conflict and reserves a truly free backup', () => {
  const slots = evaluateSlots(createScenario());
  assert.equal(slots[0].accepted, false);
  assert.match(slots[0].explanation, /handover/);
  assert.equal(slots[1].accepted, true);
  assert.equal(slots[1].backupId, 'FRITZI');
  assert.equal(slots[1].backupChecks.find((b) => b.id === 'ARCUS').accepted, false);
  assert.equal(slots[2].backupId, 'ARCUS');
  assert.equal(slots[2].backupChecks.find((b) => b.id === 'FRITZI').accepted, false);
});

test('backup must cover contingency as well as installation', () => {
  const state = createScenario();
  state.backups[1].busy = [{ start: 19 * 60 + 45, end: 20 * 60 }];
  assert.equal(evaluateSlots(state)[1].accepted, false);
  assert.equal(getRecommendation(state).id, 'later');
});

test('missing or stale schedule, unknown emergency state, and unknown backup schedule fail closed', () => {
  for (const key of ['planFresh', 'alarmFresh']) {
    for (const value of [false, null]) {
      assert.equal(getRecommendation(createScenario({ conditions: { [key]: value } })), null);
    }
  }
  const state = createScenario();
  state.backups.forEach((backup) => { backup.scheduleKnown = false; });
  assert.equal(getRecommendation(state), null);
});

test('no preparation or model recommendation can substitute for human approval and start', () => {
  const initial = createScenario();
  assert.equal(event(initial, 'START').phase, 'planning');
  const prepared = event(initial, 'PREPARE');
  assert.equal(prepared.phase, 'prepared');
  assert.equal(prepared.availability, 'available');
  assert.equal(canStart(prepared).ok, false);
  assert.equal(event(prepared, 'START').phase, 'prepared');
  const approved = event(prepared, 'ATTEST');
  assert.equal(approved.phase, 'approved');
  assert.equal(approved.availability, 'available');
  assert.equal(canStart(approved).ok, true);
  assert.equal(event(approved, 'START').phase, 'installing');
});

test('identity, route, environment, policy, power and connection faults stop preparation', () => {
  for (const key of ['identityMatched', 'routeClear', 'environmentClear', 'networkPermitted', 'powerAvailable', 'networkAvailable']) {
    const result = event(createScenario({ conditions: { [key]: false } }), 'PREPARE');
    assert.equal(result.phase, 'planning', key);
    assert.equal(result.lastAction.ok, false, key);
  }
  for (const value of [true, null]) {
    assert.equal(event(createScenario({ conditions: { clinicalInUse: value } }), 'PREPARE').lastAction.ok, false);
  }
});

test('each start gate is enforced even if state changes after approval', () => {
  const invalid = {
    planFresh: false, alarmFresh: false, routeClear: false, identityMatched: false,
    environmentClear: false, packageVerified: false, packageRecalled: true,
    packageApproved: false, networkPermitted: false, powerAvailable: false,
    networkAvailable: false, powerConnected: false, networkConnected: false,
    authorizedOperator: false, clinicalInUse: true, backupReady: false,
  };
  for (const [key, value] of Object.entries(invalid)) {
    const state = ready();
    state.conditions[key] = value; // Simulates changed sensor data, even without reducer invalidation.
    assert.equal(canStart(state).ok, false, key);
    assert.notEqual(event(state, 'START').phase, 'installing', key);
  }
});

test('unknown clinical, package revocation, and positive safety flags block starts', () => {
  for (const key of Object.keys(createScenario().conditions)) {
    const state = ready();
    state.conditions[key] = null;
    assert.equal(canStart(state).ok, false, key);
  }
});

test('emergency before installation recomputes slot and backup, invalidating approval', () => {
  const approved = ready();
  const state = event(approved, 'EMERGENCY');
  assert.equal(state.phase, 'planning');
  assert.equal(state.approval, null);
  assert.equal(state.conditions.powerConnected, false);
  assert.equal(state.planRevision, approved.planRevision + 1);
  assert.equal(getRecommendation(state).id, 'later');
  assert.equal(getRecommendation(state).backupId, 'ARCUS');
  assert.equal(canStart(state).ok, false);
  const fresh = event(event(state, 'PREPARE'), 'ATTEST');
  assert.equal(fresh.approval.planRevision, state.planRevision);
  const started = event(fresh, 'START');
  assert.equal(started.phase, 'installing');
  assert.equal(started.emergency, true); // Historical pre-start event, not a new active incident.
  assert.equal(started.continuityAlert, false);
  assert.equal(started.backupRequest, null);
  const newEmergency = event(started, 'EMERGENCY');
  assert.equal(newEmergency.continuityAlert, true);
  assert.equal(newEmergency.backupRequest.id, 'ARCUS');
});

test('old approval cannot authorize a changed window or package', () => {
  const state = ready();
  state.planRevision += 1;
  assert.equal(canStart(state).ok, false);
  state.planRevision -= 1;
  state.target.packageId = 'different-package';
  assert.equal(canStart(state).ok, false);
  const changedTime = ready();
  changedTime.slots.find((slot) => slot.id === 'first').start += 10;
  assert.equal(canStart(changedTime).ok, false);
  const changedDevice = ready();
  changedDevice.target.id = 'ANOTHER-DEVICE';
  assert.equal(canStart(changedDevice).ok, false);
});

test('new signal invalidates previous readiness and approval even when restored', () => {
  const changed = event(ready(), 'SET_CONDITION', { key: 'networkAvailable', value: false });
  assert.equal(changed.phase, 'planning');
  assert.equal(changed.approval, null);
  const restored = event(changed, 'SET_CONDITION', { key: 'networkAvailable', value: true });
  assert.equal(canStart(restored).ok, false);
  assert.equal(restored.conditions.networkConnected, false);
});

test('emergency during installation never aborts, replans or cuts power', () => {
  const before = running();
  const after = event(before, 'EMERGENCY');
  assert.equal(after.phase, 'installing');
  assert.equal(after.availability, 'unavailable');
  assert.deepEqual(after.selectedSlot, before.selectedSlot);
  assert.equal(after.conditions.powerConnected, true);
  assert.equal(after.continuityAlert, true);
  assert.equal(after.backupRequest.id, 'FRITZI');
  assert.equal(after.backupRequest.status, 'human-coordination-required');
  assert.equal(getRecommendation(after).id, 'first');
});

test('unknown backup after installation causes escalation, not a false coverage promise', () => {
  for (const key of ['backupReady', 'planFresh', 'alarmFresh']) {
    const after = event(running(), 'SET_CONDITION', { key, value: false });
    assert.equal(after.backupRequest.status, 'coverage-unconfirmed', key);
    assert.equal(after.backupRequest.id, null, key);
    assert.equal(after.phase, 'installing');
  }
});

test('failed update cannot become available or claim instant rollback', () => {
  const failed = event(running(), 'VERIFY_FAILURE');
  assert.equal(failed.phase, 'failed');
  assert.equal(failed.availability, 'unavailable');
  assert.equal(event(failed, 'RELEASE').lastAction.ok, false);
  assert.equal(event(failed, 'VERIFY_SUCCESS').lastAction.ok, false);
  assert.match(failed.lastAction.message, /duration is unknown/);
  const localFailure = event(event(running(), 'VERIFY_SUCCESS'), 'VERIFY_FAILURE');
  assert.equal(localFailure.phase, 'failed');
  assert.equal(localFailure.availability, 'unavailable');
  assert.equal(event(localFailure, 'RELEASE').lastAction.ok, false);
});

test('verification and human handback are separate gates', () => {
  const state = running();
  assert.equal(event(state, 'RELEASE').phase, 'installing');
  const verified = event(state, 'VERIFY_SUCCESS');
  assert.equal(verified.phase, 'verified');
  assert.equal(verified.availability, 'unavailable');
  const released = event(verified, 'RELEASE');
  assert.equal(released.phase, 'released');
  assert.equal(released.availability, 'available');
});

test('lost communication blocks completion and handback', () => {
  const lost = event(running(), 'SET_CONDITION', { key: 'networkConnected', value: false });
  assert.equal(event(lost, 'VERIFY_SUCCESS').lastAction.ok, false);
  const verified = event(running(), 'VERIFY_SUCCESS');
  const changed = event(verified, 'SET_CONDITION', { key: 'identityMatched', value: false });
  assert.equal(event(changed, 'RELEASE').lastAction.ok, false);
  const recalled = event(verified, 'SET_CONDITION', { key: 'packageRecalled', value: true });
  assert.equal(event(recalled, 'RELEASE').lastAction.ok, false);
});

test('motion update cannot enter this unattended security-update workflow', () => {
  const state = createScenario({ target: { updateKind: 'motion' } });
  assert.equal(getRecommendation(state), null);
  assert.equal(event(state, 'PREPARE').lastAction.ok, false);
});

test('repeated or out-of-order actions cannot fabricate progress', () => {
  assert.equal(event(createScenario(), 'ATTEST').lastAction.ok, false);
  assert.equal(event(createScenario(), 'VERIFY_SUCCESS').lastAction.ok, false);
  const state = running();
  assert.equal(event(state, 'START').lastAction.ok, false);
  assert.equal(event(state, 'PREPARE').lastAction.ok, false);
});

test('transitions preserve prior snapshots and produce reproducible audit records', () => {
  const initial = createScenario();
  const before = structuredClone(initial);
  const a = event(initial, 'PREPARE');
  const b = event(initial, 'PREPARE');
  assert.deepEqual(initial, before);
  assert.deepEqual(a, b);
  assert.equal(a.audit[0].sequence, 1);
  assert.ok(a.audit[0].ruleVersion);
  assert.deepEqual(getStartChecks(a).find((check) => check.id === 'approval').ok, false);
});
