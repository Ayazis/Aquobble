import { SeededRandom } from '@core';
import { createWindUniforms } from './WindUniforms';
import { gustAt } from './gustAt';
import { SeededWind } from './SeededWind';
import { windStrengthAtHour } from './windStrengthAtHour';
import { WindSystem } from './WindSystem';

describe('windStrengthAtHour', () => {
  it('is calm at dawn and gusty in the afternoon, wrapping at midnight', () => {
    expect(windStrengthAtHour(5)).toBeLessThan(0.1);
    expect(windStrengthAtHour(15)).toBeGreaterThan(0.85);
    expect(windStrengthAtHour(24)).toBeCloseTo(windStrengthAtHour(0));
    expect(windStrengthAtHour(14.5)).toBeCloseTo(0.875);
  });
});

describe('gustAt', () => {
  const fronts = { spacing: 10, speed: 2, phase: 0 };
  const dir = { x: 1, z: 0 };

  it('matches fixed values on the wind axis', () => {
    expect(gustAt(0, 0, 0, dir, 1, fronts)).toBe(0);
    expect(gustAt(1.2, 0, 0, dir, 1, fronts)).toBeCloseTo(1, 5);
    expect(gustAt(1.2, 0, 0, dir, 0.5, fronts)).toBeCloseTo(0.5, 5);
  });

  it('moves downwind at the front speed', () => {
    const T = 10 * Math.PI; // a full turn of the time wobble
    const now = gustAt(3, 0, 0, dir, 1, fronts);
    expect(gustAt(3 + 2 * T, 0, T, dir, 1, fronts)).toBeCloseTo(now, 5);
  });
});

describe('SeededWind', () => {
  it('is reproducible, unit length and turns only slowly', () => {
    const a = new SeededWind(new SeededRandom(3), () => 15);
    const b = new SeededWind(new SeededRandom(3), () => 15);
    expect(a.direction(42)).toEqual(b.direction(42));
    const d = a.direction(100);
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1);
    const e = a.direction(101);
    expect(Math.acos(d.x * e.x + d.z * e.z)).toBeLessThan(0.05);
  });

  it('follows the hour and keeps gusts within [0, 1]', () => {
    let hour = 5;
    const wind = new SeededWind(new SeededRandom(3), () => hour);
    const calm = wind.strength(0);
    hour = 15;
    expect(wind.strength(0)).toBeGreaterThan(calm * 4);
    for (let x = -50; x <= 50; x += 7) {
      const g = wind.gust(x, x * 0.3, 12);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
    }
  });
});

describe('WindSystem', () => {
  it('copies the wind into the uniforms each frame', () => {
    const wind = new SeededWind(new SeededRandom(9), () => 14);
    const uniforms = createWindUniforms();
    const system = new WindSystem(wind, uniforms, wind.fronts);
    system.update(0.5);
    system.update(0.5);
    const dir = wind.direction(1);
    expect(system.elapsed).toBe(1);
    expect(uniforms.uWindTime.value).toBe(1);
    expect(uniforms.uWindDirection.value.x).toBeCloseTo(dir.x);
    expect(uniforms.uWindDirection.value.y).toBeCloseTo(dir.z);
    expect(uniforms.uWindStrength.value).toBeCloseTo(wind.strength(1));
    expect(uniforms.uGustFronts.value.x).toBe(wind.fronts.spacing);
  });
});
