import { SeededRandom } from '@core';
import { describe, expect, it } from 'vitest';
import { plotBounds } from './Bounds';
import { DEFAULT_TOWN_LAYOUT } from './defaultTownLayout';
import { placePuddles } from './placePuddles';
import { puddleWetness } from './puddleWetness';

describe('placePuddles', () => {
  const layout = DEFAULT_TOWN_LAYOUT;

  it('puts a few puddles on the roads and the square, clear of plots and of each other', () => {
    const puddles = placePuddles(layout, new SeededRandom(9));
    expect(puddles.length).toBeGreaterThanOrEqual(3);
    expect(puddles.length).toBeLessThanOrEqual(layout.roads.length * 2 + 2);
    const plots = [...layout.buildings, ...layout.props].map(plotBounds);
    for (const p of puddles) {
      const onSquare = Math.max(Math.abs(p.x), Math.abs(p.z)) < layout.plazaHalfSize;
      const onRoad = Math.min(Math.abs(p.x), Math.abs(p.z)) <= 0.6 + 1e-9;
      expect(onSquare || onRoad).toBe(true);
      for (const b of plots) expect(p.x > b.minX && p.x < b.maxX && p.z > b.minZ && p.z < b.maxZ).toBe(false);
    }
  });

  it('is reproducible for a seed', () => {
    expect(placePuddles(layout, new SeededRandom(3))).toEqual(placePuddles(layout, new SeededRandom(3)));
  });
});

describe('puddleWetness', () => {
  const puddles = [{ x: 2, z: 0, alongX: 2, alongZ: 1 }];

  it('is 1 at the middle, 0.4 on the rim and 0 well outside', () => {
    expect(puddleWetness(puddles, 2, 0)).toBeCloseTo(1);
    expect(puddleWetness(puddles, 4, 0)).toBeCloseTo(0.4);
    expect(puddleWetness(puddles, 2, 1)).toBeCloseTo(0.4);
    expect(puddleWetness(puddles, 8, 0)).toBe(0);
    expect(puddleWetness([], 0, 0)).toBe(0);
  });
});
