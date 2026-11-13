import { describe, expect, it } from 'vitest';
import { SeaStateSystem } from './SeaStateSystem';
import { ShoreWaveField } from './ShoreWaveField';
import { SURF, SURF_SHAPE, surfHeight, surfPhase } from './surf';

describe('surf', () => {
  it('stays inside its depth band and never raises the sea on average', () => {
    expect(surfHeight(0, 3, 4, 1)).toBe(0);
    expect(surfHeight(SURF.deep, 3, 4, 1)).toBe(0);
    let sum = 0;
    let highest = -Infinity;
    for (let i = 0; i < 400; i++) {
      const h = surfHeight(SURF.peak, 3, 4, (i / 400) * SURF.period);
      sum += h;
      highest = Math.max(highest, h);
    }
    expect(sum / 400).toBeCloseTo(0, 4);
    expect(highest).toBeCloseTo(SURF.height * (1 - SURF_SHAPE.mean), 3);
  });

  it('rolls in towards the beach, slower and closer together as the water shallows', () => {
    // The same phase is found in shallower water a moment later.
    const phase = surfPhase(1, 0, 0, 0);
    const travel = (depth: number) => (2 * Math.sqrt(depth / 9.81)) / SURF.slope;
    const later = 0.5;
    const shallower = ((travel(1) - later) * SURF.slope) ** 2 * (9.81 / 4);
    expect(shallower).toBeLessThan(1);
    expect(surfPhase(shallower, 0, 0, later)).toBeCloseTo(phase, 6);
    // Crests are a full turn of phase apart: that takes less depth (so less beach) near the shore.
    const turnDepth = (from: number) => {
      let d = from;
      while (surfPhase(d, 0, 0, 0) - surfPhase(from, 0, 0, 0) < 2 * Math.PI) d += 0.001;
      return d - from;
    };
    expect(turnDepth(0.1)).toBeLessThan(turnDepth(0.6));
  });

  it('leans its crest towards the beach', () => {
    expect(SURF_SHAPE.crest).toBeLessThan(Math.PI / 2);
    expect(SURF_SHAPE.crest + SURF.lean * Math.sin(SURF_SHAPE.crest)).toBeCloseTo(Math.PI / 2, 6);
  });
});

describe('ShoreWaveField', () => {
  it('adds the surf to the swell, scaled by the sea state', () => {
    const swell = { waveHeightAt: () => 0.25, waveNormalAt: () => ({ x: 0, y: 1, z: 0 }) };
    let state = 1;
    const field = new ShoreWaveField(
      swell,
      (x) => (x < 0 ? 5 : SURF.peak),
      () => state,
    );
    expect(field.waveHeightAt(-1, 0, 2)).toBe(0.25);
    const surf = surfHeight(SURF.peak, 1, 0, 2);
    expect(field.waveHeightAt(1, 0, 2)).toBeCloseTo(0.25 + surf, 9);
    state = 0.5;
    expect(field.waveHeightAt(1, 0, 2)).toBeCloseTo(0.25 + surf / 2, 9);
    expect(field.waveNormalAt(1, 0, 2).y).toBe(1);
  });
});

describe('SeaStateSystem', () => {
  it('starts at the sea the wind calls for, then follows it slowly', () => {
    let strength = 0;
    const wind = { direction: () => ({ x: 1, z: 0 }), strength: () => strength, gust: () => 0 };
    const swell = { value: 1 };
    const breeze = { value: { z: 0.5 } };
    const system = new SeaStateSystem(wind, () => 0, swell, breeze);
    system.update(1 / 60);
    const calm = swell.value;
    expect(calm).toBeLessThan(1);
    expect(breeze.value.z).toBe(0);
    strength = 1;
    system.update(1);
    expect(swell.value).toBeGreaterThan(calm);
    expect(swell.value).toBeLessThan(calm + 0.1);
    for (let i = 0; i < 300; i++) system.update(1);
    expect(swell.value).toBeGreaterThan(1.3);
    expect(breeze.value.z).toBeCloseTo(1, 2);
  });
});
