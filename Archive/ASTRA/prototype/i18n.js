/* IA click dummy: English for the German strings that come from data.js and planner.js.
   Screen texts carry both languages inline in app.js; this file only covers data and rule texts,
   so data.js and the tested planner stay in one language. */
(function (root) {
  'use strict';
  const EN = {
    'Flur A': 'Corridor A', 'Flur B': 'Corridor B', 'Werkstatt': 'Workshop', 'Geräteraum Ebene 2': 'Equipment room, level 2', 'Schockraum': 'Trauma room',
    'Unfallchirurgie': 'Trauma surgery', 'Orthopädie': 'Orthopaedics', 'Gefäßchirurgie': 'Vascular surgery', 'Reserve': 'Reserve',
    'Neurochirurgie': 'Neurosurgery', 'Handchirurgie': 'Hand surgery', 'Notaufnahme': 'Emergency department', 'Urologie': 'Urology',
    'Steckdose im Saal, wenn sie eingesteckt bleibt': 'socket in the OR, if it stays plugged in',
    'Steckdose im Saal': 'socket in the OR',
    'keine Steckdose im Flur, der Roboter bringt Strom': 'no socket in the corridor, the robot brings power',
    'Ladeplatz im Geräteraum': 'charging bay in the equipment room',
    'Steckdose im Schockraum': 'socket in the trauma room',
    'Vollservice (Beispielvertrag)': 'Full service (sample contract)',
    '4 h aus der Ferne, nächster Werktag vor Ort': '4 h remote, next working day on site',
    'Mi': 'Wed', 'Do': 'Thu', 'Fr': 'Fri', 'Sa': 'Sat', 'So': 'Sun', 'Mo': 'Mon', 'Di': 'Tue',
    'Röntgenröhre': 'X-ray tube', 'Detektor': 'Detector', 'Rechner': 'Computer', 'Akku': 'Battery',
    'Fahrwerk und Bremsen': 'Chassis and brakes', 'Netzmodul': 'Network module',
    'Lotse': 'Pilot', 'Bote': 'Courier', 'Wächter': 'Guardian', 'Dolmetscher': 'Interpreter',
    'Findet aus OP-Plan, Nutzungsmuster und Fristen die goldenen Fenster.': 'Finds the golden windows from the OR schedule, usage pattern and deadlines.',
    'Fenster vorschlagen, bei Alarm neu planen': 'Propose windows, replan on an alarm',
    'Jedes Fenster gibt die Medizinphysik frei': 'Medical physics releases every window',
    'Roboter und Begleiter: bringt Strom und Paket, prüft die Umgebung, holt Logs.': 'Robot and companion: brings power and the package, checks the surroundings, collects logs.',
    'Hinfahren, einstecken, „Umgebung frei“ melden': 'Drive there, plug in, report “surroundings clear”',
    'Den Start bestätigt ein Mensch aus der Ferne': 'A human confirms the start remotely',
    'Kennt Start und erwartetes Ende. Meldet sofort, wenn ein Gerät nicht zurückkommt.': 'Knows the start and the expected end. Reports at once when a device does not come back.',
    'Melden und Ersatzgerät vorschlagen': 'Report and propose a replacement device',
    'Warnungen bleiben stehen, bis jemand sie bestätigt': 'Warnings stay until someone confirms them',
    'Fasst jede Bitte in der Sprache der Rolle und fragt jede Rolle genau eine Sache.': 'Puts every request in the language of the role and asks each role exactly one thing.',
    'Nachrichten formulieren, Rückfragen beantworten': 'Word messages, answer follow-up questions',
    'Entscheidungen trifft immer die Rolle selbst': 'The role always makes the decision itself',
    'Kein Start ohne menschliche Bestätigung.': 'No start without human confirmation.',
    'Kein Start, solange das Gerät im Einsatz ist.': 'No start while the device is in use.',
    'Fern-Start nur nach der Meldung „Umgebung frei“.': 'Remote start only after the report “surroundings clear”.',
    'Updates mit Armbewegung nie aus der Ferne.': 'Updates with arm movement are never started remotely.',
    'Bei Alarm wird das Fenster gesperrt.': 'An alarm locks the window.',
    'Nie die ganze Flotte in einer Nacht.': 'Never the whole fleet in one night.',
    'Keine Patientendaten: nur Saal, Zeit, Gerät und Rolle.': 'No patient data: only room, time, device and role.',
    'Update mit Armbewegung: nur beaufsichtigt vor Ort': 'Update with arm movement: supervised on site only',
    'Freigabe der Medizinphysik fehlt': 'Release by medical physics is missing',
    'Meldung „Umgebung frei“ fehlt': 'Report “surroundings clear” is missing',
    'Gerät ist im Einsatz': 'Device is in use',
    'Alarm: Fenster gesperrt': 'Alarm: window locked',
    'Paket nicht geprüft oder zurückgerufen': 'Package not verified or recalled',
    'Frist heute': 'Deadline today', 'Verfügbarkeit unter Vertrag': 'Availability below contract',
    'Gerät nicht einsatzbereit': 'Device not ready for use',
  };
  const PATTERNS = [
    [/^Saal (\d+)$/, (m) => 'OR ' + m[1]],
    [/^Frist in (\d+) Tag(en)?$/, (m) => 'Deadline in ' + m[1] + (m[1] === '1' ? ' day' : ' days')],
    [/^Prüfung in (\d+) Tagen fällig$/, (m) => 'Check due in ' + m[1] + ' days'],
    [/^(\d+) Tag(en)?$/, (m) => m[1] + (m[1] === '1' ? ' day' : ' days')],
  ];
  /* English for a data string. Unknown strings come back unchanged, so a gap is visible, not hidden. */
  function en(s) {
    if (typeof s !== 'string') return s;
    if (Object.prototype.hasOwnProperty.call(EN, s)) return EN[s];
    for (const [re, fn] of PATTERNS) { const m = s.match(re); if (m) return fn(m); }
    return s;
  }
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* '18.11.' becomes '18 Nov'. */
  const date = (s) => { const m = String(s).match(/^(\d+)\.(\d+)\.$/); return m ? +m[1] + ' ' + MONTHS[+m[2] - 1] : s; };

  const api = { en, date, EN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.IAI18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
