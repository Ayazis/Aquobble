import { describe, expect, it } from 'vitest';
import { RippleBox } from './RippleBox';

describe('RippleBox', () => {
  it('centres on the target snapped to texels and reports the texel shift', () => {
    const box = new RippleBox(40, 256);
    box.follow(0, 0);
    expect(box.minX).toBeCloseTo(-20);
    const shift = box.follow(box.texel * 3, 0);
    expect(shift).toEqual({ dx: 3, dz: 0 });
  });

  it('maps stamps into uv and drops those outside', () => {
    const box = new RippleBox(40, 256);
    box.follow(0, 0);
    const drop = box.toDrop(0, 10, 1, 0.5, 0);
    expect(drop?.u).toBeCloseTo(0.5);
    expect(drop?.v).toBeCloseTo(0.75);
    expect(box.toDrop(100, 0, 1, 0.5, 0)).toBeNull();
  });
});
