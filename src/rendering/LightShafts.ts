import type { Vec3 } from '@core';

/** Lane D2: god rays around the sun, retuned through the day. A no-op where the pass is off (phones). */
export interface LightShafts {
  /** `direction`: unit vector towards the sun; `color` linear RGB; `strength` 0 = none. */
  setLightShafts(direction: Vec3, color: readonly [number, number, number], strength: number): void;
}
