import type { Vec3 } from '@core';

/** Which way the free camera is asked to move: each axis in -1..1. */
export interface FlyInput {
  forward: number;
  right: number;
  up: number;
}

/**
 * Moves a camera `position` and its look `target` together: forward/right follow the horizontal view
 * direction, up is world up. Returns the offset applied (the pose is changed in place).
 */
export function flyStep(position: Vec3, target: Vec3, input: FlyInput, distance: number): Vec3 {
  const dx = target.x - position.x;
  const dz = target.z - position.z;
  const length = Math.hypot(dx, dz) || 1;
  const fx = dx / length;
  const fz = dz / length;
  const offset = {
    x: (fx * input.forward - fz * input.right) * distance,
    y: input.up * distance,
    z: (fz * input.forward + fx * input.right) * distance,
  };
  for (const point of [position, target]) {
    point.x += offset.x;
    point.y += offset.y;
    point.z += offset.z;
  }
  return offset;
}
