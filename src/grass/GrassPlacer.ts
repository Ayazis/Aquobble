import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import { canGrow } from './canGrow';
import type { GrassPlacement } from './GrassPlacement';
import type { GroundRules } from './GroundRules';
import { growthAt } from './growthAt';
import { patchiness } from './patchiness';

/** Tuft scale on mown ground. */
const LAWN_SCALE = 0.45;
/** Share of tufts kept even on the thinnest patch, so bare ground never shows as a hole. */
const PATCH_FLOOR = 0.3;
/** Flower clusters gather around this many drift centres per hundred clusters. */
const DRIFTS_PER_100 = 12;

export interface GrassPlacerOptions {
  count: number;
  /** Half-width of the square area to scatter in. */
  extent: number;
}

export interface FlowerPlacerOptions {
  clusters: number;
  perCluster: number;
  /** Cluster radius in metres. */
  radius: number;
  /** Number of colour variants; each cluster picks one. */
  variants: number;
  extent: number;
}

/** Scatters grass blades and flower clusters on allowed ground. Pure logic, no rendering. */
export class GrassPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
    private readonly rules: GroundRules,
  ) {}

  grass({ count, extent }: GrassPlacerOptions): GrassPlacement[] {
    const out: GrassPlacement[] = [];
    for (let tries = 0; out.length < count && tries < count * 6; tries++) {
      const x = this.random.range(-extent, extent);
      const z = this.random.range(-extent, extent);
      const thick = patchiness(x, z);
      if (this.random.next() > PATCH_FLOOR + (1 - PATCH_FLOOR) * thick) continue;
      // Thick patches grow a little taller too.
      this.tryAdd(out, x, z, 0, 0.55 + 0.15 * thick, 1.2 + 0.3 * thick);
    }
    return out;
  }

  flowers({ clusters, perCluster, radius, variants, extent }: FlowerPlacerOptions): GrassPlacement[] {
    const out: GrassPlacement[] = [];
    const drifts = Array.from({ length: Math.max(1, Math.round((clusters * DRIFTS_PER_100) / 100)) }, () => ({
      x: this.random.range(-extent, extent),
      z: this.random.range(-extent, extent),
      variant: Math.floor(this.random.next() * variants),
    }));
    for (let c = 0; c < clusters; c++) {
      // Most clusters join a drift (and mostly its colour); a few stand alone.
      const drift = drifts[Math.floor(this.random.next() * drifts.length)];
      const alone = this.random.next() < 0.2;
      const spread = radius * 5;
      const cx = alone ? this.random.range(-extent, extent) : drift.x + this.random.range(-spread, spread);
      const cz = alone ? this.random.range(-extent, extent) : drift.z + this.random.range(-spread, spread);
      const own = alone || this.random.next() < 0.3;
      const variant = own ? Math.floor(this.random.next() * variants) : drift.variant;
      for (let i = 0; i < perCluster; i++) {
        const angle = this.random.range(0, Math.PI * 2);
        const r = radius * Math.sqrt(this.random.next());
        this.tryAdd(out, cx + Math.cos(angle) * r, cz + Math.sin(angle) * r, variant, 0.7, 1.2);
      }
    }
    return out;
  }

  private tryAdd(out: GrassPlacement[], x: number, z: number, variant: number, min: number, max: number): void {
    const y = canGrow(this.ground, this.rules, x, z);
    if (y === null) return;
    const { blockers = [], feather = 1.5, lawns = [] } = this.rules;
    const growth = growthAt(blockers, feather, x, z);
    // Thinner towards a blocker edge: keep a tuft with chance `growth`.
    if (growth <= 0 || (growth < 1 && this.random.next() > growth)) return;
    const lawn = lawns.some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ) ? LAWN_SCALE : 1;
    const shorter = (0.35 + 0.65 * growth) * lawn;
    out.push({
      x,
      y: y - 0.05,
      z,
      yaw: this.random.range(0, Math.PI * 2),
      scale: this.random.range(min, max) * shorter,
      tint: this.random.next(),
      variant,
    });
  }
}
