import type { WindDirection } from './WindDirection';

/**
 * Port: the one wind field shared by grass, tree crowns, smoke, clouds and water.
 * `t` is seconds of game time (the same clock `WindSystem` feeds the shaders as `uWindTime`).
 */
export interface Wind {
  /** Unit horizontal direction the wind blows towards. */
  direction(t: number): WindDirection;
  /** Base strength in [0, 1]: 0 still air, 1 a strong breeze. Follows the hour of day. */
  strength(t: number): number;
  /** Extra push in [0, 1] from gust fronts crossing the world at (x, z); scaled by strength. */
  gust(x: number, z: number, t: number): number;
}
