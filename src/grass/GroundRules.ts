import type { ExclusionZone } from '@vegetation';
import type { GrassBlocker } from './GrassBlocker';

/** Where grass and flowers may grow. */
export interface GroundRules {
  /** Lowest ground height (e.g. water level + a beach margin). */
  minHeight: number;
  maxHeight: number;
  /** Max slope as rise over run (1 = 45 degrees). */
  maxSlope: number;
  exclude?: readonly ExclusionZone[];
  /** Footprints, roads, ponds: no grass on them, thinner and shorter grass near them. */
  blockers?: readonly GrassBlocker[];
  /** Width (m) of the thinning band around each blocker that sets no `feather` of its own. */
  feather?: number;
  /** Mown ground (yards, verges, the foot of the wall): tufts are scaled down here. */
  lawns?: readonly ExclusionZone[];
  /** Tree cover at (x, z) in [0, 1] (1 under a closed canopy): grass there is short, dark and sparse. */
  canopyAt?: (x: number, z: number) => number;
}
