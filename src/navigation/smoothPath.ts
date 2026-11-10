import type { NavGrid } from './NavGrid';
import type { NavPoint } from './NavPoint';

/** True when the straight segment a → b stays on walkable cells (sampled every quarter cell). */
export function hasLineOfSight(grid: NavGrid, a: NavPoint, b: NavPoint): boolean {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (grid.cellSize * 0.25)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!grid.isWalkableAt(a.x + dx * t, a.z + dz * t)) return false;
  }
  return true;
}

/**
 * Drops every point that can be skipped by walking straight to a later one, turning the staircase of grid
 * cells into a few straight legs. The first and last points are kept.
 */
export function smoothPath(grid: NavGrid, points: readonly NavPoint[]): NavPoint[] {
  if (points.length <= 2) return [...points];
  const result = [points[0]];
  let from = 0;
  while (from < points.length - 1) {
    let to = points.length - 1;
    while (to > from + 1 && !hasLineOfSight(grid, points[from], points[to])) to--;
    result.push(points[to]);
    from = to;
  }
  return result;
}
