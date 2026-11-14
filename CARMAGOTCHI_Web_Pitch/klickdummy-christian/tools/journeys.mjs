/* Plays every guided journey step by step with "Show me" and "Next", saves a screenshot per step and fails on
   console errors or on a step whose click does not finish it. Run: node tools/journeys.mjs [outDir] [de|en] */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, '..', 'index.html')).href;
const out = process.argv[2] || path.join(here, '..', 'screenshots', 'journeys');
const lang = process.argv[3] || 'de';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.goto(`${url}?lang=${lang}`);
const n = await page.evaluate(() => document.querySelectorAll('.side .tours button').length);
for (let j = 1; j < n; j++) {
  await page.click(`.side .tours button[data-a="${j}"]`); await page.waitForTimeout(500);
  for (let k = 0; k < 14; k++) {
    const s = await page.evaluate(() => window.IAApp.state().scene + 1);
    // Steps with a click: "Show me" may need two taps (accept, then done on the phone).
    for (let t = 0; t < 2 && await page.$('#script [data-act="show"]'); t++) { await page.click('#script [data-act="show"]'); await page.waitForTimeout(1500); }
    const done = await page.evaluate(() => !document.querySelector('#script [data-act="show"]'));
    if (!done) errs.push(`journey ${j} step ${s}: "Show me" did not finish the step`);
    await page.screenshot({ path: path.join(out, `j${j}-s${String(s).padStart(2, '0')}.png`) });
    const t = await page.locator('#script .txt b').innerText();
    console.log(`ok   journey ${j} step ${s}: ${t}`);
    const fin = await page.$('#script [data-act="jdone"]');
    if (fin) { await fin.click(); break; }
    await page.click('#script [data-act="scene"][data-a="1"]'); await page.waitForTimeout(700);
  }
}
await browser.close();
if (errs.length) { console.log('FAIL\n' + errs.join('\n')); process.exit(1); }
console.log('ALL JOURNEYS PASSED');
