import type { Vec3 } from '@core';

/**
 * Port: the water surface's wave motion, so simulation (buoyancy, wading, floating things) can ask
 * where the surface is. Heights are offsets from the still water level; `t` is the water shader's time.
 */
export interface WaveField {
  /** Surface height offset at world (x, z) and time t. */
  waveHeightAt(x: number, z: number, t: number): number;
  /** Unit surface normal at world (x, z) and time t. */
  waveNormalAt(x: number, z: number, t: number): Vec3;
}
