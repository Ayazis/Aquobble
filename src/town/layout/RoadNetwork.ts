import type { GroundPoint } from './GroundPoint';
import type { TownStreet } from './TownStreet';

/** The town's roads as data: streets as polylines, and the paved square as a polygon (counter-clockwise). */
export interface RoadNetwork {
  streets: TownStreet[];
  square: GroundPoint[];
}
