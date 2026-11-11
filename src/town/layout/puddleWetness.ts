import type { Puddle } from './Puddle';

/**
 * Wetness at a point (town-local): 1 at a puddle's middle, 0.4 on its rim, 0 a little beyond. The shader
 * cuts the water's edge along a noisy line near 0.4 and leaves a damp ring outside it.
 */
export function puddleWetness(puddles: readonly Puddle[], x: number, z: number): number {
  let wet = 0;
  for (const p of puddles) {
    const d = Math.hypot((x - p.x) / p.alongX, (z - p.z) / p.alongZ);
    wet = Math.max(wet, 1 - d * 0.6);
  }
  return wet;
}
