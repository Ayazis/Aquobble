import type { Vec3 } from '@core';

/** Shading parameters shared by every water surface. */
export interface WaterLook {
  sunDirection: Vec3;
  sunColor: number;
  waterColor: number;
  distortionScale: number;
}
