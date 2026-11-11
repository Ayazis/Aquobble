import { describe, expect, it } from 'vitest';
import { GrassWatchdog } from './GrassWatchdog';

const run = (dog: GrassWatchdog, dt: number, seconds: number, keep = 1) => {
  for (let t = 0; t < seconds; t += dt) keep = dog.update(dt, keep);
  return keep;
};

describe('GrassWatchdog', () => {
  it('keeps full grass at a good frame rate', () => {
    expect(run(new GrassWatchdog(50), 1 / 60, 10)).toBe(1);
  });

  it('drops a step per slow window, down to a floor', () => {
    const dog = new GrassWatchdog(50);
    expect(run(dog, 1 / 30, 3.1)).toBeCloseTo(0.85);
    expect(run(dog, 1 / 30, 60)).toBe(0.4);
  });

  it('ignores hitches', () => {
    expect(new GrassWatchdog().update(2, 1)).toBe(1);
  });
});
