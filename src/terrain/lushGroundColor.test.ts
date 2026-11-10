import { describe, expect, it } from 'vitest';
import { LUSH_BAND } from './LushBand';
import { DEFAULT_PALETTE } from './TerrainPalette';
import { linearRgb } from './linearRgb';
import { lushGroundColor } from './lushGroundColor';
import { LUSH_GROUND_GLSL } from './lushGroundGlsl';

describe('lushGroundColor', () => {
  const grass = linearRgb(DEFAULT_PALETTE[1].color);
  const forest = linearRgb(DEFAULT_PALETTE[2].color);

  it('is the grass colour below the band and the forest colour above it', () => {
    expect(lushGroundColor(LUSH_BAND.start - 3)).toEqual(grass);
    expect(lushGroundColor(LUSH_BAND.end + 3)).toEqual(forest);
  });

  it('blends smoothly in between, halfway at the middle of the band', () => {
    const mid = lushGroundColor((LUSH_BAND.start + LUSH_BAND.end) / 2);
    mid.forEach((v, i) => expect(v).toBeCloseTo((grass[i] + forest[i]) / 2, 6));
    const low = lushGroundColor(LUSH_BAND.start + 0.2);
    expect(low[1]).toBeLessThan(grass[1]);
    expect(low[1]).toBeGreaterThan(mid[1]);
  });

  it('gives the shader the same end colours and band', () => {
    const vec3 = (c: number[]) => `vec3(${c.map((v) => v.toFixed(4)).join(', ')})`;
    expect(LUSH_GROUND_GLSL).toContain(`mix(${vec3(grass)}, ${vec3(forest)},`);
    expect(LUSH_GROUND_GLSL).toContain('smoothstep(5.0, 7.0, height)');
  });
});

describe('linearRgb', () => {
  it('converts sRGB hex channels to linear', () => {
    expect(linearRgb(0xffffff)).toEqual([1, 1, 1]);
    expect(linearRgb(0x000000)).toEqual([0, 0, 0]);
    expect(linearRgb(0x800000)[0]).toBeCloseTo(0.2195, 3);
  });
});
