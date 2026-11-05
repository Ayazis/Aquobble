import type { Vec3 } from '@core';
import type { Bird } from './Bird';

/** Component: a flock of birds circling a point. Pure data, stepped by `FlockSystem`. */
export interface Flock {
  birds: Bird[];
  /** Centre of the circle the flock orbits (y is the cruising height). */
  center: Vec3;
  radius: number;
  /** Angular speed of the orbit target in rad/s (sign sets the direction). */
  orbitSpeed: number;
  /** Current angle of the orbit target. */
  angle: number;
  speed: number;
  minHeight: number;
  maxHeight: number;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    flock?: Flock;
  }
}
