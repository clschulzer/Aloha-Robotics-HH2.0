/* C-ARMAGOTCHI pitch demo. One file, no build, runs offline from disk.
   13 scenes in 4 acts, each scene has a few steps. Keys: → / Space / click = next step,
   ← = previous step, Home = restart, N = speaker notes, F = fullscreen.
   URL: ?s=5 jumps to scene 5, ?auto=0 stops automatic steps, ?speed=2 runs the automatic parts twice as fast (for screencasts).
   All data is invented. No patient data anywhere. */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const SPEED = Math.max(0.25, +Q.get('speed') || 1);
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), view = $('view');
  stage.style.setProperty('--sp', String(1 / SPEED));
  const img = (n, cls = '') => `<img class="${cls}" src="assets/${n}.webp" alt="" draggable="false">`;
  const ok = '<b class="ok">✓</b>';

  /* ---------- building blocks ---------- */
  // The phone shows the C-ARMAGOTCHI app exactly as the person on the team sees it.
  const phone = (inner, cls = '', t = '19:24') => `<div class="phone ${cls}"><div class="bezel"><div class="island"></div><div class="status"><span>${t}</span><span>●●● ▮</span></div><div class="screen">${inner}</div></div></div>`;
  const app = (m) => `
    <div class="app mood-${m.key}">
      <div class="app-head"><b>C-ARMAGOTCHI</b><span>C-03 · Corridor B</span></div>
      <div class="pet">${img(m.img)}</div>
      <div class="pet-name">Cio</div>
      <div class="pet-state"><i></i>${m.state}</div>
      <p class="pet-quote">“${m.quote}”</p>
      <div class="pet-data">${m.data.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <button class="cta">${m.cta}</button>
    </div>`;
  // Lock screen with push notifications (used for the X-ray nurse, the start request and the thank-you).
  const lock = (who, inner, t = '19:24') => `<div class="lock"><div class="lock-who">${who}</div><div class="lock-time">${t}</div><div class="lock-date">Wednesday, 18 November</div>${inner}</div>`;
  const push = (title, body, meta = 'now', cls = '') => `<div class="push ${cls}"><div class="push-head"><span class="push-icon">${img('bliss')}</span><b>C-ARMAGOTCHI</b><span>${meta}</span></div><div class="push-title">${title}</div><div class="push-body">${body}</div></div>`;
  const pearls = (active) => `<ol class="pearls">${['Check', 'Find', 'Dock', 'Wake', 'Safe?', 'Start', 'Update', 'Report'].map((p, i) => `<li class="${i < active ? 'done' : i === active ? 'now' : ''}">${p}</li>`).join('')}</ol>`;
  const mission = (active, title) => `<div class="mission"><div class="mission-tag">MISSION · C-03 CIO · SECURITY PATCH</div><h2>${title}</h2>${pearls(active)}</div>`;
  const checks = (rows) => `<ul class="checks">${rows.map(([t, s], i) => `<li class="c c${i + 1}"><span class="tick">✓</span><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div></li>`).join('')}</ul>`;

  // The OR plan of one day, read from the hospital information system (invented).
  const HOURS = [7, 9, 11, 13, 15, 17, 19, 21, 23];
  const x = (h) => ((h - 7) / 17) * 100; // 07:00 to 24:00 on the timeline, in percent
  const ROOMS = [
    ['OR 1', [[7.5, 11, 'Hip'], [11.5, 15.5, 'Spine'], [16, 18.5, 'Hip']]],
    ['OR 2', [[7.5, 10, 'Trauma'], [10.5, 14, 'Vascular'], [14.5, 19, 'Spine']]],
    ['OR 3', [[8, 12.5, 'Spine'], [13, 17, 'Ortho'], [19.5, 22.5, 'cancelled 19:12', 'cancel']]],
    ['OR 4', [[7.5, 9.5, 'Hand'], [10, 13, 'Trauma'], [13.5, 18, 'Uro']]],
  ];
  const DEVICES = [
    ['C-01', 'bliss', [[7.5, 11, 'use'], [11.5, 15.5, 'use'], [16, 18.5, 'use']]],
    ['C-02', 'bliss', [[7.5, 14, 'use'], [14.5, 19, 'use']]],
    ['C-03 Cio', 'manic', [[8, 12.5, 'use'], [13, 17, 'use'], [17, 24, 'idle']]],
    ['C-04', 'lonely', [[7.5, 24, 'off']]],
  ];
  const axis = () => `<div class="axis">${HOURS.map((h) => `<span style="left:${x(h)}%">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>`;
  const now = () => `<div class="nowline" style="left:${x(19.4)}%"><span>now 19:24</span></div>`;
  const golden = () => `<div class="golden" style="left:${x(19.5)}%;width:${x(22.75) - x(19.5)}%"><span>FOUND · GOLDEN WINDOW · 19:30–22:45</span></div>`;
  const orRows = () => ROOMS.map(([r, bl]) => `<div class="row"><b>${r}</b><div class="lane">${bl.map(([a, e, t, c = '']) => `<i class="blk ${c}" style="left:${x(a)}%;width:${x(e) - x(a)}%">${t}</i>`).join('')}</div></div>`).join('');
  const devRows = () => DEVICES.map(([d, m, bl]) => `<div class="row dev"><b>${img(m, 'mini')}${d}</b><div class="lane">${bl.map(([a, e, t]) => `<i class="blk ${t}" style="left:${x(a)}%;width:${x(e) - x(a)}%">${t === 'use' ? 'in use' : t === 'idle' ? 'idle · parked' : 'offline'}</i>`).join('')}</div></div>`).join('');
  const SIGNALS = [
    ['Usage pattern', 'C-03 rarely used after 19:00 · last 8 weeks'],
    ['Cancellation', 'OR 3 evening case cancelled 19:12'],
    ['Device state', 'idle, parked, patch due (C-ARMAGOTCHI)'],
    ['Room & robot', 'corridor free at night, robot charged'],
  ];

  /* ---------- the 13 scenes ---------- */
  const MOODS = {
    lonely: { key: 'lonely', img: 'lonely', word: 'Lonely', state: 'No connection · last logs 9 days ago', quote: 'Nobody has connected me for days. Is anyone out there?', data: [['Network', 'off'], ['Last logs', '9 days'], ['Location', 'Corridor B']], cta: 'Wake me up', point: [['Network', 'off'], ['Last logs', '9 days ago']] },
    hungry: { key: 'hungry', img: 'manic', word: 'Hungry', state: 'Unplugged · security patch due', quote: 'Plug me in! My security patch is waiting and I am starving.', data: [['Power', 'unplugged'], ['Patch', 'due'], ['Location', 'Corridor B']], cta: 'Feed me power', point: [['Power', 'unplugged since 17:00'], ['Security patch', 'due since Mon']] },
    happy: { key: 'happy', img: 'bliss', word: 'Happy', state: 'Up to date · connected', quote: 'All synced. Thanks, team. I feel brand new.', data: [['Version', '2026.11'], ['Network', 'on'], ['Logs', 'today']], cta: 'Pet Cio', point: [['Version', '2026.11 · current'], ['Last logs', 'today 07:12']] },
  };
  const moodScene = (m, n) => ({
    act: 'E', theme: 'paper', title: m.word,
    say: {
      lonely: "This is Cio, a C-arm's digital twin, on the phone of the team that looks after it. Lonely: nobody has connected me for days.",
      hungry: 'Hungry: no power, my security patch is due.',
      happy: 'Happy: updated and connected.',
    }[m.key],
    html: () => `
      <section class="moods">
        <div class="mood-left"><div class="eyebrow">MOOD ${n} OF 3</div><div class="mood-word">${m.word}</div></div>
        ${phone(app(m))}
        <div class="mood-right"><div class="eyebrow">THE DATA POINT BEHIND IT</div>${m.point.map(([k, v]) => `<div class="dp"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      </section>`,
  });

  const TEAM = [['C-01', 'bliss', 'OR 1', 'all good', ''], ['C-02', 'bliss', 'OR 2', 'all good', ''], ['C-03 Cio', 'manic', 'Corridor B', 'patch due since Mon', '1'], ['C-04', 'lonely', 'Storage 2', 'offline 9 days', '2'], ['C-05', 'bliss', 'Hybrid OR', 'all good', ''], ['C-06', 'update', 'Trauma bay', 'updating now', '']];

  const SCENES = [
    moodScene(MOODS.lonely, 1),
    moodScene(MOODS.hungry, 2),
    moodScene(MOODS.happy, 3),
    {
      act: 'E', theme: 'paper', title: 'Every mood is a data point', steps: 3,
      say: "Jokes aside: this is not a gimmick. When you have a bond with your C-arm, you feel responsible for it. And its mood shows at a glance how long it has gone without care and what state it is in. For planning, that is priority: Cio's security patch first, then C-04, offline for nine days.",
      html: () => `
        <section class="team">
          <div class="team-left">
            <div class="eyebrow">YOUR TEAM'S C-ARMS · TODAY</div>
            <div class="team-grid">${TEAM.map(([d, m, l, st, pr]) => `<div class="tile ${pr ? 'need' : 'fine'}">${pr ? `<em class="prio">${pr}</em>` : ''}${img(m)}<b>${d}</b><span>${l}</span><i class="tstate">${st}</i></div>`).join('')}</div>
          </div>
          <div class="team-right">
            <h1 class="claim">Every mood is a <em>data point.</em></h1>
            <div class="why s1">
              <div><b>Not a gimmick.</b> You feel responsible for <em>your</em> C-arm.</div>
              <div class="chain"><span>Bond</span><i>→</i><span>you look after it</span><i>→</i><span>it tells you how it is</span></div>
              <small>One to one, or as a team.</small>
            </div>
            <div class="queue s2">
              <div class="eyebrow">PRIORITY FOR THE NEXT WINDOW</div>
              <div class="q q1"><em>1</em><b>C-03 Cio</b><span>security patch due since Mon</span></div>
              <div class="q q2"><em>2</em><b>C-04</b><span>no connection for 9 days</span></div>
              <div class="q q3"><em>–</em><b>C-01 · C-02 · C-05</b><span>all good · C-06 updating</span></div>
              <small>The mood sets the priority. The window itself comes from hospital data.</small>
            </div>
          </div>
        </section>`,
    },
    {
      act: 'A', theme: 'dark', title: 'When is the best moment?', steps: 1,
      say: 'Finding the best moment is the heart of this challenge, and nobody knows it in advance. We collect it from hospital operations: the live OR plan, last-minute cancellations, incoming trauma, and what the machine tells us. Tonight a case in OR 3 was cancelled. That is a chance.',
      html: () => `
        <section class="plan">
          <div class="plan-head"><div class="eyebrow">UPDATE COCKPIT · TODAY</div><h2>When is the <em>best</em> moment?</h2></div>
          <div class="plan-bar">
            <span class="kis"><i class="lamp green"></i>OR plan from hospital system · live · synced 19:24</span>
            <span class="trauma cxl"><i class="lamp gold"></i>OR 3 · evening case cancelled 19:12</span>
            <span class="trauma"><i class="lamp green"></i>Polytrauma: none incoming</span>
            <span class="toggle"><b class="t-or">OR view</b><b class="t-dev">Device view</b></span>
          </div>
          <div class="board">
            ${axis()}
            <div class="rows rows-or">${orRows()}</div>
            <div class="rows rows-dev">${devRows()}</div>
            <div class="ov">${now()}</div>
          </div>
          <div class="signals"><div class="eyebrow">FOUR SIGNALS</div>${SIGNALS.map(([t, s], i) => `<div class="sig" style="--i:${i}"><i class="lamp green"></i><div><b>${t}</b><small>${s}</small></div></div>`).join('')}</div>
        </section>`,
    },
    {
      act: 'A', theme: 'dark', title: 'One push of a button', steps: 4, auto: { 1: 1500 },
      say: 'One push of a button: it plans and prioritises. Medical physics or IT checks it, and publishes.',
      html: () => `
        <section class="plan plan2">
          <div class="plan-head"><div class="eyebrow">UPDATE COCKPIT · TODAY</div><h2>One push of a button.</h2></div>
          <div class="board">
            ${axis()}
            <div class="rows rows-dev">${devRows()}</div>
            <div class="ov">${now()}${golden()}<div class="scan"></div></div>
          </div>
          <div class="decide">
            <button class="big-btn go s0only" data-next>Plan &amp; prioritise</button>
            <div class="analysing s1only"><span class="spin"></span>Searching the window · OR plan · cancellations · usage · device state…</div>
            <div class="proposal s2">
              <div class="eyebrow">PROPOSAL 1 OF 1 · SECURITY PATCH</div>
              <div class="prop-main">${img('manic')}<div><b>C-03 Cio · 19:30–22:45</b><span>Security patch · 120 min · illustrative · device stays put</span></div></div>
              <div class="prop-why">Why: OR 3 case cancelled 19:12 · Cio idle since 17:00 · rarely used after 19:00 · robot charged</div>
              <div class="prop-note">Backup: C-01 free · rollback image ready</div>
              <div class="prop-btns"><button class="big-btn" data-next>Publish</button></div>
            </div>
            <div class="published s3"><b>✓ Published</b><span>by Medical physics · IT agreed</span><div class="next-q">Who plugs Cio in?</div></div>
          </div>
        </section>`,
    },
    {
      act: 'A', theme: 'dark', title: 'Push to the X-ray nurse', steps: 2,
      say: 'The selected circle of X-ray nurses gets a push with everything they need. Not today. Declining costs nothing.',
      html: () => `
        <section class="phonescene">
          <div class="ps-left"><div class="eyebrow">SWITCHING TO</div><h2>Lena's phone</h2><p>X-ray nurse · selected circle for Cio</p></div>
          ${phone(lock('Lena · X-ray nurse', `
            ${push('Cio needs a hand', 'Plug in C-03 in Corridor B · 20 min · 19:30–22:45', 'now', 'p-in')}
            <div class="job">
              <div class="job-top">${img('manic')}<div><b>Cio needs a hand</b><span>C-03 · Corridor B, outside OR 3</span></div></div>
              <ul><li><span>When</span><b>19:30–22:45</b></li><li><span>Effort</span><b>20 min · plug in, stay near</b></li><li><span>Why you</span><b>trained on C-arms · 40 m away</b></li></ul>
              <div class="job-btns"><button class="take">Take it</button><button class="nope" data-next>Not today</button></div>
            </div>
            <div class="declined s1"><b>No problem.</b><span>Asking the next people.</span></div>`), 'dark')}
          <div class="ps-right s1"><div class="big-quote">Declining<br>costs nothing.</div></div>
        </section>`,
    },
    {
      act: 'A', theme: 'dark', title: 'Like a ride request', steps: 3, auto: { 0: 3600 },
      say: "So it asks everyone nearby, like a ride request. But it's one of those days. Nobody is free. Time to shine for our invisible helper.",
      html: () => {
        const ppl = [['Tom', 'in surgery'], ['Aylin', 'off shift'], ['Jonas', 'busy, OR 2'], ['Mara', 'on break, no reply'], ['Ben', 'in surgery'], ['Sofia', 'off shift']];
        return `
        <section class="radar-scene">
          <div class="radar-head"><div class="eyebrow">LIKE A RIDE REQUEST</div><h2 class="s0only">Asking 6 people nearby…</h2><h2 class="s1">It's one of <em>those</em> days.</h2></div>
          <div class="radar">
            <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><div class="sweep"></div>
            <div class="center">${img('manic')}<b>Cio</b></div>
            ${ppl.map(([n, s], i) => `<div class="person" style="--a:${i * 60 + 20}deg;--i:${i}"><span class="av">${n[0]}</span><b>${n}</b><small>${s}</small></div>`).join('')}
          </div>
          <div class="nobody s1"><b>Nobody available.</b></div>
          <button class="send s2" data-next>${img('ketty')}<span>Send the invisible helper <em>→</em></span></button>
        </section>`;
      },
    },
    {
      // Act 4 in one continuous mission on the floor plan: one big sentence per step, no checklists.
      act: 'P', theme: 'dark', title: 'Mission', steps: 4, auto: { 0: 2400, 1: 5600, 2: 2600 },
      say: "It checks itself: right patch, a cable, enough battery. It finds Cio where people usually park it, docks to its service port, checks it's the right machine by its certificate and wakes it up. Then a strict check of the surroundings. Every hard check must pass, or it asks nobody.",
      html: () => `
        <section class="robot msn">
          <div class="mission"><div class="mission-tag">MISSION · C-03 CIO · SECURITY PATCH</div>
            <h2 class="k0">Do I have everything?</h2><h2 class="k1">Where is Cio?</h2><h2 class="k2">Right machine? Wake up.</h2><h2 class="k3">Safe right now?</h2>
            <div class="k0">${pearls(0)}</div><div class="k1">${pearls(1)}</div><div class="k2">${pearls(3)}</div><div class="k3">${pearls(4)}</div>
          </div>
          <div class="msn-body">
            <div class="msn-left">
            <div class="map">
            <svg viewBox="0 0 1500 560" class="plan-svg" aria-hidden="true">
              <rect x="20" y="20" width="1460" height="520" rx="18" class="floor"/>
              <rect x="40" y="40" width="300" height="190" class="room"/><text x="70" y="90">OR 1</text>
              <rect x="360" y="40" width="300" height="190" class="room"/><text x="390" y="90">OR 2</text>
              <rect x="680" y="40" width="300" height="190" class="room"/><text x="710" y="90">OR 3</text>
              <rect x="1000" y="40" width="460" height="190" class="room"/><text x="1030" y="90">STORAGE 2</text>
              <rect x="40" y="350" width="460" height="170" class="room"/><text x="70" y="400">STATION · ROBOT DOCK</text>
              <rect x="1000" y="350" width="460" height="170" class="room"/><text x="1030" y="400">HYBRID OR</text>
              <text x="140" y="300" class="corr">CORRIDOR B</text>
              <path d="M300 440 L560 440 L560 290 L930 290" class="route"/>
            </svg>
            <div class="spot last" style="left:560px;top:290px"><i>✕</i><span>last known · not here</span></div>
            <div class="spot usual u2" style="left:1220px;top:290px"><i></i><span>usual spot · candidate B</span></div>
            <div class="bot">${img('ketty')}<div class="cone"></div></div>
            <div class="found"><span class="cio">${img('lonely', 'sleep')}${img('manic', 'awake')}<i class="ring1"></i><i class="ring2"></i></span><b>Found at usual spot</b></div>
            <div class="plug"><i class="pw"></i><i class="ln"></i></div>

          </div>
          <div class="caption">
            <p class="k0">Patch on board. Cable packed. Battery 82 %.</p>
            <p class="k1">Last known spot: empty. Usual spot: found.</p>
            <p class="k2">Docked. Right machine by certificate. Woken over the cable.</p>
            <p class="k3">Safe right now. Asking a human to start <em>→</em></p>
          </div>
              <div class="tele"><div class="ph0" style="--d:0.2s">&gt; mission M-0412 · C-03 · CARM-SEC 2026.11</div><div class="ph0" style="--d:0.9s">&gt; pkg: manufacturer signature ✓ · sha256 9c4e…a17f</div><div class="ph0" style="--d:1.6s">&gt; battery 82 % · cable LAN-2 packed</div><div class="ph1" style="--d:1.0s">&gt; nav: dock → corridor B · last seen 19:02</div><div class="ph1" style="--d:4.4s">&gt; spot A: empty · spot B: identity candidate</div><div class="ph2" style="--d:0.2s">&gt; dock: service port · link 1 Gbit/s</div><div class="ph2" style="--d:0.9s">&gt; id: SN 10442 · certificate ✓ · wake-on-LAN</div><div class="ph2" style="--d:1.6s">&gt; device: booted (simulation) · v2025.07 · patch due</div><div class="ph3" style="--d:0.2s">&gt; lidar: 0 persons < 2 m · camera: no drapes</div><div class="ph3" style="--d:0.9s">&gt; gate 4/4 → request start: Lena</div></div>
            </div>
            <div class="agent">
              <div class="ag-h"><i class="ag-dot"></i>KETTYBOT AGENT · CHECKS AS IT GOES</div>
              <ul class="ag"><li class="ph0" style="--d:0.3s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Patch CARM-SEC 2026.11</span><small>manufacturer signature ✓</small></li><li class="ph0" style="--d:0.65s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Checksum</span><small>sha256 ✓</small></li><li class="ph0" style="--d:1.0s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Cable packed</span><small>no Wi-Fi at Corridor B</small></li><li class="ph0" style="--d:1.35s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Battery 82 %</span><small>service + recovery reserve</small></li><li class="ph1" style="--d:1.6s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Last known spot</span><small>empty</small></li><li class="ph1" style="--d:3.1s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Learned parking spots</span><small>candidate A · candidate B</small></li><li class="ph1" style="--d:4.6s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Cio found</span><small>camera match</small></li><li class="ph2" style="--d:0.6s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Docked</span><small>service port (concept)</small></li><li class="ph2" style="--d:1.2s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Right machine</span><small>serial + device certificate</small></li><li class="ph2" style="--d:1.8s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Woken over the cable</span><small>supported wake path</small></li><li class="ph3" style="--d:0.3s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Nobody within 2 m</span><small>camera + lidar</small></li><li class="ph3" style="--d:0.65s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">No sterile drapes, no patient</span><small>camera</small></li><li class="ph3" style="--d:1.0s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Brakes on, arm parked</span><small>device status</small></li><li class="ph3" style="--d:1.35s"><span class="tk"><i class="spn"></i><b>✓</b></span><span class="tx">Power stable</span><small>docked connector</small></li></ul>
              <div class="ag-res"><b>✓ 14 / 14 checks · 0 warnings</b><span>One fail = no request. Now a human decides.</span></div>
            </div>
          </div>
        </section>`,
    },
    {
      act: 'A', theme: 'dark', title: 'A human starts it', steps: 5,
      say: "Lena couldn't walk over, but 30 seconds on her phone are enough. She gets the start request, checks timing and surroundings in a short wizard, and starts it. Not reachable, or not sure? The next person in line gets it, with a short note.",
      html: () => `
        <section class="phonescene start">
          <div class="ps-left"><div class="eyebrow">SWITCHING TO</div><h2>Lena's phone</h2><p>She couldn't walk over.<br>One focused decision.</p>
            <div class="chainline"><span class="on">Lena</span><i>→</i><span>Medical physics on call</span><i>→</i><span>IT</span></div>
            <small class="chain-note">Not reachable or not sure? It passes on, with a short note.</small></div>
          ${phone(`
            <div class="wz w0">${lock('Lena · X-ray nurse', `${push('Update request · Cio', 'The robot is ready. Please check and start.', 'now', 'p-in')}<div class="timer">respond within <b id="countdown">4:59</b></div>`, '19:30')}</div>
            <div class="wz w1"><div class="wz-head"><span>1 / 3</span><b>Right time?</b></div>
              <div class="wz-card"><div class="wz-row"><span>Window</span><b>19:30–22:45</b></div><div class="wz-row"><span>Next case OR 3</span><b>22:45</b></div><div class="wz-row"><span>Polytrauma</span><b class="g">none incoming</b></div><div class="wz-row"><span>Expected</span><b>120 min</b></div></div>
              <button class="wz-btn" data-next>Yes, right time</button></div>
            <div class="wz w2"><div class="wz-head"><span>2 / 3</span><b>Surroundings OK?</b></div>
              <div class="cam"><div class="cam-view">${img('manic')}<span class="cam-box"></span><span class="cam-tag">SIMULATED ROBOT VIEW</span></div></div>
              <div class="wz-card small">${['Nobody within 2 m', 'No sterile drapes', 'Brakes on', 'Power stable'].map((t) => `<div class="wz-row"><span>${t}</span>${ok}</div>`).join('')}</div>
              <button class="wz-btn" data-next>Looks good</button></div>
            <div class="wz w3"><div class="wz-head"><span>3 / 3</span><b>Start the update</b></div>
              <div class="start-art">${img('manic')}</div><div class="wz-rel">Released by Medical physics 19:24<br>signed package · rollback image ready</div>
              <button class="wz-btn hold" data-next>Start update</button>
              <button class="wz-link">Not sure? Pass on with a note</button></div>
            <div class="wz w4"><div class="started">✓</div><b class="st-t">Update started</b><span class="st-s">by Lena · 19:31 · logged in the audit trail</span></div>
          `, 'light', '19:30')}
          <div class="ps-right"><div class="big-quote hum">A human<br>starts <em>every</em><br>update.</div></div>
        </section>`,
      onStep: (s) => { if (s === 0) countdown(); },
    },
    {
      act: 'P', theme: 'dark', title: 'Update running', steps: 2, auto: { 0: 5200 },
      say: 'It keeps watching. It knows how long this should take and would raise a flag early. But today is a good day.',
      html: () => `
        <section class="robot run">
          ${mission(6, 'Update running.')}
          <div class="run-body">
            <div class="run-cio">${img('update')}</div>
            <div class="run-right">
              <div class="eyebrow">CARM-SEC 2026.11 · STARTED BY LENA 19:31</div>
              <div class="pbar"><i></i></div>
              <div class="pmeta"><span><b id="pct">0</b> %</span><span>expected 120 min · illustrative · on track</span></div>
              <div class="courier">Cio checks the manufacturer signature itself. The robot is only the courier.</div>
              <div class="watch"><span><i class="lamp green pulse"></i>Surroundings: watching</span><span><i class="lamp green pulse"></i>Duration: within expected</span></div>
              <button class="escalate">Escalate · inform</button>
              <div class="goodday s1">Today is a good day.</div>
            </div>
          </div>
        </section>`,
      onStep: (s) => { if (s === 0) progress(); else { const el = $('pct'); if (el) el.textContent = 100; } },
    },
    {
      act: 'P', theme: 'dark', title: 'Health check and report', steps: 2, auto: { 0: 3200 },
      say: 'A quick health check, logs and results reported back, every step on the audit trail. On to the next job.',
      html: () => `
        <section class="robot report">
          ${mission(7, 'Health check. Report. Next job.')}
          <div class="report-body">
            <div class="rep-card">
              <div class="eyebrow">REPORTED BACK</div>
              <div class="kpis">${[['Result', 'success'], ['Duration', '120 min'], ['Rollback image', 'kept'], ['Team review', 'pending']].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
            </div>
            <div class="audit-list">
              <div class="eyebrow">AUDIT TRAIL · C-03</div>
              ${[['19:24', 'Window published by Medical physics'], ['19:24', 'Request sent to 7 · none available'], ['19:26', 'Robot accepted · self-check passed'], ['19:29', 'Cio found · identity verified'], ['19:30', 'Surroundings 4/4 · start requested'], ['19:31', 'Rollback image · started by Lena'], ['21:31', 'Service reported for review · reported']].map(([t, e]) => `<div class="ae"><span>${t}</span>${e}</div>`).join('')}
            </div>
            <div class="leave s1">${img('ketty')}<span>On to the next job → C-04</span></div>
          </div>
        </section>`,
    },
    {
      act: 'E', theme: 'paper', title: 'Loop closed', steps: 2,
      say: 'And the loop closes where it started. Cio is happy, and the person who helped, even from afar, gets a thank-you. And everything the robot brings back is data we can use again.',
      html: () => `
        <section class="moods closing">
          <div class="mood-left"><div class="eyebrow">BACK IN THE APP</div><div class="mood-word">Loop<br>closed.</div></div>
          ${phone(`<div class="wz w0">${app(MOODS.happy)}</div><div class="wz w1">${lock('Lena · X-ray nurse', `${push('Thanks to you, Cio is up to date', 'You helped from afar. Team streak +1 ♥', 'now', 'p-in')}${push('Back in the plan', 'New data from Cio: version, logs, health. Next window ready.', '1 min ago')}`, '21:32')}</div>`, '', '21:32')}
          <div class="mood-right"><div class="eyebrow">WHAT COMES BACK</div><div class="dp"><span>For the person</span><b>a thank-you</b></div><div class="dp"><span>For the plan</span><b>fresh data</b></div><div class="dp"><span>For the hospital</span><b>a current C-arm</b></div></div>
        </section>`,
    },
  ];

  /* ---------- engine ---------- */
  const N = SCENES.length;
  const AUDIT = [0, 0, 0, 0, 0, 1, 1, 2, 5, 5, 6, 7, 7];
  let cur = 0, step = 0, timerPaused = false;
  const timers = new Set();
  const schedule = j => { if(timerPaused)return; j.began=performance.now();j.id=setTimeout(()=>{timers.delete(j);j.fn();},j.remaining); };
  const later = (fn,ms) => { const j={fn,remaining:ms/SPEED,id:null,began:0};timers.add(j);schedule(j);return j; };
  const clear = () => { for(const j of timers)clearTimeout(j.id);timers.clear(); };
  const pauseTimers = value => { if(timerPaused===value)return;timerPaused=value;for(const j of timers){if(value){clearTimeout(j.id);j.remaining=Math.max(0,j.remaining-(performance.now()-j.began));}else schedule(j);} };

  function setStep(s) {
    const sc = SCENES[cur], root = view.firstElementChild;
    step = s;
    root.className = `scene ${Array.from({ length: s + 1 }, (_, i) => `st-${i}`).join(' ')} at-${s}`;
    root.dataset.step = s;
    const total = SCENES.slice(0, cur).reduce((a, x) => a + (x.steps || 1), 0) + s + 1;
    const all = SCENES.reduce((a, x) => a + (x.steps || 1), 0);
    $('progress').style.width = `${(total / all) * 100}%`;
    if (sc.onStep) sc.onStep(s);
    const wait = Q.get('auto') !== '0' && sc.auto && sc.auto[s];
    if (wait) later(() => { if (SCENES[cur] === sc && step === s) next(); }, wait);
  }
  function show(i, s = 0) {
    clear();
    cur = Math.max(0, Math.min(N - 1, i));
    const sc = SCENES[cur];
    stage.dataset.theme = sc.theme;
    stage.dataset.act = sc.act;
    view.innerHTML = `<div class="scene">${sc.html()}</div>`;
    $('index').textContent = `${String(cur + 1).padStart(2, '0')} / ${N}`;
    const a = $('audit');
    a.hidden = !AUDIT[cur];
    a.querySelector('b').textContent = AUDIT[cur];
    a.querySelector('span').textContent = AUDIT[cur] === 1 ? 'audit entry' : 'audit entries';
    $('notes').textContent = sc.say || '';
    Q.delete('step');
    history.replaceState(null, '', `?${new URLSearchParams({ ...Object.fromEntries(Q), s: cur + 1 })}`);
    s = Math.min(s, (sc.steps || 1) - 1);
    // Two frames so CSS transitions start from the hidden state.
    requestAnimationFrame(() => requestAnimationFrame(() => setStep(s)));
  }
  function next() {
    const sc = SCENES[cur];
    if (step < (sc.steps || 1) - 1) { clear(); setStep(step + 1); } else if (cur < N - 1) show(cur + 1);
  }
  const prev = () => { if (step > 0) { clear(); setStep(step - 1); } else show(cur - 1); };

  function countdown() {
    let t = 299;
    const tick = () => { const el = $('countdown'); if (!el || t < 270) return; el.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; t--; later(tick, 1000); };
    tick();
  }
  function progress() {
    let p = 0;
    const tick = () => { const el = $('pct'); if (!el) return; el.textContent = Math.min(100, Math.round(p)); if (p < 100) { p += 2.5; later(tick, 110); } };
    tick();
  }

  // Input: buttons with data-next and a click anywhere on the stage both advance by one step.
  stage.addEventListener('click', (e) => {
    if (e.target.closest('.wz-link,.take,.escalate')) return;
    next();
  });
  addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home' || e.key === '0') show(0);
    else if (e.key === 'n' || e.key === 'N') $('notes').hidden = !$('notes').hidden;
    else if (e.key === 'f' || e.key === 'F') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  });

  // Fit the 1920 × 1080 stage into any window, like the team deck.
  const fit = () => { stage.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; };
  addEventListener('resize', fit); fit();
  if (Q.get('notes') === '1') $('notes').hidden = false;
  show((+Q.get('s') || 1) - 1, Math.max(0, +Q.get('step') || 0));

  if (Q.get('embed') === 'astra') {
    stage.classList.add('astra-embed');
    addEventListener('message', e => {
      if(e.source !== parent || e.origin !== location.origin) return;
      const m=e.data||{};
      if(m.demo==='go') { const i=Math.max(0,Math.min(N-1,(+m.s||1)-1)); if(i===cur){clear();setStep(Math.max(0,+m.step||0));}else show(i,Math.max(0,+m.step||0)); }
      if(m.demo==='pause') { pauseTimers(!!m.value);document.getAnimations().forEach(a=>m.value?a.pause():a.play()); }
    });
    window.DEMO={go:(s,t=0)=>show(s-1,t),getState:()=>({scene:cur+1,step}),scenes:SCENES.map((s,i)=>({scene:i+1,title:s.title,steps:s.steps||1}))};
    parent.postMessage({demo:'ready'},location.origin);
  }
})();
