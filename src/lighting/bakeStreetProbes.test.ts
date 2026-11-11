import { describe, expect, it } from 'vitest';
import { bakeSh, bakeStreetProbes, sphere } from './bakeStreetProbes';

const lamp = (x: number) => ({ glass: { x, y: 4, z: 0 }, ground: { x, y: 0, z: 0 } });

describe('bakeStreetProbes', () => {
  it('bakes an open meadow to no change', () => {
    const sh = bakeSh({ x: 0, y: 0, z: 0 }, sphere(48), () => null);
    expect(sh[0]).toBe(1);
    expect(Math.abs(sh[2])).toBeLessThan(0.1);
  });

  it('keeps only enclosed lamps, most enclosed first, with sky open above', () => {
    // Walls everywhere sideways around the lamp at x = 5, only the sky open; the lamp at x = 0 is open.
    const alley = (o: { x: number }, d: { y: number }) => (o.x === 5 && d.y < 0.5 ? 2 : null);
    const probes = bakeStreetProbes([lamp(0), lamp(5)], alley, 8);
    expect(probes).toHaveLength(1);
    expect(probes[0].position.x).toBe(5);
    expect(probes[0].sh[0]).toBeLessThan(0.8);
  });
});
