/* IA click dummy: window planner and safety rules.
   Pure functions, no DOM. Runs in the browser (window.IAPlanner) and in Node (module.exports).
   All input data is synthetic. Source of the rules: challenges/04-invisible-connectivity/
   synthese-nach-gespraech.md, section 5 ("Feste Regeln, keine KI", "Das KI-gestützte Scheduling"). */
(function (root) {
  'use strict';

  const RULES = {
    DUR: 120,          // update duration in minutes ("rund 120 Minuten", Gespräch 12.11.)
    PUFFER: 30,        // buffer for a rollback before the next case [Annahme]
    VORLAUF: 20,       // gap after the last case, example "endet 17:00, Gerät 17:20" (Synthese)
    MAX_RISK: 0.25,    // highest accepted share of past weeks with use in the window [Annahme]
    MIN_WEEKS: 4,      // below this the usage pattern is too thin to propose anything [Annahme]
    MAX_PER_NIGHT: 2,  // "nie die ganze Flotte in einer Nacht" (Synthese, Leitplanken)
    DAY_START: 6 * 60,
    DAY_END: 24 * 60,
    STEP: 10,
    ROBOT_LEAD: 15,    // robot arrives before the start and guards the whole update
  };

  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  const isWeekend = (day, weekendDays) => weekendDays.includes(day);

  /* Highest hourly share of past weeks with use inside [from, to) on this kind of day. This is the
     busiest hour of the window, a lower bound for "used at some point in the window", and the UI
     words it that way. Returns NaN when an hour has no value: missing data is never read as 0. */
  function windowRisk(dev, day, from, to, weekendDays) {
    const table = dev.risk && (isWeekend(day, weekendDays) ? dev.risk.we : dev.risk.wt);
    if (!Array.isArray(table)) return NaN;
    let r = 0;
    for (let h = Math.floor(from / 60); h * 60 < to; h++) {
      if (typeof table[h] !== 'number' || !Number.isFinite(table[h])) return NaN;
      r = Math.max(r, table[h]);
    }
    return r;
  }

  /* Is the device in a planned case or an alarm block at this minute? A day without plan data counts
     as in use: the rule "never during a case" must not pass because data is missing. */
  function inUse(dev, day, at, blocked) {
    if (!Array.isArray(dev.busy) || !Array.isArray(dev.busy[day])) return true;
    const all = dev.busy[day].concat(((blocked || {})[dev.id] || []).filter((b) => b.day === day));
    return all.some((b) => b.from <= at && at < b.to);
  }

  /* Earliest window on one day that touches no planned case and stays under the risk limit.
     ctx: { now (minutes, day 0 only), blocked: {id: [{day, from, to}]}, robotBusy: [{day, from, to}],
            weekendDays: [..] } */
  function findWindow(dev, day, ctx) {
    if (!dev.update) return { ok: false, grund: 'aktuell' };
    // Updates with arm movement are never started remotely (Leitplanke).
    if (dev.update.art === 'arm') return { ok: false, grund: 'vor-ort' };
    // Missing plan or usage data gives no proposal. It is never treated as "free" or "no risk".
    if (!Number.isFinite(dev.datenWochen) || !Array.isArray(dev.busy) || !Array.isArray(dev.busy[day])) return { ok: false, grund: 'daten-fehlen' };
    if (dev.datenWochen < RULES.MIN_WEEKS) return { ok: false, grund: 'datenlage' };

    const busy = dev.busy[day].concat(((ctx.blocked || {})[dev.id] || []).filter((b) => b.day === day));
    const needsRobot = !dev.strom;
    const earliest = Math.max(RULES.DAY_START, day === 0 && ctx.now != null ? ctx.now + RULES.VORLAUF : 0);
    let riskTooHigh = false;

    for (let s = Math.ceil(earliest / RULES.STEP) * RULES.STEP; s + RULES.DUR + RULES.PUFFER <= RULES.DAY_END; s += RULES.STEP) {
      const end = s + RULES.DUR;
      // A window that collides with a planned case is never proposed.
      if (busy.some((b) => overlaps(s - RULES.VORLAUF, end + RULES.PUFFER, b.from, b.to))) continue;
      if (needsRobot && (ctx.robotBusy || []).some((b) => b.day === day && overlaps(s - RULES.ROBOT_LEAD, end, b.from, b.to))) continue;
      const risk = windowRisk(dev, day, s, end, ctx.weekendDays || []);
      if (Number.isNaN(risk)) return { ok: false, grund: 'daten-fehlen' };
      if (risk > RULES.MAX_RISK) { riskTooHigh = true; continue; }
      const before = busy.filter((b) => b.to <= s).sort((a, b) => b.to - a.to)[0] || null;
      return { ok: true, id: dev.id, day, from: s, to: end, risk, needsRobot, letzterFall: before ? before.to : null };
    }
    return { ok: false, grund: riskTooHigh ? 'risiko' : 'kein-platz' };
  }

  /* Plan the whole week: most urgent deadline first, never more than MAX_PER_NIGHT devices per day,
     every window with a replacement device that is not being updated at the same time. */
  function fillGaps(devices, ctx) {
    const plan = [];
    const offen = [];
    const robotBusy = (ctx.robotBusy || []).slice();
    const perDay = {};
    const queue = devices.filter((d) => d.update).sort((a, b) => a.update.frist - b.update.frist || a.id.localeCompare(b.id));

    for (const dev of queue) {
      let found = null;
      let grund = 'kein-platz';
      // Never plan beyond the days the OP plan covers.
      const lastDay = Array.isArray(dev.busy) ? Math.min(dev.update.frist, dev.busy.length - 1) : 0;
      for (let day = 0; day <= lastDay && !found; day++) {
        if ((perDay[day] || 0) >= RULES.MAX_PER_NIGHT) { grund = 'staffelung'; continue; }
        const w = findWindow(dev, day, Object.assign({}, ctx, { robotBusy }));
        if (!w.ok) { grund = w.grund; if (['vor-ort', 'datenlage', 'daten-fehlen'].includes(w.grund)) break; continue; }
        // A device that is the replacement for an overlapping window is not updated at the same time.
        if (isErsatzDuring(plan, dev.id, w)) { grund = 'ist-ersatz'; continue; }
        const ersatz = pickErsatz(devices, dev, w, plan);
        if (!ersatz) { grund = 'kein-ersatz'; continue; }
        found = Object.assign(w, { ersatz, frist: dev.update.frist, status: 'vorschlag' });
      }
      if (found) {
        plan.push(found);
        perDay[found.day] = (perDay[found.day] || 0) + 1;
        if (found.needsRobot) robotBusy.push({ day: found.day, from: found.from - RULES.ROBOT_LEAD, to: found.to });
      } else {
        offen.push({ id: dev.id, grund });
      }
    }
    return { plan, offen };
  }

  const windowsClash = (p, w) => p.day === w.day && overlaps(p.from, p.to + RULES.PUFFER, w.from, w.to + RULES.PUFFER);
  const isErsatzDuring = (plan, id, w) => plan.some((p) => p.ersatz === id && windowsClash(p, w));

  /* Replacement: another device that has no update window overlapping this one and is not already
     the replacement for an overlapping window. Devices on the current version come first. */
  function pickErsatz(devices, dev, w, plan) {
    const clash = (p) => p.day === w.day && overlaps(p.from, p.to + RULES.PUFFER, w.from, w.to + RULES.PUFFER);
    const taken = plan.filter(clash).map((p) => p.ersatz);
    const updating = plan.filter(clash).map((p) => p.id);
    const cands = devices.filter((d) => d.id !== dev.id && !d.ausfall && !taken.includes(d.id) && !updating.includes(d.id));
    cands.sort((a, b) => (a.update ? 1 : 0) - (b.update ? 1 : 0) || a.id.localeCompare(b.id));
    return cands.length ? cands[0].id : null;
  }

  /* New window on the same day after an alarm block. Runs the same rules as the first plan: robot
     bookings of the other windows are respected and the replacement device is picked again.
     The number of windows per day does not change, so MAX_PER_NIGHT still holds. */
  function reschedule(devices, dev, w, plan, ctx) {
    const others = plan.filter((p) => p.id !== dev.id);
    const robotBusy = others.filter((p) => p.needsRobot).map((p) => ({ day: p.day, from: p.from - RULES.ROBOT_LEAD, to: p.to }));
    const n = findWindow(dev, w.day, Object.assign({}, ctx, { robotBusy }));
    if (!n.ok) return n;
    if (isErsatzDuring(others, dev.id, n)) return { ok: false, grund: 'ist-ersatz' };
    const ersatz = pickErsatz(devices, dev, n, others);
    if (!ersatz) return { ok: false, grund: 'kein-ersatz' };
    return Object.assign(n, { ersatz });
  }

  /* Fixed safety rules for the remote start. No proposal can overrule them. */
  function canStart(v) {
    const gruende = [];
    if (v.art === 'arm') gruende.push('Update mit Armbewegung: nur beaufsichtigt vor Ort');
    if (!v.freigabe) gruende.push('Freigabe der Medizinphysik fehlt');
    if (!v.umgebungFrei) gruende.push('Meldung „Umgebung frei“ fehlt');
    if (v.imEinsatz) gruende.push('Gerät ist im Einsatz');
    if (v.alarm) gruende.push('Alarm: Fenster gesperrt');
    if (!v.paketGeprueft || v.paketZurueckgerufen) gruende.push('Paket nicht geprüft oder zurückgerufen');
    return { ok: gruende.length === 0, gruende };
  }

  /* Planning urgency 0 to 100 for sorting the fleet. Not a clinical score. */
  function urgency(dev) {
    let score = 0;
    const warum = [];
    if (dev.update) {
      const f = dev.update.frist;
      score += Math.max(10, 70 - 10 * f);
      warum.push(f <= 0 ? 'Frist heute' : 'Frist in ' + f + (f === 1 ? ' Tag' : ' Tagen'));
    }
    if (dev.wartungTage != null && dev.wartungTage <= 14) { score += 15; warum.push('Prüfung in ' + dev.wartungTage + ' Tagen fällig'); }
    if (dev.sla && dev.sla.ist < dev.sla.soll) { score += 15; warum.push('Verfügbarkeit unter Vertrag'); }
    if (dev.ausfall) { score = 100; warum.unshift('Gerät nicht einsatzbereit'); }
    return { score: Math.min(100, score), warum };
  }

  const api = { RULES, findWindow, fillGaps, pickErsatz, reschedule, inUse, canStart, urgency, windowRisk };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.IAPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis);
