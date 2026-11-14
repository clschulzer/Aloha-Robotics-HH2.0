import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WINDOW, DURATION, initialState, restoreState, reduce, canStart, progress, deviceMood,
} from '../state.mjs';

const NOW = 1_800_000_000_000;
const advance = (s, type, extra = {}, now = NOW) => reduce(s, { type, ...extra }, now);
const count = (s, id) => s.events.filter(e => e.id === id).length;
const unchecked = s => Object.values(s.checks).every(value => value === false);

function humanReady(now = NOW) {
  let s = advance(initialState(now), 'accept', {}, now);
  for (const key of ['device', 'power', 'clear']) s = advance(s, 'prep', { key, value: true }, now);
  return advance(s, 'prepared', {}, now);
}
function robotReady(now = NOW) {
  let s = advance(initialState(now), 'decline', {}, now);
  s = advance(s, 'tick', {}, now + DURATION.circle);
  s = advance(s, 'dispatch', {}, now + DURATION.circle);
  return advance(s, 'tick', {}, now + DURATION.circle + DURATION.mission);
}
function confirmed(s, now = NOW) {
  for (const key of ['time', 'area', 'drapes', 'brakes', 'power']) {
    s = advance(s, 'check', { key, value: true }, now);
  }
  return s;
}
function running(now = NOW) {
  return advance(confirmed(humanReady(now), now), 'start', { confirmed: true }, now);
}

test('latest pitch proposal comes from the scorer: Cio, 19:10, Fritzi, recovery to 21:40', () => {
  assert.deepEqual(
    { device: WINDOW.device, from: WINDOW.from, to: WINDOW.to, guard: WINDOW.guard, backup: WINDOW.backup, backupId: WINDOW.backupId, duration: WINDOW.duration },
    { device: 'C-03', from: '19:10', to: '21:10', guard: '21:40', backup: 'Fritzi', backupId: 'C-05', duration: 120 },
  );
  assert.equal(initialState(NOW).events[0].detail.includes('19:10–21:10'), true);
});

test('new visitor sees an outstanding request without approval or timer', () => {
  const s = initialState(NOW);
  assert.equal(s.phase, 'idle');
  assert.equal(deviceMood(s), 'hungry');
  assert.equal(canStart(s), false);
  assert.equal(s.approvals, 0);
  assert.equal(s.updateAt, null);
  assert.equal(s.events.length, 2);
});

test('accepting the job requires every preparation item before review', () => {
  let s = advance(initialState(NOW), 'accept');
  assert.equal(s.path, 'human');
  s = advance(s, 'prepared');
  assert.equal(s.phase, 'preparing');
  for (const key of ['device', 'power']) s = advance(s, 'prep', { key, value: true });
  s = advance(s, 'prepared');
  assert.equal(s.phase, 'preparing');
  s = advance(s, 'prep', { key: 'clear', value: true });
  s = advance(s, 'prepared');
  assert.equal(s.phase, 'review');
  assert.equal(s.approvals, 0);
  assert.equal(unchecked(s), true);
});

test('declining searches the circle and never dispatches before the search ends', () => {
  let s = advance(initialState(NOW), 'decline');
  assert.equal(s.path, 'robot');
  assert.equal(s.phase, 'circle');
  s = advance(s, 'dispatch');
  assert.equal(s.phase, 'circle');
  s = advance(s, 'tick', {}, NOW + DURATION.circle - 1);
  assert.equal(s.circleReady, false);
  s = advance(s, 'tick', {}, NOW + DURATION.circle);
  assert.equal(s.circleReady, true);
  assert.equal(s.phase, 'circle', 'A completed search must still await the dispatch tap');
});

test('robot mission stops at human review even after a long unattended interval', () => {
  const s = robotReady();
  assert.equal(s.phase, 'review');
  assert.equal(s.path, 'robot');
  assert.equal(unchecked(s), true);
  assert.equal(s.approvals, 0);
  assert.equal(canStart(s), false);
  const later = advance(s, 'tick', {}, NOW + 86_400_000);
  assert.equal(later.phase, 'review');
  assert.equal(later.approvals, 0);
  assert.equal(later.updateAt, null);
  assert.equal(count(later, 'ready'), 1);
});

test('time approval alone cannot start an update', () => {
  let s = advance(humanReady(), 'check', { key: 'time', value: true });
  assert.equal(canStart(s), false);
  s = advance(s, 'start', { confirmed: true });
  assert.equal(s.phase, 'review');
  assert.equal(s.approvals, 0);
});

test('each missing review item blocks start, for both human and robot preparation', () => {
  for (const ready of [humanReady, robotReady]) {
    for (const missing of ['time', 'area', 'drapes', 'brakes', 'power']) {
      let s = confirmed(ready());
      s = advance(s, 'check', { key: missing, value: false });
      assert.equal(canStart(s), false, `${ready.name}: ${missing}`);
      s = advance(s, 'start', { confirmed: true });
      assert.equal(s.phase, 'review');
      assert.equal(s.approvals, 0);
    }
  }
});

test('procedure and off-shift availability prevent an otherwise eligible start', () => {
  for (const availability of ['procedure', 'off']) {
    let s = advance(confirmed(humanReady()), 'availability', { value: availability });
    assert.equal(canStart(s), false);
    s = advance(s, 'start', { confirmed: true });
    assert.equal(s.phase, 'review');
    assert.equal(s.approvals, 0);
  }
});

test('passing every check never starts without the separate confirmation action', () => {
  const s = confirmed(robotReady());
  assert.equal(canStart(s), true);
  assert.equal(advance(s, 'tick', {}, NOW + 86_400_000).phase, 'review');
  assert.equal(advance(s, 'start').phase, 'review');
  assert.equal(advance(s, 'start', { confirmed: false }).phase, 'review');
  assert.equal(s.approvals, 0);
});

test('explicit final action starts exactly one update and records the correct scenario time', () => {
  const s = running();
  assert.equal(s.phase, 'updating');
  assert.equal(s.approvals, 1);
  assert.equal(s.updateAt, NOW);
  assert.equal(deviceMood(s), 'installing');
  assert.equal(count(s, 'approved'), 1);
  assert.equal(s.events.find(e => e.id === 'approved').time, '19:10');
  const duplicate = advance(s, 'start', { confirmed: true }, NOW + 1000);
  assert.equal(duplicate.updateAt, NOW);
  assert.equal(duplicate.approvals, 1);
  assert.equal(count(duplicate, 'approved'), 1);
});

test('rapid duplicate accepts, declines and dispatches do not create extra jobs', () => {
  let s = advance(initialState(NOW), 'accept');
  s = advance(s, 'accept');
  s = advance(s, 'decline');
  assert.equal(s.phase, 'preparing');
  assert.equal(count(s, 'accepted'), 1);
  assert.equal(count(s, 'circle'), 0);
  s = advance(initialState(NOW), 'decline');
  s = advance(s, 'decline');
  s = advance(s, 'tick', {}, NOW + DURATION.circle);
  s = advance(s, 'dispatch', {}, NOW + DURATION.circle);
  s = advance(s, 'dispatch', {}, NOW + DURATION.circle + 250);
  assert.equal(count(s, 'circle'), 1);
  assert.equal(count(s, 'mission'), 1);
  assert.equal(s.missionAt, NOW + DURATION.circle);
});

test('pause clears human checks; resume requires a new preparation and review', () => {
  let s = advance(confirmed(humanReady()), 'pause', { reason: 'emergency' });
  assert.equal(s.phase, 'paused');
  assert.equal(unchecked(s), true);
  assert.match(s.reason, /emergency/i);
  assert.equal(advance(s, 'start', { confirmed: true }).phase, 'paused');
  s = advance(s, 'resume');
  assert.equal(s.phase, 'idle');
  assert.equal(unchecked(s), true);
  assert.equal(Object.values(s.prep).every(value => value === false), true);
  assert.equal(s.path, null);
  assert.equal(s.circleReady, false);
  assert.equal(canStart(s), false);
});

test('pausing a moving helper prevents timer-driven transition into review', () => {
  let s = advance(initialState(NOW), 'decline');
  s = advance(s, 'tick', {}, NOW + DURATION.circle);
  s = advance(s, 'dispatch', {}, NOW + DURATION.circle);
  s = advance(s, 'pause', { reason: 'unsure' }, NOW + DURATION.circle + 50);
  s = advance(s, 'tick', {}, NOW + 86_400_000);
  assert.equal(s.phase, 'paused');
  assert.equal(s.missionAt, null);
  assert.equal(count(s, 'ready'), 0);
});

test('review and preparation actions cannot change checks after start', () => {
  const s = running();
  const check = advance(s, 'check', { key: 'time', value: false });
  const prep = advance(s, 'prep', { key: 'power', value: false });
  assert.deepEqual(check.checks, s.checks);
  assert.deepEqual(prep.prep, s.prep);
  assert.equal(advance(s, 'pause').phase, 'updating', 'Pause request is not a fake safe interruption of installation');
});

test('progress preserves elapsed time and completes only at the demo duration', () => {
  const s = running();
  assert.equal(progress(s, NOW - 100), 0);
  assert.equal(progress(s, NOW + DURATION.update / 2), 0.5);
  assert.equal(advance(s, 'tick', {}, NOW + DURATION.update - 1).phase, 'updating');
  assert.equal(advance(s, 'tick', {}, NOW + DURATION.update).phase, 'complete');
  assert.equal(progress(s, NOW + DURATION.update * 2), 1);
});

test('completion and thank-you are each recorded once, with consistent final mood and time', () => {
  let s = advance(running(), 'tick', {}, NOW + DURATION.update);
  for (let i = 0; i < 10; i++) s = advance(s, 'tick', {}, NOW + DURATION.update + i);
  assert.equal(s.phase, 'complete');
  assert.equal(deviceMood(s), 'happy');
  assert.equal(s.approvals, 1);
  assert.equal(count(s, 'complete'), 1);
  assert.equal(count(s, 'thanks'), 1);
  assert.equal(s.events.find(e => e.id === 'complete').time, '21:10');
});

test('refresh midway through installation restores the original timer without repeating approval', () => {
  const s = restoreState(JSON.stringify(running()), NOW + DURATION.update / 2);
  assert.equal(s.phase, 'updating');
  assert.equal(s.updateAt, NOW);
  assert.equal(progress(s, NOW + DURATION.update / 2), 0.5);
  assert.equal(s.approvals, 1);
  assert.equal(count(s, 'approved'), 1);
});

test('returning after installation elapsed produces a single completion receipt', () => {
  let s = restoreState(JSON.stringify(running()), NOW + DURATION.update + 500);
  assert.equal(s.phase, 'complete');
  s = restoreState(JSON.stringify(s), NOW + DURATION.update + 1000);
  assert.equal(count(s, 'complete'), 1);
  assert.equal(count(s, 'thanks'), 1);
});

test('refreshing a finished helper mission restores review but never approval', () => {
  let s = advance(initialState(NOW), 'decline');
  s = advance(s, 'tick', {}, NOW + DURATION.circle);
  s = advance(s, 'dispatch', {}, NOW + DURATION.circle);
  s = restoreState(JSON.stringify(s), NOW + DURATION.circle + DURATION.mission + 500);
  assert.equal(s.phase, 'review');
  assert.equal(unchecked(s), true);
  assert.equal(s.approvals, 0);
});

test('failed update stays out of service until a separate service action', () => {
  let s = advance(running(), 'fail', {}, NOW + 1000);
  assert.equal(s.phase, 'failed');
  assert.equal(deviceMood(s), 'failure');
  s = advance(s, 'tick', {}, NOW + 86_400_000);
  assert.equal(s.phase, 'failed');
  assert.equal(count(s, 'complete'), 0);
  assert.equal(advance(s, 'recover').phase, 'failed');
  assert.equal(advance(s, 'start', { confirmed: true }).phase, 'failed');
});

test('service request and retained-image recovery require explicit, non-duplicated actions', () => {
  let s = advance(running(), 'fail');
  s = advance(s, 'service');
  s = advance(s, 'service');
  assert.equal(s.serviceRequested, true);
  assert.equal(count(s, 'service'), 1);
  s = advance(s, 'recover', {}, NOW + 1000);
  s = advance(s, 'recover', {}, NOW + 1500);
  assert.equal(s.phase, 'recovering');
  assert.equal(deviceMood(s), 'rollback');
  assert.equal(s.recoveryAt, NOW + 1000);
  assert.equal(count(s, 'recover'), 1);
  s = advance(s, 'tick', {}, NOW + 1000 + DURATION.recovery);
  assert.equal(s.phase, 'recovered');
  assert.notEqual(deviceMood(s), 'happy', 'Restored previous version must not claim the waiting patch is current');
  assert.equal(count(s, 'recovered'), 1);
  assert.equal(count(s, 'complete'), 0);
  assert.equal(count(s, 'thanks'), 0);
});

test('refresh during service recovery preserves progress and completes only once', () => {
  let s = advance(advance(running(), 'fail'), 'service');
  s = advance(s, 'recover', {}, NOW + 1000);
  s = restoreState(JSON.stringify(s), NOW + 1000 + DURATION.recovery / 2);
  assert.equal(s.phase, 'recovering');
  assert.equal(progress(s, NOW + 1000 + DURATION.recovery / 2), 0.5);
  s = restoreState(JSON.stringify(s), NOW + 1000 + DURATION.recovery + 1);
  s = restoreState(JSON.stringify(s), NOW + 1000 + DURATION.recovery + 2);
  assert.equal(s.phase, 'recovered');
  assert.equal(count(s, 'recovered'), 1);
});

test('unavailable actions leave an idle request intact', () => {
  for (const type of ['dispatch', 'prepared', 'start', 'service', 'recover', 'fail', 'resume']) {
    assert.deepEqual(advance(initialState(NOW), type, { confirmed: true }), initialState(NOW), type);
  }
});

test('reducer does not mutate its input and settings do not authorize a task', () => {
  const before = initialState(NOW);
  const snapshot = structuredClone(before);
  let after = advance(before, 'setting', { key: 'sound', value: true });
  after = advance(after, 'setting', { key: 'phase', value: 'complete' });
  after = advance(after, 'pet');
  assert.deepEqual(before, snapshot);
  assert.equal(after.sound, true);
  assert.equal(after.pets, 1);
  assert.equal(after.phase, 'idle');
  assert.equal(after.approvals, 0);
});

test('invalid JSON, schema, phase and timer types recover to a fresh request', () => {
  for (const raw of [
    '{broken', null, [], { schema: 2, phase: 'idle' }, { schema: 1, phase: 'unknown' },
    { ...initialState(NOW), phase: 'mission', missionAt: 'yesterday' },
    { ...running(), updateAt: Infinity },
    { ...running(), approvals: 0 },
  ]) {
    const s = restoreState(raw, NOW);
    assert.equal(s.phase, 'idle', String(raw));
    assert.equal(s.approvals, 0);
    assert.equal(unchecked(s), true);
  }
});

test('corrupted time approval cannot become an authorized start after restore', () => {
  const raw = confirmed(humanReady());
  raw.checks.time = 'yes';
  const s = restoreState(raw, NOW);
  assert.equal(canStart(s), false);
  assert.notEqual(advance(s, 'start', { confirmed: true }).phase, 'updating');
});

test('a completed record without any installation timer cannot restore as current', () => {
  const raw = { ...initialState(NOW), phase: 'complete', approvals: 1, updateAt: null };
  const s = restoreState(raw, NOW);
  assert.equal(s.phase, 'idle');
  assert.equal(s.approvals, 0);
});

test('damaged preferences, counts and availability do not leak invalid types into the app', () => {
  const raw = { ...initialState(NOW), pets: 'broken', availability: 'elsewhere', sound: 'yes', motion: [], haptics: 4 };
  const s = restoreState(raw, NOW);
  assert.equal(Number.isInteger(s.pets), true);
  assert.equal(Number.isFinite(advance(s, 'pet').pets), true);
  assert.equal(['available', 'procedure', 'off'].includes(s.availability), true);
  for (const key of ['sound', 'motion', 'haptics']) assert.equal(typeof s[key], 'boolean', key);
});

test('finite zero timestamps round-trip through restore', () => {
  const s = running(0);
  assert.equal(s.updateAt, 0);
  const restored = restoreState(s, 1);
  assert.equal(restored.phase, 'updating');
  assert.equal(restored.updateAt, 0);
  assert.equal(restored.approvals, 1);
});
