import { DEFAULT_ROAD_NETWORK as network, roadStrips } from './defaultRoadNetwork';
import { rectsOverlap } from './GroundRect';
import { gateEnds, insideSquare, junctions } from './roadJunctions';
import { pointAlong, reversed, streetLength, vergePoint } from './streetPath';
import type { TownStreet } from './TownStreet';

const bent: TownStreet = {
  name: 'bent',
  kind: 'path',
  width: 2,
  points: [
    { x: 0, z: 0 },
    { x: 0, z: 4 },
    { x: 3, z: 4 },
  ],
};

describe('road network helpers', () => {
  it('measures and walks a polyline', () => {
    expect(streetLength(bent)).toBe(7);
    expect(pointAlong(bent, 2)).toMatchObject({ x: 0, z: 2, dirX: 0, dirZ: 1 });
    expect(pointAlong(bent, 5)).toMatchObject({ x: 1, z: 4, dirX: 1, dirZ: 0 });
    expect(pointAlong(bent, 99)).toMatchObject({ x: 3, z: 4 });
  });

  it('offsets to either verge and faces the road', () => {
    const right = vergePoint(bent, 2, 1, 0.5);
    expect(right.x).toBeCloseTo(1.5);
    expect(Math.sin(right.facing)).toBeCloseTo(-1); // front turned west, towards the road
    expect(vergePoint(bent, 2, -1, 0.5).x).toBeCloseTo(-1.5);
    expect(vergePoint(reversed(bent), 5, -1, 0)).toMatchObject({ x: 1, z: 2 });
  });

  it('finds the junctions at the square and the road ends at the gates', () => {
    expect(junctions(network)).toHaveLength(4);
    expect(
      gateEnds(network)
        .map((g) => g.gate)
        .sort(),
    ).toEqual(['east', 'north', 'south', 'west']);
    expect(insideSquare(network, { x: 1, z: 1 })).toBe(true);
    expect(insideSquare(network, { x: 9, z: 0 })).toBe(false);
  });

  it('has main streets and lanes, cut into axis-aligned strips', () => {
    const strips = roadStrips(network);
    expect(new Set(strips.map((s) => s.kind))).toEqual(new Set(['main', 'lane']));
    expect(strips.every((s) => s.from.x === s.to.x || s.from.z === s.to.z)).toBe(true);
  });

  it('tells turned rectangles apart', () => {
    const a = { x: 0, z: 0, halfWidth: 1, halfDepth: 0.2, rotation: Math.PI / 4 };
    expect(rectsOverlap(a, { x: 0.9, z: 0.9, halfWidth: 0.3, halfDepth: 0.3, rotation: 0 })).toBe(false);
    expect(rectsOverlap(a, { x: 0.5, z: -0.5, halfWidth: 0.3, halfDepth: 0.3, rotation: 0 })).toBe(true);
  });
});
