import { describe, expect, it } from 'vitest';
import { recolourPalette } from './recolourPalette';
import type { CharacterLook } from './CharacterLook';

const look: CharacterLook = {
  hair: 0x112233,
  skin: 0x445566,
  clothA: 1,
  clothB: 2,
  clothC: 3,
  clothD: 4,
  clothE: 5,
  clothF: 6,
};

describe('recolourPalette', () => {
  const width = 64;
  const source = new Uint8Array(width * 4 * 4).fill(200);
  const texel = (p: Uint8Array, x: number, y: number) =>
    Array.from(p.slice((y * width + x) * 4, (y * width + x) * 4 + 4));

  it('paints each swatch over its full column block and height', () => {
    const out = recolourPalette(source, width, look);
    expect(texel(out, 0, 0)).toEqual([0x11, 0x22, 0x33, 200]);
    expect(texel(out, 3, 3)).toEqual([0x11, 0x22, 0x33, 200]);
    expect(texel(out, 18, 1)).toEqual([0x44, 0x55, 0x66, 200]);
    expect(texel(out, 43, 2)).toEqual([0, 0, 6, 200]);
  });

  it('leaves other texels and the source untouched', () => {
    const out = recolourPalette(source, width, look);
    expect(texel(out, 6, 0)).toEqual([200, 200, 200, 200]);
    expect(texel(out, 50, 0)).toEqual([200, 200, 200, 200]);
    expect(texel(source, 0, 0)).toEqual([200, 200, 200, 200]);
  });
});
