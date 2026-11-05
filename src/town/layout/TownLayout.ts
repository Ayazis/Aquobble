import type { TownPlot } from './TownPlot';
import type { TownRoad } from './TownRoad';
import type { TownWall } from './TownWall';

/** Handmade town plan in town-local coordinates. Pure data. */
export interface TownLayout {
  /** Side length of the square the town occupies, wall included. */
  size: number;
  /** Half the side of the paved central square. */
  plazaHalfSize: number;
  roads: TownRoad[];
  wall: TownWall;
  buildings: TownPlot[];
  props: TownPlot[];
}
