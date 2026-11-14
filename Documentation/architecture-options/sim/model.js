/* ALOHA ROBOTICS · BREIF · one hospital, four weeks, seven ways to reach a parked C-arm.

   The question every architecture answers: how does a parked, switched-off mobile C-arm get about
   120 undisturbed minutes of power, the package, a switch-on and one human "start"?

   What is shared (so the comparison is fair):
     - The brain. Window finding is the team's code, copied unchanged into engine/: the rule core
       (planner.js: never during a case, buffers, MAX_PER_NIGHT, backup device) and the scorer
       (golden.js: probability that a window finishes undisturbed, a confirmer must be on duty).
     - The hospital. Every option sees the same synthetic C-arms, OR plans, emergencies, alarms and
       the same people saying yes or no (common random numbers per run).
   What differs: the "hand", i.e. how power, data, the switch-on and guarding reach the device.

   Every number in PARAMS is an assumption unless the comment says "Siemens". Change one and run
   again. This is a thinking tool that shows which assumption decides which architecture wins.
   It is not a forecast, and nothing in it is measured hospital data. Pure functions, no DOM.
   Runs in Node (module.exports) and in the browser (window.BreifSim). */
(function (root) {
  'use strict';
  const isNode = typeof module !== 'undefined' && module.exports;
  const G = isNode ? require('./engine/golden.js') : root.AlohaGolden;
  const R = G.RULES;

  const PARAMS = {
    days: 28,               // four weeks, day 0 is a Monday
    fleet: 12,              // mobile C-arms in the house
    deadline: 14,           // days the hospital gives itself for a security patch
    maxPerNight: 2,         // rule core MAX_PER_NIGHT: never the whole fleet at once (team rule)
    installMin: 120,        // Siemens: about 120 min per update, "fairly average"
    noSocket: 0.45,         // parking spots with no socket within the 7 m cable (Siemens: "sometimes there is, sometimes not")
    orLan: 0.5,             // C-arms that get a network link while in use, so the package is on board (Erlangen: no Wi-Fi in ORs)
    remoteWake: false,      // a hand can switch the parked C-arm on without a person (ask Siemens)
    stayOk: 0.6,            // the room tolerates the C-arm staying plugged in for 2.5 h after the last case
    acceptEve: 0.85,        // a named person takes a 2-minute job before 22:00
    acceptLate: 0.6,        // the same after 22:00
    acceptMove: 0.4,        // a job that means pushing ~300 kg to a socket
    bayDiscipline: 0.75,    // the C-arm really is parked in its bay that evening
    robots: 1,              // KettyBot-class robots
    robotMission: 0.9,      // the robot reaches the device and docks (doors, lifts, obstacles)
    companionReady: 0.92,   // the companion is charged and healthy at the start
    nextGen: 0.1,           // share of the fleet that already has built-in power and connectivity
    cellularAllowed: false, // the hospital accepts a cellular modem in the device (team research: rejected as a standard)
    tap: 0.97,              // the on-duty confirmer taps "start" in time
    absorbGuarded: 0.85,    // an urgent need goes to the named backup when the device itself shows "updating, take C-04"
    absorbPlain: 0.5,       // the same when the backup is only named in the app
    absorbToday: 0.3,       // today: no backup named, nothing at the device
    doaIfPulled: 0.5,       // an install pulled mid-way ends "dead on arrival" (Siemens: unplugging mid-update is a known cause)
    doaResidual: 0.01,      // installs that fail anyway, e.g. a subsystem can't be reached (Siemens: ~2 % DOA in total)
    repairDays: 3,          // a dead-on-arrival device comes back patched after an on-site visit
    alarmsPerDay: 0.25,     // polytrauma pre-alerts per day
    alarmPull: 0.5,         // a trauma-area C-arm mid-install is needed during the alarm
    todayLeftOn: 0.15,      // today: the device is on and plugged when someone notices "update available"
    todayPress: 0.2,        // today: someone presses start ("nobody feels responsible")
    minP: 0.8,              // golden.js MIN_P: below this a legal window is too risky
    runs: 200,
    seed: 20261114,
  };

  // Rough one-site costs in EUR. Assumptions except the robot price (dealer list prices 2026,
  // US$11k to 20k for a KettyBot Pro). Used only to put capex next to the simulated effort.
  const COST = { bay: 2500, companion: 4500, dataCompanion: 600, robot: 16000, robotKit: 6000, building: 20000, staffPerMin: 1, visit: 1000 };

  /* Emergency rate per hour that needs a mobile C-arm somewhere in the house, and the duty roster.
     Same synthetic profile as OPUS/v2/js/data/day.js. Weekends: IT on call only [assumption]. */
  const RATE = [0.05, 0.05, 0.04, 0.03, 0.03, 0.03, 0.04, 0.08, 0.10, 0.09, 0.08, 0.08,
                0.08, 0.08, 0.09, 0.11, 0.14, 0.16, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06];
  const WEEKDAY_CONFIRMERS = [{ role: 'Medical physics', from: 420, to: 1020 }, { role: 'IT on call', from: 1020, to: 1350 }];
  const WEEKEND_CONFIRMERS = [{ role: 'IT on call', from: 480, to: 1350 }];

  /* name, area, pull share, unplanned use per hour: day (07-17), evening (17..21), night.
     The first eight are the devices of the stage demo (day.js), four more make a 12-C-arm site. */
  const PROFILES = [
    ['Cora', 'TRAUMA', 0.34, 0.30, [0.30, 0.24, 0.18, 0.12, 0.08], 0.05],
    ['Bogdan', 'SPINE', 0.09, 0.25, [0.34, 0.22, 0.10, 0.06, 0.04], 0.02],
    ['Cio', 'TRAUMA', 0.10, 0.22, [0.03, 0.02, 0.01, 0.01, 0.01], 0.01],
    ['Arcus', 'VASCULAR', 0.08, 0.20, [0.10, 0.06, 0.04, 0.03, 0.03], 0.02],
    ['Fritzi', 'RESERVE', 0.18, 0.15, [0.10, 0.08, 0.06, 0.05, 0.04], 0.03],
    ['Rudi', 'NEURO', 0.04, 0.20, [0.08, 0.04, 0.02, 0.02, 0.02], 0.01],
    ['Nova', 'HAND', 0.03, 0.20, [0.04, 0.02, 0.02, 0.01, 0.01], 0.01],
    ['Otto', 'EMERGENCY', 0.90, 0.20, [0.10, 0.08, 0.08, 0.06, 0.06], 0.05],
    ['Lumi', 'ORTHO', 0.06, 0.22, [0.08, 0.05, 0.03, 0.02, 0.02], 0.01],
    ['Pia', 'ORTHO', 0.06, 0.22, [0.08, 0.05, 0.03, 0.02, 0.02], 0.01],
    ['Hugo', 'URO', 0.03, 0.18, [0.05, 0.03, 0.02, 0.01, 0.01], 0.01],
    ['Mira', 'GYN', 0.03, 0.18, [0.05, 0.03, 0.02, 0.01, 0.01], 0.01],
  ];
  const CASES_PER_WEEKDAY = { TRAUMA: 2.2, SPINE: 2.5, VASCULAR: 2, RESERVE: 0.6, NEURO: 2, HAND: 2.5, EMERGENCY: 1.2, ORTHO: 2.5, URO: 2, GYN: 2 };

  const useTable = (day, evening, night) => {
    const a = Array(24).fill(night);
    for (let h = 7; h < 17; h++) a[h] = day;
    evening.forEach((v, i) => { a[17 + i] = v; });
    return a;
  };

  /* ---------- deterministic randomness: one uniform per (run, purpose, day, device, k) ---------- */
  const mix = (h) => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; };
  const strHash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const T = {};
  ['sock', 'lan', 'ng', 'cn', 'c0', 'cd', 'cg', 'ce', 'ces', 'need', 'alN', 'alT', 'alP', 'ov', 'stay', 'acc', 'move', 'bay', 'comp',
    'rob', 'bi', 'tap', 'abs', 'doa', 'res', 'tLeft', 'tPress'].forEach((k) => { T[k] = strHash(k); });
  function u(seed, tag, a, b, c) {
    let h = mix((seed >>> 0) ^ tag);
    h = mix(h ^ Math.imul((a | 0) + 1, 0x9e3779b1));
    h = mix(h ^ Math.imul((b | 0) + 1, 0x85ebca77));
    h = mix(h ^ Math.imul((c | 0) + 1, 0xc2b2ae3d));
    return h / 4294967296;
  }
  function poisson(x, lam) { let k = 0, p = Math.exp(-lam), s = p; while (x > s && k < 50) { k++; p *= lam / k; s += p; } return k; }
  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const hh = G.hh;

  /* ---------- the synthetic hospital of one run ---------- */
  function plannedCases(seed, d, i, area, weekend) {
    const n = Math.min(4, poisson(u(seed, T.cn, d, i), weekend ? 0.15 : (CASES_PER_WEEKDAY[area] || 2)));
    const out = [];
    let t = 450 + Math.floor(u(seed, T.c0, d, i) * 9) * 10;              // first case 07:30 to 08:50
    for (let k = 0; k < n; k++) {
      const dur = 50 + Math.floor(u(seed, T.cd, d, i, k) * 11) * 10;     // 50 to 150 min
      if (t + dur > 18 * 60) break;
      out.push({ from: t, to: t + dur, proc: 'CASE' });
      t += dur + 20 + Math.floor(u(seed, T.cg, d, i, k) * 4) * 10;       // 20 to 50 min turnover
    }
    if (!weekend && u(seed, T.ce, d, i) < 0.12) {                        // an occasional evening elective
      const s = Math.max(t, 17 * 60 + Math.floor(u(seed, T.ces, d, i) * 12) * 10);
      if (s + 90 <= 21 * 60) out.push({ from: s, to: s + 90, proc: 'EVENING CASE' });
    }
    return out;
  }

  /* Times (10-min slices) at which someone urgently wants this very C-arm: unplanned use plus
     emergencies that would pull it. Drawn from the same per-hour model the brain uses, so the
     brain is calibrated. Most of them happen while the device is idle and do no harm. */
  function needTimes(seed, d, i, dev) {
    const out = [];
    for (let m = 360; m < 1800; m += 10) {
      const h = Math.floor(m / 60) % 24;
      const stay = Math.pow(1 - Math.min(0.99, dev.use[h]), 1 / 6) * Math.exp(-(RATE[h] * dev.pull) / 6);
      if (u(seed, T.need, d, i, m) < 1 - stay) out.push(m);
    }
    return out;
  }

  function hospital(p, run) {
    const seed = mix((p.seed >>> 0) + Math.imul(run + 1, 7919));
    const devs = [];
    for (let i = 0; i < p.fleet; i++) {
      const pr = PROFILES[i % PROFILES.length];
      const round = Math.floor(i / PROFILES.length);
      devs.push({ ix: i, id: 'C-' + String(i + 1).padStart(2, '0'), name: pr[0] + (round ? ' ' + (round + 1) : ''),
        area: pr[1], pull: pr[2], use: useTable(pr[3], pr[4], pr[5]),
        socket: u(seed, T.sock, i) >= p.noSocket, lan: u(seed, T.lan, i) < p.orLan, nextGen: false });
    }
    const order = devs.map((dv, i) => [u(seed, T.ng, i), i]).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < Math.round(p.nextGen * p.fleet); k++) devs[order[k][1]].nextGen = true;
    const days = [];
    for (let d = 0; d < p.days; d++) {
      const weekend = d % 7 >= 5;
      const alarms = [];
      const nAl = poisson(u(seed, T.alN, d), p.alarmsPerDay);
      for (let k = 0; k < nAl; k++) {
        const at = 480 + Math.floor(u(seed, T.alT, d, k) * 96) * 10;    // 08:00 to 23:50
        alarms.push({ k, at, from: at + 14, to: at + 264, area: ['TRAUMA', 'EMERGENCY'], label: 'POLYTRAUMA' });
      }
      alarms.sort((a, b) => a.at - b.at);
      days.push({ d, weekend, alarms, confirmers: weekend ? WEEKEND_CONFIRMERS : WEEKDAY_CONFIRMERS,
        cases: devs.map((dv, i) => plannedCases(seed, d, i, dv.area, weekend)),
        needs: devs.map((dv, i) => needTimes(seed, d, i, dv)) });
    }
    return { seed, devs, days };
  }

  /* ---------- the brain: legal windows with P(undisturbed), from the team's scorer ---------- */
  const STEP = 20; // the sim uses a 20-min grid (the demo uses 10) to stay fast in a browser
  function brainDay(H, d, p, now, blocks) {
    const D = H.days[d];
    const devices = H.devs.map((dv, i) => ({ id: dv.id, area: dv.area, socket: true, update: { art: 'patch' },
      weeks: 8, pull: dv.pull, use: dv.use, cases: D.cases[i] }));
    const ctx = { now, horizon: { from: 360, to: 1800 }, rate: RATE, confirmers: D.confirmers, robotBusy: [], blocks: blocks || [], minP: p.minP };
    return { devices, ctx };
  }
  function windowsFor(B, i, from) {
    const ok = [];
    const dev = B.devices[i];
    for (let s = Math.ceil(Math.max(from, B.ctx.now + R.VORLAUF) / STEP) * STEP; s + R.DUR + R.PUFFER <= B.ctx.horizon.to; s += STEP) {
      const c = G.evaluate(B.devices, dev, s, B.ctx);
      if (c.status === 'ok') ok.push(c);
    }
    return ok.sort((a, b) => b.p - a.p || a.from - b.from);
  }

  /* ---------- the hands: one function per way of serving one window ----------
     Returns null when the hand cannot serve this window at all (the brain knows that from the
     device file), otherwise the chance it delivers at the start, clinic minutes, and whether
     something at the device guards the install ("updating until 21:10, take C-04"). */
  const lastEnd = (cases) => (cases.length ? Math.max(...cases.map((c) => c.to)) : null);
  const acceptP = (p, from) => (from < 22 * 60 ? p.acceptEve : p.acceptLate);
  const wakeP = (p, from) => (p.remoteWake ? 1 : acceptP(p, from));
  const wakeStaff = (p) => (p.remoteWake ? 0 : 2);
  const MODES = {
    stay(p, dv, c, cases, o) { // People A1: it stays plugged in its OR after the last case, the last person agrees
      const end = lastEnd(cases);
      if (end == null || !(dv.lan || o.dataCompanion) || c.from > end + 60) return null;
      return { mode: 'stay', hand: 'people', p: p.stayOk * acceptP(p, c.from) * p.tap, staff: 1, guard: !!o.dataCompanion };
    },
    socket(p, dv, c, cases, o) { // People A2: plug it into the socket next to its parking spot and switch it on
      if (!dv.socket || !(dv.lan || o.dataCompanion)) return null;
      return { mode: 'socket', hand: 'people', p: acceptP(p, c.from) * p.tap, staff: 3.5, guard: !!o.dataCompanion };
    },
    move(p, dv, c, cases, o) {   // People A3: push it to the nearest socket
      if (!(dv.lan || o.dataCompanion)) return null;
      return { mode: 'move', hand: 'people', p: p.acceptMove * p.tap, staff: 10.5, guard: !!o.dataCompanion };
    },
    bay(p, dv, c) {         // B: a parking bay with power and wired LAN; the bay light guards it
      return { mode: 'bay', hand: 'bay', p: p.bayDiscipline * wakeP(p, c.from) * p.tap, staff: 0.5 + wakeStaff(p), guard: true };
    },
    companion(p, dv, c) {   // C: battery, cache and display ride with the C-arm
      return { mode: 'companion', hand: 'companion', p: p.companionReady * wakeP(p, c.from) * p.tap, staff: 1 + wakeStaff(p), guard: true };
    },
    robot(p, dv, c) {       // D: the robot brings power and the package, docks, guards, takes logs home
      if (p.robots < 1) return null;
      return { mode: 'robot', hand: 'robot', p: p.robotMission * wakeP(p, c.from) * p.tap, staff: 1 + wakeStaff(p), guard: true, robot: true };
    },
    builtin(p, dv) {        // E: next-gen device with its own power and connectivity
      if (!dv.nextGen || !(p.cellularAllowed || dv.lan)) return null;
      return { mode: 'builtin', hand: 'built-in', p: 0.98 * p.tap, staff: 0.5, guard: true };
    },
  };

  const OPTIONS = [
    { id: '0', key: 'today', name: 'Today', short: 'Today', modes: [] },
    { id: 'A', key: 'people', name: 'People-powered', short: 'A People', modes: ['stay', 'socket', 'move'] },
    { id: 'B', key: 'bays', name: 'Smart parking bays', short: 'B Bays', modes: ['bay'] },
    { id: 'C', key: 'companion', name: 'Companion box', short: 'C Companion', modes: ['companion'] },
    { id: 'D', key: 'robot', name: 'Robot courier', short: 'D Robot', modes: ['robot'] },
    { id: 'E', key: 'builtin', name: 'Built-in (next gen)', short: 'E Built-in', modes: ['builtin'], legacyToday: true },
    // F is staged. F1: people plus a small data companion on every C-arm (cache, gigabit link, display; no big battery).
    // F2: F1 plus one robot for the windows people can't power. The router picks the cheapest hand per window.
    { id: 'F1', key: 'hybrid1', name: 'One brain, many hands · stage 1 (people + data companion)', short: 'F1 Hybrid', modes: ['stay', 'socket', 'move'], dataCompanion: true },
    { id: 'F2', key: 'hybrid2', name: 'One brain, many hands · stage 2 (+ one robot)', short: 'F2 Hybrid', modes: ['stay', 'socket', 'robot', 'move'], dataCompanion: true },
  ];

  function capex(opt, p) {
    switch (opt.key) {
      case 'bays': return p.fleet * COST.bay;
      case 'companion': return p.fleet * COST.companion;
      case 'robot': return p.robots ? p.robots * (COST.robot + COST.robotKit) + COST.building : 0;
      case 'hybrid1': return p.fleet * COST.dataCompanion;
      case 'hybrid2': return p.fleet * COST.dataCompanion + (p.robots ? p.robots * (COST.robot + COST.robotKit) + COST.building : 0);
      default: return 0;
    }
  }

  /* ---------- one option, one run ---------- */
  const STAFF_W = 0.004; // the brain trades 10 clinic minutes against 4 points of success chance

  function runOption(H, opt, p) {
    const N = H.devs.length;
    const st = { patchedDay: Array(N).fill(Infinity), back: Array(N).fill(null), staff: 0, started: 0, planned: 0, pulled: 0,
      doa: 0, alarmMoves: 0, robotJobs: 0, reasons: {}, log: [], windows: [] };
    const fail = (why) => { st.reasons[why] = (st.reasons[why] || 0) + 1; };
    const pending = (i, d) => st.patchedDay[i] === Infinity && !(st.back[i] != null && d < st.back[i]);

    for (let d = 0; d < p.days; d++) {
      const D = H.days[d];
      for (let i = 0; i < N; i++) if (st.back[i] != null && st.back[i] === d) { st.patchedDay[i] = d; st.back[i] = null; }
      const brainDevs = [], todayDevs = [];
      for (let i = 0; i < N; i++) {
        if (!pending(i, d) || st.back[i] != null) continue;
        if (opt.key === 'today' || (opt.legacyToday && !H.devs[i].nextGen)) todayDevs.push(i); else brainDevs.push(i);
      }
      if (todayDevs.length) runToday(H, D, todayDevs, p, st, fail);
      if (!brainDevs.length) continue;

      // Morning plan at 06:00: every pending device, every legal window, every way this option can serve it.
      const choices = brainDevs.map((i) => {
        const list = [];
        for (const c of morning(H, d, p, i)) {
          for (const mk of opt.modes) {
            const m = MODES[mk](p, H.devs[i], c, D.cases[i], opt);
            if (m) list.push({ i, c, m, score: c.p * m.p - STAFF_W * m.staff });
          }
        }
        return list.sort((a, b) => b.score - a.score);
      });
      // Most constrained device first, then greedy under the shared limits.
      const orderIx = choices.map((l, k) => k).sort((a, b) => choices[a].length - choices[b].length || brainDevs[a] - brainDevs[b]);
      let plan = [];
      for (const k of orderIx) {
        if (plan.length >= p.maxPerNight) break;
        const pick = choices[k].find((x) => fits(plan, x, p));
        if (pick) plan.push(windowOf(pick));
      }
      st.planned += plan.length;

      // Alarms: cancel windows they touch and re-plan them later the same day with the same rules.
      const blocks = [];
      for (const al of D.alarms) {
        blocks.push(al);
        for (const w of plan.slice()) {
          if (w.from <= al.at || !al.area.includes(H.devs[w.i].area) || !overlaps(w.from - R.VORLAUF, w.guardEnd, al.from, al.to)) continue;
          plan = plan.filter((x) => x !== w);
          const B2 = brainDay(H, d, p, al.at, blocks);
          let moved = null;
          for (const c of windowsFor(B2, w.i, al.at + R.VORLAUF).slice(0, 40)) {
            const m = MODES[w.m.mode](p, H.devs[w.i], c, D.cases[w.i], opt);
            const x = m && { i: w.i, c, m };
            if (x && fits(plan, x, p)) { moved = windowOf(x); break; }
          }
          if (moved) { plan.push(moved); st.alarmMoves++; } else fail('alarm: no later window today');
        }
      }

      for (const w of plan.sort((a, b) => a.from - b.from)) {
        const outcome = execute(H, D, w, p, st, fail, d);
        if (st.windows.length < 2000) st.windows.push({ d, i: w.i, id: H.devs[w.i].id, from: w.from, to: w.to, guardEnd: w.guardEnd, backup: w.backup, mode: w.m.mode, robot: !!w.m.robot, outcome });
      }
    }
    return st;
  }

  /* The morning windows of one device on one day do not depend on the option: compute once per run. */
  function morning(H, d, p, i) {
    const key = d * 1000 + i;
    H.cache = H.cache || {};
    if (!H.cache[key]) {
      H.brain = H.brain || {};
      if (!H.brain[d]) H.brain[d] = brainDay(H, d, p, 360, []);
      H.cache[key] = windowsFor(H.brain[d], i, 380).slice(0, 40);
    }
    return H.cache[key];
  }

  function windowOf(x) {
    return { i: x.i, c: x.c, m: x.m, from: x.c.from, to: x.c.from + R.DUR, guardEnd: x.c.from + R.DUR + R.PUFFER, backup: x.c.backup };
  }

  /* Shared limits: a backup that is not itself being updated, nobody is the backup and the patient
     at the same time, and the robots are not double-booked. MAX_PER_NIGHT is checked by the caller. */
  function fits(plan, x, p) {
    const from = x.c.from, guardEnd = x.c.from + R.DUR + R.PUFFER;
    const me = x.c.id;
    for (const w of plan) {
      if (!overlaps(from, guardEnd, w.from, w.guardEnd)) continue;
      if (w.c.id === x.c.backup || w.backup === me) return false;
    }
    if (x.m.robot) {
      const a = from - R.ROBOT_LEAD - 10, b = guardEnd + 30;                // travel there, guard, swap the battery pack
      const busy = plan.filter((w) => w.m.robot && overlaps(a, b, w.from - R.ROBOT_LEAD - 10, w.guardEnd + 30)).length;
      if (busy >= p.robots) return false;
    }
    return true;
  }

  /* One planned window meets reality: the case before it may run late, the hand may not deliver,
     someone may urgently need the device mid-install, an alarm may pull it, the install may fail. */
  function execute(H, D, w, p, st, fail, d) {
    const i = w.i, s = H.seed, m = w.m;
    const prev = D.cases[i].filter((c) => c.to <= w.from).sort((a, b) => b.to - a.to)[0];
    if (prev && u(s, T.ov, d, i) < G.OVERRUN_P * Math.exp(-(w.from - prev.to) / G.OVERRUN_TAU)) { fail('case before it ran late'); return 'not started'; }
    const late = w.from >= 22 * 60;
    const accept = u(s, T.acc, d, i) < (late ? p.acceptLate : p.acceptEve);
    const woke = p.remoteWake || accept;
    let ok = true, why = '';
    switch (m.mode) {
      case 'stay': if (u(s, T.stay, d, i) >= p.stayOk) { ok = false; why = 'room needed, device moved'; } else if (!accept) { ok = false; why = 'nobody took the job'; } break;
      case 'socket': if (!accept) { ok = false; why = 'nobody took the job'; } break;
      case 'move': if (u(s, T.move, d, i) >= p.acceptMove) { ok = false; why = 'nobody pushed it to a socket'; } break;
      case 'bay': if (u(s, T.bay, d, i) >= p.bayDiscipline) { ok = false; why = 'not parked in its bay'; } else if (!woke) { ok = false; why = 'nobody to switch it on'; } break;
      case 'companion': if (u(s, T.comp, d, i) >= p.companionReady) { ok = false; why = 'companion not ready'; } else if (!woke) { ok = false; why = 'nobody to switch it on'; } break;
      case 'robot': st.robotJobs++; if (u(s, T.rob, d, i) >= p.robotMission) { ok = false; why = 'robot mission failed'; } else if (!woke) { ok = false; why = 'nobody to switch it on'; } break;
      case 'builtin': if (u(s, T.bi, d, i) >= 0.98) { ok = false; why = 'device self-check failed'; } break;
      default: break;
    }
    if (ok && u(s, T.tap, d, i) >= p.tap) { ok = false; why = 'start not confirmed in time'; }
    st.staff += ok ? m.staff : 0.5;                                // a declined or failed job still costs a look
    if (!ok) { fail(why); return 'not started'; }
    st.started++;
    return install(H, D, i, w.from, w.from + R.DUR, m.guard ? p.absorbGuarded : p.absorbPlain, p, st, fail, d, m.mode);
  }

  function install(H, D, i, from, to, absorb, p, st, fail, d, mode) {
    const s = H.seed, dv = H.devs[i];
    const needs = D.needs[i].filter((t) => t >= from && t < to);
    for (const al of D.alarms) if (al.area.includes(dv.area) && al.from >= from && al.from < to && u(s, T.alP, d, i, al.k) < p.alarmPull) needs.push(al.from);
    needs.sort((a, b) => a - b);
    for (const t of needs) {
      if (u(s, T.abs, d, i, t) < absorb) continue;                 // the backup takes the call
      st.pulled++;
      if (u(s, T.doa, d, i) < p.doaIfPulled) { st.doa++; st.back[i] = d + p.repairDays; fail('pulled mid-install: dead on arrival'); return 'dead on arrival'; }
      fail('pulled mid-install: rolled back');
      return 'rolled back';
    }
    if (u(s, T.res, d, i) < p.doaResidual) { st.doa++; st.back[i] = d + p.repairDays; fail('install failed: dead on arrival'); return 'dead on arrival'; }
    st.patchedDay[i] = d;
    if (st.log.length < 400) st.log.push({ d, id: dv.id, from, mode });
    return 'patched';
  }

  /* Today: no brain, no named person, no backup. It only happens if the device is still on and
     plugged after its last case, already has the package, and someone presses start anyway. */
  function runToday(H, D, list, p, st, fail) {
    const s = H.seed, d = D.d;
    for (const i of list) {
      const dv = H.devs[i];
      const cs = D.cases[i];
      if (!cs.length || !dv.lan) continue;                          // switched off all day, or the package never arrived
      if (u(s, T.tLeft, d, i) >= p.todayLeftOn || u(s, T.tPress, d, i) >= p.todayPress) continue;
      const k = Math.min(cs.length - 1, Math.floor(u(s, T.tLeft, d, i, 1) * cs.length)); // after which case it happened
      const from = cs[k].to + 10, to = from + R.DUR;
      st.staff += 1;
      st.started++;
      if (cs.some((c, j) => j > k && overlaps(from, to, c.from, c.to))) {   // the kick-off skit: the next case needs it
        st.pulled++;
        if (u(s, T.doa, d, i) < p.doaIfPulled) { st.doa++; st.back[i] = d + p.repairDays; fail('pulled mid-install: dead on arrival'); }
        else fail('pulled mid-install: rolled back');
        continue;
      }
      install(H, D, i, from, to, p.absorbToday, p, st, fail, d, 'today');
    }
  }

  /* ---------- many runs, all options, summary ---------- */
  function quantile(arr, q) { const a = arr.slice().sort((x, y) => x - y); if (!a.length) return NaN; const k = (a.length - 1) * q; const lo = Math.floor(k), hi = Math.ceil(k); return a[lo] + (a[hi] - a[lo]) * (k - lo); }

  function simulate(overrides, optKeys) {
    const p = Object.assign({}, PARAMS, overrides || {});
    const keepDur = R.DUR;
    R.DUR = p.installMin;
    try {
      const opts = OPTIONS.filter((o) => !optKeys || optKeys.includes(o.key));
      const acc = opts.map(() => ({ byDeadline: [], byEnd: [], to90: [], staff: [], perPatched: [], pulledPer100: [], doa: [], visits: [],
        robotJobs: [], alarmMoves: [], reasons: {}, curve: Array(p.days).fill(0), started: 0, planned: 0 }));
      const need90 = Math.ceil(0.9 * p.fleet);
      for (let r = 0; r < p.runs; r++) {
        const H = hospital(p, r);
        opts.forEach((opt, k) => {
          const st = runOption(H, opt, p);
          const a = acc[k];
          const days = st.patchedDay;
          const by = (day) => days.filter((x) => x <= day).length;
          a.byDeadline.push(by(p.deadline - 1) / p.fleet);
          a.byEnd.push(by(p.days - 1) / p.fleet);
          const sorted = days.slice().sort((x, y) => x - y);
          a.to90.push(sorted[need90 - 1] === Infinity ? Infinity : sorted[need90 - 1] + 1);
          a.staff.push(st.staff);
          const n = by(p.days - 1);
          a.perPatched.push(n ? st.staff / n : NaN);
          a.pulledPer100.push(st.started ? (100 * st.pulled) / st.started : 0);
          a.doa.push(st.doa);
          a.visits.push(st.doa + (p.fleet - by(p.deadline - 1)));
          a.robotJobs.push(st.robotJobs);
          a.alarmMoves.push(st.alarmMoves);
          a.started += st.started; a.planned += st.planned;
          for (const [why, c] of Object.entries(st.reasons)) a.reasons[why] = (a.reasons[why] || 0) + c;
          for (let d = 0; d < p.days; d++) a.curve[d] += by(d) / p.fleet;
        });
      }
      const mean = (xs) => { const v = xs.filter((x) => Number.isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
      const results = opts.map((opt, k) => {
        const a = acc[k];
        const reached = a.to90.filter((x) => x !== Infinity).length / p.runs;
        const top = Object.entries(a.reasons).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([why, c]) => ({ why, perRun: c / p.runs }));
        const staffEUR = mean(a.staff) * COST.staffPerMin, visitEUR = mean(a.visits) * COST.visit;
        return {
          id: opt.id, key: opt.key, name: opt.name, short: opt.short,
          patchedByDeadline: mean(a.byDeadline), patchedByDeadlineP10: quantile(a.byDeadline, 0.1), patchedByDeadlineP90: quantile(a.byDeadline, 0.9),
          patchedByEnd: mean(a.byEnd),
          daysTo90Median: quantile(a.to90, 0.5), reached90Share: reached,
          staffMinutes: mean(a.staff), staffPerPatched: mean(a.perPatched),
          pulledPer100: mean(a.pulledPer100), doa: mean(a.doa), visits: mean(a.visits),
          robotJobs: mean(a.robotJobs), alarmMoves: mean(a.alarmMoves),
          windowsPlanned: a.planned / p.runs, installsStarted: a.started / p.runs,
          capexEUR: capex(opt, p), roundCostEUR: staffEUR + visitEUR,
          curve: a.curve.map((x) => x / p.runs), topReasons: top,
        };
      });
      return { params: p, cost: COST, results };
    } finally {
      R.DUR = keepDur;
    }
  }

  /* A single run with its full event trail, for tests and for the page's day view. */
  function trace(overrides, key, run) {
    const p = Object.assign({}, PARAMS, overrides || {});
    const keepDur = R.DUR;
    R.DUR = p.installMin;
    try {
      const H = hospital(p, run || 0);
      const opt = OPTIONS.find((o) => o.key === key);
      return { H, st: runOption(H, opt, p), p };
    } finally { R.DUR = keepDur; }
  }

  const api = { PARAMS, COST, OPTIONS, MODES, RATE, PROFILES, hospital, simulate, trace, brainDay, windowsFor, hh, u, T };
  if (isNode) module.exports = api;
  root.BreifSim = api;
})(typeof window !== 'undefined' ? window : globalThis);
