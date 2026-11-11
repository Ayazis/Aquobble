import type { Vec3 } from '@core';

/** A chimney top that emits smoke, in world space. `phase` in [0, 1) staggers it against its neighbours. */
export interface SmokeSource {
  position: Vec3;
  phase: number;
}
