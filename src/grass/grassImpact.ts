import type { BendStamp } from './BendStamp';

/** Falling faster than this (m/s) and then stopping is a landing. */
const LAND_SPEED = 3;
/** Fall speed (m/s) of the hardest impact; faster falls splay the grass no wider. */
const HARD_SPEED = 12;

/**
 * The impact stamp for a mover at (x, z) whose vertical speed went from `before` to `now` within a frame, or
 * null if it did not just land. A harder landing flattens a wider ring of grass, further over.
 */
export function grassImpact(x: number, z: number, before: number, now: number, radius: number): BendStamp | null {
  if (before > -LAND_SPEED || now < -1) return null;
  const hard = Math.min((-before - LAND_SPEED) / (HARD_SPEED - LAND_SPEED), 1);
  return { x, z, radius: radius * (1.8 + 1.6 * hard), strength: 0.8 + 0.45 * hard, vx: 0, vz: 0, burst: 1 };
}
