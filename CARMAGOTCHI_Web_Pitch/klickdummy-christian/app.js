/* IA click dummy: screens and interactions. Vanilla JS, no build step, runs offline.
   All data is synthetic (data.js). Planning and safety rules live in planner.js and are tested.
   Every screen text exists in German and English: L(de, en) for screen texts, X(s) for strings
   that come from data.js or planner.js (dictionary in i18n.js). */
(function () {
  'use strict';
  const P = window.IAPlanner, D = window.IAData, I = window.IAI18n;
  const $ = (id) => document.getElementById(id);
  const KEY = 'ia-klickdummy-v6';
  const T0 = 6 * 60, SPAN = 18 * 60;

  /* ---------- state ---------- */
  const fresh = (lang) => ({
    lang: lang || 'de', route: 'start', tab: 'wartung', seen: null, svcOk: false, learned: false, lernOk: false, tour: false, mode: 'tief', quiet: false, bund: {}, prep: {}, share: { sw: false, nutz: false, ort: false }, ortJob: {}, nachweis: false, typ: 'roe', skill: null, role: 'mp', view: 'tag', rows: 'geraete', day: 0, plan: [], offen: [], filled: false, scanning: false,
    sel: null, dev: 'C-03', part: 'akku', pet: 'C-03', blocked: {}, alarm: null, fail: [],
    merged: false, tech: false, plugged: {}, woke: {}, akte: null, scene: 0, app: 0, rob: null, jobs: [], jobN: 0, me: 'frei', vorOrt: {},
    theme: 'night', jr: 0, push: [], pushN: 0, ph: { open: false, who: 'lena', view: null, note: null },
    feed: [
      ['16:31', 'bote', 'Begleiter an Cio meldet: steht im Flur B, kein Strom, Akku 71 %.', 'Companion at Cio reports: standing in Corridor B, no power, battery 71 %.'],
      ['15:02', 'dolmetscher', 'IT-Abteilung hat die Frist Mo 23.11. für das Sicherheitsupdate 4.2.1 bestätigt. Eine Frage, eine Antwort.', 'The IT department confirmed the deadline Mon 23 Nov for security update 4.2.1. One question, one answer.'],
      ['12:10', 'bote', 'Logs von 7 der 8 Geräte übertragen, ohne Patientendaten. Cio fehlt seit 9 Tagen.', 'Logs of 7 of the 8 devices transferred, without patient data. Cio has been missing for 9 days.'],
      ['07:05', 'waechter', 'Arcus und Fritzi haben sich nach dem Update von gestern Abend zurückgemeldet. Version 4.2.1.', 'Arcus and Fritzi reported back after last night’s update. Version 4.2.1.'],
    ],
  });
  let S = fresh();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.feed) { S = Object.assign(fresh(), s, { scanning: false }); S.plan.forEach((w) => { if (w.status === 'unterwegs' && !S.rob) w.status = 'geplant'; }); } /* a robot on its way needs its mission state */ } catch (e) { /* storage may be unavailable */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  /* ---------- language ---------- */
  const en = () => S.lang === 'en';
  const L = (de, e) => (en() ? e : de);
  const X = (s) => (en() ? I.en(s) : s);
  /* A place inside an English sentence: 'in OR 1', 'in the trauma room'. */
  const XS = (s) => ({ 'Schockraum': 'the trauma room', 'Geräteraum Ebene 2': 'the equipment room on level 2' }[s] || X(s));
  /* Builds a text in both languages, for entries that are stored (log, alerts). */
  const both = (fn) => { const keep = S.lang; S.lang = 'de'; const de = fn(); S.lang = 'en'; const e = fn(); S.lang = keep; return [de, e]; };
  const pick = (pair) => pair[en() ? 1 : 0];

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const dev = (id) => D.DEVICES.find((d) => d.id === id);
  const win = (id) => S.plan.find((w) => w.id === id);
  const dayK = (i) => X(D.DAYS[i].k);
  const dayD = (i) => (en() ? I.date(D.DAYS[i].d) : D.DAYS[i].d);
  const dayL = (i) => dayK(i) + ' ' + dayD(i);
  const days = (n) => L(n === 1 ? '1 Tag' : n + ' Tagen', n === 1 ? '1 day' : n + ' days');
  const pct = (n) => (en() ? n.toFixed(1) : n.toFixed(1).replace('.', ','));
  const ctx = () => ({ now: D.NOW, weekendDays: D.WEEKEND, blocked: S.blocked, robotBusy: [] });
  const ROLES = ['mp', 'it', 'nurse'];
  const role = (r) => ({ mp: L('Medizinphysik', 'Medical physics'), it: L('IT-Abteilung', 'IT department'), nurse: L('Person am Gerät', 'Person at the device') }[r]);
  const HNAME = { lotse: 'Lotse', bote: 'Bote', waechter: 'Wächter', dolmetscher: 'Dolmetscher' };
  const hn = (k) => X(HNAME[k]);
  const STATUS = { vorschlag: 'ai', geplant: 'warn', unterwegs: 'warn', bereit: 'warn', laeuft: 'org', fertig: 'ok', fehl: 'risk' };
  const statusL = (s) => ({ vorschlag: L('Vorschlag der KI', 'AI proposal'), geplant: L('Freigegeben', 'Released'), unterwegs: L('Roboter unterwegs', 'Robot on its way'), bereit: L('Bereit zum Start', 'Ready to start'), laeuft: L('Update läuft', 'Update running'), fertig: L('Aktuell', 'Up to date'), fehl: L('Nicht zurückgemeldet', 'Did not report back') }[s]);
  const aktuell = (d) => !d.update || !!S.vorOrt[d.id] || (win(d.id) && win(d.id).status === 'fertig');
  const swOf = (d) => (S.vorOrt[d.id] || (win(d.id) && win(d.id).status === 'fertig') ? '4.2.1' : d.sw);
  const feed = (h, fn) => { const [de, e] = both(fn); S.feed.unshift([hm(D.NOW + Math.min(9, S.feed.length - 3)), h, de, e]); };
  let toastT = null;
  const toast = (t) => { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3200); };

  const mood = (d) => {
    const w = win(d.id);
    if (w && w.status === 'fehl') return 'fehl';
    if (w && w.status === 'laeuft') return 'schlaeft';
    if (aktuell(d)) return 'froh';
    if (w && w.status !== 'vorschlag') return 'wartet';
    // A companion with a near deadline gets weak and dozes off until someone wakes it. It never dies.
    return d.update.frist <= 2 && !S.woke[d.id] ? 'matt' : 'hungrig';
  };
  const moodL = (m) => ({ froh: L('munter', 'cheerful'), wartet: L('hat einen Termin', 'has an appointment'), hungrig: L('hungrig', 'hungry'), matt: L('matt, schläft ein', 'weak, dozing off'), schlaeft: L('schläft, Update läuft', 'asleep, update running'), fehl: L('nicht zurückgemeldet', 'did not report back') }[m]);

  /* ---------- companion figures ----------
     The companion wears the C-ARMAGOTCHI key visuals of the team's video and pitch deck (assets/carmagotchi,
     see the README there), so video, deck and demo show the same character. Mood of the dummy -> figure:
       froh     (up to date, after the update)            -> bliss
       schlaeft (update running)                          -> update
       fehl     (did not report back after the update)    -> failure
       hungrig  (update due, nothing planned yet)         -> manic   ("chaos without controlled updates")
       matt     (deadline near, no power, dozing off)     -> lonely  (dimmed, stands still)
       wartet   (window released, still waiting for it)   -> lonely  (same figure as on the robot's display,
                                                                      "on my way to Cio")
     rollback.webp has no state in the dummy yet (a failed update goes to service, it is not rolled back here).
     The transparent variants are used; small avatars sit on a light plate so the outlines read in the dark theme. */
  const FIG = 'assets/carmagotchi/';
  const PET_IMG = { froh: 'bliss', schlaeft: 'update', fehl: 'failure', hungrig: 'manic', matt: 'lonely', wartet: 'lonely' };
  const fig = (file, cls, size, alt) => `<img class="${cls}" src="${FIG}${file}.webp" width="${size}" height="${size}" decoding="sync" draggable="false" alt="${alt || 'C-ARMAGOTCHI'}">`;
  function pet(m, size, live) {
    return fig(PET_IMG[m], `pet m-${m}${live ? ' live' : ''}`, size, `${L('Begleiter', 'Companion')}, ${moodL(m)}`);
  }
  /* The robot as a figure: KettyBot from the same deck. */
  const ketty = (size, cls) => fig('ketty', `ketty${cls ? ' ' + cls : ''}`, size, L('Service-Roboter KettyBot', 'KettyBot service robot'));
  /* Keep the figures in memory so a re-render never flashes an empty frame, also offline from file://. */
  const figKeep = ['bliss', 'update', 'failure', 'manic', 'lonely', 'ketty'].map((f) => { const i = new Image(); i.src = `${FIG}${f}.webp`; return i; });
  /* Aloha Robotics mark, same drawing as on the robot's front display (roboter-display/variante-c-unterwegs.html). */
  const aloha = () => `<span class="aloha" role="img" aria-label="Aloha Robotics"><svg viewBox="0 0 80 80" width="26" height="26" aria-hidden="true"><circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="40" cy="26" r="9" fill="#fb7637"/><path d="M12 50c7-7 14-7 21 0s14 7 21 0 11-6 15-3" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M17 61c6-5 12-5 18 0s12 5 18 0 9-4 12-2" fill="none" stroke="#00b8ac" stroke-width="5" stroke-linecap="round"/></svg><span><b>ALOHA</b><small>ROBOTICS</small></span></span>`;

  /* ---------- icons (plain line icons, no icon font) ---------- */
  const IC = {
    heute: '<path d="M3 11l9-7 9 7v9H3z"/>', tafel: '<path d="M3 5h18v14H3zM3 10h18M9 5v14"/>', geraete: '<path d="M17 4a8 8 0 100 16M17 4h3v4h-3M17 16h3v4h-3M5 21h6"/>',
    begleiter: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>', helfer: '<path d="M12 3l7 3v5c0 5-3 8.500-7 10-4-1.500-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  };
  IC.start = '<circle cx="12" cy="12" r="9"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/>';
  IC.dienste = '<path d="M4 6h7v5H4zM13 6h7v5h-7zM4 13h7v5H4zM13 13h7v5h-7z"/>';
  IC.roboter = '<rect x="5" y="9" width="14" height="9" rx="2"/><path d="M12 5v4M9 13h.01M15 13h.01M8 21h8"/>';
  IC.leitstand = '<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="2"/>';
  const icon = (k) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;

  /* ---------- actions on the plan ---------- */
  function doFill() {
    const r = P.fillGaps(D.DEVICES, ctx());
    S.plan = r.plan; S.offen = r.offen; S.filled = true; S.scanning = false;
    feed('lotse', () => L(`Woche geplant: ${r.plan.length} goldene Fenster gefunden, ${r.offen.length} Geräte ohne Vorschlag. Kein Fenster berührt einen geplanten Eingriff.`, `Week planned: ${r.plan.length} golden windows found, ${r.offen.length} devices without a proposal. No window touches a scheduled procedure.`));
  }
  function release(id) {
    const w = win(id); if (!w || w.status !== 'vorschlag') return;
    w.status = 'geplant';
    // A window today at a device that only has to stay plugged in: its companion asks the person at the device.
    if (w.day === 0 && !w.needsRobot) pushAdd('lena', 'plug', { dev: id });
    feed('dolmetscher', () => L(`${dev(id).name}: Fenster ${dayL(w.day)} ${hm(w.from)} von der Medizinphysik freigegeben. Ersatz ${dev(w.ersatz).name}.`, `${dev(id).name}: window ${dayL(w.day)} ${hm(w.from)} released by medical physics. Replacement ${dev(w.ersatz).name}.`));
  }
  function ready(id) {
    const w = win(id); if (!w || alarmNow(id)) return;
    // "Umgebung frei" and the package check are explicit reports of the robot or the companion.
    Object.assign(w, { status: 'bereit', umgebungFrei: true, paketGeprueft: true });
    const d = dev(id);
    pushAdd('mp', 'start', { dev: id });
    feed('bote', () => (w.needsRobot
      ? L(`Roboter steht an ${d.name} im ${d.ort}: Strom und Netz stehen, Paket geprüft, niemand in der Nähe. Umgebung frei.`, `Robot is at ${d.name} in ${XS(d.ort)}: power and network are up, package verified, nobody nearby. Surroundings clear.`)
      : L(`Begleiter an ${d.name}: eingesteckt in ${d.ort}, Gerät in Ruhe, Paket geprüft. Umgebung frei.`, `Companion at ${d.name}: plugged in in ${XS(d.ort)}, device at rest, package verified. Surroundings clear.`)));
  }
  /* An alarm block that is running right now for this device. */
  const alarmNow = (id) => (S.blocked[id] || []).some((b) => b.day === 0 && b.from <= D.NOW && D.NOW < b.to);
  function startCheck(id) {
    const w = win(id), d = dev(id);
    // The confirmation is given for the start at w.from, so "in use" is checked for that minute.
    const alarm = alarmNow(id) || (S.blocked[id] || []).some((b) => b.day === w.day && b.from < w.to && w.from < b.to);
    return P.canStart({ art: d.update.art, freigabe: w.status !== 'vorschlag', umgebungFrei: !!w.umgebungFrei, imEinsatz: P.inUse(d, w.day, w.from, S.blocked), alarm, paketGeprueft: !!w.paketGeprueft });
  }
  const gruende = (c) => c.gruende.map(X).join(' · ');
  function alarm() {
    const id = 'C-01', w = win(id);
    const block = { day: 0, from: D.NOW, to: D.NOW + 180 };
    S.blocked[id] = [block];
    const wasPlugged = !!S.plugged[id];
    const head = () => L('Schockraum fordert Saal 1 und Cora an. ', 'The trauma room requests OR 1 and Cora. ');
    let tail;
    if (w && ['vorschlag', 'geplant', 'bereit'].includes(w.status) && w.day === 0) {
      const alt = w.from;
      const n = P.reschedule(D.DEVICES, dev(id), w, S.plan, ctx());
      if (n.ok) {
        Object.assign(w, { from: n.from, to: n.to, risk: n.risk, ersatz: n.ersatz, letzterFall: block.to, verschoben: alt, umgebungFrei: false, paketGeprueft: false });
        if (w.status === 'bereit') w.status = 'geplant';
        S.plugged[id] = false;
        tail = () => L(`Coras Fenster war noch nicht gestartet, ist gesperrt und neu geplant: ${hm(alt)} wird ${hm(n.from)}.`, `Cora’s window had not started yet, is locked and replanned: ${hm(alt)} becomes ${hm(n.from)}.`);
      } else {
        S.plan = S.plan.filter((x) => x !== w); S.offen.push({ id, grund: 'kein-platz' });
        tail = () => L('Coras Fenster ist gesperrt, heute passt kein neues.', 'Cora’s window is locked, no new one fits today.');
      }
    } else if (w && w.status === 'laeuft') tail = () => L('Coras Update läuft schon und wird nicht abgebrochen. Ersatz: ', 'Cora’s update is already running and is not aborted. Replacement: ') + dev(w.ersatz).name + '.';
    else if (w && w.status === 'unterwegs') { w.status = 'geplant'; if (S.rob && S.rob.id === id) S.rob = null; tail = () => L('Der Roboter war auf dem Weg zu Cora und kehrt um. Das Fenster ist gesperrt.', 'The robot was on its way to Cora and turns back. The window is locked.'); }
    else if (w && w.status === 'fehl') tail = () => L('Cora hat sich nach dem Update nicht zurückgemeldet und ist nicht einsatzbereit. Ersatz: ', 'Cora did not report back after the update and is not ready for use. Replacement: ') + dev(w.ersatz).name + ' (' + X(dev(w.ersatz).ort) + ').';
    else if (w && w.status === 'fertig') tail = () => L('Coras Update ist fertig, das Gerät ist frei.', 'Cora’s update is done, the device is free.');
    else tail = () => L('Für Cora ist heute kein Update geplant, das Gerät ist frei.', 'No update is planned for Cora today, the device is free.');
    // A driving robot pulls over and waits until a human releases it again. At a device it already stands clear of the corridor.
    const r = S.rob;
    if (r && !['halt', 'alarm'].includes(r.hold) && (r.step <= 2 || r.step === 10)) { r.prev = r.hold; r.hold = 'alarm'; r.man = null; feed('bote', () => L('Alarm: Der Roboter fährt an die Wand und macht den Flur frei. Er wartet auf die Freigabe.', 'Alarm: the robot pulls over to the wall and clears the corridor. It waits to be released.')); }
    S.alarm = { text: both(() => head() + tail()), ack: false };
    // Each role only gets its own change: medical physics the new plan, the person at Cora only that the request is void.
    pushAdd('mp', 'alarm', {});
    if (wasPlugged) pushAdd('lena', 'info', { crit: true, tt: both(() => L('Cora wird im Schockraum gebraucht', 'Cora is needed in the trauma room')), bb: both(() => L('Deine Bitte von vorhin entfällt. Du musst nichts tun.', 'Your request from earlier is void. You do not have to do anything.')) });
    feed('lotse', () => L('Polytrauma-Alarm: ', 'Polytrauma alarm: ') + head() + tail());
  }

  /* ---------- shell ---------- */
  const NAV = ['start', 'heute', 'tafel', 'geraete', 'begleiter', 'roboter', 'leitstand', 'dienste', 'helfer'];
  const navL = (k) => ({ start: L('Überblick', 'Overview'), dienste: L('Weitere Dienste', 'More services'), heute: L('Heute', 'Today'), tafel: L('Planungstafel', 'Planning board'), geraete: L('Geräte', 'Devices'), begleiter: L('Begleiter', 'Companion'), roboter: L('Roboter', 'Robot'), leitstand: L('Leitstand', 'Control room'), helfer: L('Helfer und Regeln', 'Helpers and rules') }[k]);
  const legal = () => L('Erfundene Daten · kein Medizinprodukt · kein Produkt von Siemens Healthineers', 'Invented data · not a medical device · not a Siemens Healthineers product');
  function shell() {
    document.documentElement.lang = S.lang;
    document.title = L('IA Klickdummy', 'IA click dummy');
    $('side').setAttribute('aria-label', L('Bereiche', 'Areas'));
    const open = S.plan.filter((w) => w.status === 'vorschlag').length;
    document.documentElement.dataset.theme = S.theme === 'paper' ? 'paper' : 'night';
    $('side').innerHTML = `<div class="brand"><div class="wm"><b>C-ARMAGOTCHI</b><i>.</i></div><small>INVISIBLE AUTONOMY</small>${aloha()}<span>${L('Gerätepflege für C-Bögen', 'Device care for C-arms')}</span></div>` +
      NAV.map((k) => `<button class="nav${(S.route === k || (k === 'geraete' && S.route === 'akte')) ? ' on' : ''}" data-act="go" data-a="${k}">${icon(k)}${navL(k)}${k === 'tafel' && open ? `<span class="cnt">${open}</span>` : ''}</button>`).join('') +
      `<div class="tours"><div class="eyebrow">${L('Geführte Demo', 'Guided demo')}</div>${JOURNEYS.map((j, i) => `<button class="${S.tour && S.mode !== 'pitch' && (S.jr | 0) === i ? 'on' : ''}" data-act="journey" data-a="${i}">${j.n()}<span>${j.steps.length} ${L('Schritte', 'steps')}</span></button>`).join('')}</div>` +
      `<div class="foot">${L('Hackathon-Prototyp mit erfundenen Daten. Kein Produkt von Siemens Healthineers, kein Medizinprodukt.', 'Hackathon prototype with invented data. Not a Siemens Healthineers product, not a medical device.')}</div>`;
    $('top').innerHTML = `${pillars()}<div class="where"><b>Klinikum Regnitzau</b> (${L('erfunden', 'invented')}) · ${L('OP-Trakt', 'OR suite')} · <span class="num">${L('Mi 18.11.2026', 'Wed 18 Nov 2026')}, 16:40</span></div>
      <div class="row" style="margin-left:auto"><span class="audit" title="${L('Jede Aktion landet im Protokoll', 'Every action goes into the audit log')}"><i></i><b class="num">${S.feed.length}</b> ${L('Protokolleinträge', 'audit entries')}</span><button class="btn sm" data-act="theme">${S.theme === 'paper' ? L('Nacht', 'Night') : L('Papier', 'Paper')}</button><div class="seg" style="margin-left:0" role="group" aria-label="${L('Sprache', 'Language')}"><button class="${en() ? '' : 'on'}" data-act="lang" data-a="de" aria-pressed="${!en()}" lang="de">Deutsch</button><button class="${en() ? 'on' : ''}" data-act="lang" data-a="en" aria-pressed="${en()}" lang="en">English</button></div>
      <div class="seg" style="margin-left:0" role="group" aria-label="${L('Rolle', 'Role')}">${ROLES.map((r) => `<button class="${S.role === r ? 'on' : ''}" data-act="role" data-a="${r}" aria-pressed="${S.role === r}">${role(r)}</button>`).join('')}</div></div>`;
    let a = '';
    if (S.alarm && !S.alarm.ack) a += `<div class="alert" role="alert"><div><b>${L('Polytrauma-Alarm', 'Polytrauma alarm')} 16:41.</b> ${esc(Array.isArray(S.alarm.text) ? pick(S.alarm.text) : S.alarm.text)} ${L('Jede Rolle bekommt nur ihre Änderung.', 'Each role only gets its own change.')}</div><button class="btn" data-act="ack" data-a="alarm">${L('Verstanden', 'Understood')}</button></div>`;
    S.fail.forEach((f, i) => {
      if (f.ack) return;
      const e = dev(f.ersatz);
      a += `<div class="alert" role="alert"><div><b>${L(`Wächter: ${dev(f.id).name} hat sich bis ${f.bis} nicht zurückgemeldet.`, `Guardian: ${dev(f.id).name} did not report back by ${f.bis}.`)}</b> ${L(`Ersatz ${e.name} (${e.ort}) steht bereit. Medizinphysik und Service sind informiert, bevor morgen früh jemand vor dem Gerät steht.`, `Replacement ${e.name} (${X(e.ort)}) is ready. Medical physics and service are informed before anyone stands in front of the device tomorrow morning.`)}</div><button class="btn" data-act="ack" data-a="${i}">${L('Bestätigen', 'Confirm')}</button></div>`;
    });
    if (S.rob && S.rob.hold && S.route !== 'roboter') a += `<div class="alert" role="alert"><div><b>${holdL(S.rob.hold)}.</b> ${L('Solange er steht, ist kein Start aus der Ferne möglich.', 'While it stands still, no remote start is possible.')}</div><button class="btn" data-act="go" data-a="roboter">${L('Zum Roboter', 'To the robot')}</button></div>`;
    $('alerts').innerHTML = a + offerCards();
    const sc = cur();
    // Pitch mode enlarges the type for the projector (index.html, body.pitch). Key H hides the script bar and the notes.
    document.body.classList.toggle('pitch', S.mode === 'pitch');
    $('script').hidden = !!S.quiet;
    if (S.mode === 'pitch') {
    $('script').innerHTML = `<div class="in"><button class="btn sm" data-act="scene" data-a="-1" aria-label="${L('Vorherige Szene', 'Previous scene')}">${L('Zurück', 'Back')}</button>
        <div class="txt"><b><i class="md">${S.mode === 'pitch' ? L('3-Minuten-Pitch', '3-minute pitch') : L('Vertiefung', 'Deep dive')} · </i>${L('Szene', 'Scene')} ${sc.n} ${L('von', 'of')} ${sc.of}${sc.sec ? ` · ${sc.sec} s` : ''} · ${sc.t()}</b><span>${sc.h()}</span></div>
        <button class="btn sm primary" data-act="scene" data-a="1">${L('Weiter', 'Next')}</button><button class="btn sm" data-act="mode" title="${L('Zwischen 3-Minuten-Pitch und Vertiefung wechseln', 'Switch between the 3-minute pitch and the deep dive')}">${S.mode === 'pitch' ? L('Zur Vertiefung', 'To the deep dive') : L('Zum Pitch', 'To the pitch')}</button><button class="btn sm" data-act="reset">${L('Demo zurücksetzen', 'Reset demo')}</button>
        <div class="disc">${L('Erfundene Daten. Kein Produkt von Siemens Healthineers, kein Medizinprodukt.', 'Invented data. Not a Siemens Healthineers product, not a medical device.')}</div></div>`;
      } else {
      const jr = JR(), done = sc.ok && sc.ok(), last = sc.n === sc.of, w0 = Math.max(0, Math.min(S.scene - 3, sc.of - 8));
      const chips = jr.steps.map((x, i) => [x, i]).slice(w0, w0 + 8).map(([x, i]) => { const d = x.ok && x.ok(); return `<button class="${i === S.scene ? 'on' : d ? 'done' : ''}" data-act="jstep" data-a="${i}">${d && i !== S.scene ? '✓ ' : ''}${(x.c || x.t)()}</button>`; }).join('');
      $('script').innerHTML = `<div class="in"><div class="chips" role="group" aria-label="${L('Schritte', 'Steps')}">${chips}</div>
        <div class="txt"><b><i class="md">${jr.n()} · </i>${L('Schritt', 'Step')} ${sc.n} ${L('von', 'of')} ${sc.of} · ${sc.t()}</b><span>${sc.h()}</span></div>
        <button class="btn sm" data-act="scene" data-a="-1" aria-label="${L('Vorheriger Schritt', 'Previous step')}">${L('Zurück', 'Back')}</button>${sc.run && !done ? `<button class="btn sm show" data-act="show">${L('Zeig es mir', 'Show me')}</button>` : ''}<button class="btn sm primary${done ? ' ready' : ''}" data-act="${last && S.jr ? 'jdone' : 'scene'}" data-a="1">${last && S.jr ? L('Fertig', 'Finish') : L('Weiter', 'Next')}</button><button class="btn sm" data-act="reset">${L('Demo zurücksetzen', 'Reset demo')}</button>
        <div class="disc">${L('Erfundene Daten. Kein Produkt von Siemens Healthineers, kein Medizinprodukt.', 'Invented data. Not a Siemens Healthineers product, not a medical device.')}</div></div>`;
    }
  }

  const SCENES = [
    { s: () => L('Wir haben verstanden: Das Problem ist nicht der Download, sondern das Fenster. Dasselbe Fenster brauchen auch Wartung, Service und Schulung. Wir bauen eines davon richtig und zeigen, wohin es führt.', 'We have understood: the problem is not the download, it is the window. Maintenance, service and training need the same window. We build one of them properly and show where it leads.'), t: () => L('Das große Bild', 'The big picture'), h: () => L('Helferkreis und Plattformkarte zeigen: neun Dienste, sechs Schritte, je Zeile entscheidet einmal ein Mensch.', 'Show the helper circle and the platform map: nine services, six steps, one human decision per row.'), go: () => { S.route = 'start'; } },
    { s: () => L('Das ist Cio. Er steht im Flur ohne Strom, das Update ist fällig. Drei Rollen könnten sich kümmern, keine fühlt sich zuständig. Der Begleiter macht das sichtbar, ohne jemanden zu beschämen.', 'This is Cio. It stands in the corridor without power, the update is due. Three roles could take care of it, none feels in charge. The companion makes that visible without shaming anyone.'), t: () => L('Niemand ist zuständig', 'Nobody is in charge'), h: () => L('Cio steht im Flur B ohne Strom, das Update ist fällig. Drei Rollen könnten sich kümmern.', 'Cio stands in Corridor B without power, the update is due. Three roles could take care of it.'), go: () => { S.route = 'begleiter'; S.pet = 'C-03'; } },
    { s: () => L('Ein Klick, und der Lotse legt die Woche um die Eingriffe herum. Lila heißt Vorschlag der KI. Geplant ist erst, was die Medizinphysik freigibt.', 'One click, and the Pilot lays out the week around the procedures. Purple means a proposal by the AI. Only what medical physics releases counts as planned.'), t: () => L('Lücken füllen', 'Fill the gaps'), h: () => L('Auf der Planungstafel „Lücken füllen“ klicken: Der Lotse plant die Woche um die Eingriffe herum.', 'Click “Fill the gaps” on the planning board: the Pilot plans the week around the procedures.'), go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = null; } },
    { s: () => L('Eine einzige Entscheidung für die Medizinphysik. Fenster, Ersatzgerät und Restrisiko stehen dabei. Danach fährt der Roboter los.', 'One single decision for medical physics. Window, replacement device and residual risk are right there. Then the robot sets off.'), t: () => L('Eine Freigabe', 'One release'), h: () => L('Cios Fenster anklicken, freigeben, Roboter losschicken.', 'Click Cio’s window, release it, send the robot.'), go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-03'; } },
    { s: () => L('Der Roboter bringt Strom und Paket, prüft die Umgebung und meldet „Umgebung frei“. Erst dann kann ein Mensch den Start bestätigen. Die Regel dahinter ist getesteter Code, keine KI.', 'The robot brings power and the package, checks the surroundings and reports “surroundings clear”. Only then can a human confirm the start. The rule behind it is tested code, not AI.'), t: () => L('Start aus der Ferne', 'Remote start'), h: () => L('Der Roboter meldet „Umgebung frei“. Erst dann lässt sich der Start bestätigen.', 'The robot reports “surroundings clear”. Only then can the start be confirmed.'), go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-03'; } },
    { s: () => L('Ein Polytrauma kommt. Das Fenster wird gesperrt und neu geplant, und jede Rolle erfährt nur, was sich für sie ändert.', 'A polytrauma arrives. The window is locked and replanned, and each role only learns what changes for it.'), t: () => L('Alarm', 'Alarm'), h: () => L('„Polytrauma-Alarm“ auslösen: Coras Fenster wird gesperrt und neu geplant.', 'Trigger the “polytrauma alarm”: Cora’s window is locked and replanned.'), go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-01'; } },
    { s: () => L('So sieht es für die Person am Gerät aus: eine Bitte, ein Handgriff, kein Druck.', 'This is what it looks like for the person at the device: one request, one simple action, no pressure.'), t: () => L('Eine kleine Bitte', 'One small request'), h: () => L('Als Person am Gerät: Cora bittet nur darum, eingesteckt zu bleiben.', 'As the person at the device: Cora only asks to stay plugged in.'), go: () => { S.route = 'begleiter'; S.pet = 'C-01'; S.role = 'nurse'; } },
    { s: () => L('Die Akte ist das Gedächtnis: Zwilling, Prüfungen, Vertrag. Hier sieht man schon, dass Wartung und Update in dasselbe Fenster gehören.', 'The file is the memory: twin, checks, contract. Here you can already see that maintenance and update belong in the same window.'), t: () => L('Die Akte lernt mit', 'The file keeps learning'), h: () => L('Zwilling, Prüfungen und Servicevertrag bestimmen, was als Nächstes dran ist.', 'Twin, checks and service contract decide what comes next.'), go: () => { S.route = 'akte'; S.dev = 'C-03'; S.role = 'mp'; } },
    { s: () => L('Der Roboter fährt nur in Fluren, hält vor jedem Hindernis und startet nie selbst. Darunter steht, was dieselbe Hand später noch kann.', 'The robot only drives in corridors, stops before any obstacle and never starts anything itself. Below it you see what the same hand can do later.'), t: () => L('Der Roboter in Aktion', 'The robot in action'), h: () => L('Karte, Umgebungsscan und Wartungsablauf. „Bett im Flur“ ausprobieren, anhalten oder von Hand übernehmen.', 'Map, surroundings scan and maintenance sequence. Try “Bed in the corridor”, stop it or take over by hand.'), go: () => { S.route = 'roboter'; S.role = 'mp'; } },
    { s: () => L('Was der Roboter nicht schafft, geht als kleiner Auftrag an die nächste freie Person. Wer keine Zeit hat, sieht nichts. Ablehnen kostet nichts.', 'What the robot cannot do goes as a small job to the nearest free person. Those without time see nothing. Declining costs nothing.'), t: () => L('Hilfe in der Nähe', 'Help nearby'), h: () => L('Was der Roboter nicht schafft, wird ein Auftrag: Im Leitstand sieht man, wer gefragt wird. Als Person am Gerät annehmen oder ablehnen.', 'What the robot cannot do becomes a job: the control room shows who is asked. Accept or decline as the person at the device.'), go: () => { S.route = 'leitstand'; S.role = 'mp'; } },
    { s: () => L('Derselbe Gedanke für den Kundendienst: Das Gerät checkt ein, bevor der Techniker losfährt. Er kommt einmal und mit dem richtigen Teil.', 'The same idea for customer service: the device checks in before the technician sets off. They come once and with the right part.'), t: () => L('Ausblick: Servicetermin', 'Outlook: service visit'), h: () => L('Eine Beobachtung antippen, die drei Punkte der Klinik abhaken, dann als Techniker zusagen.', 'Tap one observation, tick the hospital’s three items, then accept as technician.'), go: () => { S.route = 'dienste'; S.tab = 'termin'; S.role = 'mp'; } },
    { s: () => L('Und für Schulung: zwei Minuten „Was ist neu“ am Gerät, Einweisung mit vorbereitetem Nachweis. Mehr Eingewiesene heißt mehr mögliche Fenster.', 'And for training: two minutes of “What is new” at the device, instruction with a prepared record. More instructed people means more possible windows.'), t: () => L('Ausblick: Lernen am Gerät', 'Outlook: learning at the device'), h: () => L('„Gesehen“ antippen, das Lernfenster vorschlagen.', 'Tap “Seen”, propose the learning window.'), go: () => { S.route = 'dienste'; S.tab = 'lernen'; } },
    { s: () => L('Zum Schluss unsere Fragen an Sie: Welche Hypothese ist falsch, und bauen wir das Richtige?', 'Finally, our questions to you: which hypothesis is wrong, and are we building the right thing?'), t: () => L('Ihre Sicht', 'Your view'), h: () => L('Hypothesen und Fragen durchgehen.', 'Go through the hypotheses and the questions.'), go: () => { S.route = 'start'; } },
  ];
  /* The pitch tour: the four click-dummy scenes of the storyboard (storyboard/storyboard-pitch.md, beats 3 to 5),
     each with a time budget in seconds, speaker notes and a hint for whoever clicks. Every scene prepares what it
     needs, so a skipped click on stage never leaves an empty screen. A scene with `steps` is stepped through
     before the tour moves on (ACT.scene): scene 1 is the C-ARMAGOTCHI app with three moods and the team overview. */
  const APP_STEPS = 4;
  const pitchPlan = () => { if (!S.filled) doFill(); release('C-03'); };
  const PITCH = [
    { sec: 20, steps: APP_STEPS, t: () => L('Die C-ARMAGOTCHI-App: jede Stimmung ist ein Datenpunkt', 'The C-ARMAGOTCHI app: every mood is a data point'),
      s: () => L('Das ist die C-ARMAGOTCHI-App auf dem Handy des Teams, das sich um den C-Bogen kümmert. Einsam: Seit Tagen hat mich niemand verbunden. Hungrig: kein Strom, mein Update ist fällig. Munter: aktualisiert und verbunden. Und jede Stimmung ist ein Datenpunkt.', 'This is the C-ARMAGOTCHI app on the phone of the team that looks after the C-arm. Lonely: nobody has connected me for days. Hungry: no power, my update is due. Happy: updated and connected. And every mood is a data point.'),
      h: () => { const n = (S.app | 0) + 1, what = [L('Cio ist einsam', 'Cio is lonely'), L('Cio ist hungrig', 'Cio is hungry'), L('Cio ist munter', 'Cio is happy'), L('alle C-Bögen und der Claim', 'all C-arms and the claim')][n - 1]; return L(`Schritt ${n} von ${APP_STEPS}: ${what}. Ein Klick auf das Handy, Pfeil rechts oder die Leertaste zeigt den nächsten Schritt, je etwa 4 s. Nach dem vierten Schritt folgt die Planungstafel.`, `Step ${n} of ${APP_STEPS}: ${what}. A click on the phone, arrow right or the space bar shows the next step, about 4 s each. After the fourth step the planning board follows.`); },
      go: () => { S.route = 'app'; S.app = 0; S.pet = 'C-03'; S.role = 'mp'; } },
    { sec: 20, t: () => L('Update-Cockpit: das freie Fenster', 'Update cockpit: the open slot'),
      s: () => L('Diese Daten steuern unser Update-Cockpit. Es kennt den OP-Plan und findet für jeden C-Bogen das freie Fenster, ohne einen einzigen Eingriff zu berühren. Die Medizinphysik sagt mit einem Klick Ja.', 'That data runs our update cockpit. It knows the OR schedule and finds the open slot for each C-arm, without touching a single surgery. Medical physics says yes with one click.'),
      h: () => L('„Lücken füllen“ klicken, Cios Fenster öffnet sich, dann „Fenster freigeben“.', 'Click “Fill the gaps”, Cio’s window opens, then “Release window”.'),
      go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.role = 'mp'; S.sel = S.filled ? 'C-03' : null; } },
    { sec: 15, t: () => L('Eine Hand in der Nähe', 'A hand nearby'),
      s: () => L('Fehlt vor Ort eine Hand? Das Cockpit fragt die nächste freie Person, wie bei Uber. Ablehnen kostet nichts.', 'Need a hand on site? It pings the nearest free person, like Uber. Declining costs nothing.'),
      h: () => L('Der Auftrag für Cio liegt schon bei der nächsten freien Person (Ansicht „Person am Gerät“). Ein Klick: „Annehmen“.', 'The job for Cio is already with the nearest free person (view “Person at the device”). One click: “Accept”.'),
      // Fixes QA finding B3: the job exists when the scene opens, and the view is the one of the person who is asked.
      go: () => { pitchPlan(); const w = win('C-03'); if (w && w.status === 'geplant' && !S.rob) jobNew('strom', 'C-03'); S.route = 'leitstand'; S.role = 'nurse'; S.me = 'frei'; } },
    { sec: 40, t: () => L('Oder der Roboter fährt', 'Or the robot goes'),
      s: () => L('Oder der Roboter fährt. Er findet den C-Bogen, prüft, ob es der richtige ist, scannt die Umgebung, steckt Strom und Netzwerk an. Ein Mensch bestätigt den Start. Das Update läuft, das Gerät meldet sich zurück.', 'Or the robot goes. It finds the C-arm, checks it is the right one, scans the surroundings, plugs in power and network. A human confirms the start. The update runs, the device reports back.'),
      h: () => L(`Auf das Stichwort „Roboter zu Cio schicken“ klicken (KettyBot startet). Die Schritte laufen von selbst, etwa ${PITCH_ROBOT_SECONDS} s. Dann „Start bestätigen“. Die Rückmeldung kommt von selbst.`, `On cue click “Send the robot to Cio” (KettyBot starts). The steps run on their own, about ${PITCH_ROBOT_SECONDS} s. Then “Confirm start”. The device reports back on its own.`),
      go: () => { pitchPlan(); S.route = 'roboter'; S.role = 'mp'; } },
  ];
  /* The scene of the active tour: the scripted pitch or the free deep dive over all scenes. */
  const tourLen = () => (S.mode === 'pitch' ? PITCH.length : JR().steps.length);
  function cur() {
    const of = tourLen(); S.scene = Math.max(0, Math.min(of - 1, S.scene | 0));
    return Object.assign({ n: S.scene + 1, of }, (S.mode === 'pitch' ? PITCH : JR().steps)[S.scene]);
  }

  /* ---------- Heute ---------- */
  function decisions() {
    const out = [];
    const c3 = win('C-03'), c1 = win('C-01');
    const vor = S.plan.filter((w) => w.status === 'vorschlag');
    if (S.role === 'nurse') {
      if (c1 && c1.day === 0 && c1.status === 'geplant' && !S.plugged['C-01']) out.push({ h: 'dolmetscher', t: L('Cora hat eine kleine Bitte', 'Cora has one small request'), b: L(`Heute bitte eingesteckt in Saal 1 lassen. Das Update startet die Medizinphysik aus der Ferne um ${hm(c1.from)}.`, `Please leave it plugged in in OR 1 today. Medical physics starts the update remotely at ${hm(c1.from)}.`), btn: [[L('Zum Begleiter', 'To the companion'), 'pet', 'C-01', 'primary']] });
      else if (S.me === 'frei' && S.jobs.some((j) => !j.done && j.by === ME)) out.push({ t: L('Dein Auftrag steht oben', 'Your job is at the top'), b: L('Wenn du fertig bist, tippe auf „Erledigt“. Sonst fragt dich heute nichts.', 'When you are done, tap “Done”. Nothing else asks you today.') });
      else if (S.me === 'frei' && S.jobs.some((j) => (offerTo(j) || {}).k === ME)) out.push({ t: L('Ein Auftrag wartet oben auf deine Antwort', 'A job is waiting for your answer at the top'), b: L('Annehmen oder ablehnen, beides ist in Ordnung. Sonst fragt dich heute nichts.', 'Accept or decline, both are fine. Nothing else asks you today.') });
      else out.push({ t: L('Heute fragt dich kein Gerät etwas', 'No device asks you anything today'), b: L('Du entscheidest nichts und wirst für nichts verantwortlich gemacht. Wenn ein Gerät eine Bitte hat, ist es genau eine.', 'You decide nothing and are not held responsible for anything. If a device has a request, it is exactly one.') });
      return out;
    }
    if (!S.filled) out.push({ h: 'lotse', t: L('6 Geräte brauchen ein Fenster', '6 devices need a window'), b: L('Sicherheitsupdate 4.2.1, Frist Mo 23.11., für Cio schon Fr 20.11. Der Lotse kann die Woche in einem Zug um die Eingriffe herum planen.', 'Security update 4.2.1, deadline Mon 23 Nov, for Cio already Fri 20 Nov. The Pilot can plan the week around the procedures in one go.'), btn: [[L('Zur Planungstafel', 'To the planning board'), 'go', 'tafel', 'primary']] });
    if (S.role === 'mp' && vor.length) out.push({ h: 'lotse', t: L(`${vor.length} goldene Fenster warten auf deine Freigabe`, `${vor.length} golden windows are waiting for your release`), b: vor.map((w) => `${dev(w.id).name} ${dayL(w.day)} ${hm(w.from)}`).join(' · ') + L('. Jedes mit Ersatzgerät und Restrisiko.', '. Each with a replacement device and residual risk.'), btn: [[L('Alle freigeben', 'Release all'), 'relall', '', 'primary'], [L('Auf der Tafel ansehen', 'View on the board'), 'go', 'tafel', '']] });
    if (S.role === 'it' && vor.length) out.push({ t: L('Freigabe liegt bei der Medizinphysik', 'The release is up to medical physics'), b: L(`${vor.length} Fenster sind vorgeschlagen. Du musst nichts tun.`, `${vor.length} windows are proposed. You do not have to do anything.`) });
    if (c3 && c3.status === 'geplant') out.push({ h: 'bote', t: L('Cio steht im Flur B ohne Strom', 'Cio stands in Corridor B without power'), b: L(`Fenster heute ${hm(c3.from)}. Der Roboter kann Strom und Paket bringen und die Umgebung prüfen.`, `Window today ${hm(c3.from)}. The robot can bring power and the package and check the surroundings.`), btn: [[L('Roboter losschicken', 'Send the robot'), 'robot', 'C-03', 'primary']] });
    S.plan.filter((w) => w.status === 'bereit').forEach((w) => out.push({ h: 'bote', t: L(`${dev(w.id).name} ist bereit`, `${dev(w.id).name} is ready`), b: w.needsRobot ? `<q>${L('Stehe an Cio im Flur B. Strom und Netz stehen, niemand in der Nähe. Starten?', 'I am at Cio in Corridor B. Power and network are up, nobody nearby. Start?')}</q>` : L(`Bleibt eingesteckt in ${dev(w.id).ort}, Gerät in Ruhe.`, `Stays plugged in in ${XS(dev(w.id).ort)}, device at rest.`), btn: startCheck(w.id).ok ? [[L(`Start um ${hm(w.from)} bestätigen`, `Confirm start at ${hm(w.from)}`), 'start', w.id, 'primary']] : [[L('Auf der Tafel ansehen', 'View on the board'), 'tosel', w.id, '']] }));
    if (S.role === 'mp' && S.filled && !S.merged && win('C-02')) out.push({ h: 'lotse', t: L('Konstanzprüfung für Bogdan mitnehmen', 'Take Bogdan’s constancy test along'), b: L('Fällig in 9 Tagen. Sie passt am Do 19.11. direkt nach dem Update, vor dem nächsten Einsatz: ein Termin statt zwei.', 'Due in 9 days. It fits on Thu 19 Nov right after the update, before the next use: one appointment instead of two.'), btn: [[L('Zusammenlegen', 'Combine'), 'merge', '', 'primary']] });
    if (S.role === 'mp' && S.filled && !S.tech && !aktuell(dev('C-06'))) out.push({ h: 'lotse', t: L('Rudi braucht einen Techniker', 'Rudi needs a technician'), b: L('Update mit Armbewegung. Bleibt beaufsichtigt vor Ort, einen Fern-Start schlägt der Lotse dafür nie vor.', 'Update with arm movement. It stays supervised on site, the Pilot never proposes a remote start for it.'), btn: [[L('Technikertermin anfragen', 'Request a technician visit'), 'tech', '', '']] });
    if (S.role === 'it') out.push({ t: L('Lage vor Ort', 'Situation on site'), b: L('Wo jedes Gerät steht, ob es Strom hat und wann sein Fenster kommt, steht in der Geräteliste. Niemand muss dafür in den OP.', 'Where each device stands, whether it has power and when its window comes is in the device list. Nobody has to walk to the OR for that.'), btn: [[L('Geräte ansehen', 'View devices'), 'go', 'geraete', '']] });
    if (!out.length) out.push({ t: L('Nichts offen', 'Nothing open'), b: L('Alle Fenster sind freigegeben oder laufen. Der Wächter meldet sich, wenn ein Gerät nicht zurückkommt.', 'All windows are released or running. The Guardian reports when a device does not come back.') });
    return out;
  }
  function vHeute() {
    const akt = D.DEVICES.filter(aktuell).length;
    const fertig = S.plan.filter((w) => w.status === 'fertig').length;
    const logs = 7 + (win('C-03') && ['bereit', 'laeuft', 'fertig', 'fehl'].includes(win('C-03').status) ? 1 : 0);
    const k = [
      [`${akt} / 8`, L('Geräte auf aktuellem Stand', 'devices up to date'), L('Ziel: alle vor der Frist', 'goal: all before the deadline')],
      ['0', L('Vorschläge, die einen Eingriff berühren', 'proposals that touch a procedure'), L('feste Regel im Planer, mit Test', 'fixed rule in the planner, with a test')],
      ['0', L('Telefonate für dieses Update', 'phone calls for this update'), L('Ziel im Szenario, heute Telefon und E-Mail', 'goal in the scenario, today phone and e-mail')],
      [L('0 bis 1', '0 to 1'), L('Handgriffe für die Person am Gerät', 'actions for the person at the device'), L('Ziel im Szenario, sie entscheidet nichts', 'goal in the scenario, they decide nothing')],
      [`${logs} / 8`, L('Geräte mit aktuellen Logs', 'devices with current logs'), L('ohne Patientendaten', 'without patient data')],
      [S.fail.length ? L('sofort', 'at once') : fertig ? `${fertig}` : '–', S.fail.length ? L('Fehlschlag gemeldet', 'failure reported') : L('Updates zurückgemeldet', 'updates reported back'), L('der Wächter kennt das erwartete Ende', 'the Guardian knows the expected end')],
    ];
    const dec = decisions();
    return `<div class="head"><div><div class="eyebrow">${L('Heute', 'Today')} · ${role(S.role)}</div><h1>${S.role === 'nurse' ? L('Du hast den C-Bogen in der Hand. Den Rest erledigen andere.', 'You have the C-arm in your hands. Others take care of the rest.') : L('Jeder C-Bogen aktuell, ohne dass ein Eingriff wartet.', 'Every C-arm up to date, without a procedure waiting.')}</h1><p>${L('Die Helfer bereiten vor, die Menschen entscheiden. Jede Rolle wird höchstens eine Sache gefragt.', 'The helpers prepare, people decide. Each role is asked one thing at most.')}</p>${S.role === 'nurse' ? `<div class="row" style="margin-top:10px">${meSeg()}<span class="small muted">${S.me === 'frei' ? L('Aufträge in deiner Nähe erscheinen oben. Du darfst immer ablehnen.', 'Jobs near you appear at the top. You may always decline.') : L('Dir wird kein Auftrag angezeigt und niemand fragt dich.', 'No job is shown to you and nobody asks you.')}</span></div>` : ''}</div></div>
      <div class="kpis">${k.map((x) => `<div class="kpi"><b class="num">${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></div>`).join('')}</div>
      <div class="grid g2"><section class="card"><h2>${L('Du entscheidest', 'You decide')}</h2><div class="stack">${dec.map((d) => `<div class="dec${d.h ? ' ai' : ''}">${d.h ? `<div class="who"><span class="dot"></span>${hn(d.h)}</div>` : ''}<h3>${d.t}</h3><div class="small">${d.b}</div>${d.btn ? `<div class="row">${d.btn.map((x) => `<button class="btn sm ${x[3]}" data-act="${x[1]}" data-a="${x[2]}">${x[0]}</button>`).join('')}</div>` : ''}</div>`).join('')}</div></section>
      <section class="card"><h2>${L('Schon erledigt, ohne dass jemand telefoniert hat', 'Already done, without anyone making a call')}</h2><ul class="feed">${S.feed.slice(0, 9).map((f) => `<li><span class="num faint">${f[0]}</span><span class="h">${hn(f[1])}</span><span>${esc(en() ? (f[3] || f[2]) : f[2])}</span></li>`).join('')}</ul></section></div>
      ${S.role === 'nurse' ? '' : `<section class="card" style="margin-top:14px"><div class="row"><h2 style="margin:0">${L('Wer gerade für dich arbeitet', 'Who is working for you right now')}</h2><button class="btn sm" data-act="go" data-a="helfer">${L('Helfer und Regeln', 'Helpers and rules')}</button></div>${crew()}</section>`}`;
  }

  /* ---------- Planungstafel ---------- */
  const pos = (from, to) => `left:${((from - T0) / SPAN * 100).toFixed(2)}%;width:${((to - from) / SPAN * 100).toFixed(2)}%`;
  /* Maintenance and checks share the board with the updates. */
  function maint(d, day) {
    const out = [];
    // The test follows the update: a check before a software change says nothing about the state after it.
    if (S.merged && d.id === 'C-02' && day === 1 && win('C-02')) out.push({ from: win('C-02').to, to: win('C-02').to + 40, lab: L('Prüfung', 'Check'), title: L('Konstanzprüfung', 'Constancy test') });
    if (S.tech && d.id === 'C-06' && day === 2 && !S.vorOrt['C-06']) out.push({ from: 16 * 60, to: 18 * 60, lab: L('Techniker', 'Technician'), title: L('Update mit Armbewegung, beaufsichtigt vor Ort (angefragt)', 'Update with arm movement, supervised on site (requested)') });
    return out;
  }
  const maintBlocks = (d, day, name) => maint(d, day).map((m) => `<div class="blk wart" style="${pos(m.from, m.to)}" title="${m.title}, ${hm(m.from)} ${L('bis', 'to')} ${hm(m.to)}">${name ? d.name + ' · ' : ''}${m.lab}</div>`).join('');
  const alarmBlocks = (d, day) => (S.blocked[d.id] || []).filter((x) => x.day === day).map((x) => `<div class="blk alarm" style="${pos(x.from, x.to)}">${L('Alarm, gesperrt', 'Alarm, locked')}</div>`).join('');
  function winBlock(d, day, name) {
    const w = win(d.id);
    if (!w || w.day !== day) return '';
    const lab = { vorschlag: L('Vorschlag', 'Proposal'), geplant: L('Goldenes Fenster', 'Golden window'), unterwegs: L('Roboter kommt', 'Robot coming'), bereit: L('Bereit', 'Ready'), laeuft: L('Update läuft', 'Update running'), fertig: L('Aktuell', 'Up to date'), fehl: L('Nicht zurück', 'Not back') }[w.status];
    return `<button class="blk w-${w.status}" style="${pos(w.from, w.to)}" data-act="sel" data-a="${d.id}" aria-label="${d.name}, ${lab}, ${hm(w.from)} ${L('bis', 'to')} ${hm(w.to)}">${name ? d.name + ' · ' : ''}${lab}<small class="num">${hm(w.from)}–${hm(w.to)}</small></button><div class="blk puf" style="${pos(w.to, w.to + P.RULES.PUFFER)}" title="${L('Puffer für einen Rollback', 'Buffer for a rollback')}"></div>`;
  }
  function trackBlocks(d, day) {
    return d.busy[day].map((c) => `<div class="blk busy" style="${pos(c.from, c.to)}" title="${X(c.saal)}, ${X(c.fach)}, ${hm(c.from)} ${L('bis', 'to')} ${hm(c.to)}">${X(c.saal)}<small>${X(c.fach)}</small></div>`).join('') + alarmBlocks(d, day) + maintBlocks(d, day) + winBlock(d, day);
  }
  /* Rows by room: the cases that run there, and the windows of the devices that stand there. */
  function roomRows(day, nowLine) {
    const rooms = [];
    const add = (r) => { if (!rooms.includes(r)) rooms.push(r); };
    D.DEVICES.forEach((d) => { d.busy[day].forEach((c) => add(c.saal)); });
    rooms.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));
    D.DEVICES.forEach((d) => add(d.ort));
    return rooms.map((r, i) => {
      const here = D.DEVICES.filter((d) => d.ort === r);
      const cases = D.DEVICES.map((d) => d.busy[day].filter((c) => c.saal === r).map((c) => `<div class="blk busy" style="${pos(c.from, c.to)}" title="${d.name}, ${X(c.fach)}, ${hm(c.from)} ${L('bis', 'to')} ${hm(c.to)}">${d.name}<small>${X(c.fach)}</small></div>`).join('')).join('');
      const own = here.map((d) => alarmBlocks(d, day) + maintBlocks(d, day, true) + winBlock(d, day, true)).join('');
      return `<div class="brow${here.some((d) => d.id === S.sel) ? ' sel' : ''}"><div class="row-btn"><span class="n"><b>${X(r)}</b><span>${here.length ? L('Standort von ', 'Home of ') + here.map((d) => d.name).join(', ') : L('kein Gerät abgestellt', 'no device parked')}</span></span></div><div class="track">${cases}${own}${nowLine(i)}</div></div>`;
    }).join('');
  }
  function vTafel() {
    const vor = S.plan.filter((w) => w.status === 'vorschlag');
    const tools = `<div class="board-tools"><div class="seg" style="margin-left:0" role="group" aria-label="${L('Zeitraum', 'Period')}"><button class="${S.view === 'tag' ? 'on' : ''}" data-act="view" data-a="tag">${L('Tag', 'Day')}</button><button class="${S.view === 'woche' ? 'on' : ''}" data-act="view" data-a="woche">${L('Woche', 'Week')}</button></div>
      ${S.view === 'tag' ? `<div class="seg" style="margin-left:0" role="group" aria-label="${L('Zeilen', 'Rows')}"><button class="${S.rows === 'geraete' ? 'on' : ''}" data-act="rows" data-a="geraete">${L('Geräte', 'Devices')}</button><button class="${S.rows === 'saele' ? 'on' : ''}" data-act="rows" data-a="saele">${L('Säle', 'Rooms')}</button></div>
      <div class="days">${D.DAYS.map((x, i) => `<button class="${S.day === i ? 'on' : ''}" data-act="day" data-a="${i}">${dayL(i)}${i === 5 ? `<span class="fr">${L('Frist', 'Deadline')}</span>` : ''}</button>`).join('')}</div>` : ''}</div>`;
    let banner;
    if (!S.filled) banner = `<div class="banner"><span class="who">${hn('lotse')}</span><span>${L('6 Geräte brauchen das Sicherheitsupdate 4.2.1 (120 Minuten, Frist Mo 23.11.). Ich suche die Lücken zwischen den Eingriffen.', '6 devices need security update 4.2.1 (120 minutes, deadline Mon 23 Nov). I look for the gaps between the procedures.')}</span><span class="r"><button class="btn ai" data-act="fill" ${S.scanning ? 'disabled' : ''}>${S.scanning ? L('Suche Lücken …', 'Searching gaps …') : L('Lücken füllen', 'Fill the gaps')}</button></span></div>`;
    else banner = `<div class="banner"><span class="who">${hn('lotse')}</span><span>${L(`${S.plan.length} goldene Fenster, ${S.offen.length} Geräte ohne Vorschlag`, `${S.plan.length} golden windows, ${S.offen.length} devices without a proposal`)}${S.offen.length ? ' (' + S.offen.map((o) => `<button class="lnk" data-act="sel" data-a="${o.id}">${dev(o.id).name}</button>`).join(', ') + ')' : ''}. ${L('Höchstens 2 Geräte je Nacht, jedes mit Ersatz.', 'At most 2 devices per night, each with a replacement.')}</span><span class="r">${vor.length ? `<button class="btn primary sm" data-act="relall">${L(`Alle ${vor.length} freigeben`, `Release all ${vor.length}`)}</button>` : ''}<button class="btn risk sm" data-act="alarm" ${S.alarm ? 'disabled' : ''}>${L('Polytrauma-Alarm auslösen', 'Trigger polytrauma alarm')}</button></span></div>`;

    let board;
    if (S.view === 'tag') {
      const hours = Array.from({ length: 18 }, (_, i) => `<span class="num">${String(6 + i).padStart(2, '0')}</span>`).join('');
      const nowLine = (i) => (S.day === 0 ? `<div class="now${i ? '' : ' first'}" data-l="${L('jetzt', 'now')}" style="left:${((D.NOW - T0) / SPAN * 100).toFixed(2)}%"></div>` : '');
      const rows = S.rows === 'saele' ? roomRows(S.day, nowLine) : D.DEVICES.map((d, i) => `<div class="brow${S.sel === d.id ? ' sel' : ''}"><button class="row-btn" data-act="sel" data-a="${d.id}">${pet(mood(d), 40)}<span class="n"><b>${d.id} ${d.name}</b><span>${X(d.ort)} · ${swOf(d)}</span></span></button><div class="track">${trackBlocks(d, S.day)}${nowLine(i)}</div></div>`).join('');
      const rb = S.plan.filter((w) => w.needsRobot && w.day === S.day).map((w) => `<div class="blk robot" style="${pos(w.from - P.RULES.ROBOT_LEAD, w.to)}" title="${L('Bringt Strom und Paket, prüft die Umgebung, bewacht das Update', 'Brings power and the package, checks the surroundings, guards the update')}">${L('Bei', 'At')} ${dev(w.id).name}<small>${{ unterwegs: L('fährt hin …', 'on its way …'), bereit: L('meldet: Umgebung frei', 'reports: surroundings clear'), laeuft: L('bewacht das Update', 'guards the update'), fertig: L('fertig, fährt zurück', 'done, driving back'), fehl: L('meldet Fehlschlag', 'reports a failure') }[w.status] || L('Strom, Paket, Wache', 'power, package, guard')}</small></div>`).join('');
      board = `<div class="board"><div class="board-in">${S.scanning ? '<div class="scan"></div>' : ''}<div class="brow hd"><div></div><div class="hours">${hours}</div></div>${rows}
        <div class="brow"><div class="row-btn"><span class="n"><b>${L('Roboter', 'Robot')}</b><span>C-ARMAGOTCHI · ${L('Station Ebene 2', 'Dock level 2')}</span></span></div><div class="track">${rb}</div></div></div></div>`;
    } else {
      const rows = D.DEVICES.map((d) => `<div class="wkrow"><button class="row-btn" data-act="sel" data-a="${d.id}">${pet(mood(d), 40)}<span class="n"><b>${d.id} ${d.name}</b><span>${aktuell(d) ? L('aktuell', 'up to date') : d.update.frist > 6 ? L('Frist in ', 'Deadline in ') + days(d.update.frist) : L('Frist ', 'Deadline ') + dayL(d.update.frist)}</span></span></button>${D.DAYS.map((_, i) => {
        const w = win(d.id), has = w && w.day === i;
        const mini = d.busy[i].map((c) => `<i style="${pos(c.from, c.to)}"></i>`).join('') + (has ? `<i class="${w.status === 'vorschlag' ? 'v' : 'w'}" style="${pos(w.from, w.to)}"></i>` : '') + ((S.blocked[d.id] || []).filter((x) => x.day === i).map((x) => `<i class="a" style="${pos(x.from, x.to)}"></i>`).join(''));
        return `<button class="wkc${D.WEEKEND.includes(i) ? ' we' : ''}" data-act="day" data-a="${i}" aria-label="${d.name}, ${dayL(i)}${has ? ', ' + hm(w.from) : ''}"><div class="mini">${mini}</div>${has ? `<span class="chip ${w.status === 'vorschlag' ? 'v' : 'w'} num">${hm(w.from)}${w.needsRobot ? L(' · Roboter', ' · robot') : ''}</span>` : ''}${maint(d, i).map((m) => `<span class="chip m">${m.lab} ${hm(m.from)}</span>`).join('')}</button>`;
      }).join('')}</div>`).join('');
      board = `<div class="board"><div class="wk"><div class="wkrow hd"><div></div>${D.DAYS.map((x, i) => `<div class="${i === 5 ? 'fr' : ''}">${dayL(i)}${i === 5 ? L(' · Frist', ' · deadline') : ''}${i === 2 ? L(' · Frist Cio', ' · deadline Cio') : ''}</div>`).join('')}</div>${rows}</div></div>`;
    }
    const legend = `<div class="legend"><span><i style="background:var(--busy)"></i>${L('Eingriff geplant (nur Saal und Zeit)', 'Procedure scheduled (room and time only)')}</span><span><i style="background:var(--ai-soft);border:1.5px dashed var(--ai)"></i>${L('Vorschlag der KI', 'AI proposal')}</span><span><i style="background:var(--gold-soft);border:1.5px solid var(--gold-line)"></i>${L('Goldenes Fenster, freigegeben', 'Golden window, released')}</span><span><i style="background:var(--orange-a)"></i>${L('Update läuft', 'Update running')}</span><span><i style="background:var(--petrol-soft);border:1px solid var(--petrol)"></i>${L('Wartung und Prüfung', 'Maintenance and checks')}</span></div>`;
    const panel = S.sel ? vPanel(S.sel) : '';
    return `<div class="head"><div><div class="eyebrow">${L('Planungstafel', 'Planning board')}</div><h1>${L('Wo passt ein Update von zwei Stunden hin?', 'Where does a two-hour update fit?')}</h1><p>${L('Geräte oder Säle gegen Zeit. Grau ist belegt, alles andere ist Standzeit. Der Lotse legt Vorschläge in die Lücken, die Medizinphysik gibt frei. Updates, Wartung und Prüfungen stehen auf derselben Tafel.', 'Devices or rooms against time. Grey is occupied, everything else is idle time. The Pilot puts proposals into the gaps, medical physics releases them. Updates, maintenance and checks share one board.')}</p></div></div>
      ${banner}${tools}<div class="board-grid${panel ? '' : ' nopanel'}"><div>${board}${legend}</div>${panel}</div>`;
  }

  function vPanel(id) {
    const d = dev(id), w = win(id), off = S.offen.find((o) => o.id === id);
    const head = `<div class="row">${pet(mood(d), 56)}<div><h2>${d.id} ${d.name}</h2><div class="small muted">${X(d.ort)} · ${X(d.fach)}</div></div><button class="btn sm" style="margin-left:auto" data-act="sel" data-a="" aria-label="${L('Karte schließen', 'Close card')}">${L('Schließen', 'Close')}</button></div>`;
    const akte = `<button class="lnk small" data-act="akte" data-a="${id}">${L('Geräteakte öffnen', 'Open device file')}</button>`;
    if (!w) {
      let t = L('Der Lotse hat noch nicht geplant. Klick auf „Lücken füllen“.', 'The Pilot has not planned yet. Click “Fill the gaps”.');
      if (aktuell(d)) t = L('Auf aktuellem Stand (4.2.1). Steht als Ersatzgerät bereit.', 'Up to date (4.2.1). Ready as a replacement device.');
      else if (off && off.grund === 'vor-ort') t = L('Update mit Armbewegung. Es bleibt beaufsichtigt vor Ort, der Raum muss leer sein. Einen Fern-Start schlägt der Lotse dafür nie vor. Nächster Schritt: Technikertermin.', 'Update with arm movement. It stays supervised on site, the room must be empty. The Pilot never proposes a remote start for it. Next step: technician visit.');
      else if (off && off.grund === 'datenlage') t = L(`Erst ${d.datenWochen} Wochen Nutzungsdaten. Die Datenlage reicht nicht, also schlägt der Lotse nichts vor, statt zu raten. Ab ${P.RULES.MIN_WEEKS} Wochen plant er mit (Annahme).`, `Only ${d.datenWochen} weeks of usage data. That is not enough, so the Pilot proposes nothing instead of guessing. From ${P.RULES.MIN_WEEKS} weeks on it plans the device (assumption).`);
      else if (off && off.grund === 'daten-fehlen') t = L('OP-Plan oder Nutzungsdaten fehlen für dieses Gerät. Fehlende Daten gelten nie als „frei“, also gibt es keinen Vorschlag.', 'The OR schedule or usage data are missing for this device. Missing data never counts as “free”, so there is no proposal.');
      else if (off && off.grund === 'abgelehnt') t = L('Von der Medizinphysik abgelehnt. Der Lotse schlägt bei der nächsten Planung ein anderes Fenster vor.', 'Declined by medical physics. The Pilot proposes another window in the next planning run.');
      else if (off) t = L('Bis zur Frist passt kein sicheres Fenster. Bitte mit der Abteilung klären.', 'No safe window fits before the deadline. Please clarify with the department.');
      return `<aside class="panel">${head}<div class="why"><div class="who"><span class="dot"></span>${hn('lotse')}</div>${t}</div>${akte}</aside>`;
    }
    const wkend = D.WEEKEND.includes(w.day);
    const uses = Math.round(w.risk * d.datenWochen);
    const e = dev(w.ersatz);
    const why = [
      w.verschoben != null ? L(`Nach dem Alarm neu geplant: ${hm(w.verschoben)} wird ${hm(w.from)}.`, `Replanned after the alarm: ${hm(w.verschoben)} becomes ${hm(w.from)}.`) : (w.letzterFall ? L(`Letzter geplanter Eingriff endet ${hm(w.letzterFall)}, danach ${P.RULES.VORLAUF} Minuten Abstand.`, `The last scheduled procedure ends at ${hm(w.letzterFall)}, then a ${P.RULES.VORLAUF} minute gap.`) : L('Kein Eingriff vor dem Fenster geplant.', 'No procedure scheduled before the window.')),
      L(`Restrisiko: ${wkend ? 'an Wochenenden' : 'an Werktagen'} zu dieser Zeit in der stärksten Stunde in ${uses} von ${d.datenWochen} Wochen gebraucht. Grenze ${Math.round(P.RULES.MAX_RISK * 100)} % (Annahme).`, `Residual risk: on ${wkend ? 'weekends' : 'weekdays'} at this time, used in ${uses} of ${d.datenWochen} weeks in the busiest hour. Limit ${Math.round(P.RULES.MAX_RISK * 100)} % (assumption).`),
      L(`Standort ${d.ort}: ${d.stromHinweis}.`, `Location ${X(d.ort)}: ${X(d.stromHinweis)}.`),
      L(`Ersatzgerät: ${w.ersatz} ${e.name} (${e.ort}).`, `Replacement device: ${w.ersatz} ${e.name} (${X(e.ort)}).`),
      L('Wer bestätigt: Die Medizinphysik gibt das Fenster frei, den Start bestätigt die Medizinphysik oder die IT-Abteilung.', 'Who confirms: medical physics releases the window, medical physics or the IT department confirms the start.'),
      L(`Frist ${dayL(Math.min(6, w.frist))}, Puffer für einen Rollback bis ${hm(w.to + P.RULES.PUFFER)} (${P.RULES.PUFFER} Minuten, Annahme).`, `Deadline ${dayL(Math.min(6, w.frist))}, buffer for a rollback until ${hm(w.to + P.RULES.PUFFER)} (${P.RULES.PUFFER} minutes, assumption).`),
    ];
    const idx = { vorschlag: 1, geplant: 2, unterwegs: 2, bereit: 3, laeuft: 4, fertig: 5, fehl: 5 }[w.status];
    const steps = [
      [role('it'), L('Update am Mo 16.11. freigegeben, Frist bestätigt', 'Update released on Mon 16 Nov, deadline confirmed')],
      [role('mp'), L('Fenster freigeben', 'Release the window')],
      [w.needsRobot ? L('Bote (Roboter)', 'Courier (robot)') : role('nurse'), w.needsRobot ? L('Strom und Paket bringen, „Umgebung frei“ melden', 'Bring power and the package, report “surroundings clear”') : L('Gerät eingesteckt lassen, sonst nichts', 'Leave the device plugged in, nothing else')],
      [L('Medizinphysik oder IT', 'Medical physics or IT'), L('Start aus der Ferne bestätigen', 'Confirm the remote start')],
      [hn('waechter'), L('Rückmeldung abwarten, sonst Ersatz melden', 'Wait for the report, otherwise announce the replacement')],
    ].map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'cur' : ''}"><div class="b">${i < idx ? '✓' : i + 1}</div><div><b>${s[0]}</b><span>${s[1]}</span></div></li>`).join('');
    let act = '';
    const mayStart = S.role === 'mp' || S.role === 'it';
    if (w.status === 'vorschlag') act = S.role === 'mp' ? `<div class="row"><button class="btn primary" data-act="rel" data-a="${id}">${L('Fenster freigeben', 'Release window')}</button><button class="btn" data-act="decline" data-a="${id}">${L('Ablehnen', 'Decline')}</button></div>` : `<div class="small muted">${L('Die Freigabe liegt bei der Medizinphysik.', 'The release is up to medical physics.')}</div>`;
    else if (w.status === 'geplant' && w.day !== 0) act = `<div class="small muted">${L(`Freigegeben. Am ${dayL(w.day)} meldet sich der Bote, dann genügt eine Bestätigung.`, `Released. On ${dayL(w.day)} the Courier reports in, then one confirmation is enough.`)}</div>`;
    else if (w.status === 'geplant' && w.needsRobot) act = mayStart ? `<button class="btn primary" data-act="robot" data-a="${id}">${L('Roboter losschicken', 'Send the robot')}</button>` : `<div class="small muted">${L('Den Roboter schicken Medizinphysik oder IT-Abteilung.', 'Medical physics or the IT department sends the robot.')}</div>`;
    else if (w.status === 'geplant' && S.plugged[id]) act = `<div class="small">${L(`${d.name} bleibt eingesteckt. Der Begleiter meldet „Umgebung frei“ erst, wenn der Einsatz im Saal beendet ist.`, `${d.name} stays plugged in. The companion only reports “surroundings clear” once the case in the room has ended.`)}</div>`;
    else if (w.status === 'geplant') act = `<div class="small">${L(`Der Dolmetscher hat ${d.name} gebeten, die Person am Gerät zu fragen: „Bitte eingesteckt lassen.“`, `The Interpreter asked ${d.name} to ask the person at the device: “Please leave me plugged in.”`)}</div><button class="btn" data-act="pet" data-a="${id}">${L(`Zum Begleiter von ${d.name}`, `To ${d.name}’s companion`)}</button>`;
    else if (w.status === 'unterwegs') act = `<button class="btn" data-act="go" data-a="roboter">${L('Roboter live ansehen', 'Watch the robot live')}</button><div class="small"><b>${L(`C-ARMAGOTCHI fährt zu ${d.ort} …`, `C-ARMAGOTCHI is driving to ${X(d.ort)} …`)}</b> ${L('Er steckt Strom und Netzwerkkabel an und prüft die Umgebung, ohne Bilder zu speichern.', 'It plugs in power and the network cable and checks the surroundings without storing images.')}</div>`;
    else if (w.status === 'bereit') {
      const c = startCheck(id);
      act = `${w.needsRobot ? `<div class="quote">${L(`Stehe an ${d.name} im ${d.ort}. Strom und Netz stehen, Paket ist geprüft, niemand in der Nähe. Starten?`, `I am at ${d.name} in ${XS(d.ort)}. Power and network are up, the package is verified, nobody nearby. Start?`)}</div>` : `<div class="quote">${L(`${d.name} bleibt eingesteckt in ${d.ort}. Gerät in Ruhe.`, `${d.name} stays plugged in in ${XS(d.ort)}. Device at rest.`)}</div>`}
        ${mayStart ? `<button class="btn primary" data-act="start" data-a="${id}" ${c.ok ? '' : 'disabled'}>${L(`Start um ${hm(w.from)} aus der Ferne bestätigen`, `Confirm remote start at ${hm(w.from)}`)}</button>` : `<div class="small muted">${L('Den Start bestätigt die Medizinphysik oder die IT-Abteilung.', 'Medical physics or the IT department confirms the start.')}</div>`}${c.ok ? '' : `<div class="small" style="color:var(--risk)">${gruende(c)}</div>`}`;
    } else if (w.status === 'laeuft') act = `<div><b>${L(`Update läuft, fertig ${hm(w.to)}.`, `Update running, done at ${hm(w.to)}.`)}</b> <span class="small muted">${L('Am Gerät steht groß: nicht ausstecken.', 'The device shows in large letters: do not unplug.')}${w.needsRobot ? L(' Der Roboter bleibt daneben stehen.', ' The robot stays next to it.') : ''}</span></div><div class="prog"><i></i></div>
        <div class="row"><button class="btn sm" data-act="finish" data-a="${id}">${L('Vorspulen: Gerät meldet sich zurück', 'Fast forward: device reports back')}</button><button class="btn sm risk" data-act="failu" data-a="${id}">${L('Vorspulen: Gerät meldet sich nicht', 'Fast forward: device does not report back')}</button></div>`;
    else if (w.status === 'fertig') act = `<div><b>${L(`Zurückgemeldet ${hm(w.to - 8)}, Version 4.2.1.`, `Reported back at ${hm(w.to - 8)}, version 4.2.1.`)}</b> <span class="small muted">${L('Logs übertragen, ohne Patientendaten. Niemand hat telefoniert.', 'Logs transferred, without patient data. Nobody made a call.')}</span></div>`;
    else if (w.status === 'fehl') act = `<div><b>${L('Nicht zurückgemeldet.', 'Did not report back.')}</b> <span class="small muted">${L(`Ersatz ${e.name} steht bereit, der Service ist informiert. Die Person am Gerät hat nichts falsch gemacht.`, `Replacement ${e.name} is ready, service is informed. The person at the device did nothing wrong.`)}</span></div>`;
    const open = w.status !== 'vorschlag' && !['bereit', 'laeuft', 'fertig', 'fehl'].includes(w.status) ? startCheck(id) : null;
    // In the enlarged pitch the decision sits right under the window, so it is on screen without scrolling.
    const top = S.mode === 'pitch';
    return `<aside class="panel">${head}<div class="row"><b class="num">${dayL(w.day)}, ${hm(w.from)} ${L('bis', 'to')} ${hm(w.to)}</b><span class="pill ${STATUS[w.status]}">${statusL(w.status)}</span></div>${top ? act : ''}
      <div class="why"><div class="who"><span class="dot"></span>${L('Lotse: Warum dieses Fenster?', 'Pilot: why this window?')}</div><ul>${why.map((x) => `<li>${x}</li>`).join('')}</ul><div class="row" style="margin-top:8px"><span class="src">${L('OP-Plan, nur Saal und Zeit', 'OR schedule, room and time only')}</span><span class="src">${L(`Nutzungsmuster ${d.datenWochen} Wochen`, `Usage pattern ${d.datenWochen} weeks`)}</span><span class="src">${L('Begleiter am Gerät', 'Companion at the device')}</span></div></div>
      <ol class="steps">${steps}</ol>${top ? '' : act}${open && !open.ok ? `<div class="small muted">${L('Start noch gesperrt: ', 'Start still locked: ')}${gruende(open)}.</div>` : ''}${akte}</aside>`;
  }

  /* ---------- Geräte ---------- */
  const urg = (d) => { const u = aktuell(d) ? P.urgency(Object.assign({}, d, { update: null })) : P.urgency(d); return { score: u.score, warum: u.warum.map(X) }; };
  function vGeraete() {
    const list = D.DEVICES.map((d) => ({ d, u: urg(d) })).sort((a, b) => b.u.score - a.u.score);
    const rows = list.map(({ d, u }) => {
      const w = win(d.id);
      const next = w ? `<span class="pill ${STATUS[w.status]}">${dayL(w.day)} ${hm(w.from)}</span>` : (aktuell(d) ? `<span class="muted">${L('nicht nötig', 'not needed')}</span>` : (d.update.art === 'arm' ? `<span class="pill">${L('Techniker vor Ort', 'Technician on site')}</span>` : `<span class="pill org">${L('noch keins', 'none yet')}</span>`));
      return `<tr class="click" data-act="akte" data-a="${d.id}" tabindex="0"><td>${pet(mood(d), 44)}</td><td><b>${d.id} ${d.name}</b><div class="small muted">${X(d.fach)}</div></td><td>${X(d.ort)}<div class="small muted">${d.strom ? L('Strom vorhanden', 'power available') : L('kein Strom', 'no power')}</div></td>
        <td class="num">${swOf(d)} ${aktuell(d) ? `<span class="pill ok">${L('aktuell', 'up to date')}</span>` : `<span class="pill org">${L('fällig', 'due')}</span>`}</td><td>${next}</td><td class="num">${L('in ', 'in ')}${days(d.wartungTage)}</td><td class="num">${pct(d.sla.ist)} % <span class="small muted">${L('von', 'of')} ${pct(d.sla.soll)}</span></td>
        <td><span class="ubar"><i style="width:${u.score}%"></i></span><b class="num">${u.score}</b><div class="small muted">${u.warum.join(' · ') || L('nichts fällig', 'nothing due')}</div></td></tr>`;
    }).join('');
    return `<div class="head"><div><div class="eyebrow">${L('Geräte', 'Devices')}</div><h1>${L('Acht C-Bögen, nach Dringlichkeit sortiert', 'Eight C-arms, sorted by urgency')}</h1><p>${L('Gerätepflege statt Kundenpflege: Jedes Gerät hat eine Akte mit Zwilling, Prüfungen, Servicevertrag und Nutzungsmuster. Die Dringlichkeit ist eine Planungshilfe, keine klinische Bewertung.', 'Device care instead of customer care: every device has a file with twin, checks, service contract and usage pattern. The urgency is a planning aid, not a clinical assessment.')}</p></div></div>
      <div class="card"><div class="tw"><table><thead><tr><th></th><th>${L('Gerät', 'Device')}</th><th>${L('Standort', 'Location')}</th><th>Software</th><th>${L('Nächstes Fenster', 'Next window')}</th><th>${L('Nächste Prüfung', 'Next check')}</th><th>${L('Verfügbarkeit 12 Monate', 'Availability 12 months')}</th><th>${L('Dringlichkeit', 'Urgency')}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  /* ---------- Akte ---------- */
  const ago = (d) => L('vor ' + d.logsVor, X(d.logsVor) + ' ago');
  const stale = (d) => /Tag/.test(d.logsVor);
  function parts(d) {
    const i = D.DEVICES.indexOf(d);
    const akkuV = d.id === 'C-03' ? [91, 84, 78, 71] : [d.akku + 2, d.akku + 1, d.akku + 1, d.akku];
    const cap = L(' % Kapazität', ' % capacity');
    return {
      roehre: { a: 'g', wert: (1240 + i * 310).toLocaleString(en() ? 'en-GB' : 'de-DE') + L(' Betriebsstunden', ' operating hours'), text: L('Unauffällig. Nächste Konstanzprüfung laut Plan.', 'Nothing unusual. Next constancy test as planned.'), v: null },
      detektor: d.update && d.update.art === 'arm' ? { a: 'y', wert: L('Kalibrier-Update fällig', 'Calibration update due'), text: L('Update mit Armbewegung. Nur beaufsichtigt vor Ort, Technikertermin nötig.', 'Update with arm movement. Supervised on site only, a technician visit is needed.'), v: null } : { a: 'g', wert: L('Kalibrierung gültig', 'Calibration valid'), text: L('Keine Auffälligkeit in den Geräte-Logs.', 'Nothing unusual in the device logs.'), v: null },
      rechner: aktuell(d) ? { a: 'g', wert: 'Software ' + swOf(d), text: L('Auf aktuellem Stand.', 'Up to date.'), v: null } : { a: 'y', wert: 'Software ' + d.sw, text: L('Sicherheitsupdate 4.2.1 steht aus. Paket ist geladen und geprüft.', 'Security update 4.2.1 is pending. The package is downloaded and verified.'), v: null },
      akku: akkuV[3] < 75 ? { a: 'y', wert: akkuV[3] + cap, text: L('Sinkt seit vier Prüfungen. Tausch beim nächsten Servicetermin vormerken.', 'Falling for four checks. Note a replacement for the next service visit.'), v: akkuV } : { a: 'g', wert: akkuV[3] + cap, text: L('Stabil.', 'Stable.'), v: akkuV },
      fahrwerk: { a: 'g', wert: L('Bremsen geprüft', 'Brakes checked'), text: L('Letzte Sichtprüfung ohne Befund.', 'Last visual inspection without findings.'), v: null },
      netz: stale(d) ? { a: 'y', wert: L('letzter Kontakt ', 'last contact ') + ago(d), text: L('Steht meist ausgeschaltet im Flur. Der Bote holt die Logs beim nächsten Besuch.', 'Mostly stands switched off in the corridor. The Courier collects the logs on its next visit.'), v: null } : { a: 'g', wert: L('letzter Kontakt ', 'last contact ') + ago(d), text: L('Logs aktuell, ohne Patientendaten.', 'Logs current, without patient data.'), v: null },
    };
  }
  function spark(v) {
    const min = Math.min(...v) - 5, max = Math.max(...v) + 5;
    const pt = v.map((x, i) => [10 + i * 60, 36 - (x - min) / (max - min) * 28]);
    return `<svg class="spark" viewBox="0 0 220 44" role="img" aria-label="${L('Verlauf', 'Trend')}: ${v.join(', ')} ${L('Prozent', 'percent')}"><polyline points="${pt.map((p) => p.join(',')).join(' ')}"/>${pt.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3"/><text x="${p[0] - 6}" y="${p[1] - 6}">${v[i]}</text>`).join('')}</svg>`;
  }
  function vAkte() {
    const d = dev(S.dev), ps = parts(d), sel = ps[S.part], w = win(d.id);
    const u = urg(d);
    const AMP = { g: [L('in Ordnung', 'fine'), 'ok'], y: [L('beobachten', 'watch'), 'warn'], r: [L('handeln', 'act'), 'risk'] };
    const hot = D.PARTS.map((p, i) => `<g class="hot ${ps[p.k].a}${S.part === p.k ? ' on' : ''}" data-act="part" data-a="${p.k}" tabindex="0" role="button" aria-label="${X(p.name)}: ${AMP[ps[p.k].a][0]}"><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y}">${i + 1}</text></g>`).join('');
    const twin = `<svg viewBox="0 0 360 400" role="img" aria-label="${L('Schematische Zeichnung eines mobilen C-Bogens', 'Schematic drawing of a mobile C-arm')}">
      <rect class="fl" x="24" y="190" width="96" height="140" rx="10"/><rect class="fl" x="40" y="146" width="56" height="44" rx="6"/>
      <circle class="fl" cx="46" cy="348" r="14"/><circle class="fl" cx="100" cy="348" r="14"/>
      <path class="ln" d="M120 244 L141 228"/><path class="ln" d="M290 72 A130 130 0 1 0 290 328"/>
      <rect class="fl" x="258" y="44" width="74" height="28" rx="5"/><rect class="fl" x="262" y="318" width="64" height="40" rx="7"/>
      <path class="beam" d="M294 76 L294 314"/>${hot}</svg>`;
    const partP = D.PARTS.find((p) => p.k === S.part);
    const pruef = [
      [L('Sicherheitstechnische Kontrolle', 'Safety inspection'), L('jährlich', 'yearly'), d.wartungTage + 180], [L('Konstanzprüfung', 'Constancy test'), L('monatlich', 'monthly'), d.wartungTage, S.merged && d.id === 'C-02' && win('C-02') ? L('Do 19.11., 17:20, mit dem Update zusammengelegt', 'Thu 19 Nov, 17:20, combined with the update') : null],
      [L('Akkuprüfung', 'Battery check'), L('halbjährlich', 'every six months'), d.wartungTage + 60], [aktuell(d) ? 'Software' : L('Sicherheitsupdate 4.2.1', 'Security update 4.2.1'), L('bei Freigabe', 'on release'), aktuell(d) ? null : d.update.frist],
    ].map((x) => `<tr><td><b>${x[0]}</b></td><td class="muted">${x[1]}</td><td class="num">${x[3] ? x[3] : x[2] == null ? `<span class="pill ok">${L('aktuell', 'up to date')}</span>` : `in ${days(x[2])} ${x[2] <= 14 ? `<span class="pill warn">${L('bald', 'soon')}</span>` : ''}`}</td></tr>`).join('');
    const heat = D.DAYS.map((x, i) => `<span>${dayK(i)}</span>` + Array.from({ length: 18 }, (_, h) => {
      const m = (6 + h) * 60, busy = d.busy[i].some((c) => c.from < m + 60 && m < c.to);
      const r = busy ? 0.9 : (D.WEEKEND.includes(i) ? d.risk.we : d.risk.wt)[6 + h];
      return `<i style="opacity:${(0.06 + r * 0.94).toFixed(2)}" title="${dayK(i)} ${6 + h}${L(' Uhr', ':00')}"></i>`;
    }).join('')).join('');
    const dt = (s) => (en() ? I.date(s) : s);
    const ev = [
      w && w.status === 'fertig' ? ['18.11.', L('Sicherheitsupdate 4.2.1 installiert, zurückgemeldet ' + hm(w.to - 8) + '. Logs übertragen.', 'Security update 4.2.1 installed, reported back at ' + hm(w.to - 8) + '. Logs transferred.')] : null,
      w && w.status === 'fehl' ? ['18.11.', L('Update nicht zurückgemeldet. Wächter hat Ersatz ' + dev(w.ersatz).name + ' gemeldet, Service informiert.', 'Update did not report back. The Guardian announced replacement ' + dev(w.ersatz).name + ', service informed.')] : null,
      ['18.11.', L('Begleiter meldet Standort ' + d.ort + ', ' + (d.strom ? 'Strom vorhanden' : 'kein Strom') + '.', 'Companion reports location ' + X(d.ort) + ', ' + (d.strom ? 'power available' : 'no power') + '.')],
      ['02.11.', L('Konstanzprüfung ohne Befund.', 'Constancy test without findings.')], [d.sw === '4.2.1' ? '17.11.' : '14.08.', L('Sicherheitsupdate ' + d.sw + ' installiert.', 'Security update ' + d.sw + ' installed.')], ['03.06.', L('Sicherheitstechnische Kontrolle bestanden.', 'Safety inspection passed.')],
    ].filter(Boolean).map((e) => `<li><span class="num muted">${dt(e[0])}</span><span>${e[1]}</span></li>`).join('');
    const fresh8 = w && ['bereit', 'laeuft', 'fertig', 'fehl'].includes(w.status) && w.needsRobot;
    const logs = [
      [L('Letzte Übertragung', 'Last transfer'), fresh8 ? L('heute, vom Roboter abgeholt', 'today, collected by the robot') : ago(d) + (stale(d) ? ` <span class="pill warn">${L('alt', 'old')}</span>` : '')],
      [L('Inhalt', 'Content'), L('Fehlerspeicher, Akkuverlauf, Softwarestand, Betriebsstunden', 'Error memory, battery trend, software version, operating hours')],
      [L('Nicht enthalten', 'Not included'), L('Bilder, Namen, Patientendaten', 'Images, names, patient data')],
      [L('Weg', 'Route'), d.strom ? L('über das Netzmodul, sobald das Gerät an ist', 'via the network module as soon as the device is on') : L('der Bote holt sie beim Besuch per Kabel', 'the Courier collects them by cable during its visit')],
    ].map((x) => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('');
    const morgenFrueh = () => {
      if (d.ausfall) return L('Nein. Das Gerät ist nicht einsatzbereit.', 'No. The device is not ready for use.');
      if (w && w.status === 'fehl') return L(`Nein. Das Gerät hat sich nach dem Update nicht zurückgemeldet. Ersatz: ${dev(w.ersatz).name} (${dev(w.ersatz).ort}). Der Service ist informiert.`, `No. The device did not report back after the update. Replacement: ${dev(w.ersatz).name} (${X(dev(w.ersatz).ort)}). Service is informed.`);
      if (w && w.status === 'fertig') return L('Ja. Das Update ist installiert und das Gerät hat sich zurückgemeldet.', 'Yes. The update is installed and the device reported back.');
      if (w && w.day === 0) return L(`Voraussichtlich ja. Das Fenster endet heute ${hm(w.to)}, mit Puffer ${hm(w.to + P.RULES.PUFFER)}. Falls es sich nicht zurückmeldet, steht ${dev(w.ersatz).name} bereit und du erfährst es heute Abend, nicht morgen früh.`, `Probably yes. The window ends today at ${hm(w.to)}, with buffer at ${hm(w.to + P.RULES.PUFFER)}. If it does not report back, ${dev(w.ersatz).name} is ready and you learn about it tonight, not tomorrow morning.`);
      if (w && w.day === 1) return L(`Ja. Das Fenster liegt erst morgen von ${hm(w.from)} bis ${hm(w.to)}, nach dem letzten geplanten Eingriff.`, `Yes. The window is only tomorrow from ${hm(w.from)} to ${hm(w.to)}, after the last scheduled procedure.`);
      if (w) return L(`Ja. Das Fenster liegt erst am ${dayL(w.day)}.`, `Yes. The window is only on ${dayL(w.day)}.`);
      if (!aktuell(d)) return L('Ja, es ist noch kein Update geplant. Das Update bleibt aber offen.', 'Yes, no update is planned yet. The update remains open, though.');
      return L('Ja, für morgen früh ist kein Update geplant.', 'Yes, no update is planned for tomorrow morning.');
    };
    const QA = [[L('Warum ist das Gerät so dringend?', 'Why is the device this urgent?'), u.warum.length ? u.warum.join('. ') + L('. Quelle: Fristen aus der Update-Freigabe, Servicevertrag, Prüfplan.', '. Source: deadlines from the update release, service contract, check plan.') : L('Im Moment ist nichts fällig.', 'Nothing is due at the moment.')],
      [L('Kann ich das Gerät morgen um 7 Uhr nutzen?', 'Can I use the device at 7 tomorrow morning?'), morgenFrueh()]];
    return `<div class="head"><div><button class="lnk small" data-act="go" data-a="geraete">${L('Alle Geräte', 'All devices')}</button><div class="row" style="margin-top:6px">${pet(mood(d), 72, true)}<div><h1>${d.id} ${d.name}</h1><p style="margin-top:2px">${L('Mobiler C-Bogen (erfundenes Modell CB-900)', 'Mobile C-arm (invented model CB-900)')} · S/N SYN-2021-0${D.DEVICES.indexOf(d) + 1}03 · ${X(d.ort)}</p></div></div></div>
      <div class="r">${w ? `<button class="btn" data-act="tosel" data-a="${d.id}">${L('Fenster auf der Tafel', 'Window on the board')}</button>` : ''}<button class="btn" data-act="pet" data-a="${d.id}">${L('Begleiter', 'Companion')}</button></div></div>
      <div class="grid g64"><div class="stack">
        <section class="card"><h2>${L('Digitaler Zwilling', 'Digital twin')}</h2><div class="twin">${twin}<div class="stack"><div><div class="eyebrow">${D.PARTS.indexOf(partP) + 1} · ${X(partP.name)}</div><div class="row" style="margin-top:4px"><b>${sel.wert}</b><span class="pill ${AMP[sel.a][1]}">${AMP[sel.a][0]}</span></div><p class="small muted" style="margin-top:4px">${sel.text}</p>${sel.v ? spark(sel.v) + `<div class="small faint">${L('Kapazität in % bei den letzten vier Prüfungen', 'Capacity in % at the last four checks')}</div>` : ''}</div>
          <div class="small muted">${L('Punkte anklicken. Ampeln tragen immer auch ein Wort. Quelle: Geräte-Logs und Begleiter, ohne Patientendaten.', 'Click the dots. Traffic lights always carry a word too. Source: device logs and companion, without patient data.')}</div></div></div></section>
        <section class="card"><h2>${L('Wann wird das Gerät gebraucht?', 'When is the device needed?')}</h2><div class="tw"><div class="heat"><span></span>${Array.from({ length: 18 }, (_, h) => `<span class="num">${h % 3 === 0 ? 6 + h : ''}</span>`).join('')}${heat}</div></div><p class="small muted" style="margin-top:8px">${L(`Nutzung der letzten ${d.datenWochen} Wochen je Wochentag und Stunde, gemeldet vom Begleiter. Daraus rechnet der Lotse das Restrisiko eines Fensters.`, `Use over the last ${d.datenWochen} weeks per weekday and hour, reported by the companion. From this the Pilot calculates the residual risk of a window.`)}</p></section>
        <section class="card"><h2>${L('Softwarestand und Update-Verlauf', 'Software version and update history')}</h2><ul class="ev">${ev}</ul></section></div>
      <div class="stack">
        <section class="card"><h2>${L('Planungshilfe', 'Planning aid')}</h2><div class="row"><span class="ubar" style="width:120px"><i style="width:${u.score}%"></i></span><b class="num">${L('Dringlichkeit', 'Urgency')} ${u.score}</b></div><p class="small muted" style="margin-top:6px">${u.warum.join(' · ') || L('Nichts fällig.', 'Nothing due.')}</p>
          <div class="why" style="margin-top:10px"><div class="who"><span class="dot"></span>${hn('lotse')}</div>${w && w.status === 'fertig' ? L('Update heute installiert und zurückgemeldet. Steht wieder als Ersatzgerät bereit.', 'Update installed today and reported back. Ready again as a replacement device.') : w ? L(`Nächstes Fenster: ${dayL(w.day)}, ${hm(w.from)} bis ${hm(w.to)} (${statusL(w.status)}).`, `Next window: ${dayL(w.day)}, ${hm(w.from)} to ${hm(w.to)} (${statusL(w.status)}).`) : (aktuell(d) ? L('Kein Update offen. Steht als Ersatzgerät bereit.', 'No update open. Ready as a replacement device.') : L('Noch kein Fenster. Auf der Planungstafel „Lücken füllen“.', 'No window yet. “Fill the gaps” on the planning board.'))}${ps.akku.a === 'y' ? L(' Der Akkutausch passt in denselben Servicetermin wie die nächste Prüfung.', ' The battery replacement fits into the same service visit as the next check.') : ''}</div></section>
        <section class="card"><h2>${L('Wartung und Prüfungen', 'Maintenance and checks')}</h2><div class="tw"><table><tbody>${pruef}</tbody></table></div></section>
        <section class="card"><h2>${L('Servicevertrag und Fristen', 'Service contract and deadlines')}</h2><dl class="kv"><dt>${L('Vertrag', 'Contract')}</dt><dd>${X(d.sla.name)}</dd><dt>${L('Verfügbarkeit', 'Availability')}</dt><dd class="num">${L(`${pct(d.sla.ist)} % erreicht, ${pct(d.sla.soll)} % zugesagt`, `${pct(d.sla.ist)} % reached, ${pct(d.sla.soll)} % agreed`)} ${d.sla.ist < d.sla.soll ? `<span class="pill risk">${L('unter Vertrag', 'below contract')}</span>` : `<span class="pill ok">${L('erfüllt', 'met')}</span>`}</dd><dt>${L('Reaktionszeit', 'Response time')}</dt><dd>${X(d.sla.reaktion)}</dd><dt>${L('Laufzeit', 'Term')}</dt><dd>${L('bis ' + d.sla.bis, 'until 31 Dec 2027')}</dd><dt>${L('Update-Frist', 'Update deadline')}</dt><dd>${aktuell(d) ? L('keine offen', 'none open') : d.update.frist > 6 ? L('in ', 'in ') + days(d.update.frist) : dayL(d.update.frist)}</dd></dl></section>
        <section class="card"><h2>Logs</h2><dl class="kv">${logs}</dl></section>
        <section class="card"><h2>${L('Frag die Akte', 'Ask the file')}</h2><div class="stack">${QA.map((q, i) => `<div><button class="btn sm" data-act="ask" data-a="${i}">${q[0]}</button>${S.akte === i ? `<div class="why" style="margin-top:6px">${q[1]}</div>` : ''}</div>`).join('')}</div></section>
      </div></div>`;
  }

  /* ---------- Begleiter ---------- */
  function vBegleiter() {
    const d = dev(S.pet), m = mood(d), w = win(d.id);
    const pl = !!S.plugged[d.id];
    let say, btn = '';
    if (w && w.status === 'fehl') say = L(`Ich bin nicht zurückgekommen. Die Medizinphysik weiß Bescheid, ${dev(w.ersatz).name} springt ein. Du hast nichts falsch gemacht.`, `I did not come back. Medical physics knows, ${dev(w.ersatz).name} steps in. You did nothing wrong.`);
    else if (m === 'schlaeft') say = L(`Finger weg, ich update. Fertig um ${hm(w.to)}. Bitte nicht ausstecken.`, `Hands off, I am updating. Done at ${hm(w.to)}. Please do not unplug me.`);
    else if (m === 'froh') say = L('Alles frisch. Danke fürs Kümmern!', 'All fresh. Thanks for looking after me!');
    else if (m === 'wartet' && w.day === 0 && w.needsRobot) say = L(`Der Roboter bringt mir um ${hm(w.from - 15)} Strom. Du musst nichts tun.`, `The robot brings me power at ${hm(w.from - 15)}. You do not have to do anything.`);
    else if (m === 'wartet' && w.day === 0 && !pl) { say = L(`Heute bitte eingesteckt in ${d.ort} lassen. Die Medizinphysik startet mein Update um ${hm(w.from)} aus der Ferne. Sonst ist nichts zu tun.`, `Please leave me plugged in in ${XS(d.ort)} today. Medical physics starts my update remotely at ${hm(w.from)}. Nothing else to do.`); btn = S.role === 'nurse' ? `<button class="big" data-act="plug" data-a="${d.id}">${L('Bleibt eingesteckt', 'Stays plugged in')}</button>` : `<div class="note">${L('Die Bitte beantwortet die Person am Gerät.', 'The person at the device answers this request.')}</div>`; }
    else if (m === 'wartet' && w.day === 0) say = L(`Danke! Um ${hm(w.from)} geht es los. Du musst nichts weiter tun.`, `Thank you! It starts at ${hm(w.from)}. Nothing more for you to do.`);
    else if (m === 'wartet') say = L(`Mein Update ist am ${dayL(w.day)} um ${hm(w.from)} dran. Heute brauche ich nichts.`, `My update is due on ${dayL(w.day)} at ${hm(w.from)}. I need nothing today.`);
    else if (m === 'matt') { say = L('Ich bin matt und schlafe gleich ein. Mein Update ist fällig und hier gibt es keinen Strom. Weckt mich jemand?', 'I am weak and about to doze off. My update is due and there is no power here. Will someone wake me?'); btn = `<button class="big" data-act="wake" data-a="${d.id}">${L('Aufwecken', 'Wake up')}</button>`; }
    else if (w) say = L('Der Lotse hat ein Fenster für mich vorgeschlagen. Die Medizinphysik muss es noch freigeben.', 'The Pilot has proposed a window for me. Medical physics still has to release it.');
    else if (S.woke[d.id]) say = L('Danke fürs Wecken! Jetzt sucht der Lotse ein Fenster für mich.', 'Thanks for waking me! Now the Pilot is looking for a window for me.');
    else say = L('Ich habe Hunger auf ein Update. Sobald der Lotse ein Fenster findet, melde ich mich.', 'I am hungry for an update. As soon as the Pilot finds a window, I will get in touch.');
    const need = (l, v, t) => `<div class="need${v < 50 ? ' low' : ''}">${l}<b>${t}</b><div class="lv"><i style="width:${v}%"></i></div></div>`;
    const strom = d.strom || pl || (w && ['bereit', 'laeuft', 'fertig'].includes(w.status));
    const parked = !/Flur/.test(d.ort);
    const told = !stale(d) || (w && w.needsRobot && ['bereit', 'laeuft', 'fertig', 'fehl'].includes(w.status));
    const sat = D.DEVICES.filter((x) => mood(x) === 'froh').length;
    const termin = D.DEVICES.filter((x) => ['wartet', 'schlaeft'].includes(mood(x))).length;
    const last = d.busy[0].filter((c) => c.to <= D.NOW).pop() || null;
    const running = d.busy[0].find((c) => c.from <= D.NOW && D.NOW < c.to) || null;
    const robHere = w && w.needsRobot && ['bereit', 'laeuft', 'fertig', 'fehl'].includes(w.status);
    const diary = [
      w && w.status === 'fertig' ? [hm(w.to - 8), L('Update geschafft. Ich bin wieder da und fühle mich frisch.', 'Update done. I am back and feel fresh.')] : null,
      w && w.status === 'laeuft' ? [hm(w.from), L('Ich schlafe jetzt und update. Der Wächter passt auf.', 'I am asleep now and updating. The Guardian keeps watch.')] : null,
      pl ? ['16:42', L('Jemand hat versprochen, mich eingesteckt zu lassen. Danke, Spätschicht!', 'Someone promised to leave me plugged in. Thanks, late shift!')] : null,
      S.woke[d.id] ? ['16:41', L('Jemand hat mich geweckt. Der Lotse sucht mir ein Fenster.', 'Someone woke me up. The Pilot is looking for a window for me.')] : null,
      robHere ? ['16:44', L('Der Roboter ist da und hat mir Strom gebracht.', 'The robot is here and has brought me power.')] : null,
      running ? ['16:31', L(`Ich bin bis ${hm(running.to)} im Einsatz in ${running.saal}.`, `I am in use in ${XS(running.saal)} until ${hm(running.to)}.`)] : ['16:31', d.strom ? L(`Ich stehe in ${d.ort} und habe Strom.`, `I am in ${XS(d.ort)} and have power.`) : L(`Ich stehe im ${d.ort}. Keine Steckdose weit und breit.`, `I am in ${XS(d.ort)}. No socket far and wide.`)],
      last ? [hm(last.to), L(`Feierabend im ${last.saal}. Heute war ${last.fach}.`, `Done for today in ${XS(last.saal)}. Today was ${X(last.fach)}.`)] : ['09:00', L('Heute braucht mich niemand. Ich halte mich bereit.', 'Nobody needs me today. I am standing by.')],
      ['07:00', aktuell(d) ? L('Guten Morgen. Software aktuell, mir fehlt nichts.', 'Good morning. Software up to date, I lack nothing.') : L(`Guten Morgen. Mein Update ist in ${days(d.update.frist)} fällig.`, `Good morning. My update is due in ${days(d.update.frist)}.`)],
    ].filter(Boolean).map((e) => `<li><span class="num muted">${e[0]}</span><span>${e[1]}</span></li>`).join('');
    const serie = [['Unfallchirurgie', 12], ['Orthopädie', 9], ['Neurochirurgie', 7], ['Notaufnahme', 4]].map((x) => `<dt>${X(x[0])}</dt><dd><span class="streak" style="display:inline-flex;vertical-align:middle;margin-right:8px">${Array.from({ length: x[1] }, () => '<i></i>').join('')}</span><span class="num">${x[1]} ${L('Abende', 'evenings')}</span></dd>`).join('');
    /* The data behind the mood: six data points, each with the mood it shows on the face and what the update cockpit
       does with it. No patient data, only the state of the device. */
    const used = running ? L('gerade im Einsatz in ' + running.saal + ', bis ' + hm(running.to), 'in use right now in ' + XS(running.saal) + ', until ' + hm(running.to)) : last ? L('heute bis ' + hm(last.to) + ' in ' + last.saal, 'today until ' + hm(last.to) + ' in ' + XS(last.saal)) : L('heute nicht', 'not today');
    const points = [
      [!strom, strom ? L('Satt', 'Fed') : L('Hungrig', 'Hungry'), L('Strom', 'Power'), strom ? L('eingesteckt', 'plugged in') : L('nicht eingesteckt', 'not plugged in') + (/keine Steckdose/.test(d.stromHinweis) ? L(', keine Steckdose', ', no socket') : ''), strom ? L('Start aus der Ferne möglich', 'remote start possible') : L('Roboter oder eine Hand muss kommen', 'the robot or a hand has to come')],
      [!told, told ? L('In Kontakt', 'In touch') : L('Einsam', 'Lonely'), L('Netz', 'Network'), (strom ? L('verbunden', 'connected') : L('keine Verbindung', 'no connection')) + L(', letzte Logs ', ', last logs ') + (stale(d) && told ? L('gerade eben', 'just now') : ago(d)), L('Paket und Logs: über Netz oder Roboter', 'package and logs: by network or by robot')],
      [!parked, parked ? L('Zu Hause', 'At home') : L('Gestrandet', 'Stranded'), L('Standort', 'Location'), X(d.ort), L('Weg für Roboter und Helfer', 'route for robot and helpers')],
      [d.akku < 50, d.akku < 50 ? L('Müde', 'Tired') : L('Wach', 'Awake'), L('Akku', 'Battery'), d.akku + ' %', L('reicht er für einen Rollback?', 'is it enough for a rollback?')],
      [!aktuell(d), aktuell(d) ? L('Munter', 'Happy') : L('Hunger auf Update', 'Craving an update'), L('Software-Version', 'Software version'), swOf(d) + (aktuell(d) ? L(', aktuell', ', up to date') : L(`, 4.2.1 fällig in ${days(d.update.frist)}`, `, 4.2.1 due in ${days(d.update.frist)}`)), L('Frist und Dringlichkeit auf der Tafel', 'deadline and urgency on the board')],
      [!!running, running ? L('Beschäftigt', 'Busy') : L('Hat Ruhe', 'At rest'), L('Nutzung', 'Usage'), used + L(`, Muster aus ${d.datenWochen} Wochen`, `, pattern from ${d.datenWochen} weeks`), L('goldenes Fenster nach dem letzten Eingriff', 'golden window after the last procedure')],
    ].map((x) => `<tr><td><span class="pill ${x[0] ? 'warn' : 'ok'}">${x[1]}</span></td><td><b>${x[2]}</b><span>${x[3]}</span></td><td><span class="flow">→ ${x[4]}</span></td></tr>`).join('');
    const data = `<section class="card dp"><div class="row"><h2>${L('Jede Stimmung ist ein Datenpunkt', 'Every mood is a data point')}</h2><span class="pill ai">${L('→ fließt ins Update-Cockpit', '→ feeds the update cockpit')}</span></div>
      <div class="tw"><table><thead><tr><th>${L('Stimmung', 'Mood')}</th><th>${L(`Datenpunkt von ${d.name}`, `${d.name}’s data point`)}</th><th>${L('Was das Update-Cockpit daraus macht', 'What the update cockpit does with it')}</th></tr></thead><tbody>${points}</tbody></table></div>
      <p class="small muted" style="margin-top:8px">${L('Sechs Datenpunkte, keine Patientendaten. Der Begleiter ist ein akkubetriebener Kleinrechner am Gerät. Er meldet auch dann, wenn der C-Bogen aus ist.', 'Six data points, no patient data. The companion is a small battery-powered computer on the device. It reports even when the C-arm is off.')} <button class="lnk" data-act="go" data-a="tafel">${L('Zur Planungstafel', 'To the planning board')}</button></p></section>`;
    return `<div class="head"><div><div class="eyebrow">${L('Begleiter', 'Companion')}</div><h1>${L('Mein C-Bogen soll nicht hungern.', 'My C-arm must not go hungry.')}</h1><p>${L('Jeder C-Bogen hat ein Gesicht. Es zeigt, was er braucht, und bittet höchstens um eine Sache. Hinter jeder Stimmung steht ein Datenpunkt, und der fließt ins Update-Cockpit.', 'Every C-arm has a face. It shows what the device needs and asks for one thing at most. Behind every mood sits a data point, and it feeds the update cockpit.')}</p></div></div>
      <div class="grid g2"><div class="stack"><div class="device"><div class="bar"><span>${d.id} · ${X(d.ort)}</span><span class="num">16:40</span></div><div class="scr"><div class="stage">${pet(m, 200, true)}</div><div class="nm">${d.name}</div><div class="say">${say}</div>${btn}${pl && w && w.status !== 'fehl' ? `<div class="heart">♥ ${L('Danke an die Spätschicht', 'Thanks to the late shift')}</div>` : ''}
          <div class="needs">${need(L('Strom', 'Power'), strom ? 100 : 12, strom ? L('da', 'on') : L('fehlt', 'missing'))}${need(L('Netz', 'Network'), strom ? 90 : 20, strom ? L('verbunden', 'connected') : L('aus', 'off'))}${need('Update', aktuell(d) ? 100 : (w ? 60 : 15), aktuell(d) ? L('aktuell', 'up to date') : (w ? (w.status === 'vorschlag' ? L('vorgeschlagen', 'proposed') : L('geplant', 'planned')) : L('fällig', 'due')))}${need(L('Ruhe', 'Rest'), w || aktuell(d) ? 90 : 35, w ? L('Fenster da', 'window found') : (aktuell(d) ? L('gut', 'good') : L('sucht', 'searching')))}${need(L('Parkplatz', 'Parking spot'), parked ? 95 : 30, parked ? L('am Platz', 'in place') : L('im Flur', 'in the corridor'))}${need(L('Tagebuch', 'Diary'), told ? 90 : 25, told ? L('erzählt', 'shared') : L('lange still', 'silent for long'))}</div>
          <div class="note">${L('Anzeige am Gerät. Die Person am Gerät entscheidet nichts. Die Freigabe kommt von der Medizinphysik, den Start bestätigt die Medizinphysik oder die IT-Abteilung.', 'Display on the device. The person at the device decides nothing. Medical physics releases, medical physics or the IT department confirms the start.')}</div></div></div>
        <section class="card"><h2>${L(`Tagebuch von ${d.name}`, `${d.name}’s diary`)}</h2><ul class="ev">${diary}</ul><p class="small muted" style="margin-top:8px">${L('Das Tagebuch sind die Geräte-Logs in einfachen Worten. Es enthält keine Namen und keine Patientendaten.', 'The diary is the device logs in plain words. It contains no names and no patient data.')}</p></section></div>
      <div class="stack">${data}<section class="card"><h2>${L('Teamraum: alle Begleiter im OP-Trakt', 'Team room: all companions in the OR suite')}</h2><div class="team">${D.DEVICES.map((x) => `<button class="${x.id === d.id ? 'on' : ''}" data-act="pet" data-a="${x.id}" aria-label="${x.name}, ${moodL(mood(x))}">${pet(mood(x), 76)}<b>${x.name}</b><span class="muted">${moodL(mood(x))}</span></button>`).join('')}</div></section>
        <section class="card"><h2>${L('Gemeinsam: alle acht munter bis Montag', 'Together: all eight cheerful by Monday')}</h2><div class="row"><b class="num" style="font-size:24px">${sat} ${L('von', 'of')} 8</b><span class="muted">${L('munter', 'cheerful')}${termin ? L(`, ${termin} mit Termin`, `, ${termin} with an appointment`) : ''}</span></div><div class="prog" style="margin:8px 0"><i style="animation:none;width:${sat / 8 * 100}%;background:var(--petrol)"></i></div>
          <h3 style="margin-top:12px">${L('Pflege-Serie je Abteilung', 'Care streak per department')}</h3><dl class="kv" style="margin:8px 0">${serie}</dl><p class="small muted">${L('Gezählt werden Abende in Folge, an denen die Abteilung ihr Gerät eingesteckt gelassen hat. Gezählt wird die Abteilung, nie eine einzelne Person. Es gibt keine Rangliste.', 'We count consecutive evenings on which the department left its device plugged in. The department is counted, never a single person. There is no ranking.')}</p></section>
        <section class="card"><h2>${L('Warum ein Tamagotchi?', 'Why a Tamagotchi?')}</h2><p class="small">${L('Im Gespräch hieß es: Es ist ein Problem des Sich-zuständig-Fühlens, und niemand will angeschrien werden. Der Begleiter macht aus „Nimm du ihn, ich hab ihn sicher“ ein sichtbares, gemeinsames Kümmern. Er wird matt und schläft ein, das Team weckt ihn. Er stirbt nicht, und er beschämt niemanden.', 'In the conversation we heard: it is a problem of feeling responsible, and nobody wants to be shouted at. The companion turns “you take it, I thought you had it” into visible, shared care. It gets weak and dozes off, the team wakes it. It does not die, and it shames nobody.')}</p></section></div></div>`;
  }

  /* ---------- Helfer und Regeln ---------- */
  function vHelfer() {
    const c3 = win('C-03');
    return `<div class="head"><div><div class="eyebrow">${L('Helfer und Regeln', 'Helpers and rules')}</div><h1>${L('Die KI bekommt das Ziel. Die Leitplanken sind fest.', 'The AI gets the goal. The guardrails are fixed.')}</h1><p>${L('Auftrag an die Helfer: Halte die Flotte innerhalb der Fristen aktuell, mit möglichst wenig Aufwand für die drei Rollen und ohne einen einzigen Eingriff zu berühren.', 'Brief for the helpers: keep the fleet up to date within the deadlines, with as little effort as possible for the three roles and without touching a single procedure.')}</p></div></div>
      <div class="helfer">${D.HELFER.map((h) => `<section class="card"><div class="row"><span class="dot" style="color:var(--ai)"></span><h2 style="margin:0">${X(h.name)}</h2></div><p class="small" style="margin:8px 0">${X(h.tut)}</p><dl class="kv small"><dt>${L('Allein', 'Alone')}</dt><dd>${X(h.allein)}</dd><dt>${L('Mensch', 'Human')}</dt><dd>${X(h.mensch)}</dd></dl></section>`).join('')}</div>
      <div class="grid g2" style="margin-top:14px"><section class="card"><h2>${L('Feste Regeln, keine KI', 'Fixed rules, no AI')}</h2><ol class="rules">${D.REGELN.map((r) => `<li>${X(r)}</li>`).join('')}</ol><p class="small muted" style="margin-top:10px">${L('Die Regeln 2 bis 6 prüft der Planer bei jedem Vorschlag und jedem Start, abgesichert mit Tests. Regel 1 und 7 folgen aus dem Aufbau: Jeder Start braucht den Klick einer Rolle, und die Daten enthalten nur Saal, Zeit, Gerät und Rolle. Puffer, Risikogrenze und Mindestdaten sind Annahmen.', 'The planner checks rules 2 to 6 on every proposal and every start, backed by tests. Rules 1 and 7 follow from the design: every start needs the click of a role, and the data only holds room, time, device and role. Buffer, risk limit and minimum data are assumptions.')}</p></section>
      <section class="card"><h2>${L('Drei Rollen, je eine Frage', 'Three roles, one question each')}</h2><dl class="kv"><dt>${role('it')}</dt><dd>${L('„Sicherheitsupdate für sechs C-Bögen. Frist Montag?“', '“Security update for six C-arms. Deadline Monday?”')}</dd><dt>${role('mp')}</dt><dd>${c3 ? L(`„Cio ${c3.day === 0 ? 'heute' : dayL(c3.day)} ${hm(c3.from)} bis ${hm(c3.to)}, Ersatz ${dev(c3.ersatz).name}. Freigeben?“`, `“Cio ${c3.day === 0 ? 'today' : dayL(c3.day)} ${hm(c3.from)} to ${hm(c3.to)}, replacement ${dev(c3.ersatz).name}. Release?”`) : L('„Cio heute Abend, Ersatzgerät steht bereit. Freigeben?“', '“Cio tonight, a replacement device is ready. Release?”')}</dd><dt>${role('nurse')}</dt><dd>${L('„Heute bitte eingesteckt lassen. Das war alles.“', '“Please leave it plugged in today. That was all.”')}</dd></dl><p class="small muted" style="margin-top:10px">${L('Reicht die Datenlage nicht, sagt der Lotse das und schlägt nichts vor. Die KI sieht nur Saal, Zeit, Gerät und Rolle.', 'If the data is not enough, the Pilot says so and proposes nothing. The AI only sees room, time, device and role.')}</p></section></div>${moreHelpers()}`;
  }

  /* ---------- robot mission, jobs for people nearby, control room ----------
     Everything here is invented for the demo: floor plan, distances, speeds, thresholds, staff.
     Staff appear as functions and shifts, never as names. Locations are the rostered area, not tracking. */
  const DOCK = [655, 250], AT = [580, 104], DRIVE = [[625, 250], [580, 250], [580, 200], [580, 150]];
  const READY_STEP = 7, GUARD_STEP = 8, REPORT_STEP = 9, LAST_STEP = 11;
  /* Pace of the mission clock. STEP_MS is the quick pace of the deep dive.
     PITCH_ROBOT_SECONDS is the knob for the stage: seconds from "Send the robot" to "surroundings clear" in the
     pitch tour. Set it to the measured drive time of the real KettyBot. PITCH_UPDATE_SECONDS is the time from
     "Confirm start" until the device reports back by itself in the pitch tour. */
  /* In a guided journey the robot runs slower than in free clicking, so the audience can follow the checklist. */
  const JOURNEY_STEP_MS = 1100;
  const STEP_MS = 450, PITCH_ROBOT_SECONDS = 30, PITCH_UPDATE_SECONDS = 6;
  /* The drive (step 2) takes three extra ticks, so READY_STEP + 3 ticks lead from dispatch to "surroundings clear". */
  const PITCH_STEP_MS = PITCH_ROBOT_SECONDS * 1000 / (READY_STEP + 3);
  const stepL = (i, d) => [
    [L('Auftrag prüfen', 'Check the order'), L('Freigabe der Medizinphysik, Fenster und signiertes Paket liegen vor', 'Release by medical physics, window and signed package are in place')],
    [L('Selbsttest und Abdocken', 'Self-test and undock'), L('Akku, Bremsen, Sensoren und Not-Halt geprüft', 'Battery, brakes, sensors and emergency stop checked')],
    [L('Fahrt durch den Flur', 'Drive along the corridor'), L('Schritttempo, Menschen und Betten haben Vorfahrt', 'Walking pace, people and beds have right of way')],
    [L('Gerät finden und erkennen', 'Find and identify the device'), L(`Kennung am Gerät gelesen: ${d.id}, passt zum Auftrag`, `ID on the device read: ${d.id}, matches the order`)],
    [L('Umgebung scannen', 'Scan the surroundings'), L('Personen, Fluchtweg, Standfestigkeit, kein steriler Bereich', 'People, escape route, stability, no sterile area')],
    [L('Strom und Netzwerkkabel anstecken', 'Plug in power and network cable'), L('Der Roboter bringt Strom und das Update im eigenen Speicher mit', 'The robot brings power and carries the update in its own storage')],
    [L('Paket und Gerätezustand prüfen', 'Verify package and device state'), L('Signatur gültig, Version passt, Geräteakku reicht für einen Rollback', 'Signature valid, version matches, device battery is enough for a rollback')],
    [L('„Umgebung frei“ melden', 'Report “surroundings clear”'), L('Jetzt entscheidet ein Mensch: Start aus der Ferne bestätigen', 'Now a human decides: confirm the remote start')],
    [L('Update bewachen', 'Guard the update'), L('Bleibt daneben, zeigt „nicht ausstecken“, spricht Menschen an, die näher kommen', 'Stays next to it, shows “do not unplug”, addresses people who come closer')],
    [L('Rückmeldung prüfen und Logs holen', 'Check the report and collect logs'), L('Gerät startet neu, Selbsttest bestanden, Logs ohne Patientendaten übertragen', 'Device restarts, self-test passed, logs transferred without patient data')],
    [L('Abstecken und zurückfahren', 'Unplug and drive back'), L('Kabel aufgerollt, Gerät bleibt gebremst stehen', 'Cables rolled up, device stays braked')],
    [L('Andocken und Bericht', 'Dock and report'), L('Lädt an der Station, Einsatzbericht liegt in der Geräteakte', 'Charging at the dock, the mission report is in the device file')],
  ][i];
  const robPos = () => {
    const r = S.rob;
    if (!r) return DOCK;
    if (r.man) return [r.man.x, r.man.y];
    if (r.step < 2) return DOCK;
    if (r.step === 2) return DRIVE[r.sub];
    if (r.step === 10) return DRIVE[3 - r.sub];
    return r.step >= LAST_STEP ? DOCK : AT;
  };
  const robMoving = () => { const r = S.rob; return !!r && !r.hold && !r.man && (r.step === 2 || r.step === 10); };
  const holdL = (h) => ({ hindernis: L('Hindernis im Flur, Roboter wartet', 'Obstacle in the corridor, robot waits'), funk: L('Verbindung getrennt, Roboter steht', 'Connection lost, robot stands still'), halt: L('Not-Halt gedrückt, Roboter steht', 'Emergency stop pressed, robot stands still'), alarm: L('Alarm: Roboter steht an der Wand und hält den Flur frei', 'Alarm: robot stands at the wall and keeps the corridor clear') }[h]);
  function robMode() {
    const r = S.rob;
    if (!r) return L('An der Station, lädt', 'At the dock, charging');
    if (r.hold) return holdL(r.hold);
    if (r.man) return L('Ferngesteuert von Hand, Schritttempo', 'Steered by hand remotely, walking pace');
    if (r.fail) return L('Steht am Gerät und meldet den Fehlschlag', 'Stands at the device and reports the failure');
    if (r.step === READY_STEP) return L('Wartet auf die Bestätigung eines Menschen', 'Waits for a human to confirm');
    if (r.step === GUARD_STEP) return L('Bewacht das Update', 'Guards the update');
    if (r.step >= LAST_STEP) return L('Einsatz beendet, lädt an der Station', 'Mission finished, charging at the dock');
    return L('Fährt den Auftrag selbstständig ab', 'Runs the order on its own');
  }
  /* One step of the mission clock. The robot never moves on while it is held, steered by hand,
     waiting for a human (READY_STEP) or guarding a running update (GUARD_STEP). */
  /* The robot is plugged in from step 5 until it has collected the logs. */
  const robPlugged = (r) => (r.step >= 5 || r.re) && r.step <= REPORT_STEP;
  /* True while this reason holds the robot, also underneath an emergency stop or an alarm. */
  const held = (r, h) => !!r && (r.hold === h || r.prev === h);
  /* A stop, a lost connection or an alarm withdraws "surroundings clear": nobody can vouch for it any more.
     After the release the robot scans the surroundings again (it stays plugged in, r.re) and reports anew. */
  function withdraw(r) {
    const w = win(r.id);
    if (!w || w.status !== 'bereit') return;
    Object.assign(w, { status: 'unterwegs', umgebungFrei: false, paketGeprueft: false });
    r.step = 3; r.sub = 0; r.re = true;
    feed('bote', () => L(`Roboter zieht die Meldung „Umgebung frei“ für ${dev(r.id).name} zurück. Ein Start ist erst nach einer neuen Meldung möglich.`, `The robot withdraws the report “surroundings clear” for ${dev(r.id).name}. A start is only possible after a new report.`));
  }
  function tick() {
    const r = S.rob;
    if (!r || r.hold || r.man || r.fail || r.step >= LAST_STEP || r.step === READY_STEP) return;
    const pitch = S.mode === 'pitch', since = Date.now() - (r.t || 0);
    const w = win(r.id);
    if (r.step === GUARD_STEP) {
      // Only the scripted pitch lets the device report back by itself (QA finding B4). Elsewhere it stays a click.
      if ((pitch || (S.tour && JR().auto)) && w && w.status === 'laeuft' && since >= PITCH_UPDATE_SECONDS * 1000) { ACT.finish(r.id); r.t = Date.now(); render(); }
      return;
    }
    if (since < (pitch ? PITCH_STEP_MS : S.tour && S.jr ? JOURNEY_STEP_MS : STEP_MS)) return;
    r.t = Date.now();
    if (!w) { S.rob = null; render(); return; }
    if ((r.step === 2 || r.step === 10) && r.sub < 3) { r.sub++; render(); return; }
    r.sub = 0; r.step++;
    if (r.step === READY_STEP) { ready(r.id); if (w.status !== 'bereit') r.step = READY_STEP - 1; }
    if (r.step === LAST_STEP) feed('bote', () => L('Roboter ist zurück an der Station und lädt. Einsatzbericht liegt in der Geräteakte.', 'The robot is back at the dock and charging. The mission report is in the device file.'));
    render();
  }

  /* Staff: functions and shifts only. p2 is the person whose view the role "Person am Gerät" shows. */
  const STAFF = [
    { k: 'p2', fn: 'mtr', de: 'MTR Spätdienst 2', en: 'Radiographer, late shift 2', ort: 'Flur A', x: 520, y: 150 },
    { k: 'p3', fn: 'pflege', de: 'OP-Pflege Spätdienst 1', en: 'OR nurse, late shift 1', ort: 'Saal 4', x: 462, y: 96 },
    { k: 'p7', fn: 'medtech', ruf: true, de: 'Medizintechnik Rufdienst', en: 'Clinical engineering, on call', ort: 'Werkstatt', x: 655, y: 150 },
    { k: 'p1', fn: 'mtr', de: 'MTR Spätdienst 1', en: 'Radiographer, late shift 1', ort: 'Saal 2', x: 202, y: 96, busy: ['im Eingriff bis 17:00', 'in a procedure until 17:00'] },
    { k: 'p4', fn: 'pflege', de: 'OP-Pflege Spätdienst 2', en: 'OR nurse, late shift 2', ort: 'Schockraum', x: 462, y: 256, busy: ['Bereitschaft im Schockraum', 'on standby in the trauma room'] },
    { k: 'p5', fn: 'mtr', de: 'MTR Frühdienst 1', en: 'Radiographer, early shift 1', off: ['Dienst endete 14:30', 'shift ended at 14:30'] },
    { k: 'p6', fn: 'mtr', de: 'MTR Frühdienst 2', en: 'Radiographer, early shift 2', off: ['frei laut Dienstplan', 'day off per roster'] },
  ];
  const staff = (k) => STAFF.find((p) => p.k === k);
  const staffName = (p) => (en() ? p.en : p.de);
  const ME = 'p2';
  function staffState(p) {
    if (p.k === ME && S.me === 'eingriff') return { s: 'busy', why: L('im Eingriff', 'in a procedure') };
    if (p.k === ME && S.me === 'aus') return { s: 'off', why: L('nicht im Dienst', 'off duty') };
    if (p.off) return { s: 'off', why: pick(p.off) };
    if (p.busy) return { s: 'busy', why: pick(p.busy) };
    const mine = S.jobs.find((j) => j.by === p.k && !j.done);
    if (mine) return { s: 'job', why: L('hat einen Auftrag angenommen', 'has accepted a job') };
    return { s: 'frei', why: L('im Dienst, laut Plan frei', 'on duty, free per roster') };
  }
  /* Supervising an update with arm movement needs a trained function (assumption: radiographers and clinical engineering). */
  const JOB_FN = { weg: null, schauen: null, strom: null, aufsicht: ['mtr', 'medtech'] };
  const jobPos = (j) => (j.typ === 'weg' ? [580, 177] : DEVPOS[j.dev]);
  /* Walking distance from the rostered area to the job, along the corridors, rounded to 5 m. An estimate, not tracking. */
  const dist = (p, j) => { const q = jobPos(j); return Math.max(5, Math.round((Math.abs(p.x - q[0]) + Math.abs(p.y - q[1])) * 0.2 / 5) * 5); };
  /* Only people who are on duty, free and allowed to do this job are asked, nearest first, one person at a time.
     The on-call service comes last, it is not "nearby anyway". */
  const askable = (j) => STAFF.filter((p) => staffState(p).s === 'frei' && !j.no.includes(p.k) && (!JOB_FN[j.typ] || JOB_FN[j.typ].includes(p.fn))).sort((a, b) => (a.ruf ? 1000 : 0) + dist(a, j) - (b.ruf ? 1000 : 0) - dist(b, j));
  /* Offers are handed out in one pass, oldest job first, so nobody has two requests at once. */
  function offers() {
    const o = {}, taken = [];
    S.jobs.forEach((j) => { if (j.by || j.done) return; const p = askable(j).find((x) => !taken.includes(x.k)); if (p) { o[j.n] = p; taken.push(p.k); } });
    return o;
  }
  const offerTo = (j) => (j.by || j.done ? null : (offers()[j.n] || null));
  const jobL = (j) => {
    const d = dev(j.dev);
    return {
      weg: { t: L('Bett im Flur B zur Seite stellen', 'Move a bed aside in Corridor B'), b: L(`Der Roboter kommt nicht an ${d.name} heran. Er wartet und hält den Fluchtweg frei.`, `The robot cannot reach ${d.name}. It waits and keeps the escape route clear.`), min: 2, ort: 'Flur B', todo: [L('Bett an die Wand stellen', 'Put the bed against the wall'), L('Fertig melden, der Roboter fährt weiter', 'Report done, the robot drives on')] },
      schauen: { t: L(`Kurz nach ${d.name} sehen`, `Have a quick look at ${d.name}`), b: L(`${d.name} hat sich nach dem Update nicht zurückgemeldet. Zwei Blicke genügen, du entscheidest nichts und reparierst nichts.`, `${d.name} did not report back after the update. Two looks are enough, you decide nothing and repair nothing.`), min: 3, ort: d.ort, todo: [L('Steckt das Netzkabel?', 'Is the power cable plugged in?'), L('Was zeigt die Anzeige am Gerät?', 'What does the display on the device show?')] },
      strom: { t: L(`${d.name} an Strom und Netz anschließen`, `Connect ${d.name} to power and network`), b: L(`${d.name} steht im ${d.ort} ohne Steckdose, das Update-Fenster ist freigegeben. Ein Handgriff, du entscheidest nichts. Den Start bestätigt die Medizinphysik.`, `${d.name} stands in ${XS(d.ort)} without a socket, the update window is released. One simple action, you decide nothing. Medical physics confirms the start.`), min: 5, ort: d.ort, todo: [L('Gerät zur nächsten Steckdose schieben und bremsen', 'Push the device to the nearest socket and brake it'), L('Strom und Netzwerkkabel einstecken', 'Plug in power and network cable'), L('Erledigt melden', 'Report done')] },
      aufsicht: { t: L(`Update an ${d.name} beaufsichtigen`, `Supervise the update on ${d.name}`), b: L('Update mit Armbewegung: Es läuft nie aus der Ferne. Eine eingewiesene Person bleibt im Raum und startet am Gerät.', 'Update with arm movement: it never runs remotely. A trained person stays in the room and starts it at the device.'), min: 20, ort: d.ort, todo: [L('Raum leer, Tür zu', 'Room empty, door closed'), L('Start am Gerät drücken und dabeibleiben', 'Press start on the device and stay with it'), L('Ende bestätigen', 'Confirm the end')] },
    }[j.typ];
  };
  function jobNew(typ, id) {
    if (S.jobs.some((j) => j.typ === typ && j.dev === id && !j.done)) return;
    const j = { n: ++S.jobN, typ, dev: id, no: [], by: null, done: false };
    S.jobs.push(j);
    const to = offerTo(j);
    feed('dolmetscher', () => L(`Auftrag „${jobL(j).t}“ angelegt. ${to ? 'Gefragt wird zuerst die nächste freie Person im Dienst.' : 'Niemand im Dienst ist frei, der Auftrag liegt bei der Medizinphysik.'}`, `Job “${jobL(j).t}” created. ${to ? 'The nearest free person on duty is asked first.' : 'Nobody on duty is free, the job stays with medical physics.'}`));
  }
  /* Closes a job. A supervised update passes the same start rules as a remote one, except that it runs on site.
     A closed job keeps no record of who did it or who declined. */
  function jobDone(j) {
    if (j.typ === 'aufsicht') {
      const c = P.canStart({ art: 'vor-ort', freigabe: true, umgebungFrei: true, imEinsatz: P.inUse(dev(j.dev), 0, D.NOW, S.blocked), alarm: alarmNow(j.dev), paketGeprueft: true });
      if (!c.ok) { toast(L('Kein Start: ', 'No start: ') + gruende(c)); return false; }
      S.vorOrt[j.dev] = true;
    }
    // Plugged in by hand: the companion reports like after "stays plugged in". The start still passes startCheck.
    if (j.typ === 'strom') { const w = win(j.dev); S.plugged[j.dev] = true; if (w && w.status === 'geplant' && w.day === 0 && !S.rob) { w.needsRobot = false; ready(j.dev); } }
    j.done = true; j.by = null; j.no = [];
    if (j.typ === 'weg' && S.rob) { if (S.rob.hold === 'hindernis') S.rob.hold = null; if (S.rob.prev === 'hindernis') S.rob.prev = null; }
    // Someone has looked at the device and service takes over: the robot unplugs and drives back.
    if (j.typ === 'schauen' && S.rob && S.rob.id === j.dev) S.rob.fail = false;
    feed(['weg', 'strom'].includes(j.typ) ? 'bote' : 'waechter', () => ({
      strom: L(`${dev(j.dev).name} ist von Hand an Strom und Netz angeschlossen.`, `${dev(j.dev).name} has been connected to power and network by hand.`),
      weg: L('Flur B ist wieder frei. Der Roboter fährt weiter.', 'Corridor B is clear again. The robot drives on.'),
      schauen: L(`${dev(j.dev).name}: Rückmeldung von vor Ort liegt vor (Netzkabel steckt, Anzeige zeigt eine Fehlermeldung). Der Service übernimmt.`, `${dev(j.dev).name}: feedback from the site is in (power cable plugged in, the display shows an error message). Service takes over.`),
      aufsicht: L(`${dev(j.dev).name}: Update unter Aufsicht vor Ort gelaufen und zurückgemeldet. Version 4.2.1.`, `${dev(j.dev).name}: update ran on site under supervision and reported back. Version 4.2.1.`),
    }[j.typ]));
    return true;
  }

  /* Floor plan of the invented OR suite. The robot only uses corridors, never an operating room. */
  const ROOMS = [['Saal 1', 20, 20], ['Saal 2', 150, 20], ['Saal 3', 280, 20], ['Saal 4', 410, 20], ['Saal 5', 20, 180], ['Saal 6', 150, 180], ['Saal 7', 280, 180], ['Schockraum', 410, 180]];
  const DEVPOS = { 'C-01': [60, 60], 'C-02': [250, 60], 'C-03': [580, 70], 'C-04': [500, 60], 'C-05': [655, 55], 'C-06': [60, 240], 'C-07': [320, 240], 'C-08': [500, 240] };
  function floor(o) {
    const r = S.rob, [rx, ry] = robPos();
    const rooms = ROOMS.map(([n, x, y]) => `<rect class="rm" x="${x}" y="${y}" width="120" height="100" rx="6"/><text class="rl" x="${x + 8}" y="${y + 18}">${X(n)}</text>`).join('');
    const side = `<rect class="rm sv" x="610" y="20" width="90" height="70" rx="6"/><text class="rl" x="616" y="36">${L('Geräteraum', 'Equipment')}</text><rect class="rm sv" x="610" y="110" width="90" height="80" rx="6"/><text class="rl" x="616" y="126">${L('Werkstatt', 'Workshop')}</text><rect class="rm dk" x="610" y="215" width="90" height="65" rx="6"/><text class="rl" x="616" y="231">${L('Station', 'Dock')}</text>`;
    const cor = `<rect class="co" x="20" y="130" width="580" height="40" rx="4"/><rect class="co" x="560" y="20" width="40" height="260" rx="4"/><rect class="co" x="600" y="238" width="14" height="24"/><text class="cl" x="30" y="155">${X('Flur A')}</text><text class="cl" x="566" y="196" transform="rotate(-90 566 196)">${X('Flur B')}</text>`;
    const devs = D.DEVICES.map((d) => { const [x, y] = DEVPOS[d.id]; const w = win(d.id); return `<g class="dv${w && ['laeuft'].includes(w.status) ? ' upd' : ''}${w && w.status === 'fehl' ? ' bad' : ''}"><rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="4"/><text x="${x + 13}" y="${y + 4}">${d.name}</text></g>`; }).join('');
    const route = o.route && r && r.step < LAST_STEP ? `<polyline class="rt" points="${[DOCK].concat(DRIVE, [AT]).map((p) => p.join(',')).join(' ')}"/>` : '';
    const scan = o.route && r && r.step >= 4 && r.step <= REPORT_STEP && !r.man ? `<circle class="sc${r.step === 4 ? ' on' : ''}" cx="${AT[0]}" cy="${AT[1] - 17}" r="34"/>` : '';
    const bed = held(r, 'hindernis') ? `<g class="bed"><rect x="566" y="170" width="28" height="14" rx="3"/><text x="530" y="181">${L('Bett', 'Bed')}</text></g>` : '';
    const people = o.staff ? STAFF.filter((p) => p.x && ['frei', 'job'].includes(staffState(p).s)).map((p) => { const st = staffState(p).s; return `<g class="pp ${st}"><circle cx="${p.x}" cy="${p.y}" r="7"/><text x="${p.x > 600 || p.k === ME ? p.x - 11 : p.x + 11}" y="${p.y + 4}"${p.x > 600 || p.k === ME ? ' text-anchor="end"' : ''}>${p.k === ME ? L('du', 'you') : staffName(p).replace(/,.*| Spätdienst| Rufdienst/g, '')}</text></g>`; }).join('') : '';
    const robot = `<g class="rb${r && r.hold ? ' hold' : ''}"><circle cx="${rx}" cy="${ry}" r="10"/><text x="${rx}" y="${ry + 4}" text-anchor="middle">R</text></g>`;
    return `<svg class="map" viewBox="0 0 720 300" role="img" aria-label="${L('Grundriss des erfundenen OP-Trakts mit Roboter, Geräten und Personen im Dienst', 'Floor plan of the invented OR suite with robot, devices and people on duty')}">${cor}${rooms}${side}${route}${scan}${devs}${bed}${people}${robot}</svg>`;
  }
  /* What the robot "sees": outlines only. The demo never shows or stores a camera image. */
  function pov() {
    const r = S.rob, at = r && r.step >= 3 && r.step < 10 && !r.man;
    const box = (x, y, w, h, c, t) => `<rect class="bx ${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><text class="bt ${c}" x="${x + 4}" y="${y - 5}">${t}</text>`;
    let obj = '';
    if (held(r, 'hindernis')) obj += box(120, 96, 120, 62, 'warn', L('Bett, 1,2 m voraus', 'Bed, 1.2 m ahead'));
    if (at) obj += box(196, 50, 92, 112, 'ok', L(`C-Bogen ${r.id} erkannt`, `C-arm ${r.id} identified`));
    if (at && r.step >= 4) obj += `<path class="sw${r.step === 4 ? ' on' : ''}" d="M60 178 A150 60 0 0 1 300 178"/><text class="bt ok" x="16" y="196">${L('Personen im Umkreis von 2 m: keine', 'People within 2 m: none')}</text>`;
    if (at && r.step >= 5) obj += `<path class="cb" d="M180 176 C200 150 215 160 222 150"/>`;
    return `<svg class="pov" viewBox="0 0 360 204" role="img" aria-label="${L('Schematische Sicht des Roboters, nur Umrisse', 'Schematic view of the robot, outlines only')}"><path class="pl" d="M0 204 L130 70 L230 70 L360 204 M130 70 L130 20 M230 70 L230 20 M0 0 L130 20 M360 0 L230 20"/>${obj}</svg>`;
  }
  function vRoboter() {
    const r = S.rob, c3 = win('C-03'), d = dev(r ? r.id : 'C-03'), ctl = S.role === 'mp' || S.role === 'it';
    const wr = r ? win(r.id) : null, chk = wr && wr.status === 'bereit' ? startCheck(r.id) : null, pitch = S.mode === 'pitch';
    const steps = Array.from({ length: LAST_STEP + 1 }, (_, i) => { const s = stepL(i, d), cur = r && r.step === i && !(i === LAST_STEP); const done = r && (r.step > i || r.step >= LAST_STEP); return `<li class="${done ? 'done' : cur ? 'cur' : ''}"><div class="b">${done ? '✓' : i + 1}</div><div><b>${s[0]}</b><span>${s[1]}</span></div></li>`; }).join('');
    const scanned = r && r.step >= 5;
    const checks = [
      L('Keine Person im Umkreis von 2 m', 'No person within 2 m'), L('Fluchtweg bleibt mindestens 1,2 m breit', 'Escape route stays at least 1.2 m wide'),
      L('Gerät steht gebremst und kippt nicht', 'Device is braked and does not tip'), L('Kein Patient, kein steriler Bereich, kein OP-Saal', 'No patient, no sterile area, no operating room'),
      L('Steckdose frei, Kabel liegt nicht im Laufweg', 'Socket free, cable does not cross the walkway'),
    ].map((t) => `<li class="${scanned ? 'done' : r && r.step === 4 ? 'cur' : ''}"><div class="b">${scanned ? '✓' : '·'}</div><div><b>${t}</b></div></li>`).join('');
    let talk = L('Ich stehe an der Station und lade. Ein Einsatz beginnt erst, wenn die Medizinphysik ein Fenster freigegeben hat und mich losschickt.', 'I am at the dock, charging. A mission only begins once medical physics has released a window and sends me.');
    if (r) talk = {
      hindernis: L('Ein Bett steht im Flur B. Ich warte und halte den Fluchtweg frei. Soll ich jemanden in der Nähe um Hilfe bitten?', 'A bed stands in Corridor B. I wait and keep the escape route clear. Shall I ask someone nearby for help?'),
      funk: L('Ich habe keine Verbindung. Ich bleibe stehen, leuchte und fahre nicht blind weiter. Ein laufendes Update läuft am Gerät weiter.', 'I have no connection. I stand still, light up and do not drive on blind. A running update continues on the device.'),
      alarm: L('Alarm im Haus. Ich stehe an der Wand, der Flur ist frei. Ich fahre erst weiter, wenn die Medizinphysik oder die IT-Abteilung mich freigibt.', 'Alarm in the building. I stand at the wall, the corridor is clear. I only drive on once medical physics or the IT department releases me.'),
      halt: L('Not-Halt. Ich stehe, bis die Medizinphysik oder die IT-Abteilung mich wieder freigibt.', 'Emergency stop. I stand still until medical physics or the IT department releases me again.'),
    }[r.hold] || (r.man ? L('Du steuerst. Ich fahre höchstens Schritttempo und halte von selbst vor jedem Hindernis.', 'You are steering. I drive at walking pace at most and stop on my own before any obstacle.') : r.fail ? L(`${d.name} hat sich nicht zurückgemeldet. Ich bleibe hier, lasse alles eingesteckt und habe Hilfe angefragt.`, `${d.name} did not report back. I stay here, leave everything plugged in and have asked for help.`) : stepL(Math.min(r.step, LAST_STEP), d)[0] + '. ' + stepL(Math.min(r.step, LAST_STEP), d)[1] + '.');
    const kv = [
      [L('Betriebsart', 'Mode'), robMode()],
      [L('Tempo', 'Speed'), robMoving() ? L('0,8 m/s, höchstens 1,0 (Annahme)', '0.8 m/s, at most 1.0 (assumption)') : r && r.man ? L('von Hand, höchstens 0,5 m/s', 'by hand, at most 0.5 m/s') : '0 m/s'],
      [L('Akku', 'Battery'), (r ? 88 - Math.min(r.step, 10) : 96) + ' %'],
      [L('Verbindung', 'Connection'), held(r, 'funk') ? `<span class="pill risk">${L('getrennt', 'lost')}</span>` : `<span class="pill ok">${L('steht', 'up')}</span>`],
      [L('Kamera', 'Camera'), L('wird im Roboter ausgewertet, kein Bild wird gespeichert oder übertragen', 'processed inside the robot, no image is stored or transmitted')],
      [L('Auftrag', 'Order'), r ? `${d.id} ${d.name}, ${X(d.ort)}${win(r.id) ? ', ' + hm(win(r.id).from) + '–' + hm(win(r.id).to) : ''}` : L('keiner', 'none')],
    ].map((x) => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('');
    const arrows = r && r.man ? `<div class="pad" role="group" aria-label="${L('Roboter von Hand steuern', 'Steer the robot by hand')}">${[['n', '↑', L('vor', 'forward')], ['w', '←', L('links', 'left')], ['e', '→', L('rechts', 'right')], ['s', '↓', L('zurück', 'back')]].map((a) => `<button class="btn ${a[0]}" data-act="steer" data-a="${a[0]}" aria-label="${a[2]}">${a[1]}</button>`).join('')}</div>` : '';
    const ctrl = `<div class="row"><button class="btn risk" data-act="rhalt" ${!r || r.hold === 'halt' || r.step >= LAST_STEP ? 'disabled' : ''}>${L('Not-Halt', 'Emergency stop')}</button>
      ${r && ['halt', 'alarm'].includes(r.hold) ? `<button class="btn primary" data-act="rgo" ${ctl ? '' : 'disabled'}>${L('Wieder freigeben', 'Release again')}</button>` : ''}
      ${r && !r.man ? `<button class="btn" data-act="rman" ${ctl && !r.hold && r.step < LAST_STEP && !robPlugged(r) ? '' : 'disabled'}>${L('Steuerung übernehmen', 'Take over steering')}</button>` : ''}
      ${r && r.man ? `<button class="btn primary" data-act="rauto">${L('Zurück an die Automatik', 'Back to automatic')}</button>` : ''}</div>${arrows}
      ${r && r.hold === 'hindernis' ? `<div class="row"><button class="btn primary" data-act="jobnew" data-a="weg:${r.id}" ${S.jobs.some((j) => j.typ === 'weg' && !j.done) ? 'disabled' : ''}>${L('Hilfe in der Nähe anfragen', 'Ask for help nearby')}</button><button class="btn" data-act="rclear">${L('Vorspulen: Flur ist wieder frei', 'Fast forward: corridor is clear again')}</button></div>` : ''}
      ${r && r.hold === 'funk' ? `<button class="btn" data-act="rclear">${L('Vorspulen: Verbindung ist wieder da', 'Fast forward: connection is back')}</button>` : ''}
      <div class="small muted">${L('Not-Halt darf jede Rolle drücken. Freigeben und von Hand steuern dürfen nur Medizinphysik und IT-Abteilung.', 'Any role may press the emergency stop. Only medical physics and the IT department may release it and steer by hand.')}</div>
      <div class="row"><span class="small muted">${L('Zum Ausprobieren:', 'To try out:')}</span><button class="btn sm" data-act="robst" ${r && !r.hold && !r.man && r.step <= 2 ? '' : 'disabled'}>${L('Bett im Flur', 'Bed in the corridor')}</button><button class="btn sm" data-act="rfunk" ${r && !r.hold && r.step < LAST_STEP ? '' : 'disabled'}>${L('Verbindung trennen', 'Cut the connection')}</button></div>`;
    const never = [
      L('Er fährt in keinen OP-Saal und in keinen sterilen Bereich.', 'It never enters an operating room or a sterile area.'),
      L('Er startet kein Update selbst. Den Start bestätigt immer ein Mensch.', 'It never starts an update itself. A human always confirms the start.'),
      L('Er löst keine Strahlung aus und bewegt keinen C-Bogen.', 'It never triggers radiation and never moves a C-arm.'),
      L('Er fährt nie schneller als Schritttempo und hält vor jedem Hindernis.', 'It never drives faster than walking pace and stops before any obstacle.'),
      L('Er versperrt keinen Fluchtweg und macht bei einem Alarm Platz.', 'It never blocks an escape route and makes way during an alarm.'),
      L('Er speichert keine Bilder. Menschen erkennt er nur als Umriss.', 'It stores no images. It recognises people as outlines only.'),
      L('Ohne Verbindung bleibt er stehen, statt blind weiterzufahren.', 'Without a connection it stands still instead of driving on blind.'),
    ].map((t) => `<li>${t}</li>`).join('');
    // On stage the sequence is what the audience follows, so the pitch shows it first.
    const seq = `<section class="card"><h2>${L('Wartungsablauf', 'Maintenance sequence')}</h2><ol class="steps seq">${steps}</ol></section>`;
    return `<div class="head">${ketty(104, 'hero')}<div><div class="eyebrow">${L('Roboter', 'Robot')}</div><h1>${L('C-ARMAGOTCHI in Aktion', 'C-ARMAGOTCHI in action')}</h1><p>${L('Der Bote fährt den Wartungsablauf selbstständig ab. Von hier aus sieht man, was er sieht, und kann jederzeit anhalten oder von Hand übernehmen.', 'The Courier runs the maintenance sequence on its own. From here you see what it sees and can stop it or take over by hand at any time.')}</p></div>
      <div class="r">${!r && c3 && c3.status === 'geplant' && c3.day === 0 ? `<button class="btn primary" data-act="robot" data-a="C-03" ${S.role === 'nurse' ? 'disabled' : ''}>${L('Roboter zu Cio schicken', 'Send the robot to Cio')}</button>` : ''}${chk ? `<button class="btn primary" data-act="start" data-a="${r.id}" ${ctl && chk.ok ? '' : 'disabled'}>${L(`Start um ${hm(wr.from)} bestätigen`, `Confirm start at ${hm(wr.from)}`)}</button>${pitch ? '' : `<button class="btn" data-act="tosel" data-a="${r.id}">${L('Zur Bestätigung auf der Tafel', 'To the confirmation on the board')}</button>`}` : ''}</div></div>
      <div class="banner"><span class="who">${hn('bote')}</span><span>${talk}</span></div>
      ${chk && !chk.ok ? `<div class="small" style="color:var(--risk);margin-bottom:12px">${L('Start gesperrt: ', 'Start locked: ')}${gruende(chk)}</div>` : ''}
      ${wr && wr.status === 'laeuft' ? `<div class="banner run">${pet(mood(d), 64)}<span><b>${L(`Update 4.2.1 läuft auf ${d.name}, fertig ${hm(wr.to)}.`, `Update 4.2.1 is running on ${d.name}, done at ${hm(wr.to)}.`)}</b> ${L('Am Gerät steht groß: nicht ausstecken.', 'The device shows in large letters: do not unplug.')}</span><div class="prog"><i></i></div></div>` : ''}
      ${wr && wr.status === 'fertig' ? `<div class="banner back">${ketty(64)}${pet(mood(d), 64)}<span><b>${L(`${d.name} hat sich um ${hm(wr.to - 8)} zurückgemeldet. Version 4.2.1.`, `${d.name} reported back at ${hm(wr.to - 8)}. Version 4.2.1.`)}</b> ${L('Logs übertragen, ohne Patientendaten. Niemand hat telefoniert.', 'Logs transferred, without patient data. Nobody made a call.')}</span></div>` : ''}
      <div class="grid g64"><div class="stack">
        <section class="card"><h2>${L('Wo er gerade ist', 'Where it is right now')}</h2>${floor({ route: true })}<div class="legend"><span><i style="background:var(--ai)"></i>${L('Roboter', 'Robot')}</span><span><i style="background:var(--busy)"></i>${L('C-Bogen', 'C-arm')}</span><span><i style="background:var(--sunk);border:1px solid var(--line)"></i>${L('OP-Säle: kein Zutritt für den Roboter', 'Operating rooms: no entry for the robot')}</span></div></section>
        <section class="card"><h2>${L('Was er sieht', 'What it sees')}</h2><div class="twin">${pov()}<div><h3>${L('Umgebungsscan', 'Surroundings scan')}</h3><ol class="steps tight">${checks}</ol><p class="small muted">${L('Erst wenn alle fünf Punkte erfüllt sind, meldet er „Umgebung frei“. Ändert sich etwas, zieht er die Meldung zurück. Abstände sind Annahmen.', 'Only when all five points are met does it report “surroundings clear”. If something changes, it withdraws the report. Distances are assumptions.')}</p></div></div></section>
        ${robSkills()}<section class="card"><h2>${L('Was der Roboter nie tut', 'What the robot never does')}</h2><ol class="rules">${never}</ol></section></div>
      <div class="stack">
        ${pitch ? seq : ''}<section class="card"><h2>${L('Fernsteuerung', 'Remote control')}</h2><div class="stack">${ctrl}</div></section>
        <section class="card"><h2>${L('Zustand', 'State')}</h2><dl class="kv">${kv}</dl></section>
        ${pitch ? '' : seq}
      </div></div>`;
  }

  /* Job offers for the person at the device: one at a time, only when on duty and free. */
  function offerCards() {
    if (S.role !== 'nurse' || S.me !== 'frei') return '';
    return S.jobs.filter((j) => !j.done).map((j) => {
      const t = jobL(j), to = offerTo(j);
      if (j.by === ME) return `<div class="offer mine" role="status"><div><div class="who">${L('Dein Auftrag', 'Your job')} · ${X(t.ort)}</div><b>${t.t}</b><ol>${t.todo.map((x) => `<li>${x}</li>`).join('')}</ol></div><div class="row"><button class="btn primary" data-act="jobdone" data-a="${j.n}">${L('Erledigt', 'Done')}</button></div></div>`;
      if (!to || to.k !== ME) return '';
      return `<div class="offer" role="alert"><div><div class="who">${L('Neuer Auftrag in deiner Nähe', 'New job near you')} · ${X(t.ort)} · ${dist(staff(ME), j)} m · ${L(`etwa ${t.min} Minuten`, `about ${t.min} minutes`)}</div><b>${t.t}</b><div class="small">${t.b}</div><div class="small muted">${L(`Du wirst gefragt, weil du im Dienst, laut Plan frei${j.typ === 'aufsicht' ? ', eingewiesen' : ''} und für diesen Auftrag am nächsten bist. Ablehnen braucht keinen Grund und hat keine Folgen, dann wird die nächste Person gefragt.`, `You are asked because you are on duty, free per roster${j.typ === 'aufsicht' ? ', trained' : ''} and the nearest for this job. Declining needs no reason and has no consequences, the next person is asked then.`)}</div></div><div class="row"><button class="btn primary" data-act="jobacc" data-a="${j.n}">${L('Annehmen', 'Accept')}</button><button class="btn" data-act="jobdec" data-a="${j.n}">${L('Passt gerade nicht', 'Not right now')}</button></div></div>`;
    }).join('');
  }
  const meSeg = () => `<div class="seg" style="margin-left:0" role="group" aria-label="${L('Meine Lage', 'My situation')}">${[['frei', L('Im Dienst und frei', 'On duty and free')], ['eingriff', L('Im Eingriff', 'In a procedure')], ['aus', L('Nicht im Dienst', 'Off duty')]].map((x) => `<button class="${S.me === x[0] ? 'on' : ''}" data-act="me" data-a="${x[0]}" aria-pressed="${S.me === x[0]}">${x[1]}</button>`).join('')}</div>`;

  /* Control room for the planning side: who is asked, who is not, and why. */
  function vLeitstand() {
    const open = S.jobs.filter((j) => !j.done), free = STAFF.filter((p) => staffState(p).s === 'frei').length, quiet = STAFF.filter((p) => ['busy', 'off'].includes(staffState(p).s)).length;
    const k = [
      [open.length, L('offene Aufträge', 'open jobs'), L('Dinge, die ein Mensch vor Ort tun muss', 'things a human has to do on site')],
      [free, L('Personen im Dienst und frei', 'people on duty and free'), L('nur sie werden gefragt', 'only they are asked')],
      [quiet, L('Personen, die nichts davon sehen', 'people who see none of this'), L('im Eingriff oder nicht im Dienst', 'in a procedure or off duty')],
      [S.jobs.filter((j) => j.done).length, L('Aufträge erledigt', 'jobs done'), L('gezählt je Schicht, nie je Person', 'counted per shift, never per person')],
    ];
    const jobs = S.jobs.length ? S.jobs.slice().reverse().map((j) => {
      const t = jobL(j), to = offerTo(j), who = j.by ? staff(j.by) : null;
      const st = j.done ? [L('erledigt', 'done'), 'ok'] : who ? [L('angenommen', 'accepted'), 'warn'] : to ? [L('angefragt', 'offered'), 'ai'] : [L('niemand erreichbar', 'nobody available'), 'risk'];
      const line = j.done ? L('Erledigt. Wer es war, wird nicht festgehalten.', 'Done. Who did it is not recorded.') : who ? L(`Angenommen von ${who.de}, etwa ${dist(who, j)} m Weg.`, `Accepted by ${who.en}, about ${dist(who, j)} m to walk.`) : to ? L(`Gefragt wird ${to.k === ME ? 'gerade die Person am Gerät (' + to.de + ')' : to.de}, etwa ${dist(to, j)} m Weg.`, `Asking ${to.k === ME ? 'the person at the device right now (' + to.en + ')' : to.en}, about ${dist(to, j)} m to walk.`) : L(`Im Moment kann niemand${JOB_FN[j.typ] ? ' mit Einweisung' : ''} gefragt werden. Der Auftrag bleibt bei dir: warten, zurückziehen oder den Service rufen.`, `Right now nobody${JOB_FN[j.typ] ? ' with the training' : ''} can be asked. The job stays with you: wait, withdraw it or call service.`);
      return `<div class="dec${j.done ? '' : ' ai'}"><div class="row"><h3 style="margin:0">${t.t}</h3><span class="pill ${st[1]}">${st[0]}</span></div><div class="small">${X(t.ort)} · ${L(`etwa ${t.min} Minuten`, `about ${t.min} minutes`)} · ${line}</div>${j.done ? '' : `<div class="row">${!who && to && to.k === ME ? `<span class="small muted">${L('Die Antwort gibt die Person selbst, in der Ansicht „Person am Gerät“.', 'The person answers themselves, in the view “Person at the device”.')}</span>` : ''}${!who && to && to.k !== ME ? `<button class="btn sm" data-act="jobsim" data-a="${j.n}">${L(`Vorspulen: ${to.de} nimmt an`, `Fast forward: ${to.en} accepts`)}</button><button class="btn sm" data-act="jobskip" data-a="${j.n}">${L('Vorspulen: lehnt ab', 'Fast forward: declines')}</button>` : ''}${who && who.k !== ME ? `<button class="btn sm" data-act="jobfin" data-a="${j.n}">${L('Vorspulen: erledigt', 'Fast forward: done')}</button>` : ''}${!who ? `<button class="btn sm" data-act="jobdrop" data-a="${j.n}" ${S.role === 'mp' ? '' : 'disabled'}>${L('Auftrag zurückziehen', 'Withdraw the job')}</button>` : ''}</div>`}</div>`;
    }).join('') : `<div class="small muted">${L('Im Moment muss kein Mensch etwas vor Ort tun. Aufträge entstehen, wenn der Roboter nicht weiterkommt, ein Gerät sich nicht zurückmeldet oder ein Update Aufsicht braucht.', 'Right now no human has to do anything on site. Jobs arise when the robot gets stuck, a device does not report back or an update needs supervision.')}</div>`;
    const rows = STAFF.filter((p) => ['frei', 'job'].includes(staffState(p).s)).map((p) => { const s = staffState(p); const lab = { frei: [L('wird gefragt', 'is asked'), 'ok'], job: [L('hat einen Auftrag', 'has a job'), 'warn'] }[s.s]; return `<tr><td><b>${staffName(p)}</b>${p.k === ME ? ` <span class="small muted">(${L('Ansicht „Person am Gerät“', 'view “Person at the device”')})</span>` : ''}</td><td>${X(p.ort)}</td><td class="muted">${s.why}</td><td><span class="pill ${lab[1]}">${lab[0]}</span></td></tr>`; }).join('') +
      `<tr><td colspan="4" class="muted">${L(`${quiet} weitere Personen sind im Eingriff oder nicht im Dienst. Sie sehen keine Anfrage und stehen hier nicht einzeln.`, `${quiet} more people are in a procedure or off duty. They see no request and are not listed here one by one.`)}</td></tr>`;
    const rules = [
      L('Gefragt wird nur, wer im Dienst ist und laut Plan frei hat. Alle anderen sehen den Auftrag gar nicht.', 'Only those on duty and free per roster are asked. Everyone else never sees the job.'),
      L('Immer nur eine Person zur Zeit, die nächste zuerst. Niemand bekommt zwei Anfragen gleichzeitig.', 'Only one person at a time, the nearest first. Nobody gets two requests at once.'),
      L('Ablehnen braucht keinen Grund und wird nicht ausgewertet. Ist ein Auftrag erledigt, wird gelöscht, wer ihn hatte und wer abgelehnt hat.', 'Declining needs no reason and is not evaluated. Once a job is done, who had it and who declined is deleted.'),
      L('Der Rufdienst wird erst gefragt, wenn sonst niemand kann.', 'The on-call service is only asked when nobody else can.'),
      L('Aufsicht bei einem Update mit Armbewegung geht nur an eingewiesene Funktionen (Annahme: MTR und Medizintechnik).', 'Supervising an update with arm movement only goes to trained functions (assumption: radiographers and clinical engineering).'),
      L('Der Standort ist der eingeteilte Bereich aus dem Dienstplan, keine Ortung von Personen. Der Weg ist daraus geschätzt.', 'The location is the rostered area from the duty roster, not tracking of people. The distance is estimated from it.'),
      L('Gezählt wird je Schicht, nie je Person. Es gibt keine Rangliste.', 'Counts are per shift, never per person. There is no ranking.'),
      L('Vor einem echten Einsatz gehört das in eine Vereinbarung mit Personalrat und Datenschutz.', 'Before real use this belongs in an agreement with the staff council and data protection.'),
    ].map((t) => `<li>${t}</li>`).join('');
    const rudi = !aktuell(dev('C-06')) && !S.jobs.some((j) => j.typ === 'aufsicht' && !j.done);
    const c3 = win('C-03'), hand = c3 && c3.status === 'geplant' && c3.day === 0 && c3.needsRobot && !S.rob && !S.jobs.some((j) => j.typ === 'strom' && !j.done);
    return `<div class="head"><div><div class="eyebrow">${L('Leitstand', 'Control room')}</div><h1>${L('Alles auf einen Blick: Geräte, Roboter, Menschen in der Nähe', 'Everything at a glance: devices, robot, people nearby')}</h1><p>${L('Was der Roboter nicht allein schafft, geht als Auftrag an die nächste freie Person im Dienst, so wie eine Fahrt bei einem Fahrdienst. Wer keine Zeit oder keinen Dienst hat, sieht davon nichts.', 'What the robot cannot do alone goes as a job to the nearest free person on duty, like a ride at a ride-hailing service. Those without time or off duty see none of it.')}</p></div>
      <div class="r">${hand ? `<button class="btn" data-act="jobnew" data-a="strom:C-03" ${S.role === 'mp' ? '' : 'disabled'}>${L('Eine Hand für Cio anfragen', 'Ask for a hand for Cio')}</button>` : ''}${rudi ? `<button class="btn" data-act="jobnew" data-a="aufsicht:C-06" ${S.role === 'mp' ? '' : 'disabled'}>${L('Aufsicht für Rudis Update anfragen', 'Request supervision for Rudi’s update')}</button>` : ''}</div></div>
      <div class="kpis k4">${k.map((x) => `<div class="kpi"><b class="num">${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></div>`).join('')}</div>
      <div class="grid g64"><div class="stack">
        <section class="card"><h2>${L('Lage im OP-Trakt', 'Situation in the OR suite')}</h2>${floor({ route: true, staff: true })}<div class="legend"><span><i style="background:var(--ai)"></i>${L('Roboter', 'Robot')}</span><span><i style="background:var(--ok)"></i>${L('im Dienst und frei', 'on duty and free')}</span><span><i style="background:var(--gold-line)"></i>${L('hat einen Auftrag', 'has a job')}</span><span><i style="background:var(--busy)"></i>${L('C-Bogen', 'C-arm')}</span></div><p class="small muted" style="margin-top:8px">${L('Wer im Eingriff oder nicht im Dienst ist, erscheint nicht auf der Karte. Roboter: ', 'People in a procedure or off duty do not appear on the map. Robot: ')}${robMode()}. <button class="lnk" data-act="go" data-a="roboter">${L('Zum Roboter', 'To the robot')}</button></p></section>
        <section class="card"><h2>${L('Wer wird gefragt, wer nicht', 'Who is asked and who is not')}</h2><div class="tw"><table><thead><tr><th>${L('Funktion', 'Function')}</th><th>${L('Bereich', 'Area')}</th><th>${L('Lage', 'Situation')}</th><th>${L('Anfragen', 'Requests')}</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>
      <div class="stack">
        <section class="card"><h2>${L('Aufträge für Menschen', 'Jobs for people')}</h2><div class="stack">${jobs}</div></section>
        <section class="card"><h2>${L('Regeln für Anfragen', 'Rules for requests')}</h2><ol class="rules">${rules}</ol></section>
      </div></div>`;
  }

  /* ---------- platform picture for the challenge owners ----------
     Overview page, one clickable area per further service and the wider picture around the machine.
     Only the software update is built. Everything else here is an outlook and says so on screen. */
  const out = () => `<span class="pill ai">${L('Ausblick', 'Outlook')}</span>`;
  const HYP = () => [
    [L('Das Fenster ist der Engpass, nicht die Technik.', 'The window is the bottleneck, not the technology.'), L('Updates bleiben liegen, weil niemand die rund 120 Minuten findet, nicht weil der Download fehlt.', 'Updates are left undone because nobody finds the roughly 120 minutes, not because the download is missing.')],
    [L('Niemand ist zuständig, also ist am Ende jemand schuld.', 'Nobody is in charge, so in the end somebody is to blame.'), L('Bekommt jede Rolle genau eine kleine Entscheidung, verschwindet die Schuldfrage.', 'If each role gets exactly one small decision, the question of blame goes away.')],
    [L('Dasselbe Fenster trägt mehrere Dienste.', 'The same window carries several services.'), L('Update, Prüfung, Servicetermin und Einweisung lassen sich bündeln.', 'Update, check, service visit and instruction can be bundled.')],
    [L('Am geparkten Gerät fehlt nur Physisches.', 'A parked device only lacks physical things.'), L('Strom, Einschalten, Netz. Das liefert ein Begleiter oder ein Roboter, ohne den C-Bogen zu verändern.', 'Power, switching on, network. A companion or a robot provides that without changing the C-arm.')],
    [L('Ein vorbereiteter Servicetermin spart die zweite Anfahrt.', 'A prepared service visit saves the second trip.'), L('Der Vorab-Check stellt sicher, dass der Techniker nicht umsonst kommt, und sagt der Klinik, was sie vorbereitet.', 'The pre-visit check makes sure the technician does not come for nothing and tells the hospital what to prepare.')],
    [L('Die Klinik gibt Belegung und Dienste frei, wenn keine Patientendaten nötig sind.', 'The hospital shares schedule and rosters if no patient data is needed.'), L('Saal, Zeit, Gerät und Rolle reichen.', 'Room, time, device and role are enough.')],
    [L('Menschen nehmen kleine Aufträge an, wenn Ablehnen nichts kostet.', 'People accept small jobs if declining costs nothing.'), L('Gefragt wird nur, wer im Dienst und frei ist. Niemand wird ausgewertet.', 'Only those on duty and free are asked. Nobody is evaluated.')],
  ];
  /* Platform map: who carries each of the six steps for each service. 'h:' marks a human decision. */
  const STEPS6 = () => [L('Erkennen', 'Notice'), L('Planen', 'Plan'), L('Vorbereiten', 'Prepare'), L('Ausführen', 'Carry out'), L('Prüfen', 'Verify'), L('Lernen, belegen', 'Learn, document')];
  const ACTOR = { beg: () => L('Begleiter', 'Companion'), akte: () => L('Geräteakte', 'Device file'), lotse: () => hn('lotse'), bote: () => hn('bote'), waechter: () => hn('waechter'), empfang: () => L('Empfang', 'Front desk'), coach: () => 'Coach', chron: () => L('Chronist', 'Chronicler'), lager: () => L('Lagerist', 'Storekeeper'),
    mp: () => role('mp'), it: () => role('it'), nurse: () => role('nurse'), tech: () => L('Techniker', 'Technician'), pruef: () => L('Prüfer vor Ort', 'Inspector on site'), klinik: () => L('Klinik gibt frei', 'Hospital releases'), nah: () => L('Person in der Nähe', 'Person nearby') };
  const PMAP = () => [
    { n: L('Software-Updates', 'Software updates'), st: ['org', L('gebaut', 'built')], go: 'tafel', c: ['beg', 'lotse', 'bote', 'h:mp', 'waechter', 'akte'], b: L('Das Killer-Feature: Fenster finden, Gerät bereit machen, ein Mensch bestätigt.', 'The killer feature: find the window, get the device ready, one human confirms.') },
    { n: L('Wartung und Prüfungen', 'Maintenance and checks'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'wartung', c: ['akte', 'lotse', 'bote', 'h:pruef', 'waechter', 'chron'], b: L('Im selben Fenster wie das Update: ein Termin statt zwei.', 'In the same window as the update: one appointment instead of two.') },
    { n: L('Servicetermine', 'Service visits'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'termin', c: ['beg', 'lotse', 'empfang', 'h:tech', 'waechter', 'chron'], b: L('Vorab-Check: Der Techniker kommt nicht umsonst, die Klinik weiß, was sie vorbereitet.', 'Pre-visit check: the technician does not come for nothing, the hospital knows what to prepare.') },
    { n: L('Einweisung und Fortbildung', 'Instruction and training'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'lernen', c: ['akte', 'coach', 'coach', 'h:nurse', 'coach', 'chron'], b: L('Zwei Minuten „Was ist neu“ am Gerät, Nachweis vorbereitet.', 'Two minutes of “What is new” at the device, record prepared.') },
    { n: L('Weitere Roboter-Dienste', 'Further robot services'), st: ['ai', L('Ausblick', 'Outlook')], go: 'roboter', c: ['beg', 'lotse', 'lager', 'h:mp', 'waechter', 'akte'], b: L('Logs, Akkupflege, Abendrunde, Teile bringen: eine Nachtschicht für die ganze Flotte.', 'Logs, battery care, evening round, bringing parts: one night shift for the whole fleet.') },
    { n: L('Gerät am richtigen Ort', 'Device in the right place'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'ort', c: ['akte', 'lotse', 'lotse', 'h:nah', 'waechter', 'akte'], b: L('Abgleich mit dem OP-Plan von morgen: Was um 7:30 gebraucht wird, steht schon dort.', 'Matched against tomorrow’s OR schedule: what is needed at 7:30 is already there.') },
    { n: L('Nachweise', 'Records'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'nachweis', c: ['akte', 'chron', 'chron', 'h:it', 'chron', 'chron'], b: L('Patch-Stand und Prüfungen auf Knopfdruck belegen, für IT-Sicherheit und Audits. Ein Muster.', 'Show patch level and checks at the push of a button, for IT security and audits. A sample.') },
    { n: L('Rückkanal zum Hersteller', 'Return channel to the manufacturer'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'hersteller', c: ['beg', 'lotse', 'chron', 'h:klinik', 'waechter', 'akte'], b: L('Flottenwissen ohne Patientendaten, für vorausschauenden Service und Entwicklung.', 'Fleet knowledge without patient data, for predictive service and development.') },
    { n: L('Andere Gerätetypen', 'Other device types'), st: ['ai', L('Ausblick', 'Outlook')], go: 'dienste', tab: 'typen', c: ['beg', 'lotse', 'bote', 'h:mp', 'waechter', 'akte'], b: L('Dieselben sechs Schritte für mobile Röntgengeräte, Ultraschall und mehr.', 'The same six steps for mobile X-ray units, ultrasound and more.') },
  ];
  /* [who, quote, worry, what IA takes over, what stays with the person, how they notice success] */
  const PEOPLE = () => [
    [role('nurse'), L('„Das Gerät läuft, wenn der Patient auf dem Tisch liegt. Mehr will ich damit nicht zu tun haben.“', '“The device works when the patient is on the table. I want nothing more to do with it.”'), L('Sie war die Letzte am Gerät, wenn etwas schiefgeht.', 'She is the last one at the device when something goes wrong.'), L('Planung, Start, Überwachung.', 'Planning, start, monitoring.'), L('Höchstens ein Handgriff, freiwillig.', 'One simple action at most, voluntary.'), L('Niemand ruft sie wegen eines Updates an.', 'Nobody calls her about an update.')],
    [role('mp'), L('„Ich will belegen können, dass jedes Gerät sicher, geprüft und aktuell ist, ohne hinterherzutelefonieren.“', '“I want to be able to show that every device is safe, checked and up to date, without chasing people by phone.”'), L('Ein Gerät fehlt morgens nach einem Update.', 'A device is missing in the morning after an update.'), L('Fenster suchen, Ersatz benennen, Rückmeldung überwachen.', 'Finding windows, naming a replacement, watching the report.'), L('Fenster freigeben, Start bestätigen.', 'Release the window, confirm the start.'), L('Der Montag beginnt mit erledigten Updates statt mit einer Telefonliste.', 'Monday starts with finished updates instead of a call list.')],
    [role('it'), L('„Kein ungepatchtes Gerät in meinem Netz, und ich will es zeigen können.“', '“No unpatched device in my network, and I want to be able to show it.”'), L('Zu langsam gepatcht oder den OP gestört.', 'Patched too slowly, or disrupted the OR.'), L('Fristen im Blick, Patch-Stand, Nachweis.', 'Deadlines in view, patch level, records.'), L('Die Frist setzen.', 'Set the deadline.'), L('Der Patch-Stand der Flotte steht auf einer Seite.', 'The patch level of the fleet is on one page.')],
    [L('Servicetechniker', 'Service technician'), L('„Einmal hinfahren und es lösen.“', '“Go there once and fix it.”'), L('Gerät im Einsatz, nicht auffindbar oder falsches Teil dabei.', 'Device in use, not to be found, or the wrong part.'), L('Der Vorab-Check: Fehlerbild, Logs, Zugang, Fenster, Teil.', 'The pre-visit check: symptom, logs, access, window, part.'), L('Zusagen und reparieren.', 'Accept and repair.'), L('Er steht vor einem freien Gerät, und jemand weiß, dass er kommt.', 'He stands in front of a free device, and someone knows he is coming.')],
    [L('Flottenteam beim Hersteller', 'Fleet team at the manufacturer'), L('„Die Flotte ist aktuell, und ich erfahre von Problemen, bevor jemand anruft.“', '“The fleet is up to date, and I hear about problems before anyone calls.”'), L('Fehlschläge kommen als verärgerter Anruf.', 'Failures arrive as an angry phone call.'), L('Log-Strom, Stand je Gerät, Meldung bei ausbleibender Rückmeldung.', 'Log stream, status per device, alert when a report is missing.'), L('Pakete freigeben und zurückrufen.', 'Release and recall packages.'), L('Sie ruft die Klinik an, nicht umgekehrt.', 'She calls the hospital, not the other way round.')],
    [L('OP-Koordination', 'OR coordination'), L('„Der Saal läuft nach Plan, und das Gerät steht bereit.“', '“The room runs to plan, and the device is ready.”'), L('Ein Eingriff verschiebt sich wegen eines Geräts.', 'A procedure is delayed because of a device.'), L('Kein Fenster berührt einen Eingriff, bei Alarm wird umgeplant.', 'No window touches a procedure, an alarm triggers replanning.'), L('Nichts. Das ist das Ziel.', 'Nothing. That is the goal.'), L('Sie merkt nichts.', 'She notices nothing.')],
    [L('Klinikleitung und Einkauf', 'Hospital management and purchasing'), L('„Verfügbare Geräte, belegbare Sicherheit, planbare Kosten.“', '“Available devices, provable security, predictable costs.”'), L('Ein Ausfall oder ein Sicherheitsvorfall, für den niemand zuständig war.', 'An outage or a security incident nobody was in charge of.'), L('Nachweise und Verfügbarkeit je Gerät, ohne Zusatzaufwand im OP.', 'Records and availability per device, without extra work in the OR.'), L('Entscheiden, ob Begleiter oder Roboter zum Haus passt.', 'Decide whether companion or robot fits the hospital.'), L('Der Servicevertrag wird eingehalten, und sie kann es zeigen.', 'The service contract is met, and they can show it.')],
  ];
  const LAYERS = () => [
    [L('Am Gerät', 'At the device'), [L('C-Bogen, unverändert', 'C-arm, unchanged'), L('Begleiter: Akku, Netz, Anzeige', 'Companion: battery, network, display'), L('Roboter: Strom, Paket, Umgebung', 'Robot: power, package, surroundings')], 'dev'],
    [L('Plattform IA', 'Platform IA'), [L('Geräteakte', 'Device file'), L('Kalender der Fenster', 'Calendar of windows'), L('Feste Regeln, getestet', 'Fixed rules, tested'), L('KI-Helfer', 'AI helpers'), L('Protokoll jeder Entscheidung', 'Record of every decision')], 'ia'],
    [L('Systeme der Klinik', 'Hospital systems'), [L('OP-Planung: Saal, Zeit, Gerät', 'OR scheduling: room, time, device'), L('Dienstplan: Rolle, Schicht, Bereich', 'Roster: role, shift, area'), L('Alarmierung', 'Alarm system')], 'kl'],
    [L('Hersteller', 'Manufacturer'), [L('Flottenportal: Softwarestand, Pakete', 'Fleet portal: software version, packages'), L('Kundendienst: Termine, Teile', 'Customer service: visits, parts'), L('Schulungsinhalte', 'Training content')], 'he'],
  ];
  /* The helper circle, after the crew picture in the Goebel OS click dummy: helpers around the platform,
     work flows to the centre, people decide. Filled nodes are shown in the dummy, hollow ones are an outlook. */
  function crew() {
    const W = 720, H = 400, cx = 360, cy = 200, R = 138, core = 60;
    const hs = [[hn('bote'), L('Roboter und Begleiter', 'Robot and companion'), 1], [hn('waechter'), L('Rückmeldung', 'Reports back'), 1], [hn('dolmetscher'), L('eine Frage je Rolle', 'one question per role'), 1],
      [L('Empfang', 'Front desk'), L('Servicetermine', 'Service visits'), 0], ['Coach', L('Einweisung', 'Instruction'), 0], [L('Chronist', 'Chronicler'), L('Nachweise', 'Records'), 0], [L('Lagerist', 'Storekeeper'), L('Teile', 'Parts'), 0]];
    let back = '', front = '';
    hs.forEach((h, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / hs.length, c = Math.cos(a), s = Math.sin(a);
      const nx = cx + R * c, ny = cy + R * s, ex = cx + (core + 6) * c, ey = cy + (core + 6) * s;
      const lx = cx + (R + 16) * c, ly = cy + (R + 16) * s, anc = Math.abs(c) < 0.3 ? 'middle' : c > 0 ? 'start' : 'end', dy = Math.abs(c) < 0.3 ? (s < 0 ? -22 : 20) : 0;
      back += `<line class="spoke" x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}"/>`;
      if (h[2]) back += `<line class="flow" x1="${nx.toFixed(1)}" y1="${ny.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" style="animation-delay:-${(i * 0.37).toFixed(2)}s"/>`;
      front += `${h[2] ? `<circle class="pulse" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" style="animation-delay:-${(i * 0.29).toFixed(2)}s"/>` : ''}<circle class="n${h[2] ? ' on' : ''}" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="8.500"/>
        <text class="lab" x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anc}">${h[0]}</text><text class="sub" x="${lx.toFixed(1)}" y="${(ly + dy + 14).toFixed(1)}" text-anchor="${anc}">${h[1]}</text>`;
    });
    const people = [[role('nurse'), 96, 44], [role('mp'), 624, 44], [role('it'), 96, 356], [L('Techniker', 'Technician'), 624, 356]].map(([n, x, y]) => {
      const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy), ex = cx - dx / d * (core + 8), ey = cy - dy / d * (core + 8), sx = x + dx / d * 30, sy = y + dy / d * 18;
      return `<line class="hl" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/><rect class="hb" x="${x - 76}" y="${y - 15}" width="152" height="30" rx="15"/><text class="ht" x="${x}" y="${y + 5}" text-anchor="middle">${n}</text>`;
    }).join('');
    return `<div class="crew"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Der Lotse dirigiert sieben Helfer rund um die Plattform, vier Rollen entscheiden', 'The Pilot conducts seven helpers around the platform, four roles decide')}">
      <circle class="ring2" cx="${cx}" cy="${cy}" r="${core + 34}"/><circle class="ring" cx="${cx}" cy="${cy}" r="${R}"/>${back}${people}
      <circle class="hubr" cx="${cx}" cy="${cy}" r="${core + 6}"/><circle class="hub" cx="${cx}" cy="${cy}" r="${core}"/>
      <text class="h1" x="${cx}" y="${cy - 10}" text-anchor="middle">IA</text><text class="h2" x="${cx}" y="${cy + 10}" text-anchor="middle">${L('Der Lotse dirigiert', 'The Pilot conducts')}</text><text class="h3" x="${cx}" y="${cy + 28}" text-anchor="middle">${L('Menschen entscheiden', 'People decide')}</text>
      ${front}</svg>
      <div class="legend"><span><i style="background:var(--ai)"></i>${L('Helfer, im Klickdummy gezeigt', 'Helper, shown in the click dummy')}</span><span><i style="background:var(--surface);border:2px solid var(--ai)"></i>${L('Helfer, Ausblick', 'Helper, outlook')}</span><span><i style="background:var(--orange)"></i>${L('Mensch entscheidet, je eine Frage', 'A human decides, one question each')}</span></div></div>`;
  }
  function vStart() {
    const hyp = HYP().map((h, i) => `<li><div class="b">${i + 1}</div><div><b>${h[0]}</b><span>${h[1]}</span></div></li>`).join('');
    const steps = STEPS6();
    const map = `<div class="tw"><table class="pmap"><thead><tr><th>${L('Dienst', 'Service')}</th>${steps.map((s, i) => `<th><span class="num">${i + 1}</span> ${s}</th>`).join('')}</tr></thead><tbody>${PMAP().map((r) => `<tr><td><button class="lnk" data-act="svc" data-a="${r.go}:${r.tab || ''}"><b>${r.n}</b></button> <span class="pill ${r.st[0]}">${r.st[1]}</span><div class="small muted">${r.b}</div></td>${r.c.map((c) => { const h = c.startsWith('h:'); return `<td><span class="act ${h ? 'hu' : 'ki'}">${ACTOR[h ? c.slice(2) : c]()}</span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="legend"><span><i style="background:var(--ai)"></i>${L('KI-Helfer oder Gerät', 'AI helper or device')}</span><span><i style="background:var(--orange)"></i>${L('Mensch entscheidet', 'A human decides')}</span></div>`;
    const people = PEOPLE().map((p) => `<section class="card pers"><h3>${p[0]}</h3><p class="quo">${p[1]}</p><dl class="kv small"><dt>${L('Sorge', 'Worry')}</dt><dd>${p[2]}</dd><dt>${L('IA nimmt ab', 'IA takes over')}</dt><dd>${p[3]}</dd><dt>${L('Bleibt beim Menschen', 'Stays with the person')}</dt><dd>${p[4]}</dd><dt>${L('Erfolg heißt', 'Success means')}</dt><dd>${p[5]}</dd></dl></section>`).join('');
    const lay = LAYERS().map((l, i) => `<div class="lay ${l[2]}"><div class="ln"><span class="num">${i + 1}</span> ${l[0]}</div><div class="li">${l[1].map((x) => `<span>${x}</span>`).join('')}</div></div>`).join('<div class="larr" aria-hidden="true">↕</div>');
    const ifc = [
      [L('OP-Planung', 'OR scheduling'), L('lesen', 'read'), L('Saal, Zeit, Gerätebedarf', 'Room, time, device need')],
      [L('Dienstplan', 'Roster'), L('lesen', 'read'), L('Rolle, Schicht, Bereich, ohne Namen', 'Role, shift, area, without names')],
      [L('Alarmierung', 'Alarm system'), L('lesen', 'read'), L('Alarm ja oder nein, Bereich', 'Alarm yes or no, area')],
      [L('Flottenportal', 'Fleet portal'), L('lesen, Status schreiben', 'read, write status'), L('Softwarestand, Pakete, Rückruf', 'Software version, packages, recall')],
      [L('Gerät', 'Device'), L('über Begleiter oder Roboter', 'via companion or robot'), L('Logs, Zustand, Start des Updates', 'Logs, state, start of the update')],
      [L('Kundendienst', 'Customer service'), L('schreiben', 'write'), L('Vorab-Check für einen Termin', 'Pre-visit check for an appointment')],
    ].map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td class="muted">${r[2]}</td></tr>`).join('');
    const way = [
      [L('Hackathon', 'Hackathon'), L('Zuerst der Fenster-Lotse mit Begleiter und Bestätigung, dann Aufträge für Personen in der Nähe, dann der Roboter-Einsatz. Dazu dieses Bild.', 'First the window Pilot with companion and confirmation, then jobs for people nearby, then the robot mission. Plus this picture.')],
      [L('Pilot in einem Haus', 'Pilot in one hospital'), L('Fenster-Lotse, Begleiter und Wächter für eine Flotte, eine Anbindung an die OP-Planung.', 'Window Pilot, companion and Guardian for one fleet, one connection to OR scheduling.')],
      [L('Ausbau', 'Expansion'), L('Wartung, Servicetermine und Einweisung im selben Fenster. Roboter in großen Häusern.', 'Maintenance, service visits and instruction in the same window. Robots in large hospitals.')],
      [L('Vision', 'Vision'), L('Der Roboter als Hand für alle Dienste, weitere Gerätetypen, Rückkanal in die Entwicklung.', 'The robot as the hand for all services, further device types, a return channel into development.')],
    ].map((w, i) => `<li class="${i === 0 ? 'cur' : ''}"><div class="b">${i + 1}</div><div><b>${w[0]}</b><span>${w[1]}</span></div></li>`).join('');
    const ask = [
      L('Stimmen die sieben Hypothesen? Welche ist falsch?', 'Are the seven hypotheses right? Which one is wrong?'),
      L('Bauen wir mit dem Fenster-Lotsen das Richtige?', 'Are we building the right thing with the window Pilot?'),
      L('Welche Signale liefert ein ausgeschalteter C-Bogen heute, und was weiß das Flottenportal je Gerät?', 'Which signals does a switched-off C-arm provide today, and what does the fleet portal know per device?'),
      L('Wie erfährt der Kundendienst, dass ein Gerät Hilfe braucht, und was weiß der Techniker vor der Anfahrt?', 'How does customer service learn that a device needs help, and what does the technician know before the trip?'),
      L('Wer weist heute in neue Softwarestände ein, und wie wird das belegt?', 'Who instructs staff in new software versions today, and how is it documented?'),
    ].map((t) => `<li>${t}</li>`).join('');
    const hero = `<section class="ovh"><div><div class="eyebrow">C-ARMAGOTCHI · Invisible Autonomy · ${L('Klickdummy für den Folgetermin', 'Click dummy for the follow-up')}</div><h1 style="margin-top:12px">${L('Mehr als schöne Folien. <em>Klick dich durch.</em>', 'More than nice slides. <em>Click through it.</em>')}</h1><p class="lead">${L('Acht Bereiche, Sicherheitsregeln als getesteter Code, ein Roboter, der nie selbst startet, und Handys, die sich melden. Wähle eine Journey oder klick frei.', 'Eight areas, safety rules as tested code, a robot that never starts anything itself, and phones that ring. Pick a journey or click freely.')}</p></div><div class="figs">${fig('lonely', 'pet', 112, L('Cio einsam', 'Cio lonely'))}${fig('manic', 'pet', 132, L('Cio hungrig', 'Cio hungry'))}${fig('bliss', 'pet', 160, L('Cio munter', 'Cio happy'))}${ketty(150)}</div></section>`;
    return `${hero}${journeyCards()}<div style="height:34px"></div><div class="head"><div><div class="eyebrow">${L('Überblick für die Challenge-Owner', 'Overview for the challenge owners')}</div><h1>${L('Das goldene Fenster ist die gemeinsame Währung, der Roboter die gemeinsame Hand', 'The golden window is the shared currency, the robot the shared hand')}</h1><p>${L('Update, Wartung, Servicetermin und Einweisung brauchen alle dasselbe knappe Gut: eine Zeit, in der Gerät, Raum, Strom und der richtige Mensch gleichzeitig frei sind. Heute sucht jede Stelle dieses Fenster für sich, per Telefon. Die Plattform findet es einmal und legt hinein, was zusammenpasst. Und was am Gerät von Hand zu tun ist, übernimmt für alle Dienste dieselbe Hand.', 'Update, maintenance, service visit and instruction all need the same scarce thing: a time when device, room, power and the right person are free at once. Today every party looks for this window on its own, by phone. The platform finds it once and puts in whatever fits together. And whatever has to be done by hand at the device is done by the same hand for all services.')}</p></div>
      <div class="r"><button class="btn primary" data-act="journey" data-a="1">${L('Geführte Demo starten', 'Start the guided demo')}</button><button class="btn" data-act="tour" data-a="tief">${L('Vertiefung starten', 'Start the deep dive')}</button></div></div>
      <div class="banner"><span class="who">${L('Was wir bauen', 'What we build')}</span><span>${L('Ein Killer-Feature: Die Plattform findet das Fenster für ein Update, macht das Gerät bereit und lässt genau einen Menschen den Start bestätigen. Danach kommen Aufträge für Personen in der Nähe und der Roboter-Einsatz. Alles andere auf dieser Seite zeigt, wohin es führt.', 'One killer feature: the platform finds the window for an update, gets the device ready and lets exactly one human confirm the start. Next come jobs for people nearby and the robot mission. Everything else on this page shows where it leads.')}</span></div>
      <div class="grid g64"><section class="card"><h2>${L('Die unsichtbaren Helfer bekommen Hilfe', 'The invisible helpers get help')}</h2><p class="small muted" style="margin:4px 0 6px">${L('Ein Dirigent, benannte Helfer, vier Rollen mit je einer Frage. Die Arbeit fließt zur Plattform, die Entscheidung bleibt beim Menschen.', 'One conductor, named helpers, four roles with one question each. The work flows to the platform, the decision stays with people.')}</p>${crew()}</section>
        <section class="card"><h2>${L('Sieben Hypothesen, bitte widersprechen', 'Seven hypotheses, please disagree')}</h2><ol class="steps hyp">${hyp}</ol><p class="small muted">${L('Die Zahlen dahinter (rund 120 Minuten, drei Rollen) sind mündliche Schätzungen aus dem Gespräch mit dem Challenge-Geber.', 'The figures behind them (roughly 120 minutes, three roles) are verbal estimates from the conversation with the challenge owner.')}</p></section></div>
      <section class="card" style="margin-top:14px"><h2>${L('Plattformkarte: wer in welchem Schritt die Arbeit trägt', 'Platform map: who carries the work in which step')}</h2><p class="small muted" style="margin:4px 0 12px">${L('Jede Zeile ist ein Dienst rund um die Maschine und lässt sich anklicken. Jede Spalte ist einer der sechs Schritte, die jeder Dienst durchläuft. In jeder Zeile entscheidet genau einmal ein Mensch.', 'Each row is a service around the machine and can be clicked. Each column is one of the six steps every service goes through. In each row a human decides exactly once.')}</p>${map}</section>
      <section class="card" style="margin-top:14px"><h2>${L('Was die Menschen eigentlich wollen', 'What people actually want')}</h2><p class="small muted" style="margin:4px 0 12px">${L('In der Klinik halten viele unsichtbare Helfer den Betrieb am Laufen. Unser Entwurf ihrer Ziele, vor Ort zu prüfen.', 'In a hospital many invisible helpers keep things running. Our draft of their goals, to be checked on site.')}</p><div class="people">${people}</div></section>
      <div class="grid g64" style="margin-top:14px"><section class="card"><h2>${L('Erste Gedanken zur Architektur', 'First thoughts on architecture')}</h2><div class="twin arch"><div class="layers">${lay}</div><div><h3>${L('Schnittstellen für einen Pilot', 'Interfaces for a pilot')}</h3><div class="tw"><table class="small"><thead><tr><th>${L('Zu', 'To')}</th><th>${L('Richtung', 'Direction')}</th><th>${L('Inhalt', 'Content')}</th></tr></thead><tbody>${ifc}</tbody></table></div></div></div><ol class="rules" style="margin-top:12px"><li>${L('Regeln sind Code, die KI ist Vorschlag. Ob ein Update starten darf, entscheidet eine getestete Funktion.', 'Rules are code, the AI is a proposal. A tested function decides whether an update may start.')}</li><li>${L('Keine Patientendaten: nur Saal, Zeit, Gerät und Rolle.', 'No patient data: only room, time, device and role.')}</li><li>${L('Der C-Bogen bleibt unverändert.', 'The C-arm stays unchanged.')}</li></ol><p class="small muted">${L('Ein Entwurf. Die Systeme des Herstellers kennen wir nicht.', 'A draft. We do not know the manufacturer’s systems.')}</p></section>
      <div class="stack">
        <section class="card"><h2>${L('Der Weg', 'The path')}</h2><ol class="steps">${way}</ol></section>
        <section class="card"><h2>${L('Unsere Fragen an Sie', 'Our questions to you')}</h2><ol class="rules">${ask}</ol></section>
      </div></div>`;
  }

  /* Outlook areas, one per further service. Invented cases; nothing here is built. */
  const TABS = () => [['wartung', L('Wartung', 'Maintenance')], ['termin', L('Servicetermin', 'Service visit')], ['lernen', L('Lernen', 'Learning')], ['ort', L('Richtiger Ort', 'Right place')], ['nachweis', L('Nachweise', 'Records')], ['hersteller', L('Hersteller', 'Manufacturer')], ['typen', L('Gerätetypen', 'Device types')]];
  const SEEN = () => [['warn', L('Akku-Warnung beim Einschalten', 'Battery warning when switching on')], ['aus', L('Geht nach wenigen Minuten aus', 'Switches off after a few minutes')], ['nichts', L('Nichts Auffälliges', 'Nothing unusual')]];
  const PREP = () => [['strom', L('Fritzi bleibt am Mittwochabend im Geräteraum eingesteckt', 'Fritzi stays plugged in in the equipment room on Wednesday evening')], ['zugang', L('Die Medizintechnik öffnet am Donnerstag um 15:30', 'Clinical engineering opens the door on Thursday at 15:30')], ['ersatz', L('Arcus ist für Donnerstag als Ersatz eingeplant', 'Arcus is planned as the replacement for Thursday')]];
  const SHARE = () => [['sw', L('Softwarestand und Fehlercodes je Gerät', 'Software version and error codes per device')], ['nutz', L('Nutzungsmuster je Wochentag und Stunde', 'Usage pattern per weekday and hour')], ['ort', L('Standort im Haus und Stromversorgung', 'Location in the building and power supply')]];
  const TYPES = () => [
    ['roe', L('Mobile Röntgengeräte', 'Mobile X-ray units'), 6, L('Fenster aus dem Nutzungsmuster, Begleiter am Gerät, Wächter, Roboter bringt Strom.', 'Window from the usage pattern, companion at the device, Guardian, robot brings power.'), L('Stehen auf Station statt im OP. Die Belegung kommt aus dem Stationsalltag, nicht aus dem OP-Plan.', 'They stand on the ward, not in the OR. Usage comes from ward routine, not from the OR schedule.')],
    ['us', L('Ultraschallgeräte', 'Ultrasound units'), 14, L('Geräteakte, Fristen, eine Frage je Rolle, Nachweis.', 'Device file, deadlines, one question per role, records.'), L('Viele Geräte, meist an der Steckdose. Das Fenster ist eher die Mittagspause als die Nacht, ein Roboter ist selten nötig.', 'Many units, mostly plugged in. The window is the lunch break rather than the night, a robot is rarely needed.')],
    ['mon', L('Patientenmonitore', 'Patient monitors'), 40, L('Geräteakte, Fristen, Nachweis.', 'Device file, deadlines, records.'), L('Laufen am Patienten im Dauerbetrieb. Ein Fenster gibt es nur beim Bettenwechsel, und das braucht eine eigene Risikobetrachtung.', 'They run continuously at the patient. A window only exists at a bed change, and that needs its own risk assessment.')],
  ];
  // Bundled only counts while the window it was put into still exists.
  const bundled = (id) => !!win(id) && (!!S.bund[id] || (id === 'C-02' && S.merged));
  function vDienste() {
    const tab = TABS().some((t) => t[0] === S.tab) ? S.tab : 'termin';
    const seg = `<div class="seg wrap" style="margin-left:0" role="group" aria-label="${L('Dienst', 'Service')}">${TABS().map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-act="tab" data-a="${t[0]}" aria-pressed="${tab === t[0]}">${t[1]}</button>`).join('')}</div>`;
    const head = (t, p) => `<div class="head"><div><div class="eyebrow">${L('Weitere Dienste', 'More services')} · ${out()}</div><h1>${t}</h1><p>${p}</p></div></div>${seg}
      <div class="banner" style="margin-top:12px"><span class="who">${L('Nicht gebaut', 'Not built')}</span><span>${L('Dieser Bereich zeigt, wohin die Plattform führt. Fall, Zeiten und Inhalte sind erfunden.', 'This area shows where the platform leads. Case, times and content are invented.')}</span></div>`;
    const why = (items) => `<section class="card"><h2>${L('Warum das zur Plattform gehört', 'Why this belongs to the platform')}</h2><ol class="rules">${items.map((t) => `<li>${t}</li>`).join('')}</ol></section>`;
    if (tab === 'wartung') {
      const rows = D.DEVICES.filter((d) => d.wartungTage <= 30).sort((a, b) => a.wartungTage - b.wartungTage).map((d) => {
        const w = win(d.id), arm = d.update && d.update.art === 'arm';
        const next = bundled(d.id) ? `<span class="pill ok">${L('im selben Fenster', 'in the same window')}</span>` : w && ['vorschlag', 'geplant', 'bereit'].includes(w.status) ? `<button class="btn sm" data-act="bund" data-a="${d.id}">${L('Ins Update-Fenster legen', 'Put into the update window')}</button>` : arm ? `<span class="muted">${L('braucht einen Technikertermin', 'needs a technician visit')}</span>` : `<span class="muted">${L('noch kein Fenster', 'no window yet')}</span>`;
        return `<tr><td><b>${d.name}</b> <span class="muted">${X(d.ort)}</span></td><td>${X('Prüfung in ' + d.wartungTage + ' Tagen fällig')}</td><td>${w ? dayL(w.day) + ', ' + hm(w.from) : '–'}</td><td>${next}</td></tr>`;
      }).join('');
      return head(L('Wartung und Prüfungen: ein Termin statt zwei', 'Maintenance and checks: one appointment instead of two'), L('Die Plattform kennt die Fälligkeiten aus der Geräteakte und die Fenster vom Lotsen. Passt beides zusammen, steht das Gerät nur einmal.', 'The platform knows the due dates from the device file and the windows from the Pilot. If both fit, the device is out of service only once.')) +
        `<div class="grid g64"><section class="card"><h2>${L('Fällig in den nächsten 30 Tagen', 'Due within the next 30 days')}</h2><div class="tw"><table><thead><tr><th>${L('Gerät', 'Device')}</th><th>${L('Prüfung', 'Check')}</th><th>${L('Update-Fenster', 'Update window')}</th><th>${L('Bündeln', 'Bundle')}</th></tr></thead><tbody>${rows}</tbody></table></div>${S.filled ? '' : `<p class="small muted" style="margin-top:8px">${L('Noch ist keine Woche geplant.', 'No week has been planned yet.')} <button class="lnk" data-act="go" data-a="tafel">${L('Zur Planungstafel, „Lücken füllen“', 'To the planning board, “Fill the gaps”')}</button></p>`}</section>
        <div class="stack">${why([L('Dieselben Fenster, derselbe Lotse, dieselbe Freigabe durch die Medizinphysik.', 'The same windows, the same Pilot, the same release by medical physics.'), L('Die Prüfung selbst macht ein Mensch vor Ort. Die Plattform plant sie nur.', 'A human on site does the check itself. The platform only schedules it.'), L('Der Chronist legt den Prüfnachweis in die Geräteakte.', 'The Chronicler files the proof of the check in the device file.')])}</div></div>`;
    }
    if (tab === 'termin') {
      const seen = SEEN().find((x) => x[0] === S.seen), prepDone = PREP().every((x) => S.prep[x[0]]);
      const items = [
        [L('Gerät', 'Device'), L('Fehlercode und Logs der letzten 14 Tage liegen bereit. Ziel: ohne Patientendaten, vor einem Pilot zu prüfen. Software 4.2.1, Akku 61 % Kapazität.', 'Error code and logs of the last 14 days are ready. Goal: without patient data, to be verified before a pilot. Software 4.2.1, battery at 61 % capacity.'), true],
        [role('nurse'), seen ? L(`Beobachtung: „${seen[1]}“.`, `Observation: “${seen[1]}”.`) : L('Eine Frage am Begleiter, 20 Sekunden, keine Diagnose verlangt.', 'One question at the companion, 20 seconds, no diagnosis expected.'), !!seen],
        [L('Fenster', 'Window'), L('Do 19.11., 15:30 bis 17:00, Geräteraum Ebene 2. Kein Eingriff braucht Fritzi in dieser Zeit.', 'Thu 19 Nov, 15:30 to 17:00, equipment room, level 2. No procedure needs Fritzi during that time.'), true],
        [L('Vorbereitung der Klinik', 'Preparation by the hospital'), prepDone ? L('Strom, Zugang und Ersatzgerät sind bestätigt.', 'Power, access and replacement device are confirmed.') : L('Drei kurze Punkte, siehe unten.', 'Three short items, see below.'), prepDone],
        [L('Servicevertrag und Teil', 'Service contract and part'), L('Vollservice (Beispielvertrag), Akku abgedeckt. Der Empfang schlägt vor, ein Akkumodul mitzubringen.', 'Full service (sample contract), battery covered. The front desk suggests bringing a battery module.'), true],
      ];
      const ready = items.every((x) => x[2]);
      const list = items.map((x) => `<li class="${x[2] ? 'done' : 'cur'}"><div class="b">${x[2] ? '✓' : '·'}</div><div><b>${x[0]}</b><span>${x[1]}</span></div></li>`).join('');
      const q = `<div class="dec ai"><div class="who"><span class="dot"></span>${L('Begleiter an Fritzi fragt die Person am Gerät', 'Companion at Fritzi asks the person at the device')}</div><b>${L('Was hast du gesehen?', 'What did you see?')}</b><div class="row">${SEEN().map((x) => `<button class="btn sm${S.seen === x[0] ? ' primary' : ''}" data-act="seen" data-a="${x[0]}" aria-pressed="${S.seen === x[0]}" ${S.svcOk ? 'disabled' : ''}>${x[1]}</button>`).join('')}</div><div class="small muted">${L('Antippen genügt. Keine Diagnose, keine Verantwortung, kein Freitext.', 'One tap is enough. No diagnosis, no responsibility, no free text.')}</div></div>`;
      const prep = `<div class="dec"><b>${L('Was die Klinik vorbereitet', 'What the hospital prepares')}</b><div class="small muted">${L('Der Empfang sagt, was nötig ist, damit der Termin beim ersten Mal klappt. Abhaken kann die Medizintechnik oder die Medizinphysik.', 'The front desk says what is needed for the visit to work the first time. Clinical engineering or medical physics can tick it off.')}</div>${PREP().map((x) => `<button class="chk${S.prep[x[0]] ? ' on' : ''}" data-act="prep" data-a="${x[0]}" aria-pressed="${!!S.prep[x[0]]}" ${S.svcOk ? 'disabled' : ''}><span class="bx">${S.prep[x[0]] ? '✓' : ''}</span><span>${x[1]}</span></button>`).join('')}</div>`;
      return head(L('Vorab-Check für den Servicetermin: Niemand kommt umsonst', 'Pre-visit check for the service visit: nobody comes for nothing'), L('Bevor jemand losfährt, ist geklärt, ob der Termin gelingen kann: Fehlerbild, Logs, Fenster, Zugang und das wahrscheinlich nötige Teil. Die Klinik sieht, was sie vorbereitet, der Techniker sieht, ob er losfahren kann.', 'Before anyone sets off it is clear whether the visit can succeed: symptom, logs, window, access and the part that is probably needed. The hospital sees what to prepare, the technician sees whether to set off.')) +
        `<div class="grid g64"><div class="stack">
          <section class="card"><div class="row"><h2 style="margin:0">${L('Vorab-Check für Fritzi (C-05)', 'Pre-visit check for Fritzi (C-05)')}</h2><span class="pill ${ready ? 'ok' : 'warn'}">${ready ? L('Termin kann gelingen', 'the visit can succeed') : L('noch offen', 'still open')}</span></div><ol class="steps" style="margin-top:12px">${list}</ol></section>
          <section class="card"><div class="stack">${q}${prep}</div></section></div>
        <div class="stack">
          <section class="card"><h2>${L('Was der Techniker sieht', 'What the technician sees')}</h2><div class="why"><div class="who"><span class="dot"></span>${L('Empfang', 'Front desk')}</div>${ready ? L('Fritzi, Geräteraum Ebene 2. Akku hält nicht mehr, Beobachtung vom Team liegt vor. Do 19.11., 15:30, Zugang über die Medizintechnik, Gerät ist eingesteckt, Ersatz steht bereit. Akkumodul mitbringen. Voraussichtlich 45 Minuten.', 'Fritzi, equipment room, level 2. The battery no longer holds, the team’s observation is in. Thu 19 Nov, 15:30, access via clinical engineering, the device is plugged in, a replacement is ready. Bring a battery module. Probably 45 minutes.') : L('Noch nicht losfahren. Offen ist: ', 'Do not set off yet. Still open: ') + items.filter((x) => !x[2]).map((x) => x[0]).join(', ') + '.'}</div>
            <div class="row" style="margin-top:12px"><button class="btn primary" data-act="svcok" ${ready && !S.svcOk ? '' : 'disabled'}>${S.svcOk ? L('Termin zugesagt', 'Visit accepted') : L('Als Techniker zusagen (gespielte Rolle)', 'Accept as technician (role played)')}</button></div>
            <p class="small muted" style="margin-top:8px">${L('Die Zusage gibt ein Mensch. Das Fenster kommt aus der Freigabe der Medizinphysik, und der Vorab-Check geht erst nach Zusage der Klinik an den Kundendienst.', 'A human accepts. The window comes from the release by medical physics, and the pre-visit check only goes to customer service after the hospital has agreed.')}</p></section>
          ${why([L('Das Fenster findet derselbe Lotse wie beim Update.', 'The same Pilot finds the window as for the update.'), L('Die Logs hat der Begleiter oder der Roboter schon geholt.', 'The companion or the robot has already collected the logs.'), L('Der Wächter meldet, ob das Gerät danach wieder einsatzbereit ist.', 'The Guardian reports whether the device is ready for use again afterwards.')])}
        </div></div>`;
    }
    if (tab === 'lernen') {
      const neu = [
        L('Sicherheitsupdate. Die Bedienung am Gerät bleibt gleich.', 'Security update. Operation at the device stays the same.'),
        L('Neu: Während eines Updates zeigt das Gerät groß „Update läuft, nicht ausstecken“ mit der Uhrzeit, zu der es fertig ist.', 'New: during an update the device shows “Update running, do not unplug” in large type with the time it will be done.'),
        L('Neu: Der Begleiter bittet höchstens um einen Handgriff und nie während eines Eingriffs.', 'New: the companion asks for one simple action at most and never during a procedure.'),
      ].map((t) => `<li>${t}</li>`).join('');
      const rows = [[L('MTR Spätdienst', 'Radiographers, late shift'), 2, 2], [L('OP-Pflege Spätdienst', 'OR nurses, late shift'), 0, 2], [L('Medizintechnik Rufdienst', 'Clinical engineering, on call'), 1, 1]].map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1] === r[2] ? L('ja', 'yes') : L('nein', 'no')}</td><td>${r[1] === r[2] ? `<span class="pill ok">${L('kann Aufsicht übernehmen', 'can supervise')}</span>` : `<span class="pill">${L('wird dafür nicht gefragt', 'is not asked for this')}</span>`}</td></tr>`).join('');
      return head(L('Lernen im selben Fenster: zwei Minuten am Gerät', 'Learning in the same window: two minutes at the device'), L('Die Plattform weiß, was sich am Gerät geändert hat und wer eingewiesen ist. Daraus wird eine Kurzschulung beim ersten Einschalten und ein Nachweis ohne Zettel.', 'The platform knows what has changed on the device and who has been instructed. That becomes a short lesson at the first switch-on and a record without paper.')) +
        `<div class="grid g64"><div class="stack">
          <section class="card"><div class="row"><h2 style="margin:0">${L('Was ist neu in 4.2.1', 'What is new in 4.2.1')}</h2><span class="pill ai">Coach</span></div><p class="small muted" style="margin:6px 0 10px">${L('Erscheint nach dem Update beim ersten Einschalten. Überspringbar, später nachholbar. Inhalt erfunden.', 'Appears at the first switch-on after the update. Can be skipped and done later. Content invented.')}</p><ol class="rules">${neu}</ol><div class="row" style="margin-top:12px"><button class="btn primary" data-act="learned" ${S.learned ? 'disabled' : ''}>${S.learned ? L('Gesehen, danke', 'Seen, thank you') : L('Gesehen', 'Seen')}</button><span class="small muted">${L('Festgehalten wird nur „gesehen“, kein Test und keine Zeit.', 'Only “seen” is recorded, no test and no time.')}</span></div></section>
          <section class="card"><h2>${L('Lernfenster', 'Learning window')}</h2><div class="dec ai"><div class="who"><span class="dot"></span>Coach</div><div>${L('Vorschlag: Do 19.11., 17:10, nach dem Servicetermin, zehn Minuten Einweisung an Fritzi im Geräteraum. Gerät und zwei Plätze der OP-Pflege sind laut Plan gleichzeitig frei. Ob eine Kurz-Einweisung für die Aufsicht bei Updates reicht, ist offen und nach der Betreiberverordnung zu klären.', 'Proposal: Thu 19 Nov, 17:10, after the service visit, ten minutes of instruction at Fritzi in the equipment room. The device and two OR nursing slots are free at the same time per roster. Whether a short instruction is enough for supervising updates is open and has to be clarified against the operator regulation.')}</div><div class="row"><button class="btn" data-act="lernok" ${S.lernOk ? 'disabled' : ''}>${S.lernOk ? L('Vorgeschlagen', 'Proposed') : L('Dem Team vorschlagen', 'Propose to the team')}</button></div></div></section></div>
        <div class="stack">
          <section class="card"><h2>${L('Einweisung für Updates mit Armbewegung', 'Instruction for updates with arm movement')}</h2><div class="tw"><table><thead><tr><th>${L('Funktion', 'Function')}</th><th>${L('Genug Eingewiesene im Dienst', 'Enough instructed people on duty')}</th><th>${L('Folge', 'Effect')}</th></tr></thead><tbody>${rows}</tbody></table></div><p class="small muted" style="margin-top:8px">${L('Gespeichert wird nur „eingewiesen ja oder nein“, sichtbar für die Person selbst und die Medizinphysik. Kein Lernverlauf, keine Rangliste. Mit Personalrat und Datenschutz abzustimmen.', 'Only “instructed yes or no” is stored, visible to the person themselves and to medical physics. No learning history, no ranking. To be agreed with the staff council and data protection.')}</p></section>
          ${why([L('Jedes Update ändert etwas. Die Plattform weiß, was, und sagt es am Gerät.', 'Every update changes something. The platform knows what and says so at the device.'), L('Aufsicht geht nur an eingewiesene Funktionen. Mehr Eingewiesene heißt mehr mögliche Fenster.', 'Supervision only goes to instructed functions. More instructed people means more possible windows.'), L('Der Chronist schreibt den Nachweis mit.', 'The Chronicler keeps the record.')])}
        </div></div>`;
    }
    if (tab === 'ort') {
      let wrong = 0;
      const rows = D.DEVICES.map((d) => {
        const f = (d.busy[1] || [])[0], bad = f && f.saal !== d.ort; if (bad) wrong++;
        const st = !f ? `<span class="pill">${L('morgen nicht eingeplant', 'not scheduled tomorrow')}</span>` : !bad ? `<span class="pill ok">${L('steht richtig', 'in the right place')}</span>` : S.ortJob[d.id] ? `<span class="pill warn">${L('Auftrag für 7:00 angelegt', 'job created for 7:00')}</span>` : `<span class="pill risk">${L('steht falsch', 'in the wrong place')}</span>`;
        return `<tr><td><b>${d.name}</b></td><td>${X(d.ort)}</td><td>${f ? X(f.saal) + ', ' + hm(f.from) : '–'}</td><td>${st}</td><td>${bad && !S.ortJob[d.id] ? `<button class="btn sm" data-act="ortjob" data-a="${d.id}">${L('Person in der Nähe um 7:00 fragen', 'Ask a person nearby at 7:00')}</button>` : ''}</td></tr>`;
      }).join('');
      return head(L('Gerät am richtigen Ort: Was um 7:30 gebraucht wird, steht schon dort', 'Device in the right place: what is needed at 7:30 is already there'), L('Am Abend gleicht der Lotse den OP-Plan von morgen mit den Standorten ab. Steht ein Gerät falsch, wird daraus früh ein kleiner Auftrag statt einer Suche kurz vor dem Schnitt.', 'In the evening the Pilot matches tomorrow’s OR schedule with the locations. If a device is in the wrong place, it becomes a small job early on instead of a search just before the incision.')) +
        `<div class="grid g64"><section class="card"><div class="row"><h2 style="margin:0">${L('Do 19.11.: Bedarf gegen Standort heute Abend', 'Thu 19 Nov: need versus location tonight')}</h2><span class="pill ${wrong ? 'warn' : 'ok'}">${wrong} ${L('steht falsch', 'in the wrong place')}</span></div><div class="tw" style="margin-top:10px"><table><thead><tr><th>${L('Gerät', 'Device')}</th><th>${L('Steht heute Abend', 'Stands tonight')}</th><th>${L('Morgen zuerst', 'First tomorrow')}</th><th>${L('Lage', 'Status')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
          <div class="dec" style="margin-top:12px"><b>${L('Und der Roboter?', 'And the robot?')}</b><div class="small">${L('Heute bewegt der Roboter keinen C-Bogen. Geräte selbst an den richtigen Ort zu bringen, ist die fernste Stufe der Vision und braucht eine eigene Sicherheitsbetrachtung. Bis dahin geht der Auftrag an eine Person in der Nähe.', 'Today the robot never moves a C-arm. Bringing devices to the right place itself is the furthest stage of the vision and needs its own safety assessment. Until then the job goes to a person nearby.')}</div></div></section>
        <div class="stack">${why([L('Der OP-Plan liegt für die Fenster ohnehin vor, ohne Patientendaten.', 'The OR schedule is available for the windows anyway, without patient data.'), L('Der Auftrag läuft über dieselbe Anfrage wie „Hilfe in der Nähe“: nur wer im Dienst und frei ist.', 'The job runs through the same request as “help nearby”: only those on duty and free.'), L('Die Abendrunde des Roboters liefert die Standorte.', 'The robot’s evening round provides the locations.')])}</div></div>`;
    }
    if (tab === 'nachweis') {
      const akt = D.DEVICES.filter(aktuell).length, gepl = S.plan.filter((w) => ['geplant', 'bereit', 'unterwegs', 'laeuft'].includes(w.status)).length, fehl = S.plan.filter((w) => w.status === 'fehl').length;
      const k = [[akt + ' ' + L('von', 'of') + ' ' + D.DEVICES.length, L('Geräte auf aktuellem Stand', 'devices up to date'), L('Sicherheitsupdate 4.2.1', 'security update 4.2.1')], [gepl, L('Fenster freigegeben', 'windows released'), L('innerhalb der Frist Mo 23.11.', 'within the deadline Mon 23 Nov')], [fehl, L('Fehlschläge', 'failures'), L('gemeldet, mit Ersatzgerät', 'reported, with a replacement')], [S.feed.length, L('Einträge im Protokoll', 'entries in the record'), L('wer, wann, was', 'who, when, what')]];
      const log = S.feed.slice(0, 6).map((f) => `<li><span class="num">${f[0]}</span> <b>${hn(f[1])}</b> ${esc(en() ? (f[3] || f[2]) : f[2])}</li>`).join('');
      return head(L('Nachweise auf Knopfdruck: Die Stille wird sichtbar', 'Records at the push of a button: the silence becomes visible'), L('Für den OP ist das beste Ergebnis, dass nichts passiert. IT-Sicherheit und Aufsicht brauchen genau dafür einen Beleg. Er entsteht aus dem, was die Plattform ohnehin protokolliert.', 'For the OR the best result is that nothing happens. IT security and regulators need proof of exactly that. It comes from what the platform records anyway.')) +
        `<div class="kpis k4">${k.map((x) => `<div class="kpi"><b class="num">${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></div>`).join('')}</div>
        <div class="grid g64"><div class="stack"><section class="card"><div class="row"><h2 style="margin:0">${L('Nachweis Patch-Stand', 'Patch level report')}</h2><span class="pill ai">${L('Chronist', 'Chronicler')}</span></div>
          ${S.nachweis ? `<div class="doc"><b>${L('Patch-Stand der C-Bogen-Flotte, Klinikum Regnitzau (erfunden)', 'Patch level of the C-arm fleet, Klinikum Regnitzau (invented)')}</b><span>${L('Stand Mi 18.11.2026, 16:40', 'As of Wed 18 Nov 2026, 16:40')}</span><ul><li>${akt} ${L('von', 'of')} ${D.DEVICES.length} ${L('Geräten auf Version 4.2.1', 'devices on version 4.2.1')}</li><li>${gepl} ${L('weitere Fenster freigegeben, alle vor der Frist', 'more windows released, all before the deadline')}</li><li>${fehl} ${L('Fehlschläge, jeweils gemeldet', 'failures, each one reported')}</li><li>${L('Jede Freigabe und jeder Start mit Rolle und Uhrzeit im Protokoll', 'Every release and every start with role and time in the record')}</li></ul><span class="small muted">${L('Muster. Ein echter Nachweis bräuchte die Abstimmung mit der Informationssicherheit des Hauses.', 'Sample. A real report would need to be agreed with the hospital’s information security.')}</span></div>` : `<p class="small muted" style="margin:8px 0">${L('Ein Klick fasst den Stand der Flotte für die Informationssicherheit zusammen.', 'One click summarises the state of the fleet for information security.')}</p>`}
          <div class="row" style="margin-top:10px"><button class="btn primary" data-act="nachweis" ${S.nachweis ? 'disabled' : ''}>${S.nachweis ? L('Erzeugt', 'Created') : L('Nachweis erzeugen', 'Create the report')}</button></div></section></div>
        <div class="stack"><section class="card"><h2>${L('Aus dem Protokoll', 'From the record')}</h2><ol class="plain small">${log}</ol><p class="small muted" style="margin-top:8px">${L('Ziel im echten System: Einträge lassen sich nicht ändern oder löschen.', 'Goal in the real system: entries cannot be changed or deleted.')}</p></section>
          ${why([L('Jede Entscheidung ist schon protokolliert, der Nachweis kostet keine Zusatzarbeit.', 'Every decision is already recorded, the report costs no extra work.'), L('Rollen statt Namen: Der Nachweis sagt, welche Rolle entschieden hat.', 'Roles instead of names: the report says which role decided.')])}</div></div>`;
    }
    if (tab === 'hersteller') {
      const akt = D.DEVICES.filter(aktuell).length;
      const sees = [];
      if (S.share.sw) sees.push(L(`Softwarestand: ${akt} von ${D.DEVICES.length} Geräten auf 4.2.1. Fehlercodes der letzten 14 Tage.`, `Software version: ${akt} of ${D.DEVICES.length} devices on 4.2.1. Error codes of the last 14 days.`));
      if (S.share.nutz) sees.push(L('Nutzungsmuster: An Dienstagabenden wurde in acht Wochen fast kein Gerät gebraucht. Daraus lernt der Hersteller, wann Updates in Häusern dieser Größe passen.', 'Usage pattern: on Tuesday evenings almost no device was needed in eight weeks. From this the manufacturer learns when updates fit in hospitals of this size.'));
      if (S.share.ort) sees.push(L('Standort: Ein Gerät steht regelmäßig ohne Strom im Flur. Hinweis für die nächste Gerätegeneration.', 'Location: one device regularly stands in the corridor without power. A hint for the next device generation.'));
      return head(L('Rückkanal zum Hersteller: Flottenwissen ohne Patientendaten', 'Return channel to the manufacturer: fleet knowledge without patient data'), L('Laut Gespräch fehlt dem Hersteller heute der Log-Strom. Begleiter und Roboter liefern ihn nebenbei. Was zurückfließt, entscheidet die Klinik, und sie sieht es jederzeit.', 'According to the conversation, the manufacturer lacks the log stream today. Companion and robot deliver it along the way. The hospital decides what flows back and can see it at any time.')) +
        `<div class="grid g64"><div class="stack"><section class="card"><h2>${L('Die Klinik gibt frei', 'The hospital releases')}</h2><div class="stack" style="margin-top:8px">${SHARE().map((x) => `<button class="chk${S.share[x[0]] ? ' on' : ''}" data-act="share" data-a="${x[0]}" aria-pressed="${!!S.share[x[0]]}"><span class="bx">${S.share[x[0]] ? '✓' : ''}</span><span>${x[1]}</span></button>`).join('')}</div></section>
          <section class="card"><h2>${L('Was nie zurückfließt', 'What never flows back')}</h2><ol class="rules"><li>${L('Patientendaten und Bilder', 'Patient data and images')}</li><li>${L('Namen von Beschäftigten', 'Names of staff')}</li><li>${L('Wer einen Auftrag angenommen oder abgelehnt hat', 'Who accepted or declined a job')}</li></ol></section></div>
        <div class="stack"><section class="card"><h2>${L('Was der Hersteller sieht', 'What the manufacturer sees')}</h2>${sees.length ? `<ol class="rules">${sees.map((t) => `<li>${t}</li>`).join('')}</ol>` : `<p class="small muted">${L('Nichts. Die Klinik hat nichts freigegeben.', 'Nothing. The hospital has released nothing.')}</p>`}</section>
          ${why([L('Vorausschauender Service: Der Hersteller ruft an, bevor ein Akku ausfällt.', 'Predictive service: the manufacturer calls before a battery fails.'), L('Zurückgerufene Pakete lassen sich gezielt von den Geräten abziehen.', 'Recalled packages can be removed from the devices in a targeted way.'), L('Die Entwicklung sieht, wie Geräte im Alltag wirklich stehen und genutzt werden.', 'Development sees how devices really stand and are used day to day.')])}</div></div>`;
    }
    const ty = TYPES().find((t) => t[0] === S.typ) || TYPES()[0];
    return head(L('Andere Gerätetypen: dieselben sechs Schritte', 'Other device types: the same six steps'), L('Der C-Bogen ist der schwierigste Fall: mobil, oft ohne Strom, lange Updates. Was hier funktioniert, lässt sich auf andere Geräte übertragen. Alle Angaben sind Annahmen.', 'The C-arm is the hardest case: mobile, often without power, long updates. What works here can be carried over to other devices. All statements are assumptions.')) +
      `<div class="skills" style="margin-top:14px">${TYPES().map((t) => `<button class="skill${ty[0] === t[0] ? ' on' : ''}" data-act="typ" data-a="${t[0]}" aria-pressed="${ty[0] === t[0]}"><span class="pill">${t[2]} ${L('im Haus (erfunden)', 'in the hospital (invented)')}</span><b>${t[1]}</b></button>`).join('')}</div>
      <div class="grid g2"><section class="card"><h2>${L('Was gleich bleibt', 'What stays the same')}</h2><p>${ty[3]}</p></section><section class="card"><h2>${L('Was anders ist', 'What is different')}</h2><p>${ty[4]}</p></section></div>`;
  }

  /* What else the robot could do later: capability cards plus one invented night shift. */
  const SKILLS = () => [
    ['update', L('Update einspielen', 'Install an update'), L('Strom, Paket, Umgebung, Bewachung.', 'Power, package, surroundings, guarding.'), 1],
    ['andere', L('Andere Updates', 'Other updates'), L('Firmware und Sicherheitslisten, auch für andere Gerätetypen.', 'Firmware and security lists, also for other device types.')],
    ['logs', L('Logs holen', 'Collect logs'), L('Auch von Geräten ohne Netz, ohne Patientendaten.', 'Even from devices without network, without patient data.')],
    ['akku', L('Akkus pflegen', 'Look after batteries'), L('Bringt Strom, bevor ein Gerät im Flur leer ist.', 'Brings power before a device in the corridor runs empty.')],
    ['runde', L('Abendrunde', 'Evening round'), L('Wo steht welches Gerät, ist es eingesteckt, fehlt Zubehör.', 'Where each device is, whether it is plugged in, whether accessories are missing.')],
    ['teile', L('Teile bringen', 'Bring parts'), L('Ersatzteile und Zubehör vom Lager zum Gerät.', 'Spare parts and accessories from the store to the device.')],
    ['techniker', L('Techniker lotsen', 'Guide the technician'), L('Führt zum Gerät und hat die Logs schon dabei.', 'Leads to the device and already carries the logs.')],
    ['schulung', L('Einweisung begleiten', 'Support instruction'), L('Bildschirm und Geduld für die Kurzschulung am Gerät.', 'Screen and patience for the short lesson at the device.')],
    ['bewegen', L('Gerät an den Ort bringen', 'Bring the device into place'), L('Fernste Stufe der Vision. Die Regel „bewegt keinen C-Bogen“ gilt, bis eine eigene Sicherheitsbetrachtung etwas anderes erlaubt.', 'Furthest stage of the vision. The rule “never moves a C-arm” holds until a dedicated safety assessment allows otherwise.'), 2],
  ];
  /* Minutes from 17:00. [from, to, skill, text] */
  const SHIFT = () => [
    [0, 120, 'update', L('Update an Cio bewachen', 'Guard the update on Cio')],
    [130, 160, 'logs', L('Logs von Bogdan und Nova', 'Logs from Bogdan and Nova')],
    [165, 210, 'runde', L('Abendrunde: 8 Geräte, 2 nicht eingesteckt', 'Evening round: 8 devices, 2 not plugged in')],
    [270, 315, 'akku', L('Strom zu Arcus', 'Power to Arcus')],
    [330, 360, 'andere', L('Sicherheitsliste für 3 mobile Röntgengeräte', 'Security list for 3 mobile X-ray units')],
    [750, 780, 'teile', L('Akkumodul aus dem Lager zu Fritzi', 'Battery module from the store to Fritzi')],
    [795, 825, 'bewegen', L('Vision, nicht Teil der heutigen Schicht: Cio vor Saal 3', 'Vision, not part of today’s shift: Cio outside OR 3')],
  ];
  function robSkills() {
    const T = 14 * 60, sel = S.skill;
    const hours = Array.from({ length: 8 }, (_, i) => `<span style="left:${(i * 120 / T * 100).toFixed(2)}%">${String((17 + i * 2) % 24).padStart(2, '0')}</span>`).join('');
    const blocks = SHIFT().map((b) => `<button class="sb${b[2] === 'bewegen' ? ' vis' : ''}${b[2] === 'update' ? ' now' : ''}${sel === b[2] ? ' on' : ''}" style="left:${(b[0] / T * 100).toFixed(2)}%;width:${((b[1] - b[0]) / T * 100).toFixed(2)}%" data-act="skill" data-a="${b[2]}" aria-pressed="${sel === b[2]}" title="${b[3]}" aria-label="${b[3]}"></button>`).join('');
    const cur = SHIFT().filter((b) => b[2] === sel).map((b) => `${hm((17 * 60 + b[0]) % 1440)} ${L('bis', 'to')} ${hm((17 * 60 + b[1]) % 1440)}: ${b[3]}`);
    const sk = SKILLS().find((s) => s[0] === sel);
    return `<section class="card"><div class="row"><h2 style="margin:0">${L('Was dieselbe Hand später noch kann', 'What the same hand can do later')}</h2>${out()}</div>
      <p class="small muted" style="margin:4px 0 10px">${L('Eine erfundene Nachtschicht von 17 bis 7 Uhr. Eine Fähigkeit antippen, um zu sehen, wann sie drankommt. Dazwischen lädt der Roboter an der Station.', 'An invented night shift from 17:00 to 07:00. Tap a capability to see when it is due. In between the robot charges at the dock.')}</p>
      <div class="shift"><div class="st">${blocks}</div><div class="sh">${hours}</div></div>
      <div class="dec${sk ? ' ai' : ''}" style="margin:10px 0">${sk ? `<b>${sk[1]}</b><div class="small">${cur.length ? cur.join(' · ') : L('Tagsüber: mit dem Techniker am Do 19.11., 15:30 und zur Einweisung um 17:10.', 'During the day: with the technician on Thu 19 Nov, 15:30 and for the instruction at 17:10.')}</div>` : `<div class="small muted">${L('Noch nichts ausgewählt.', 'Nothing selected yet.')}</div>`}</div>
      <div class="skills">${SKILLS().map((s) => `<button class="skill${s[3] === 1 ? ' on' : ''}${sel === s[0] ? ' pick' : ''}" data-act="skill" data-a="${s[0]}" aria-pressed="${sel === s[0]}"><span class="pill ${s[3] === 1 ? 'ok' : s[3] === 2 ? 'warn' : ''}">${s[3] === 1 ? L('gezeigt', 'shown') : s[3] === 2 ? L('Vision', 'Vision') : L('später', 'later')}</span><b>${s[1]}</b><span>${s[2]}</span></button>`).join('')}</div>
      <p class="small muted">${L('Seine Regeln bleiben dieselben: kein OP-Saal, keine Strahlung, kein Start ohne Mensch, keine Bilder. Einen C-Bogen zu bewegen, bräuchte eine eigene Sicherheitsbetrachtung.', 'Its rules stay the same: no operating room, no radiation, no start without a human, no images. Moving a C-arm would need its own safety assessment.')}</p></section>`;
  }
  /* Helpers that the wider platform would add, and how independent the AI may be per service. */
  const moreHelpers = () => `<section class="card" style="margin-top:14px"><div class="row"><h2 style="margin:0">${L('Neue Helfer für die weiteren Dienste', 'New helpers for the further services')}</h2>${out()}</div><div class="helfer" style="margin-top:12px">${[
    [L('Empfang', 'Front desk'), L('Bereitet Servicetermine vor und macht den Vorab-Check.', 'Prepares service visits and runs the pre-visit check.'), L('Bestellt einen Techniker nur mit Zusage der Klinik', 'Books a technician only with the hospital’s consent')],
    ['Coach', L('Kümmert sich um Kurzschulung nach Updates und um Einweisungen.', 'Takes care of short lessons after updates and of instruction sessions.'), L('Bewertet keine Personen', 'Never rates people')],
    [L('Chronist', 'Chronicler'), L('Schreibt Nachweise für Prüfungen und IT-Sicherheit mit.', 'Keeps the records for checks and IT security.'), L('Ändert und löscht keine Einträge', 'Never changes or deletes entries')],
    [L('Lagerist', 'Storekeeper'), L('Reserviert Teile für Servicetermine und lässt sie zum Gerät bringen.', 'Reserves parts for service visits and has them brought to the device.'), L('Bestellt nichts ohne Freigabe', 'Never orders anything without release')],
  ].map((h) => `<div class="dec ai"><div class="who"><span class="dot"></span>${h[0]}</div><div class="small">${h[1]}</div><div class="small muted">${L('Nie', 'Never')}: ${h[2]}</div></div>`).join('')}</div>
    <div class="grid g2" style="margin-top:14px"><div class="dec"><b>${L('Drei Stufen, je Dienst einstellbar', 'Three levels, adjustable per service')}</b><ol class="rules"><li>${L('Die KI schlägt vor.', 'The AI proposes.')}</li><li>${L('Die KI handelt nach Freigabe.', 'The AI acts after release.')}</li><li>${L('Die KI handelt selbst und meldet es.', 'The AI acts on its own and reports it.')}</li></ol><div class="small muted">${L('Der Start eines Updates bleibt immer bei einem Menschen. Stufe 3 nur für Aufgaben ohne klinische Folge und ohne Datenweitergabe, etwa Logs holen. Prüfungen, Einweisung und Rückkanal höchstens Stufe 2.', 'Starting an update always stays with a human. Level 3 only for tasks without clinical consequence and without passing on data, such as fetching logs. Checks, instruction and the back-channel at most level 2.')}</div></div><div>${crew()}</div></div></section>`;

  /* ---------- C-ARMAGOTCHI app on the phone (pitch scene 1) ----------
     The app the C-arm's team has on the phone. Three moods of Cio are shown one after the other, then the team
     overview with the claim. The moods are a showcase: they do not change the demo state, so the board that
     follows still starts fresh. Mood -> figure follows PET_IMG (matt -> lonely, hungrig -> manic, froh -> bliss).
     S.app is the step (0 to 2 the moods, 3 the overview). appFrom is the step shown before, set by ACT.scene for
     exactly one render, so the old screen stays under the new one while that fades in. */
  let appFrom = null;
  const appMoodL = (m) => ({ matt: L('einsam', 'lonely'), hungrig: L('hungrig', 'hungry'), froh: L('munter', 'happy') }[m] || moodL(m));
  const appTone = (m) => ({ matt: 'bad', fehl: 'bad', froh: 'ok' }[m] || 'warn');
  const APP_POINTS = () => [L('Strom', 'Power'), L('Netz', 'Network'), L('Standort', 'Location'), L('Akku', 'Battery'), L('Software-Version', 'Software version'), L('Nutzung', 'Usage')];
  function appStates(d) {
    return [
      { m: 'matt', word: L('Einsam', 'Lonely'), status: L(`Keine Verbindung · letzte Logs ${ago(d)}`, `No connection · last logs ${ago(d)}`),
        say: L('Seit Tagen verbindet mich niemand. Ist da jemand?', 'Nobody has connected me for days. Is anyone out there?'),
        vals: [[L('Netz', 'Network'), L('aus', 'off')], [L('Letzte Logs', 'Last logs'), ago(d)], [L('Standort', 'Location'), X(d.ort)]],
        data: [[L('Netz', 'Network'), L('aus', 'off')], [L('Letzte Logs', 'Last logs'), ago(d)]], btn: L('Weck mich auf', 'Wake me up') },
      { m: 'hungrig', word: L('Hungrig', 'Hungry'), status: L('Kein Strom · Update 4.2.1 fällig', 'No power · update 4.2.1 due'),
        say: L('Ich habe Hunger! Hier gibt es keinen Strom, und mein Update ist fällig.', 'I am hungry! No power out here, and my update is due.'),
        vals: [[L('Strom', 'Power'), L('fehlt', 'none')], [L('Akku', 'Battery'), d.akku + ' %'], [L('Update fällig', 'Update due'), L(`in ${days(d.update.frist)}`, `in ${days(d.update.frist)}`)]],
        data: [[L('Strom', 'Power'), L('nicht eingesteckt', 'not plugged in')], [L('Software-Version', 'Software version'), L(`${d.sw}, 4.2.1 fällig`, `${d.sw}, 4.2.1 due`)]], btn: L('Steck mich ein', 'Plug me in') },
      { m: 'froh', word: L('Munter', 'Happy'), status: L('Aktualisiert und verbunden', 'Updated and connected'),
        say: L('Alles frisch. Danke fürs Kümmern!', 'All fresh. Thanks for looking after me!'),
        vals: [['Software', '4.2.1'], [L('Netz', 'Network'), L('verbunden', 'connected')], [L('Letzte Logs', 'Last logs'), L('gerade eben', 'just now')]],
        data: [[L('Software-Version', 'Software version'), L('4.2.1, aktuell', '4.2.1, up to date')], [L('Netz', 'Network'), L('verbunden', 'connected')]], btn: L('Danke!', 'Thanks!') },
    ];
  }
  function appScreen(step, cls) {
    const d = dev('C-03'), note = `<div class="nt">${L('Erfundene Daten · Konzept-App · kein Medizinprodukt', 'Invented data · concept app · not a medical device')}</div>`;
    if (step >= APP_STEPS - 1) {
      const sat = D.DEVICES.filter((x) => mood(x) === 'froh').length;
      return `<div class="lay ${cls}"><div class="ah"><b>C-ARMAGOTCHI</b><span>${L('Team · OP-Trakt', 'Team · OR suite')}</span></div>
        <div class="tm">${D.DEVICES.map((x) => { const m = mood(x); return `<div>${fig(PET_IMG[m], `pet m-${m}`, 76, `${x.name}, ${appMoodL(m)}`)}<b>${x.name}</b><span class="tg ${appTone(m)}">${appMoodL(m)}</span></div>`; }).join('')}</div>
        <div class="sum"><span><b class="num">${sat} ${L('von', 'of')} ${D.DEVICES.length}</b> ${L('munter', 'happy')}</span><div class="lv"><i style="width:${sat / D.DEVICES.length * 100}%"></i></div></div>${note}</div>`;
    }
    const s = appStates(d)[step];
    return `<div class="lay ${cls}"><div class="ah"><b>C-ARMAGOTCHI</b><span>${d.id} · ${X(d.ort)}</span></div>
      <div class="stage">${fig(PET_IMG[s.m], `pet m-${s.m} live`, 268, `${d.name}, ${appMoodL(s.m)}`)}</div>
      <div class="nm">${d.name}</div><div class="st ${appTone(s.m)}"><i></i>${s.status}</div>
      <div class="q">“${s.say}”</div>
      <dl class="mt">${s.vals.map((v) => `<div><dt>${v[0]}</dt><dd>${v[1]}</dd></div>`).join('')}</dl>
      <button class="go" data-act="scene" data-a="1">${s.btn}</button>${note}</div>`;
  }
  function vApp() {
    const d = dev('C-03'), step = Math.max(0, Math.min(APP_STEPS - 1, S.app | 0)), team = step === APP_STEPS - 1;
    const from = appFrom; appFrom = null;
    const fade = from != null && from !== step;
    // The old screen is only a backdrop for the crossfade and leaves the page when the new one is fully visible.
    if (fade) setTimeout(() => document.querySelectorAll('.phone .lay.old').forEach((e) => e.remove()), 500);
    const s = team ? null : appStates(d)[step];
    const cap = team
      ? `<div class="eyebrow">C-ARMAGOTCHI</div><div class="claim">${L('Jede Stimmung ist ein <em>Datenpunkt.</em>', 'Every mood is a <em>data point.</em>')}</div>`
      : `<div class="eyebrow">${L('Stimmung', 'Mood')} ${step + 1} ${L('von', 'of')} ${APP_STEPS - 1}</div><div class="word">${s.word}</div>`;
    const dat = team
      ? `<div class="eyebrow">${L('Sechs Datenpunkte je C-Bogen', 'Six data points per C-arm')}</div><div class="pts">${APP_POINTS().map((x) => `<span>${x}</span>`).join('')}</div><div class="feeds">→ ${L('fließt ins Update-Cockpit', 'feeds the update cockpit')}</div><p class="small muted">${L('Keine Patientendaten, nur der Zustand des Geräts.', 'No patient data, only the state of the device.')}</p>`
      : `<div class="eyebrow">${L('Datenpunkt dahinter', 'Data point behind it')}</div><div class="rows">${s.data.map((x) => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>`;
    return `<div class="appstage${team ? ' team' : ''}${fade ? ' step' : ''}" data-act="scene" data-a="1" data-step="${step}">
      <div class="cap">${cap}</div>
      <div class="phone" role="group" aria-label="${L('C-ARMAGOTCHI-App auf dem Handy', 'C-ARMAGOTCHI app on the phone')}"><div class="sb"><span class="num">16:40</span><span aria-hidden="true">●●● ▮</span></div>${fade ? appScreen(from, 'old') : ''}${appScreen(step, fade ? 'in' : '')}</div>
      <div class="dat">${dat}</div></div>`;
  }

  /* ---------- phone with push notifications ----------
     Two phones of invented people: Lena (radiographer, late shift; she is the person whose view the role
     "Person at the device" shows, ME) and Dr Seidel (medical physics). A push pops the phone up; an answer on the
     phone runs the same action and the same rules as the button on screen. Critical pushes stay until answered.
     The scripted pitch tour of this dummy keeps its old behaviour without the phone. */
  let freshPush = 0, lastSheet = null;
  function pushAdd(who, k, o) {
    if (S.mode === 'pitch') return;
    const p = Object.assign({ n: ++S.pushN, who, k, read: false, at: hm(D.NOW + Math.min(9, S.push.length)) }, o || {});
    S.push.push(p);
    freshPush = p.n;
    S.ph.open = true; S.ph.who = who; S.ph.view = null; S.ph.note = null;
  }
  const jobOf = (typ, id) => S.jobs.find((j) => j.typ === typ && j.dev === id && !j.done) || S.jobs.slice().reverse().find((j) => j.typ === typ && j.dev === id);
  /* Jobs offered to Lena become pushes on her phone. */
  function syncPush() {
    if (S.mode === 'pitch') return;
    S.jobs.forEach((j) => {
      if (j.done || j.by || S.me !== 'frei') return;
      const to = offerTo(j);
      if (to && to.k === ME && !S.push.some((p) => p.k === 'job' && p.job === j.n)) pushAdd('lena', 'job', { job: j.n, dev: j.dev });
    });
  }
  function pushLive(p) {
    const w = p.dev ? win(p.dev) : null;
    if (p.k === 'job') { const j = S.jobs.find((x) => x.n === p.job); return !!j && !j.done && (j.by === ME || (offerTo(j) || {}).k === ME); }
    if (p.k === 'start') return !!w && w.status === 'bereit';
    if (p.k === 'plug') return !!w && ['geplant', 'bereit'].includes(w.status) && !S.plugged[p.dev] && !(S.alarm && p.dev === 'C-01');
    if (p.k === 'alarm') return !!S.alarm && !S.alarm.ack;
    if (p.k === 'fail') return !!S.fail[p.f] && !S.fail[p.f].ack;
    return !p.read;
  }
  const PHONE = () => ({ lena: { n: 'Lena', r: L('MTR · Spätdienst', 'Radiographer · late shift') }, mp: { n: 'Dr. Seidel', r: L('Medizinphysik', 'Medical physics') } });
  const asRole = (r, fn) => { const k = S.role; S.role = r; try { fn(); } finally { S.role = k; } };
  const icoImg = () => `<span class="ic">${fig('bliss', 'pet', 22, '')}</span>`;
  function pushText(p) {
    const d = p.dev ? dev(p.dev) : null, w = d ? win(d.id) : null;
    if (p.k === 'job') { const j = S.jobs.find((x) => x.n === p.job), t = j ? jobL(j) : null; if (!t) return [L('Auftrag', 'Job'), '']; return [j.by === ME ? L('Dein Auftrag', 'Your job') + ': ' + t.t : (j.typ === 'strom' ? L(`${d.name} braucht eine Hand`, `${d.name} needs a hand`) : t.t), `${X(t.ort)} · ${L(`etwa ${t.min} min`, `about ${t.min} min`)} · ${dist(staff(ME), j)} m`]; }
    if (p.k === 'start') return [L(`${d.name} ist bereit`, `${d.name} is ready`), L(`Umgebung frei, Paket geprüft. Start um ${w ? hm(w.from) : ''} bestätigen?`, `Surroundings clear, package verified. Confirm the start at ${w ? hm(w.from) : ''}?`)];
    if (p.k === 'plug') return [L(`${d.name} hat eine kleine Bitte`, `${d.name} has one small request`), L(`Heute bitte eingesteckt in ${d.ort} lassen.`, `Please leave me plugged in in ${XS(d.ort)} today.`)];
    if (p.k === 'back') return [L(`${d.name} hat sich zurückgemeldet`, `${d.name} reported back`), L('Version 4.2.1, Logs übertragen, ohne Patientendaten.', 'Version 4.2.1, logs transferred, without patient data.')];
    if (p.k === 'thanks') return [L(`${d.name} ist wieder munter`, `${d.name} is happy again`), L('Danke ans Team. Pflege-Serie Spätdienst +1.', 'Thanks to the team. Late shift care streak +1.')];
    if (p.k === 'fail') return [L(`Wächter: ${d.name} nicht zurückgemeldet`, `Guardian: ${d.name} did not report back`), L(`Ersatz ${dev(S.fail[p.f].ersatz).name} steht bereit. Bitte bestätigen.`, `Replacement ${dev(S.fail[p.f].ersatz).name} is ready. Please confirm.`)];
    if (p.k === 'alarm') return [L('Polytrauma: dein Plan ändert sich', 'Polytrauma: your plan changes'), S.alarm ? pick(S.alarm.text).replace(/^[^.]*\.\s*/, '') : ''];
    return [pick(p.tt), pick(p.bb)];
  }
  function sheet(p) {
    const d = p.dev ? dev(p.dev) : null, w = d ? win(d.id) : null;
    const back = `<button class="back" data-act="phback">‹ ${L('Mitteilungen', 'Notifications')}</button>`;
    const head = (img, cls, t, sub) => `<div class="jt ${cls}">${img}<div><b>${t}</b><span>${sub}</span></div></div>`;
    if (p.k === 'job') {
      const j = S.jobs.find((x) => x.n === p.job), t = jobL(j);
      if (j.by === ME) return `${back}${head(fig(PET_IMG[mood(d)], 'pet', 72, d.name), '', L('Dein Auftrag', 'Your job'), t.t)}<ul class="ck">${t.todo.map((x) => `<li><i>✓</i>${x}</li>`).join('')}</ul><p class="sm">${L('Du entscheidest nichts. Den Start bestätigt die Medizinphysik.', 'You decide nothing. Medical physics confirms the start.')}</p><div class="bt"><button class="go2" data-act="phdone" data-a="${j.n}">${L('Erledigt', 'Done')}</button></div>`;
      return `${back}${head(fig(PET_IMG[mood(d)], 'pet', 72, d.name), '', pushText(p)[0], `C-ARMAGOTCHI · ${d.id}`)}<ul class="li"><li><span>${L('Was', 'What')}</span><b>${t.t}</b></li><li><span>${L('Wo', 'Where')}</span><b>${X(t.ort)} · ${dist(staff(ME), j)} m</b></li><li><span>${L('Dauer', 'Time')}</span><b>${L(`etwa ${t.min} Minuten`, `about ${t.min} minutes`)}</b></li></ul><p class="sm">${L(`Du wirst gefragt, weil du im Dienst, laut Plan frei${j.typ === 'aufsicht' ? ', eingewiesen' : ''} und am nächsten bist. Ablehnen braucht keinen Grund.`, `You are asked because you are on duty, free per roster${j.typ === 'aufsicht' ? ', trained' : ''} and the nearest. Declining needs no reason.`)}</p><div class="bt"><button class="go2" data-act="phacc" data-a="${j.n}">${L('Annehmen', 'Accept')}</button><button class="no" data-act="phdec" data-a="${j.n}">${L('Passt gerade nicht', 'Not right now')}</button></div>`;
    }
    if (p.k === 'start') {
      const c = startCheck(d.id), items = [[L('Fenster freigegeben', 'Window released'), w.status !== 'vorschlag'], [L('Umgebung frei, gemeldet vom Roboter', 'Surroundings clear, reported by the robot'), !!w.umgebungFrei], [L('Paket signiert und geprüft', 'Package signed and verified'), !!w.paketGeprueft], [L('Kein Eingriff, kein Alarm', 'No procedure, no alarm'), c.ok]];
      return `${back}${head(ketty(72), 'ok', L(`${d.name} ist bereit`, `${d.name} is ready`), `${d.id} · ${X(d.ort)} · ${hm(w.from)}–${hm(w.to)}`)}<ul class="ck">${items.map((x) => `<li><i class="${x[1] ? '' : 'no'}">${x[1] ? '✓' : '×'}</i>${x[0]}</li>`).join('')}</ul><div class="bt"><button class="warm" data-act="phstart" data-a="${d.id}" ${c.ok ? '' : 'disabled'}>${L('Update starten', 'Start update')}</button></div><div class="human">${L('Ein Mensch startet jedes Update.', 'A human starts every update.')}</div>`;
    }
    if (p.k === 'plug') return `${back}${head(fig(PET_IMG[mood(d)], 'pet', 72, d.name), '', L(`${d.name} hat eine Bitte`, `${d.name} has a request`), `${d.id} · ${X(d.ort)}`)}<p class="sm" style="font-size:16px;color:#0b1216">“${L(`Heute bitte eingesteckt lassen. Das Update startet die Medizinphysik um ${w ? hm(w.from) : ''} aus der Ferne.`, `Please leave me plugged in today. Medical physics starts the update remotely at ${w ? hm(w.from) : ''}.`)}”</p><div class="bt"><button class="go2" data-act="phplug" data-a="${d.id}">${L('Bleibt eingesteckt', 'Stays plugged in')}</button></div>`;
    if (p.k === 'alarm') return `${back}${head(fig('failure', 'pet', 72, ''), 'bad', L('Polytrauma-Alarm', 'Polytrauma alarm'), L('Nur deine Änderung', 'Only your change'))}<p class="sm" style="font-size:15px;color:#0b1216">${esc(S.alarm ? pick(S.alarm.text) : '')}</p><div class="bt"><button class="warm" data-act="phack" data-a="alarm">${L('Verstanden', 'Understood')}</button></div>`;
    if (p.k === 'fail') { const f = S.fail[p.f], e = dev(f.ersatz); return `${back}${head(fig('failure', 'pet', 72, ''), 'bad', L(`${d.name} meldet sich nicht`, `${d.name} does not report back`), L(`Erwartet bis ${f.bis}`, `Expected by ${f.bis}`))}<ul class="ck"><li><i>✓</i>${L(`Ersatz ${e.name} steht bereit (${e.ort})`, `Replacement ${e.name} is ready (${X(e.ort)})`)}</li><li><i>✓</i>${L('Service ist informiert', 'Service is informed')}</li><li><i>✓</i>${L('Jemand in der Nähe schaut kurz nach', 'Someone nearby has a quick look')}</li></ul><div class="bt"><button class="warm" data-act="phack" data-a="${p.f}">${L('Bestätigen', 'Confirm')}</button></div>`; }
    const tx = pushText(p), img = p.k === 'back' || p.k === 'thanks' ? fig('bliss', 'pet', 72, '') : ketty(72);
    return `${back}${head(img, p.k === 'info' && p.crit ? 'bad' : 'ok', tx[0], p.at)}<p class="sm" style="font-size:15px;color:#0b1216">${tx[1]}</p>${p.k === 'thanks' ? `<div class="big"><b>+1</b><span>${L('Pflege-Serie, gezählt je Schicht, nie je Person', 'Care streak, counted per shift, never per person')}</span></div>` : ''}<div class="bt"><button class="go2" data-act="phread" data-a="${p.n}">OK</button></div>`;
  }
  function renderPhone() {
    const el = $('phone'), tab = $('phtab');
    if (!el) return;
    syncPush();
    const live = S.push.filter(pushLive), mine = live.filter((p) => p.who === S.ph.who).reverse();
    const show = S.mode !== 'pitch' && S.ph.open;
    el.className = 'ph' + (show ? '' : ' off');
    document.body.classList.toggle('phone-open', show);
    tab.hidden = S.mode === 'pitch' || show;
    tab.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>${L('Handys', 'Phones')}${live.length ? `<b>${live.length}</b>` : ''}`;
    tab.classList.toggle('ring', !!freshPush && !show);
    if (!show) { freshPush = 0; el.innerHTML = ''; lastSheet = null; return; }
    const ph = PHONE(), who = ph[S.ph.who];
    let p = S.ph.view ? S.push.find((x) => x.n === S.ph.view) : null;
    if (p && !pushLive(p) && p.k !== 'job') { S.ph.view = null; p = null; }
    if (p && p.k === 'job' && !pushLive(p)) { S.ph.view = null; p = null; }
    const key = p ? p.n + ':' + (p.k === 'job' ? ((S.jobs.find((x) => x.n === p.job) || {}).by || '') : '') : S.ph.note ? 'note' : '';
    const anim = key !== lastSheet; lastSheet = key;
    const note = !p && S.ph.note ? `<div class="sheet${anim ? '' : ' still'}"><div class="big"><b>${pick(S.ph.note[0])}</b><span>${pick(S.ph.note[1])}</span></div><div class="bt"><button class="no" data-act="phback">OK</button></div></div>` : '';
    const owners = Object.keys(ph).map((k) => { const n = live.filter((x) => x.who === k).length; return `<button class="${S.ph.who === k ? 'on' : ''}" data-act="phwho" data-a="${k}">${ph[k].n}${n ? ` <b>${n}</b>` : ''}</button>`; }).join('');
    el.innerHTML = `<div class="scr"><div class="isl"></div><div class="sbar"><span class="num">${hm(D.NOW)}</span><span aria-hidden="true">●●● ▮</span></div><button class="x" data-act="phclose" aria-label="${L('Handy zuklappen', 'Put the phone away')}">✕</button>
      <div class="lock"><div class="owners" role="group" aria-label="${L('Wessen Handy', 'Whose phone')}">${owners}</div><div class="who">${who.n} · ${who.r}</div><div class="tm">${hm(D.NOW)}</div><div class="dt">${L('Mittwoch, 18. November', 'Wednesday, 18 November')}</div>
      ${mine.map((x) => { const t = pushText(x); return `<button class="pu${x.n === freshPush ? ' new' : ''}${['alarm', 'fail'].includes(x.k) || x.crit ? ' crit' : ''}" data-act="phview" data-a="${x.n}"><span class="ph-h">${icoImg()}<b>C-ARMAGOTCHI</b><span>${x.at}</span></span><span class="pt">${t[0]}</span><span class="pb">${t[1]}</span></button>`; }).join('') || `<div class="empty">${L('Keine Mitteilungen', 'No notifications')}</div>`}</div>
      ${p ? `<div class="sheet${anim ? '' : ' still'}">${sheet(p)}</div>` : note}</div>`;
    freshPush = 0;
  }
  const phFocus = (who, k) => { S.ph.open = true; S.ph.who = who; S.ph.note = null; const p = S.push.filter((x) => x.who === who && (!k || x.k === k) && pushLive(x)).pop(); S.ph.view = p ? p.n : null; };

  /* ---------- guided demo: key journeys ----------
     Each journey is a list of steps. A step prepares its screen (go), knows when it is done (ok), can do its click
     itself ("Show me", run) and points at the one thing to click next (spot). Jumping ahead runs the clicks of the
     steps before it, so no step ever opens on an empty screen. Back only shows the screen again, it undoes nothing. */
  const stOf = (id) => (win(id) || {}).status;
  const ensure = {
    filled: () => { if (!S.filled) { doFill(); if (!S.sel) S.sel = 'C-03'; } },
    rel: (id) => { ensure.filled(); if (stOf(id) === 'vorschlag') release(id); },
    hand: () => { ensure.rel('C-03'); if (stOf('C-03') === 'geplant' && !S.rob && !S.jobs.some((j) => j.typ === 'strom' && j.dev === 'C-03')) jobNew('strom', 'C-03'); },
    robot: (id) => { ensure.rel(id); if (!S.rob && stOf(id) === 'geplant') asRole('mp', () => ACT.robot(id)); },
    ready: (id) => { ensure.robot(id); const r = S.rob; if (r && r.id === id && r.step < READY_STEP && !r.hold && !r.man) { r.step = READY_STEP; r.sub = 0; r.t = Date.now(); ready(id); if (stOf(id) !== 'bereit') r.step = READY_STEP - 1; } },
    started: (id) => { ensure.ready(id); if (stOf(id) === 'bereit') asRole('mp', () => ACT.start(id)); },
    done: (id) => { ensure.started(id); if (stOf(id) === 'laeuft') ACT.finish(id); },
  };
  /* "Show me" for a start: the robot is fast-forwarded to "surroundings clear", then the start is confirmed on the phone. */
  const startOnPhone = (id) => { ensure.ready(id); if (stOf(id) === 'bereit') { S.ph.open = true; S.ph.who = 'mp'; ACT.phstart(id); } };
  const lenaAnswer = (typ, id, how) => { const j = jobOf(typ, id); if (!j || j.done) return; asRole('nurse', () => { S.me = 'frei'; if (how === 'no') { if ((offerTo(j) || {}).k === ME) ACT.jobdec(j.n); return; } if (!j.by && (offerTo(j) || {}).k === ME) ACT.jobacc(j.n); if (how === 'done' && j.by === ME) jobDone(j); }); };
  const nobodyLeft = (typ, id) => { const j = jobOf(typ, id); let k = 0; while (j && !j.done && !j.by && offerTo(j) && k++ < 12) { const to = offerTo(j); if (to.k === ME) lenaAnswer(typ, id, 'no'); else j.no.push(to.k); } };
  const jobState = (typ, id) => { const j = jobOf(typ, id); return !j ? '' : j.done ? 'done' : j.by ? 'by' : offerTo(j) ? 'open' : 'none'; };
  const NOTE_NO = () => [['Kein Problem.', 'No problem.'], ['Die nächste Person wird gefragt.', 'The next person is asked.']];
  const step = (o) => o;
  const JOURNEYS = [
    { k: 'rundgang', p: 'ALL', n: () => L('Rundgang durch alle Bereiche', 'Tour of all areas'), who: () => L('Für den Folgetermin · frei klickbar', 'For the follow-up · free to click'), d: () => L('Die 13 Szenen der Vertiefung: großes Bild, Fenster, Roboter, Aufträge, Akte, Ausblick, Ihre Sicht.', 'The 13 deep-dive scenes: big picture, window, robot, jobs, file, outlook, your view.'), steps: SCENES },
    { k: 'cio', p: 'EAP', auto: true, n: () => L('Cio wird wieder munter', 'Cio gets happy again'), who: () => L('Ganzer Ablauf · Medizinphysik und Lena', 'End to end · medical physics and Lena'), d: () => L('Vom hungrigen C-Bogen über das goldene Fenster und den Roboter bis zur Rückmeldung. Die Langfassung des Pitch.', 'From a hungry C-arm via the golden window and the robot to the report. The long version of the pitch.'), steps: [
      step({ c: () => 'Cio', t: () => L('Cio ist hungrig', 'Cio is hungry'), s: () => L('Das ist Cio, ein C-Bogen im Flur B. Kein Strom, das Sicherheitsupdate ist fällig, seit neun Tagen keine Logs. Seine Stimmung zeigt auf einen Blick, wie lange sich niemand gekümmert hat. Für die Planung heißt das: Cio zuerst.', 'This is Cio, a C-arm in Corridor B. No power, the security update is due, no logs for nine days. Its mood shows at a glance how long nobody has cared. For planning that means: Cio first.'), h: () => L('Begleiter am Gerät: Stimmung, sechs Bedürfnisse und die Daten dahinter.', 'Companion at the device: mood, six needs and the data behind them.'), go: () => { S.route = 'begleiter'; S.pet = 'C-03'; S.role = 'mp'; }, spot: '.device' }),
      step({ c: () => L('Fenster finden', 'Find the window'), t: () => L('Ein Knopfdruck', 'One push of a button'), s: () => L('Der Lotse kennt den OP-Plan, die Absagen und die Nutzung. Er legt die Woche um die Eingriffe herum. Gestrichelt heißt Vorschlag der KI, geplant ist erst, was ein Mensch freigibt.', 'The Pilot knows the OR schedule, the cancellations and the usage. It lays out the week around the procedures. Dashed means an AI proposal, only what a human releases is planned.'), h: () => L('„Lücken füllen“ klicken.', 'Click “Fill the gaps”.'), go: () => { S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.role = 'mp'; S.rows = 'geraete'; }, run: (show) => { if (S.filled) return; if (show) ACT.fill(); else ensure.filled(); }, ok: () => S.filled, spot: '.banner [data-act="fill"]' }),
      step({ c: () => L('Freigeben', 'Release'), t: () => L('Die Medizinphysik sagt Ja', 'Medical physics says yes'), s: () => L('Eine einzige Entscheidung. Fenster, Ersatzgerät und Restrisiko stehen dabei. Freigegeben wird von einem Menschen, mit einem Klick.', 'One single decision. Window, replacement device and residual risk are right there. A human releases it, with one click.'), h: () => L('Cios Fenster ist offen: „Fenster freigeben“.', 'Cio’s window is open: “Release window”.'), go: () => { ensure.filled(); S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.role = 'mp'; S.sel = 'C-03'; }, run: () => ensure.rel('C-03'), ok: () => !!stOf('C-03') && stOf('C-03') !== 'vorschlag', spot: '.panel [data-act="rel"]' }),
      step({ c: () => L('Hand anfragen', 'Ask for a hand'), t: () => L('Wer ist in der Nähe?', 'Who is nearby?'), s: () => L('Cio braucht Strom und Netz. Der Leitstand fragt die nächste freie Person, wie bei einem Fahrdienst. Gefragt wird immer nur eine Person, und nur wer im Dienst und frei ist.', 'Cio needs power and network. The control room asks the nearest free person, like a ride request. Only one person is asked at a time, and only those on duty and free.'), h: () => L('„Eine Hand für Cio anfragen“ klicken. Lenas Handy meldet sich.', 'Click “Ask for a hand for Cio”. Lena’s phone lights up.'), go: () => { ensure.rel('C-03'); S.route = 'leitstand'; S.role = 'mp'; }, run: () => ensure.hand(), ok: () => !!jobOf('strom', 'C-03'), spot: '[data-act="jobnew"][data-a="strom:C-03"]' }),
      step({ c: () => 'Lena', t: () => L('Ablehnen kostet nichts', 'Declining costs nothing'), s: () => L('Lena, MTR im Spätdienst, bekommt eine Auftragskarte: was, wo, wie lange und warum gerade sie. Heute passt es nicht. Ein Tipp, kein Grund nötig, dann wird die nächste Person gefragt.', 'Lena, radiographer on the late shift, gets a job card: what, where, how long and why her. Today it does not fit. One tap, no reason needed, then the next person is asked.'), h: () => L('Auf Lenas Handy die Nachricht öffnen, dann „Passt gerade nicht“.', 'Open the notification on Lena’s phone, then “Not right now”.'), go: () => { ensure.hand(); S.route = 'leitstand'; S.role = 'mp'; if (jobState('strom', 'C-03') === 'open') phFocus('lena', 'job'); }, run: () => { lenaAnswer('strom', 'C-03', 'no'); S.ph.view = null; S.ph.note = NOTE_NO(); }, ok: () => { const j = jobOf('strom', 'C-03'); return !!j && (j.no.includes(ME) || j.done); }, spot: '#phone [data-act="phdec"], #phone .pu' }),
      step({ c: () => L('Niemand frei', 'Nobody free'), t: () => L('Wie ein Fahrdienst', 'Like a ride request'), s: () => L('Der Leitstand fragt der Reihe nach, die Nächste zuerst, den Rufdienst zuletzt. Wer im Eingriff ist oder frei hat, sieht nichts. Heute sagt niemand zu.', 'The control room asks one after another, nearest first, the on-call service last. Whoever is in a procedure or off duty sees nothing. Today nobody accepts.'), h: () => L('„Vorspulen: lehnt ab“ klicken, bis niemand mehr gefragt wird.', 'Click “Fast forward: declines” until nobody is asked any more.'), go: () => { ensure.hand(); if (jobState('strom', 'C-03') === 'open' && (offerTo(jobOf('strom', 'C-03')) || {}).k === ME) lenaAnswer('strom', 'C-03', 'no'); S.route = 'leitstand'; S.role = 'mp'; S.ph.open = false; }, run: () => nobodyLeft('strom', 'C-03'), ok: () => ['none', 'done'].includes(jobState('strom', 'C-03')) || !!S.rob, spot: '[data-act="jobskip"]' }),
      step({ c: () => L('Roboter', 'Robot'), t: () => L('Zeit für den unsichtbaren Helfer', 'Time for the invisible helper'), s: () => L('Der Roboter übernimmt: Selbsttest, Fahrt durch die Flure, C-Bogen finden und erkennen, andocken, Umgebung prüfen. Er fährt in keinen OP-Saal und startet nichts selbst.', 'The robot takes over: self-test, drive through the corridors, find and identify the C-arm, dock, check the surroundings. It never enters an operating room and starts nothing itself.'), h: () => L('„Roboter zu Cio schicken“ klicken und zusehen, wie er die Schritte abhakt.', 'Click “Send the robot to Cio” and watch it tick off the steps.'), go: () => { ensure.rel('C-03'); S.route = 'roboter'; S.role = 'mp'; S.ph.open = false; }, run: () => ensure.robot('C-03'), ok: () => !!S.rob, spot: '[data-act="robot"]' }),
      step({ c: () => L('Mensch startet', 'Human starts'), t: () => L('Ein Mensch startet jedes Update', 'A human starts every update'), s: () => L('Der Roboter meldet „Umgebung frei“. Erst jetzt bekommt Dr. Seidel aus der Medizinphysik eine Nachricht: alle Prüfungen grün, Start bestätigen? Die Regel dahinter ist getesteter Code, keine KI.', 'The robot reports “surroundings clear”. Only now does Dr Seidel from medical physics get a message: all checks green, confirm the start? The rule behind it is tested code, not AI.'), h: () => L('Warten, bis der Roboter „Umgebung frei“ meldet. Dann auf dem Handy „Update starten“.', 'Wait until the robot reports “surroundings clear”. Then “Start update” on the phone.'), go: () => { ensure.robot('C-03'); S.route = 'roboter'; S.role = 'mp'; if (stOf('C-03') === 'bereit') phFocus('mp', 'start'); }, run: () => startOnPhone('C-03'), ok: () => ['laeuft', 'fertig', 'fehl'].includes(stOf('C-03')), spot: '#phone [data-act="phstart"], #phone .pu' }),
      step({ c: () => L('Rückmeldung', 'Report'), t: () => L('Das Gerät meldet sich zurück', 'The device reports back'), s: () => L('Der Wächter kennt das erwartete Ende. Cio meldet sich zurück: Version 4.2.1, Logs übertragen, ohne Patientendaten. Niemand hat telefoniert.', 'The Guardian knows the expected end. Cio reports back: version 4.2.1, logs transferred, without patient data. Nobody made a call.'), h: () => L('Die Rückmeldung kommt nach wenigen Sekunden von selbst.', 'The report arrives on its own after a few seconds.'), go: () => { ensure.started('C-03'); S.route = 'roboter'; S.role = 'mp'; }, run: () => ensure.done('C-03'), ok: () => stOf('C-03') === 'fertig' }),
      step({ c: () => 'Loop', t: () => L('Der Kreis schließt sich', 'The loop closes'), s: () => L('Cio ist munter, und das Team bekommt ein Danke. Jede Stimmung ist wieder ein Datenpunkt für das nächste Fenster.', 'Cio is happy, and the team gets a thank-you. Every mood is a data point for the next window again.'), h: () => L('Lenas Handy zeigt das Danke, im Begleiter ist Cio munter.', 'Lena’s phone shows the thank-you, in the companion Cio is happy.'), go: () => { ensure.done('C-03'); S.route = 'begleiter'; S.pet = 'C-03'; S.role = 'mp'; phFocus('lena', 'thanks'); } }),
    ] },
    { k: 'lena', p: 'EA', auto: true, n: () => L('Lena packt mit an', 'Lena lends a hand'), who: () => L('Person in der Nähe · MTR', 'Person nearby · radiographer'), d: () => L('Wie ein Auftrag bei der nächsten freien Person ankommt, angenommen und erledigt wird, und warum niemand Druck spürt.', 'How a job reaches the nearest free person, is accepted and done, and why nobody feels pressure.'), steps: [
      step({ c: () => L('Anfrage', 'Request'), t: () => L('Eine Hand für Cio', 'A hand for Cio'), s: () => L('Cios Fenster ist freigegeben, aber im Flur B gibt es keine Steckdose. Die Medizinphysik fragt eine Hand an statt des Roboters.', 'Cio’s window is released, but there is no socket in Corridor B. Medical physics asks for a hand instead of the robot.'), h: () => L('„Eine Hand für Cio anfragen“ klicken.', 'Click “Ask for a hand for Cio”.'), go: () => { ensure.rel('C-03'); S.route = 'leitstand'; S.role = 'mp'; }, run: () => ensure.hand(), ok: () => !!jobOf('strom', 'C-03'), spot: '[data-act="jobnew"][data-a="strom:C-03"]' }),
      step({ c: () => L('Annehmen', 'Accept'), t: () => L('Lenas Handy', 'Lena’s phone'), s: () => L('Lena ist im Dienst und laut Plan frei, und sie ist am nächsten. Sie sieht, was, wo und wie lange. Heute passt es, sie nimmt an.', 'Lena is on duty and free per roster, and she is the nearest. She sees what, where and how long. Today it fits, she accepts.'), h: () => L('Nachricht öffnen, „Annehmen“.', 'Open the notification, “Accept”.'), go: () => { ensure.hand(); S.route = 'leitstand'; S.role = 'mp'; phFocus('lena', 'job'); }, run: () => { lenaAnswer('strom', 'C-03', 'yes'); phFocus('lena', 'job'); }, ok: () => ['by', 'done'].includes(jobState('strom', 'C-03')), spot: '#phone [data-act="phacc"], #phone .pu' }),
      step({ c: () => L('Erledigt', 'Done'), t: () => L('Drei Handgriffe, keine Entscheidung', 'Three actions, no decision'), s: () => L('Gerät zur Steckdose, Strom und Netz einstecken, erledigt melden. Lena entscheidet nichts und ist für nichts verantwortlich. Der Begleiter meldet: eingesteckt, Gerät in Ruhe, Paket geprüft.', 'Device to the socket, plug in power and network, report done. Lena decides nothing and is responsible for nothing. The companion reports: plugged in, device at rest, package verified.'), h: () => L('Auf dem Handy „Erledigt“.', '“Done” on the phone.'), go: () => { ensure.hand(); lenaAnswer('strom', 'C-03', 'yes'); S.route = 'leitstand'; S.role = 'mp'; phFocus('lena', 'job'); }, run: () => lenaAnswer('strom', 'C-03', 'done'), ok: () => jobState('strom', 'C-03') === 'done', spot: '#phone [data-act="phdone"], #phone .pu' }),
      step({ c: () => L('Start', 'Start'), t: () => L('Dr. Seidel bestätigt', 'Dr Seidel confirms'), s: () => L('Erst jetzt, mit „Umgebung frei“, kann ein Mensch den Start bestätigen. Dr. Seidel tut das vom Handy aus, ohne in den OP zu gehen.', 'Only now, with “surroundings clear”, can a human confirm the start. Dr Seidel does it from her phone without walking to the OR.'), h: () => L('Auf Dr. Seidels Handy „Update starten“.', '“Start update” on Dr Seidel’s phone.'), go: () => { ensure.hand(); lenaAnswer('strom', 'C-03', 'done'); S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-03'; S.role = 'mp'; phFocus('mp', 'start'); }, run: () => startOnPhone('C-03'), ok: () => ['laeuft', 'fertig', 'fehl'].includes(stOf('C-03')), spot: '#phone [data-act="phstart"], #phone .pu' }),
      step({ c: () => L('Danke', 'Thanks'), t: () => L('Danke statt Kontrolle', 'Thanks instead of control'), s: () => L('Cio meldet sich zurück, Lena bekommt ein Danke. Gezählt wird je Schicht, nie je Person. Wer abgelehnt hat oder wer es war, wird nach dem Auftrag gelöscht.', 'Cio reports back, Lena gets a thank-you. It is counted per shift, never per person. Who declined or who did it is deleted after the job.'), h: () => L('Die Rückmeldung kommt von selbst, dann das Danke auf Lenas Handy.', 'The report arrives on its own, then the thank-you on Lena’s phone.'), go: () => { if (stOf('C-03') === 'bereit') asRole('mp', () => ACT.start('C-03')); S.route = 'leitstand'; S.role = 'mp'; if (stOf('C-03') === 'fertig') phFocus('lena', 'thanks'); }, run: () => { if (stOf('C-03') === 'laeuft') ACT.finish('C-03'); phFocus('lena', 'thanks'); }, ok: () => stOf('C-03') === 'fertig' }),
    ] },
    { k: 'alarm', p: 'A', n: () => L('Polytrauma mitten im Plan', 'Polytrauma in the middle of the plan'), who: () => L('Jede Rolle nur ihre Änderung', 'Each role only its own change'), d: () => L('Ein Notfall sperrt ein freigegebenes Fenster. Der Plan ordnet sich neu, und jede Person erfährt nur, was sich für sie ändert.', 'An emergency locks a released window. The plan rearranges, and each person only learns what changes for them.'), steps: [
      step({ c: () => 'Cora', t: () => L('Cora hat eine Bitte', 'Cora has a request'), s: () => L('Cora steht in Saal 1 an der Steckdose. Ihr Fenster ist heute, freigegeben von der Medizinphysik. Die Person am Gerät bekommt genau eine Bitte: eingesteckt lassen.', 'Cora stands in OR 1 at the socket. Her window is today, released by medical physics. The person at the device gets exactly one request: leave it plugged in.'), h: () => L('Auf Lenas Handy „Bleibt eingesteckt“.', '“Stays plugged in” on Lena’s phone.'), go: () => { ensure.rel('C-01'); S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-01'; S.role = 'mp'; if (!S.plugged['C-01']) phFocus('lena', 'plug'); }, run: () => { if (!S.plugged['C-01'] && ['geplant', 'bereit'].includes(stOf('C-01'))) asRole('nurse', () => ACT.plug('C-01')); }, ok: () => !!S.plugged['C-01'] || !!S.alarm, spot: '#phone [data-act="phplug"], #phone .pu' }),
      step({ c: () => L('Alarm', 'Alarm'), t: () => L('Der Schockraum braucht Cora', 'The trauma room needs Cora'), s: () => L('Ein Polytrauma kommt. Coras Fenster war noch nicht gestartet: Es wird gesperrt und neu geplant. Kein Update läuft je über einen Eingriff.', 'A polytrauma arrives. Cora’s window had not started yet: it is locked and replanned. No update ever runs over a procedure.'), h: () => L('„Polytrauma-Alarm auslösen“ klicken.', 'Click “Trigger polytrauma alarm”.'), go: () => { ensure.rel('C-01'); S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-01'; S.role = 'mp'; S.ph.open = false; }, run: () => { if (!S.alarm) alarm(); }, ok: () => !!S.alarm, spot: '[data-act="alarm"]' }),
      step({ c: () => L('Nur deine Änderung', 'Only your change'), t: () => L('Jede Rolle bekommt nur ihre Änderung', 'Each role only gets its own change'), s: () => L('Dr. Seidel sieht den neuen Plan, Lena nur, dass ihre Bitte entfällt. Die Warnung bleibt stehen, bis jemand sie bestätigt, sie verschwindet nicht als Toast.', 'Dr Seidel sees the new plan, Lena only that her request is void. The warning stays until someone confirms it, it does not vanish as a toast.'), h: () => L('Auf Dr. Seidels Handy „Verstanden“.', '“Understood” on Dr Seidel’s phone.'), go: () => { if (!S.alarm) { ensure.rel('C-01'); alarm(); } S.route = 'tafel'; S.sel = 'C-01'; S.role = 'mp'; if (!S.alarm.ack) phFocus('mp', 'alarm'); }, run: () => { if (S.alarm) S.alarm.ack = true; }, ok: () => !!S.alarm && S.alarm.ack, spot: '#phone [data-act="phack"], #phone .pu' }),
      step({ c: () => L('Neuer Plan', 'New plan'), t: () => L('Der Plan hat sich neu geordnet', 'The plan has rearranged itself'), s: () => L('Coras neues Fenster liegt nach dem Notfall, mit Ersatzgerät und Restrisiko. Wieder entscheidet ein Mensch. Ein laufendes Update wäre nicht abgebrochen worden.', 'Cora’s new window lies after the emergency, with a replacement device and residual risk. Again a human decides. A running update would not have been aborted.'), h: () => L('Coras Zeile auf der Tafel ansehen.', 'Look at Cora’s row on the board.'), go: () => { if (!S.alarm) { ensure.rel('C-01'); alarm(); } S.alarm.ack = true; S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-01'; S.role = 'mp'; S.ph.open = false; } }),
    ] },
    { k: 'fehler', p: 'PA', n: () => L('Wenn etwas schiefgeht', 'When something goes wrong'), who: () => L('Hindernis, Hilfe, Fehlschlag', 'Obstacle, help, failure'), d: () => L('Ein Bett versperrt den Flur, ein Update meldet sich nicht zurück. Der Roboter wartet, fragt um Hilfe, und der Wächter meldet, bevor jemand vor dem Gerät steht.', 'A bed blocks the corridor, an update does not report back. The robot waits, asks for help, and the Guardian reports before anyone stands in front of the device.'), steps: [
      step({ c: () => L('Losschicken', 'Send'), t: () => L('Der Roboter fährt los', 'The robot sets off'), s: () => L('Cios Fenster ist freigegeben, der Roboter übernimmt.', 'Cio’s window is released, the robot takes over.'), h: () => L('„Roboter zu Cio schicken“.', '“Send the robot to Cio”.'), go: () => { ensure.rel('C-03'); S.route = 'roboter'; S.role = 'mp'; }, run: () => ensure.robot('C-03'), ok: () => !!S.rob, spot: '[data-act="robot"]' }),
      step({ c: () => L('Bett im Flur', 'Bed'), t: () => L('Ein Bett steht im Flur B', 'A bed stands in Corridor B'), s: () => L('Der Roboter hält vor jedem Hindernis, fährt nicht drumherum und hält den Fluchtweg frei.', 'The robot stops before any obstacle, does not drive around it and keeps the escape route clear.'), h: () => L('„Bett im Flur“ klicken, solange er noch fährt.', 'Click “Bed in the corridor” while it is still driving.'), go: () => { ensure.robot('C-03'); S.route = 'roboter'; S.role = 'mp'; if (S.rob && S.rob.step > 2 && !held(S.rob, 'hindernis') && !S.jobs.some((j) => j.typ === 'weg')) { S.rob.step = 2; S.rob.sub = 1; } }, run: () => { const r = S.rob; if (r && !r.hold && !r.man) { if (r.step > 2) { r.step = 2; r.sub = 1; } r.hold = 'hindernis'; } }, ok: () => held(S.rob, 'hindernis') || S.jobs.some((j) => j.typ === 'weg'), spot: '[data-act="robst"]' }),
      step({ c: () => L('Hilfe', 'Help'), t: () => L('Der Roboter bittet um Hilfe', 'The robot asks for help'), s: () => L('Ein Bett wegstellen kann der Roboter nicht. Er fragt die nächste freie Person. Lena bekommt eine Zwei-Minuten-Aufgabe.', 'The robot cannot move a bed. It asks the nearest free person. Lena gets a two-minute task.'), h: () => L('„Hilfe in der Nähe anfragen“, dann auf Lenas Handy annehmen und erledigen.', '“Ask for help nearby”, then accept and finish on Lena’s phone.'), go: () => { S.route = 'roboter'; S.role = 'mp'; if (S.rob && !held(S.rob, 'hindernis') && !S.jobs.some((j) => j.typ === 'weg')) S.rob.hold = 'hindernis'; if (jobOf('weg', 'C-03')) phFocus('lena', 'job'); }, run: () => { if (!jobOf('weg', 'C-03') && S.rob) jobNew('weg', 'C-03'); const s0 = jobState('weg', 'C-03'); lenaAnswer('weg', 'C-03', s0 === 'by' ? 'done' : 'yes'); phFocus('lena', 'job'); }, ok: () => jobState('weg', 'C-03') === 'done', spot: '[data-act="jobnew"][data-a="weg:C-03"], #phone [data-act="phacc"], #phone [data-act="phdone"], #phone .pu' }),
      step({ c: () => L('Start', 'Start'), t: () => L('Weiter, prüfen, starten', 'On, check, start'), s: () => L('Der Flur ist frei, der Roboter fährt weiter, dockt an und meldet „Umgebung frei“. Dr. Seidel bestätigt den Start.', 'The corridor is clear, the robot drives on, docks and reports “surroundings clear”. Dr Seidel confirms the start.'), h: () => L('Auf Dr. Seidels Handy „Update starten“.', '“Start update” on Dr Seidel’s phone.'), go: () => { const j = jobOf('weg', 'C-03'); if (j && !j.done) jobDone(j); if (S.rob && held(S.rob, 'hindernis')) { S.rob.hold = null; } S.route = 'roboter'; S.role = 'mp'; if (stOf('C-03') === 'bereit') phFocus('mp', 'start'); }, run: () => startOnPhone('C-03'), ok: () => ['laeuft', 'fertig', 'fehl'].includes(stOf('C-03')), spot: '#phone [data-act="phstart"], #phone .pu' }),
      step({ c: () => L('Fehlschlag', 'Failure'), t: () => L('Cio meldet sich nicht zurück', 'Cio does not report back'), s: () => L('Diesmal kommt keine Rückmeldung. Der Wächter kennt das erwartete Ende und meldet sofort: Ersatzgerät steht bereit, Service ist informiert. Die Meldung bleibt stehen, bis jemand sie bestätigt.', 'This time no report arrives. The Guardian knows the expected end and reports at once: replacement ready, service informed. The message stays until someone confirms it.'), h: () => L('„Vorspulen: nicht zurückgemeldet“ auf der Tafel oder hier „Zeig es mir“.', '“Fast forward: did not report back” on the board, or “Show me” here.'), go: () => { ensure.started('C-03'); S.route = 'tafel'; S.view = 'tag'; S.day = 0; S.sel = 'C-03'; S.role = 'mp'; }, run: () => { if (stOf('C-03') === 'laeuft') ACT.failu('C-03'); phFocus('mp', 'fail'); }, ok: () => stOf('C-03') === 'fehl', spot: '[data-act="failu"]' }),
      step({ c: () => L('Nachsehen', 'Look'), t: () => L('Zwei Blicke genügen', 'Two looks are enough'), s: () => L('Lena bekommt eine kleine Aufgabe: Steckt das Kabel, was zeigt die Anzeige? Sie repariert nichts. Danach übernimmt der Service, und morgen früh steht niemand ratlos vor dem Gerät.', 'Lena gets a small task: is the cable plugged in, what does the display show? She repairs nothing. Then service takes over, and tomorrow morning nobody stands puzzled in front of the device.'), h: () => L('Auf Lenas Handy annehmen und „Erledigt“.', 'Accept and “Done” on Lena’s phone.'), go: () => { if (stOf('C-03') === 'laeuft') ACT.failu('C-03'); (S.fail || []).forEach((f) => { f.ack = true; }); S.route = 'leitstand'; S.role = 'mp'; phFocus('lena', 'job'); }, run: () => { const s0 = jobState('schauen', 'C-03'); lenaAnswer('schauen', 'C-03', s0 === 'by' ? 'done' : 'yes'); phFocus('lena', 'job'); }, ok: () => jobState('schauen', 'C-03') === 'done', spot: '#phone [data-act="phacc"], #phone [data-act="phdone"], #phone .pu' }),
    ] },
    { k: 'plattform', p: 'ALL', n: () => L('Mehr als ein Update', 'More than an update'), who: () => L('Plattform rund um die Maschine', 'Platform around the machine'), d: () => L('Dasselbe Fenster für Wartung, Servicetermin und Lernen. Akte, Vorab-Check, Nachtschicht des Roboters.', 'The same window for maintenance, service visit and learning. Device file, pre-visit check, the robot’s night shift.'), steps: [
      step({ c: () => L('Plattform', 'Platform'), t: () => L('Neun Dienste, ein Fenster', 'Nine services, one window'), s: () => L('Update, Wartung, Servicetermin und Einweisung brauchen dasselbe knappe Gut: eine Zeit, in der Gerät, Raum, Strom und der richtige Mensch frei sind. In jeder Zeile entscheidet genau einmal ein Mensch.', 'Update, maintenance, service visit and instruction all need the same scarce good: a time when device, room, power and the right person are free. In each row a human decides exactly once.'), h: () => L('Die Plattformkarte: jede Zeile ist anklickbar.', 'The platform map: every row can be clicked.'), go: () => { S.route = 'start'; S.role = 'mp'; }, spot: '.pmap' }),
      step({ c: () => L('Akte', 'File'), t: () => L('Die Akte ist das Gedächtnis', 'The file is the memory'), s: () => L('Zwilling, Prüfungen, Servicevertrag und Logs ohne Patientendaten. Hier sieht man, was als Nächstes dran ist.', 'Twin, checks, service contract and logs without patient data. Here you see what is due next.'), h: () => L('Eine Baugruppe im Zwilling anklicken.', 'Click a part in the twin.'), go: () => { S.route = 'akte'; S.dev = 'C-03'; S.role = 'mp'; }, spot: '.twin svg' }),
      step({ c: () => L('Wartung', 'Maintenance'), t: () => L('Ein Termin statt zwei', 'One appointment instead of two'), s: () => L('Die Konstanzprüfung passt direkt hinter das Update, vor den nächsten Einsatz. Der Lotse schlägt vor, die Medizinphysik legt zusammen.', 'The constancy test fits right after the update, before the next use. The Pilot proposes, medical physics combines.'), h: () => L('„Zusammenlegen“ klicken.', 'Click “Combine”.'), go: () => { ensure.filled(); S.route = 'dienste'; S.tab = 'wartung'; S.role = 'mp'; }, run: () => { const b = document.querySelector('[data-act="bund"]'); if (b) ACT.bund(b.dataset.a); else if (!S.merged) ACT.merge(); }, ok: () => S.merged || Object.keys(S.bund).length > 0, spot: '[data-act="bund"]' }),
      step({ c: () => L('Servicetermin', 'Service visit'), t: () => L('Der Techniker kommt einmal', 'The technician comes once'), s: () => L('Vor dem Termin checkt das Gerät ein: eine Beobachtung, drei Punkte der Klinik. Erst dann sagt der Techniker zu, mit dem richtigen Teil. Die Zusage kommt als Nachricht.', 'Before the visit the device checks in: one observation, three items for the hospital. Only then does the technician accept, with the right part. The confirmation arrives as a message.'), h: () => L('Eine Beobachtung antippen, drei Punkte abhaken, zusagen.', 'Tap one observation, tick three items, accept.'), go: () => { S.route = 'dienste'; S.tab = 'termin'; S.role = 'mp'; }, run: () => { if (!S.seen) S.seen = 'warn'; PREP().forEach((x) => { S.prep[x[0]] = true; }); ACT.svcok(); }, ok: () => S.svcOk, spot: '[data-act="seen"], [data-act="prep"], [data-act="svcok"]' }),
      step({ c: () => L('Lernen', 'Learning'), t: () => L('Zwei Minuten „Was ist neu“', 'Two minutes of “What is new”'), s: () => L('Nach dem Update erklärt das Gerät selbst, was neu ist. Mehr Eingewiesene heißt mehr mögliche Fenster.', 'After the update the device explains itself what is new. More instructed people means more possible windows.'), h: () => L('„Gesehen“ antippen.', 'Tap “Seen”.'), go: () => { S.route = 'dienste'; S.tab = 'lernen'; S.role = 'mp'; }, run: () => { S.learned = true; }, ok: () => S.learned, spot: '[data-act="learned"]' }),
      step({ c: () => L('Nachtschicht', 'Night shift'), t: () => L('Dieselbe Hand kann mehr', 'The same hand can do more'), s: () => L('Was der Roboter später noch übernehmen kann, steht in seiner Nachtschicht. Geräte bewegen bleibt Vision mit eigener Sicherheitsbetrachtung, heute bewegt er keinen C-Bogen.', 'What the robot can take over later is in its night shift. Moving devices stays a vision with its own safety assessment, today it never moves a C-arm.'), h: () => L('Eine Fähigkeit in der Nachtschicht antippen.', 'Tap a skill in the night shift.'), go: () => { S.route = 'roboter'; S.role = 'mp'; }, spot: '.shift' }),
    ] },
  ];
  const JR = () => JOURNEYS[S.jr | 0] || JOURNEYS[0];
  /* Steps before index i run their click so step i never opens on an empty screen. */
  function prepTo(i) { const st = JR().steps; for (let k = 0; k < i; k++) { st[k].go(); if (st[k].run && st[k].ok && !st[k].ok()) st[k].run(false); } }
  const PILLAR = { app: 'E', begleiter: 'E', tafel: 'A', heute: 'A', leitstand: 'A', geraete: 'A', akte: 'A', roboter: 'P', start: 'ALL', helfer: 'ALL', dienste: 'ALL' };
  const pillars = () => { const p = PILLAR[S.route] || 'ALL'; const on = (k) => (p === 'ALL' || p === k ? ' on' : ''); return `<div class="pillars" aria-label="${L('Säulen', 'Pillars')}"><span class="${on('E')}">Emotional connectivity</span><i></i><span class="${on('A')}">AI orchestration · human in the loop</span><i></i><span class="${on('P')}">Physical connectivity</span></div>`; };
  function journeyCards() {
    return `<div class="journeys">${JOURNEYS.map((j, i) => `<button class="jr" data-act="journey" data-a="${i}"><span class="pp">${(j.p === 'ALL' ? 'EAP' : j.p).split('').map((c) => `<span>${{ E: 'Emotional', A: 'AI + human', P: 'Physical' }[c]}</span>`).join('')}</span><span class="who">${j.who()}</span><b>${j.n()}</b><p>${j.d()}</p><span class="n">${j.steps.length} ${L('Schritte', 'steps')} · ${i ? L('mit Handy und „Zeig es mir“', 'with phone and “Show me”') : L('Sprechtext je Szene', 'speaker notes per scene')} →</span></button>`).join('')}</div>`;
  }
  /* After each render: point at the one thing to click next. */
  function spotlight() {
    document.querySelectorAll('.spot').forEach((e) => e.classList.remove('spot'));
    if (!S.tour || S.quiet || S.mode === 'pitch') return;
    const sc = cur();
    if (!sc.spot || (sc.ok && sc.ok())) return;
    // Selectors are listed by priority: the first one that matches something visible wins.
    let el = null;
    sc.spot.split(',').some((q) => { el = [...document.querySelectorAll(q.trim())].find((e) => e.offsetParent !== null && !e.disabled) || null; return !!el; });
    if (el) el.classList.add('spot');
  }

  /* ---------- render and events ---------- */
  const VIEWS = { heute: vHeute, tafel: vTafel, geraete: vGeraete, akte: vAkte, begleiter: vBegleiter, roboter: vRoboter, leitstand: vLeitstand, helfer: vHelfer, start: vStart, dienste: vDienste, app: vApp };
  function render() {
    if (!VIEWS[S.route]) S.route = 'heute';
    shell();
    const sc = cur();
    const jr = S.mode === 'pitch' ? null : JR(), ok = jr && sc.ok && sc.ok();
    const say = jr && S.tour && !S.quiet ? `<div class="say"><div><div class="who">${jr.n()} · ${L('Schritt', 'Step')} ${sc.n} ${L('von', 'of')} ${sc.of} · ${sc.t()}</div>${sc.s()}<span class="hint">→ ${sc.h()}</span>${ok ? `<span class="ok">✓ ${L('Geschafft. Weiter mit „Weiter“.', 'Done. Continue with “Next”.')}</span>` : ''}</div><button class="btn sm" data-act="tourend">${L('Ausblenden', 'Hide')}</button></div>`
      : S.tour && sc.s && !S.quiet ? `<div class="say"><div><div class="who">${L('Sprechtext', 'Speaker notes')} · ${L('Szene', 'Scene')} ${sc.n} ${L('von', 'of')} ${sc.of}${sc.sec ? ` · ${sc.sec} s` : ''}</div>${sc.s()}</div><button class="btn sm" data-act="tourend">${L('Ausblenden', 'Hide')}</button></div>` : '';
    $('view').innerHTML = say + VIEWS[S.route]() + `<p class="legal">${legal()}</p>`;
    renderPhone();
    spotlight();
    save();
  }
  const onlyMp = () => toast(L('Freigeben und Ablehnen kann nur die Medizinphysik.', 'Only medical physics can release or decline.'));
  const ACT = {
    go: (a) => { S.route = a; },
    svc: (a) => { const [r, t] = String(a).split(':'); if (!VIEWS[r]) return; S.route = r; if (t) S.tab = t; },
    tab: (a) => { if (TABS().some((t) => t[0] === a)) S.tab = a; },
    // The pitch is scripted, so it always starts from a fresh demo. The deep dive keeps what was clicked.
    tour: (a) => { if (a === 'pitch') { const q = S.quiet, th = S.theme; S = fresh(S.lang); S.quiet = q; S.theme = th; } S.mode = a === 'pitch' ? 'pitch' : 'tief'; S.jr = 0; S.tour = true; S.scene = 0; cur().go(); },
    mode: () => { if (S.mode !== 'pitch') return ACT.tour('pitch'); S.mode = 'tief'; S.scene = 0; S.tour = true; cur().go(); },
    bund: (a) => { const d = dev(a), w = win(a); if (!d || bundled(a) || !w || !['vorschlag', 'geplant', 'bereit'].includes(w.status)) return; if (S.role !== 'mp') return onlyMp(); S.bund[a] = true; if (a === 'C-02' && win('C-02')) ACT.merge(); else { feed('lotse', () => L(`Ausblick: Prüfung für ${d.name} mit dem nächsten Fenster gebündelt.`, `Outlook: check for ${d.name} bundled with the next window.`)); toast(L('Zusammengelegt: ein Termin statt zwei.', 'Combined: one appointment instead of two.')); } },
    prep: (a) => { if (S.svcOk || !PREP().some((x) => x[0] === a)) return; if (S.role !== 'mp') return toast(L('Abhaken kann die Medizintechnik oder die Medizinphysik.', 'Clinical engineering or medical physics can tick this off.')); S.prep[a] = !S.prep[a]; },
    share: (a) => { if (SHARE().some((x) => x[0] === a)) S.share[a] = !S.share[a]; },
    ortjob: (a) => { const d = dev(a); if (!d || S.ortJob[a]) return; if (S.role !== 'mp') return onlyMp(); S.ortJob[a] = true; feed('dolmetscher', () => L(`Ausblick: Auftrag für morgen 7:00 angelegt, ${d.name} an den Einsatzort bringen. Gefragt wird, wer im Dienst und frei ist.`, `Outlook: job created for tomorrow 7:00, bring ${d.name} to where it is needed. Whoever is on duty and free is asked.`)); },
    nachweis: () => { if (S.role === 'nurse') return toast(L('Den Nachweis erzeugen Medizinphysik oder IT-Abteilung.', 'Medical physics or the IT department creates the report.')); S.nachweis = true; },
    typ: (a) => { if (TYPES().some((t) => t[0] === a)) S.typ = a; },
    skill: (a) => { if (SKILLS().some((s) => s[0] === a)) S.skill = S.skill === a ? null : a; },
    tourend: () => { S.tour = false; },
    /* Guided journeys start from a fresh demo, so every step finds what it expects. The tour of all areas keeps what was clicked. */
    journey: (a) => { const i = Math.max(0, Math.min(JOURNEYS.length - 1, +a | 0)); if (i > 0 || S.mode === 'pitch') { const k = { lang: S.lang, quiet: S.quiet, theme: S.theme }; S = fresh(k.lang); S.quiet = k.quiet; S.theme = k.theme; } S.mode = 'tief'; S.tour = true; S.jr = i; S.scene = 0; cur().go(); },
    jstep: (a) => { if (S.mode === 'pitch') return; const to = Math.max(0, Math.min(tourLen() - 1, +a | 0)); if (to > S.scene) prepTo(to); S.scene = to; S.tour = true; cur().go(); },
    show: () => { const sc = cur(); if (sc.run && !(sc.ok && sc.ok())) sc.run(true); },
    jdone: () => { S.tour = false; S.route = 'start'; S.ph.open = false; toast(L('Journey fertig. Nächste Journey links oder frei klicken.', 'Journey finished. Pick the next one on the left or click freely.')); },
    theme: () => { S.theme = S.theme === 'paper' ? 'night' : 'paper'; },
    phopen: () => { S.ph.open = true; },
    phclose: () => { S.ph.open = false; S.ph.note = null; },
    phwho: (a) => { if (a === 'lena' || a === 'mp') { S.ph.who = a; S.ph.view = null; S.ph.note = null; } },
    phview: (a) => { const p = S.push.find((x) => x.n === +a); if (p) { S.ph.view = p.n; S.ph.note = null; } },
    phback: () => { S.ph.view = null; S.ph.note = null; },
    phacc: (a) => { asRole('nurse', () => ACT.jobacc(a)); },
    phdec: (a) => { const j = S.jobs.find((x) => x.n === +a); asRole('nurse', () => ACT.jobdec(a)); if (j && j.no.includes(ME)) { S.ph.view = null; S.ph.note = NOTE_NO(); } },
    phdone: (a) => { const j = S.jobs.find((x) => x.n === +a); let ok = false; asRole('nurse', () => { if (j && !j.done && j.by === ME) ok = jobDone(j); }); if (ok) { S.ph.view = null; S.ph.note = [['Danke!', 'Thank you!'], ['Mehr ist nicht zu tun.', 'There is nothing more to do.']]; } },
    phstart: (a) => { asRole('mp', () => ACT.start(a)); if (stOf(a) === 'laeuft') { S.ph.view = null; S.ph.note = [['Gestartet.', 'Started.'], [`Von dir bestätigt um ${hm(D.NOW)}. Der Wächter passt auf.`, `Confirmed by you at ${hm(D.NOW)}. The Guardian keeps watch.`]]; } },
    phack: (a) => { ACT.ack(a); S.ph.view = null; },
    phread: (a) => { const p = S.push.find((x) => x.n === +a); if (p) p.read = true; S.ph.view = null; },
    phplug: (a) => { asRole('nurse', () => ACT.plug(a)); S.ph.view = null; },
    quiet: () => { S.quiet = !S.quiet; },
    seen: (a) => { if (!S.svcOk && SEEN().some((x) => x[0] === a)) S.seen = a; },
    svcok: () => { if (!S.seen || S.svcOk || !PREP().every((x) => S.prep[x[0]])) return; S.svcOk = true; pushAdd('mp', 'info', { tt: both(() => L('Servicetermin zugesagt', 'Service visit accepted')), bb: both(() => L('Fritzi, Do 19.11., 15:30. Der Techniker bringt ein Akkumodul mit und kommt nur einmal.', 'Fritzi, Thu 19 Nov, 15:30. The technician brings a battery module and comes only once.')) }); feed('dolmetscher', () => L('Ausblick: Servicetermin für Fritzi am Do 19.11., 15:30 zugesagt. Der Techniker bringt ein Akkumodul mit.', 'Outlook: service visit for Fritzi accepted for Thu 19 Nov, 15:30. The technician brings a battery module.')); toast(L('Zugesagt. Eine Anfahrt, das richtige Teil.', 'Accepted. One trip, the right part.')); },
    learned: () => { S.learned = true; toast(L('Danke. Mehr ist nicht zu tun.', 'Thank you. There is nothing more to do.')); },
    lernok: () => { S.lernOk = true; toast(L('Vorschlag geht an das Team. Niemand muss zusagen.', 'The proposal goes to the team. Nobody has to accept.')); },
    lang: (a) => { S.lang = a === 'en' ? 'en' : 'de'; },
    role: (a) => { S.role = a; },
    view: (a) => { S.view = a; },
    rows: (a) => { S.rows = a === 'saele' ? 'saele' : 'geraete'; },
    day: (a) => { S.day = +a; S.view = 'tag'; },
    sel: (a) => { S.sel = a || null; const w = a && win(a); if (w) { S.day = w.day; S.view = 'tag'; } },
    tosel: (a) => { S.route = 'tafel'; ACT.sel(a); },
    akte: (a) => { S.dev = a; S.akte = null; S.route = 'akte'; },
    part: (a) => { S.part = a; },
    ask: (a) => { S.akte = S.akte === +a ? null : +a; },
    pet: (a) => { S.pet = a; S.route = 'begleiter'; },
    wake: (a) => { if (S.woke[a]) return; S.woke[a] = true; feed('bote', () => L(`${dev(a).name} wurde im ${dev(a).ort} geweckt. Der Lotse sucht ein Fenster.`, `${dev(a).name} was woken up in ${XS(dev(a).ort)}. The Pilot is looking for a window.`)); toast(L('Geweckt. Jetzt braucht es nur noch ein Fenster.', 'Awake. Now all it needs is a window.')); },
    fill: () => { if (S.filled || S.scanning) return; S.scanning = true; setTimeout(() => { if (!S.scanning) return; doFill(); S.sel = 'C-03'; render(); }, 1300); },
    rel: (a) => { if (S.role !== 'mp') return onlyMp(); release(a); },
    relall: () => { if (S.role !== 'mp') return onlyMp(); S.plan.filter((w) => w.status === 'vorschlag').forEach((w) => release(w.id)); toast(L('Alle Fenster freigegeben. Niemand musste telefonieren.', 'All windows released. Nobody had to make a call.')); },
    decline: (a) => { if (S.role !== 'mp') return onlyMp(); if (!win(a) || win(a).status !== 'vorschlag') return; S.plan = S.plan.filter((w) => w.id !== a); S.offen.push({ id: a, grund: 'abgelehnt' }); feed('lotse', () => L(`${dev(a).name}: Vorschlag abgelehnt. Die Ablehnung fließt in die nächste Planung ein.`, `${dev(a).name}: proposal declined. The decline feeds into the next planning run.`)); },
    robot: (a) => { if (S.role === 'nurse') return toast(L('Den Roboter schicken Medizinphysik oder IT-Abteilung.', 'Medical physics or the IT department sends the robot.')); const w = win(a); if (!w || w.status !== 'geplant') return; if (w.day !== 0) return toast(L('Das Fenster ist nicht heute. Der Roboter fährt erst am Tag des Fensters.', 'The window is not today. The robot only drives on the day of the window.')); w.status = 'unterwegs'; S.rob = { id: a, step: 0, sub: 0, hold: null, man: null, fail: false, t: Date.now() }; if (S.jobs.some((j) => j.typ === 'strom' && j.dev === a && !j.done)) { S.jobs = S.jobs.filter((j) => !(j.typ === 'strom' && j.dev === a && !j.done)); feed('dolmetscher', () => L(`Der Roboter übernimmt ${dev(a).name}. Der Auftrag an die Person in der Nähe ist zurückgezogen, niemand wird mehr gefragt.`, `The robot takes over ${dev(a).name}. The job for the person nearby is withdrawn, nobody is asked any more.`)); } if (S.route !== 'roboter') { S.route = 'tafel'; S.sel = a; S.day = 0; S.view = 'tag'; } feed('bote', () => L(`Roboter übernimmt den Auftrag für ${dev(a).name}: Selbsttest, dann Fahrt in den ${dev(a).ort}.`, `The robot takes the order for ${dev(a).name}: self-test, then the drive to ${XS(dev(a).ort)}.`)); },
    plug: (a) => { if (S.role !== 'nurse') return toast(L('Die Bitte beantwortet die Person am Gerät.', 'The person at the device answers this request.')); S.plugged[a] = true; const w = win(a); if (w && w.status === 'geplant' && w.day === 0) ready(a); toast(L('Danke. Mehr ist nicht zu tun.', 'Thank you. There is nothing more to do.')); },
    start: (a) => { const w = win(a); if (!w || w.status !== 'bereit' || !startCheck(a).ok) return; if (S.role === 'nurse') return toast(L('Den Start bestätigt die Medizinphysik oder die IT-Abteilung.', 'Medical physics or the IT department confirms the start.')); if (w.needsRobot && !(S.rob && S.rob.id === a && S.rob.step === READY_STEP && !S.rob.hold && !S.rob.man)) return toast(L('Der Roboter steht nicht bereit am Gerät. Kein Start.', 'The robot is not ready at the device. No start.')); const r = S.role; w.status = 'laeuft'; if (S.rob && S.rob.id === a) { S.rob.step = GUARD_STEP; S.rob.t = Date.now(); } if (S.route !== 'roboter') S.route = 'tafel'; S.sel = a; S.day = w.day; feed('waechter', () => L(`${dev(a).name}: Start aus der Ferne bestätigt von ${role(r)}. Erwartetes Ende ${hm(w.to)}.`, `${dev(a).name}: remote start confirmed by ${role(r)}. Expected end ${hm(w.to)}.`)); },
    finish: (a) => { const w = win(a); if (!w || w.status !== 'laeuft') return; w.status = 'fertig'; if (S.rob && S.rob.id === a) { S.rob.step = REPORT_STEP; S.rob.t = Date.now(); } pushAdd('mp', 'back', { dev: a }); pushAdd('lena', 'thanks', { dev: a }); feed('waechter', () => L(`${dev(a).name} hat sich um ${hm(w.to - 8)} zurückgemeldet. Version 4.2.1, Logs übertragen.`, `${dev(a).name} reported back at ${hm(w.to - 8)}. Version 4.2.1, logs transferred.`)); },
    failu: (a) => { const w = win(a); if (!w || w.status !== 'laeuft') return; w.status = 'fehl'; S.fail.push({ id: a, bis: hm(w.to + P.RULES.PUFFER), ersatz: w.ersatz, ack: false }); if (S.rob && S.rob.id === a) { S.rob.step = REPORT_STEP; S.rob.fail = true; } pushAdd('mp', 'fail', { dev: a, f: S.fail.length - 1 }); jobNew('schauen', a); feed('waechter', () => L(`${dev(a).name} nicht zurückgemeldet. Ersatz ${dev(w.ersatz).name} gemeldet, Service informiert.`, `${dev(a).name} did not report back. Replacement ${dev(w.ersatz).name} announced, service informed.`)); },
    alarm: () => { if (!S.alarm) alarm(); },
    ack: (a) => { const x = a === 'alarm' ? S.alarm : S.fail[+a]; if (x) x.ack = true; },
    merge: () => { if (!win('C-02')) return; S.merged = true; feed('lotse', () => L(`Konstanzprüfung für Bogdan auf Do 19.11., ${hm(win('C-02').to)} gelegt, direkt nach dem Update und vor dem nächsten Einsatz.`, `Constancy test for Bogdan moved to Thu 19 Nov, ${hm(win('C-02').to)}, right after the update and before the next use.`)); toast(L('Zusammengelegt: ein Termin statt zwei.', 'Combined: one appointment instead of two.')); },
    tech: () => { S.tech = true; feed('dolmetscher', () => L('Technikertermin für Rudi am Fr 20.11., 16:00 beim Service angefragt (Update mit Armbewegung, vor Ort).', 'Technician visit for Rudi requested from service for Fri 20 Nov, 16:00 (update with arm movement, on site).')); toast(L('Anfrage an den Service vorbereitet.', 'Request to service prepared.')); },
    rhalt: () => { const r = S.rob; if (!r || r.hold === 'halt') return; if (['hindernis', 'funk'].includes(r.hold)) r.prev = r.hold; r.hold = 'halt'; r.man = null; withdraw(r); feed('bote', () => L(`Not-Halt am Roboter gedrückt (${role(S.role)}). Er steht.`, `Emergency stop pressed on the robot (${role(S.role)}). It stands still.`)); },
    rgo: () => { const r = S.rob; if (!r || !['halt', 'alarm'].includes(r.hold)) return; if (S.role === 'nurse') return toast(L('Freigeben dürfen nur Medizinphysik und IT-Abteilung.', 'Only medical physics and the IT department may release it.')); r.hold = r.prev || null; r.prev = null; },
    rman: () => { const r = S.rob; if (!r || r.hold || r.step >= LAST_STEP) return; if (robPlugged(r)) return toast(L('Der Roboter ist am Gerät eingesteckt. Von Hand fährt er erst wieder, wenn er abgesteckt hat.', 'The robot is plugged into the device. It only drives by hand again once it has unplugged.')); if (S.role === 'nurse') return toast(L('Von Hand steuern dürfen nur Medizinphysik und IT-Abteilung.', 'Only medical physics and the IT department may steer by hand.')); const p = robPos(); r.man = { x: p[0], y: p[1] }; },
    rauto: () => {
      const r = S.rob; if (!r || !r.man) return;
      if (S.role === 'nurse') return toast(L('Von Hand steuern dürfen nur Medizinphysik und IT-Abteilung.', 'Only medical physics and the IT department may steer by hand.'));
      r.man = null;
      // Steered away from the device before plugging in: it approaches, identifies and scans again.
      if (r.step === 3 || r.step === 4) { r.step = 2; r.sub = 3; }
    },
    steer: (a) => {
      const r = S.rob, d = { n: [0, -15], s: [0, 15], w: [-15, 0], e: [15, 0] }[a]; if (!r || !r.man || !d || S.role === 'nurse') return;
      const x = r.man.x + d[0], y = r.man.y + d[1];
      // By hand the robot still only drives in corridors, never into an operating room.
      if (![[570, 590, 30, 270], [30, 590, 140, 160], [590, 690, 240, 260]].some(([x1, x2, y1, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) return toast(L('Dort ist kein Flur. Der Roboter bleibt in den Fluren.', 'There is no corridor there. The robot stays in the corridors.'));
      r.man = { x, y };
    },
    rclear: () => {
      const r = S.rob; if (!r || !['hindernis', 'funk'].includes(r.hold)) return;
      // The corridor cleared on its own: the help job is no longer needed and closes without a record.
      if (r.hold === 'hindernis') S.jobs.forEach((j) => { if (j.typ === 'weg' && !j.done) { j.done = true; j.by = null; j.no = []; } });
      r.hold = null;
    },
    robst: () => { const r = S.rob; if (r && !r.hold && !r.man && r.step <= 2) r.hold = 'hindernis'; },
    rfunk: () => { const r = S.rob; if (r && !r.hold && r.step < LAST_STEP) { r.hold = 'funk'; r.man = null; withdraw(r); } },
    me: (a) => {
      if (!['frei', 'eingriff', 'aus'].includes(a)) return toast(L('Unbekannte Angabe, nichts geändert.', 'Unknown value, nothing changed.'));
      S.me = a;
      // Whoever is no longer free hands an accepted job back, so the next person is asked.
      if (a !== 'frei') S.jobs.forEach((j) => { if (j.by === ME && !j.done) { j.by = null; if (!j.no.includes(ME)) j.no.push(ME); feed('dolmetscher', () => L(`Auftrag „${jobL(j).t}“ ist wieder offen. Die nächste freie Person wird gefragt.`, `Job “${jobL(j).t}” is open again. The next free person is asked.`)); } });
    },
    jobnew: (a) => { const [typ, id] = String(a).split(':'); if (!['weg', 'aufsicht', 'strom'].includes(typ) || !dev(id)) return; if (typ === 'strom') { const w = win(id); if (!w || w.status !== 'geplant' || w.day !== 0 || !w.needsRobot || S.rob) return; if (S.role !== 'mp') return toast(L('Eine Hand anfragen kann nur die Medizinphysik.', 'Only medical physics can ask for a hand.')); } if (typ === 'weg' && !(S.rob && S.rob.id === id && held(S.rob, 'hindernis'))) return; if (typ === 'aufsicht' && S.role !== 'mp') return toast(L('Aufsicht anfragen kann nur die Medizinphysik.', 'Only medical physics can request supervision.')); jobNew(typ, id); },
    jobacc: (a) => { const j = S.jobs.find((x) => x.n === +a); if (!j || S.role !== 'nurse' || S.me !== 'frei') return; const to = offerTo(j); if (!to || to.k !== ME) return; j.by = ME; toast(L('Danke. Der Auftrag gehört jetzt dir.', 'Thank you. The job is yours now.')); },
    jobdec: (a) => { const j = S.jobs.find((x) => x.n === +a); if (!j || S.role !== 'nurse' || S.me !== 'frei' || (offerTo(j) || {}).k !== ME) return; j.no.push(ME); toast(L('Kein Problem. Die nächste Person wird gefragt.', 'No problem. The next person is asked.')); },
    jobdone: (a) => { const j = S.jobs.find((x) => x.n === +a); if (!j || j.done || j.by !== ME || S.role !== 'nurse') return; if (jobDone(j)) toast(L('Danke. Mehr ist nicht zu tun.', 'Thank you. There is nothing more to do.')); },
    jobsim: (a) => { const j = S.jobs.find((x) => x.n === +a); const to = j && offerTo(j); if (to && to.k !== ME) j.by = to.k; },
    jobskip: (a) => { const j = S.jobs.find((x) => x.n === +a); const to = j && offerTo(j); if (to && to.k !== ME) j.no.push(to.k); },
    jobfin: (a) => { const j = S.jobs.find((x) => x.n === +a); if (j && j.by && j.by !== ME && !j.done) jobDone(j); },
    jobdrop: (a) => { const j = S.jobs.find((x) => x.n === +a); if (!j || j.done || j.by) return; if (S.role !== 'mp') return toast(L('Zurückziehen kann nur die Medizinphysik.', 'Only medical physics can withdraw a job.')); S.jobs = S.jobs.filter((x) => x !== j); feed('dolmetscher', () => L(`Auftrag „${jobL(j).t}“ zurückgezogen. Niemand wird mehr gefragt.`, `Job “${jobL(j).t}” withdrawn. Nobody is asked any more.`)); },
    /* Next or back in the tour. A pitch scene with steps (the app on the phone) is stepped through first; coming
       back into it from the scene after it lands on its last step. */
    scene: (a) => {
      const by = +a, sc = cur(), n = (S.app | 0) + by;
      if (S.mode === 'pitch' && sc.steps && S.route === 'app' && n >= 0 && n < sc.steps) { appFrom = S.app | 0; S.app = n; return; }
      const was = S.scene; S.scene = Math.max(0, Math.min(tourLen() - 1, S.scene + by));
      if (S.mode !== 'pitch' && S.scene > was) prepTo(S.scene);
      const nx = cur(); nx.go(); if (nx.steps && by < 0 && S.scene !== was) S.app = nx.steps - 1;
    },
    reset: () => { const m = S.mode, t = S.tour, q = S.quiet, jr = S.jr, th = S.theme; S = fresh(S.lang); S.mode = m; S.tour = t; S.quiet = q; S.jr = jr; S.theme = th; if (t) cur().go(); toast(L('Demo zurückgesetzt.', 'Demo reset.')); },
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    const fn = ACT[el.dataset.act]; if (!fn) return;
    fn(el.dataset.a); render();
    if (['go', 'akte', 'pet', 'scene', 'tosel', 'svc', 'tour', 'mode', 'journey', 'jstep', 'jdone'].includes(el.dataset.act)) window.scrollTo(0, 0);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-act], g[data-act]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select')) return;
    // H hides the script bar and the speaker notes, so the audience does not read along. H shows them again.
    if (e.key === 'h' || e.key === 'H') { ACT.quiet(); render(); if (S.quiet) toast(L('Drehbuch ausgeblendet. H blendet es wieder ein, Pfeil rechts ist die nächste Szene.', 'Script hidden. H shows it again, arrow right is the next scene.')); }
    // In the pitch the arrow keys and a presenter remote (page up, page down) change the scene. On the phone app
    // the space bar steps on as well, unless a button has the focus and takes the key itself.
    const space = e.key === ' ' && S.route === 'app' && !e.target.closest('button, a, [tabindex]') ? 1 : 0;
    const step = S.tour ? ({ ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 }[e.key] || (S.mode === 'pitch' ? space : 0)) : 0;
    if (step) { e.preventDefault(); ACT.scene(step); render(); window.scrollTo(0, 0); }
  });
  /* URL parameters for the stage: ?lang=en|de, ?tour=pitch|tief, ?notes=0 (script bar hidden from the start).
     They are applied once and then removed from the address, so a reload keeps the running scene. */
  try {
    const q = new URLSearchParams(location.search);
    if (['de', 'en'].includes(q.get('lang'))) S.lang = q.get('lang');
    if (['pitch', 'tief'].includes(q.get('tour'))) ACT.tour(q.get('tour'));
    if (q.get('notes') === '0') S.quiet = true;
    if (location.search) history.replaceState(null, '', location.pathname + location.hash);
  } catch (e) { /* no URL access, start as usual */ }
  setInterval(tick, 150);
  /* act() lets the checks start the old scripted pitch tour, which has no button any more (the pitch is ../pitch-demo). */
  window.IAApp = { state: () => S, render, act: (a, v) => { if (ACT[a]) { ACT[a](v); render(); } } };
  render();
})();
