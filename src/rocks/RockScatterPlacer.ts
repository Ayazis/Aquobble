import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { RockPlacement } from './RockPlacement';

export interface RockScatterOptions {
  /** Number of clusters; each holds 1..clusterSize rocks. */
  clusters: number;
  clusterSize: number;
  /** Half-width of the square area to scatter in. */
  extent: number;
  /** Rocks below this height are skipped (under water). */
  waterLevel: number;
  /** Rocks above this height are skipped. */
  maxHeight: number;
  minScale: number;
  maxScale: number;
  /** Number of geometry variants to pick from. */
  variants: number;
  exclude?: readonly ExclusionZone[];
}

const SHORE_BAND = 1.5;
const CLUSTER_RADIUS = 4;

/** Scatters clustered rocks, preferring slopes and shorelines. Pure logic, no rendering. */
export class RockScatterPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  place(options: RockScatterOptions): RockPlacement[] {
    const placements: RockPlacement[] = [];
    let centres = 0;
    for (let tries = 0; centres < options.clusters && tries < options.clusters * 30; tries++) {
      const x = this.random.range(-options.extent, options.extent);
      const z = this.random.range(-options.extent, options.extent);
      if (!this.allowed(x, z, options)) continue;
      if (this.random.next() > this.weight(x, z, options.waterLevel)) continue;
      centres++;
      const size = 1 + Math.floor(this.random.next() * options.clusterSize);
      for (let i = 0; i < size; i++) {
        const angle = this.random.range(0, Math.PI * 2);
        const r = i === 0 ? 0 : this.random.range(0.5, CLUSTER_RADIUS);
        const rock = this.rockAt(x + Math.cos(angle) * r, z + Math.sin(angle) * r, i === 0, options);
        if (rock) placements.push(rock);
      }
    }
    return placements;
  }

  /** Acceptance chance in [0.1, 1]: steeper ground and the shoreline score higher. */
  weight(x: number, z: number, waterLevel: number): number {
    const y = this.ground.heightAt(x, z);
    const slope = Math.min(1, this.slopeAt(x, z));
    const shore = y - waterLevel < SHORE_BAND ? 0.6 : 0;
    return Math.min(1, 0.1 + slope * 0.9 + shore);
  }

  private allowed(x: number, z: number, o: RockScatterOptions): boolean {
    if ((o.exclude ?? []).some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ)) return false;
    const y = this.ground.heightAt(x, z);
    return y >= o.waterLevel && y <= o.maxHeight;
  }

  private rockAt(x: number, z: number, lead: boolean, o: RockScatterOptions): RockPlacement | null {
    if (!this.allowed(x, z, o)) return null;
    // The cluster's lead rock is the big one; companions are smaller.
    const span = o.maxScale - o.minScale;
    const t = this.random.next();
    const scale = o.minScale + span * (lead ? 0.4 + 0.6 * t : 0.4 * t);
    const squash = this.random.range(0.45, 0.95);
    return {
      x,
      // Sink about a third of the rock's height so it looks embedded, not dropped.
      y: this.ground.heightAt(x, z) - scale * squash * 0.35,
      z,
      yaw: this.random.range(0, Math.PI * 2),
      tilt: this.random.range(-0.3, 0.3),
      scale,
      squash,
      variant: Math.min(o.variants - 1, Math.floor(this.random.next() * o.variants)),
    };
  }

  /** Rise over run from central differences, 1 m apart. */
  private slopeAt(x: number, z: number): number {
    const dx = this.ground.heightAt(x + 0.5, z) - this.ground.heightAt(x - 0.5, z);
    const dz = this.ground.heightAt(x, z + 0.5) - this.ground.heightAt(x, z - 0.5);
    return Math.hypot(dx, dz);
  }
}
