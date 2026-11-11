import { describe, expect, it } from 'vitest';
import { vec3 } from '@core';
import { wallTrim } from './wallTrim';

const segment = { center: vec3(0, 2, 10), half: vec3(5, 2, 0.7) };
const lintel = { center: vec3(0, 5, 0), half: vec3(2, 1, 0.9) };

describe('wallTrim', () => {
  it('trims only boxes standing on the ground', () => {
    const { plinths, caps } = wallTrim([segment, lintel]);
    expect(plinths).toHaveLength(1);
    expect(caps).toHaveLength(1);
  });

  it('puts the plinth at the foot, wider than the wall', () => {
    const [p] = wallTrim([segment]).plinths;
    expect(p.center.y - p.half.y).toBeCloseTo(0);
    expect(p.half.z).toBeGreaterThan(segment.half.z);
  });

  it('puts the cap on top, overhanging', () => {
    const [c] = wallTrim([segment]).caps;
    expect(c.center.y).toBeCloseTo(4);
    expect(c.half.x).toBeGreaterThan(segment.half.x);
  });
});
