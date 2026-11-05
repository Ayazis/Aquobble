import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { WaterNormalsFactory } from './WaterNormalsFactory';

describe('WaterNormalsFactory', () => {
  it('builds a seamless, upward-facing normal map', () => {
    const size = 32;
    const data = new WaterNormalsFactory(new SeededRandom(5)).create(size).image.data as Uint8Array;
    const px = (x: number, y: number) => Array.from(data.slice((y * size + x) * 4, (y * size + x) * 4 + 3));
    for (let i = 0; i < data.length; i += 4) expect(data[i + 2]).toBeGreaterThan(128);
    const diff = (a: number[], b: number[]) => Math.max(...a.map((v, k) => Math.abs(v - b[k])));
    // Neighbours across the wrap seam differ no more than the worst neighbours inside the tile.
    let interior = 0;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size - 1; x++) interior = Math.max(interior, diff(px(x, y), px(x + 1, y)));
    for (let y = 0; y < size; y++) expect(diff(px(size - 1, y), px(0, y))).toBeLessThanOrEqual(interior);
  });
});
