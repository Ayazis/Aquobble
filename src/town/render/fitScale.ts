import type { Footprint } from '../layout/Footprint';

/**
 * Uniform scale for a model of `size` on a plot of `footprint`.
 * - `fill` (buildings): scale to the plot's height, so a town of models from different packs agrees on size.
 * - otherwise (props): keep real-world size.
 * Either way the result is shrunk when the model would spill over the plot horizontally, so neighbouring
 * plots never overlap.
 */
export function fitScale(size: Footprint, footprint: Footprint, fill = false): number {
  const ratio = (want: number, have: number) => (have > 0 ? want / have : 1);
  const preferred = fill ? ratio(footprint.height, size.height) : 1;
  return Math.min(preferred, ratio(footprint.width, size.width), ratio(footprint.depth, size.depth));
}
