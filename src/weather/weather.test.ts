import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { soak, SOAK_SECONDS } from './WeatherSystem';
import { WeatherSchedule } from './WeatherSchedule';

describe('WeatherSchedule', () => {
  it('is reproducible for a seed, whatever the sampling order', () => {
    const a = new WeatherSchedule(new SeededRandom(7));
    const b = new WeatherSchedule(new SeededRandom(7));
    b.mixAt(5, 12);
    for (let day = 0; day < 6; day++)
      for (let h = 0; h < 24; h += 0.5) expect(a.mixAt(day, h)).toEqual(b.mixAt(day, h));
  });

  it('keeps every value in [0, 1] and changes smoothly', () => {
    const s = new WeatherSchedule(new SeededRandom(3));
    let prev = s.mixAt(0, 0);
    for (let t = 0.01; t < 24 * 10; t += 0.01) {
      const mix = s.mixAt(Math.floor(t / 24), t % 24);
      for (const k of ['overcast', 'rain', 'mist'] as const) {
        expect(mix[k]).toBeGreaterThanOrEqual(0);
        expect(mix[k]).toBeLessThanOrEqual(1);
        expect(Math.abs(mix[k] - prev[k])).toBeLessThan(0.05);
      }
      prev = mix;
    }
  });

  it('opens on a fair first morning and has rain and mist on some days', () => {
    const s = new WeatherSchedule(new SeededRandom(11));
    expect(s.kindAt(0, 1)).toBe('clear');
    let rain = 0;
    let mist = 0;
    for (let day = 0; day < 30; day++) {
      rain += s.mixAt(day, 15).rain;
      mist += s.mixAt(day, 6.5).mist;
    }
    expect(rain).toBeGreaterThan(0);
    expect(mist).toBeGreaterThan(0);
  });
});

describe('soak', () => {
  it('soaks in rain and dries after', () => {
    let w = 0;
    for (let i = 0; i < SOAK_SECONDS * 2; i++) w = soak(w, 1, 1);
    expect(w).toBe(1);
    w = soak(w, 0, 1);
    expect(w).toBeLessThan(1);
    expect(w).toBeGreaterThan(0.99);
  });
});
