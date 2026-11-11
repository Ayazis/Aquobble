import { SeededRandom } from '@core';
import { buildTownLayout } from './buildTownLayout';
import { DEFAULT_TOWN_LAYOUT as town } from './defaultTownLayout';
import { doorPoint, doorZone } from './doorZone';
import { distanceToRect, plotRect, rectsOverlap, roadRect } from './GroundRect';
import { distanceToSquareEdge, insideSquare } from './roadJunctions';
import type { TownPlot } from './TownPlot';

const roads = town.roads.map(roadRect);
const label = (p: TownPlot) => `${p.assetId} at (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`;
const onRoad = (x: number, z: number) => roads.some((r) => distanceToRect(r, x, z) === 0);
/** Distance from a point to the nearest paving edge (road strip or square outline). */
const toPaving = (x: number, z: number) =>
  Math.min(distanceToSquareEdge(town.network, { x, z }), ...roads.map((r) => distanceToRect(r, x, z)));
const fronting = town.buildings.filter((b) => !['well', 'market_stall', 'windmill', 'watchtower'].includes(b.assetId));
const of = (id: string) => town.props.filter((p) => p.assetId === id);

describe('village layout rules', () => {
  it('stands every lantern and bench within 1.5 m of a paving edge, beside the road and not on it', () => {
    for (const p of [...of('lantern_post'), ...of('bench')]) {
      expect(toPaving(p.x, p.z), label(p)).toBeLessThanOrEqual(1.5);
      expect(onRoad(p.x, p.z), label(p)).toBe(false);
    }
  });

  it('puts lanterns at the square corners and both sides of every gate', () => {
    const lamps = of('lantern_post');
    for (const c of town.network.square) expect(lamps.some((l) => Math.hypot(l.x - c.x, l.z - c.z) < 1)).toBe(true);
    expect(lamps.filter((l) => Math.max(Math.abs(l.x), Math.abs(l.z)) > town.wall.halfSize - 2.5)).toHaveLength(8);
    expect(lamps.length).toBeLessThanOrEqual(18);
  });

  it('keeps every prop off the roads, out of doorways and clear of every other plot', () => {
    const doors = fronting.map(doorZone);
    const all = [...town.buildings, ...town.props];
    for (const p of town.props) {
      const r = plotRect(p);
      expect(
        roads.some((road) => rectsOverlap(road, r)),
        label(p),
      ).toBe(false);
      expect(
        doors.some((d) => rectsOverlap(d, r)),
        label(p),
      ).toBe(false);
      for (const q of all) if (q !== p) expect(rectsOverlap(plotRect(q), r), `${label(p)} vs ${label(q)}`).toBe(false);
    }
  });

  it('turns every building door towards a road', () => {
    expect(fronting.length).toBeGreaterThanOrEqual(8);
    for (const b of fronting) {
      const d = doorPoint(b, 3.2);
      expect(onRoad(d.x, d.z) || insideSquare(town.network, d), label(b)).toBe(true);
    }
  });

  it('gives landmarks the square and workshops a gate', () => {
    const near = (id: string, limit: number, far: boolean) => {
      const b = town.buildings.find((p) => p.assetId === id);
      expect(b, id).toBeDefined();
      const edge = Math.max(Math.abs(b?.x ?? 0), Math.abs(b?.z ?? 0)) + 0;
      if (far) expect(edge, id).toBeGreaterThan(limit);
      else expect(Math.min(Math.abs(b?.x ?? 99), Math.abs(b?.z ?? 99)), id).toBeLessThan(limit);
    };
    near('tavern', 16, false);
    near('chapel', 9, false);
    near('blacksmith', 15, true);
  });

  it('is the same town for the same seed', () => {
    const a = buildTownLayout(new SeededRandom(5).fork('town-layout'));
    expect(buildTownLayout(new SeededRandom(5).fork('town-layout'))).toEqual(a);
  });
});
