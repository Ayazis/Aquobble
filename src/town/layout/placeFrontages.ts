import type { Random } from '@core';
import type { Occupancy } from './Occupancy';
import type { RoadNetwork } from './RoadNetwork';
import { sizedPlot } from './sizedPlot';
import { reversed, streetLength, vergePoint } from './streetPath';
import type { TownAssetId } from './townAssetSizes';
import { TOWN_ASSET_SIZES } from './townAssetSizes';
import type { TownPlot } from './TownPlot';

/** A row of buildings along one side of a street, in order from the square (or from the gate). */
export interface Frontage {
  street: string;
  side: 1 | -1;
  /** Walk the row in from the gate instead of out from the square. */
  fromGate?: boolean;
  /** Fixed set-back (m) instead of the seeded one, for a building with a forecourt. */
  setback?: number;
  buildings: TownAssetId[];
}

/** Set-back from the paving edge to the house front, and the gap between neighbours (m). */
const SETBACK = [0.5, 1.0] as const;
const GAP = [0.6, 1.6] as const;
/** How far a building slides along the street when its spot is taken. */
const STEP = 0.5;

/**
 * Lines each frontage's buildings up along its street, fronts (doors) to the road, with a seeded set-back
 * and gap. A building whose spot is taken slides on along the street; one that runs out of street is left out.
 */
export function placeFrontages(
  network: RoadNetwork,
  frontages: readonly Frontage[],
  space: Occupancy,
  random: Random,
): TownPlot[] {
  const placed: TownPlot[] = [];
  for (const row of frontages) {
    const found = network.streets.find((s) => s.name === row.street);
    if (!found) throw new Error(`no street ${row.street}`);
    const street = row.fromGate ? reversed(found) : found;
    const side = row.fromGate ? (-row.side as 1 | -1) : row.side;
    const length = streetLength(street);
    let d = 0;
    for (const id of row.buildings) {
      const { width, depth } = TOWN_ASSET_SIZES[id];
      const setback = row.setback ?? random.range(...SETBACK);
      for (; d + width <= length; d += STEP) {
        const at = vergePoint(street, d + width / 2, side, setback + depth / 2);
        const plot = sizedPlot(id, at.x, at.z, at.facing);
        if (!space.take(plot, false)) continue;
        placed.push(plot);
        d += width + random.range(...GAP);
        break;
      }
    }
  }
  return placed;
}
