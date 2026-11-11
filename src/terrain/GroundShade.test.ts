import { GroundShade } from './GroundShade';

describe('GroundShade', () => {
  it('darkens a soft disc and nothing outside it', () => {
    const shade = new GroundShade(100, 200);
    shade.stamp(10, -20, 4, 0.6);
    expect(shade.at(10, -20)).toBeCloseTo(0.6, 1);
    expect(shade.at(13, -20)).toBeGreaterThan(0);
    expect(shade.at(13, -20)).toBeLessThan(0.5);
    expect(shade.at(15, -20)).toBe(0);
    expect(shade.at(10, -20, 'canopy')).toBe(0);
  });

  it('adds overlapping stamps up without passing full shade', () => {
    const shade = new GroundShade(100, 200);
    for (let i = 0; i < 10; i++) shade.stamp(0, 0, 3, 0.7, 'canopy');
    expect(shade.at(0, 0, 'canopy')).toBeGreaterThan(0.95);
    expect(shade.at(0, 0, 'canopy')).toBeLessThanOrEqual(1);
  });

  it('ignores stamps off the map', () => {
    const shade = new GroundShade(100, 64);
    shade.stamp(500, 500, 5, 1);
    expect(shade.data.every((v) => v === 0)).toBe(true);
    expect(shade.at(500, 500)).toBe(0);
  });
});
