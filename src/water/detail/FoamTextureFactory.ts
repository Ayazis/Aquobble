import * as THREE from 'three';
import type { Random } from '@core';
import { tiling } from './WaterDetailFactory';

/** Jittered points, one per cell of a `cells` x `cells` grid over the unit tile. */
function scatter(cells: number, random: Random): Float32Array {
  const points = new Float32Array(cells * cells * 2);
  for (let i = 0; i < cells * cells; i++) {
    points[i * 2] = ((i % cells) + random.next()) / cells;
    points[i * 2 + 1] = (Math.floor(i / cells) + random.next()) / cells;
  }
  return points;
}

/** Distances (in cells) from (u, v) to the nearest and second nearest point, wrapping at the tile's edge. */
function nearestTwo(points: Float32Array, cells: number, u: number, v: number): [number, number] {
  const cx = Math.floor(u * cells);
  const cy = Math.floor(v * cells);
  let first = Infinity;
  let second = Infinity;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      const i = (((y % cells) + cells) % cells) * cells + (((x % cells) + cells) % cells);
      const px = points[i * 2] + Math.floor(x / cells);
      const py = points[i * 2 + 1] + Math.floor(y / cells);
      const d = Math.hypot(px - u, py - v) * cells;
      if (d < first) [first, second] = [d, first];
      else if (d < second) second = d;
    }
  }
  return [first, second];
}

/**
 * Sea foam, generated at start: a seamlessly tiling pattern of bubble walls. Red is how readily a spot is
 * foam: the thin walls between large bubbles come first (lace), then the small bubbles, then everything, so
 * a rising threshold in the shader grows foam from torn lace to a solid sheet. Green is the small bubbles
 * alone, for shading the foam.
 */
export class FoamTextureFactory {
  constructor(private readonly random: Random) {}

  create(size = 256): THREE.DataTexture {
    const coarse = scatter(9, this.random);
    const fine = scatter(31, this.random);
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const [c1, c2] = nearestTwo(coarse, 9, u, v);
        const [f1, f2] = nearestTwo(fine, 31, u, v);
        const lace = 1 - Math.min(1, (c2 - c1) / 0.42);
        const bubbles = 1 - Math.min(1, (f2 - f1) / 0.55);
        const order = Math.min(1, 0.62 * lace ** 1.5 + 0.38 * bubbles + 0.12 * (1 - Math.min(1, c1)));
        const i = (y * size + x) * 4;
        data[i] = Math.round(order * 255);
        data[i + 1] = Math.round(bubbles * 255);
        data[i + 2] = Math.round(lace * 255);
        data[i + 3] = 255;
      }
    }
    return tiling(new THREE.DataTexture(data, size, size, THREE.RGBAFormat));
  }
}
