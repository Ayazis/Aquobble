import type { TownPlot } from './TownPlot';
import type { TownRoad } from './TownRoad';

/** A rectangle on the ground (town-local), turned by `rotation` (yaw) around its centre. */
export interface GroundRect {
  x: number;
  z: number;
  halfWidth: number;
  halfDepth: number;
  rotation: number;
}

/** A plot's true footprint as a turned rectangle. */
export function plotRect({ x, z, rotation, footprint }: TownPlot): GroundRect {
  return { x, z, rotation, halfWidth: footprint.width / 2, halfDepth: footprint.depth / 2 };
}

/** An axis-aligned road strip as a rectangle. */
export function roadRect({ from, to, width }: TownRoad): GroundRect {
  const alongX = from.z === to.z;
  const half = (alongX ? Math.abs(to.x - from.x) : Math.abs(to.z - from.z)) / 2;
  return {
    x: (from.x + to.x) / 2,
    z: (from.z + to.z) / 2,
    rotation: 0,
    halfWidth: alongX ? half : width / 2,
    halfDepth: alongX ? width / 2 : half,
  };
}

type Axis = [number, number];
const axes = (r: GroundRect): [Axis, Axis] => [
  [Math.cos(r.rotation), -Math.sin(r.rotation)],
  [Math.sin(r.rotation), Math.cos(r.rotation)],
];

/** True when the turned rectangles share area (separating axis test; touching edges do not count). */
export function rectsOverlap(a: GroundRect, b: GroundRect): boolean {
  const aAxes = axes(a);
  const bAxes = axes(b);
  const [dx, dz] = [b.x - a.x, b.z - a.z];
  const reach = (r: GroundRect, [rx, rz]: [Axis, Axis], [ux, uz]: Axis) =>
    r.halfWidth * Math.abs(rx[0] * ux + rx[1] * uz) + r.halfDepth * Math.abs(rz[0] * ux + rz[1] * uz);
  for (const u of [...aAxes, ...bAxes]) {
    if (Math.abs(dx * u[0] + dz * u[1]) >= reach(a, aAxes, u) + reach(b, bAxes, u) - 1e-6) return false;
  }
  return true;
}

/** The rectangle's four corners. */
export function rectCorners(r: GroundRect): { x: number; z: number }[] {
  const [[xx, xz], [zx, zz]] = axes(r);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sz]) => ({
    x: r.x + xx * r.halfWidth * sx + zx * r.halfDepth * sz,
    z: r.z + xz * r.halfWidth * sx + zz * r.halfDepth * sz,
  }));
}

/** Shortest distance from a point to the rectangle (0 inside). */
export function distanceToRect(r: GroundRect, x: number, z: number): number {
  const [[xx, xz], [zx, zz]] = axes(r);
  const [dx, dz] = [x - r.x, z - r.z];
  const u = Math.max(0, Math.abs(dx * xx + dz * xz) - r.halfWidth);
  const v = Math.max(0, Math.abs(dx * zx + dz * zz) - r.halfDepth);
  return Math.hypot(u, v);
}
