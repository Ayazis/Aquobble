import { describe, expect, it } from 'vitest';
import { fitScale } from './fitScale';

const fp = (width: number, depth: number, height: number) => ({ width, depth, height });

describe('fitScale', () => {
  it('scales up to the plot height when there is room', () => {
    expect(fitScale(fp(5, 5, 12), fp(10, 16, 14))).toBeCloseTo(14 / 12);
  });

  it('scales down to the plot height', () => {
    expect(fitScale(fp(1, 1, 4), fp(2, 2, 2))).toBeCloseTo(0.5);
  });

  it('shrinks to the tighter horizontal side when the height would spill over the plot', () => {
    expect(fitScale(fp(10, 12, 5), fp(8, 8, 10))).toBeCloseTo(8 / 12);
  });

  it('treats a degenerate size as fitting', () => {
    expect(fitScale(fp(0, 0, 0), fp(1, 1, 1))).toBe(1);
  });
});
