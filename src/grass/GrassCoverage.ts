import { texelOf, type DensityGrid } from './DensityGrid';

/**
 * A coarse map of where the baked density map (see `bakeGrassDensity`) grows any grass at all, so tiles over
 * sea, sand and paving are never drawn.
 */
export class GrassCoverage {
  private readonly cells: Uint8Array;
  private readonly grid: DensityGrid;

  /** `cell` is the side of a coarse cell in metres. */
  constructor(density: Uint8Array, source: DensityGrid, cell = 4) {
    const resolution = Math.max(1, Math.ceil(source.size / cell));
    this.grid = { size: source.size, resolution };
    this.cells = new Uint8Array(resolution * resolution);
    const n = source.resolution;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = (j * n + i) * 4;
        if (density[k] === 0 || density[k + 1] === 0) continue;
        const ci = Math.floor((i * resolution) / n);
        const cj = Math.floor((j * resolution) / n);
        this.cells[cj * resolution + ci] = 1;
      }
    }
  }

  /** Whether any grass grows in the square from (minX, minZ) with side `size`, or within `margin` of it. */
  any(minX: number, minZ: number, size: number, margin = 1): boolean {
    const last = this.grid.resolution - 1;
    const clamp = (v: number) => Math.min(Math.max(v, 0), last);
    if (minX - margin > this.grid.size / 2 || minX + size + margin < -this.grid.size / 2) return false;
    if (minZ - margin > this.grid.size / 2 || minZ + size + margin < -this.grid.size / 2) return false;
    const i0 = clamp(texelOf(this.grid, minX - margin));
    const i1 = clamp(texelOf(this.grid, minX + size + margin));
    const j0 = clamp(texelOf(this.grid, minZ - margin));
    const j1 = clamp(texelOf(this.grid, minZ + size + margin));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) if (this.cells[j * this.grid.resolution + i]) return true;
    }
    return false;
  }
}
