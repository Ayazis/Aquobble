/** A square grid of texels over the island, centred on the origin. */
export interface DensityGrid {
  /** World size (m) the grid covers. */
  size: number;
  /** Texels per side. */
  resolution: number;
}

/** World coordinate of the centre of texel `i` along one axis. */
export function texelCentre(grid: DensityGrid, i: number): number {
  return -grid.size / 2 + ((i + 0.5) * grid.size) / grid.resolution;
}

/** Texel index containing world coordinate `v` along one axis (may fall outside the grid). */
export function texelOf(grid: DensityGrid, v: number): number {
  return Math.floor(((v + grid.size / 2) / grid.size) * grid.resolution);
}
