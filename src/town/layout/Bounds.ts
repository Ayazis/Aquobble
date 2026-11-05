import type { TownPlot } from './TownPlot';
import type { TownRoad } from './TownRoad';

/** Axis-aligned rectangle on the ground plane. */
export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Axis-aligned bounds of a plot's rotated footprint. */
export function plotBounds({ x, z, rotation, footprint }: TownPlot): Bounds {
  const c = Math.abs(Math.cos(rotation));
  const s = Math.abs(Math.sin(rotation));
  const hx = (footprint.width * c + footprint.depth * s) / 2;
  const hz = (footprint.width * s + footprint.depth * c) / 2;
  return { minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz };
}

/** Bounds of an axis-aligned road strip. */
export function roadBounds({ from, to, width }: TownRoad): Bounds {
  const hx = from.x === to.x ? width / 2 : 0;
  const hz = from.z === to.z ? width / 2 : 0;
  return {
    minX: Math.min(from.x, to.x) - hx,
    maxX: Math.max(from.x, to.x) + hx,
    minZ: Math.min(from.z, to.z) - hz,
    maxZ: Math.max(from.z, to.z) + hz,
  };
}

/** True when the rectangles share area (touching edges do not count). */
export function overlaps(a: Bounds, b: Bounds): boolean {
  return a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ;
}
