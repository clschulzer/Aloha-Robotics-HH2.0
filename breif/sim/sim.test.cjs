/* Invariants of the architecture simulator. Run: node --test breif/sim/sim.test.cjs
   The hard rules must hold for every hand: never during a planned case, a confirmer on duty at
   every start, at most MAX_PER_NIGHT per day, the backup is never being updated at the same time,
   robots are never double-booked, the copied team code is byte-identical. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const S = require('./model.js');

const BRAIN = S.OPTIONS.filter((o) => o.key !== 'today').map((o) => o.key);
const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;

function eachTrace(fn, overrides) {
  for (const key of BRAIN) for (let run = 0; run < 6; run++) fn(S.trace(overrides || {}, key, run), key, run);
}

test('same seed, same answer', () => {
  const a = S.simulate({ runs: 4 }), b = S.simulate({ runs: 4 });
  assert.deepStrictEqual(a.results, b.results);
});

test('no window ever touches a planned case, including buffers', () => {
  eachTrace(({ H, st }, key) => {
    for (const w of st.windows) {
      for (const c of H.days[w.d].cases[w.i]) {
        assert.ok(!overlaps(w.from - 20, w.guardEnd, c.from, c.to), `${key} ${w.id} day ${w.d} ${w.from} hits a case ${c.from}-${c.to}`);
      }
    }
  });
});

test('a confirmer is on duty at every start', () => {
  eachTrace(({ H, st }, key) => {
    for (const w of st.windows) {
      const on = H.days[w.d].confirmers.some((c) => c.from <= w.from && w.from < c.to);
      assert.ok(on, `${key} ${w.id} day ${w.d} starts at ${w.from} with nobody to confirm`);
    }
  });
});

test('at most MAX_PER_NIGHT windows per day', () => {
  eachTrace(({ st, p }, key) => {
    const perDay = {};
    for (const w of st.windows) perDay[w.d] = (perDay[w.d] || 0) + 1;
    for (const [d, n] of Object.entries(perDay)) assert.ok(n <= p.maxPerNight, `${key} day ${d}: ${n} windows`);
  });
});

test('the backup is never itself being updated in an overlapping window', () => {
  eachTrace(({ st }, key) => {
    for (const a of st.windows) for (const b of st.windows) {
      if (a === b || a.d !== b.d || !overlaps(a.from, a.guardEnd, b.from, b.guardEnd)) continue;
      assert.notStrictEqual(a.backup, b.id, `${key} day ${a.d}: backup ${a.backup} of ${a.id} is updating`);
    }
  });
});

test('one robot is never in two places', () => {
  eachTrace(({ st }, key) => {
    const r = st.windows.filter((w) => w.robot);
    for (const a of r) for (const b of r) {
      if (a === b || a.d !== b.d) continue;
      assert.ok(!overlaps(a.from - 25, a.guardEnd + 30, b.from - 25, b.guardEnd + 30), `${key} day ${a.d}: robot double-booked`);
    }
  }, { robots: 1 });
});

test('an ideal world finishes as fast as the night cap allows', () => {
  const ideal = { acceptEve: 1, acceptLate: 1, acceptMove: 1, stayOk: 1, bayDiscipline: 1, companionReady: 1, robotMission: 1,
    tap: 1, remoteWake: true, doaResidual: 0, alarmsPerDay: 0, runs: 5 };
  const r = S.simulate(ideal, ['companion']).results[0];
  assert.ok(r.patchedByDeadline >= 10 / 12, 'companion in an ideal world patches all safe devices by the deadline');
  assert.ok(r.daysTo90Median <= 9, 'and needs no more than a few nights beyond the cap');
});

test('today without a brain is worse than any hand with a brain', () => {
  const res = S.simulate({ runs: 10 }).results;
  const today = res.find((r) => r.key === 'today');
  for (const r of res.filter((x) => ['bays', 'companion', 'robot', 'hybrid1', 'hybrid2'].includes(x.key))) {
    assert.ok(r.patchedByDeadline > today.patchedByDeadline, r.key);
  }
});

test('the copied rule core and scorer are byte-identical to the team sources', () => {
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'engine', 'SOURCES.json'), 'utf8'));
  const root = path.join(__dirname, '..', '..');
  for (const s of src.sources) {
    const copy = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, s.copy))).digest('hex');
    assert.strictEqual(copy, s.sha256, s.copy);
    const orig = path.join(root, s.source);
    if (fs.existsSync(orig)) assert.strictEqual(crypto.createHash('sha256').update(fs.readFileSync(orig)).digest('hex'), s.sha256, s.source);
  }
});
