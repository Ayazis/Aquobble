import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from './ExclusionZone';
import type { TreePlacement } from './TreePlacement';

export interface TreePlacerOptions {
  count: number;
  /** Half-width of the square area to scatter in. */
  extent: number;
  minHeight: number;
  maxHeight: number;
  /** Rectangles (world x/z) where no tree may grow, e.g. a town. */
  exclude?: readonly ExclusionZone[];
}

/** Scatters trees on the ground between a min and max height. Pure logic, no rendering. */
export class TreePlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
  ) {}

  place({ count, extent, minHeight, maxHeight, exclude = [] }: TreePlacerOptions): TreePlacement[] {
    const placements: TreePlacement[] = [];
    for (let tries = 0; placements.length < count && tries < count * 20; tries++) {
      const x = this.random.range(-extent, extent);
      const z = this.random.range(-extent, extent);
      if (exclude.some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ)) continue;
      const y = this.ground.heightAt(x, z);
      if (y < minHeight || y > maxHeight) continue;
      placements.push({
        x,
        y: y - 0.2,
        z,
        yaw: this.random.range(0, Math.PI * 2),
        scale: this.random.range(0.7, 1.5),
        lean: this.random.range(0, 0.07),
        tint: this.random.next(),
      });
    }
    return placements;
  }
}
