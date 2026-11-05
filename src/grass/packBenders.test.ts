import { packBenders } from './packBenders';
import { MAX_GRASS_BENDERS } from './WindSway';

describe('packBenders', () => {
  it('packs positions with the radius and clears stale slots', () => {
    const out = new Float32Array(MAX_GRASS_BENDERS * 4).fill(9);
    expect(packBenders([{ x: 1, y: 2, z: 3 }], 0.8, out)).toBe(1);
    expect(Array.from(out.slice(0, 4))).toEqual([1, 2, 3, Math.fround(0.8)]);
    expect(out.slice(4).every((v) => v === 0)).toBe(true);
  });

  it('caps at the shader array size', () => {
    const many = Array.from({ length: MAX_GRASS_BENDERS + 5 }, (_, i) => ({ x: i, y: 0, z: 0 }));
    expect(packBenders(many, 1, new Float32Array(MAX_GRASS_BENDERS * 4))).toBe(MAX_GRASS_BENDERS);
  });
});
