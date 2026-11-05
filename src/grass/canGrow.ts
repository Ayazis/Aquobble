import type { HeightSampler } from '@terrain';
import type { GroundRules } from './GroundRules';

const STEP = 0.5;

/** Ground height at (x, z) if plants may grow there, otherwise null. */
export function canGrow(ground: HeightSampler, rules: GroundRules, x: number, z: number): number | null {
  const { minHeight, maxHeight, maxSlope, exclude = [] } = rules;
  if (exclude.some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ)) return null;
  const y = ground.heightAt(x, z);
  if (y < minHeight || y > maxHeight) return null;
  const dx = (ground.heightAt(x + STEP, z) - ground.heightAt(x - STEP, z)) / (2 * STEP);
  const dz = (ground.heightAt(x, z + STEP) - ground.heightAt(x, z - STEP)) / (2 * STEP);
  if (Math.hypot(dx, dz) > maxSlope) return null;
  return y;
}
