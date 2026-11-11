import type { Random } from '@core';
import type { HeightSampler, Pond } from '@terrain';
import type { RockPlacement } from './RockPlacement';

/** Chance that a pond gets a line of stepping stones. */
const POND_CHANCE = 0.6;
/** Metres between stone centres along the line, and how far a stone strays sideways from it. */
const SPACING = 1.05;
const WANDER = 0.18;
/** Stone size (scale, m): a slab this size is about 1 m long and 0.7 m wide. */
const MIN_SCALE = 0.36;
const MAX_SCALE = 0.46;
/** The flat top stands this far (m) above the pond's surface. */
const TOP_ABOVE_WATER = 0.07;
/** Slab extents in units of scale x squash: the cap cut sits about this high, the bottom cut this low. */
const SLAB_TOP = 0.3;
const SLAB_BOTTOM = 0.34;
/** The stone goes at least this far (m) into the pond floor; it is stretched down to get there. */
const BEDDED = 0.08;
const MAX_SQUASH = 8;

/**
 * Lines of flat slabs across some ponds, from shore to shore through near the middle, their tops just
 * clear of the water. Each slab is stretched downwards to stand on the pond floor.
 */
export function placeSteppingStones(
  ground: HeightSampler,
  random: Random,
  ponds: readonly Pond[],
  variants: number,
): RockPlacement[] {
  const stones: RockPlacement[] = [];
  for (const pond of ponds) {
    if (random.next() > POND_CHANCE) continue;
    const heading = random.range(0, Math.PI);
    const dx = Math.cos(heading);
    const dz = Math.sin(heading);
    // The line passes a little off centre, so it is not a ruler-straight diameter.
    const offset = random.range(-0.25, 0.25) * pond.radius;
    const half = Math.sqrt(pond.radius * pond.radius - offset * offset) - 0.6;
    const count = Math.max(2, Math.floor((half * 2) / SPACING) + 1);
    for (let i = 0; i < count; i++) {
      const along = -half + (i * half * 2) / (count - 1);
      const side = offset + random.range(-WANDER, WANDER);
      const x = pond.x + dx * along - dz * side;
      const z = pond.z + dz * along + dx * side;
      const scale = random.range(MIN_SCALE, MAX_SCALE);
      const depth = pond.level + TOP_ABOVE_WATER + BEDDED - ground.heightAt(x, z);
      if (depth <= 0) continue;
      const squash = Math.min(MAX_SQUASH, Math.max(0.6, depth / ((SLAB_TOP + SLAB_BOTTOM) * scale)));
      stones.push({
        x,
        y: pond.level + TOP_ABOVE_WATER - SLAB_TOP * scale * squash,
        z,
        // A slab's long side is its local x, which a turn of `yaw` about +y points along (cos, -sin):
        // laid across the line, as if for walking.
        yaw: Math.PI / 2 - heading + random.range(-0.25, 0.25),
        tilt: random.range(-0.03, 0.03),
        scale,
        squash,
        family: 'slab',
        variant: Math.min(variants - 1, Math.floor(random.next() * variants)),
      });
    }
  }
  return stones;
}
