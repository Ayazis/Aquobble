import type { Random } from '@core';
import { AStarSearch } from './AStarSearch';
import type { NavGrid } from './NavGrid';
import type { Navigator } from './Navigator';
import type { NavPoint } from './NavPoint';
import { largestRegion } from './largestRegion';
import { hasLineOfSight, smoothPath } from './smoothPath';

/** How many rings of cells to look through for a walkable cell next to a blocked point. */
const SNAP_RINGS = 6;

/** Navigator over a NavGrid: A* between cells, smoothed into straight legs. */
export class GridNavigator implements Navigator {
  private readonly search: AStarSearch;
  /** Cells of the largest connected walkable region: the only places targets are picked from. */
  private readonly region: Int32Array;

  constructor(private readonly grid: NavGrid) {
    this.search = new AStarSearch(grid);
    this.region = largestRegion(grid);
  }

  findPath(fromX: number, fromZ: number, toX: number, toZ: number): NavPoint[] | null {
    const from = { x: fromX, z: fromZ };
    const to = { x: toX, z: toZ };
    const start = this.nearestWalkable(from);
    const goal = this.nearestWalkable(to);
    if (start === null || goal === null) return null;
    const cells = this.search.find(start, goal);
    if (!cells) return null;

    const points = cells.map((cell) => this.grid.center(cell));
    // Walk from and to the exact points rather than their cell centres where those are walkable.
    if (this.grid.isWalkableAt(fromX, fromZ)) points[0] = from;
    else points.unshift(from);
    const last = points[points.length - 1];
    if (this.grid.isWalkableAt(toX, toZ) && hasLineOfSight(this.grid, last, to)) points.push(to);
    return smoothPath(this.grid, points).slice(1);
  }

  randomPoint(random: Random): NavPoint {
    if (this.region.length === 0) throw new Error('The navigation grid has no walkable cell');
    const cell = this.region[Math.min(this.region.length - 1, Math.floor(random.next() * this.region.length))];
    return this.grid.center(cell);
  }

  /** The cell under the point, or the closest walkable one in the rings of cells around it. */
  private nearestWalkable(point: NavPoint): number | null {
    const { grid } = this;
    const col = grid.colAt(point.x);
    const row = grid.rowAt(point.z);
    if (grid.isWalkable(col, row)) return grid.index(col, row);
    for (let ring = 1; ring <= SNAP_RINGS; ring++) {
      let best: number | null = null;
      let bestDistance = Infinity;
      for (let dr = -ring; dr <= ring; dr++) {
        for (let dc = -ring; dc <= ring; dc++) {
          if (Math.max(Math.abs(dc), Math.abs(dr)) !== ring || !grid.isWalkable(col + dc, row + dr)) continue;
          const cell = grid.index(col + dc, row + dr);
          const c = grid.center(cell);
          const distance = Math.hypot(c.x - point.x, c.z - point.z);
          if (distance < bestDistance) [best, bestDistance] = [cell, distance];
        }
      }
      if (best !== null) return best;
    }
    return null;
  }
}
