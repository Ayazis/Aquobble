// npx tsx scripts/lookdev/shoot.ts <outDir> "<query1>" "<query2>" ...  — screenshots of lookdev.html per query string.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
const [outDir, ...queries] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const server = await createServer({ server: { port: 5197, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
page.on('pageerror', (e) => console.error('pageerror', e.message));
page.on(
  'console',
  (m) =>
    (m.type() === 'error' || /THREE|WebGL.*ERROR/.test(m.text())) &&
    !/GPU stall|parallel_shader/.test(m.text()) &&
    console.error(m.text().slice(0, 1500)),
);
for (const q of queries) {
  await page.goto(`http://localhost:5197/lookdev.html?${q}`);
  await page.waitForFunction(() => ((window as unknown as { __frame?: number }).__frame ?? 0) >= 3, null, {
    timeout: 0,
  });
  const file = path.join(outDir, `${q.replace(/[^a-z0-9.=-]+/gi, '_')}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
await server.close();
