import { GroundShade } from './GroundShade';
import { stampRectangle } from './stampRectangle';

describe('stampRectangle', () => {
  it('shades the whole rectangle, eases out over the margin and leaves the canopy alone', () => {
    const shade = new GroundShade(100, 500);
    stampRectangle(shade, { x: 10, z: -4, halfWidth: 3, halfDepth: 1, rotation: 0 }, 1, 0.6);
    expect(shade.at(10, -4)).toBeCloseTo(0.6, 1);
    expect(shade.at(12.9, -3.1)).toBeCloseTo(0.6, 1);
    const edge = shade.at(13.5, -4);
    expect(edge).toBeGreaterThan(0.05);
    expect(edge).toBeLessThan(0.55);
    expect(shade.at(14.2, -4)).toBe(0);
    expect(shade.at(10, -4, 'canopy')).toBe(0);
  });

  it('turns with the rectangle', () => {
    const shade = new GroundShade(100, 500);
    // A quarter turn puts the long side along z.
    stampRectangle(shade, { x: 0, z: 0, halfWidth: 3, halfDepth: 0.5, rotation: Math.PI / 2 }, 0.5, 1);
    expect(shade.at(0, 2.5)).toBeGreaterThan(0.9);
    expect(shade.at(2.5, 0)).toBe(0);
  });

  it('clips at the edge of the map', () => {
    const shade = new GroundShade(10, 50);
    expect(() => stampRectangle(shade, { x: 5, z: 5, halfWidth: 4, halfDepth: 4, rotation: 0.3 }, 2, 1)).not.toThrow();
    expect(shade.at(4.9, 4.9)).toBeGreaterThan(0.9);
  });
});
