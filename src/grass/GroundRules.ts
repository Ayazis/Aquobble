import type { ExclusionZone } from '@vegetation';

/** Where grass and flowers may grow. */
export interface GroundRules {
  /** Lowest ground height (e.g. water level + a beach margin). */
  minHeight: number;
  maxHeight: number;
  /** Max slope as rise over run (1 = 45 degrees). */
  maxSlope: number;
  exclude?: readonly ExclusionZone[];
}
