import type { GroundPoint } from './GroundPoint';
import type { WallSide } from './TownWall';

/** Main street (the busy cross), lane (quieter side street) or path (a footpath out to a gate). */
export type RoadKind = 'main' | 'lane' | 'path';

/**
 * A road as a polyline from the square outwards. Side +1 is to the right of the walking direction seen from
 * above with +x east and +z north (heading north, +1 is east); -1 is the other verge.
 */
export interface TownStreet {
  name: string;
  kind: RoadKind;
  width: number;
  points: GroundPoint[];
  /** The gate this street ends in, if any (its last point lies in the gateway). */
  gate?: WallSide;
}
