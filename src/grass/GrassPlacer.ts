import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import { canGrow } from './canGrow';
import type { GrassPlacement } from './GrassPlacement';
import type { GroundRules } from './GroundRules';
import { growthAt } from './growthAt';

/** Tuft scale on mown ground. */
const LAWN_SCALE = 0.45;

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
    for (let tries = 0; out.length < count && tries < count * 4; tries++) {
      this.tryAdd(out, this.random.range(-extent, extent), this.random.range(-extent, extent), 0, 0.6, 1.4);
    }
    return out;
  }

  flowers({ clusters, perCluster, radius, variants, extent }: FlowerPlacerOptions): GrassPlacement[] {
    const out: GrassPlacement[] = [];
    for (let c = 0; c < clusters; c++) {
      const cx = this.random.range(-extent, extent);
      const cz = this.random.range(-extent, extent);
      const variant = Math.floor(this.random.next() * variants);
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
