import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { LeafLitterPlacement } from './LeafLitterPlacement';
import type { TreePlacement } from './TreePlacement';

export interface LeafLitterOptions {
  /** Leaf patches per tree at scale 1. */
  perTree: number;
  /** How far from the trunk patches fall, in metres at tree scale 1 (about the crown's reach). */
  radius: number;
}

/** Height above the ground so the patch does not flicker into it. */
const LIFT = 0.03;

/** Scatters leaf patches under tree crowns, thicker near the trunk. Pure logic, no rendering. */
export class LeafLitterPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  place(trees: readonly TreePlacement[], { perTree, radius }: LeafLitterOptions): LeafLitterPlacement[] {
    const out: LeafLitterPlacement[] = [];
    for (const t of trees) {
      const n = Math.round(perTree * t.scale);
      for (let i = 0; i < n; i++) {
        const angle = this.random.range(0, Math.PI * 2);
        // Squared: most patches lie close to the trunk, where the crown is thickest.
        const r = (0.5 + radius * this.random.next() ** 1.5) * t.scale;
        const x = t.x + Math.cos(angle) * r;
        const z = t.z + Math.sin(angle) * r;
        out.push({
          x,
          y: this.ground.heightAt(x, z) + LIFT,
          z,
          yaw: this.random.range(0, Math.PI * 2),
          scale: this.random.range(0.7, 1.3),
          tint: this.random.next(),
        });
      }
    }
    return out;
  }
}
