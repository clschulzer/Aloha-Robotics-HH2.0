import { ChompGame, WIDTH, HEIGHT, DIRS, HIGH_SCORE_KEY } from './engine.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('#maze'), ctx = canvas.getContext('2d', { alpha: false });
const mascot = $('#mascot'), mascotCtx = mascot.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = 16;
const PALETTE = ['#fb7eaa', '#b093ff', '#f5bd69', '#94cfd5'];
let game = new ChompGame(), previousPhase = '', previousLevel = 0;
let best = 0, initialBest = 0, sound = false, audio = null, wallLayer;
let lastTime = performance.now(), particles = [], floating = [], clock = 0, flash = 0;
let fpsFrames = 0, fpsTime = 0, measuredFPS = 0, inputCount = 0, quipIndex = 0;
let latestHUD = '', lastPelletAudio = 0;
try { best = Math.max(0, Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0); sound = localStorage.getItem('c-chomp-sound') === 'true'; } catch {}
initialBest = best;
const QUIPS = [
  '“My warranty does not cover this.”',
  '“I’m on a strict all-firmware diet.”',
  '“This could have been a Windows update.”',
  '“Please do not unplug the main character.”',
  '“My hobbies? Eating. Avoiding IT.”',
  '“Clinically obsessed with little dots.”',
];
const KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowRight: 'right', d: 'right', D: 'right', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left' };

function saveBest() {
  if (game.state.score <= best) return;
  best = game.state.score;
  try { localStorage.setItem(HIGH_SCORE_KEY, String(best)); } catch {}
}
function say(text) { $('#quip').textContent = text; }
function unlockAudio() {
  if (!sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { sound = false; refreshSound(); }
}
function tone(frequency, duration = .07, type = 'square', volume = .025, when = 0, end = null) {
  if (!sound || !audio || audio.state !== 'running') return;
  const t = audio.currentTime + when;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, t);
  if (end) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, end), t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
  oscillator.connect(gain); gain.connect(audio.destination);
  oscillator.start(t); oscillator.stop(t + duration + .02);
}
function tune(notes, speed = .09) { notes.forEach((n, i) => tone(n, .14, 'triangle', .07, i * speed)); }
function refreshSound() {
  $('#sound-button').setAttribute('aria-pressed', String(sound));
  $('#sound-button').setAttribute('aria-label', sound ? 'Mute sound' : 'Enable sound');
  $('#sound-label').textContent = sound ? 'SOUND ON' : 'SOUND OFF';
}

function pixelArm(target, x, y, scale = 1, facing = 'right', frame = 0, powered = false) {
  target.save();
  target.translate(Math.round(x), Math.round(y));
  target.scale(scale, scale);
  const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[facing] || 0;
  target.rotate(angle);
  target.translate(-8, -8);
  const opening = Math.sin(frame * 12) > 0 ? 1 : 0;
  const pixel = (x0, y0, w, h, color) => { target.fillStyle = color; target.fillRect(x0, y0, w, h); };
  // The arch is a pixel C-arm, with distinct tube and detector jaws.
  pixel(5, 1, 6, 2, '#4e6476');
  pixel(2, 3, 4, 2, '#4e6476');
  pixel(1, 5, 3, 6, '#4e6476');
  pixel(3, 11, 3, 2, '#4e6476');
  pixel(5, 13, 6, 2, '#4e6476');
  pixel(5, 2, 6, 2, '#e9f6ed');
  pixel(3, 4, 3, 2, '#e9f6ed');
  pixel(2, 6, 3, 5, '#e9f6ed');
  pixel(4, 11, 3, 2, '#e9f6ed');
  pixel(6, 12, 5, 2, '#e9f6ed');
  pixel(4, 6, 2, 3, '#bad3d1');
  const jaw = powered ? '#ffe780' : '#99e4d0';
  pixel(10, 2 + opening, 4, 4, '#526c79');
  pixel(11, 2 + opening, 4, 3, jaw);
  pixel(10, 10 - opening, 4, 4, '#526c79');
  pixel(11, 10 - opening, 4, 3, jaw);
  pixel(14, 3 + opening, 1, 2, '#f9ffe6');
  pixel(14, 10 - opening, 1, 2, '#f9ffe6');
  pixel(4, 13, 5, 2, '#bd93c7');
  pixel(3, 15, 3, 1, '#88b1a8'); pixel(9, 15, 3, 1, '#88b1a8');
  pixel(6, 3, 3, 3, '#ffffff'); pixel(7, 4, 2, 2, '#20182c');
  pixel(7, 4, 1, 1, '#a5f8ed');
  if (powered) { pixel(6, 0, 1, 1, '#fff1ae'); pixel(0, 5, 1, 1, '#fff1ae'); }
  target.restore();
}

function drawBug(bug, x, y, time, power) {
  const scared = power > 0 && bug.mode !== 'eaten';
  const blinking = power < 2 && Math.floor(time * 7) % 2 === 0;
  const body = scared ? (blinking ? '#f7e5c4' : '#6e9dd7') : PALETTE[bug.id];
  const step = Math.floor(time * 7 + bug.id) % 2;
  ctx.save(); ctx.translate(Math.round(x) - 8, Math.round(y) - 8);
  if (bug.mode !== 'eaten') {
    ctx.fillStyle = body;
    ctx.fillRect(4, 3, 8, 9); ctx.fillRect(3, 5, 10, 5);
    ctx.fillRect(5, 2, 6, 1);
    ctx.fillRect(2, 4 + step, 2, 2); ctx.fillRect(12, 4 + step, 2, 2);
    ctx.fillRect(1, 8, 3, 1); ctx.fillRect(12, 8, 3, 1);
    ctx.fillRect(2, 11 - step, 3, 2); ctx.fillRect(11, 11 - step, 3, 2);
    ctx.fillRect(5, 0, 1, 3); ctx.fillRect(10, 0, 1, 3);
    ctx.fillStyle = '#ffffff22'; ctx.fillRect(5, 3, 6, 2);
  }
  ctx.fillStyle = '#fff8ea'; ctx.fillRect(4, 5, 3, 4); ctx.fillRect(9, 5, 3, 4);
  const d = DIRS[bug.dir] || { x: 0, y: 0 };
  ctx.fillStyle = '#261c3c';
  ctx.fillRect(5 + Math.sign(d.x), 6 + Math.sign(d.y), 1, 2);
  ctx.fillRect(10 + Math.sign(d.x), 6 + Math.sign(d.y), 1, 2);
  if (scared) {
    ctx.fillStyle = '#fff0d9';
    for (let n = 0; n < 5; n++) ctx.fillRect(5 + n, 11 + n % 2, 1, 1);
  }
  ctx.restore();
}

function cacheMaze() {
  wallLayer = document.createElement('canvas');
  wallLayer.width = canvas.width; wallLayer.height = canvas.height;
  const c = wallLayer.getContext('2d');
  c.fillStyle = '#150e25'; c.fillRect(0, 0, canvas.width, canvas.height);
  const maze = game.state.maze;
  const wall = (x, y) => x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || maze[y * WIDTH + x];
  const colors = [['#332447', '#745299', '#49325f'], ['#243b3d', '#528c82', '#2d5755'], ['#452b40', '#ad6884', '#6c3c59']][game.state.level - 1];
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    if (!wall(x, y)) continue;
    const px = x * T, py = y * T;
    c.fillStyle = colors[0]; c.fillRect(px, py, T, T);
    c.fillStyle = colors[1];
    if (!wall(x, y - 1)) c.fillRect(px, py + 1, T, 1);
    if (!wall(x - 1, y)) c.fillRect(px + 1, py, 1, T);
    c.fillStyle = colors[2];
    if (!wall(x, y + 1)) c.fillRect(px, py + T - 2, T, 1);
    if (!wall(x + 1, y)) c.fillRect(px + T - 2, py, 1, T);
    c.fillStyle = '#150e25';
    if (!wall(x - 1, y) && !wall(x, y - 1)) c.fillRect(px, py, 2, 2);
    if (!wall(x + 1, y) && !wall(x, y - 1)) c.fillRect(px + T - 2, py, 2, 2);
    if (!wall(x - 1, y) && !wall(x, y + 1)) c.fillRect(px, py + T - 2, 2, 2);
    if (!wall(x + 1, y) && !wall(x, y + 1)) c.fillRect(px + T - 2, py + T - 2, 2, 2);
  }
}

function burst(x, y, color, count = 10) {
  if (reduced) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * 2 * i / count, speed = 16 + Math.random() * 35;
    particles.push({ x: x * T + 8, y: y * T + 8, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .55, color });
  }
}
function renderMaze(dt) {
  const s = game.state;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(wallLayer, 0, 0);
  for (let i = 0; i < s.pellets.length; i++) {
    if (!s.pellets[i]) continue;
    const x = (i % WIDTH) * T + 8, y = Math.floor(i / WIDTH) * T + 8;
    if (s.pellets[i] === 2) {
      const pulse = reduced ? 1 : .7 + Math.sin(clock * 5) * .3;
      ctx.fillStyle = `rgba(149,231,195,${pulse * .13})`; ctx.fillRect(x - 6, y - 6, 12, 12);
      ctx.fillStyle = '#bef5cd';
      ctx.fillRect(x - 3, y - 2, 6, 5);
      ctx.fillRect(x - 2, y - 5, 1, 3); ctx.fillRect(x + 1, y - 5, 1, 3);
      ctx.fillRect(x - 1, y + 3, 2, 3);
    } else {
      ctx.fillStyle = '#f8d69b'; ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  for (const b of s.bugs) {
    const d = DIRS[b.dir] || { x: 0, y: 0 };
    if (b.delay > 0) ctx.globalAlpha = .45;
    drawBug(b, (b.x + d.x * b.progress) * T + 8, (b.y + d.y * b.progress) * T + 8, clock, s.power);
    ctx.globalAlpha = 1;
  }
  const p = s.player, d = DIRS[p.dir] || { x: 0, y: 0 };
  if (s.phase !== 'dying') {
    ctx.globalAlpha = s.invulnerable > 0 && !reduced && Math.floor(clock * 8) % 2 ? .45 : 1;
    pixelArm(ctx, (p.x + d.x * p.progress) * T + 8, (p.y + d.y * p.progress) * T + 8, 1, p.dir || 'left', reduced ? 0 : clock, s.power > 0);
    ctx.globalAlpha = 1;
  }
  particles = particles.filter(particle => particle.life > 0);
  for (const particle of particles) {
    particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt;
    ctx.globalAlpha = Math.max(0, particle.life / .55);
    ctx.fillStyle = particle.color; ctx.fillRect(Math.round(particle.x), Math.round(particle.y), 2, 2);
  }
  ctx.globalAlpha = 1;
  floating = floating.filter(f => f.life > 0);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  for (const f of floating) {
    f.life -= dt; f.y -= dt * 10;
    ctx.fillStyle = '#c3ffdb'; ctx.fillText(f.text, f.x, f.y);
  }
  if (flash > 0 && !reduced) { ctx.fillStyle = `rgba(210,255,220,${flash * .12})`; ctx.fillRect(0, 0, canvas.width, canvas.height); flash = Math.max(0, flash - dt * 5); }
  if (!$('#overlay').hidden) {
    mascotCtx.clearRect(0, 0, 96, 80);
    pixelArm(mascotCtx, 48, 39, 4, 'right', reduced ? 0 : clock * .5, s.phase === 'won');
  }
}

function processEvents() {
  for (const event of game.drainEvents()) {
    if (event.type === 'pellet') {
      if (clock - lastPelletAudio > .055) { tone(game.state.eaten % 2 ? 640 : 850, .045, 'square', .014); lastPelletAudio = clock; }
      if (game.state.eaten % 45 === 0) say(QUIPS[++quipIndex % QUIPS.length]);
    } else if (event.type === 'power') {
      tune([330, 440, 660, 880], .055); flash = .7;
      say('“Power trip. Professionally speaking.”'); burst(event.x, event.y, '#b5f6d1', 14);
    } else if (event.type === 'eat-bug') {
      tone(150, .2, 'square', .04, 0, 900);
      burst(event.x, event.y, '#c5f8d9');
      floating.push({ x: event.x * T + 8, y: event.y * T, text: '+' + event.points, life: 1.1 });
      say(event.name === '404' ? '“404: bug not found. I ate it.”' : '“You are what you eat. I am a software problem.”');
    } else if (event.type === 'damage') {
      tone(500, .5, 'sawtooth', .035, 0, 65);
      burst(event.x, event.y, '#ff91ac', 24);
      say('“I need a moment. And an IT department.”');
      $('.toy').classList.remove('damage'); void $('.toy').offsetWidth; $('.toy').classList.add('damage');
    } else if (event.type === 'respawn') say('“Rebooted. Emotionally unchanged.”');
    else if (event.type === 'extra-life') { tune([440, 660, 880, 1320]); say('“Five thousand calories. One extra life.”'); }
    else if (event.type === 'start') tune([262, 330, 392, 523], .08);
    else if (event.type === 'round-complete') { tune([523, 659, 784, 1047], .13); say('“Patch installed. Personality unchanged.”'); }
    else if (event.type === 'win') { tune([523, 659, 784, 1047, 784, 1047], .12); say('“No bugs. No thoughts. Just uptime.”'); }
    else if (event.type === 'game-over') say('“Have you tried turning me off and on?”');
  }
  saveBest();
}

function updateHUD() {
  const s = game.state;
  const key = [s.score, best, s.lives, s.remaining, s.level, s.phase, Math.ceil(s.power)].join(':');
  if (key !== latestHUD) {
    latestHUD = key;
    $('#score').textContent = String(s.score).padStart(5, '0');
    $('#best').textContent = String(best).padStart(5, '0');
    $('#lives').textContent = '♥'.repeat(Math.max(0, s.lives)) || '—';
    $('#lives').setAttribute('aria-label', s.lives + ' lives');
    $('#remaining').textContent = s.remaining + ' BITS LEFT';
    $('#round-label').textContent = '0' + s.level + ' / ' + s.roundName;
    $('#power-strip').hidden = !s.power || s.phase !== 'playing';
    $('#power-seconds').textContent = Math.ceil(s.power) + 's';
    $('#pause-button').setAttribute('aria-label', s.phase === 'paused' ? 'Resume game' : 'Pause game');
    $('#pause-button span').textContent = s.phase === 'paused' ? '▶' : 'Ⅱ';
    $('#pause-button small').textContent = s.phase === 'paused' ? 'RESUME' : 'PAUSE';
  }
  if (s.power) $('#power-fill').style.width = (s.power / 7.5 * 100) + '%';
  if (previousLevel !== s.level) { previousLevel = s.level; cacheMaze(); }
  if (previousPhase !== s.phase) { previousPhase = s.phase; renderOverlay(); }
}

function renderOverlay() {
  const s = game.state, visible = ['ready', 'paused', 'round-complete', 'won', 'game-over'].includes(s.phase);
  $('#overlay').hidden = !visible;
  if (!visible) return;
  $('#legend').hidden = s.phase !== 'ready';
  const data = {
    ready: ['PATCH 1 OF 3', 'Got bugs?<br>Eat them.', 'Gobble every patch bit. Grab a plug.<br>Make the software bugs regret it.', 'LET’S CHOMP', 'Swipe · arrows · WASD · D-pad'],
    paused: ['EMOTIONAL SUPPORT BREAK', 'Take your time.', 'Your C-arm will wait.<br>The bugs have also been informed.', 'KEEP CHOMPING', 'P or Space to resume'],
    'round-complete': ['PATCH ' + s.level + ' DOWNLOADED', 'That hit<br>the spot.', `${s.remaining === 0 ? 'Every bit collected.' : ''} Next maze. More bugs.<br>Same questionable appetite.`, 'NEXT PATCH', 'Your remaining lives carry over.'],
    won: ['ALL THREE PATCHES COMPLETE', 'Certified<br>bug eater.', `<b>${s.score.toLocaleString()} points.</b> ${s.bugsEaten} bugs personally handled.<br>${s.score > initialBest ? 'A new personal best. IT is speechless.' : 'Your C-arm is fully fed. For now.'}`, 'ONE MORE BITE', 'No bugs. No thoughts. Just uptime.'],
    'game-over': ['CONNECTION TO REALITY LOST', 'Bit off<br>too much?', `<b>${s.score.toLocaleString()} points.</b> A respectable snack.<br>${s.score > initialBest ? 'New personal best. Emotionally, a victory.' : 'One quick reboot. You know the drill.'}`, 'REBOOT & RETRY', 'Your personal best stays saved.'],
  }[s.phase];
  $('#overlay-kicker').textContent = data[0];
  $('#overlay-title').innerHTML = data[1];
  $('#overlay-copy').innerHTML = data[2];
  $('#play-button').innerHTML = data[3] + ' <span aria-hidden="true">→</span>';
  $('#overlay-hint').textContent = data[4];
}

function primary() {
  unlockAudio();
  const phase = game.state.phase;
  if (phase === 'ready') game.start();
  else if (phase === 'paused') game.resume();
  else if (phase === 'round-complete') game.nextRound();
  else if (['won', 'game-over'].includes(phase)) reboot(true);
  updateHUD();
}
function reboot(start = false) {
  saveBest();
  initialBest = best; game = new ChompGame(); previousLevel = 0; previousPhase = ''; particles = []; floating = []; flash = 0;
  say(QUIPS[0]);
  if (start) game.start();
  updateHUD();
}
function togglePause() {
  if (game.state.phase === 'paused') { unlockAudio(); game.resume(); }
  else if (['playing', 'dying'].includes(game.state.phase)) game.pause();
  updateHUD();
}
function move(direction) {
  inputCount++;
  if (game.state.phase === 'ready') { unlockAudio(); game.start(); }
  game.queueDirection(direction);
  updateHUD();
}

$('#play-button').addEventListener('click', primary);
$('#restart-button').addEventListener('click', () => reboot(false));
$('#pause-button').addEventListener('click', togglePause);
$('#sound-button').addEventListener('click', () => {
  sound = !sound;
  try { localStorage.setItem('c-chomp-sound', String(sound)); } catch {}
  refreshSound(); unlockAudio(); if (sound) tune([523, 784], .07);
});
for (const button of document.querySelectorAll('[data-dir]')) {
  button.addEventListener('pointerdown', e => {
    e.preventDefault(); button.setPointerCapture(e.pointerId);
    button.classList.add('pressed'); move(button.dataset.dir);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => button.classList.remove('pressed'));
  // Keyboard and assistive-technology activation has no preceding pointerdown.
  button.addEventListener('click', e => { if (e.detail === 0) move(button.dataset.dir); });
}
let swipe = null;
$('#maze-wrap').addEventListener('pointerdown', e => {
  if (e.target.closest('button') || !$('#overlay').hidden) return;
  swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
  $('#maze-wrap').setPointerCapture(e.pointerId);
});
$('#maze-wrap').addEventListener('pointermove', e => {
  if (!swipe || swipe.id !== e.pointerId) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
  move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up');
  swipe.x = e.clientX; swipe.y = e.clientY;
});
for (const type of ['pointerup', 'pointercancel']) $('#maze-wrap').addEventListener(type, () => { swipe = null; });
addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  // Native controls keep their keyboard activation. Once an overlay disappears
  // its focused button may linger as event.target, so only defer to visible UI.
  const interactive = e.target instanceof Element
    ? e.target.closest('a, button, input, select, textarea, [contenteditable="true"]')
    : null;
  if (interactive?.getClientRects().length &&
      (e.key === 'Enter' || e.key === ' ' ||
       interactive.matches('input, select, textarea, [contenteditable="true"]'))) return;
  if (KEYS[e.key]) { e.preventDefault(); move(KEYS[e.key]); }
  else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { e.preventDefault(); togglePause(); }
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    ['ready', 'paused', 'round-complete', 'won', 'game-over'].includes(game.state.phase) ? primary() : togglePause();
  } else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reboot(false); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { game.pause(); updateHUD(); }
  lastTime = performance.now();
});
addEventListener('pagehide', () => { saveBest(); game.pause(); });

Object.defineProperty(window, 'CChomp', {
  value: Object.freeze({
    inspect: () => ({
      ...game.inspect(), highScore: best, sound, inputCount, reducedMotion: reduced,
      overlayVisible: !$('#overlay').hidden, fps: +measuredFPS.toFixed(1), version: '1.0.0',
      assetReady: document.fonts.status === 'loaded',
    }),
  }),
  writable: false,
  configurable: false,
});

function frame(now) {
  const dt = Math.min(.06, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  if (!document.hidden) {
    clock += dt;
    game.update(dt); processEvents(); updateHUD(); renderMaze(dt);
    fpsFrames++; fpsTime += dt;
    if (fpsTime >= 2) { measuredFPS = fpsFrames / fpsTime; fpsFrames = 0; fpsTime = 0; }
  }
  requestAnimationFrame(frame);
}
refreshSound(); updateHUD(); renderMaze(0); requestAnimationFrame(frame);
