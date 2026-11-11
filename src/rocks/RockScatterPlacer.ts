import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import { placeOutcrops } from './placeOutcrops';
import type { RockPlacement } from './RockPlacement';
import { RockSiter, SHORE_BAND, type RockSiteRules } from './RockSiter';

export interface RockScatterOptions extends RockSiteRules {
  /** Number of clusters; each holds 1..clusterSize rocks. */
  clusters: number;
  clusterSize: number;
  /** Half-width of the square area to scatter in. */
  extent: number;
  /** Rock faces with scree on the steepest ground; none if unset. */
  outcrops?: number;
}

const CLUSTER_RADIUS = 4;

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
    if (options.outcrops) {
      placements.push(...placeOutcrops(this.siter, this.random, { ...options, outcrops: options.outcrops }));
    }
    return placements;
  }

  /** Acceptance chance in [0.1, 1]: steeper ground and the shoreline score higher. */
  weight(x: number, z: number, waterLevel: number): number {
    const y = this.ground.heightAt(x, z);
    const slope = Math.min(1, this.siter.slope(x, z));
    const shore = y - waterLevel < SHORE_BAND ? 0.6 : 0;
    return Math.min(1, 0.1 + slope * 0.9 + shore);
  }
}
