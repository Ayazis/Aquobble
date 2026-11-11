import { vec3 } from '@core';
import { DEFAULT_TOWN_LAYOUT as layout } from './layout/defaultTownLayout';
import { townObstacles } from './townObstacles';

const town = { layout, origin: vec3(100, 4, -50), buildings: [], props: [] };
const covers = (x: number, z: number) =>
  townObstacles(town).some((o) => {
    const [dx, dz] = [x - o.x, z - o.z];
    const [cos, sin] = [Math.cos(o.rotation), Math.sin(o.rotation)];
    return Math.abs(dx * cos - dz * sin) < o.halfWidth && Math.abs(dx * sin + dz * cos) < o.halfDepth;
  });

describe('townObstacles', () => {
  it('covers buildings, props and the wall, in world coordinates', () => {
    expect(covers(100, -50)).toBe(true); // the well in the middle of the square
    expect(covers(100 + 14.5, -50 + 14.5)).toBe(true); // tavern
    expect(covers(100 + 12, -50 + layout.wall.halfSize)).toBe(true); // north wall
    expect(covers(0, 0)).toBe(false);
  });

  it('turns footprints with their plots', () => {
    // The chapel faces east: its 10.12 m depth lies along x, its 8.78 m width along z.
    const chapel = layout.buildings.find((b) => b.assetId === 'chapel');
    if (!chapel) throw new Error('no chapel');
    expect(covers(100 + chapel.x + 4.8, -50 + chapel.z)).toBe(true);
    expect(covers(100 + chapel.x, -50 + chapel.z + 4.8)).toBe(false);
  });

  it('leaves the lanes and the gateways open', () => {
    expect(covers(100, -50 + 12)).toBe(false);
    for (const [x, z] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      expect(covers(100 + x * layout.wall.halfSize, -50 + z * layout.wall.halfSize)).toBe(false);
    }
  });
});
