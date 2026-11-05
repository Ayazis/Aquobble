import type { FlattenRegion } from './FlattenRegion';
import type { HeightSampler } from './HeightSampler';

/**
 * Square grid of heights centred on the origin. Row-major: index = row * samples + column,
 * rows along +z, columns along +x, both starting at -size/2.
 */
export class HeightField implements HeightSampler {
  constructor(
    readonly samples: number,
    readonly size: number,
    readonly heights: Float32Array,
  ) {
    if (heights.length !== samples * samples) throw new Error('heights must have samples * samples entries');
  }

  get spacing(): number {
    return this.size / (this.samples - 1);
  }

  /** World position of a grid sample on the x or z axis. */
  coordinate(index: number): number {
    return -this.size / 2 + index * this.spacing;
  }

  at(column: number, row: number): number {
    return this.heights[row * this.samples + column];
  }

  /** Bilinear height at a world position; clamps to the edge outside the grid. */
  heightAt(x: number, z: number): number {
    const max = this.samples - 1;
    const gx = Math.min(Math.max((x + this.size / 2) / this.spacing, 0), max);
    const gz = Math.min(Math.max((z + this.size / 2) / this.spacing, 0), max);
    const c = Math.min(Math.floor(gx), max - 1);
    const r = Math.min(Math.floor(gz), max - 1);
    const tx = gx - c;
    const tz = gz - r;
    const top = this.at(c, r) * (1 - tx) + this.at(c + 1, r) * tx;
    const bottom = this.at(c, r + 1) * (1 - tx) + this.at(c + 1, r + 1) * tx;
    return top * (1 - tz) + bottom * tz;
  }

  /**
   * Levels a square region to `height`. Inside the square heights are exactly `height`; across the
   * blend band they ease (smoothstep) back to the original terrain. Mutates in place.
   */
  flatten(region: FlattenRegion, height: number): void {
    for (let row = 0; row < this.samples; row++) {
      for (let column = 0; column < this.samples; column++) {
        const dx = Math.abs(this.coordinate(column) - region.centerX);
        const dz = Math.abs(this.coordinate(row) - region.centerZ);
        const outside = Math.max(Math.max(dx, dz) - region.halfSize, 0);
        const weight = region.blend > 0 ? 1 - smoothstep(outside / region.blend) : outside > 0 ? 0 : 1;
        if (weight <= 0) continue;
        const i = row * this.samples + column;
        this.heights[i] += (height - this.heights[i]) * weight;
      }
    }
  }
}

function smoothstep(t: number): number {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}
