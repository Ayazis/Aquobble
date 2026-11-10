import { SeededRandom } from '@core';
import { GridNavigator } from './GridNavigator';
import { NavGrid } from './NavGrid';
import type { NavPoint } from './NavPoint';
import { distanceToObstacle, type NavObstacle } from './NavObstacle';

const area = { minX: 0, maxX: 20, minZ: 0, maxZ: 20 };
/** A wall across the middle with one gap at x 16..18. */
const wall: NavObstacle[] = [
  { x: 8, z: 10, halfWidth: 8, halfDepth: 1, rotation: 0 },
  { x: 19, z: 10, halfWidth: 1, halfDepth: 1, rotation: 0 },
];

/** Points every 5 cm along the route, to check what it crosses. */
function trace(from: NavPoint, path: NavPoint[]): NavPoint[] {
  const points: NavPoint[] = [];
  let a = from;
  for (const b of path) {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.05);
    for (let i = 0; i <= steps; i++) {
      points.push({ x: a.x + ((b.x - a.x) * i) / steps, z: a.z + ((b.z - a.z) * i) / steps });
    }
    a = b;
  }
  return points;
}

describe('GridNavigator', () => {
  it('walks straight to a target in plain sight', () => {
    const navigator = new GridNavigator(new NavGrid(area, 0.5, [], 0));
    expect(navigator.findPath(1.2, 1.3, 15.6, 7.1)).toEqual([{ x: 15.6, z: 7.1 }]);
  });

  it('goes round a wall through its gap, never through the wall', () => {
    const navigator = new GridNavigator(new NavGrid(area, 0.5, wall, 0.5));
    const from = { x: 2, z: 2 };
    const path = navigator.findPath(from.x, from.z, 2, 18);
    expect(path).not.toBeNull();
    const points = trace(from, path as NavPoint[]);
    expect(points.some((p) => p.z > 9 && p.z < 11 && p.x > 16 && p.x < 18)).toBe(true);
    for (const p of points) for (const o of wall) expect(distanceToObstacle(o, p.x, p.z)).toBeGreaterThan(0.3);
    expect((path as NavPoint[]).at(-1)).toEqual({ x: 2, z: 18 });
    // Smoothed: a handful of straight legs, not one waypoint per cell.
    expect((path as NavPoint[]).length).toBeLessThan(8);
  });

  it('takes the shortest way round', () => {
    const navigator = new GridNavigator(new NavGrid(area, 0.5, wall, 0.5));
    const path = navigator.findPath(17, 2, 17, 18) as NavPoint[];
    const length = trace({ x: 17, z: 2 }, path).length * 0.05;
    expect(length).toBeLessThan(17);
  });

  it('returns null when the target is walled off', () => {
    const sealed = [{ x: 10, z: 10, halfWidth: 10, halfDepth: 1, rotation: 0 }];
    const navigator = new GridNavigator(new NavGrid(area, 0.5, sealed, 0.5));
    expect(navigator.findPath(2, 2, 2, 18)).toBeNull();
  });

  it('starts from the nearest walkable cell when standing against an obstacle', () => {
    const navigator = new GridNavigator(new NavGrid(area, 0.5, wall, 0.5));
    const path = navigator.findPath(5, 8.8, 5, 2);
    expect(path?.at(-1)).toEqual({ x: 5, z: 2 });
  });

  it('measures distance to a turned obstacle in its own frame', () => {
    const plank = { x: 0, z: 0, halfWidth: 2, halfDepth: 0.1, rotation: Math.PI / 2 };
    expect(distanceToObstacle(plank, 0, 1.9)).toBe(0);
    expect(distanceToObstacle(plank, 1.1, 0)).toBeCloseTo(1);
  });

  it('picks reproducible random points, all on the largest connected area', () => {
    const sealed = [{ x: 10, z: 5.5, halfWidth: 10, halfDepth: 0.5, rotation: 0 }];
    const navigator = new GridNavigator(new NavGrid(area, 0.5, sealed, 0.5));
    const a = new SeededRandom(1);
    const b = new SeededRandom(1);
    for (let i = 0; i < 200; i++) {
      const p = navigator.randomPoint(a);
      expect(p.z).toBeGreaterThan(6.5);
      expect(navigator.randomPoint(b)).toEqual(p);
    }
  });
});
