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

describe('SeededRandom.fork', () => {
  it('gives the same stream for the same seed and name', () => {
    const a = new SeededRandom(7).fork('grass');
    const b = new SeededRandom(7).fork('grass');
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });

  it('does not depend on how many numbers the parent drew', () => {
    const parent = new SeededRandom(7);
    const before = parent.fork('wind').next();
    parent.next();
    parent.next();
    expect(parent.fork('wind').next()).toBe(before);
  });

  it('differs per name, per seed, from the parent, and by fork order', () => {
    const parent = new SeededRandom(7);
    const grass = parent.fork('grass').next();
    expect(parent.fork('trees').next()).not.toBe(grass);
    expect(new SeededRandom(8).fork('grass').next()).not.toBe(grass);
    expect(grass).not.toBe(new SeededRandom(7).next());
    expect(parent.fork('a').fork('b').next()).not.toBe(parent.fork('b').fork('a').next());
  });
});
