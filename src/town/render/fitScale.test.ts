import { describe, expect, it } from 'vitest';
import { fitScale } from './fitScale';

const fp = (width: number, depth: number, height = 1) => ({ width, depth, height });

describe('fitScale', () => {
  it('keeps real-world size when the model fits the plot', () => {
    expect(fitScale(fp(4, 5), fp(8, 8))).toBe(1);
  });

  it('shrinks to the tighter horizontal side when the model is too big', () => {
    expect(fitScale(fp(12, 10), fp(8, 8))).toBeCloseTo(8 / 12);
  });

  it('ignores height, so tall models on flat plots stay full size', () => {
    expect(fitScale(fp(2, 2, 12), fp(4, 4, 3))).toBe(1);
  });

  it('treats a degenerate size as fitting', () => {
    expect(fitScale(fp(0, 0), fp(1, 1))).toBe(1);
  });
});
