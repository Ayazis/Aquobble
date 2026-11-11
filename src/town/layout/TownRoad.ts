import type { RoadKind } from './TownStreet';

/** A straight, axis-aligned road strip between two town-local points: one segment of a `TownStreet`. */
export interface TownRoad {
  from: { x: number; z: number };
  to: { x: number; z: number };
  width: number;
  kind?: RoadKind;
}
