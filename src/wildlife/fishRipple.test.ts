import { describe, expect, it } from 'vitest';
import { fishJump, fishRipple, JUMP_TIME, RIPPLE_LIFE } from './fishRipple';

describe('fishRipple', () => {
  it('grows and fades out', () => {
    const early = fishRipple(0.1);
    const late = fishRipple(RIPPLE_LIFE * 0.9);
    expect(late.radius).toBeGreaterThan(early.radius);
    expect(late.fade).toBeLessThan(early.fade);
    expect(fishRipple(RIPPLE_LIFE).fade).toBe(0);
  });

  it('jumps in an arc that starts and ends at the water', () => {
    expect(fishJump(0)?.lift).toBe(0);
    expect(fishJump(JUMP_TIME / 2)?.lift).toBeCloseTo(0.45);
    expect(fishJump(JUMP_TIME + 0.1)).toBeNull();
  });
});
