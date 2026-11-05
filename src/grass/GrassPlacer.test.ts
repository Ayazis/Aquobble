import { SeededRandom } from '@core';
import { GrassPlacer } from './GrassPlacer';

describe('GrassPlacer', () => {
  // Gentle rise along x (height = 0.1 x), but a cliff (slope 5) for x > 15.
  const ground = { heightAt: (x: number) => (x > 15 ? 1.5 + (x - 15) * 5 : x * 0.1) };
  const rules = { minHeight: 0.5, maxHeight: 50, maxSlope: 1, exclude: [{ minX: 8, maxX: 12, minZ: -50, maxZ: 50 }] };

  it('keeps grass above the beach, off steep slopes and out of excluded zones', () => {
    const blades = new GrassPlacer(ground, new SeededRandom(5), rules).grass({ count: 500, extent: 30 });
    expect(blades.length).toBeGreaterThan(100);
    for (const b of blades) {
      expect(b.x).toBeGreaterThanOrEqual(5); // height 0.5
      expect(b.x).toBeLessThanOrEqual(15.5); // cliff starts at 15
      expect(b.x <= 8 || b.x >= 12).toBe(true);
    }
  });

  it('is reproducible for the same seed', () => {
    const a = new GrassPlacer(ground, new SeededRandom(9), rules).grass({ count: 50, extent: 30 });
    const b = new GrassPlacer(ground, new SeededRandom(9), rules).grass({ count: 50, extent: 30 });
    expect(a).toEqual(b);
  });

  it('places flowers in clusters sharing one colour variant', () => {
    const flat = { heightAt: () => 1 };
    const flowers = new GrassPlacer(flat, new SeededRandom(2), { ...rules, exclude: [] }).flowers({
      clusters: 1,
      perCluster: 20,
      radius: 2,
      variants: 4,
      extent: 30,
    });
    expect(flowers).toHaveLength(20);
    expect(new Set(flowers.map((f) => f.variant)).size).toBe(1);
    const cx = flowers.reduce((s, f) => s + f.x, 0) / flowers.length;
    for (const f of flowers) expect(Math.abs(f.x - cx)).toBeLessThan(4);
  });
});
