import { SeededRandom } from '@core';
import { placeSteppingStones } from './placeSteppingStones';

describe('placeSteppingStones', () => {
  const pond = { x: 10, z: -5, radius: 5, level: 2 };
  // A bowl 1.5 m deep at the middle, meeting the surface at the rim.
  const ground = { heightAt: (x: number, z: number) => 2 - 1.5 * (1 - Math.hypot(x - 10, z + 5) ** 2 / 25) };

  it('crosses ponds with slabs whose tops just clear the water and whose feet reach the floor', () => {
    const stones = placeSteppingStones(ground, new SeededRandom(1), Array(10).fill(pond), 3);
    expect(stones.length).toBeGreaterThan(20);
    for (const s of stones) {
      expect(Math.hypot(s.x - pond.x, s.z - pond.z)).toBeLessThan(pond.radius);
      expect(s.family).toBe('slab');
      const top = s.y + 0.3 * s.scale * s.squash;
      expect(top).toBeCloseTo(pond.level + 0.07, 5);
      expect(s.y - 0.34 * s.scale * s.squash).toBeLessThanOrEqual(ground.heightAt(s.x, s.z));
      expect(s.variant).toBeLessThan(3);
    }
  });

  it('leaves some ponds without stones', () => {
    const ponds = Array(20).fill(pond);
    const stones = placeSteppingStones(ground, new SeededRandom(2), ponds, 3);
    const perPond = stones.length / ponds.length;
    expect(perPond).toBeGreaterThan(2);
    expect(perPond).toBeLessThan(9);
  });
});
