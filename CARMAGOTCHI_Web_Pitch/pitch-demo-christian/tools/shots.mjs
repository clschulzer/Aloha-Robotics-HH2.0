/* Walks the pitch demo scene by scene and step by step, saves a screenshot of every step and fails on
   console errors. Run: node tools/shots.mjs [outdir]   Needs Playwright (Chromium). */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(here, '..', 'screenshots');
fs.mkdirSync(out, { recursive: true });
const base = pathToFileURL(path.join(here, '..', 'index.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// The team video is only next to the Aloha deck; a missing file shows a fallback and is not an error here.
page.on('console', (m) => m.type() === 'error' && !/chaos_30s|ERR_FILE_NOT_FOUND/.test(m.text() + (m.location().url || '')) && errors.push(m.text()));
await page.goto(base + '?speed=4');
await page.waitForTimeout(800);
const total = await page.evaluate(() => +document.getElementById('index').textContent.split('/')[1]);
let n = 0;
for (let s = 1; s <= total; s++) {
  await page.goto(`${base}?speed=4&auto=0&s=${s}`);
  await page.waitForTimeout(1600);
  let last = null;
  for (let k = 0; k < 8; k++) {
    const idx = await page.evaluate(() => document.getElementById('index').textContent);
    if (+idx.split('/')[0] !== s) break;
    const st = await page.evaluate(() => document.querySelector('#view .scene').dataset.step);
    if (st === last) break;
    last = st;
    const f = path.join(out, `s${String(s).padStart(2, '0')}-step${st}.png`);
    await page.screenshot({ path: f }); n++;
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(2200);
  }
}
await browser.close();
console.log(`${n} screenshots in ${out}`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
