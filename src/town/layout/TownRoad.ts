/** A straight, axis-aligned road strip between two town-local points. */
export interface TownRoad {
  from: { x: number; z: number };
  to: { x: number; z: number };
  width: number;
}
