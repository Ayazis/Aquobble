import { SeededRandom } from '@core';
import type { GrassBlocker } from './GrassBlocker';
import { patchiness } from './patchiness';
import { TallTuftPlacer } from './TallTuftPlacer';

describe('TallTuftPlacer', () => {
  // Rises 0.1 m per metre along x from the sea (height 0 at x = 0).
  const ground = { heightAt: (x: number) => x * 0.1 };
  const rules = { minHeight: 0.2, maxHeight: 50, maxSlope: 1 };
  const clumps = { clumps: 20, perClump: 6, radius: 1.5, extent: 120 };

  it('grows seed heads only in thick, low meadow and off lawns', () => {
    const lawn = { minX: 20, maxX: 40, minZ: -120, maxZ: 120 };
    const tufts = new TallTuftPlacer(ground, new SeededRandom(3), { ...rules, lawns: [lawn] }).seedHeads(clumps);
    expect(tufts.length).toBeGreaterThan(40);
    for (const t of tufts) {
      expect(patchiness(t.x, t.z)).toBeGreaterThan(0.55);
      expect(t.y).toBeLessThan(9);
      expect(t.x <= 20 || t.x >= 40).toBe(true);
    }
  });

  it('puts reeds around each pond edge and on the low shore', () => {
    const pond: GrassBlocker = { kind: 'circle', x: 50, z: 10, radius: 5 };
    const pondClumps = { ...clumps, clumps: 8 };
    const reeds = new TallTuftPlacer(ground, new SeededRandom(4), rules).reeds(pondClumps, clumps, [pond], 0.2);
    const atPond = reeds.filter((r) => Math.hypot(r.x - 50, r.z - 10) < 7.5);
    expect(atPond.length).toBeGreaterThan(20);
    for (const r of atPond) expect(Math.hypot(r.x - 50, r.z - 10)).toBeGreaterThan(5 * 0.8 - 1.6);
    const shore = reeds.filter((r) => !atPond.includes(r));
    expect(shore.length).toBeGreaterThan(20);
    for (const r of shore) expect(r.y + 0.05).toBeLessThan(0.2 + 1.1);
  });

  it('keeps reeds off blockers along the shore', () => {
    const blocker: GrassBlocker = { kind: 'circle', x: 7, z: 0, radius: 200 };
    const reeds = new TallTuftPlacer(ground, new SeededRandom(4), { ...rules, blockers: [blocker] }).reeds(
      clumps,
      clumps,
      [],
      0.2,
    );
    expect(reeds).toEqual([]);
  });

  it('is reproducible for the same seed', () => {
    const a = new TallTuftPlacer(ground, new SeededRandom(8), rules).seedHeads(clumps);
    const b = new TallTuftPlacer(ground, new SeededRandom(8), rules).seedHeads(clumps);
    expect(a).toEqual(b);
  });
});
