import { SeededRandom } from '@core';
import { describe, expect, it } from 'vitest';
import { createFlock } from './createFlock';
import { flockStep } from './flockStep';

const options = { count: 10, center: { x: 0, y: 25, z: 0 }, radius: 40, minHeight: 15, maxHeight: 40 };

describe('flockStep', () => {
  it('keeps birds within speed limit and roughly within the height band', () => {
    const flock = createFlock(new SeededRandom(7), options);
    for (let i = 0; i < 60 * 60; i++) flockStep(flock, 1 / 60);
    for (const bird of flock.birds) {
      expect(Math.hypot(bird.velocity.x, bird.velocity.y, bird.velocity.z)).toBeLessThanOrEqual(flock.speed + 1e-6);
      expect(bird.position.y).toBeGreaterThan(10);
      expect(bird.position.y).toBeLessThan(45);
      expect(Math.hypot(bird.position.x, bird.position.z)).toBeLessThan(options.radius + 30);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = createFlock(new SeededRandom(3), options);
    const b = createFlock(new SeededRandom(3), options);
    for (let i = 0; i < 120; i++) {
      flockStep(a, 1 / 60);
      flockStep(b, 1 / 60);
    }
    expect(a.birds.map((x) => x.position)).toEqual(b.birds.map((x) => x.position));
  });

  it('moves the orbit target around the centre', () => {
    const flock = createFlock(new SeededRandom(1), options);
    const before = flock.angle;
    flockStep(flock, 1);
    expect(flock.angle).not.toBe(before);
  });
});
