import assert from 'node:assert/strict';
import { ChompGame, WIDTH, HEIGHT, DIRS, makeMaze, distances, entityPosition, isFloor, random } from './engine.mjs';

const checks = [];
function test(name, action) { action(); checks.push(name); console.log('PASS', name); }
function advance(game, seconds) { for (let t = 0; t < seconds - 1e-8; t += .02) game.update(.02); }
const actor = (x, y, dir = null) => ({ x, y, dir, progress: 0, distance: 0 });
const onPlayer = game => ({
  ...actor(game.state.player.x, game.state.player.y), id: 0, name: '404',
  mode: 'normal', delay: 0, home: { x: 9, y: 9 }, corner: { x: 17, y: 1 },
});

test('All three original mazes are distinct, connected, bounded and fully collectible', () => {
  const signatures = new Set();
  for (let round = 1; round <= 3; round++) {
    const game = new ChompGame(); game.setupRound(round);
    const s = game.state, reach = distances(s.maze, 9, 19);
    signatures.add(s.maze.join(''));
    assert.ok(s.initialPellets > 150);
    assert.equal(s.pellets.filter(n => n === 2).length, 4);
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) assert.equal(s.maze[y * WIDTH + x], 1);
      if (s.maze[y * WIDTH + x] === 0) assert.notEqual(reach[y * WIDTH + x], Infinity);
      if (s.pellets[y * WIDTH + x]) assert.equal(s.maze[y * WIDTH + x], 0);
    }
  }
  assert.equal(signatures.size, 3);
});

test('Player cannot enter a wall', () => {
  const game = new ChompGame(); game.start();
  game.state.player = actor(9, 19, 'down'); game.state.queued = 'down'; game.state.bugs = [];
  advance(game, .5);
  assert.deepEqual(entityPosition(game.state.player), { x: 9, y: 19 });
});

test('Reversing halfway through a tile preserves position and responds immediately', () => {
  const game = new ChompGame(); game.start(); game.state.bugs = [];
  advance(game, .06);
  const before = entityPosition(game.state.player);
  game.queueDirection('right');
  assert.equal(game.state.player.dir, 'right');
  assert.ok(Math.abs(entityPosition(game.state.player).x - before.x) < 1e-9);
  advance(game, .04);
  assert.ok(entityPosition(game.state.player).x > before.x);
});

test('Early input queues a turn at the next legal intersection', () => {
  const game = new ChompGame(); game.start(); game.state.bugs = [];
  let turn;
  for (let y = 2; y < HEIGHT - 1; y++) for (let x = 2; x < WIDTH - 2; x++) {
    if (isFloor(game.state.maze, x - 1, y) && isFloor(game.state.maze, x, y) && isFloor(game.state.maze, x, y - 1)) turn ||= { x, y };
  }
  assert.ok(turn);
  game.state.player = { ...actor(turn.x - 1, turn.y, 'right'), progress: .4 };
  game.queueDirection('up');
  advance(game, .14);
  assert.equal(game.state.player.dir, 'up');
  assert.equal(game.state.player.x, turn.x);
  assert.ok(entityPosition(game.state.player).y < turn.y);
});

test('Walking onto a plug scores once and starts the power timer', () => {
  const game = new ChompGame(); game.start(); game.state.bugs = [];
  const before = game.state.remaining;
  game.state.player = actor(2, 19, 'left'); game.state.queued = 'left';
  advance(game, .2);
  assert.equal(game.state.score, 50);
  assert.equal(game.state.remaining, before - 1);
  assert.ok(game.state.power > 7);
  game.collect();
  assert.equal(game.state.score, 50);
});

test('Powered collisions eat bugs once and increase the combo', () => {
  const game = new ChompGame(); game.start();
  game.state.power = 7; game.state.bugs = [onPlayer(game)];
  game.collide();
  assert.equal(game.state.score, 200); assert.equal(game.state.bugs[0].mode, 'eaten');
  game.collide(); assert.equal(game.state.score, 200);
  game.state.bugs.push({ ...onPlayer(game), id: 1, name: 'POP-UP' });
  game.collide();
  assert.equal(game.state.score, 600); assert.equal(game.state.bugsEaten, 2);
  assert.equal(game.state.lives, 3);
});

test('Damage is applied once; respawn keeps pellets and grants temporary protection', () => {
  const game = new ChompGame(); game.start(); game.state.invulnerable = 0;
  const remaining = game.state.remaining;
  game.state.bugs = [onPlayer(game)]; game.collide(); game.collide();
  assert.equal(game.state.lives, 2); assert.equal(game.state.phase, 'dying');
  advance(game, 1);
  assert.equal(game.state.phase, 'playing'); assert.ok(game.state.invulnerable > 1);
  assert.equal(game.state.remaining, remaining);
  game.state.bugs = [onPlayer(game)]; game.collide();
  assert.equal(game.state.lives, 2);
  game.state.bugs = []; advance(game, 2.3);
  assert.equal(game.state.invulnerable, 0);
});

test('Pause freezes movement, timers, power and score, then resumes', () => {
  const game = new ChompGame(); game.start(); game.state.power = 5;
  advance(game, .2); game.pause();
  const before = game.inspect(); advance(game, 4);
  assert.deepEqual(game.inspect(), before);
  game.resume(); advance(game, .2);
  assert.ok(game.state.totalTime > before.elapsed); assert.ok(game.state.power < before.powerSeconds);
});

test('Completing every round advances to three distinct mazes and a real win state', () => {
  const game = new ChompGame(); game.start();
  for (let round = 1; round <= 3; round++) {
    game.state.bugs = [];
    game.state.pellets.fill(0); game.state.pellets[19 * WIDTH + 8] = 1; game.state.remaining = 1;
    advance(game, .2);
    assert.equal(game.state.remaining, 0);
    assert.equal(game.state.phase, round === 3 ? 'won' : 'round-complete');
    if (round < 3) {
      const score = game.state.score;
      assert.equal(game.nextRound(), true); assert.equal(game.state.level, round + 1);
      assert.equal(game.state.score, score); assert.ok(game.state.remaining > 150);
    }
  }
  assert.equal(game.nextRound(), false);
  assert.equal(game.state.lives, 3);
});

test('Final collision becomes game over; fresh game resets score and lives', () => {
  const game = new ChompGame(); game.start(); game.state.lives = 1; game.state.invulnerable = 0;
  game.state.bugs = [onPlayer(game)]; game.collide(); advance(game, 1.2);
  assert.equal(game.state.phase, 'game-over'); assert.equal(game.state.lives, 0);
  const before = game.inspect(); advance(game, 3); assert.deepEqual(game.inspect(), before);
  const fresh = new ChompGame(); assert.equal(fresh.state.score, 0); assert.equal(fresh.state.lives, 3); assert.equal(fresh.state.phase, 'ready');
});

test('An extra life is awarded only once per score threshold', () => {
  const game = new ChompGame();
  game.addScore(5000); assert.equal(game.state.lives, 4);
  game.addScore(10); assert.equal(game.state.lives, 4);
  game.addScore(4990); assert.equal(game.state.lives, 5);
  game.addScore(5000); assert.equal(game.state.lives, 5);
});

test('All player and bug movement remains on legal floors across chase and frightened modes', () => {
  const rng = random(999);
  for (let round = 1; round <= 3; round++) {
    const game = new ChompGame(); game.setupRound(round); game.state.phase = 'playing'; game.state.invulnerable = 10000;
    for (let frame = 0; frame < 2400; frame++) {
      if (frame % 11 === 0) game.queueDirection(Object.keys(DIRS)[Math.floor(rng() * 4)]);
      if (frame === 1100) game.state.power = 7;
      game.update(.02);
      for (const a of [game.state.player, ...game.state.bugs]) {
        assert.ok(isFloor(game.state.maze, a.x, a.y), `${round}: actor origin outside floor`);
        if (a.progress > 0) {
          const d = DIRS[a.dir];
          assert.ok(d && isFloor(game.state.maze, a.x + d.x, a.y + d.y), `${round}: actor moving into wall`);
        }
      }
    }
  }
});

console.log(JSON.stringify({ result: 'passed', checks: checks.length, names: checks }, null, 2));
