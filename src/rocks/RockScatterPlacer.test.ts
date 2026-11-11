import { SeededRandom } from '@core';
import { RockScatterPlacer, type RockScatterOptions } from './RockScatterPlacer';

const base: RockScatterOptions = {
  clusters: 40,
  clusterSize: 4,
  extent: 30,
  waterLevel: 0,
  maxHeight: 100,
  minScale: 0.3,
  maxScale: 2,
  variants: 3,
};

describe('RockScatterPlacer', () => {
  // Flat at height 5 for x < 0, a steep ramp for x >= 0.
  const ground = { heightAt: (x: number) => (x < 0 ? 5 : 5 + x * 2) };

  it('places rocks with valid shapes, sunk into the ground', () => {
    const rocks = new RockScatterPlacer(ground, new SeededRandom(1)).place(base);
    expect(rocks.length).toBeGreaterThan(40);
    for (const r of rocks) {
      expect(r.y).toBeLessThanOrEqual(ground.heightAt(r.x));
      expect(r.scale).toBeGreaterThanOrEqual(0.3);
      expect(r.scale).toBeLessThanOrEqual(2);
      expect(r.squash).toBeLessThanOrEqual(1);
      if (r.family === 'pebbles') expect(r.x).toBeLessThan(1);
      else expect(r.y).toBeLessThan(ground.heightAt(r.x));
      if (r.family === 'stone') expect(r.scale).toBeLessThan(0.9);
      expect(r.variant).toBeGreaterThanOrEqual(0);
      expect(r.variant).toBeLessThan(3);
    }
  });

  it('prefers slopes over flat ground', () => {
    const rocks = new RockScatterPlacer(ground, new SeededRandom(2)).place({ ...base, clusters: 100 });
    const onSlope = rocks.filter((r) => r.x >= 0).length;
    expect(onSlope).toBeGreaterThan((rocks.length - onSlope) * 2);
  });

  it('favours the shoreline on flat ground', () => {
    const placer = new RockScatterPlacer({ heightAt: () => 1 }, new SeededRandom(3));
    expect(placer.weight(0, 0, 0)).toBeGreaterThan(placer.weight(0, 0, -10));
  });

  it('keeps out of exclusion zones and water', () => {
    const exclude = [{ minX: -10, maxX: 10, minZ: -10, maxZ: 10 }];
    const sea = { heightAt: (x: number) => x / 3 };
    const rocks = new RockScatterPlacer(sea, new SeededRandom(4)).place({ ...base, exclude });
    for (const r of rocks) {
      expect(Math.abs(r.x) < 10 && Math.abs(r.z) < 10).toBe(false);
      expect(sea.heightAt(r.x)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sets large outcrops on steep ground only, with scree below them', () => {
    const none = new RockScatterPlacer(ground, new SeededRandom(5)).place({ ...base, clusters: 0, outcrops: 3 });
    expect(none.length).toBeGreaterThan(3 * 6);
    const blocks = none.filter((r) => r.scale > base.maxScale * 0.9 && r.family !== 'pebbles');
    expect(blocks.length).toBeGreaterThanOrEqual(3 * 2);
    for (const b of blocks) expect(b.x).toBeGreaterThanOrEqual(-3);
    // Scree lies downhill (towards -x on this ramp) of the blocks.
    const small = none.filter((r) => !blocks.includes(r));
    const mean = (rocks: typeof none) => rocks.reduce((sum, r) => sum + ground.heightAt(r.x), 0) / rocks.length;
    expect(mean(small)).toBeLessThan(mean(blocks));
    const flat = new RockScatterPlacer({ heightAt: () => 3 }, new SeededRandom(5));
    expect(flat.place({ ...base, clusters: 0, outcrops: 3 })).toEqual([]);
  });

  it('strews pebbles along the beach only', () => {
    const shore = { heightAt: (x: number) => x / 10 };
    const rocks = new RockScatterPlacer(shore, new SeededRandom(6)).place({ ...base, clusters: 0, beachPebbles: 20 });
    expect(rocks).toHaveLength(20);
    for (const r of rocks) {
      expect(r.x / 10).toBeGreaterThan(0);
      expect(r.x / 10).toBeLessThan(0.9);
    }
    expect(rocks.filter((r) => r.family === 'pebbles').length).toBeGreaterThan(10);
  });

  it('is reproducible for a seed', () => {
    const a = new RockScatterPlacer(ground, new SeededRandom(7)).place(base);
    const b = new RockScatterPlacer(ground, new SeededRandom(7)).place(base);
    expect(a).toEqual(b);
  });
});
