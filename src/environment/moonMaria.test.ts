import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { moonMaria } from './moonMaria';

describe('moonMaria', () => {
  it('keeps every patch inside the disc', () => {
    for (const p of moonMaria(new SeededRandom(7), 20, 40)) {
      expect(Math.hypot(p.x, p.y) + p.radius).toBeLessThanOrEqual(0.92 + 1e-9);
      expect(p.darkness).toBeGreaterThan(0);
      expect(p.darkness).toBeLessThan(1);
    }
  });

  it('is the same face for the same seed', () => {
    expect(moonMaria(new SeededRandom(3))).toEqual(moonMaria(new SeededRandom(3)));
  });
});
