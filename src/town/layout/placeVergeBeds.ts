import type { Random } from '@core';
import { doorPaths } from './doorPaths';
import { distanceToRect, plotRect, type GroundRect } from './GroundRect';
import { streetLength, vergePoint } from './streetPath';
import type { TownLayout } from './TownLayout';

/** A bed on a verge: a clump of flowers on the lawn, or a wooden planter box. Town-local. */
export interface VergeBed {
  kind: 'flowers' | 'planter';
  x: number;
  z: number;
  /** Yaw turning the bed's long side along the road. */
  facing: number;
  /** Picks petal colours and size, in [0, 1). */
  variant: number;
}

/** Step (m) between candidate spots along each street, how far beyond the paving they sit, and the odds. */
const STEP = 2;
const OFFSET = [0.3, 1] as const;
const FLOWER_ODDS = 0.55;
const PLANTER_ODDS = 0.1;
/** Clearance (m) from footprints, worn door tracks and the wall. */
const CLEAR = 0.35;
const WALL_IN = 2;

/**
 * Flowers and the odd planter on the strip of lawn between road and house front, never on a door's track,
 * a footprint, the square or against the wall.
 */
export function placeVergeBeds(layout: TownLayout, random: Random): VergeBed[] {
  const blocked: GroundRect[] = [...layout.buildings, ...layout.props].map(plotRect);
  const tracks = doorPaths(layout);
  const edge = layout.size / 2 - WALL_IN;
  const square = layout.plazaHalfSize + 0.5;
  const beds: VergeBed[] = [];
  for (const street of layout.network.streets) {
    const length = streetLength(street);
    for (let d = STEP / 2; d < length; d += STEP) {
      for (const side of [1, -1] as const) {
        const roll = random.next();
        if (roll >= FLOWER_ODDS + PLANTER_ODDS) continue;
        const p = vergePoint(street, d, side, random.range(OFFSET[0], OFFSET[1]));
        if (Math.abs(p.x) > edge || Math.abs(p.z) > edge) continue;
        if (Math.abs(p.x) < square && Math.abs(p.z) < square) continue;
        if (blocked.some((r) => distanceToRect(r, p.x, p.z) < CLEAR)) continue;
        if (tracks.some((r) => distanceToRect(r, p.x, p.z) < CLEAR)) continue;
        const kind = roll < PLANTER_ODDS ? 'planter' : 'flowers';
        beds.push({ kind, x: p.x, z: p.z, facing: p.facing, variant: random.next() });
      }
    }
  }
  return beds;
}
