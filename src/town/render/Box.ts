import type { Vec3 } from '@core';

/** An axis-aligned box in some local frame: centre and half extents. */
export interface Box {
  center: Vec3;
  half: Vec3;
}
