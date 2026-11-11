import type { RoadNetwork } from './RoadNetwork';
import type { TownPlot } from './TownPlot';
import type { TownRoad } from './TownRoad';
import type { TownWall } from './TownWall';

/** Town plan in town-local coordinates. Pure data. */
export interface TownLayout {
  /** Side length of the square the town occupies, wall included. */
  size: number;
  /** Half the side of the paved central square. */
  plazaHalfSize: number;
  /** Streets as polylines and the square as a polygon; everything else is placed relative to these. */
  network: RoadNetwork;
  /** The streets' segments as axis-aligned strips (what the road mesh draws). */
  roads: TownRoad[];
  wall: TownWall;
  buildings: TownPlot[];
  props: TownPlot[];
}
