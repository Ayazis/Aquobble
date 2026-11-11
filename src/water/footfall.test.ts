import { describe, expect, it } from 'vitest';
import { footfall, splashSize } from './footfall';

describe('footfall', () => {
  it('fires once per half cycle', () => {
    expect(footfall(0.9, 0.05)).toBe(-1);
    expect(footfall(0.4, 0.55)).toBe(1);
    expect(footfall(0.1, 0.3)).toBe(0);
  });
});

describe('splashSize', () => {
  it('is nothing for wading in, bigger for faster and heavier', () => {
    expect(splashSize(1, 1)).toBe(0);
    expect(splashSize(8, 1)).toBeGreaterThan(splashSize(4, 1));
    expect(splashSize(8, 2)).toBeGreaterThan(splashSize(8, 1));
    expect(splashSize(100, 5)).toBe(2);
  });
});
