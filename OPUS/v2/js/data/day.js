/* ALOHA ROBOTICS / OPUS — synthetic hospital day for the golden-window swarm.
   Everything here is invented: hospital, devices, cases, probabilities. No patient data exists:
   a case is only a time span, a room and a procedure type (the same contract as the team's
   click dummy, team-material-christian/challenge-4/klickdummy/data.js).
   Times are minutes from 00:00 of the planning day. 30:00 = 06:00 next morning. */
(function (root) {
  'use strict';
  const t = (h, m) => h * 60 + (m || 0);
  const c = (from, to, or, proc) => ({ from, to, or, proc });

  /* Expected emergency cases per hour that need a mobile C-arm somewhere in the house
     (polytrauma, open fractures, vascular bleeds). Synthetic profile: rush-hour and evening peak,
     quieter at night. Index = hour of day. */
  const EMERGENCY_RATE = [
    0.05, 0.05, 0.04, 0.03, 0.03, 0.03, 0.04, 0.08, 0.10, 0.09, 0.08, 0.08,
    0.08, 0.08, 0.09, 0.11, 0.14, 0.16, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06,
  ];

  /* Unplanned-use probability per hour (add-ons, overruns, borrowed by another OR), learned in the
     real system from 8+ weeks of device logs. Here: a small helper builds the 24-value table. */
  const use = (day, evening, night) => {
    const a = Array(24).fill(night);
    for (let h = 7; h < 17; h++) a[h] = day;
    evening.forEach((v, i) => { a[17 + i] = v; });
    return a;
  };

  const DEVICES = [
    { id: 'C-01', name: 'Cora', area: 'TRAUMA', home: 'OR 1', socket: true, sw: '4.2.0',
      update: { pkg: 'Security patch 4.2.1', art: 'patch', deadlineDays: 5 }, weeks: 8, pull: 0.34,
      use: use(0.30, [0.30, 0.24, 0.18, 0.12, 0.08], 0.05),
      cases: [c(t(7, 30), t(9, 10), 'OR 1', 'HIP FRACTURE'), c(t(9, 40), t(11, 30), 'OR 1', 'FEMUR NAIL'),
              c(t(12, 15), t(13, 40), 'OR 1', 'ANKLE ORIF'), c(t(14, 10), t(16, 30), 'OR 1', 'PELVIC FIXATION'),
              c(t(18, 20), t(19, 30), 'OR 1', 'WRIST ORIF · ADD-ON')] },
    { id: 'C-02', name: 'Bogdan', area: 'SPINE', home: 'OR 2', socket: true, sw: '4.2.0',
      update: { pkg: 'Security patch 4.2.1', art: 'patch', deadlineDays: 5 }, weeks: 8, pull: 0.09,
      use: use(0.25, [0.34, 0.22, 0.10, 0.06, 0.04], 0.02),
      cases: [c(t(8, 0), t(10, 20), 'OR 2', 'SPINAL FUSION'), c(t(10, 50), t(12, 30), 'OR 2', 'KYPHOPLASTY'),
              c(t(13, 0), t(15, 40), 'OR 2', 'SPINAL FUSION'), c(t(16, 0), t(17, 0), 'OR 2', 'FACET INJECTION')] },
    { id: 'C-03', name: 'Cio', area: 'TRAUMA', home: 'HALLWAY B', socket: false, sw: '4.1.3',
      update: { pkg: 'Security patch 4.2.1', art: 'patch', deadlineDays: 2 }, weeks: 8, pull: 0.10,
      use: use(0.22, [0.03, 0.02, 0.01, 0.01, 0.01], 0.01),
      cases: [c(t(7, 30), t(11, 0), 'OR 3', 'POLYTRAUMA ORIF'), c(t(11, 30), t(13, 50), 'OR 3', 'TIBIA NAIL'),
              c(t(14, 20), t(16, 20), 'OR 3', 'CLAVICLE PLATE'), c(t(21, 40), t(22, 50), 'OR 3', 'ANKLE ORIF · ADD-ON')] },
    { id: 'C-04', name: 'Arcus', area: 'VASCULAR', home: 'OR 4', socket: true, sw: '4.2.1',
      update: null, weeks: 8, pull: 0.08,
      use: use(0.20, [0.10, 0.06, 0.04, 0.03, 0.03], 0.02),
      cases: [c(t(8, 0), t(11, 40), 'OR 4', 'EVAR'), c(t(12, 20), t(15, 0), 'OR 4', 'ILIAC STENT')] },
    { id: 'C-05', name: 'Fritzi', area: 'RESERVE', home: 'EQUIPMENT ROOM 2', socket: true, sw: '4.2.1',
      update: null, weeks: 8, pull: 0.18,
      use: use(0.15, [0.10, 0.08, 0.06, 0.05, 0.04], 0.03),
      cases: [c(t(9, 0), t(13, 0), 'OR 6', 'URETEROSCOPY')] },
    { id: 'C-06', name: 'Rudi', area: 'NEURO', home: 'OR 5', socket: true, sw: '4.2.0',
      update: { pkg: 'Motion-control firmware 7.1', art: 'arm', deadlineDays: 12 }, weeks: 8, pull: 0.04,
      use: use(0.20, [0.08, 0.04, 0.02, 0.02, 0.02], 0.01),
      cases: [c(t(7, 30), t(15, 30), 'OR 5', 'SPINE · NAVIGATED')] },
    { id: 'C-07', name: 'Nova', area: 'HAND', home: 'OR 7', socket: true, sw: '4.2.0',
      update: { pkg: 'Security patch 4.2.1', art: 'patch', deadlineDays: 5 }, weeks: 2, pull: 0.03,
      use: use(0.20, [0.04, 0.02, 0.02, 0.01, 0.01], 0.01),
      cases: [c(t(8, 0), t(9, 0), 'OR 7', 'CARPAL TUNNEL'), c(t(9, 20), t(10, 40), 'OR 7', 'WRIST ORIF'),
              c(t(11, 0), t(12, 10), 'OR 7', 'K-WIRES'), c(t(12, 40), t(14, 0), 'OR 7', 'DISTAL RADIUS')] },
    { id: 'C-08', name: 'Otto', area: 'EMERGENCY', home: 'SHOCK ROOM', socket: true, sw: '4.2.0',
      update: { pkg: 'Security patch 4.2.1', art: 'patch', deadlineDays: 5 }, weeks: 8, pull: 0.90,
      use: use(0.20, [0.10, 0.08, 0.08, 0.06, 0.06], 0.05),
      cases: [c(t(9, 0), t(10, 30), 'SHOCK ROOM', 'TRAUMA'), c(t(13, 30), t(15, 0), 'SHOCK ROOM', 'TRAUMA'),
              c(t(22, 10), t(23, 30), 'SHOCK ROOM', 'TRAUMA · TYPICAL NIGHT')] },
  ];

  /* Who may confirm a remote start (a human must press the button, per the challenge owners).
     Synthetic duty roster: roles only, no names. */
  const CONFIRMERS = [
    { role: 'Medical physics', from: t(7, 0), to: t(17, 0) },
    { role: 'IT on call', from: t(17, 0), to: t(22, 30) },
  ];

  /* The alarm used on stage: a polytrauma pre-alert from the emergency dispatch centre.
     It locks the trauma area for an expected 4 h operation plus handover. */
  const ALARM = { at: t(15, 26), area: ['TRAUMA', 'EMERGENCY'], from: t(15, 40), to: t(19, 50),
                  label: 'POLYTRAUMA' };

  root.AlohaDay = {
    t, NOW: t(15, 20), HORIZON: { from: t(6, 0), to: t(30, 0) },
    EMERGENCY_RATE, DEVICES, CONFIRMERS, ALARM,
    ROBOT: { id: 'KettyBot', home: 'DOCK · HALLWAY A', busy: [] },
    label: 'Klinikum Regnitzau (fictional) · Wed 18 Nov',
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AlohaDay;
})(typeof window !== 'undefined' ? window : globalThis);
