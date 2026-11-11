import type { Random } from '@core';
import type { RockPlacement } from './RockPlacement';
import type { RockSiter, RockSiteRules } from './RockSiter';

export interface OutcropOptions extends RockSiteRules {
  /** Rock faces to place on the steepest ground found. */
  outcrops: number;
  /** Half-width of the square area to search. */
  extent: number;
}

/** Ground gentler than this (rise over run) never gets an outcrop. */
const MIN_SLOPE = 0.45;
/** Metres between outcrops. */
const SPACING = 14;
const CANDIDATES_PER_OUTCROP = 25;

/**
 * Rock faces for the steepest ground: a few large, deep-set blocks side by side, with scree (small stones)
 * strewn down the slope below them.
 */
export function placeOutcrops(siter: RockSiter, random: Random, options: OutcropOptions): RockPlacement[] {
  const candidates: { x: number; z: number; slope: number }[] = [];
  for (let i = 0; i < options.outcrops * CANDIDATES_PER_OUTCROP; i++) {
    const x = random.range(-options.extent, options.extent);
    const z = random.range(-options.extent, options.extent);
    const slope = siter.slope(x, z);
    if (slope >= MIN_SLOPE && siter.allowed(x, z, options)) candidates.push({ x, z, slope });
  }
  candidates.sort((a, b) => b.slope - a.slope);
  const sites: typeof candidates = [];
  for (const c of candidates) {
    if (sites.length >= options.outcrops) break;
    if (sites.every((s) => Math.hypot(s.x - c.x, s.z - c.z) >= SPACING)) sites.push(c);
  }

  const placements: RockPlacement[] = [];
  const add = (rock: RockPlacement | null) => rock && placements.push(rock);
  for (const { x, z, slope } of sites) {
    const [gx, gz] = siter.gradient(x, z);
    const down = [-gx / slope, -gz / slope];
    const across = [-down[1], down[0]];
    const blocks = 2 + Math.floor(random.next() * 3);
    for (let i = 0; i < blocks; i++) {
      // Side by side along the contour, so the blocks read as one broken face.
      const along = (i - (blocks - 1) / 2) * random.range(1.8, 2.8);
      const out = random.range(-1, 1);
      add(
        siter.rockAt(x + across[0] * along + down[0] * out, z + across[1] * along + down[1] * out, 'outcrop', options),
      );
    }
    const scree = 5 + Math.floor(random.next() * 5);
    for (let i = 0; i < scree; i++) {
      const fall = random.range(2.5, 9);
      const side = random.range(-1, 1) * (1.5 + fall * 0.35);
      add(siter.rockAt(x + down[0] * fall + across[0] * side, z + down[1] * fall + across[1] * side, 'scree', options));
    }
  }
  return placements;
}
