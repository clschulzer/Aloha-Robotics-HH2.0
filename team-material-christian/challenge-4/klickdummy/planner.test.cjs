/* Tests for the safety rules and the window planner of the IA click dummy.
   Run: node --test challenges/04-invisible-connectivity/klickdummy/ */
const test = require('node:test');
const assert = require('node:assert');
const P = require('./planner.js');
const D = require('./data.js');

const ctx = (extra) => Object.assign({ now: D.NOW, weekendDays: D.WEEKEND, blocked: {}, robotBusy: [] }, extra);
const dev = (id) => D.DEVICES.find((d) => d.id === id);
const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;

test('no proposed window touches a planned case, including buffer', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  assert.ok(plan.length > 0);
  for (const w of plan) {
    for (const c of dev(w.id).busy[w.day]) {
      assert.ok(!overlaps(w.from, w.to + P.RULES.PUFFER, c.from, c.to), `${w.id} collides with a case`);
    }
  }
});

test('no window on day 0 starts before now plus lead time', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  for (const w of plan.filter((x) => x.day === 0)) assert.ok(w.from >= D.NOW + P.RULES.VORLAUF);
});

test('never more than MAX_PER_NIGHT devices per day', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  const perDay = {};
  plan.forEach((w) => { perDay[w.day] = (perDay[w.day] || 0) + 1; });
  Object.values(perDay).forEach((n) => assert.ok(n <= P.RULES.MAX_PER_NIGHT));
});

test('every window is before its deadline and has a replacement that is not being updated', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  for (const w of plan) {
    assert.ok(w.day <= w.frist);
    assert.ok(w.ersatz && w.ersatz !== w.id);
    const clash = plan.find((p) => p.id === w.ersatz && p.day === w.day && overlaps(p.from, p.to, w.from, w.to));
    assert.equal(clash, undefined);
  }
});

test('update with arm movement is never planned for a remote start', () => {
  const r = P.findWindow(dev('C-06'), 0, ctx());
  assert.deepEqual(r, { ok: false, grund: 'vor-ort' });
  const { plan, offen } = P.fillGaps(D.DEVICES, ctx());
  assert.equal(plan.find((w) => w.id === 'C-06'), undefined);
  assert.equal(offen.find((o) => o.id === 'C-06').grund, 'vor-ort');
});

test('thin usage data yields no proposal instead of a guess', () => {
  assert.equal(P.findWindow(dev('C-07'), 0, ctx()).grund, 'datenlage');
});

test('windows above the risk limit are not proposed', () => {
  const r = P.findWindow(dev('C-08'), 0, ctx());
  assert.equal(r.ok, false);
  assert.equal(r.grund, 'risiko');
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  plan.forEach((w) => assert.ok(w.risk <= P.RULES.MAX_RISK));
});

test('device without power needs the robot, and the robot is never double booked', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  const robot = plan.filter((w) => w.needsRobot);
  assert.ok(robot.some((w) => w.id === 'C-03'));
  for (const a of robot) for (const c of robot) {
    if (a !== c && a.day === c.day) assert.ok(!overlaps(a.from - 15, a.to, c.from - 15, c.to));
  }
});

test('an alarm block moves the window, it is never placed inside the block', () => {
  const blocked = { 'C-01': [{ day: 0, from: D.NOW, to: D.NOW + 180 }] };
  const w = P.findWindow(dev('C-01'), 0, ctx({ blocked }));
  assert.ok(w.ok);
  assert.ok(w.from >= D.NOW + 180 + P.RULES.VORLAUF);
});

test('remote start needs release, clear surroundings, a checked package, no use, no alarm', () => {
  const ok = { art: 'patch', freigabe: true, umgebungFrei: true, imEinsatz: false, alarm: false, paketGeprueft: true };
  assert.equal(P.canStart(ok).ok, true);
  for (const patch of [{ freigabe: false }, { umgebungFrei: false }, { imEinsatz: true }, { alarm: true },
    { paketGeprueft: false }, { paketZurueckgerufen: true }, { art: 'arm' }]) {
    const r = P.canStart(Object.assign({}, ok, patch));
    assert.equal(r.ok, false, JSON.stringify(patch));
    assert.ok(r.gruende.length >= 1);
  }
});

test('demo plan is the one the screenplay relies on', () => {
  const { plan, offen } = P.fillGaps(D.DEVICES, ctx());
  const short = plan.map((w) => `${w.id}@${w.day}:${w.from}`).sort();
  assert.deepEqual(short, ['C-01@0:1020', 'C-02@1:1080', 'C-03@0:1020', 'C-08@3:360']);
  assert.deepEqual(offen.map((o) => `${o.id}:${o.grund}`).sort(), ['C-06:vor-ort', 'C-07:datenlage']);
});

test('a start is refused while the device is in a case or an alarm block', () => {
  const d = dev('C-01');
  assert.equal(P.inUse(d, 0, D.t(8), {}), true);
  assert.equal(P.inUse(d, 0, D.t(17), {}), false);
  assert.equal(P.inUse(d, 0, D.t(17), { 'C-01': [{ day: 0, from: D.NOW, to: D.NOW + 180 }] }), true);
  const v = { art: 'patch', freigabe: true, umgebungFrei: true, alarm: false, paketGeprueft: true };
  assert.equal(P.canStart(Object.assign({ imEinsatz: P.inUse(d, 0, D.t(8), {}) }, v)).ok, false);
});

test('missing data never reads as free or as no risk', () => {
  const base = dev('C-01');
  const noDay = Object.assign({}, base, { busy: base.busy.slice(0, 2), update: { art: 'patch', frist: 9 } });
  assert.equal(P.findWindow(noDay, 5, ctx()).grund, 'daten-fehlen');
  assert.equal(P.inUse(noDay, 5, D.t(20), {}), true);
  P.fillGaps([noDay, dev('C-04'), dev('C-05')], ctx()).plan.forEach((w) => assert.ok(w.day <= 1));
  assert.equal(P.findWindow(Object.assign({}, base, { datenWochen: undefined }), 0, ctx()).grund, 'daten-fehlen');
  const wt = base.risk.wt.slice(); wt[18] = undefined;
  assert.equal(P.findWindow(Object.assign({}, base, { risk: { wt, we: base.risk.we } }), 0, ctx()).grund, 'daten-fehlen');
});

test('rescheduling after an alarm re-checks robot and replacement', () => {
  const { plan } = P.fillGaps(D.DEVICES, ctx());
  const w = plan.find((p) => p.id === 'C-01');
  const blocked = { 'C-01': [{ day: 0, from: D.NOW, to: D.NOW + 180 }] };
  const n = P.reschedule(D.DEVICES, dev('C-01'), w, plan, ctx({ blocked }));
  assert.ok(n.ok);
  assert.equal(n.from, D.t(20));
  assert.ok(n.ersatz && n.ersatz !== 'C-01');
  const others = plan.filter((p) => p.id !== 'C-01' && p.day === 0);
  others.forEach((p) => { if (overlaps(p.from, p.to + P.RULES.PUFFER, n.from, n.to + P.RULES.PUFFER)) { assert.notEqual(p.ersatz, n.ersatz); assert.notEqual(p.id, n.ersatz); } });
});

test('a device is not updated while it is the replacement for an overlapping window', () => {
  const two = [dev('C-01'), dev('C-02')].map((d) => Object.assign({}, d, { busy: dev('C-01').busy, update: { art: 'patch', frist: 0 } }));
  const { plan, offen } = P.fillGaps(two, ctx());
  assert.equal(plan.length, 1);
  assert.equal(offen[0].grund, 'ist-ersatz');
});
