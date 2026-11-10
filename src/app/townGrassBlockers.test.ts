import { DEFAULT_TOWN_LAYOUT, type PlacedTown } from '@town';
import { growthAt } from '@grass';
import { townGrassBlockers } from './townGrassBlockers';

describe('townGrassBlockers', () => {
  const town: PlacedTown = { layout: DEFAULT_TOWN_LAYOUT, origin: { x: 100, y: 0, z: 50 }, buildings: [], props: [] };
  const blockers = townGrassBlockers(town, []);
  const growth = (x: number, z: number) => growthAt(blockers, 1.5, 100 + x, 50 + z);
  const road = DEFAULT_TOWN_LAYOUT.roads[0];
  const midZ = (road.from.z + road.to.z) / 2;
  const plaza = DEFAULT_TOWN_LAYOUT.plazaHalfSize;

  it('blocks the plaza and roads but leaves the rest of the town open', () => {
    expect(growth(0, 0)).toBe(0);
    expect(growth(road.to.x, midZ)).toBe(0);
    const half = DEFAULT_TOWN_LAYOUT.wall.halfSize;
    expect(growth(half / 2, half / 2)).toBe(1);
  });

  it('lets grass grow at full strength into the frayed edge of roads and the square', () => {
    expect(growth(road.to.x + road.width / 2 - 0.2, midZ)).toBe(1);
    expect(growth(plaza - 0.2, plaza - 0.2)).toBe(1);
    expect(growth(plaza - 0.2, plaza / 2)).toBe(1);
  });

  it('keeps the wheel ruts and the inside of the square bare', () => {
    expect(growth(road.to.x + 0.75, midZ)).toBe(0);
    expect(growth(plaza - 0.8, plaza - 0.8)).toBe(0);
  });

  it('leaves no grass where a road runs in under the edge of the square', () => {
    expect(growth(road.from.x, road.from.z - 0.3)).toBe(0);
    expect(growth(road.from.x, road.from.z - 0.65)).toBe(0);
  });
});
