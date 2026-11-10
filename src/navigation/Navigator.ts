import type { Random } from '@core';
import type { NavPoint } from './NavPoint';

/** Finds walkable routes on the ground. Characters depend on this, never on a concrete grid or search. */
export interface Navigator {
  /**
   * Waypoints to walk through, in order, from (fromX, fromZ) to as close to (toX, toZ) as can be reached,
   * the start itself left out. Null when there is no route.
   */
  findPath(fromX: number, fromZ: number, toX: number, toZ: number): NavPoint[] | null;
  /** A random walkable point that every other such point can be reached from. */
  randomPoint(random: Random): NavPoint;
}
