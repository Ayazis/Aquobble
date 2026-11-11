/** One soft disc pressed into the bend map this frame: centre, radius, strength and the mover's velocity. */
export interface BendStamp {
  x: number;
  z: number;
  radius: number;
  /** How hard the disc pushes (running pushes harder than walking). */
  strength: number;
  vx: number;
  vz: number;
}

/** Most stamps one frame takes (size of the update shader's uniform arrays). */
export const MAX_BEND_STAMPS = 16;

/** Speed (m/s) at which a mover pushes at full strength. */
const RUN_SPEED = 7;

/** Stamp strength for a mover at `speed`: standing still barely presses, running parts the grass hardest. */
export function stampStrength(speed: number): number {
  return 0.45 + 0.65 * Math.min(speed / RUN_SPEED, 1);
}

/**
 * Packs up to MAX_BEND_STAMPS stamps into the shader arrays (`discs` as x, z, radius, strength; `motion`
 * as vx, vz, 0, 0) and clears the rest. Returns how many were written.
 */
export function packStamps(stamps: readonly BendStamp[], discs: Float32Array, motion: Float32Array): number {
  const n = Math.min(stamps.length, MAX_BEND_STAMPS);
  discs.fill(0);
  motion.fill(0);
  for (let i = 0; i < n; i++) {
    const s = stamps[i];
    discs.set([s.x, s.z, s.radius, s.strength], i * 4);
    motion.set([s.vx, s.vz], i * 4);
  }
  return n;
}

/** Snaps a box centre to whole texels so the map scrolls without smearing. */
export function snapToTexel(value: number, boxSize: number, resolution: number): number {
  const texel = boxSize / resolution;
  return Math.round(value / texel) * texel;
}
