import { describe, expect, it } from 'vitest';
import { springStep } from './bendSpring';

describe('springStep', () => {
  it('rises back without visibly swinging past upright and settles in a few seconds', () => {
    let d = 1;
    let v = 0;
    let min = 0;
    let late = 0;
    for (let t = 0; t < 6; t += 1 / 60) {
      [d, v] = springStep(d, v, 1 / 60);
      min = Math.min(min, d);
      if (t > 4) late = Math.max(late, Math.abs(d));
    }
    expect(min).toBeGreaterThan(-0.05);
    expect(late).toBeLessThan(0.05);
  });
});
