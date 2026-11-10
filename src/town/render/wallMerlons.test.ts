import { describe, expect, it } from 'vitest';
import { wallMerlons } from './wallMerlons';

const wall = { halfSize: 24, thickness: 1.4, height: 3.5, gates: [{ side: 'north' as const, width: 4 }] };

describe('wallMerlons', () => {
  it('sits on top of the wall on all four sides', () => {
    const merlons = wallMerlons(wall);
    expect(merlons.length).toBeGreaterThan(60);
    for (const m of merlons) {
      expect(m.center.y - m.half.y).toBeCloseTo(wall.height);
      expect(Math.max(Math.abs(m.center.x), Math.abs(m.center.z))).toBeCloseTo(wall.halfSize);
    }
  });

  it('leaves the gatehouse clear', () => {
    const overGate = wallMerlons(wall).filter((m) => m.center.z === wall.halfSize && Math.abs(m.center.x) < 5);
    expect(overGate).toHaveLength(0);
  });
});
