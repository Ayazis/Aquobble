import { describe, expect, it } from 'vitest';
import { adaptedExposure } from './adaptedExposure';
import { Atmosphere } from './Atmosphere';
import { luma } from './rgb';
import { skyLighting } from './skyLighting';
import { sunDirectionAt } from './sunDirectionAt';

const atmosphere = new Atmosphere();
const at = (time: number, overcast = 0) => skyLighting(atmosphere, sunDirectionAt(time, 200, 62), overcast);

describe('Atmosphere', () => {
  it('reddens and dims the sun towards the horizon', () => {
    const high = atmosphere.sunColour({ x: 0, y: 0.9, z: 0.436 });
    const low = atmosphere.sunColour({ x: 0, y: 0.05, z: 0.999 });
    expect(luma(low)).toBeLessThan(luma(high) * 0.3);
    expect(low[0] / low[2]).toBeGreaterThan((high[0] / high[2]) * 3);
  });

  it('makes the clear sky blue overhead and paler at the horizon', () => {
    const sun = { x: 0.3, y: 0.8, z: 0.52 };
    const zenith = atmosphere.skyRadiance({ x: 0, y: 1, z: 0 }, sun);
    const horizon = atmosphere.skyRadiance({ x: -0.99, y: 0.1, z: 0 }, sun);
    expect(zenith[2]).toBeGreaterThan(zenith[0] * 2);
    expect(luma(horizon)).toBeGreaterThan(luma(zenith));
  });
});

describe('skyLighting', () => {
  it('lights the day with the sun and the night with a dim blue moon from the other side', () => {
    const noon = at(0.5);
    const midnight = at(0);
    expect(noon.night).toBe(0);
    expect(midnight.night).toBe(1);
    expect(noon.lightDir.y).toBeGreaterThan(0);
    expect(midnight.lightDir.y).toBeGreaterThan(0);
    expect(luma(midnight.key)).toBeLessThan(luma(noon.key) * 0.3);
    expect(midnight.key[2]).toBeGreaterThan(midnight.key[0]);
    expect(luma(midnight.fill)).toBeGreaterThan(0);
    expect(luma(noon.fill)).toBe(0);
  });

  it('fades the key light out as sun and moon swap at the horizon', () => {
    expect(luma(at(0.25).key)).toBeCloseTo(0, 5);
    expect(luma(at(0.75).key)).toBeCloseTo(0, 5);
  });

  it('dims the sun under an overcast sky', () => {
    expect(luma(at(0.5, 1).key)).toBeLessThan(luma(at(0.5).key) * 0.3);
  });

  it('glows on the horizon only around sunset and sunrise', () => {
    expect(luma(at(0.5).twilight)).toBe(0);
    expect(luma(at(0.76).twilight)).toBeGreaterThan(0);
    expect(luma(at(0).twilight)).toBe(0);
  });
});

describe('adaptedExposure', () => {
  it('leaves noon alone, opens up for a low sun and hands over to the base exposure at night', () => {
    expect(adaptedExposure(1, 0.5, 0.5, 0)).toBe(1);
    const dusk = adaptedExposure(1, 0.05, 0.5, 0);
    expect(dusk).toBeGreaterThan(3);
    expect(dusk).toBeLessThan(10);
    expect(adaptedExposure(1, 0.0001, 0.5, 1)).toBe(1);
    expect(adaptedExposure(1, 0.0001, 0.5, 0)).toBeLessThanOrEqual(14);
  });
});
