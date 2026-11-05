import type { Random } from '@core';
import type { Townsfolk } from './Townsfolk';
import type { WanderArea } from './WanderArea';

/** Seconds per metre of straight-line distance allowed before a walk is abandoned (stuck on a wall). */
const PATIENCE_PER_METRE = 3;

/** Uniform random point inside the wander circle. */
export function pickWanderTarget(area: WanderArea, random: Random): { x: number; z: number } {
  const angle = random.range(0, Math.PI * 2);
  const distance = area.radius * Math.sqrt(random.next());
  return { x: area.x + Math.sin(angle) * distance, z: area.z + Math.cos(angle) * distance };
}

/**
 * Advances the wander state machine by `dt` from position (x, z) and returns the horizontal velocity
 * (m/s) to walk with: idle a few seconds, pick a target, walk to it, repeat.
 */
export function wanderStep(
  folk: Townsfolk,
  x: number,
  z: number,
  dt: number,
  area: WanderArea,
  random: Random,
): { x: number; z: number } {
  folk.timer -= dt;
  if (folk.state === 'idle') {
    if (folk.timer > 0) return { x: 0, z: 0 };
    const target = pickWanderTarget(area, random);
    folk.state = 'walking';
    folk.targetX = target.x;
    folk.targetZ = target.z;
    folk.timer = Math.hypot(target.x - x, target.z - z) * PATIENCE_PER_METRE + 1;
  }
  const dx = folk.targetX - x;
  const dz = folk.targetZ - z;
  const distance = Math.hypot(dx, dz);
  if (distance <= folk.arriveDistance || folk.timer <= 0) {
    folk.state = 'idle';
    folk.timer = random.range(folk.minIdle, folk.maxIdle);
    return { x: 0, z: 0 };
  }
  const scale = folk.walkSpeed / distance;
  return { x: dx * scale, z: dz * scale };
}
