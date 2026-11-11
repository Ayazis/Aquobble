import { describe, expect, it } from 'vitest';
import { springStep } from './bendSpring';

describe('springStep', () => {
  it('overshoots once when released and settles in a few seconds', () => {
    let d = 1;
    let v = 0;
    let min = 0;
    let late = 0;
    for (let t = 0; t < 6; t += 1 / 60) {
      [d, v] = springStep(d, v, 1 / 60);
      min = Math.min(min, d);
      if (t > 4) late = Math.max(late, Math.abs(d));
    }
    expect(min).toBeLessThan(-0.1);
    expect(min).toBeGreaterThan(-0.45);
    expect(late).toBeLessThan(0.12);
  });
});
