// npm run shots -- [label] [--set default|scale|water|village|night] [--views plaza,gate] [--times noon,night] [--devices desktop,phone] [--size 1280x720]
// Boots the game in headless Chromium with ?debug and saves the reference views to shots/<label>/ (gitignored),
// printing how bright each one is. Needs a Chromium for playwright-core (`npx playwright-core install chromium`).
// Each shot also logs FPS (over ~1 s with the pose held), draw calls and triangles, for docs/device-measurements.md.
// --software forces software rendering (slow, but works without a GPU).
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright-core';
import { createServer } from 'vite';
import { parseArgs } from '../assets/lib';
import { SHOT_SETS } from './shotSets';
import { TIMES, type ShotView } from './views';

const { pos, flags } = parseArgs();
const label = pos[0] ?? 'current';
const pick = <T>(all: Record<string, T>, flag?: string) =>
  Object.entries(all).filter(([name]) => !flag || flag.split(',').includes(name));
const [width, height] = (flags.size ?? '1280x720').split('x').map(Number);
const DEVICES = {
  desktop: { viewport: { width, height }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true },
};
const set = SHOT_SETS[flags.set ?? 'default'];
if (!set) throw new Error(`Unknown shot set ${flags.set}; try ${Object.keys(SHOT_SETS).join(', ')}`);
const times = Object.fromEntries(set.times.map((t) => [t, TIMES[t]]));
const views = set.views.filter((v) => !flags.views || flags.views.split(',').includes(v.name));
const outDir = path.resolve('shots', label, flags.set ?? '');
fs.mkdirSync(outDir, { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const software = flags.software === 'true' ? ['--use-gl=angle', '--use-angle=swiftshader'] : [];
const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...software],
});

/** Poses the camera and clock, waits for the frame to be drawn, and saves it. Returns brightness stats. */
async function shoot(page: Page, view: ShotView, time: number, file: string) {
  const frame = await page.evaluate(
    ({ view, time }) => {
      // No named helpers in here: the script runner wraps them in a call the page does not have.
      const game = window.__aquobble;
      const [from, at] = [view.from, view.at].map((p) => ({
        x: p[0],
        y: view.absolute ? p[1] : (game.groundHeight(p[0], p[2]) ?? 0) + p[1],
        z: p[2],
      }));
      game.pauseTime(true);
      game.setTimeOfDay(time);
      game.setCamera(from, at);
      return game.frame;
    },
    { view, time },
  );
  await page.waitForFunction((f) => window.__aquobble.frame >= f + 3, frame, { timeout: 0 });
  const perf = await page.evaluate(async () => {
    const game = window.__aquobble;
    const start = performance.now();
    const first = game.frame;
    while (performance.now() - start < 1000) await new Promise((done) => requestAnimationFrame(done));
    const fps = ((game.frame - first) * 1000) / (performance.now() - start);
    return { fps, ...game.stats() };
  });
  const png = await page.screenshot({ path: file, timeout: 0 });
  const light = await page.evaluate(async (b64) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { mean: 0, white: 0, black: 0, bins: [] as number[], p: [0, 0, 0] };
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    let sum = 0;
    let white = 0;
    let black = 0;
    // 256 levels for the percentiles; the printed histogram folds them into 10 bins.
    const levels = new Array<number>(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      sum += luma;
      levels[Math.min(255, Math.round(luma * 255))]++;
      if (luma > 0.92) white++;
      if (luma < 0.03) black++;
    }
    const pixels = data.length / 4;
    const bins = new Array<number>(10).fill(0);
    levels.forEach((n, level) => (bins[Math.min(9, Math.floor(level / 25.6))] += n / pixels));
    const at = (q: number) => {
      let seen = 0;
      for (let level = 0; level < 256; level++) if ((seen += levels[level]) >= q * pixels) return level / 255;
      return 1;
    };
    const p = [at(0.05), at(0.5), at(0.95)];
    return { mean: sum / pixels, white: white / pixels, black: black / pixels, bins, p };
  }, png.toString('base64'));
  return { ...light, perf };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`.padStart(6);
for (const [device, options] of pick(DEVICES, flags.devices)) {
  const page = await (await browser.newContext(options)).newPage();
  page.on('pageerror', (error) => console.error(`[${device}] page error: ${error.message}`));
  await page.goto(`http://localhost:5199/?debug${set.query ?? ''}`);
  await page.waitForFunction(() => (window.__aquobble?.frame ?? 0) >= 3, null, { timeout: 0 });
  await page.addStyleTag({ content: 'body > :not(canvas) { display: none !important; }' });
  for (const [timeName, time] of pick(times, flags.times)) {
    for (const view of views) {
      const name = `${device}-${view.name}-${timeName}`;
      const stats = await shoot(page, view, time, path.join(outDir, `${name}.png`));
      console.log(`${name.padEnd(28)} mean ${pct(stats.mean)}  white ${pct(stats.white)}  black ${pct(stats.black)}`);
      // Brightness percentiles (5/50/95) and a 10-bin histogram, darkest bin first: midday stone belongs mid-row.
      const { fps, calls, triangles } = stats.perf;
      const perf = `${fps.toFixed(0)} FPS  ${calls} draws  ${(triangles / 1000).toFixed(0)}k tris`;
      console.log(`${''.padEnd(28)} ${perf}`);
      const [p5, p50, p95] = stats.p.map(pct);
      console.log(`${''.padEnd(28)} p5 ${p5}  p50 ${p50}  p95 ${p95}  hist ${stats.bins.map((b) => pct(b)).join('')}`);
    }
  }
  await page.context().close();
}
await browser.close();
await server.close();
console.log(`Saved to ${outDir}`);
