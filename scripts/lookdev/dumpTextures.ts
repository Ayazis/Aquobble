// npx tsx scripts/lookdev/dumpTextures.ts <outDir>: writes the water's generated textures as PGM/PPM images.
import fs from 'node:fs';
import path from 'node:path';
import { SeededRandom } from '@core';
import { WaterDetailFactory } from '../../src/water/detail/WaterDetailFactory';
import { FoamTextureFactory } from '../../src/water/detail/FoamTextureFactory';

const out = process.argv[2] ?? 'shots/textures';
fs.mkdirSync(out, { recursive: true });
const size = 256;
const t0 = performance.now();
const detail = new WaterDetailFactory(new SeededRandom(1)).create(size).image.data as Uint8Array;
const t1 = performance.now();
const foam = new FoamTextureFactory(new SeededRandom(2)).create(size).image.data as Uint8Array;
console.log(`detail ${(t1 - t0).toFixed(0)} ms, foam ${(performance.now() - t1).toFixed(0)} ms`);
const channel = (data: Uint8Array, c: number, name: string) => {
  const grey = new Uint8Array(size * size);
  let sum = 0;
  for (let i = 0; i < size * size; i++) sum += grey[i] = data[i * 4 + c];
  console.log(name, 'mean', (sum / size / size / 255).toFixed(3));
  fs.writeFileSync(path.join(out, `${name}.pgm`), Buffer.concat([Buffer.from(`P5 ${size} ${size} 255\n`), grey]));
};
channel(detail, 0, 'tilt-x');
channel(detail, 2, 'height');
channel(detail, 3, 'caustic');
channel(foam, 0, 'foam-order');
channel(foam, 1, 'foam-bubbles');
// Mean of the caustic net as the shader builds it (the darker of two unrelated spots), for calibrating its gain.
let net = 0;
for (let i = 0; i < size * size; i++)
  net += Math.min(detail[i * 4 + 3], detail[((i * 7919 + 12345) % (size * size)) * 4 + 3]) / 255;
console.log('caustic net mean (x CAUSTIC_RANGE)', ((net / size / size) * 4).toFixed(3));
