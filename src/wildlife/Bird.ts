import type { Vec3 } from '@core';

/** One bird in a flock: where it is, where it is heading, and where in its wingbeat it is. */
export interface Bird {
  position: Vec3;
  velocity: Vec3;
  /** Wingbeat phase offset in radians, so birds do not flap in unison. */
  flapPhase: number;
}
