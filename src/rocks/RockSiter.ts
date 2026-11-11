import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { RockFamily } from './RockFamily';
import type { RockPlacement } from './RockPlacement';

export interface RockSiteRules {
  /** Rocks below this height are skipped (under water). */
  waterLevel: number;
  /** Rocks above this height are skipped. */
  maxHeight: number;
  minScale: number;
  maxScale: number;
  /** Number of shapes per family to pick from. */
  variants: number;
  exclude?: readonly ExclusionZone[];
}

/** What a rock is doing where it lies; decides its family and size. */
export type RockRole = 'lead' | 'companion' | 'outcrop' | 'scree' | 'beach';

/** Height above the water (m) that counts as shore. */
export const SHORE_BAND = 1.5;
/** Pebbles lie flat, so they keep to ground gentler than this (rise over run). */
const PEBBLE_MAX_SLOPE = 0.35;
/**
 * Beaches here are steep (half the band above the waterline is steeper than 0.6 over a metre), so beach
 * pebbles accept far steeper ground than loose pebbles inland, and sink into it by the slope instead.
 */
const BEACH_PEBBLE_MAX_SLOPE = 1.2;
/** Share of a pebble cluster's size it sinks per unit of slope, so its downhill side does not float. */
const PEBBLE_SLOPE_SINK = 0.4;
/** Rocks smaller than this use the cheap `stone` shape. */
const STONE_BELOW = 0.9;
/** Share of the (squashed) unit shape's size that goes below ground. */
const SINK: Record<RockFamily, number> = { boulder: 0.2, stone: 0.25, slab: 0.12, pebbles: 0 };

/** Decides what kind of rock lies at a spot and how it sits in the ground. Pure logic, no rendering. */
export class RockSiter {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  allowed(x: number, z: number, rules: RockSiteRules): boolean {
    if ((rules.exclude ?? []).some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ)) return false;
    const y = this.ground.heightAt(x, z);
    return y >= rules.waterLevel && y <= rules.maxHeight;
  }

  /** Ground gradient (rise over run along x and z) from central differences, 1 m apart. */
  gradient(x: number, z: number): [dx: number, dz: number] {
    return [
      this.ground.heightAt(x + 0.5, z) - this.ground.heightAt(x - 0.5, z),
      this.ground.heightAt(x, z + 0.5) - this.ground.heightAt(x, z - 0.5),
    ];
  }

  slope(x: number, z: number): number {
    return Math.hypot(...this.gradient(x, z));
  }

  rockAt(x: number, z: number, role: RockRole, rules: RockSiteRules): RockPlacement | null {
    if (!this.allowed(x, z, rules)) return null;
    const ground = this.ground.heightAt(x, z);
    const slope = this.slope(x, z);
    const flat = slope < (role === 'beach' ? BEACH_PEBBLE_MAX_SLOPE : PEBBLE_MAX_SLOPE);
    const shore = ground - rules.waterLevel < SHORE_BAND;
    const scale = this.scaleFor(role, rules);
    const family = this.familyFor(role, scale, flat, shore);
    const pebbles = family === 'pebbles';
    const squash = pebbles ? 1 : this.random.range(0.7, 1);
    const size = pebbles ? this.random.range(0.7, 1.3) : scale;
    const sink = SINK[family] * (role === 'outcrop' ? 1.6 : 1) + (pebbles ? slope * PEBBLE_SLOPE_SINK : 0);
    return {
      x,
      // Embedded, not dropped: part of every rock is below the ground.
      y: ground - size * squash * sink,
      z,
      yaw: this.random.range(0, Math.PI * 2),
      tilt: pebbles ? 0 : this.random.range(-0.3, 0.3) * (role === 'outcrop' ? 1.5 : 1),
      scale: size,
      squash,
      family,
      variant: Math.min(rules.variants - 1, Math.floor(this.random.next() * rules.variants)),
    };
  }

  /** The cluster's lead rock is the big one, companions and scree are small, outcrops larger than anything loose. */
  private scaleFor(role: RockRole, { minScale, maxScale }: RockSiteRules): number {
    const span = maxScale - minScale;
    const t = this.random.next();
    if (role === 'outcrop') return maxScale * (0.9 + 0.8 * t);
    if (role === 'lead') return minScale + span * (0.4 + 0.6 * t);
    if (role === 'beach') return minScale + span * 0.2 * t;
    return minScale + span * 0.4 * t;
  }

  private familyFor(role: RockRole, scale: number, flat: boolean, shore: boolean): RockFamily {
    const pick = this.random.next();
    const solid: RockFamily = scale < STONE_BELOW ? 'stone' : 'boulder';
    if (role === 'outcrop') return pick < 0.45 ? 'slab' : 'boulder';
    if (role === 'beach') return flat && pick < 0.85 ? 'pebbles' : 'stone';
    if (role === 'lead') return pick < 0.3 ? 'slab' : solid;
    return this.looseFamily(pick, solid, flat, shore);
  }

  /** Companions and scree: pebbles where they can lie flat (more at the shore), the odd slab, else a solid rock. */
  private looseFamily(pick: number, solid: RockFamily, flat: boolean, shore: boolean): RockFamily {
    if (flat && pick < (shore ? 0.6 : 0.4)) return 'pebbles';
    return pick > 0.85 ? 'slab' : solid;
  }
}
