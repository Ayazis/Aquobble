import { describe, expect, it } from 'vitest';
import type { GrassBand } from './GrassBand';
import { tileSpan, visibleGrassTiles } from './visibleGrassTiles';

const band: GrassBand = { segments: 3, halfWidth: 0.04, tile: 8, side: 4, fadeIn: [20, 28], fadeOut: [50, 60] };
const all = () => true;

function tiles(x: number, z: number, wanted: (minX: number, minZ: number, size: number) => boolean = all) {
  const out = new Float32Array(tileSpan(band) ** 2 * 2);
  const count = visibleGrassTiles(band, x, z, wanted, out);
  return Array.from({ length: count }, (_, i) => [out[i * 2], out[i * 2 + 1]]);
}

describe('visibleGrassTiles', () => {
  it('covers every point of the band ring and nothing beyond it', () => {
    const found = tiles(3.3, -5.1);
    const has = (x: number, z: number) => found.some(([tx, tz]) => x >= tx && x < tx + 8 && z >= tz && z < tz + 8);
    for (let a = 0; a < 6.28; a += 0.2) {
      for (const d of [21, 40, 59]) expect(has(3.3 + Math.cos(a) * d, -5.1 + Math.sin(a) * d)).toBe(true);
    }
    for (const [tx, tz] of found) expect(Math.hypot(tx + 4 - 3.3, tz + 4 + 5.1)).toBeLessThan(60 + 8);
    expect(found.length).toBeLessThanOrEqual(tileSpan(band) ** 2);
  });

  it('skips tiles wholly inside the ring, where a nearer band draws', () => {
    expect(tiles(4, 4)).not.toContainEqual([0, 0]);
  });

  it('lists each tile once, near ones first', () => {
    const found = tiles(100, 37);
    expect(new Set(found.map(([x, z]) => `${x},${z}`)).size).toBe(found.length);
    const ring = ([tx, tz]: number[]) => Math.max(Math.abs(tx / 8 - 12), Math.abs(tz / 8 - 4));
    for (let i = 1; i < found.length; i++) expect(ring(found[i])).toBeGreaterThanOrEqual(ring(found[i - 1]));
  });

  it('leaves out tiles the caller does not want', () => {
    expect(tiles(0, 0, (minX) => minX >= 0).every(([tx]) => tx >= 0)).toBe(true);
    expect(tiles(0, 0, () => false)).toEqual([]);
  });
});
