import { stampRectangle, type GroundShade } from '@terrain';
import type { TownObstacle } from '@town';

/** How dark the ground gets right at a footprint's edge (0..1), like a rock's contact patch. */
const STRENGTH = 0.6;
/** The patch reaches this share of a footprint's smaller half-size beyond it, within these limits (m). */
const REACH = 1.2;
const MIN_MARGIN = 0.35;
const MAX_MARGIN = 0.9;

/** Stamps a soft contact patch around every building, prop and run of wall into the ground shade map. */
export function stampTownShade(shade: GroundShade, obstacles: readonly TownObstacle[]): void {
  for (const o of obstacles) {
    const margin = Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, Math.min(o.halfWidth, o.halfDepth) * REACH));
    stampRectangle(shade, o, margin, STRENGTH);
  }
}
