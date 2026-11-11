import { dryness } from './dryness';

describe('dryness', () => {
  it('leaves low ground green and dries the highest ground', () => {
    for (let x = -80; x <= 80; x += 7) {
      expect(dryness(x, x * 0.6, 2)).toBe(0);
      expect(dryness(x, x * 0.6, 15)).toBe(1);
    }
  });

  it('dries in patches at the same middle height', () => {
    const values = Array.from({ length: 60 }, (_, i) => dryness(i * 3 - 90, i * 2 - 60, 8));
    expect(Math.min(...values)).toBeLessThan(0.2);
    expect(Math.max(...values)).toBeGreaterThan(0.6);
  });
});
