import type { Vec3 } from '@core';
import { MAX_GRASS_BENDERS } from './WindSway';

/**
 * Writes up to MAX_GRASS_BENDERS positions into `out` as (x, y, z, radius) and clears the rest.
 * Returns how many were written.
 */
export function packBenders(positions: Iterable<Vec3>, radius: number, out: Float32Array): number {
  let n = 0;
  for (const p of positions) {
    if (n >= MAX_GRASS_BENDERS) break;
    out.set([p.x, p.y, p.z, radius], n * 4);
    n++;
  }
  out.fill(0, n * 4);
  return n;
}
