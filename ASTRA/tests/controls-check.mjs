// Real Firefox control/motion checks. Node 24 native WebSocket; no dependencies.
// Start the server and a free Firefox BiDi endpoint before running this file.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));
const output = process.env.ASTRA_CONTROLS_OUTPUT || path.resolve(base, '../research');
const url = process.env.ASTRA_TEST_URL || 'http://127.0.0.1:8765/';
const socket = new WebSocket(process.env.ASTRA_BIDI_URL || 'ws://127.0.0.1:9229/session');
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map(), logs = [], contexts = [];
socket.onmessage = ({ data }) => {
  const result = JSON.parse(data);
  if (result.id) {
    const job = pending.get(result.id);
    if (job) {
      clearTimeout(job.timeout); pending.delete(result.id);
      result.type === 'error' ? job.reject(new Error(JSON.stringify(result))) : job.resolve(result.result);
    }
  } else logs.push(result);
};
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id, timeout = setTimeout(() => { pending.delete(n); reject(new Error(`Timeout: ${method}`)); }, 30000);
  pending.set(n, { resolve, reject, timeout });
  socket.send(JSON.stringify({ id: n, method, params }));
});
let session, main, presenter;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = async (expression, context = main) => {
  const result = await command('script.evaluate', {
    expression: `(async()=>JSON.stringify(await (${expression}))??'null')()`,
    target: { context }, awaitPromise: true,
  });
  if (result.type === 'exception') throw new Error(JSON.stringify(result.exceptionDetails));
  return JSON.parse(result.result.value);
};
const state = () => evaluate('window.CarmDeck.getState()');
const screenshot = async (name, context = main) => {
  const { data } = await command('browsingContext.captureScreenshot', { context, origin: 'viewport', format: { type: 'image/png' } });
  await fs.writeFile(path.join(output, 'controls-previews', `${name}.png`), Buffer.from(data, 'base64'));
};
const click = async (selector, context = main) => {
  await command('browsingContext.activate', { context });
  const p = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`, context);
  await command('input.performActions', { context, actions: [{ type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [
    { type: 'pointerMove', x: Math.round(p.x), y: Math.round(p.y), duration: 0 },
    { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 },
  ] }] });
};
const key = async (value, context = main) => {
  await command('browsingContext.activate', { context });
  return command('input.performActions', {
    context, actions: [{ type: 'key', id: 'keyboard', actions: [{ type: 'keyDown', value }, { type: 'keyUp', value }] }],
  });
};
const KEY = { right: '\uE014', left: '\uE012', escape: '\uE00C', home: '\uE011' };
const waitFor = async (predicate, label, timeout = 3500) => {
  const start = performance.now();
  do { if (await predicate()) return; await delay(50); } while (performance.now() - start < timeout);
  throw new Error(`Did not reach: ${label}`);
};
const restart = async () => { await evaluate('window.CarmDeck.restart()'); await delay(80); };
const report = {
  url, kind: 'Firefox manual controls, motion and presenter integration',
  results: [], limitations: [
    'This complements the separate complete 180-second real-time rehearsal.',
    'The race tests inject delayed play promises to reproduce media scheduling deterministically.',
    'Headless fullscreen and viewport checks do not establish physical projector or phone usability.',
  ],
};
const check = async (name, body) => {
  try { const detail = await body(); report.results.push({ name, result: 'passed', ...(detail ? { detail } : {}) }); console.log(`PASS ${name}`); }
  catch (error) { report.results.push({ name, result: 'failed', error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
};
const assertHeld = async (label, film = false) => {
  const before = await state();
  await delay(270);
  const after = await state();
  assert.ok(Math.abs(after.elapsed - before.elapsed) < .045, `${label}: clock advanced ${after.elapsed - before.elapsed}s`);
  if (film) {
    assert.equal(after.film.paused, true, `${label}: film paused`);
    assert.ok(Math.abs(after.film.currentTime - before.film.currentTime) < .08, `${label}: film time held`);
  }
};
const overlay = async (kind, open) => {
  if (kind === 'research') { if (open) await key('a'); else await key(KEY.escape); }
  if (kind === 'help') await key('h');
  if (kind === 'blackout') await key('b');
  await delay(80);
};

try {
  session = await command('session.new', { capabilities: { alwaysMatch: { browserName: 'firefox' } } });
  report.browser = `${session.capabilities.browserName} ${session.capabilities.browserVersion}`;
  await command('session.subscribe', { events: ['log.entryAdded'] });
  ({ context: main } = await command('browsingContext.create', { type: 'tab' }));
  contexts.push(main);
  await command('network.setCacheBehavior', { cacheBehavior: 'bypass', contexts: [main] });
  await command('browsingContext.setViewport', { context: main, viewport: { width: 1440, height: 810 }, devicePixelRatio: 1 });
  await command('browsingContext.navigate', { context: main, url, wait: 'complete' });
  await fs.mkdir(path.join(output, 'controls-previews'), { recursive: true });
  await evaluate('document.fonts.ready.then(()=>true)');

  await check('T from launcher starts the original timed film with audio', async () => {
    await restart(); await key('t');
    await waitFor(async () => !(await state()).film.paused, 'film playing');
    const s = await state();
    assert.equal(s.started, true); assert.equal(s.auto, true); assert.equal(s.film.muted, false);
    assert.equal(await evaluate("document.getElementById('launch-screen').hidden"), true);
    assert.ok(Math.abs(s.film.duration - 30.442667) < .05);
    return { duration: s.film.duration, audioEnabled: !s.film.muted };
  });
  await check('Manual arrows and remote forward/back cannot interrupt the running film', async () => {
    await key(KEY.right); await key(KEY.left);
    for (const target of [3, 0]) {
      await evaluate(`(()=>{const c=new BroadcastChannel('aloha-astra-v2');c.postMessage({type:'remote-navigation',index:${target},step:0});c.close();})()`);
      await delay(100);
      const s = await state();
      assert.equal(s.index, 0); assert.equal(s.introDone, false); assert.equal(s.started, true);
      assert.equal(s.film.paused, false);
    }
  });
  await check('P pauses the film and Escape alone does not resume it', async () => {
    if (!(await state()).started) await click('#launch');
    await waitFor(async () => !(await state()).film.paused, 'playing before pause');
    await key('p'); await key(KEY.escape); await assertHeld('P then Escape', true);
    await key('p'); await waitFor(async () => !(await state()).film.paused, 'P resumes film');
  });
  for (const kind of ['help', 'research', 'blackout']) {
    await check(`${kind} pauses/resumes playing film and preserves a prior pause`, async () => {
      await overlay(kind, true); await assertHeld(`${kind} open`, true);
      await overlay(kind, false);
      await waitFor(async () => !(await state()).film.paused, `${kind} restores playing film`);
      const before = (await state()).elapsed; await delay(220);
      assert.ok((await state()).elapsed > before + .12, `${kind} restores running clock`);
      await key('p'); await overlay(kind, true); await overlay(kind, false);
      await assertHeld(`${kind} preserves user pause`, true);
      await key('p'); await waitFor(async () => !(await state()).film.paused, 'continue film');
    });
  }
  await check('Home restarts to a paused zero-clock launcher', async () => {
    await key(KEY.home);
    const s = await state();
    assert.equal(s.index, 0); assert.equal(s.started, false); assert.equal(s.introDone, false);
    assert.equal(s.film.paused, true); assert.equal(s.elapsed, 0);
    assert.equal(await evaluate("document.getElementById('launch-screen').hidden"), false);
    await assertHeld('Home');
  });
  await check('Late start play promise cannot undo restart', async () => {
    await restart();
    await evaluate(`(()=>{const f=document.getElementById('chaos-video');window.__originalPlay=f.play;f.play=()=>new Promise(resolve=>window.__resolvePlay=resolve);window.CarmDeck.start(false);window.CarmDeck.restart();f.play=window.__originalPlay;window.__resolvePlay();})()`);
    await delay(100); assert.equal((await state()).started, false); await assertHeld('pending start restarted');
  });
  await check('Late pause/resume play promise cannot undo restart', async () => {
    await restart(); await click('#launch');
    await waitFor(async () => !(await state()).film.paused, 'race setup film'); await key('p');
    await evaluate(`(()=>{const f=document.getElementById('chaos-video');window.__originalPlay=f.play;f.play=()=>new Promise(resolve=>window.__resolvePlay=resolve);})()`);
    await key('p');
    await evaluate(`(()=>{window.CarmDeck.restart();document.getElementById('chaos-video').play=window.__originalPlay;window.__resolvePlay();})()`);
    await delay(100); assert.equal((await state()).started, false); await assertHeld('pending resume restarted');
  });
  await check('Late overlay media restoration cannot undo restart', async () => {
    await restart(); await click('#launch');
    await waitFor(async () => !(await state()).film.paused, 'overlay race setup'); await delay(200); await overlay('blackout', true);
    await evaluate(`(()=>{const f=document.getElementById('chaos-video');window.__originalPlay=f.play;f.play=()=>new Promise(resolve=>window.__resolvePlay=resolve);})()`);
    await overlay('blackout', false);
    await evaluate(`(()=>{window.CarmDeck.restart();document.getElementById('chaos-video').play=window.__originalPlay;window.__resolvePlay();})()`);
    await delay(100); assert.equal((await state()).started, false); await assertHeld('pending overlay restoration restarted');
  });
  await check('Arrows traverse all six original moods and return one beat', async () => {
    await restart(); await evaluate('window.CarmDeck.jump(1,0)');
    const moods = ['lonely', 'manic', 'update', 'bliss', 'failure', 'rollback'];
    for (let i = 0; i < moods.length; i++) {
      if (i) await key(KEY.right);
      const s = await state();
      assert.equal(s.index, 1); assert.equal(s.step, i); assert.equal(s.auto, false);
      assert.equal(await evaluate("document.querySelector('.scene-moods').dataset.mood"), moods[i]);
      assert.equal(await evaluate("document.querySelectorAll('.scene-moods .update-char.on').length"), 1);
    }
    await key(KEY.left); assert.equal((await state()).step, 4);
    await screenshot('01-manual-moods');
  });
  await check('Paused non-film clock survives Escape and all overlays', async () => {
    await evaluate('window.CarmDeck.jump(3,1)'); await key('t'); await key('p');
    await key(KEY.escape); await assertHeld('non-film Escape');
    for (const kind of ['help', 'research', 'blackout']) {
      await overlay(kind, true); await overlay(kind, false); await assertHeld(`non-film ${kind}`);
    }
  });
  if (!process.env.ASTRA_SKIP_MOTION) await check('Swarm scout transforms move; an overlay freezes and resumes them', async () => {
    await evaluate('window.CarmDeck.jump(3,1)'); await delay(100);
    const expression = "document.querySelector('.av-scout-bot').getAttribute('transform')";
    const before = await evaluate(expression); await screenshot('02-swarm-a'); await delay(300);
    const after = await evaluate(expression); await screenshot('03-swarm-b');
    assert.notEqual(before, after);
    await overlay('help', true);
    const held = await evaluate(expression); await delay(250); assert.equal(await evaluate(expression), held);
    await overlay('help', false); await delay(200); assert.notEqual(await evaluate(expression), held);
    return { before, after };
  });
  if (!process.env.ASTRA_SKIP_MOTION) await check('The actual gold window travels to the architecture core and leaves a pulse', async () => {
    await evaluate('window.CarmDeck.jump(3,4)'); await delay(900); await key(KEY.right);
    await delay(650);
    assert.equal((await state()).index, 4); assert.equal((await state()).step, 0);
    const seed = "document.querySelector('.scene-continuity rect')";
    assert.equal(await evaluate(`Boolean(${seed})`), true);
    const first = await evaluate(`getComputedStyle(${seed}).transform`);
    assert.doesNotMatch(first, /NaN|Infinity/);
    await screenshot('04-gold-handoff');
    await delay(350);
    assert.notEqual(await evaluate(`getComputedStyle(${seed}).transform`), first);
    await delay(650);
    assert.equal(await evaluate("Boolean(document.querySelector('.scene-continuity circle'))"), true);
    await screenshot('05-core-pulse');
    await delay(1000);
    assert.equal(await evaluate("document.querySelector('.scene-continuity').childElementCount"), 0);
  });
  if (!process.env.ASTRA_SKIP_MOTION) await check('Architecture branch strokes grow and live signals move', async () => {
    await evaluate('window.CarmDeck.jump(4,0)'); await delay(150); await key(KEY.right);
    const branch = "getComputedStyle(document.querySelector('.av-branch[data-reveal=\"1\"]')).strokeDashoffset";
    const fiber = "getComputedStyle(document.querySelector('.av-fiber[data-reveal=\"1\"]')).strokeDashoffset";
    const before = parseFloat(await evaluate(branch)), fiberBefore = parseFloat(await evaluate(fiber)); await screenshot('06-branches-a');
    await delay(600); const after = parseFloat(await evaluate(branch)), fiberAfter = parseFloat(await evaluate(fiber)); await screenshot('07-branches-b');
    assert.ok(after < before, `branch should draw: ${before} → ${after}`);
    assert.ok(fiberAfter < fiberBefore, `fiber should grow: ${fiberBefore} → ${fiberAfter}`);
    const fibers = await evaluate("document.querySelectorAll('.av-fiber').length"); assert.ok(fibers > 50);
    const signal = "document.querySelector('.av-signal').getAttribute('cx')";
    const x = await evaluate(signal); await delay(200); assert.notEqual(await evaluate(signal), x);
    await evaluate('window.CarmDeck.jump(4,4)'); await delay(3000); await screenshot('08-architecture-complete');
    return { before, after, fiberBefore, fiberAfter, fibers };
  });
  await check('Hash navigation selects the requested scene/step', async () => {
    await evaluate("location.hash='#4.3'"); await delay(120);
    assert.equal((await state()).index, 3); assert.equal((await state()).step, 2);
    await key(KEY.left); assert.equal((await state()).step, 1);
    assert.equal(await evaluate('location.hash'), '#4.2');
  });
  await check('Presenter syncs exact notes; connected timer buttons are disabled; next/prev control the deck', async () => {
    ({ context: presenter } = await command('browsingContext.create', { type: 'tab' })); contexts.push(presenter);
    await command('network.setCacheBehavior', { cacheBehavior: 'bypass', contexts: [presenter] });
    await command('browsingContext.setViewport', { context: presenter, viewport: { width: 1200, height: 900 }, devicePixelRatio: 1 });
    await command('browsingContext.navigate', { context: presenter, url: new URL('presenter/', url).href, wait: 'complete' });
    await waitFor(async () => await evaluate("document.getElementById('sync').classList.contains('connected')", presenter), 'presenter connection');
    assert.equal(await evaluate("document.getElementById('script').textContent", presenter), await evaluate("document.getElementById('notes-text').textContent"));
    assert.equal(await evaluate("document.getElementById('pause').disabled && document.getElementById('reset').disabled", presenter), true);
    const initial = await state();
    await click('#next', presenter); await delay(180);
    assert.equal((await state()).step, initial.step + 1);
    assert.equal(await evaluate("document.getElementById('script').textContent", presenter), await evaluate("document.getElementById('notes-text').textContent"));
    await click('#prev', presenter); await delay(180); assert.equal((await state()).step, initial.step);
    await screenshot('09-presenter', presenter);
  });
  await check('Headless fullscreen API enters and exits through the real F shortcut', async () => {
    await key('f'); await delay(200);
    assert.equal(await evaluate('Boolean(document.fullscreenElement)'), true);
    await key('f'); await delay(200);
    assert.equal(await evaluate('Boolean(document.fullscreenElement)'), false);
  });
  await check('Narrow viewport keeps launch and operator controls reachable', async () => {
    await command('browsingContext.activate', { context: main });
    await restart();
    await command('browsingContext.setViewport', { context: main, viewport: { width: 390, height: 844 }, devicePixelRatio: 1 });
    await delay(200); await screenshot('10-narrow-launch');
    const bounds = await evaluate("(()=>Object.fromEntries(['launch','timed-launch','next','notes-button'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,{x:r.x,y:r.y,width:r.width,height:r.height}]})))()");
    for (const [id, r] of Object.entries(bounds)) {
      assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.width <= 391 && r.y + r.height <= 845, `${id} outside viewport: ${JSON.stringify(r)}`);
    }
    await click('#launch'); await waitFor(async () => !(await state()).film.paused, 'narrow launch');
    await click('#notes-button'); assert.equal(await evaluate("document.getElementById('notes-panel').classList.contains('show')"), true);
    await screenshot('11-narrow-controls'); await restart();
    return bounds;
  });
  report.consoleErrors = logs.filter(message => message.method === 'log.entryAdded' && message.params.level === 'error').map(message => message.params.text);
  await check('Browser console has no errors', async () => assert.deepEqual(report.consoleErrors, []));
  report.result = report.results.every(result => result.result === 'passed') ? 'passed' : 'failed';
  await fs.writeFile(path.join(output, 'controls.json'), JSON.stringify(report, null, 2) + '\n');
  if (report.result !== 'passed') process.exitCode = 1;
} finally {
  for (const context of contexts.reverse()) await command('browsingContext.close', { context }).catch(() => {});
  if (session) await command('session.end').catch(() => {});
  socket.close();
}
