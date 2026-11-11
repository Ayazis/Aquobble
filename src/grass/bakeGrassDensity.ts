import type { HeightSampler } from '@terrain';
import { texelCentre, type DensityGrid } from './DensityGrid';
import { grassDensityAt } from './grassDensityAt';
import type { GroundRules } from './GroundRules';
import { rasterGrowth } from './rasterGrowth';

/**
 * Bakes the grass rules into RGBA bytes over the grid (row-major, j along z): R = density, G = height scale,
 * B = dryness, A = forest (see `grassDensityAt`). The grass shader only reads this; the rules stay in TS.
 */
export function bakeGrassDensity(ground: HeightSampler, rules: GroundRules, grid: DensityGrid): Uint8Array {
  const n = grid.resolution;
  const growth = rasterGrowth(grid, rules.blockers ?? [], rules.feather ?? 1.5);
  const out = new Uint8Array(n * n * 4);
  const byte = (v: number) => Math.round(Math.min(Math.max(v, 0), 1) * 255);
  for (let j = 0; j < n; j++) {
    const z = texelCentre(grid, j);
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const d = grassDensityAt(ground, rules, texelCentre(grid, i), z, growth[k]);
      out[k * 4] = byte(d.density);
      out[k * 4 + 1] = byte(d.height);
      out[k * 4 + 2] = byte(d.dryness);
      out[k * 4 + 3] = byte(d.forest);
    }
  }
  return out;
}
