import { describe, expect, it } from 'vitest';
import { MAX_BEND_STAMPS, packStamps, snapToTexel, stampStrength } from './BendStamp';

describe('bend stamps', () => {
  it('packs discs and motion and clears unused slots', () => {
    const discs = new Float32Array(MAX_BEND_STAMPS * 4).fill(9);
    const motion = new Float32Array(MAX_BEND_STAMPS * 4).fill(9);
    const n = packStamps([{ x: 1, z: 2, radius: 0.5, strength: 1, vx: 3, vz: 4 }], discs, motion);
    expect(n).toBe(1);
    expect([...discs.slice(0, 5)]).toEqual([1, 2, 0.5, 1, 0]);
    expect([...motion.slice(0, 5)]).toEqual([3, 4, 0, 0, 0]);
  });

  it('pushes harder when running', () => {
    expect(stampStrength(8)).toBeGreaterThan(stampStrength(4));
    expect(stampStrength(0)).toBeGreaterThan(0);
  });

  it('snaps to whole texels', () => {
    expect(snapToTexel(1.3, 32, 128)).toBeCloseTo(1.25);
  });
});
