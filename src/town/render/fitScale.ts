import type { Footprint } from '../layout/Footprint';

/**
 * Uniform scale for a model of `size` on a plot of `footprint`: scaled to the plot's height, so models from
 * different packs agree on size, but shrunk when that would spill over the plot horizontally, so
 * neighbouring plots never overlap.
 */
export function fitScale(size: Footprint, footprint: Footprint): number {
  const ratio = (want: number, have: number) => (have > 0 ? want / have : 1);
  return Math.min(
    ratio(footprint.height, size.height),
    ratio(footprint.width, size.width),
    ratio(footprint.depth, size.depth),
  );
}
