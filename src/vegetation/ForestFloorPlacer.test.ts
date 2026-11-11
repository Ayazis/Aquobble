import { SeededRandom } from '@core';
import { EdgeBushPlacer } from './EdgeBushPlacer';
import { ForestFloorPlacer } from './ForestFloorPlacer';
import type { TreePlacement } from './TreePlacement';

const flat = { heightAt: () => 1 };
const tree = (x: number, z: number, scale = 1): TreePlacement => ({
  x,
  y: 1,
  z,
  yaw: 0,
  scale,
  lean: 0,
  tint: 0,
  species: 'oakRound',
});

describe('ForestFloorPlacer', () => {
  it('scatters near grown trees only, on the ground, and is reproducible', () => {
    const trees = [tree(0, 0), tree(50, 50, 0.35)];
    const place = () => new ForestFloorPlacer(flat, new SeededRandom(2)).place(trees, { perTree: 6, radius: 4 });
    const items = place();
    expect(items).toHaveLength(6);
    for (const i of items) {
      expect(Math.hypot(i.x, i.z)).toBeLessThan(7);
      expect(i.y).toBe(1);
    }
    expect(place()).toEqual(items);
  });
});

describe('EdgeBushPlacer', () => {
  it('puts bushes around lone trees but not inside a thicket', () => {
    const thicket = [0, 1, 2, 3, 4].map((i) => tree(i * 2, 0));
    const placer = new EdgeBushPlacer(flat, new SeededRandom(4));
    const options = { maxNeighbours: 3, neighbourRadius: 9, perTree: 2 };
    expect(placer.place(thicket, options)).toEqual([]);
    expect(placer.place([tree(0, 0)], options)).toHaveLength(2);
  });
});
