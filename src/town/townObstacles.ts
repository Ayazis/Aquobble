import type { TownPlot } from './layout/TownPlot';
import type { PlacedTown } from './PlacedTown';
import type { Box } from './render/Box';
import { wallBoxes } from './render/wallBoxes';

/** Anything whose underside is above this (m) can be walked under, like a gate's lintel. */
const HEADROOM = 2.2;

/** A rectangle of ground (world x/z) nobody can walk through, turned by `rotation` around +y. */
export interface TownObstacle {
  x: number;
  z: number;
  halfWidth: number;
  halfDepth: number;
  rotation: number;
}

/**
 * Everything solid in the town as ground rectangles: each building and prop footprint, and the wall with
 * its towers and gate posts. Gateways stay open.
 */
export function townObstacles(town: PlacedTown): TownObstacle[] {
  const { origin, layout } = town;
  const plot = ({ x, z, rotation, footprint }: TownPlot): TownObstacle => ({
    x: origin.x + x,
    z: origin.z + z,
    halfWidth: footprint.width / 2,
    halfDepth: footprint.depth / 2,
    rotation,
  });
  const wall = ({ center, half }: Box): TownObstacle => ({
    x: origin.x + center.x,
    z: origin.z + center.z,
    halfWidth: half.x,
    halfDepth: half.z,
    rotation: 0,
  });
  return [
    ...[...layout.buildings, ...layout.props].map(plot),
    ...wallBoxes(layout.wall)
      .filter(({ center, half }) => center.y - half.y < HEADROOM)
      .map(wall),
  ];
}
