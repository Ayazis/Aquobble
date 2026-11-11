import type { CharacterLook } from './CharacterLook';
import { paletteSwatches } from './paletteSwatches';

const SWATCH_WIDTH = 4;

/**
 * Returns a copy of RGBA `pixels` (`width` texels per row) with every swatch of `look` filled with its
 * colour over the full height. Alpha and every other texel are kept. Pure, so it runs in tests.
 */
export function recolourPalette(pixels: Uint8Array, width: number, look: CharacterLook): Uint8Array {
  const out = new Uint8Array(pixels);
  const height = pixels.length / (width * 4);
  for (const part of Object.keys(paletteSwatches) as (keyof CharacterLook)[]) {
    const colour = look[part];
    const x0 = paletteSwatches[part];
    for (let y = 0; y < height; y++) {
      for (let x = x0; x < Math.min(width, x0 + SWATCH_WIDTH); x++) {
        const i = (y * width + x) * 4;
        out[i] = (colour >> 16) & 0xff;
        out[i + 1] = (colour >> 8) & 0xff;
        out[i + 2] = colour & 0xff;
      }
    }
  }
  return out;
}
