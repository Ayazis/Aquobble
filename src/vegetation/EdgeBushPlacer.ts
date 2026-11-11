import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { TreePlacement } from './TreePlacement';
import type { UnderstoryPlacement } from './UnderstoryPlacement';

export interface EdgeBushOptions {
  /** A tree with fewer neighbours than this within `neighbourRadius` stands at the forest edge. */
  maxNeighbours: number;
  neighbourRadius: number;
  /** Bushes per edge tree. */
  perTree: number;
}

/**
 * Puts bushes at the forest edge: around trees with few neighbours, on the side facing out of the forest.
 * Two bush models alternate, so the edge is not one shape repeated. Pure logic.
 */
export class EdgeBushPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  place(trees: readonly TreePlacement[], options: EdgeBushOptions): UnderstoryPlacement[] {
    const out: UnderstoryPlacement[] = [];
    const r2 = options.neighbourRadius ** 2;
    for (const t of trees) {
      let n = 0;
      let cx = 0;
      let cz = 0;
      for (const o of trees) {
        if (o === t || (o.x - t.x) ** 2 + (o.z - t.z) ** 2 > r2) continue;
        n++;
        cx += o.x - t.x;
        cz += o.z - t.z;
      }
      if (n >= options.maxNeighbours) continue;
      // Away from the neighbours' centre, i.e. out of the forest.
      const outward = n > 0 ? Math.atan2(-cz, -cx) : this.random.range(0, Math.PI * 2);
      for (let i = 0; i < options.perTree; i++) {
        const angle = outward + this.random.range(-1.2, 1.2);
        const r = this.random.range(2, 4.5);
        const x = t.x + Math.cos(angle) * r;
        const z = t.z + Math.sin(angle) * r;
        out.push({
          kind: this.random.next() < 0.5 ? 'bush' : 'townBush',
          x,
          y: this.ground.heightAt(x, z) - 0.05,
          z,
          yaw: this.random.range(0, Math.PI * 2),
          scale: this.random.range(0.8, 1.4),
          tint: this.random.next(),
        });
      }
    }
    return out;
  }
}
