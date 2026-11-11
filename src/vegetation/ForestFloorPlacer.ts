import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { TreePlacement } from './TreePlacement';
import type { UnderstoryKind } from './UnderstoryKind';
import type { UnderstoryPlacement } from './UnderstoryPlacement';

export interface ForestFloorOptions {
  /** Things per grown tree (at scale 1); saplings get none. */
  perTree: number;
  /** How far from the trunk they spread, in metres at tree scale 1. */
  radius: number;
}

/** Relative share of each kind, its size range and reach; mushrooms keep close to trunks, logs further out. */
const KINDS: readonly { kind: UnderstoryKind; weight: number; scale: [number, number]; reach: number }[] = [
  { kind: 'fern', weight: 0.36, scale: [0.22, 0.38], reach: 1 },
  { kind: 'plant', weight: 0.16, scale: [0.22, 0.34], reach: 1 },
  { kind: 'mushroom', weight: 0.24, scale: [0.6, 1.1], reach: 0.45 },
  { kind: 'mossLog', weight: 0.09, scale: [0.8, 1.1], reach: 1.3 },
  { kind: 'log', weight: 0.06, scale: [0.6, 0.85], reach: 1.3 },
  { kind: 'stump', weight: 0.09, scale: [0.7, 1], reach: 1.1 },
];
const TOTAL = KINDS.reduce((sum, k) => sum + k.weight, 0);

/** Scatters ferns, plants, mushrooms, logs and stumps under tree crowns, thickest near trunks. Pure logic. */
export class ForestFloorPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  place(trees: readonly TreePlacement[], { perTree, radius }: ForestFloorOptions): UnderstoryPlacement[] {
    const out: UnderstoryPlacement[] = [];
    for (const t of trees) {
      if (t.scale < 0.5) continue;
      // A fractional count carries over as the chance of one more.
      const want = perTree * t.scale;
      const n = Math.floor(want) + (this.random.next() < want % 1 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const k = this.pick();
        const angle = this.random.range(0, Math.PI * 2);
        const r = (0.9 + radius * k.reach * this.random.next() ** 1.4) * t.scale;
        const x = t.x + Math.cos(angle) * r;
        const z = t.z + Math.sin(angle) * r;
        out.push({
          kind: k.kind,
          x,
          y: this.ground.heightAt(x, z),
          z,
          yaw: this.random.range(0, Math.PI * 2),
          scale: this.random.range(k.scale[0], k.scale[1]),
          tint: this.random.next(),
        });
      }
    }
    return out;
  }

  private pick(): (typeof KINDS)[number] {
    let roll = this.random.next() * TOTAL;
    for (const k of KINDS) if ((roll -= k.weight) < 0) return k;
    return KINDS[0];
  }
}
