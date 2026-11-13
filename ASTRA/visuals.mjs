/**
 * Presentation visuals for the existing C-ARMAGOTCHI team demo.
 *
 * Load the unmodified team data.js and planner.js before mounting.
 * mountScheduler(host, { planner = window.IAPlanner, data = window.IAData })
 * mountArchitecture(host)
 * Both return { play, pause, reset, step, destroy }. step accepts 0..4.
 * play/pause control decorative motion only; they never advance a pitch beat,
 * approve a mission, modify the schedule, or execute a device operation.
 */

const NS = 'http://www.w3.org/2000/svg';
const WIDTH = 1280;
const HEIGHT = 600;
const TIME_START = 360;
const TIME_END = 1440;
const X = 178;
const RIGHT = 1250;
const ROW_Y = 88;
const ROW_H = 65;
const ROW_IDS = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-08'];
const SPECIALTIES = {
  Unfallchirurgie: 'TRAUMA',
  Orthopädie: 'ORTHOPAEDICS',
  Gefäßchirurgie: 'VASCULAR',
  Urologie: 'UROLOGY',
  Notaufnahme: 'EMERGENCY',
};
let instanceId = 0;
const timeX = minute => X + (minute - TIME_START) / (TIME_END - TIME_START) * (RIGHT - X);
const clock = minute => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const clash = (a, b) => a.from < b.to && b.from < a.to;

/**
 * Reuse the actual team planner and data. The additional backup observation is
 * deliberately separate: team pickErsatz does not check the backup's case list.
 * Ranking uses its numeric hourly-use proxy; no learned forecast or fabricated
 * fallback planner is substituted.
 */
export function buildSchedulerModel(planner, data) {
  if (!planner?.fillGaps || !planner?.findWindow || !planner?.pickErsatz || !planner?.windowRisk || !planner?.RULES) {
    throw new Error('Load the team planner.js (window.IAPlanner) before the scheduler.');
  }
  if (!Array.isArray(data?.DEVICES) || !Number.isFinite(data?.NOW)) {
    throw new Error('Load the team data.js (window.IAData) before the scheduler.');
  }
  const context = { now: data.NOW, weekendDays: data.WEEKEND ?? [], blocked: {}, robotBusy: [] };
  const rows = ROW_IDS.map(id => data.DEVICES.find(device => device.id === id)).filter(Boolean);
  const candidates = [];
  for (const [row, device] of rows.entries()) {
    if (!device.update || device.update.art === 'arm') continue;
    const earliest = Math.ceil((data.NOW + planner.RULES.VORLAUF) / planner.RULES.STEP) * planner.RULES.STEP;
    for (let from = earliest; from + planner.RULES.DUR + planner.RULES.PUFFER <= planner.RULES.DAY_END; from += planner.RULES.STEP) {
      const result = planner.findWindow(device, 0, { ...context, now: from - planner.RULES.VORLAUF });
      const accepted = result.ok && result.from === from;
      candidates.push({
        row, id: device.id, from, accepted,
        risk: planner.windowRisk(device, 0, from, from + planner.RULES.DUR, context.weekendDays),
        deadline: device.update.frist, window: accepted ? result : null,
      });
    }
  }
  // This is an illustrative ranking of individual team-eligible starts, not a
  // learned interruption probability or a joint fleet optimization.
  const ranked = candidates.filter(candidate => candidate.accepted && Number.isFinite(candidate.risk))
    .sort((a, b) => a.risk - b.risk || a.from - b.from || a.deadline - b.deadline || a.id.localeCompare(b.id));
  const winner = ranked[0];
  const winnerDevice = winner && data.DEVICES.find(device => device.id === winner.id);
  const selected = winner && {
    ...winner.window,
    ersatz: planner.pickErsatz(data.DEVICES, winnerDevice, winner.window, []),
    name: winnerDevice.name, reserveEnd: winner.window.to + planner.RULES.PUFFER,
    status: 'vorschlag',
  };
  const backup = selected && data.DEVICES.find(device => device.id === selected.ersatz);
  const backupCases = backup?.busy?.[selected?.day];
  const backupClear = Boolean(backup && !backup.ausfall && Array.isArray(backupCases) &&
    !backupCases.some(block => clash(block, { from: selected.from, to: selected.reserveEnd })));
  const shortGaps = rows.flatMap((device, row) => (device.busy?.[0] ?? []).slice(1).flatMap((block, index) => {
    const previous = device.busy[0][index];
    return block.from > previous.to && block.from - previous.to < planner.RULES.DUR + planner.RULES.PUFFER + planner.RULES.VORLAUF
      ? [{ row, from: previous.to, to: block.from }] : [];
  }));
  return {
    rows, selected, backup: backup ? { id: backup.id, name: backup.name, clear: backupClear } : null,
    candidates, shortGaps, rules: { ...planner.RULES }, now: data.NOW,
    risks: rows.map(device => Array.from({ length: 7 }, (_, index) => ({
      from: (17 + index) * 60,
      value: planner.windowRisk(device, 0, (17 + index) * 60, (18 + index) * 60, context.weekendDays),
    }))),
  };
}

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function mountFrame(host, kind, title) {
  if (!(host instanceof Element)) throw new TypeError('A visual needs a host Element.');
  const wrapper = document.createElement('div');
  wrapper.className = `av-visual av-${kind} av-paused`;
  wrapper.dataset.step = '0';
  const svg = svgNode('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'img', 'aria-label': title });
  wrapper.append(svg);
  host.append(wrapper);
  const prefix = `av-${kind}-${++instanceId}`;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  return { wrapper, svg, prefix, reduced };
}

function controller(frame, renderStep, animate) {
  let running = false;
  let destroyed = false;
  let request = 0;
  let phase = 0;
  let elapsed = 0;
  let previous = null;
  const tick = now => {
    if (!running || destroyed) return;
    if (previous !== null) elapsed += Math.min(100, now - previous);
    previous = now;
    animate(elapsed / 1000, phase);
    request = requestAnimationFrame(tick);
  };
  const pause = () => {
    running = false;
    previous = null;
    cancelAnimationFrame(request);
    frame.wrapper.classList.add('av-paused');
  };
  const step = (value = phase + 1) => {
    if (destroyed) return;
    const numeric = Number(value);
    phase = Math.max(0, Math.min(4, Number.isFinite(numeric) ? Math.round(numeric) : 0));
    frame.wrapper.dataset.step = String(phase);
    renderStep(phase);
    animate(elapsed / 1000, phase);
  };
  step(0);
  return Object.freeze({
    play() {
      if (destroyed || running) return;
      frame.wrapper.classList.remove('av-paused');
      if (frame.reduced) { animate(0, phase); return; }
      running = true;
      previous = null;
      request = requestAnimationFrame(tick);
    },
    pause,
    reset() { elapsed = 0; step(0); },
    step,
    destroy() { pause(); destroyed = true; frame.wrapper.remove(); },
  });
}

function defs(prefix) {
  return `<defs>
    <linearGradient id="${prefix}-night" x1="0" x2="1"><stop stop-color="#2e7563" stop-opacity=".04"/><stop offset="1" stop-color="#91dfbb" stop-opacity=".10"/></linearGradient>
    <linearGradient id="${prefix}-gold" x1="0" x2="1"><stop stop-color="#b89444" stop-opacity=".12"/><stop offset=".5" stop-color="#ebd298" stop-opacity=".27"/><stop offset="1" stop-color="#b89444" stop-opacity=".12"/></linearGradient>
    <radialGradient id="${prefix}-glow"><stop stop-color="#a9f0c8" stop-opacity=".16"/><stop offset="1" stop-color="#a9f0c8" stop-opacity="0"/></radialGradient>
    <filter id="${prefix}-bloom" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="3"/></filter>
    <pattern id="${prefix}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V7" stroke="#d6bd80" stroke-opacity=".34" stroke-width="1"/></pattern>
  </defs>`;
}

export function mountScheduler(host, options = {}) {
  const model = buildSchedulerModel(options.planner ?? window.IAPlanner, options.data ?? window.IAData);
  const frame = mountFrame(host, 'scheduler', 'Synthetic team operating-theatre schedule. Agents scan idle windows; the team planner proposes a service window requiring human approval.');
  const { svg, prefix } = frame;
  const chartEnd = ROW_Y + model.rows.length * ROW_H;
  const goldRow = model.rows.findIndex(row => row.id === model.selected?.id);
  const selected = model.selected;
  const daytime = model.rows.map((device, row) => {
    const y = ROW_Y + row * ROW_H;
    const cases = (device.busy?.[0] ?? []).map(block => {
      const width = timeX(block.to) - timeX(block.from);
      return `<g class="av-case"><rect x="${timeX(block.from)}" y="${y + 11}" width="${width}" height="40" rx="5"/>
        ${width > 72 ? `<text x="${timeX(block.from) + 12}" y="${y + 36}">${escape(SPECIALTIES[block.fach] ?? block.fach ?? 'SURGERY')}</text>` : ''}</g>`;
    }).join('');
    return `<g class="av-row ${device.id === selected?.id ? 'av-target-row' : ''}" style="--av-row:${row}">
      <line class="av-row-rule" x1="16" x2="${RIGHT}" y1="${y + ROW_H - 1}" y2="${y + ROW_H - 1}"/>
      <text class="av-device" x="17" y="${y + 30}">${escape(device.name)}<tspan class="av-id" dx="10">${escape(device.id)}</tspan></text>
      <text class="av-room" x="18" y="${y + 48}">${escape(device.id === 'C-05' ? 'RESERVE' : device.id === 'C-08' ? 'EMERGENCY / STANDBY' : (device.busy?.[0]?.[0]?.saal ?? device.ort).replace('Saal ', 'OR ').toUpperCase())}</text>
      <rect class="av-night" x="${timeX(17 * 60)}" y="${y + 11}" width="${RIGHT - timeX(17 * 60)}" height="40" rx="5" fill="url(#${prefix}-night)"/>
      ${cases}
      <g class="av-risk-cells">${model.risks[row].map(risk => `<rect x="${timeX(risk.from) + 1}" y="${y + 54}" width="${timeX(risk.from + 60) - timeX(risk.from) - 2}" height="3" rx="1.5" fill="${!Number.isFinite(risk.value) ? '#d7aa72' : risk.value > model.rules.MAX_RISK ? '#cc8275' : '#91dfbb'}" opacity="${Number.isFinite(risk.value) ? .16 + risk.value * .8 : .75}"/>`).join('')}</g>
    </g>`;
  }).join('');
  const hours = Array.from({ length: 10 }, (_, index) => 6 + index * 2).map(hour => `<g>
    <line class="av-grid" x1="${timeX(hour * 60)}" x2="${timeX(hour * 60)}" y1="79" y2="${chartEnd}"/>
    <text class="av-hour" text-anchor="${hour === 24 ? 'end' : 'middle'}" x="${timeX(hour * 60)}" y="62">${String(hour).padStart(2, '0')}:00</text>
  </g>`).join('');
  const proposal = selected ? `<g class="av-proposal">
    <rect class="av-proposal-glow" x="${timeX(selected.from) - 11}" y="${ROW_Y + goldRow * ROW_H + 2}" width="${timeX(selected.to) - timeX(selected.from) + 22}" height="58" rx="14"/>
    <rect x="${timeX(selected.from)}" y="${ROW_Y + goldRow * ROW_H + 11}" width="${timeX(selected.to) - timeX(selected.from)}" height="40" rx="5" fill="url(#${prefix}-gold)" class="av-gold-window"/>
    <rect x="${timeX(selected.to) + 3}" y="${ROW_Y + goldRow * ROW_H + 11}" width="${timeX(selected.reserveEnd) - timeX(selected.to) - 3}" height="40" rx="3" fill="url(#${prefix}-hatch)"/>
    <text class="av-window-text" x="${timeX((selected.from + selected.to) / 2)}" y="${ROW_Y + goldRow * ROW_H + 36}" text-anchor="middle">${clock(selected.from)}–${clock(selected.to)}</text>
    <path class="av-gold-pointer" d="M${timeX(selected.from) + 10} ${ROW_Y + goldRow * ROW_H + 54}v13"/>
  </g>` : '';
  svg.innerHTML = `${defs(prefix)}
    <circle cx="1020" cy="285" r="300" fill="url(#${prefix}-glow)" class="av-atmosphere"/>
    <text class="av-kicker" x="18" y="28">THEATRE / DEVICE</text>
    <text class="av-kicker" x="${RIGHT}" y="28" text-anchor="end">SYNTHETIC TEAM SCENARIO</text>
    ${hours}${daytime}
    <g class="av-short-gaps">${model.shortGaps.map(gap => {
      const x = timeX((gap.from + gap.to) / 2), y = ROW_Y + gap.row * ROW_H + 31;
      return `<g><rect x="${timeX(gap.from) + 3}" y="${y - 20}" width="${Math.max(12, timeX(gap.to) - timeX(gap.from) - 6)}" height="40" rx="4"/><path d="M${x - 6} ${y - 6}l12 12m0-12-12 12"/></g>`;
    }).join('')}</g>
    <g class="av-sampling-boxes" aria-hidden="true"></g>
    <g class="av-search-dots" aria-hidden="true"></g>
    ${proposal}
    <g class="av-now"><line x1="${timeX(model.now)}" x2="${timeX(model.now)}" y1="77" y2="${chartEnd}" stroke-dasharray="2 5"/><text x="${timeX(model.now) - 8}" y="74" text-anchor="end">NOW</text></g>
    <line class="av-bottom-rule" x1="18" x2="${RIGHT}" y1="514" y2="514"/>
    <circle class="av-state-light" cx="25" cy="545" r="4"/>
    <text class="av-status" x="42" y="551"></text>
    <text class="av-detail" x="42" y="578"></text>
    <text class="av-source-note" x="${RIGHT}" y="578" text-anchor="end">ILLUSTRATIVE SCHEDULE · PROPOSED WINDOW</text>`;
  const dotsHost = svg.querySelector('.av-search-dots');
  const boxesHost = svg.querySelector('.av-sampling-boxes');
  const particles = Array.from({ length: Math.min(42, model.candidates.length) }, (_, index) => {
    const candidate = model.candidates[(index * 17) % model.candidates.length];
    const bot = svgNode('g', { class: 'av-scout-bot', color: '#a9edca' });
    bot.innerHTML = `<path class="av-scout-tail" d="M-32 0H-9"/><g class="av-scout-head"><circle class="av-scout-orbit" r="9"/><path class="av-scout-cross" d="M-13 0h5m16 0h5M0-13v5m0 16v5"/><circle class="av-scout-core" r="${index % 6 === 0 ? 5.5 : 4}"/><circle class="av-scout-eye" cx="1.5" cy="-1" r="1.1"/></g>`;
    dotsHost.append(bot);
    let box = null;
    if (index % 3 === 0) {
      box = svgNode('g', { class: 'av-sampling-box' });
      const x = timeX(candidate.from), y = ROW_Y + candidate.row * ROW_H + 11;
      box.innerHTML = `<rect x="${x}" y="${y}" width="${timeX(candidate.from + model.rules.DUR) - x}" height="40" rx="5"/><path class="av-reject-cross" d="M${x + 46} ${y + 12}l16 16m0-16-16 16"/>`;
      boxesHost.append(box);
    }
    return { bot, head: bot.querySelector('.av-scout-head'), core: bot.querySelector('.av-scout-core'), tail: bot.querySelector('.av-scout-tail'), box, candidate, index, x: X, y: ROW_Y + candidate.row * ROW_H + 31 };
  });
  const labels = [
    ['A full theatre day.', 'Booked surgery. Night standby. One service queue.'],
    ['Search the gaps.', `${model.candidates.length} candidate starts checked against the team’s timing rules.`],
    ['Challenge the quiet.', 'Too short. Too busy. Keep emergency standby available.'],
    [selected ? `Proposed window · ${selected.name} ${clock(selected.from)}–${clock(selected.to)}` : 'No eligible proposal.', selected ? `Lowest illustrative use proxy. ${model.backup?.clear ? `${model.backup.name} clear on the case plan.` : 'Backup confirmation pending.'} Human approval pending.` : 'Missing evidence stays unresolved.'],
    ['A proposal. A human decision.', 'Identity · package · surroundings · power + data · authorized start.'],
  ];
  let lastPhase = 0;
  let convergeAt = 0;
  return controller(frame, phase => {
    svg.querySelector('.av-status').textContent = labels[phase][0];
    svg.querySelector('.av-detail').textContent = labels[phase][1];
    svg.setAttribute('aria-label', `${labels[phase][0]} ${labels[phase][1]} Synthetic team scenario, not a clinical forecast.`);
  }, (time, phase) => {
    if (phase >= 3 && lastPhase < 3) {
      convergeAt = time;
      for (const particle of particles) { particle.fromX = particle.x; particle.fromY = particle.y; }
    }
    for (const particle of particles) {
      const { bot, head, core, tail, box, candidate, index } = particle;
      const progress = (time * (.28 + (index % 7) * .027) + index * .137) % 1;
      const start = X + (index % 5) * 56;
      const destination = timeX(candidate.from) + 48;
      const baseY = ROW_Y + candidate.row * ROW_H + 31;
      let x = start + (destination - start) * progress;
      let y = baseY + Math.sin(progress * Math.PI * 2 + index) * (14 + index % 5 * 7);
      let settling = 0;
      if (phase >= 3 && selected) {
        settling = Math.min(1, Math.max(0, (time - convergeAt) / (1.05 + index % 6 * .12)));
        const eased = 1 - (1 - settling) ** 3;
        const targetX = timeX(selected.from + 8 + (index % 11) / 10 * (selected.to - selected.from - 16));
        const targetY = ROW_Y + goldRow * ROW_H + 31 + (index % 2 ? 22 : -22);
        x = (particle.fromX ?? x) + (targetX - (particle.fromX ?? x)) * eased;
        y = (particle.fromY ?? y) + (targetY - (particle.fromY ?? y)) * eased;
      }
      const angle = Math.atan2(y - particle.y, x - particle.x) * 180 / Math.PI;
      bot.setAttribute('transform', `translate(${x} ${y}) rotate(${Number.isFinite(angle) ? angle : 0})`);
      bot.setAttribute('color', phase >= 3 ? '#ffe29a' : phase === 2 && !candidate.accepted ? '#dd907d' : '#b8f9d3');
      bot.setAttribute('opacity', frame.reduced || phase === 0 || phase === 4 ? 0 : phase >= 3 ? .9 - settling * .42 : .42 + Math.sin(progress * Math.PI) * .5);
      head.setAttribute('transform', `rotate(${time * 140 + index * 19}) scale(${phase >= 3 ? 1 - settling * .55 : 1})`);
      core.setAttribute('r', phase >= 3 ? 5 - settling * 2.5 : index % 6 === 0 ? 5.5 : 4);
      tail.setAttribute('opacity', phase >= 3 ? 1 - settling : .7);
      if (box) {
        box.setAttribute('color', phase === 2 && !candidate.accepted ? '#dd907d' : '#b8f9d3');
        box.setAttribute('opacity', phase === 1 || phase === 2 ? (phase === 2 && !candidate.accepted ? .65 : .2) + Math.max(0, progress - .6) : 0);
        box.querySelector('.av-reject-cross').setAttribute('opacity', phase === 2 && !candidate.accepted ? 1 : 0);
      }
      particle.x = x;
      particle.y = y;
    }
    lastPhase = phase;
  });
}

const ICONS = {
  calendar: '<rect x="-19" y="-15" width="38" height="34" rx="5"/><path d="M-19-4H19M-10-20v10M10-20v10M-10 5h3m9 0h3m-15 8h3m9 0h3"/>',
  device: '<rect x="-20" y="-16" width="40" height="29" rx="4"/><path d="M-9 20H9M0 13v7M-12-7h15M-12 0h9"/>',
  rules: '<path d="M0-21 19-12v15C19 15 0 23 0 23S-19 15-19 3v-15Z"/><path d="m-8 0 6 6L11-7"/>',
  scout: '<circle r="13"/><path d="m10 10 13 13M-6-3h12M-6 3h8"/>',
  risk: '<path d="m0-20 22 38h-44Z"/><path d="M0-7v11M0 10v1"/>',
  preflight: '<path d="M-16-20h25l8 8v33h-33Z"/><path d="M8-20v9h9m-26 13 6 6L9-3"/>',
  human: '<circle cy="-12" r="9"/><path d="M-18 20v-6C-18 3 18 3 18 14v6M8 21l6 6 12-15"/>',
  companion: '<rect x="-21" y="-15" width="42" height="34" rx="11"/><path d="M-8-15v-8m16 8v-8M-7 1h1m12 0h1m-15 10q8 7 16 0M-16 23h4m24 0h4"/>',
  carm: '<path d="M12-25a27 27 0 1 0 0 50M10-29h10v10H10ZM10 19h10v10H10ZM-24 8v27h27M-29 36h38"/><circle cx="-22" cy="40" r="3"/><circle cx="4" cy="40" r="3"/>',
  receipt: '<path d="M-16-22h32v43l-8-4-8 4-8-4-8 4Z"/><path d="m-8-5 6 6L9-11M-8 10H8"/>',
};

function architectureNode({ x, y, icon, image, label, detail = '', phase, kind = '', radius = 36 }) {
  return `<g class="av-node av-node-${kind}" data-reveal="${phase}" transform="translate(${x} ${y})">
    <circle class="av-node-aura" r="${radius + 16}"/>
    ${image ? `<image href="${escape(image)}" x="-79" y="-87" width="158" height="172" preserveAspectRatio="xMidYMid meet"/>` : `<circle class="av-node-ring" r="${radius}"/><g class="av-icon">${ICONS[icon]}</g>`}
    <text class="av-node-label" y="${image ? 108 : radius + 29}" text-anchor="middle">${label}</text>
    ${detail ? `<text class="av-node-detail" y="${image ? 131 : radius + 51}" text-anchor="middle">${detail}</text>` : ''}
  </g>`;
}

// Fine growing filaments around the readable service paths. Inspired by OPUS's
// mycelial visual direction, implemented on our existing SVG route geometry:
// the parent tip reaches a branch origin before the offshoot begins to grow.
function growFilaments(svg, routes, prefix) {
  const host = svgNode('g', { class: 'av-mycelium', 'aria-hidden': 'true' });
  svg.querySelector('.av-branches').before(host);
  let seed = 72819;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const stroke = (points, phase, delay, kind = '') => {
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const path = svgNode('path', { d, pathLength: 1, class: `av-fiber ${kind}`, 'data-reveal': phase });
    path.style.setProperty('--grow-delay', `${delay.toFixed(3)}s`);
    host.append(path);
  };
  routes.forEach((route, index) => {
    const path = svg.querySelector(`#${prefix}-route-${index}`);
    const length = path.getTotalLength();
    // Correlated deviations make living strands, while the route remains clear.
    for (const side of [-1, 1]) {
      const points = [];
      let wobble = 0;
      for (let distance = 0; distance <= length; distance += 4) {
        const p = path.getPointAtLength(distance);
        const q = path.getPointAtLength(Math.min(length, distance + 2));
        const angle = Math.atan2(q.y-p.y, q.x-p.x) + Math.PI/2;
        wobble = wobble * .8 + (random()-.5) * 1.8;
        const offset = Math.sin(distance / length * Math.PI) * (side*2.4+wobble);
        points.push({x:p.x+Math.cos(angle)*offset,y:p.y+Math.sin(angle)*offset});
      }
      stroke(points, route.phase, .08 + index % 3 * .1, 'av-fiber-strand');
    }
    for (let n = 0; n < Math.floor(length/65); n++) {
      const t = .16 + n / Math.max(1, Math.floor(length/65)) * .67;
      const p = path.getPointAtLength(length*t);
      const q = path.getPointAtLength(length*t+2);
      const side = random()<.5?-1:1;
      let direction = Math.atan2(q.y-p.y,q.x-p.x)+side*(.55+random()*.5);
      let x=p.x,y=p.y,wobble=0;
      const points=[{x,y}], count=7+Math.floor(random()*7);
      for(let k=0;k<count;k++){
        wobble=wobble*.72+(random()-.5)*.55;direction+=wobble;
        x+=Math.cos(direction)*(3.6-k*.12);y+=Math.sin(direction)*(3.6-k*.12);
        points.push({x,y});
      }
      const delay=.2+t*1.8+index%3*.1;
      stroke(points,route.phase,delay,'av-fiber-offshoot');
      const at=points[Math.floor(points.length*.63)];
      let bx=at.x,by=at.y,angle=direction-side*.85;
      const twig=[{x:bx,y:by}];
      for(let k=0;k<5;k++){angle+=(random()-.5)*.25;bx+=Math.cos(angle)*2.2;by+=Math.sin(angle)*2.2;twig.push({x:bx,y:by});}
      stroke(twig,route.phase,delay+.55,'av-fiber-twig');
    }
  });
}

export function mountArchitecture(host, options = {}) {
  const frame = mountFrame(host, 'architecture', 'Proposed architecture: hospital inputs feed specialist agents, deterministic policy and human approval, then companion power and data, C-arm verification and logs.');
  const { svg, prefix } = frame;
  const assetBase = options.assetBase ?? './assets/characters/';
  const asset = name => `${assetBase.replace(/\/?$/, '/')}${name}`;
  const routes = [
    { phase: 1, d: 'M130 126C235 126 196 145 302 145' },
    { phase: 1, d: 'M130 280C217 280 213 145 302 145' },
    { phase: 1, d: 'M130 280C221 280 226 300 302 300' },
    { phase: 1, d: 'M130 436C244 436 201 300 302 300' },
    { phase: 1, d: 'M130 436C208 436 224 455 302 455' },
    { phase: 2, d: 'M378 145C483 145 449 278 559 278' },
    { phase: 2, d: 'M378 300C465 300 465 278 559 278' },
    { phase: 2, d: 'M378 455C484 455 464 278 559 278' },
    { phase: 2, d: 'M641 278C688 278 686 278 733 278' },
    { phase: 3, d: 'M811 278C866 278 864 278 918 278' },
    { phase: 3, d: 'M994 278C1050 278 1050 278 1108 278' },
    { phase: 4, d: 'M1147 416C1130 460 1020 485 922 485' },
    { phase: 4, d: 'M850 485C765 485 815 564 665 564C420 564 245 568 95 490' },
  ];
  const nodes = [
    { x: 95, y: 126, icon: 'calendar', label: 'OR SCHEDULE', phase: 0, kind: 'input', radius: 31 },
    { x: 95, y: 280, icon: 'device', label: 'DEVICE STATE', phase: 0, kind: 'input', radius: 31 },
    { x: 95, y: 436, icon: 'rules', label: 'SERVICE RULES', phase: 0, kind: 'input', radius: 31 },
    { x: 340, y: 145, icon: 'scout', label: 'SCHEDULE SCOUT', detail: 'Find the window', phase: 1, kind: 'agent' },
    { x: 340, y: 300, icon: 'risk', label: 'RISK SENTINEL', detail: 'Challenge the quiet', phase: 1, kind: 'agent' },
    { x: 340, y: 455, icon: 'preflight', label: 'PREFLIGHT AGENT', detail: 'Test readiness', phase: 1, kind: 'agent' },
    { x: 600, y: 278, icon: 'rules', label: 'ALOHA CORE', detail: 'Fixed policy · orchestration', phase: 0, kind: 'policy', radius: 40 },
    { x: 772, y: 278, icon: 'human', label: 'HUMAN GATE', detail: 'Authorize · release', phase: 2, kind: 'human', radius: 38 },
    { x: 956, y: 278, image: asset('ketty.webp'), label: 'KETTY', detail: 'Power + approved data', phase: 3, kind: 'physical', radius: 72 },
    { x: 1147, y: 278, image: asset('lonely.webp'), label: 'C-ARM', detail: 'Approved service', phase: 3, kind: 'physical', radius: 72 },
    { x: 886, y: 485, icon: 'receipt', label: 'VERIFY + LOG', detail: 'Exceptions to a person', phase: 4, kind: 'receipt', radius: 33 },
  ];
  svg.innerHTML = `${defs(prefix)}
    <circle class="av-atmosphere" cx="430" cy="300" r="310" fill="url(#${prefix}-glow)"/>
    <text class="av-kicker" x="20" y="28">TRUSTED INPUTS</text>
    <text class="av-kicker" x="340" y="28" text-anchor="middle">SPECIALIST ANALYSIS</text>
    <text class="av-kicker" x="772" y="28" text-anchor="middle">AUTHORIZATION</text>
    <text class="av-kicker" x="1250" y="28" text-anchor="end">PHYSICAL SERVICE</text>
    <g class="av-branches">${routes.map((route, index) => `<path id="${prefix}-route-${index}" class="av-branch ${route.phase === 4 ? 'av-return-branch' : ''}" data-reveal="${route.phase}" d="${route.d}" pathLength="1"/>`).join('')}</g>
    <g class="av-signal-particles" aria-hidden="true"></g>
    ${nodes.map(architectureNode).join('')}
    <text class="av-architecture-line" x="620" y="108" text-anchor="middle">AGENTS PROPOSE.</text>
    <text class="av-architecture-line av-human-line" x="930" y="140" text-anchor="middle">PEOPLE AUTHORIZE.</text>
    <text class="av-source-note" x="20" y="586">PROPOSED SERVICE ARCHITECTURE</text>`;
  growFilaments(svg, routes, prefix);
  const allReveals = [...svg.querySelectorAll('[data-reveal]')];
  const signalHost = svg.querySelector('.av-signal-particles');
  const moving = routes.flatMap((route, index) => {
    const path = svg.querySelector(`#${prefix}-route-${index}`);
    const length = path.getTotalLength();
    return [0, 1, 2].map(dotIndex => {
      const dot = svgNode('circle', { r: dotIndex === 0 ? 2.8 : 1.6, class: 'av-signal', fill: route.phase === 3 ? '#e4c888' : '#adf0cd' });
      signalHost.append(dot);
      return { path, length, dot, route, index, dotIndex };
    });
  });
  return controller(frame, phase => {
    allReveals.forEach(node => node.classList.toggle('av-revealed', Number(node.dataset.reveal) <= phase));
  }, (time, phase) => {
    for (const { path, length, dot, route, index, dotIndex } of moving) {
      const visible = phase >= route.phase && !frame.reduced;
      const progress = (time * .15 + index * .11 + dotIndex / 3) % 1;
      const point = path.getPointAtLength(length * progress);
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
      dot.setAttribute('opacity', visible ? Math.sin(progress * Math.PI) * .9 : 0);
    }
  });
}
