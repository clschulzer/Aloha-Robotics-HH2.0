import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSchedulerModel } from '../visuals.mjs';

const require = createRequire(import.meta.url);
const planner = require('../team/planner.js');
const data = require('../team/data.js');

test('visuals use the actual original team proposal and synthetic data without mutation', () => {
  const before = JSON.stringify(data);
  const original = planner.fillGaps(data.DEVICES, { now: data.NOW, weekendDays: data.WEEKEND, blocked: {}, robotBusy: [] });
  const model = buildSchedulerModel(planner, data);
  assert.equal(model.selected.id, original.plan[0].id);
  assert.equal(model.selected.from, original.plan[0].from);
  assert.equal(model.selected.to, original.plan[0].to);
  assert.equal(model.selected.name, 'Cio');
  assert.equal(model.selected.from, 17 * 60);
  assert.equal(model.selected.reserveEnd, 19 * 60 + 30);
  assert.equal(model.backup.name, 'Arcus');
  assert.equal(model.backup.clear, true);
  assert.equal(JSON.stringify(data), before);
});

test('a planner-designated replacement with a booked case is never called clear', () => {
  const scenario = JSON.parse(JSON.stringify(data));
  const backup = scenario.DEVICES.find(device => device.id === 'C-04');
  backup.busy[0] = [{ from: 17 * 60, to: 20 * 60, saal: 'Test', fach: 'Test' }];
  const model = buildSchedulerModel(planner, scenario);
  assert.equal(model.backup.name, 'Arcus');
  assert.equal(model.backup.clear, false);
});

test('unknown backup calendar remains unconfirmed', () => {
  const scenario = JSON.parse(JSON.stringify(data));
  scenario.DEVICES.find(device => device.id === 'C-04').busy[0] = null;
  assert.equal(buildSchedulerModel(planner, scenario).backup.clear, false);
});

test('scan candidates are checked by team findWindow and risk remains its hourly proxy', () => {
  const model = buildSchedulerModel(planner, data);
  assert.ok(model.candidates.length > 50);
  assert.ok(model.candidates.some(candidate => candidate.accepted));
  assert.ok(model.candidates.some(candidate => !candidate.accepted));
  for (const candidate of model.candidates) {
    const device = data.DEVICES.find(item => item.id === candidate.id);
    const result = planner.findWindow(device, 0, {
      now: candidate.from - planner.RULES.VORLAUF, weekendDays: data.WEEKEND, blocked: {}, robotBusy: [],
    });
    assert.equal(candidate.accepted, result.ok && result.from === candidate.from);
  }
  assert.equal(model.risks[5][0].value, .5);
  assert.equal(model.risks[2][0].value, 0);
  const eligible = model.candidates.filter(candidate => candidate.accepted && Number.isFinite(candidate.risk));
  const lowestRisk = Math.min(...eligible.map(candidate => candidate.risk));
  const earliestAtLowestRisk = Math.min(...eligible.filter(candidate => candidate.risk === lowestRisk).map(candidate => candidate.from));
  assert.equal(model.selected.risk, lowestRisk);
  assert.equal(model.selected.from, earliestAtLowestRisk);
  assert.ok(model.shortGaps.length >= 3);
});

test('missing dependencies fail explicitly instead of swapping in a fabricated planner', () => {
  assert.throws(() => buildSchedulerModel(undefined, data), /team planner/);
  assert.throws(() => buildSchedulerModel(planner, undefined), /team data/);
});
