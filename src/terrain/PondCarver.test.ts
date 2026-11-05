import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { HeightField } from './HeightField';
import { PondCarver } from './PondCarver';
import type { PondOptions } from './PondOptions';

const OPTIONS: PondOptions = {
  count: 3,
  extent: 30,
  minRadius: 4,
  maxRadius: 6,
  depth: 1.5,
  minLevel: 1,
  freeboard: 0.3,
};

function flatField(height: number): HeightField {
  const samples = 81;
  return new HeightField(samples, 100, new Float32Array(samples * samples).fill(height));
}

describe('PondCarver', () => {
  it('digs bowls below the water level, deepest at the centre', () => {
    const field = flatField(5);
    const ponds = new PondCarver(new SeededRandom(7)).carve(field, OPTIONS);
    expect(ponds.length).toBe(3);
    for (const pond of ponds) {
      expect(pond.level).toBeCloseTo(4.7, 5);
      expect(field.heightAt(pond.x, pond.z)).toBeLessThan(pond.level - 1);
      expect(field.heightAt(pond.x + pond.radius + 1.5, pond.z)).toBeCloseTo(5, 5);
    }
  });

  it('is reproducible for the same seed', () => {
    const a = new PondCarver(new SeededRandom(3)).carve(flatField(5), OPTIONS);
    const b = new PondCarver(new SeededRandom(3)).carve(flatField(5), OPTIONS);
    expect(a).toEqual(b);
  });

  it('keeps ponds apart and out of avoided areas', () => {
    const avoid = [{ minX: -10, maxX: 10, minZ: -10, maxZ: 10 }];
    const ponds = new PondCarver(new SeededRandom(11)).carve(flatField(5), { ...OPTIONS, avoid });
    for (const p of ponds) {
      expect(Math.abs(p.x) > 10 + p.radius || Math.abs(p.z) > 10 + p.radius).toBe(true);
      for (const q of ponds) if (q !== p) expect(Math.hypot(p.x - q.x, p.z - q.z)).toBeGreaterThan(p.radius);
    }
  });

  it('skips spots whose water would sit below the minimum level', () => {
    expect(new PondCarver(new SeededRandom(1)).carve(flatField(0.5), OPTIONS)).toEqual([]);
  });
});
