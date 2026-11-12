import { describe, expect, it } from 'vitest';
import { grassImpact } from './grassImpact';

describe('grassImpact', () => {
  it('stamps a burst when a fall stops', () => {
    const stamp = grassImpact(2, 3, -6, 0, 1);
    expect(stamp).toMatchObject({ x: 2, z: 3, burst: 1, vx: 0, vz: 0 });
  });

  it('ignores walking, rising and falls still under way', () => {
    expect(grassImpact(0, 0, -0.5, 0, 1)).toBeNull();
    expect(grassImpact(0, 0, 5, 0, 1)).toBeNull();
    expect(grassImpact(0, 0, -6, -6.2, 1)).toBeNull();
  });

  it('splays the grass wider and harder after a longer fall, up to a limit', () => {
    const soft = grassImpact(0, 0, -4, 0, 1);
    const hard = grassImpact(0, 0, -12, 0, 1);
    const harder = grassImpact(0, 0, -30, 0, 1);
    expect(hard?.radius).toBeGreaterThan(soft?.radius ?? 0);
    expect(hard?.strength).toBeGreaterThan(soft?.strength ?? 0);
    expect(harder).toEqual(hard);
  });
});
