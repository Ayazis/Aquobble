import { SeededRandom } from './SeededRandom';

describe('SeededRandom', () => {
  it('is reproducible for the same seed', () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('stays within range', () => {
    const r = new SeededRandom(1);
    for (let i = 0; i < 1000; i++) {
      const v = r.range(-2, 3);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(3);
    }
  });
});
