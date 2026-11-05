import type { Vec3 } from '@core';

/**
 * Unit vector from the pivot towards the camera for a yaw/pitch. Yaw 0 puts the camera on +z, looking
 * along -z; positive pitch raises the camera above the pivot.
 */
export function orbitDirection(yaw: number, pitch: number): Vec3 {
  const horizontal = Math.cos(pitch);
  return { x: Math.sin(yaw) * horizontal, y: Math.sin(pitch), z: Math.cos(yaw) * horizontal };
}

/** Camera position at `distance` from `pivot` along the orbit direction. */
export function followPosition(pivot: Vec3, yaw: number, pitch: number, distance: number): Vec3 {
  const d = orbitDirection(yaw, pitch);
  return { x: pivot.x + d.x * distance, y: pivot.y + d.y * distance, z: pivot.z + d.z * distance };
}

/**
 * Distance to keep the camera at so it stays in front of whatever the ray from the pivot hit.
 * `hit` is the ray hit distance (null = clear); `margin` keeps the near plane out of the surface.
 */
export function unobstructedDistance(wanted: number, hit: number | null, margin: number, min: number): number {
  if (hit === null || hit >= wanted) return wanted;
  return Math.max(hit - margin, min);
}

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
