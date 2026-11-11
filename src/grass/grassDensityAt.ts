import type { HeightSampler } from '@terrain';
import { canGrow } from './canGrow';
import { dryness } from './dryness';
import type { GroundRules } from './GroundRules';
import { patchiness } from './patchiness';

/** Share of tufts kept even on the thinnest patch, so bare ground never shows as a hole. */
const PATCH_FLOOR = 0.3;
/** Tuft height on mown ground. */
const LAWN_SCALE = 0.75;
/** Under a closed canopy: share of tufts kept, and their height. */
const FOREST_KEEP = 0.35;
const FOREST_SCALE = 0.55;
/** Height (m) where hill grass starts getting shorter, over how many metres, and how short it gets. */
const HILL_FROM = 7;
const HILL_OVER = 6;
const HILL_SCALE = 0.6;

/** What grass is like at one spot of the island; all in [0, 1]. */
export interface GrassDensity {
  /** Share of tufts that grow here. */
  density: number;
  /** Tuft height as a share of the tallest meadow grass. */
  height: number;
  dryness: number;
  /** 0 open meadow, 1 forest floor. */
  forest: number;
}

const NONE: GrassDensity = { density: 0, height: 0, dryness: 0, forest: 0 };

/**
 * The grass rules at (x, z), given the blocker `growth` there (see `growthAt`): nothing where plants cannot
 * grow, thin and short towards blockers, in patches, short on lawns and hills, sparse and short under trees.
 */
export function grassDensityAt(
  ground: HeightSampler,
  rules: GroundRules,
  x: number,
  z: number,
  growth: number,
): GrassDensity {
  if (growth <= 0) return NONE;
  const y = canGrow(ground, rules, x, z);
  if (y === null) return NONE;
  const thick = patchiness(x, z);
  const canopy = rules.canopyAt?.(x, z) ?? 0;
  const lawn = (rules.lawns ?? []).some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ);
  const hill = Math.min(Math.max((y - HILL_FROM) / HILL_OVER, 0), 1);
  const height =
    (0.35 + 0.65 * growth) *
    (0.8 + 0.2 * thick) *
    (lawn ? LAWN_SCALE : 1) *
    (1 - (1 - FOREST_SCALE) * canopy) *
    (1 - (1 - HILL_SCALE) * hill);
  const density = growth * (PATCH_FLOOR + (1 - PATCH_FLOOR) * thick) * (1 - (1 - FOREST_KEEP) * canopy);
  return { density, height, dryness: dryness(x, z, y), forest: canopy };
}
