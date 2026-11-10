import { lushGroundColor } from '@terrain';
import { describe, expect, it } from 'vitest';
import { grassTipColor } from './grassTipColor';

const luminance = (c: readonly number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
/** Luminance of the brightest tip before roots took the ground colour (tip 0xd8e8a0 times the lightest tint). */
const BRIGHTEST_OLD_TIP = 0.46;

describe('grassTipColor', () => {
  const grounds = [lushGroundColor(2), lushGroundColor(6), lushGroundColor(10)];

  it('averages to about the brightness of the ground across tints', () => {
    for (const ground of grounds) {
      const mean = luminance(grassTipColor(ground, 0.5));
      expect(mean / luminance(ground)).toBeGreaterThan(0.94);
      expect(mean / luminance(ground)).toBeLessThanOrEqual(1);
    }
  });

  it('runs from a cooler, darker tip to a warmer, lighter one', () => {
    for (const ground of grounds) {
      const cool = grassTipColor(ground, 0);
      const warm = grassTipColor(ground, 1);
      expect(luminance(cool)).toBeLessThan(luminance(ground));
      expect(luminance(warm)).toBeGreaterThan(luminance(ground));
      expect(warm[0] / warm[2]).toBeGreaterThan(cool[0] / cool[2]);
    }
  });

  it('is never brighter than the brightest tip was before', () => {
    for (const ground of grounds) expect(luminance(grassTipColor(ground, 1))).toBeLessThanOrEqual(BRIGHTEST_OLD_TIP);
  });
});
