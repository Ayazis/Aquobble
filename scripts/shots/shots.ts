// npm run shots -- [label] [--views plaza,gate] [--times noon,night] [--devices desktop,phone] [--size 1280x720]
// Boots the game in headless Chromium with ?debug and saves the reference views to shots/<label>/ (gitignored),
// printing how bright each one is. Needs a Chromium for playwright-core (`npx playwright-core install chromium`).
// --software forces software rendering (slow, but works without a GPU).
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright-core';
import { createServer } from 'vite';
import { parseArgs } from '../assets/lib';
import { TIMES, VIEWS, type ShotView } from './views';

const { pos, flags } = parseArgs();
const label = pos[0] ?? 'current';
const pick = <T>(all: Record<string, T>, flag?: string) =>
  Object.entries(all).filter(([name]) => !flag || flag.split(',').includes(name));
const [width, height] = (flags.size ?? '1280x720').split('x').map(Number);
const DEVICES = {
  desktop: { viewport: { width, height }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true },
};
const views = VIEWS.filter((v) => !flags.views || flags.views.split(',').includes(v.name));
const outDir = path.resolve('shots', label);
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
  const png = await page.screenshot({ path: file, timeout: 0 });
  return page.evaluate(async (b64) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { mean: 0, white: 0, black: 0 };
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    let sum = 0;
    let white = 0;
    let black = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      sum += luma;
      if (luma > 0.92) white++;
      if (luma < 0.03) black++;
    }
    const pixels = data.length / 4;
    return { mean: sum / pixels, white: white / pixels, black: black / pixels };
  }, png.toString('base64'));
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`.padStart(6);
for (const [device, options] of pick(DEVICES, flags.devices)) {
  const page = await (await browser.newContext(options)).newPage();
  page.on('pageerror', (error) => console.error(`[${device}] page error: ${error.message}`));
  await page.goto('http://localhost:5199/?debug');
  await page.waitForFunction(() => (window.__aquobble?.frame ?? 0) >= 3, null, { timeout: 0 });
  await page.addStyleTag({ content: 'body > :not(canvas) { display: none !important; }' });
  for (const [timeName, time] of pick(TIMES, flags.times)) {
    for (const view of views) {
      const name = `${device}-${view.name}-${timeName}`;
      const stats = await shoot(page, view, time, path.join(outDir, `${name}.png`));
      console.log(`${name.padEnd(28)} mean ${pct(stats.mean)}  white ${pct(stats.white)}  black ${pct(stats.black)}`);
    }
  }
  await page.context().close();
}
await browser.close();
await server.close();
console.log(`Saved to ${outDir}`);
