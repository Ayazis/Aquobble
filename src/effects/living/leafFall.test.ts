import { describe, expect, it } from 'vitest';
import { leafFall, type FallingLeaf } from './leafFall';

const leaf = (): FallingLeaf => ({ x: 0, y: 6, z: 0, groundY: 1, phase: 0, age: 0, active: true });

describe('leafFall', () => {
  it('drifts downwind and lands on the ground', () => {
    const l = leaf();
    for (let i = 0; i < 60 * 30 && l.active; i++) leafFall(l, 1 / 60, 1, 0, 0.5);
    expect(l.active).toBe(false);
    expect(l.x).toBeGreaterThan(3);
    expect(l.y).toBeLessThan(1.1);
  });

  it('drifts further in a stronger gust', () => {
    const calm = leaf();
    const gusty = leaf();
    for (let i = 0; i < 60; i++) {
      leafFall(calm, 1 / 60, 1, 0, 0);
      leafFall(gusty, 1 / 60, 1, 0, 1);
    }
    expect(gusty.x).toBeGreaterThan(calm.x);
  });
});
