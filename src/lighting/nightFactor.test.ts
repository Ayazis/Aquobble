import { describe, expect, it } from 'vitest';
import { nightFactor } from './nightFactor';

const at = (time: number) => nightFactor(time, 0.15, -0.1);

describe('nightFactor', () => {
  it('is off through the day and fully on at night', () => {
    for (const time of [0.3, 0.4, 0.5, 0.6, 0.7]) expect(at(time)).toBe(0);
    for (const time of [0, 0.1, 0.2, 0.8, 0.9, 0.999]) expect(at(time)).toBe(1);
  });

  it('is partly on at sunset and sunrise', () => {
    expect(at(0.75)).toBeGreaterThan(0);
    expect(at(0.75)).toBeLessThan(1);
    expect(at(0.25)).toBeCloseTo(at(0.75), 6);
  });

  it('only rises through dusk and only falls through dawn', () => {
    let previous = at(0.7);
    for (let time = 0.7; time <= 0.8; time += 0.002) {
      expect(at(time)).toBeGreaterThanOrEqual(previous);
      previous = at(time);
    }
    previous = at(0.2);
    for (let time = 0.2; time <= 0.3; time += 0.002) {
      expect(at(time)).toBeLessThanOrEqual(previous);
      previous = at(time);
    }
  });

  it('switches hard when the ramp has no width', () => {
    expect(nightFactor(0.5, 0, 0)).toBe(0);
    expect(nightFactor(0, 0, 0)).toBe(1);
  });
});
