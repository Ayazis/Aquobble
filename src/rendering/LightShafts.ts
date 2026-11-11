import type { Vec3 } from '@core';

/** Lane D2: god rays around the sun, retuned through the day. A no-op where the pass is off (phones). */
export interface LightShafts {
  /** `direction`: unit vector towards the sun; `color` 0xRRGGBB; `strength` 0 = none. */
  setLightShafts(direction: Vec3, color: number, strength: number): void;
}
