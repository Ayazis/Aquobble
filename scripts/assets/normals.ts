// npm run assets:normals -- grass rock sand [--strength 2.5] [--blur 0.6] [--size 512]
// Derives a tangent-space normal map (<name>-normal.webp) from a colour texture in public/assets/textures,
// reading its brightness as height. For textures whose source has no normal map of its own; tileable in,
// tileable out (neighbours wrap round the edges).
import path from 'node:path';
import sharp from 'sharp';
import { parseArgs } from './lib';

const { pos, flags } = parseArgs();
const strength = Number(flags.strength ?? 2.5);
const blur = Number(flags.blur ?? 0.6);
const size = Number(flags.size ?? 512);
const dir = path.resolve('public/assets/textures');

for (const name of pos) {
  const source = sharp(path.join(dir, `${name}.webp`))
    .resize(size, size)
    .greyscale();
  const { data, info } = await (blur > 0 ? source.blur(blur) : source).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x: number, y: number) => data[((y + h) % h) * w + ((x + w) % w)] / 255;
  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Sobel slopes; bright is high, so the normal leans away from brighter neighbours.
      const dx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const dy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const nx = -dx * strength;
      const ny = dy * strength; // image rows run down, the map's green channel points up
      const inv = 1 / Math.hypot(nx, ny, 1);
      const i = (y * w + x) * 3;
      out[i] = Math.round((nx * inv * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round((ny * inv * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
    }
  }
  const file = path.join(dir, `${name}-normal.webp`);
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .webp({ quality: 82 })
    .toFile(file);
  console.log(`${file} (${w}x${h})`);
}
