/* Tests for the golden-window scorer that drives the swarm on stage.
   Run from the repository root:  node --test OPUS/tests/
   The scorer sits on the team's rule core (OPUS/js/lib/planner.js, a verbatim copy of
   team-material-christian/challenge-4/klickdummy/planner.js), so these tests also pin down
   that the stage never shows a window the team's rules would forbid. All data is synthetic. */
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const G = require(path.join(__dirname, '../js/lib/golden.js'));
const D = require(path.join(__dirname, '../js/data/day.js'));
const P = require(path.join(__dirname, '../js/lib/planner.js'));

const R = P.RULES;
const base = () => ({ now: D.NOW, horizon: D.HORIZON, rate: D.EMERGENCY_RATE, confirmers: D.CONFIRMERS, blocks: [], robotBusy: [] });
const clone = (x) => JSON.parse(JSON.stringify(x));
const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
const dev = (id, devices = D.DEVICES) => devices.find((d) => d.id === id);

test('every proposed window keeps the 20-min handover and the 30-min rollback buffer clear of cases', () => {
  const r = G.golden(D.DEVICES, base());
  assert.ok(r.ranked.length > 0);
  for (const w of r.ranked) {
    for (const c of dev(w.id).cases) assert.ok(!overlaps(w.from - R.VORLAUF, w.guardEnd, c.from, c.to), `${w.id} ${G.hh(w.from)} touches ${c.proc}`);
    assert.strictEqual(w.to - w.from, R.DUR);
    assert.strictEqual(w.guardEnd - w.to, R.PUFFER);
  }
});

test('the golden window is the most probable legal window (brute force agrees)', () => {
  const ctx = base();
  const r = G.golden(D.DEVICES, ctx);
  let best = null;
  for (const d of D.DEVICES) for (let s = D.NOW; s < D.HORIZON.to; s += 5) {
    const e = G.evaluate(D.DEVICES, d, s, ctx);
    if (e.status === 'ok' && (!best || e.p > best.p + 1e-12)) best = e;
  }
  // The planner works on a 10-minute grid; a 5-minute brute force may only find a hair better.
  assert.ok(r.best.p >= best.p - 0.01, `grid best ${r.best.p} vs brute ${best.p}`);
  for (const w of r.ranked) assert.ok(w.p <= r.best.p);
});

test('motion updates and devices with thin history never get a remote window', () => {
  const r = G.golden(D.DEVICES, base());
  assert.ok(!r.ranked.some((w) => w.id === 'C-06'), 'motion update C-06 must stay on-site');
  assert.ok(!r.ranked.some((w) => w.id === 'C-07'), 'C-07 has 2 weeks of data: no guess');
  assert.ok(r.all.filter((w) => w.id === 'C-06').every((w) => w.reason === 'motion'));
  assert.ok(r.all.filter((w) => w.id === 'C-07' && w.from >= D.NOW + R.VORLAUF).every((w) => w.reason === 'thin-data'));
});

test('a window only starts when a human is on duty to confirm it', () => {
  const r = G.golden(D.DEVICES, base());
  for (const w of r.ranked) assert.ok(G.confirmerAt(w.from, base()), `${w.id} ${G.hh(w.from)} starts with nobody to confirm`);
  const late = G.evaluate(D.DEVICES, dev('C-02'), D.t(23, 0), base());
  assert.strictEqual(late.reason, 'nobody');
});

test('the backup is another C-arm that is free for the whole window', () => {
  const r = G.golden(D.DEVICES, base());
  for (const w of r.ranked) {
    assert.ok(w.backup && w.backup !== w.id);
    const b = dev(w.backup);
    for (const c of b.cases) assert.ok(!overlaps(w.from, w.guardEnd, c.from, c.to), `backup ${b.id} busy during ${w.id} ${G.hh(w.from)}`);
  }
  const lonely = [clone(dev('C-03'))];
  assert.strictEqual(G.evaluate(lonely, lonely[0], D.t(19, 10), base()).reason, 'no-backup');
});

test('a polytrauma lock removes every window in the trauma area, and the replan moves elsewhere', () => {
  const ctx = Object.assign(base(), { blocks: [D.ALARM] });
  const r = G.golden(D.DEVICES, ctx);
  for (const w of r.ranked) {
    const d = dev(w.id);
    if (D.ALARM.area.includes(d.area)) assert.ok(!overlaps(w.from - R.VORLAUF, w.guardEnd, D.ALARM.from, D.ALARM.to));
    if (D.ALARM.area.includes(dev(w.backup).area)) assert.ok(!overlaps(w.from, w.guardEnd, D.ALARM.from, D.ALARM.to), 'locked device used as backup');
  }
  assert.notStrictEqual(r.best.id, 'C-03');
});

test('more emergencies can only lower the probability of an undisturbed window', () => {
  const ctx = base();
  const hot = Object.assign(base(), { rate: D.EMERGENCY_RATE.map((x) => x * 3) });
  for (const d of D.DEVICES) {
    const a = G.survival(d, D.t(19, 0), D.t(21, 30), ctx).p;
    const b = G.survival(d, D.t(19, 0), D.t(21, 30), hot).p;
    assert.ok(b <= a, `${d.id}: ${b} > ${a}`);
  }
});

test('a C-arm parked without a socket needs KettyBot, and a booked robot blocks the window', () => {
  const ctx = base();
  const w = G.evaluate(D.DEVICES, dev('C-03'), D.t(19, 10), ctx);
  assert.strictEqual(w.status, 'ok');
  assert.strictEqual(w.needsRobot, true);
  const booked = Object.assign(base(), { robotBusy: [{ from: D.t(18, 30), to: D.t(21, 0) }] });
  assert.strictEqual(G.evaluate(D.DEVICES, dev('C-03'), D.t(19, 10), booked).reason, 'robot-busy');
  assert.strictEqual(G.evaluate(D.DEVICES, dev('C-02'), D.t(19, 10), booked).needsRobot, false);
});

test('missing usage data never reads as zero risk', () => {
  const devices = clone(D.DEVICES);
  delete dev('C-02', devices).use;
  const e = G.evaluate(devices, dev('C-02', devices), D.t(20, 0), base());
  assert.strictEqual(e.status, 'reject');
  assert.strictEqual(e.reason, 'no-data');
});

test('the start gate is still the team rule core: no release or no "area clear" means no start', () => {
  const r = G.golden(D.DEVICES, base());
  assert.strictEqual(G.startGate(r.best, { freigabe: false, umgebungFrei: true }).ok, false);
  assert.strictEqual(G.startGate(r.best, { freigabe: true, umgebungFrei: false }).ok, false);
  assert.strictEqual(G.startGate(r.best, { freigabe: true, umgebungFrei: true, alarm: true }).ok, false);
  assert.strictEqual(G.startGate(r.best, { freigabe: true, umgebungFrei: true }).ok, true);
});

test('the stage story is what the code computes: Cio first, then Bogdan after the alarm', () => {
  const first = G.golden(D.DEVICES, base()).best;
  assert.strictEqual(first.id, 'C-03');
  assert.strictEqual(G.hh(first.from), '19:10');
  assert.strictEqual(first.needsRobot, true);
  assert.strictEqual(first.backup, 'C-05');
  const after = G.golden(D.DEVICES, Object.assign(base(), { blocks: [D.ALARM] })).best;
  assert.strictEqual(after.id, 'C-02');
  assert.ok(after.p > G.MIN_P);
});

test('the whole fleet is re-planned in well under 50 ms', () => {
  const r = G.golden(D.DEVICES, Object.assign(base(), { blocks: [D.ALARM] }));
  assert.ok(r.ms < 50, `${r.ms} ms`);
});
