import type { Random } from '@core';
import type { HeightSampler, Pond } from '@terrain';
import { placeOutcrops } from './placeOutcrops';
import type { RockPlacement } from './RockPlacement';
import { RockSiter, SHORE_BAND, type RockSiteRules } from './RockSiter';
import { placeSteppingStones } from './placeSteppingStones';

export interface RockScatterOptions extends RockSiteRules {
  /** Number of clusters; each holds 1..clusterSize rocks. */
  clusters: number;
  clusterSize: number;
  /** Half-width of the square area to scatter in. */
  extent: number;
  /** Rock faces with scree on the steepest ground; none if unset. */
  outcrops?: number;
  /** Pebble clusters (and the odd stone) strewn along the beaches; none if unset. */
  beachPebbles?: number;
  /** Ponds that may get a line of stepping stones across them; none if unset. */
  ponds?: readonly Pond[];
}

const CLUSTER_RADIUS = 4;
/** Beach pebbles lie between the waterline and this far (m) above it. */
const BEACH_BAND = 0.9;
/** Each beach spot gets up to this many more pebble clusters around it, within `BEACH_SPREAD` metres. */
const BEACH_GROUP = 3;
const BEACH_SPREAD = 1.8;

/**
 * Scatters clustered rocks, preferring slopes and shorelines, and sets outcrops on the steepest ground.
 * Pure logic, no rendering.
 */
export class RockScatterPlacer {
  private readonly siter: RockSiter;

  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {
    this.siter = new RockSiter(ground, random);
  }

  place(options: RockScatterOptions): RockPlacement[] {
    const placements = this.clusters(options);
    if (options.outcrops) {
      placements.push(...placeOutcrops(this.siter, this.random, { ...options, outcrops: options.outcrops }));
    }
    placements.push(...this.beach(options));
    placements.push(...placeSteppingStones(this.ground, this.random, options.ponds ?? [], options.variants));
    return placements;
  }

  /** Clusters of a lead rock and its companions, preferring slopes and shorelines. */
  private clusters(options: RockScatterOptions): RockPlacement[] {
    const placements: RockPlacement[] = [];
    let centres = 0;
    for (let tries = 0; centres < options.clusters && tries < options.clusters * 30; tries++) {
      const x = this.random.range(-options.extent, options.extent);
      const z = this.random.range(-options.extent, options.extent);
      if (!this.siter.allowed(x, z, options)) continue;
      if (this.random.next() > this.weight(x, z, options.waterLevel)) continue;
      centres++;
      const size = 1 + Math.floor(this.random.next() * options.clusterSize);
      for (let i = 0; i < size; i++) {
        const angle = this.random.range(0, Math.PI * 2);
        const r = i === 0 ? 0 : this.random.range(0.5, CLUSTER_RADIUS);
        const role = i === 0 ? 'lead' : 'companion';
        const rock = this.siter.rockAt(x + Math.cos(angle) * r, z + Math.sin(angle) * r, role, options);
        if (rock) placements.push(rock);
      }
    }
    return placements;
  }

  /** `beachPebbles` spots in the band just above the sea, each a small group of pebble clusters (or the odd stone). */
  private beach(options: RockScatterOptions): RockPlacement[] {
    const pebbles: RockPlacement[] = [];
    const wanted = options.beachPebbles ?? 0;
    let spots = 0;
    for (let tries = 0; spots < wanted && tries < wanted * 60; tries++) {
      const x = this.random.range(-options.extent, options.extent);
      const z = this.random.range(-options.extent, options.extent);
      const rock = this.onBeach(x, z, options);
      if (!rock) continue;
      spots++;
      pebbles.push(rock);
      const more = Math.floor(this.random.next() * (BEACH_GROUP + 1));
      for (let i = 0; i < more; i++) {
        const angle = this.random.range(0, Math.PI * 2);
        const r = this.random.range(0.8, BEACH_SPREAD);
        const near = this.onBeach(x + Math.cos(angle) * r, z + Math.sin(angle) * r, options);
        if (near) pebbles.push(near);
      }
    }
    return pebbles;
  }

  private onBeach(x: number, z: number, options: RockScatterOptions): RockPlacement | null {
    const above = this.ground.heightAt(x, z) - options.waterLevel;
    return above < 0.03 || above > BEACH_BAND ? null : this.siter.rockAt(x, z, 'beach', options);
  }

  /** Acceptance chance in [0.1, 1]: steeper ground and the shoreline score higher. */
  weight(x: number, z: number, waterLevel: number): number {
    const y = this.ground.heightAt(x, z);
    const slope = Math.min(1, this.siter.slope(x, z));
    const shore = y - waterLevel < SHORE_BAND ? 0.6 : 0;
    return Math.min(1, 0.1 + slope * 0.9 + shore);
  }
}
