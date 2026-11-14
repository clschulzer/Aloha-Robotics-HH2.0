// C-CHOMP: a deterministic, browser-independent tile engine.
// Original mazes are braided from a seeded spanning tree; no maze assets or
// copyrighted level layouts are used.
export const WIDTH = 19;
export const HEIGHT = 21;
export const ROUNDS = 3;
export const HIGH_SCORE_KEY = 'carmagotchi-c-chomp-highscore-v1';
export const DIRS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  right: Object.freeze({ x: 1, y: 0 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
});
const ORDER = Object.keys(DIRS);
const OPPOSITE = { up: 'down', right: 'left', down: 'up', left: 'right' };
export const BUG_NAMES = ['404', 'POP-UP', 'SPAM', 'CAPSLOCK'];
export const ROUND_NAMES = ['PATCH TUESDAY', 'FIRMWARE FEVER', 'CEO OF UPTIME'];
const SEEDS = [781, 2281, 8602];
const index = (x, y) => y * WIDTH + x;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function makeMaze(round = 1) {
  const rng = random(SEEDS[(round - 1) % SEEDS.length]);
  const maze = Array(WIDTH * HEIGHT).fill(1);
  const interior = (x, y) => x > 0 && x < WIDTH - 1 && y > 0 && y < HEIGHT - 1;
  const stack = [[1, 1]];
  maze[index(1, 1)] = 0;
  while (stack.length) {
    const [x, y] = stack.at(-1);
    const options = ORDER.filter(name => {
      const d = DIRS[name], nx = x + d.x * 2, ny = y + d.y * 2;
      return interior(nx, ny) && maze[index(nx, ny)];
    });
    if (!options.length) { stack.pop(); continue; }
    const d = DIRS[options[Math.floor(rng() * options.length)]];
    maze[index(x + d.x, y + d.y)] = 0;
    maze[index(x + 2 * d.x, y + 2 * d.y)] = 0;
    stack.push([x + 2 * d.x, y + 2 * d.y]);
  }
  // Remove dead ends. A maze full of loops rewards anticipation, not trapping
  // a first-time player against a wall.
  for (let y = 1; y < HEIGHT - 1; y += 2) {
    for (let x = 1; x < WIDTH - 1; x += 2) {
      const open = ORDER.filter(n => {
        const d = DIRS[n]; return !maze[index(x + d.x, y + d.y)];
      });
      if (open.length !== 1) continue;
      const options = ORDER.filter(n => {
        const d = DIRS[n], nx = x + 2 * d.x, ny = y + 2 * d.y;
        return interior(nx, ny) && maze[index(x + d.x, y + d.y)];
      });
      if (options.length) {
        const d = DIRS[options[Math.floor(rng() * options.length)]];
        maze[index(x + d.x, y + d.y)] = 0;
      }
    }
  }
  // A recognizable outer circuit connects all four plug powerups.
  for (let x = 1; x < WIDTH - 1; x++) {
    maze[index(x, 1)] = maze[index(x, HEIGHT - 2)] = 0;
  }
  for (let y = 1; y < HEIGHT - 1; y++) {
    maze[index(1, y)] = maze[index(WIDTH - 2, y)] = 0;
  }
  return maze;
}

export function isFloor(maze, x, y) {
  return x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT && maze[index(x, y)] === 0;
}

export function entityPosition(entity) {
  const d = DIRS[entity.dir] || { x: 0, y: 0 };
  return { x: entity.x + d.x * entity.progress, y: entity.y + d.y * entity.progress };
}

export function distances(maze, tx, ty) {
  if (!isFloor(maze, tx, ty)) {
    let best = Infinity, nearest = [1, 1];
    for (let y = 1; y < HEIGHT - 1; y++) for (let x = 1; x < WIDTH - 1; x++) {
      const distance = Math.abs(tx - x) + Math.abs(ty - y);
      if (isFloor(maze, x, y) && distance < best) { best = distance; nearest = [x, y]; }
    }
    [tx, ty] = nearest;
  }
  const result = Array(WIDTH * HEIGHT).fill(Infinity), queue = [[tx, ty]];
  result[index(tx, ty)] = 0;
  for (let p = 0; p < queue.length; p++) {
    const [x, y] = queue[p];
    for (const d of Object.values(DIRS)) {
      const nx = x + d.x, ny = y + d.y, ni = index(nx, ny);
      if (isFloor(maze, nx, ny) && result[ni] === Infinity) {
        result[ni] = result[index(x, y)] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return result;
}

const makeEntity = (x, y, dir = null) => ({ x, y, dir, progress: 0, distance: 0 });

export class ChompGame {
  constructor() {
    this.events = [];
    this.rng = random(44201);
    this.state = {
      phase: 'ready', level: 1, score: 0, lives: 3, totalTime: 0,
      levelTime: 0, power: 0, combo: 0, invulnerable: 0, deathTime: 0,
      extraLifeAt: 5000, eaten: 0, bugsEaten: 0, deaths: 0,
      queued: 'left', resumePhase: 'playing', maze: [], pellets: [], bugs: [],
    };
    this.setupRound(1);
    this.state.phase = 'ready';
  }

  emit(type, data = {}) { this.events.push({ type, ...data }); }
  drainEvents() { const events = this.events; this.events = []; return events; }

  setupRound(level) {
    const s = this.state;
    s.level = level;
    s.maze = makeMaze(level);
    s.pellets = s.maze.map(wall => wall ? 0 : 1);
    for (const [x, y] of [[1, 1], [17, 1], [1, 19], [17, 19]]) s.pellets[index(x, y)] = 2;
    s.pellets[index(9, 19)] = 0;
    for (const [x, y] of [[9, 9], [7, 9], [11, 9], [9, 7]]) s.pellets[index(x, y)] = 0;
    s.remaining = s.pellets.filter(Boolean).length;
    s.initialPellets = s.remaining;
    s.levelTime = 0;
    s.power = 0;
    s.combo = 0;
    s.roundName = ROUND_NAMES[level - 1];
    this.resetActors();
  }

  resetActors() {
    const s = this.state;
    s.player = makeEntity(9, 19, 'left');
    s.queued = 'left';
    s.invulnerable = 2.1;
    s.power = 0;
    s.combo = 0;
    s.bugs = [[9, 9], [7, 9], [11, 9], [9, 7]]
      .slice(0, s.level + 1)
      .map(([x, y], id) => ({
        ...makeEntity(x, y), id, name: BUG_NAMES[id],
        home: { x, y }, mode: 'normal', delay: 1.1 + id * 0.45,
        corner: [{ x: 17, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 19 }, { x: 17, y: 19 }][id],
      }));
  }

  start() {
    if (this.state.phase !== 'ready') return false;
    this.state.phase = 'playing';
    this.emit('start');
    return true;
  }

  nextRound() {
    if (this.state.phase !== 'round-complete') return false;
    this.setupRound(this.state.level + 1);
    this.state.phase = 'playing';
    this.emit('start');
    return true;
  }

  pause() {
    if (!['playing', 'dying'].includes(this.state.phase)) return false;
    this.state.resumePhase = this.state.phase;
    this.state.phase = 'paused';
    return true;
  }

  resume() {
    if (this.state.phase !== 'paused') return false;
    this.state.phase = this.state.resumePhase;
    return true;
  }

  queueDirection(name) {
    if (!DIRS[name]) return false;
    const s = this.state, p = s.player;
    s.queued = name;
    // Reversing is immediate, even halfway down a corridor.
    if (s.phase === 'playing' && p.progress > 0 && OPPOSITE[p.dir] === name) {
      const old = DIRS[p.dir];
      p.x += old.x; p.y += old.y;
      p.progress = 1 - p.progress;
      p.dir = name;
    }
    return true;
  }

  addScore(value) {
    const s = this.state;
    s.score += value;
    while (s.score >= s.extraLifeAt) {
      s.extraLifeAt += 5000;
      if (s.lives < 5) { s.lives++; this.emit('extra-life'); }
    }
  }

  collect() {
    const s = this.state, p = s.player, i = index(p.x, p.y), pellet = s.pellets[i];
    if (!pellet) return;
    s.pellets[i] = 0;
    s.remaining--;
    s.eaten++;
    this.addScore(pellet === 2 ? 50 : 10);
    if (pellet === 2) {
      s.power = 7.5;
      s.combo = 0;
      this.emit('power', { x: p.x, y: p.y });
    } else this.emit('pellet', { x: p.x, y: p.y });
    if (!s.remaining) {
      this.addScore(500 + s.level * 250);
      s.phase = s.level === ROUNDS ? 'won' : 'round-complete';
      this.emit(s.phase === 'won' ? 'win' : 'round-complete');
    }
  }

  legalDirections(entity) {
    return ORDER.filter(name => {
      const d = DIRS[name]; return isFloor(this.state.maze, entity.x + d.x, entity.y + d.y);
    });
  }

  playerDirection() {
    const s = this.state, legal = this.legalDirections(s.player);
    if (legal.includes(s.queued)) return s.queued;
    return legal.includes(s.player.dir) ? s.player.dir : null;
  }

  bugDirection(bug) {
    const s = this.state;
    let legal = this.legalDirections(bug);
    if (legal.length > 1 && bug.mode !== 'eaten') legal = legal.filter(d => d !== OPPOSITE[bug.dir]);
    if (!legal.length) return null;
    const p = entityPosition(s.player);
    let target;
    if (bug.mode === 'eaten') target = bug.home;
    else if (s.power > 0) target = p;
    else if (s.levelTime % 23 < 6) target = bug.corner;
    else {
      const forward = DIRS[s.player.dir] || { x: 0, y: 0 };
      if (bug.id === 1) target = { x: Math.round(p.x + forward.x * 3), y: Math.round(p.y + forward.y * 3) };
      else if (bug.id === 2 && Math.hypot(p.x - bug.x, p.y - bug.y) < 5) target = bug.corner;
      else target = p;
    }
    const field = distances(s.maze, Math.round(target.x), Math.round(target.y));
    const ranked = legal.map(dir => {
      const d = DIRS[dir];
      return { dir, value: field[index(bug.x + d.x, bug.y + d.y)] + this.rng() * 0.35 };
    }).sort((a, b) => a.value - b.value);
    return s.power > 0 && bug.mode !== 'eaten' ? ranked.at(-1).dir : ranked[0].dir;
  }

  move(entity, dt, speed, choose, arrive = () => {}) {
    let time = dt, guard = 0;
    while (time > 0.000001 && guard++ < 10) {
      if (entity.progress === 0) entity.dir = choose();
      if (!entity.dir) return;
      const d = DIRS[entity.dir];
      if (!isFloor(this.state.maze, entity.x + d.x, entity.y + d.y)) {
        entity.dir = null; entity.progress = 0; return;
      }
      const distance = Math.min(1 - entity.progress, speed * time);
      entity.progress += distance;
      entity.distance += distance;
      time -= distance / speed;
      if (entity.progress >= 1 - 1e-8) {
        entity.x += d.x; entity.y += d.y; entity.progress = 0;
        arrive();
        if (this.state.phase !== 'playing') return;
      }
    }
  }

  collide() {
    const s = this.state, p = entityPosition(s.player);
    if (s.phase !== 'playing') return;
    for (const bug of s.bugs) {
      if (bug.mode === 'eaten' || bug.delay > 0) continue;
      const b = entityPosition(bug);
      if (Math.hypot(p.x - b.x, p.y - b.y) > 0.63) continue;
      if (s.power > 0) {
        bug.mode = 'eaten';
        s.combo++;
        s.bugsEaten++;
        const points = 200 * 2 ** Math.min(3, s.combo - 1);
        this.addScore(points);
        this.emit('eat-bug', { x: b.x, y: b.y, points, name: bug.name });
      } else if (!s.invulnerable) {
        s.lives--;
        s.deaths++;
        s.phase = 'dying';
        s.deathTime = 0.95;
        this.emit('damage', { x: p.x, y: p.y });
        return;
      }
    }
  }

  update(seconds) {
    const s = this.state;
    let remaining = clamp(seconds, 0, 0.1);
    if (!['playing', 'dying'].includes(s.phase)) return;
    while (remaining > 0.000001) {
      const dt = Math.min(remaining, 0.02); remaining -= dt;
      s.totalTime += dt;
      if (s.phase === 'dying') {
        s.deathTime -= dt;
        if (s.deathTime <= 0) {
          if (s.lives <= 0) { s.phase = 'game-over'; this.emit('game-over'); return; }
          this.resetActors();
          s.phase = 'playing';
          this.emit('respawn');
        }
        continue;
      }
      if (s.phase !== 'playing') return;
      s.levelTime += dt;
      s.power = Math.max(0, s.power - dt);
      s.invulnerable = Math.max(0, s.invulnerable - dt);
      this.move(s.player, dt, 5.1 + (s.level - 1) * 0.2, () => this.playerDirection(), () => this.collect());
      if (s.phase !== 'playing') return;
      for (const bug of s.bugs) {
        if (bug.delay > 0) { bug.delay -= dt; continue; }
        const speed = bug.mode === 'eaten' ? 8.4 : s.power > 0 ? 2.6 : 3.35 + (s.level - 1) * 0.32 + bug.id * 0.04;
        this.move(bug, dt, speed, () => this.bugDirection(bug), () => {
          if (bug.mode === 'eaten' && bug.x === bug.home.x && bug.y === bug.home.y) {
            bug.mode = 'normal'; bug.delay = 1.1; bug.dir = null;
          }
        });
      }
      this.collide();
    }
  }

  inspect() {
    const s = this.state;
    return {
      phase: s.phase, level: s.level, roundName: s.roundName, score: s.score,
      lives: s.lives, remaining: s.remaining, initialPellets: s.initialPellets,
      elapsed: +s.totalTime.toFixed(3), powerSeconds: +s.power.toFixed(2),
      invulnerableSeconds: +s.invulnerable.toFixed(2), queuedDirection: s.queued,
      player: { ...entityPosition(s.player), direction: s.player.dir, distance: s.player.distance },
      bugs: s.bugs.map(b => ({ ...entityPosition(b), id: b.id, name: b.name, mode: b.mode, delay: Math.max(0, b.delay) })),
      pelletsEaten: s.eaten, bugsEaten: s.bugsEaten, deaths: s.deaths,
      width: WIDTH, height: HEIGHT, highScoreKey: HIGH_SCORE_KEY,
    };
  }
}
