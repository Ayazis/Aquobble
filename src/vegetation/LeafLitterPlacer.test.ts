import { SeededRandom } from '@core';
import { LeafLitterPlacer } from './LeafLitterPlacer';

describe('LeafLitterPlacer', () => {
  const ground = { heightAt: (x: number) => x * 0.1 };
  const tree = { x: 10, y: 1, z: 0, yaw: 0, scale: 2, lean: 0, tint: 0.5 };

  it('lays patches under the crown, on the ground, scaled with the tree', () => {
    const patches = new LeafLitterPlacer(ground, new SeededRandom(3)).place([tree], { perTree: 10, radius: 3 });
    expect(patches).toHaveLength(20);
    for (const p of patches) {
      expect(Math.hypot(p.x - tree.x, p.z - tree.z)).toBeLessThanOrEqual((0.5 + 3) * 2 + 1e-9);
      expect(p.y).toBeCloseTo(p.x * 0.1 + 0.03);
    }
  });

  it('is reproducible for the same seed', () => {
    const a = new LeafLitterPlacer(ground, new SeededRandom(7)).place([tree], { perTree: 5, radius: 3 });
    const b = new LeafLitterPlacer(ground, new SeededRandom(7)).place([tree], { perTree: 5, radius: 3 });
    expect(a).toEqual(b);
  });
});
