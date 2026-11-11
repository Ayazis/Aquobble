import { texelCentre, texelOf, type DensityGrid } from './DensityGrid';
import type { GrassBlocker } from './GrassBlocker';
import { growthAt } from './growthAt';

/**
 * `growthAt` for every texel of the grid, row-major (index j * resolution + i, j along z). Each blocker only
 * visits the texels within its own reach, so thousands of blockers bake in a fraction of a second.
 */
export function rasterGrowth(grid: DensityGrid, blockers: readonly GrassBlocker[], feather: number): Float32Array {
  const n = grid.resolution;
  const out = new Float32Array(n * n).fill(1);
  for (const b of blockers) {
    const reach = (b.kind === 'circle' ? b.radius : Math.hypot(b.halfWidth, b.halfDepth)) + (b.feather ?? feather);
    const [i0, i1] = span(grid, b.x, reach);
    const [j0, j1] = span(grid, b.z, reach);
    for (let j = j0; j <= j1; j++) {
      const z = texelCentre(grid, j);
      for (let i = i0; i <= i1; i++) {
        const k = j * n + i;
        if (out[k] > 0) out[k] = Math.min(out[k], growthAt([b], feather, texelCentre(grid, i), z));
      }
    }
  }
  return out;
}

function span(grid: DensityGrid, centre: number, reach: number): [number, number] {
  const last = grid.resolution - 1;
  return [Math.max(texelOf(grid, centre - reach), 0), Math.min(texelOf(grid, centre + reach), last)];
}
