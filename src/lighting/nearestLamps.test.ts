import { describe, expect, it } from 'vitest';
import type { LightSlot } from './LightSlot';
import { nearestLamps } from './nearestLamps';

const lamp = (x: number, z: number) => ({ x, y: 0, z });
const slots = (count: number): LightSlot[] => Array.from({ length: count }, () => ({ lamp: -1, weight: 0 }));
const origin = lamp(0, 0);

describe('nearestLamps', () => {
  it('picks the nearest lamps, nearest first', () => {
    const out = slots(2);
    nearestLamps([lamp(30, 0), lamp(1, 0), lamp(0, 5), lamp(-50, 0)], origin, 4, out);
    expect(out.map((slot) => slot.lamp)).toEqual([1, 2]);
    expect(out.every((slot) => slot.weight === 1)).toBe(true);
  });

  it('leaves spare lights dark and the rest at full strength when lamps are few', () => {
    const out = slots(3);
    nearestLamps([lamp(2, 0)], origin, 4, out);
    expect(out).toEqual([
      { lamp: 0, weight: 1 },
      { lamp: -1, weight: 0 },
      { lamp: -1, weight: 0 },
    ]);
  });

  it('fades a lamp out as the next one comes as near', () => {
    const out = slots(1);
    nearestLamps([lamp(9, 0), lamp(10, 0)], origin, 4, out);
    expect(out[0]).toEqual({ lamp: 0, weight: 0.25 });
    nearestLamps([lamp(10, 0), lamp(0, 10)], origin, 4, out);
    expect(out[0]).toEqual({ lamp: 0, weight: 0 });
  });

  it('gives lamps at the same distance one light each', () => {
    const out = slots(2);
    nearestLamps([lamp(5, 0), lamp(-5, 0), lamp(0, 5)], origin, 4, out);
    expect(out.map((slot) => slot.lamp)).toEqual([0, 1]);
  });
});
