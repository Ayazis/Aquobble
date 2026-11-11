import { GroundShade } from '@terrain';
import { stampTownShade } from './stampTownShade';

describe('stampTownShade', () => {
  it('darkens the ground at and just around each footprint, wider for big ones', () => {
    const shade = new GroundShade(100, 1000);
    stampTownShade(shade, [
      { x: 0, z: 0, halfWidth: 3, halfDepth: 2, rotation: 0 },
      { x: 20, z: 0, halfWidth: 0.3, halfDepth: 0.3, rotation: 0 },
    ]);
    expect(shade.at(2.9, 0)).toBeCloseTo(0.6, 1);
    expect(shade.at(3.5, 0)).toBeGreaterThan(0.05);
    expect(shade.at(20.7, 0)).toBe(0);
    expect(shade.at(20.25, 0)).toBeGreaterThan(0.3);
    expect(shade.at(10, 0)).toBe(0);
  });
});
