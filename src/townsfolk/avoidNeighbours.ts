import type { NavPoint } from '@navigation';
import type { Townsfolk } from './Townsfolk';

/** Other characters closer than this (m, centre to centre) are steered around. */
const AVOID_RADIUS = 1.6;
/** How hard a neighbour at touching distance pushes, relative to the walking speed. */
const PUSH = 1.2;
/** Share of the push turned sideways (to the walker's right), so two walkers head-on pass each other. */
const SIDESTEP = 0.6;

/**
 * Bends a walker's velocity (`folk.moveX/moveZ`) away from the characters in front of it, keeping its
 * speed. `others` may include the walker's own position object `self`, which is skipped.
 */
export function avoidNeighbours(folk: Townsfolk, self: NavPoint, others: readonly NavPoint[]): void {
  const speed = Math.hypot(folk.moveX, folk.moveZ);
  if (speed === 0) return;
  const dirX = folk.moveX / speed;
  const dirZ = folk.moveZ / speed;
  let pushX = 0;
  let pushZ = 0;
  for (const other of others) {
    if (other === self) continue;
    const dx = self.x - other.x;
    const dz = self.z - other.z;
    const distance = Math.hypot(dx, dz);
    if (distance >= AVOID_RADIUS || distance === 0) continue;
    // Only what lies ahead matters; someone behind will sort themselves out.
    if (-(dx * dirX + dz * dirZ) <= 0) continue;
    const strength = (1 - distance / AVOID_RADIUS) * PUSH;
    pushX += (dx / distance) * strength + -dirZ * strength * SIDESTEP;
    pushZ += (dz / distance) * strength + dirX * strength * SIDESTEP;
  }
  if (pushX === 0 && pushZ === 0) return;
  const x = dirX + pushX;
  const z = dirZ + pushZ;
  const length = Math.hypot(x, z);
  if (length < 1e-6) return;
  folk.moveX = (x / length) * speed;
  folk.moveZ = (z / length) * speed;
}
