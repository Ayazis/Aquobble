import { describe, expect, it } from 'vitest';
import { GrassCoverage } from './GrassCoverage';

describe('GrassCoverage', () => {
  // A 32 m map of 16 texels (2 m each) with grass in one texel at x 4..6, z -8..-6.
  const grid = { size: 32, resolution: 16 };
  const density = new Uint8Array(16 * 16 * 4);
  density.set([200, 180, 0, 0], (4 * 16 + 10) * 4);
  const coverage = new GrassCoverage(density, grid, 4);

  it('finds grass in squares that touch it', () => {
    expect(coverage.any(0, -16, 8)).toBe(true);
    expect(coverage.any(4, -8, 2, 0)).toBe(true);
  });

  it('finds none over bare ground or off the map', () => {
    expect(coverage.any(-16, 0, 8)).toBe(false);
    expect(coverage.any(40, 40, 8)).toBe(false);
    expect(coverage.any(-60, -8, 8)).toBe(false);
  });

  it('ignores texels with density but no height', () => {
    const flat = new Uint8Array(16 * 16 * 4);
    flat.set([200, 0, 0, 0], 0);
    expect(new GrassCoverage(flat, grid).any(-16, -16, 32)).toBe(false);
  });
});
