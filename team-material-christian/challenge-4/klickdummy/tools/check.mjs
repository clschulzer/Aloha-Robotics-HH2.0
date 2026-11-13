/* Plays the demo screenplay in a headless browser, takes screenshots and fails on any console error,
   horizontal page overflow or wrong state. Run: node tools/check.mjs [outDir] */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, '..', 'index.html')).href;
const out = process.argv[2] || path.join(here, '..', 'screenshots');
fs.mkdirSync(out, { recursive: true });
const errors = [];
const fail = (m) => { errors.push(m); console.log('FAIL', m); };
const ok = (m) => console.log('ok  ', m);

const browser = await chromium.launch();
async function run(name, viewport, theme, steps) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: viewport.width > 600 ? 2 : 1, colorScheme: theme });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') fail(`${name}: console ${m.text()}`); });
  page.on('pageerror', (e) => fail(`${name}: ${e.message}`));
  await page.goto(url);
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  const shot = async (n) => {
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (o > 1) fail(`${name}/${n}: page scrolls sideways by ${o}px`);
    await page.screenshot({ path: path.join(out, `${name}-${n}.png`), fullPage: viewport.width <= 600 });
  };
  const st = (id) => page.evaluate((i) => (window.IAApp.state().plan.find((w) => w.id === i) || {}).status, id);
  const expect = async (label, got, want) => (got === want ? ok(`${name}: ${label}`) : fail(`${name}: ${label}: got ${got}, want ${want}`));
  await steps({ page, shot, st, expect });
  await ctx.close();
}

const screenplay = async ({ page, shot, st, expect }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  await expect('the dummy opens on the overview', await page.evaluate(() => window.IAApp.state().route), 'start');
  await shot('00-ueberblick');
  await expect('the helper circle is on the overview', await page.locator('.crew svg').count(), 1);
  // The scripted pitch: six scenes whose time budgets sum to 180 seconds.
  await act('tour', 'pitch');
  await expect('pitch shows speaker notes', await page.locator('#view > .say').count(), 1);
  let secs = 0, scenes = 0;
  for (let guard = 0; guard < 20; guard++) {
    const t = await page.locator('#script .txt b').innerText();
    const m = t.match(/(\d+) von (\d+) · (\d+) s/); if (!m) { fail('desk: pitch scene without a time budget: ' + t); break; }
    secs += +m[3]; scenes++;
    if (m[1] === m[2]) break;
    await act('scene', '1');
  }
  await expect('pitch has six scenes', scenes, 6);
  await expect('pitch scenes sum to 180 seconds', secs, 180);
  await expect('pitch ends on the overview', await page.evaluate(() => window.IAApp.state().route), 'start');
  await shot('00b-pitch-schluss');
  await act('reset');
  await expect('reset keeps the pitch running', await page.evaluate(() => { const s = window.IAApp.state(); return s.mode + ':' + s.tour; }), 'pitch:true');
  await act('mode');
  await expect('switching leads to the deep dive', await page.evaluate(() => window.IAApp.state().mode), 'tief');
  await act('role', 'nurse'); await act('mode');
  await expect('switching back starts the pitch fresh, as medical physics', await page.evaluate(() => { const s = window.IAApp.state(); return s.mode + ':' + s.role + ':' + s.plan.length; }), 'pitch:mp:0');
  await act('mode');
  await act('go', 'start'); await act('tour', 'tief');
  await expect('deep dive shows speaker notes', await page.locator('#view > .say').count(), 1);
  // One clickable area per further service.
  await act('go', 'dienste'); await shot('30-wartung');
  await expect('nothing can be bundled before a window exists', await page.locator('[data-act="bund"]').count(), 0);
  await act('tab', 'termin'); await shot('31-servicetermin');
  await expect('no visit can be accepted before the observation is in', await page.locator('[data-act="svcok"]:not([disabled])').count(), 0);
  await act('seen', 'warn');
  await expect('no visit can be accepted before the hospital has prepared', await page.locator('[data-act="svcok"]:not([disabled])').count(), 0);
  await act('role', 'nurse'); await act('prep', 'strom');
  await expect('the person at the device cannot tick the hospital checklist', await page.evaluate(() => !!window.IAApp.state().prep.strom), false);
  await act('role', 'mp');
  await act('prep', 'strom'); await act('prep', 'zugang'); await act('prep', 'ersatz'); await act('svcok');
  await expect('the check-in is locked after the technician accepted', await page.locator('[data-act="seen"]:not([disabled]), [data-act="prep"]:not([disabled])').count(), 0);
  await expect('technician accepts after the check-in is complete', await page.evaluate(() => window.IAApp.state().svcOk), true);
  await shot('31b-servicetermin-bereit');
  await act('tab', 'lernen'); await act('learned'); await shot('32-lernen');
  await act('tab', 'ort'); await page.click('[data-act="ortjob"]'); await shot('34-ort');
  await expect('a wrong location becomes a job for the morning', await page.evaluate(() => Object.keys(window.IAApp.state().ortJob).length), 1);
  await act('tab', 'nachweis'); await act('nachweis'); await shot('35-nachweis');
  await expect('the report is created from the record', await page.locator('.doc').count(), 1);
  await act('tab', 'hersteller');
  await expect('nothing is shared with the manufacturer by default', await page.evaluate(() => Object.values(window.IAApp.state().share).some(Boolean)), false);
  await act('share', 'ort'); await shot('36-hersteller');
  await act('tab', 'typen'); await act('typ', 'us'); await shot('37-typen');
  await act('go', 'roboter'); await act('skill', 'bewegen'); await shot('38-nachtschicht');
  await expect('a robot capability can be picked', await page.evaluate(() => window.IAApp.state().skill), 'bewegen');
  await act('tourend'); await act('go', 'helfer'); await shot('33-helfer');
  await act('go', 'heute');
  await shot('01-heute');
  await act('scene', '1'); // scene 2: Cio, matt
  await shot('02-begleiter-cio-matt');
  await act('scene', '1');
  await shot('03-tafel-leer');
  await page.click('.banner [data-act="fill"]');
  await page.waitForSelector('.blk.w-vorschlag');
  await expect('fill gives 4 proposals', await page.locator('.board .blk.w-vorschlag').count() + await page.evaluate(() => window.IAApp.state().plan.filter((w) => w.day !== 0).length), 4);
  await shot('04-tafel-luecken-gefuellt');
  await act('view', 'woche'); await shot('05-tafel-woche'); await act('view', 'tag');
  await act('sel', 'C-03');
  await expect('start is locked before release', await page.locator('[data-act="start"]').count(), 0);
  await page.click('.panel [data-act="rel"]');
  await expect('Cio released', await st('C-03'), 'geplant');
  await page.click('.panel [data-act="robot"]');
  await expect('robot on the way, still no start button', await page.locator('[data-act="start"]').count(), 0);
  await page.waitForSelector('.panel [data-act="start"]');
  await expect('robot reports ready', await st('C-03'), 'bereit');
  await shot('06-roboter-bereit');
  await page.click('.panel [data-act="start"]');
  await expect('update running', await st('C-03'), 'laeuft');
  await shot('07-update-laeuft');
  await page.click('.banner [data-act="alarm"]');
  await expect('alert stays until confirmed', await page.locator('.alert').count(), 1);
  await expect('Cora moved out of the alarm block', await page.evaluate(() => window.IAApp.state().plan.find((w) => w.id === 'C-01').from), 1200);
  await act('sel', 'C-01');
  await shot('08-alarm-umgeplant');
  await act('go', 'heute'); await expect('alert still there on another screen', await page.locator('.alert').count(), 1);
  await act('ack', 'alarm'); await expect('alert gone after confirm', await page.locator('.alert').count(), 0);
  await act('relall');
  await act('role', 'nurse'); await act('pet', 'C-01');
  await shot('09-begleiter-cora-bitte');
  await act('plug', 'C-01');
  await expect('Cora stays locked while the alarm runs', await st('C-01'), 'geplant');
  await expect('nurse sees no start button', await page.locator('[data-act="start"]').count(), 0);
  await shot('10-begleiter-cora-danke');
  await act('role', 'it'); await act('go', 'tafel'); await act('sel', 'C-02');
  await expect('IT cannot release', await page.locator('.panel [data-act="rel"]').count(), 0);
  await act('role', 'mp'); await act('sel', 'C-03');
  await page.click('.panel [data-act="finish"]');
  await expect('Cio current', await st('C-03'), 'fertig');
  await act('akte', 'C-03'); await shot('11-akte-cio');
  await act('go', 'geraete'); await shot('12-geraete');
  await act('go', 'helfer'); await shot('13-helfer');
  await act('go', 'heute'); await shot('14-heute-danach');
  await act('go', 'dienste'); await act('tab', 'wartung');
  const nb = await page.locator('[data-act="bund"]').count();
  await expect('with windows planned a check can be bundled', nb > 0, true);
  if (nb) { await page.click('[data-act="bund"]'); await expect('bundling removes one offer', await page.locator('[data-act="bund"]').count(), nb - 1); }
  await shot('30b-wartung-gebuendelt');
  await act('go', 'heute');
  await expect('the cockpit shows the helper circle', await page.locator('.crew svg').count(), 1);
  await shot('39-heute-kreis');
};
const failure = async ({ page, shot, st, expect }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  await act('go', 'tafel'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag');
  await page.click('.panel [data-act="rel"]'); await page.click('.panel [data-act="robot"]');
  await page.waitForSelector('.panel [data-act="start"]'); await page.click('.panel [data-act="start"]');
  await page.click('.panel [data-act="failu"]');
  await expect('failure reported', await st('C-03'), 'fehl');
  await expect('failure alert stays', await page.locator('.alert').count(), 1);
  await shot('fehlschlag');
};
const phone = async ({ page, shot }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  await shot('ueberblick');
  await act('go', 'dienste'); await shot('dienste'); await act('tab', 'termin'); await shot('termin');
  await act('go', 'roboter'); await shot('nachtschicht');
  await act('go', 'heute');
  await shot('heute');
  if (!(await page.locator('.legal').isVisible())) fail('phone: notice "kein Medizinprodukt" is not visible');
  else ok('phone: notice "kein Medizinprodukt" is visible');
  await act('go', 'tafel'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag'); await shot('tafel');
  await act('go', 'begleiter'); await shot('begleiter'); await act('akte', 'C-03').catch(() => {}); await act('go', 'geraete'); await shot('geraete');
};

/* English: play the same flow, visit every screen and fail on German words that were left behind. */
const GERMAN = /\b(und|der|das|nicht|für|Gerät|Geräte|Fenster|Frist|heute|Saal|Flur|Strom|Prüfung|freigeben|Begleiter|Lotse|Bote|Wächter|Dolmetscher|Medizinphysik|bis|oder|kein|keine|ist|wird|Tagen|Wochen|jetzt|Bereiche)\b/g;
const english = async ({ page, shot, st, expect }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  const clean = async (n) => {
    const hits = await page.evaluate((src) => {
      const t = document.body.innerText + ' ' + [...document.querySelectorAll('[title],[aria-label],[data-l]')].map((e) => (e.getAttribute('title') || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('data-l') || '')).join(' ');
      return [...new Set(t.match(new RegExp(src, 'g')) || [])];
    }, GERMAN.source);
    if (hits.length) fail(`en/${n}: German left on an English screen: ${hits.join(', ')}`); else ok(`en: ${n} has no German words`);
    await shot(n);
  };
  await act('lang', 'en');
  await expect('html lang follows the switch', await page.evaluate(() => document.documentElement.lang), 'en');
  await clean('00-overview');
  await act('tour', 'pitch');
  for (let i = 0; i < 6; i++) { await clean('00p-pitch-' + (i + 1)); if (i < 5) await act('scene', '1'); }
  await act('go', 'start'); await act('tour', 'tief'); await clean('00b-overview-tour'); await act('tourend');
  await act('go', 'dienste'); await clean('30-maintenance');
  await act('tab', 'termin'); await clean('31-service-visit'); await act('seen', 'aus'); await act('prep', 'strom'); await clean('31b-service-visit-ready'); await act('prep', 'zugang'); await act('prep', 'ersatz'); await clean('31c-service-visit-all-ready'); await act('svcok'); await clean('31d-service-visit-accepted');
  await act('tab', 'lernen'); await clean('32-learning');
  await act('tab', 'ort'); await clean('34-place');
  await act('tab', 'nachweis'); await act('nachweis'); await clean('35-records');
  await act('tab', 'hersteller'); await clean('36-manufacturer');
  for (const t of ['roe', 'us', 'mon']) { await act('tab', 'typen'); await act('typ', t); await clean('37-types-' + t); }
  await act('go', 'roboter'); await act('skill', 'teile'); await clean('38-night-shift'); await act('skill', 'bewegen'); await clean('38b-night-shift-vision'); await act('skill', 'techniker'); await clean('38c-night-shift-day');
  await act('go', 'helfer'); await clean('33-helpers');
  await act('go', 'heute');
  await clean('01-today');
  await act('go', 'begleiter'); await clean('02-companion-weak');
  await act('wake', 'C-03');
  await expect('wake is stored', await page.evaluate(() => window.IAApp.state().woke['C-03']), true);
  await act('go', 'tafel'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag');
  await clean('03-board');
  await act('rows', 'saele');
  await expect('rows by room show the proposals', await page.locator('.board .blk.w-vorschlag').count(), 2);
  await clean('04-board-rooms'); await act('rows', 'geraete');
  await page.click('.panel [data-act="rel"]'); await page.click('.panel [data-act="robot"]');
  await page.waitForSelector('.panel [data-act="start"]'); await clean('05-robot-ready');
  await page.click('.panel [data-act="start"]');
  await page.click('.banner [data-act="alarm"]'); await clean('06-alarm');
  await act('ack', 'alarm'); await act('go', 'heute'); await act('tech'); await act('merge'); await act('go', 'tafel');
  await act('view', 'woche'); await clean('07-week'); await act('view', 'tag');
  await act('sel', 'C-03'); await page.click('.panel [data-act="failu"]'); await clean('08-failure');
  await act('akte', 'C-03'); await act('ask', '0'); await act('ask', '1'); await clean('09-file');
  await act('go', 'geraete'); await clean('10-devices');
  await act('go', 'helfer'); await clean('11-helpers');
  await act('role', 'nurse'); await act('go', 'begleiter'); await act('pet', 'C-01'); await clean('12-companion-request');
  await act('go', 'heute'); await clean('13-today-after');
  await act('lang', 'de');
  await expect('switching back keeps the plan', await st('C-03'), 'fehl');
};

/* Robot mission, remote control, job offers and control room. */
const ops = (lang) => async ({ page, shot, st, expect }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  const S = (fn) => page.evaluate(fn);
  const pre = lang === 'en' ? 'en-' : '';
  if (lang === 'en') await act('lang', 'en');
  const clean = async (n) => {
    if (lang === 'en') {
      const hits = await page.evaluate((src) => {
        const t = document.body.innerText + ' ' + [...document.querySelectorAll('[title],[aria-label],[data-l]')].map((e) => (e.getAttribute('title') || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('data-l') || '')).join(' ');
        return [...new Set(t.match(new RegExp(src, 'g')) || [])];
      }, GERMAN.source);
      if (hits.length) fail(`ops-en/${n}: German left on an English screen: ${hits.join(', ')}`); else ok(`ops-en: ${n} has no German words`);
    }
    await shot(pre + n);
  };
  await act('go', 'roboter'); await clean('20-roboter-station');
  await act('go', 'tafel'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag');
  await page.click('.panel [data-act="rel"]');
  await act('go', 'roboter'); await act('robot', 'C-03');
  await expect('mission started', await st('C-03'), 'unterwegs');
  await act('robst');
  await expect('bed in the corridor holds the robot', await S(() => window.IAApp.state().rob.hold), 'hindernis');
  await page.waitForTimeout(1500);
  await expect('held robot does not report ready', await st('C-03'), 'unterwegs');
  await act('rhalt'); await act('rgo');
  await expect('releasing an emergency stop does not clear the bed', await S(() => window.IAApp.state().rob.hold), 'hindernis');
  await clean('21-roboter-hindernis');
  await act('jobnew', 'weg:C-03');
  await expect('job created', await S(() => window.IAApp.state().jobs.length), 1);
  await act('go', 'leitstand'); await clean('22-leitstand-auftrag');
  await act('role', 'nurse');
  await expect('free person on duty sees the offer', await page.locator('.offer').count(), 1);
  await act('go', 'heute'); await clean('23-auftrag-angebot');
  await act('me', 'aus');
  await expect('off duty sees no offer', await page.locator('.offer').count(), 0);
  await act('me', 'eingriff');
  await expect('in a procedure sees no offer', await page.locator('.offer').count(), 0);
  await act('me', 'frei'); await act('jobacc', '1');
  await expect('accepted job is mine', await S(() => window.IAApp.state().jobs[0].by), 'p2');
  await clean('24-auftrag-angenommen');
  await act('jobdone', '1');
  await expect('job done releases the robot', await S(() => window.IAApp.state().rob.hold), null);
  await act('go', 'roboter'); await act('rhalt');
  await expect('anyone may press the emergency stop', await S(() => window.IAApp.state().rob.hold), 'halt');
  await expect('nurse cannot release the stop', await page.locator('[data-act="rgo"]:not([disabled])').count(), 0);
  await act('role', 'mp'); await act('rgo'); await act('rman');
  for (let i = 0; i < 6; i++) await act('steer', 'w');
  await expect('by hand the robot cannot leave the corridor', await S(() => window.IAApp.state().rob.man.x), 580);
  await clean('26-roboter-von-hand'); await act('rauto');
  const atReady = async () => { await page.waitForFunction(() => window.IAApp.state().rob.step === 7, null, { timeout: 15000 }); };
  await atReady();
  await expect('robot reports surroundings clear', await st('C-03'), 'bereit');
  await clean('25-roboter-umgebung-frei');
  await expect('plugged-in robot cannot be steered by hand', await page.locator('[data-act="rman"]:not([disabled])').count(), 0);
  await act('rhalt');
  await expect('emergency stop withdraws surroundings clear', await st('C-03'), 'unterwegs');
  await act('go', 'tafel');
  await expect('held robot raises a lasting alert on other screens', await page.locator('.alert').count(), 1);
  await act('sel', 'C-03');
  await expect('no start is offered while the robot is held', await page.locator('.panel [data-act="start"]').count(), 0);
  await act('go', 'roboter'); await act('rgo'); await atReady();
  await expect('robot reports again after the release', await st('C-03'), 'bereit');
  await act('rfunk'); await expect('lost connection holds the robot', await S(() => window.IAApp.state().rob.hold), 'funk');
  await expect('lost connection withdraws surroundings clear', await st('C-03'), 'unterwegs');
  await act('rclear'); await atReady();
  await act('tosel', 'C-03'); await page.click('.panel [data-act="start"]');
  await expect('robot guards the update', await S(() => window.IAApp.state().rob.step), 8);
  await page.click('.panel [data-act="failu"]');
  await expect('failure creates a job for a human', await S(() => window.IAApp.state().jobs.filter((j) => j.typ === 'schauen').length), 1);
  await act('role', 'nurse'); await act('jobdec', '2');
  await act('role', 'mp'); await act('go', 'leitstand');
  await expect('declined job goes to the next person', await S(() => window.IAApp.state().jobs[1].no.join()), 'p2');
  await act('jobsim', '2');
  await expect('next free person accepts', await S(() => window.IAApp.state().jobs[1].by), 'p3');
  await act('jobnew', 'aufsicht:C-06'); await clean('27-leitstand-voll');
  await expect('control room cannot answer for the person at the device', await page.locator('[data-act="jobsim"][data-a="3"]').count(), 0);
  await act('go', 'roboter'); await clean('28-roboter-fehlschlag'); await act('go', 'leitstand');
  await act('jobfin', '2');
  await expect('job finished', await S(() => window.IAApp.state().jobs[1].done), true);
  await expect('a closed job keeps no record of who did it or declined', await S(() => String(window.IAApp.state().jobs[1].by) + window.IAApp.state().jobs[1].no.length), 'null0');
  await act('role', 'nurse'); await act('go', 'heute'); await act('jobacc', '3'); await act('me', 'eingriff');
  await expect('going into a procedure hands the job back', await S(() => window.IAApp.state().jobs[2].by), null);
  await act('me', 'frei'); await act('role', 'mp'); await act('go', 'leitstand'); await act('jobsim', '3');
  await expect('supervision skips the nearer untrained person', await S(() => window.IAApp.state().jobs[2].by), 'p7');
  await act('jobfin', '3');
  await expect('supervised update on site brings the device up to date', await S(() => window.IAApp.state().vorOrt['C-06']), true);
  await page.waitForFunction(() => window.IAApp.state().rob.step === 11, null, { timeout: 15000 });
  await expect('robot drives back once someone has looked at the device', await S(() => window.IAApp.state().rob.fail), false);
};
const opsDone = async ({ page, shot, st, expect }) => {
  const act = (a, v) => page.click(v == null ? `[data-act="${a}"]` : `[data-act="${a}"][data-a="${v}"]`);
  await act('go', 'tafel'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag');
  await page.click('.panel [data-act="rel"]'); await page.click('.panel [data-act="robot"]');
  await page.click('.banner [data-act="alarm"]');
  await expect('alarm makes the driving robot pull over', await page.evaluate(() => window.IAApp.state().rob.hold), 'alarm');
  await act('go', 'roboter'); await shot('30-roboter-alarm'); await act('rgo'); await act('tosel', 'C-03');
  await page.waitForSelector('.panel [data-act="start"]', { timeout: 15000 }); await page.click('.panel [data-act="start"]');
  await page.click('.panel [data-act="finish"]');
  await page.waitForFunction(() => window.IAApp.state().rob.step === 11, null, { timeout: 15000 });
  await expect('robot is back at the dock', await st('C-03'), 'fertig');
  await act('go', 'roboter'); await shot('29-roboter-zurueck');
  await page.reload();
  await expect('mission state survives a reload', await page.evaluate(() => window.IAApp.state().rob.step), 11);
};

await run('desk', { width: 1440, height: 900 }, 'light', screenplay);
await run('ops', { width: 1440, height: 900 }, 'light', ops('de'));
await run('ops', { width: 1440, height: 900 }, 'light', ops('en'));
await run('ops', { width: 1440, height: 900 }, 'light', opsDone);
await run('ops-phone', { width: 400, height: 800 }, 'light', async ({ page, shot }) => { await page.click('[data-act="go"][data-a="roboter"]'); await shot('roboter'); await page.click('[data-act="go"][data-a="leitstand"]'); await shot('leitstand'); });
await run('en', { width: 1440, height: 900 }, 'light', english);
await run('fehl', { width: 1440, height: 900 }, 'light', failure);
await run('dark', { width: 1440, height: 900 }, 'dark', async ({ page, shot }) => { await shot('ueberblick'); await page.click('[data-act="go"][data-a="dienste"]'); await shot('dienste'); await page.click('[data-act="go"][data-a="roboter"]'); await shot('nachtschicht'); await page.click('[data-act="go"][data-a="tafel"]'); await page.click('.banner [data-act="fill"]'); await page.waitForSelector('.blk.w-vorschlag'); await shot('tafel'); await page.click('[data-act="go"][data-a="begleiter"]'); await shot('begleiter'); });
await run('phone', { width: 400, height: 800 }, 'light', phone);
await browser.close();
console.log(errors.length ? `\n${errors.length} FAILED` : '\nALL CHECKS PASSED');
process.exit(errors.length ? 1 : 0);
