import type { GrassBlocker } from './GrassBlocker';

/** Distance (m) from (x, z) to the blocker's edge; 0 inside it. */
export function distanceTo(b: GrassBlocker, x: number, z: number): number {
  const dx = x - b.x;
  const dz = z - b.z;
  if (b.kind === 'circle') return Math.max(Math.hypot(dx, dz) - b.radius, 0);
  const c = Math.cos(b.rotation);
  const s = Math.sin(b.rotation);
  const lx = Math.abs(dx * c - dz * s) - b.halfWidth;
  const lz = Math.abs(dx * s + dz * c) - b.halfDepth;
  return Math.hypot(Math.max(lx, 0), Math.max(lz, 0));
}

/**
 * How fully grass grows at (x, z): 0 on a blocker, rising smoothly to 1 at `feather` metres from the
 * nearest blocker edge (or at the blocker's own `feather`, when it has one).
 */
export function growthAt(blockers: readonly GrassBlocker[], feather: number, x: number, z: number): number {
  let growth = 1;
  for (const b of blockers) {
    const d = distanceTo(b, x, z);
    if (d <= 0) return 0;
    const band = b.feather ?? feather;
    if (d < band) {
      const t = d / band;
      growth = Math.min(growth, t * t * (3 - 2 * t));
    }
  }
  return growth;
}
