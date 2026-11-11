import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { createRustlePool, emitRustle, RUSTLE_LIFE, rustleSize, stepRustle } from './RustlePool';

describe('RustlePool', () => {
  it('emits motes that float up and expire', () => {
    const pool = createRustlePool(8);
    expect(rustleSize(pool, 0)).toBe(0);
    emitRustle(pool, new SeededRandom(1), 3, { x: 0, y: 0, z: 0 }, 6, 0);
    const y0 = pool.position[1];
    stepRustle(pool, 0.2);
    expect(pool.position[1]).toBeGreaterThan(y0);
    expect(rustleSize(pool, 0)).toBeGreaterThan(0);
    for (let t = 0; t < RUSTLE_LIFE + 0.5; t += 0.1) stepRustle(pool, 0.1);
    expect(rustleSize(pool, 0)).toBe(0);
  });

  it('reuses slots round robin', () => {
    const pool = createRustlePool(2);
    emitRustle(pool, new SeededRandom(1), 3, { x: 0, y: 0, z: 0 }, 0, 0);
    expect(pool.next).toBe(1);
  });
});
