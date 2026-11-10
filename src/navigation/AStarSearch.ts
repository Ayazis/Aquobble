import { MinHeap } from './MinHeap';
import type { NavGrid } from './NavGrid';

const DIAGONAL = Math.SQRT2;
/** Neighbour offsets: the four straight steps, then the four diagonals. */
const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

/**
 * A* over a NavGrid with eight-way steps; diagonals never cut a blocked corner. Keeps its working arrays
 * between searches, so a search allocates nothing but the resulting path.
 */
export class AStarSearch {
  private readonly cost: Float32Array;
  private readonly parent: Int32Array;
  /** Search number that last touched a cell (reached) or finished it (closed); avoids clearing arrays. */
  private readonly reached: Uint32Array;
  private readonly closed: Uint32Array;
  private readonly open = new MinHeap();
  private search = 0;

  constructor(private readonly grid: NavGrid) {
    this.cost = new Float32Array(grid.size);
    this.parent = new Int32Array(grid.size);
    this.reached = new Uint32Array(grid.size);
    this.closed = new Uint32Array(grid.size);
  }

  /** Cell indices from `start` to `goal` inclusive (both must be walkable), or null when not connected. */
  find(start: number, goal: number): number[] | null {
    const { grid, cost, parent, reached, closed, open } = this;
    const { cols } = grid;
    const goalCol = goal % cols;
    const goalRow = (goal - goalCol) / cols;
    const search = ++this.search;
    open.clear();
    cost[start] = 0;
    parent[start] = -1;
    reached[start] = search;
    open.push(start, 0);

    while (open.length > 0) {
      const current = open.pop();
      if (current === goal) return this.trace(goal);
      if (closed[current] === search) continue;
      closed[current] = search;
      const col = current % cols;
      const row = (current - col) / cols;
      for (const [dc, dr] of STEPS) {
        const nc = col + dc;
        const nr = row + dr;
        if (!grid.isWalkable(nc, nr)) continue;
        const diagonal = dc !== 0 && dr !== 0;
        if (diagonal && !(grid.isWalkable(nc, row) && grid.isWalkable(col, nr))) continue;
        const next = nr * cols + nc;
        if (closed[next] === search) continue;
        const g = cost[current] + (diagonal ? DIAGONAL : 1);
        if (reached[next] === search && g >= cost[next]) continue;
        cost[next] = g;
        parent[next] = current;
        reached[next] = search;
        // Octile distance: exact for eight-way movement on an open grid, so the search stays optimal.
        const dx = Math.abs(nc - goalCol);
        const dz = Math.abs(nr - goalRow);
        open.push(next, g + Math.max(dx, dz) + (DIAGONAL - 1) * Math.min(dx, dz));
      }
    }
    return null;
  }

  private trace(goal: number): number[] {
    const path: number[] = [];
    for (let cell = goal; cell !== -1; cell = this.parent[cell]) path.push(cell);
    return path.reverse();
  }
}
