import { distanceToObstacle, type NavObstacle } from './NavObstacle';
import type { NavPoint } from './NavPoint';
import type { NavRect } from './NavRect';

/**
 * Square cells over a rectangle of ground, each walkable or blocked. A cell is blocked when its centre is
 * within `clearance` of an obstacle, so a walker of that radius can stand on any walkable cell centre.
 */
export class NavGrid {
  readonly cols: number;
  readonly rows: number;
  private readonly blocked: Uint8Array;

  constructor(
    private readonly area: NavRect,
    readonly cellSize: number,
    obstacles: readonly NavObstacle[],
    clearance: number,
  ) {
    this.cols = Math.max(1, Math.round((area.maxX - area.minX) / cellSize));
    this.rows = Math.max(1, Math.round((area.maxZ - area.minZ) / cellSize));
    this.blocked = new Uint8Array(this.cols * this.rows);
    for (const o of obstacles) this.block(o, clearance);
  }

  get size(): number {
    return this.blocked.length;
  }

  index(col: number, row: number): number {
    return row * this.cols + col;
  }

  /** Column of world x, clamped to the grid. */
  colAt(x: number): number {
    return Math.min(this.cols - 1, Math.max(0, Math.floor((x - this.area.minX) / this.cellSize)));
  }

  /** Row of world z, clamped to the grid. */
  rowAt(z: number): number {
    return Math.min(this.rows - 1, Math.max(0, Math.floor((z - this.area.minZ) / this.cellSize)));
  }

  /** False for blocked cells and anything outside the grid. */
  isWalkable(col: number, row: number): boolean {
    return col >= 0 && row >= 0 && col < this.cols && row < this.rows && this.blocked[row * this.cols + col] === 0;
  }

  /** True when the world point lies on a walkable cell. */
  isWalkableAt(x: number, z: number): boolean {
    const { minX, maxX, minZ, maxZ } = this.area;
    return x >= minX && x < maxX && z >= minZ && z < maxZ && this.isWalkable(this.colAt(x), this.rowAt(z));
  }

  /** World position of a cell's centre. */
  center(index: number): NavPoint {
    const col = index % this.cols;
    const row = (index - col) / this.cols;
    return { x: this.area.minX + (col + 0.5) * this.cellSize, z: this.area.minZ + (row + 0.5) * this.cellSize };
  }

  private block(o: NavObstacle, clearance: number): void {
    // Only the cells around the obstacle can be within reach of it.
    const reach = Math.hypot(o.halfWidth, o.halfDepth) + clearance;
    const fromCol = Math.max(0, Math.floor((o.x - reach - this.area.minX) / this.cellSize));
    const toCol = Math.min(this.cols - 1, Math.floor((o.x + reach - this.area.minX) / this.cellSize));
    const fromRow = Math.max(0, Math.floor((o.z - reach - this.area.minZ) / this.cellSize));
    const toRow = Math.min(this.rows - 1, Math.floor((o.z + reach - this.area.minZ) / this.cellSize));
    for (let row = fromRow; row <= toRow; row++) {
      for (let col = fromCol; col <= toCol; col++) {
        const index = row * this.cols + col;
        const { x, z } = this.center(index);
        if (distanceToObstacle(o, x, z) < clearance) this.blocked[index] = 1;
      }
    }
  }
}
