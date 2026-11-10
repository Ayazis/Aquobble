import { SeededRandom, vec3 } from '@core';
import { distanceToObstacle, GridNavigator, NavGrid } from '@navigation';
import { DEFAULT_TOWN_LAYOUT as layout, townObstacles } from '@town';

const half = layout.wall.halfSize;
const obstacles = townObstacles({ layout, origin: vec3(), buildings: [], props: [] });
const grid = new NavGrid({ minX: -half, maxX: half, minZ: -half, maxZ: half }, 0.25, obstacles, 0.5);
const navigator = new GridNavigator(grid);
/** No point of a route may come closer than this to anything solid (a townsperson's capsule is 0.35 m). */
const RADIUS = 0.3;

describe('navigation in the default town', () => {
  it('finds a route between any two random spots that keeps clear of every building, prop and wall', () => {
    const random = new SeededRandom(11);
    for (let walk = 0; walk < 300; walk++) {
      const from = navigator.randomPoint(random);
      const to = navigator.randomPoint(random);
      const path = navigator.findPath(from.x, from.z, to.x, to.z);
      if (from.x === to.x && from.z === to.z) continue;
      expect(path, `walk ${walk}`).not.toBeNull();
      let a = from;
      for (const b of path ?? []) {
        const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.1);
        for (let i = 0; i <= steps; i++) {
          const x = a.x + ((b.x - a.x) * i) / steps;
          const z = a.z + ((b.z - a.z) * i) / steps;
          const hit = obstacles.some((o) => distanceToObstacle(o, x, z) < RADIUS);
          expect(hit, `walk ${walk} at (${x.toFixed(2)}, ${z.toFixed(2)})`).toBe(false);
        }
        a = b;
      }
      expect(path?.at(-1)).toEqual(to);
    }
  });

  it('reaches every gateway from the square', () => {
    for (const [x, z] of [
      [0, half - 1],
      [0, 1 - half],
      [half - 1, 0],
      [1 - half, 0],
    ]) {
      expect(navigator.findPath(0, 8, x, z)?.at(-1), `(${x}, ${z})`).toEqual({ x, z });
    }
  });
});
