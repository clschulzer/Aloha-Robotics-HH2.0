/* ALOHA ROBOTICS / OPUS — golden-window scorer.
   Builds on the team's tested rule core (team-material-christian/challenge-4/klickdummy/planner.js):
   the same constants (DUR 120, PUFFER 30, VORLAUF 20, STEP 10, ROBOT_LEAD 15, MIN_WEEKS 4) and the
   same hard rules (never touch a case, never a motion update remotely, never guess on thin data).
   What it adds:
     1. Every legal window gets a probability of finishing UNDISTURBED, not just "earliest under a
        risk limit": unplanned use of this device, emergencies that would pull it (polytrauma alarm
        rate x pull share), and the chance that the case before it overruns.
     2. A human must be on duty to confirm the start (the challenge owners: "not allowed to start
        automatically"), so windows that start when nobody is awake are illegal.
     3. The backup C-arm must itself be free for the whole window (gap noted in spec-scheduling-ki).
   The golden window is the legal window with the highest probability. Pure functions, no DOM.
   All inputs are synthetic. Probabilities are illustrative model outputs, not clinical forecasts. */
(function (root) {
  'use strict';
  const planner = (typeof module !== 'undefined' && module.exports) ? require('./planner.js') : root.IAPlanner;
  const R = planner.RULES;
  const MIN_P = 0.80;          // below this a legal window is "too risky" [assumption]
  const OVERRUN_P = 0.30;      // chance the previous case runs late at all [assumption]
  const OVERRUN_TAU = 30;      // minutes; overrun risk decays after the case end [assumption]
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const hh = (m) => { const x = ((m % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };

  /* All blocks that make a device unavailable: planned cases plus alarm locks for its area. */
  function busyOf(dev, ctx) {
    const locks = (ctx.blocks || []).filter((b) => b.area.includes(dev.area)).map((b) => ({ from: b.from, to: b.to, proc: b.label || 'ALARM LOCK', lock: true }));
    return dev.cases.concat(locks);
  }

  function confirmerAt(at, ctx) {
    return (ctx.confirmers || []).find((c) => c.from <= at && at < c.to) || null;
  }

  /* Probability that nothing interrupts [from, to): product of three survival factors. */
  function survival(dev, from, to, ctx) {
    let useLog = 0, emLog = 0;
    for (let m = from; m < to; m += 10) {
      const h = Math.floor(m / 60) % 24;
      const pu = Math.min(0.99, Math.max(0, dev.use[h]));
      useLog += Math.log(1 - pu) / 6;                       // hourly probability -> 10-min slice
      emLog -= (ctx.rate[h] * dev.pull) / 6;                // Poisson arrivals that would pull it
    }
    const prev = busyOf(dev, ctx).filter((b) => b.to <= from).sort((a, b) => b.to - a.to)[0];
    const pOver = prev ? OVERRUN_P * Math.exp(-(from - prev.to) / OVERRUN_TAU) : 0;
    const use = Math.exp(useLog), emergency = Math.exp(emLog), overrun = 1 - pOver;
    return { p: use * emergency * overrun, use, emergency, overrun };
  }

  /* Backup: another device that is free for the whole window. Same area first, then the reserve,
     then up-to-date devices, then the one least likely to be pulled. */
  function pickBackup(devices, dev, from, to, ctx, exclude) {
    const free = devices.filter((d) => d.id !== dev.id && !(exclude || []).includes(d.id) &&
      !busyOf(d, ctx).some((b) => overlaps(from, to, b.from, b.to)));
    const rank = (d) => [d.area === dev.area ? 0 : d.area === 'RESERVE' ? 1 : 2, d.update ? 1 : 0, d.pull];
    free.sort((a, b) => { const x = rank(a), y = rank(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return a.id.localeCompare(b.id); });
    return free[0] || null;
  }

  /* Evaluate one candidate start for one device. Hard rules first (code, never a model), then the
     probability. Returns a record the swarm can draw and an agent can "say". */
  function evaluate(devices, dev, start, ctx) {
    const end = start + R.DUR, guardEnd = end + R.PUFFER;
    const out = { id: dev.id, from: start, to: end, guardEnd, status: 'reject', reason: '', label: '', p: 0, parts: null, needsRobot: !dev.socket, backup: null };
    const reject = (reason, label) => Object.assign(out, { reason, label });
    if (!dev.update) return reject('current', 'ALREADY UP TO DATE');
    if (dev.update.art === 'arm') return reject('motion', 'MOTION UPDATE → ON-SITE ONLY');
    if (!Number.isFinite(dev.weeks) || !Array.isArray(dev.use) || dev.use.length !== 24) return reject('no-data', 'NO DATA → NO GUESS');
    if (dev.weeks < R.MIN_WEEKS) return reject('thin-data', dev.weeks + ' WEEKS OF DATA → NO GUESS');
    if (start < ctx.now + R.VORLAUF) return reject('too-soon', 'TOO SOON');
    if (guardEnd > ctx.horizon.to) return reject('horizon', 'PAST THE PLANNING HORIZON');
    const busy = busyOf(dev, ctx);
    const hit = busy.find((b) => overlaps(start - R.VORLAUF, guardEnd, b.from, b.to));
    if (hit) {
      if (hit.lock) return reject('locked', 'LOCKED · ' + (hit.proc || 'ALARM'));
      if (overlaps(start - R.VORLAUF, end, hit.from, hit.to)) return reject('collision', 'COLLIDES · ' + hit.proc);
      return reject('buffer', 'NO ROLLBACK BUFFER · ' + hit.proc);
    }
    if (!confirmerAt(start, ctx)) return reject('nobody', 'NOBODY AWAKE TO CONFIRM');
    if (out.needsRobot && (ctx.robotBusy || []).some((b) => overlaps(start - R.ROBOT_LEAD, end, b.from, b.to))) return reject('robot-busy', 'KETTYBOT ALREADY BOOKED');
    const backup = pickBackup(devices, dev, start, guardEnd, ctx);
    if (!backup) return reject('no-backup', 'NO BACKUP C-ARM FREE');
    const s = survival(dev, start, guardEnd, ctx);
    out.p = s.p; out.parts = s; out.backup = backup.id;
    if (s.p < (ctx.minP || MIN_P)) {
      const worst = s.emergency <= s.use && s.emergency <= s.overrun ? 'EMERGENCY RISK' : s.use <= s.overrun ? 'LIKELY NEEDED' : 'OVERRUN RISK';
      return Object.assign(out, { status: 'risky', reason: 'risky', label: worst + ' · ' + Math.round(s.p * 100) + '%' });
    }
    return Object.assign(out, { status: 'ok', reason: 'ok', label: (out.needsRobot ? 'NO SOCKET → KETTYBOT · ' : '✓ ') + Math.round(s.p * 100) + '% UNDISTURBED' });
  }

  /* Every candidate start on the planner grid for every device, then the argmax. */
  function golden(devices, ctx) {
    const t0 = now();
    const all = [];
    const first = Math.ceil(ctx.now / R.STEP) * R.STEP;
    for (const dev of devices) {
      for (let s = first; s + R.DUR + R.PUFFER <= ctx.horizon.to; s += R.STEP) all.push(evaluate(devices, dev, s, ctx));
    }
    const ok = all.filter((c) => c.status === 'ok').sort((a, b) => b.p - a.p || a.from - b.from || a.id.localeCompare(b.id));
    const best = ok[0] || null;
    const perDevice = {};
    for (const c of ok) if (!perDevice[c.id]) perDevice[c.id] = c;
    return { best, ranked: ok, perDevice, all, ms: now() - t0 };
  }

  /* The start gate is the team's canStart(): this module never relaxes it. */
  function startGate(win, state) {
    return planner.canStart(Object.assign({ art: 'patch', paketGeprueft: true, paketZurueckgerufen: false }, state, { winId: win && win.id }));
  }

  const api = { MIN_P, OVERRUN_P, OVERRUN_TAU, RULES: R, survival, evaluate, golden, pickBackup, busyOf, confirmerAt, startGate, hh };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AlohaGolden = api;
})(typeof window !== 'undefined' ? window : globalThis);
