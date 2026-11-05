import type { Vec3 } from '@core';

/**
 * Unit direction towards the sun at `time` of day (0.25 sunrise, 0.5 noon, 0.75 sunset).
 * The sun peaks at `noonElevationDeg` above the horizon and swings 180° of azimuth from rise to set.
 */
export function sunDirectionAt(time: number, noonAzimuthDeg: number, noonElevationDeg: number): Vec3 {
  const toRad = Math.PI / 180;
  const elevation = Math.sin(2 * Math.PI * (time - 0.25)) * noonElevationDeg * toRad;
  const azimuth = (noonAzimuthDeg + (time - 0.5) * 360) * toRad;
  return {
    x: Math.cos(elevation) * Math.sin(azimuth),
    y: Math.sin(elevation),
    z: Math.cos(elevation) * Math.cos(azimuth),
  };
}
