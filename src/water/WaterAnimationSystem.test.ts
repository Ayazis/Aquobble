import { describe, expect, it } from 'vitest';
import { createGameWorld } from '@core';
import { WaterAnimationSystem } from './WaterAnimationSystem';

describe('WaterAnimationSystem', () => {
  it('advances time and passes on how dark it is', () => {
    const world = createGameWorld();
    const surface = { time: { value: 0 }, night: { value: 0 } };
    world.add({ waterSurface: surface });
    let night = 0.25;
    const system = new WaterAnimationSystem(world, 2, () => night);
    system.update(0.5);
    expect(surface.time.value).toBeCloseTo(1);
    expect(surface.night.value).toBe(0.25);
    night = 1;
    system.update(0);
    expect(surface.night.value).toBe(1);
  });
});
