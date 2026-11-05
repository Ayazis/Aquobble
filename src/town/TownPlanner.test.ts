import { DEFAULT_TOWN_LAYOUT } from './layout/defaultTownLayout';
import { TownPlanner } from './TownPlanner';

const slope = { heightAt: (x: number) => x / 10 };
const site = { x: 10, z: -5, blend: 12, minLevel: 3 };
const planner = new TownPlanner(DEFAULT_TOWN_LAYOUT);

describe('TownPlanner', () => {
  it('flattens a region covering the whole town', () => {
    const region = planner.region(site);
    expect(region.centerX).toBe(10);
    expect(region.halfSize).toBeGreaterThanOrEqual(DEFAULT_TOWN_LAYOUT.size / 2);
    expect(region.blend).toBe(12);
  });

  it('levels at the mean ground height but not below minLevel', () => {
    expect(planner.level(slope, site)).toBeCloseTo(3); // mean is 1, clamped up
    expect(planner.level(slope, { ...site, x: 100 })).toBeCloseTo(10);
  });

  it('places plots in world space on the ground', () => {
    const town = planner.place(slope, site);
    const well = town.buildings.find((b) => b.plot.assetId === 'well');
    expect(well?.position).toEqual({ x: 10, y: 1, z: -5 });
    expect(town.props).toHaveLength(DEFAULT_TOWN_LAYOUT.props.length);
  });
});
