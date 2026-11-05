import type { Footprint } from '../layout/Footprint';

/**
 * Uniform scale for a model of `size` on a plot of `footprint`: real-world size, shrunk only when it would
 * spill over the plot horizontally, so neighbouring plots never overlap.
 */
export function fitScale(size: Footprint, footprint: Footprint): number {
  const width = size.width > 0 ? footprint.width / size.width : 1;
  const depth = size.depth > 0 ? footprint.depth / size.depth : 1;
  return Math.min(1, width, depth);
}
