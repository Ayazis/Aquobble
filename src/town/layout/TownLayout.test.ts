import { overlaps, plotBounds, roadBounds, type Bounds } from './Bounds';
import { DEFAULT_TOWN_LAYOUT as town } from './defaultTownLayout';
import { TOWN_ASSET_SIZES, type TownAssetId } from './townAssetSizes';
import type { TownPlot } from './TownPlot';

const inner = town.wall.halfSize - town.wall.thickness / 2;
const inside = (b: Bounds) => b.minX > -inner && b.maxX < inner && b.minZ > -inner && b.maxZ < inner;
const label = (p: TownPlot) => `${p.assetId} at (${p.x}, ${p.z})`;
const everything = [...town.buildings, ...town.props];

describe('DEFAULT_TOWN_LAYOUT', () => {
  it('is a compact ~52 x 52 m village with over twenty buildings and a well in the middle', () => {
    expect(town.size).toBeLessThanOrEqual(52);
    expect(town.wall.halfSize * 2).toBeLessThanOrEqual(town.size);
    expect(town.buildings.length).toBeGreaterThanOrEqual(20);
    expect(town.buildings.some((b) => b.assetId === 'well' && b.x === 0 && b.z === 0)).toBe(true);
    expect(town.roads.length).toBeGreaterThanOrEqual(3);
  });

  it('has no overlapping building plots', () => {
    const { buildings } = town;
    for (let i = 0; i < buildings.length; i++) {
      for (let j = i + 1; j < buildings.length; j++) {
        const hit = overlaps(plotBounds(buildings[i]), plotBounds(buildings[j]));
        expect(hit, `${label(buildings[i])} vs ${label(buildings[j])}`).toBe(false);
      }
    }
  });

  it('keeps every plot and prop inside the wall', () => {
    for (const plot of everything) expect(inside(plotBounds(plot)), label(plot)).toBe(true);
  });

  it('keeps roads clear of buildings and props', () => {
    for (const plot of everything) {
      for (const road of town.roads) expect(overlaps(plotBounds(plot), roadBounds(road)), label(plot)).toBe(false);
    }
  });

  it('keeps props off building plots', () => {
    for (const prop of town.props) {
      for (const b of town.buildings) {
        expect(overlaps(plotBounds(prop), plotBounds(b)), `${label(prop)} vs ${label(b)}`).toBe(false);
      }
    }
  });

  it('keeps props from overlapping each other', () => {
    const { props } = town;
    for (let i = 0; i < props.length; i++) {
      for (let j = i + 1; j < props.length; j++) {
        const hit = overlaps(plotBounds(props[i]), plotBounds(props[j]));
        expect(hit, `${label(props[i])} vs ${label(props[j])}`).toBe(false);
      }
    }
  });

  it('gives every copy of an asset the same true size', () => {
    for (const plot of everything) {
      expect(plot.footprint, label(plot)).toBe(TOWN_ASSET_SIZES[plot.assetId as TownAssetId]);
    }
  });

  it('has a gate wider than the road for every road', () => {
    expect(town.wall.gates.length).toBe(town.roads.length);
    for (const gate of town.wall.gates) expect(gate.width).toBeGreaterThan(town.roads[0].width);
  });
});
