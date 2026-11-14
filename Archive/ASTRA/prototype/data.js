/* IA click dummy: synthetic demo world. Every clinic, device, name and number in this file is invented.
   No patient data: the OP plan carries only room, time and department. */
(function (root) {
  'use strict';
  const t = (hh, mm) => hh * 60 + (mm || 0);
  const b = (from, to, saal, fach) => ({ from, to, saal, fach });

  const DAYS = [
    { k: 'Mi', d: '18.11.' }, { k: 'Do', d: '19.11.' }, { k: 'Fr', d: '20.11.' },
    { k: 'Sa', d: '21.11.' }, { k: 'So', d: '22.11.' }, { k: 'Mo', d: '23.11.' }, { k: 'Di', d: '24.11.' },
  ];
  const WEEKEND = [3, 4];

  /* Share of the last 8 weeks in which the device was used in that hour (index = hour of day). */
  const risk = (evening, night, weekendMorning) => {
    const wt = Array(24).fill(0), we = Array(24).fill(0);
    for (let h = 7; h < 17; h++) wt[h] = 0.875;
    evening.forEach((v, i) => { wt[17 + i] = v; });
    for (let h = 17 + evening.length; h < 24; h++) wt[h] = night;
    for (let h = 0; h < 24; h++) we[h] = h < 10 ? weekendMorning : Math.max(night, weekendMorning);
    return { wt, we };
  };

  /* Same case blocks on every weekday, none on the weekend, unless given otherwise. */
  const week = (blocks, weekend) => DAYS.map((_, i) => (WEEKEND.includes(i) ? (weekend || []) : blocks));

  const sla = (ist) => ({ name: 'Vollservice (Beispielvertrag)', soll: 98.0, ist, reaktion: '4 h aus der Ferne, nächster Werktag vor Ort', bis: '31.12.2027' });

  const DEVICES = [
    { id: 'C-01', name: 'Cora', ort: 'Saal 1', fach: 'Unfallchirurgie', strom: true, stromHinweis: 'Steckdose im Saal, wenn sie eingesteckt bleibt',
      sw: '4.2.0', update: { art: 'patch', frist: 5 }, datenWochen: 8, wartungTage: 40, sla: sla(98.6),
      busy: week([b(t(7, 30), t(12), 'Saal 1', 'Unfallchirurgie'), b(t(12, 45), t(16, 30), 'Saal 1', 'Unfallchirurgie')]),
      risk: risk([0.125, 0.125, 0], 0, 0), logsVor: '2 h', akku: 88 },
    { id: 'C-02', name: 'Bogdan', ort: 'Saal 2', fach: 'Orthopädie', strom: true, stromHinweis: 'Steckdose im Saal',
      sw: '4.2.0', update: { art: 'patch', frist: 5 }, datenWochen: 8, wartungTage: 9, sla: sla(98.9),
      busy: week([b(t(8), t(11, 30), 'Saal 2', 'Orthopädie'), b(t(12), t(17), 'Saal 2', 'Orthopädie')]),
      risk: risk([0.375, 0.25, 0.125], 0.125, 0), logsVor: '5 h', akku: 93 },
    { id: 'C-03', name: 'Cio', ort: 'Flur B', fach: 'Unfallchirurgie', strom: false, stromHinweis: 'keine Steckdose im Flur, der Roboter bringt Strom',
      sw: '4.1.3', update: { art: 'patch', frist: 2 }, datenWochen: 8, wartungTage: 21, sla: sla(97.1),
      busy: week([b(t(7, 30), t(11), 'Saal 3', 'Unfallchirurgie'), b(t(11, 30), t(16, 20), 'Saal 3', 'Unfallchirurgie')]),
      risk: risk([0, 0, 0], 0, 0), logsVor: '9 Tagen', akku: 71 },
    { id: 'C-04', name: 'Arcus', ort: 'Saal 4', fach: 'Gefäßchirurgie', strom: true, stromHinweis: 'Steckdose im Saal',
      sw: '4.2.1', update: null, datenWochen: 8, wartungTage: 120, sla: sla(99.2),
      busy: week([b(t(8), t(15), 'Saal 4', 'Gefäßchirurgie')]),
      risk: risk([0.125, 0, 0], 0, 0), logsVor: '21 h', akku: 96 },
    { id: 'C-05', name: 'Fritzi', ort: 'Geräteraum Ebene 2', fach: 'Reserve', strom: true, stromHinweis: 'Ladeplatz im Geräteraum',
      sw: '4.2.1', update: null, datenWochen: 8, wartungTage: 63, sla: sla(99.4),
      busy: week([b(t(9), t(13), 'Saal 6', 'Urologie')]),
      risk: risk([0, 0, 0], 0, 0), logsVor: '3 h', akku: 97 },
    { id: 'C-06', name: 'Rudi', ort: 'Saal 5', fach: 'Neurochirurgie', strom: true, stromHinweis: 'Steckdose im Saal',
      sw: '4.2.0', update: { art: 'arm', frist: 12 }, datenWochen: 8, wartungTage: 12, sla: sla(98.2),
      busy: week([b(t(7, 30), t(15, 30), 'Saal 5', 'Neurochirurgie')]),
      risk: risk([0.125, 0, 0], 0, 0), logsVor: '1 Tag', akku: 90 },
    { id: 'C-07', name: 'Nova', ort: 'Saal 7', fach: 'Handchirurgie', strom: true, stromHinweis: 'Steckdose im Saal',
      sw: '4.2.0', update: { art: 'patch', frist: 5 }, datenWochen: 2, wartungTage: 28, sla: sla(100),
      busy: week([b(t(8), t(14), 'Saal 7', 'Handchirurgie')]),
      risk: risk([0, 0, 0], 0, 0), logsVor: '4 h', akku: 99 },
    { id: 'C-08', name: 'Otto', ort: 'Schockraum', fach: 'Notaufnahme', strom: true, stromHinweis: 'Steckdose im Schockraum',
      sw: '4.2.0', update: { art: 'patch', frist: 5 }, datenWochen: 8, wartungTage: 75, sla: sla(98.0),
      busy: week([b(t(9), t(10, 30), 'Schockraum', 'Notaufnahme'), b(t(13, 30), t(15), 'Schockraum', 'Notaufnahme')],
        [b(t(11), t(12, 30), 'Schockraum', 'Notaufnahme')]),
      risk: risk([0.5, 0.5, 0.5], 0.375, 0.125), logsVor: '6 h', akku: 85 },
  ];

  /* Components of the digital twin. Values per device derive from these templates in app.js. */
  const PARTS = [
    { k: 'roehre', name: 'Röntgenröhre', x: 294, y: 338, einheit: 'Betriebsstunden' },
    { k: 'detektor', name: 'Detektor', x: 295, y: 58, einheit: 'Kalibrierung' },
    { k: 'rechner', name: 'Rechner', x: 72, y: 240, einheit: 'Softwarestand' },
    { k: 'akku', name: 'Akku', x: 72, y: 300, einheit: 'Kapazität in %' },
    { k: 'fahrwerk', name: 'Fahrwerk und Bremsen', x: 100, y: 348, einheit: 'Prüfung' },
    { k: 'netz', name: 'Netzmodul', x: 68, y: 168, einheit: 'letzter Kontakt' },
  ];

  const UPDATE = { name: 'Sicherheitsupdate 4.2.1', freigabe: 'Mo 16.11.', frist: 'Mo 23.11.', dauer: 120 };

  const HELFER = [
    { k: 'lotse', name: 'Lotse', tut: 'Findet aus OP-Plan, Nutzungsmuster und Fristen die goldenen Fenster.', allein: 'Fenster vorschlagen, bei Alarm neu planen', mensch: 'Jedes Fenster gibt die Medizinphysik frei' },
    { k: 'bote', name: 'Bote', tut: 'Roboter und Begleiter: bringt Strom und Paket, prüft die Umgebung, holt Logs.', allein: 'Hinfahren, einstecken, „Umgebung frei“ melden', mensch: 'Den Start bestätigt ein Mensch aus der Ferne' },
    { k: 'waechter', name: 'Wächter', tut: 'Kennt Start und erwartetes Ende. Meldet sofort, wenn ein Gerät nicht zurückkommt.', allein: 'Melden und Ersatzgerät vorschlagen', mensch: 'Warnungen bleiben stehen, bis jemand sie bestätigt' },
    { k: 'dolmetscher', name: 'Dolmetscher', tut: 'Fasst jede Bitte in der Sprache der Rolle und fragt jede Rolle genau eine Sache.', allein: 'Nachrichten formulieren, Rückfragen beantworten', mensch: 'Entscheidungen trifft immer die Rolle selbst' },
  ];

  const REGELN = [
    'Kein Start ohne menschliche Bestätigung.',
    'Kein Start, solange das Gerät im Einsatz ist.',
    'Fern-Start nur nach der Meldung „Umgebung frei“.',
    'Updates mit Armbewegung nie aus der Ferne.',
    'Bei Alarm wird das Fenster gesperrt.',
    'Nie die ganze Flotte in einer Nacht.',
    'Keine Patientendaten: nur Saal, Zeit, Gerät und Rolle.',
  ];

  root.IAData = { DAYS, WEEKEND, DEVICES, PARTS, UPDATE, HELFER, REGELN, NOW: t(16, 40), t };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.IAData;
})(typeof window !== 'undefined' ? window : globalThis);
