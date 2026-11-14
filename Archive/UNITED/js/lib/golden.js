/* ALOHA ROBOTICS / UNITED — golden-window scorer for the swarm scene.
   Pure functions, no DOM. Runs in the browser (window.AlohaGolden) and in Node (module.exports).
   Rebuilt for UNITED because OPUS/js/lib/ never reached GitHub (the repo .gitignore ignores lib/).
   The contract is OPUS/tests/golden.test.cjs (copied to UNITED/tests/).

   Hard rules first, all from the team rule core (planner.js RULES and canStart):
   no case within [start - VORLAUF, end + PUFFER], no motion update remotely, no guess on thin or
   missing usage data, a human on duty to confirm the start, a free backup C-arm, KettyBot never
   double-booked, no window inside an alarm lock. Then the probability the window runs undisturbed:

     P = P(no unplanned use) x exp(-emergency rate x pull x dt) x (1 - P(previous case overruns))

   All inputs are synthetic (js/data/day.js). Not a medical device, not a clinical score. */
(function (root) {
  'use strict';
  const P = (typeof module !== 'undefined' && module.exports) ? require('./planner.js') : root.IAPlanner;
  const R = P.RULES;
  const MIN_P = 0.85;          // below this a legal window is shown as risky, not proposed [Annahme]
  const OVERRUN_P = 0.35;      // chance the previous case overruns into the 20-min handover [Annahme]
  const OVERRUN_DECAY = 25;    // minutes: every 25 min of extra gap divides that chance by e [Annahme]

  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const hh = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  /* A start needs a person on duty who may confirm it (the challenge owners: a human presses start). */
  function confirmerAt(t, ctx) {
    return (ctx.confirmers || []).find((c) => c.from <= t && t < c.to) || null;
  }

  /* Walk [from, to) hour by hour: P(no unplanned use) and the emergency term. */
  function survival(d, from, to, ctx) {
    if (!Array.isArray(d.use)) return { p: null, missing: true };
    let noUse = 1, lambda = 0;
    for (let t = from; t < to;) {
      const h = Math.floor(t / 60), next = Math.min(to, (h + 1) * 60), frac = (next - t) / 60;
      const u = d.use[h % 24], r = ctx.rate[h % 24];
      if (!Number.isFinite(u) || !Number.isFinite(r)) return { p: null, missing: true };   // a gap is never zero risk
      noUse *= Math.pow(1 - u, frac);
      lambda += r * (d.pull || 0) * frac;
      t = next;
    }
    return { p: noUse * Math.exp(-lambda), noUse, emergency: Math.exp(-lambda) };
  }

  function overrun(d, from) {
    const prev = d.cases.filter((c) => c.to <= from).sort((a, b) => b.to - a.to)[0];
    if (!prev) return 0;
    return OVERRUN_P * Math.exp(-Math.max(0, from - prev.to - R.VORLAUF) / OVERRUN_DECAY);
  }

  const lockedBy = (d, a, b, ctx) => (ctx.blocks || []).find((x) => x.area.includes(d.area) && overlaps(a, b, x.from, x.to));

  /* Another C-arm free (no case, no lock) for the whole window. Prefer the reserve, then one with no
     update of its own pending, then the one with least pull to emergencies. */
  function pickBackup(devices, d, from, guardEnd, ctx) {
    const free = devices.filter((o) => o.id !== d.id && !o.cases.some((c) => overlaps(from, guardEnd, c.from, c.to)) && !lockedBy(o, from, guardEnd, ctx));
    const rank = (o) => (o.area === 'RESERVE' ? 0 : 10) + (o.update ? 5 : 0) + (o.pull || 0);
    return free.sort((a, b) => rank(a) - rank(b))[0] || null;
  }

  function evaluate(devices, d, start, ctx) {
    const from = start, to = start + R.DUR, guardEnd = to + R.PUFFER;
    const out = { id: d.id, from, to, guardEnd, p: 0, backup: null, needsRobot: !d.socket, art: d.update ? d.update.art : null };
    const no = (reason, label) => Object.assign(out, { status: 'reject', reason, label });
    if (!d.update) return no('current', 'UP TO DATE');
    if (d.update.art === 'arm') return no('motion', 'MOTION UPDATE → ON SITE');
    if (from < ctx.now + R.VORLAUF || guardEnd > ctx.horizon.to) return no('horizon', 'OUTSIDE PLAN');
    if (d.weeks < R.MIN_WEEKS) return no('thin-data', `${d.weeks} WEEKS OF DATA`);
    if (!Array.isArray(d.use)) return no('no-data', 'NO USAGE DATA');
    const hit = d.cases.find((c) => overlaps(from - R.VORLAUF, guardEnd, c.from, c.to));
    if (hit) return no('case', hit.proc);
    const lock = lockedBy(d, from - R.VORLAUF, guardEnd, ctx);
    if (lock) return no('lock', 'LOCKED · ' + lock.label);
    if (!confirmerAt(from, ctx)) return no('nobody', 'NOBODY ON DUTY');
    if (out.needsRobot && (ctx.robotBusy || []).some((b) => overlaps(from - R.ROBOT_LEAD, to, b.from, b.to))) return no('robot-busy', 'KETTYBOT BOOKED');
    const bk = pickBackup(devices, d, from, guardEnd, ctx);
    if (!bk) return no('no-backup', 'NO BACKUP FREE');
    out.backup = bk.id;
    const s = survival(d, from, to, ctx);
    if (s.missing) return no('no-data', 'GAP IN USAGE DATA');
    out.p = s.p * (1 - overrun(d, from));
    if (out.p < MIN_P) return Object.assign(out, { status: 'risky', reason: 'low-p', label: Math.round(out.p * 100) + '% ONLY' });
    return Object.assign(out, { status: 'ok', reason: null, label: Math.round(out.p * 100) + '%' });
  }

  /* Every device, every start on the planner's 10-minute grid from now + handover to the horizon. */
  function golden(devices, ctx) {
    const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
    const all = [];
    const first = Math.ceil((ctx.now + R.VORLAUF) / R.STEP) * R.STEP;
    for (const d of devices) for (let s = first; s + R.DUR + R.PUFFER <= ctx.horizon.to; s += R.STEP) all.push(evaluate(devices, d, s, ctx));
    const ranked = all.filter((w) => w.status === 'ok').sort((a, b) => b.p - a.p || a.from - b.from);
    const ms = (typeof performance !== 'undefined' ? performance : Date).now() - t0;
    return { best: ranked[0] || null, ranked, all, ms };
  }

  /* The start itself stays with the team rule core: release, "area clear", no alarm. */
  function startGate(w, v) {
    return P.canStart({ art: w.art, freigabe: !!v.freigabe, umgebungFrei: !!v.umgebungFrei, alarm: !!v.alarm, imEinsatz: false, paketGeprueft: true, paketZurueckgerufen: false });
  }

  const api = { MIN_P, hh, confirmerAt, survival, evaluate, golden, startGate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AlohaGolden = api;
})(typeof window !== 'undefined' ? window : globalThis);
