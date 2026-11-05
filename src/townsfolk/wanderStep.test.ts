import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { createTownsfolk } from './Townsfolk';
import { pickWanderTarget, wanderStep } from './wanderStep';

const area = { x: 10, z: -5, radius: 8 };

describe('pickWanderTarget', () => {
  it('stays inside the area and is reproducible', () => {
    const a = new SeededRandom(1);
    const b = new SeededRandom(1);
    for (let i = 0; i < 100; i++) {
      const t = pickWanderTarget(area, a);
      expect(Math.hypot(t.x - area.x, t.z - area.z)).toBeLessThanOrEqual(area.radius);
      expect(pickWanderTarget(area, b)).toEqual(t);
    }
  });
});

describe('wanderStep', () => {
  it('stands still while idle, then walks towards a target at walking speed', () => {
    const folk = createTownsfolk(1.5, 1);
    const random = new SeededRandom(2);
    expect(wanderStep(folk, 10, -5, 0.5, area, random)).toEqual({ x: 0, z: 0 });
    expect(folk.state).toBe('idle');
    const v = wanderStep(folk, 10, -5, 0.6, area, random);
    expect(folk.state).toBe('walking');
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(1.5);
    expect(v.x * (folk.targetX - 10) + v.z * (folk.targetZ + 5)).toBeGreaterThan(0);
  });

  it('goes idle for a while on arrival', () => {
    const folk = createTownsfolk(1.5, 0);
    const random = new SeededRandom(3);
    wanderStep(folk, 10, -5, 0.1, area, random);
    expect(wanderStep(folk, folk.targetX, folk.targetZ, 0.1, area, random)).toEqual({ x: 0, z: 0 });
    expect(folk.state).toBe('idle');
    expect(folk.timer).toBeGreaterThanOrEqual(folk.minIdle);
    expect(folk.timer).toBeLessThan(folk.maxIdle);
  });

  it('gives up on a target it cannot reach', () => {
    const folk = createTownsfolk(1.5, 0);
    const random = new SeededRandom(4);
    wanderStep(folk, 10, -5, 0.1, area, random);
    let steps = 0;
    while (folk.state === 'walking' && steps++ < 10000) wanderStep(folk, 10, -5, 1 / 60, area, random);
    expect(folk.state).toBe('idle');
  });
});
