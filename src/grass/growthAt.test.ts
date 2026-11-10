import { distanceTo, growthAt } from './growthAt';
import type { GrassBlocker } from './GrassBlocker';

describe('growthAt', () => {
  const pond: GrassBlocker = { kind: 'circle', x: 0, z: 0, radius: 4 };
  const shed: GrassBlocker = { kind: 'rect', x: 20, z: 0, halfWidth: 2, halfDepth: 1, rotation: Math.PI / 2 };

  it('measures distance to circles, so a pond leaves no bare corners', () => {
    expect(distanceTo(pond, 2, 0)).toBe(0);
    expect(distanceTo(pond, 3.5, 3.5)).toBeCloseTo(Math.hypot(3.5, 3.5) - 4);
  });

  it('measures distance to turned rectangles', () => {
    // Turned a quarter: 1 m half-extent along x, 2 m along z.
    expect(distanceTo(shed, 20.9, 1.9)).toBe(0);
    expect(distanceTo(shed, 22, 0)).toBeCloseTo(1);
    expect(distanceTo(shed, 20, 3)).toBeCloseTo(1);
  });

  it('is 0 on a blocker, 1 beyond the feather and rises in between', () => {
    expect(growthAt([pond, shed], 2, 1, 1)).toBe(0);
    expect(growthAt([pond, shed], 2, 10, 0)).toBe(1);
    const near = growthAt([pond], 2, 4.5, 0);
    const far = growthAt([pond], 2, 5.5, 0);
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(far);
    expect(far).toBeLessThan(1);
  });

  it("uses a blocker's own feather instead of the shared one", () => {
    const road: GrassBlocker = { ...shed, feather: 0.4 };
    expect(growthAt([shed], 2, 22, 0)).toBeLessThan(1);
    expect(growthAt([road], 2, 22, 0)).toBe(1);
    expect(growthAt([road], 2, 21.2, 0)).toBeLessThan(1);
  });
});
