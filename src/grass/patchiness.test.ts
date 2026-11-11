import { patchiness } from './patchiness';

describe('patchiness', () => {
  it('stays in [0, 1] and has both thick and thin ground', () => {
    let min = 1;
    let max = 0;
    for (let x = -80; x <= 80; x += 2) {
      for (let z = -80; z <= 80; z += 2) {
        const p = patchiness(x, z);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
        min = Math.min(min, p);
        max = Math.max(max, p);
      }
    }
    expect(min).toBeLessThan(0.1);
    expect(max).toBeGreaterThan(0.9);
  });
});
