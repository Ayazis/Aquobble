import { describe, expect, it } from 'vitest';
import { bakeGrassDensity } from './bakeGrassDensity';
import { texelCentre, texelOf } from './DensityGrid';
import type { GrassBlocker } from './GrassBlocker';
import type { GroundRules } from './GroundRules';
import { growthAt } from './growthAt';
import { rasterGrowth } from './rasterGrowth';

const grid = { size: 40, resolution: 40 };
const ground = { heightAt: (x: number) => (x < -10 ? -1 : 3) };
const rules: GroundRules = { minHeight: 0.5, maxHeight: 14, maxSlope: 0.7 };
const at = (data: Uint8Array, x: number, z: number) => {
  const k = (texelOf(grid, z) * grid.resolution + texelOf(grid, x)) * 4;
  return [...data.slice(k, k + 4)];
};

describe('bakeGrassDensity', () => {
  it('maps texel centres and world positions both ways', () => {
    expect(texelOf(grid, texelCentre(grid, 7))).toBe(7);
  });

  it('leaves no grass below the beach line or on a blocker', () => {
    const blocker: GrassBlocker = { kind: 'circle', x: 5, z: 5, radius: 2 };
    const data = bakeGrassDensity(ground, { ...rules, blockers: [blocker] }, grid);
    expect(at(data, -15, 0)[0]).toBe(0);
    expect(at(data, 5, 5)[0]).toBe(0);
    expect(at(data, 0, -10)[0]).toBeGreaterThan(0);
  });

  it('grows shorter and sparser under trees', () => {
    const open = at(bakeGrassDensity(ground, rules, grid), 0, 0);
    const forest = at(bakeGrassDensity(ground, { ...rules, canopyAt: () => 1 }, grid), 0, 0);
    expect(forest[0]).toBeLessThan(open[0]);
    expect(forest[1]).toBeLessThan(open[1]);
    expect(forest[3]).toBe(255);
  });

  it('rasterises blocker growth exactly like growthAt', () => {
    const blockers: GrassBlocker[] = [
      { kind: 'rect', x: -3, z: 2, halfWidth: 2, halfDepth: 1, rotation: 0.5 },
      { kind: 'circle', x: 4, z: -4, radius: 1.5, feather: 3 },
    ];
    const growth = rasterGrowth(grid, blockers, 1.5);
    for (const [i, j] of [
      [17, 22],
      [24, 15],
      [20, 20],
      [10, 30],
    ]) {
      const expected = growthAt(blockers, 1.5, texelCentre(grid, i), texelCentre(grid, j));
      expect(growth[j * grid.resolution + i]).toBeCloseTo(expected, 5);
    }
  });
});
