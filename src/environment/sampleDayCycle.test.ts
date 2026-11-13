import { describe, expect, it } from 'vitest';
import type { DayKeyframe } from './DayKeyframe';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import { lerpColor, sampleDayCycle } from './sampleDayCycle';
import { sunDirectionAt } from './sunDirectionAt';

const base: Omit<DayKeyframe, 'time' | 'sunIntensity' | 'exposure'> = {
  hemisphereIntensity: 0,
  environmentIntensity: 0,
  fogDensity: 0,
  gradeSaturation: 1,
  gradeContrast: 1,
  gradeLift: 0,
};
const frames: DayKeyframe[] = [
  { time: 0.25, ...base, exposure: 1, sunIntensity: 0 },
  { time: 0.75, ...base, exposure: 3, sunIntensity: 2 },
];

describe('sampleDayCycle', () => {
  it('returns a keyframe exactly at its time', () => {
    expect(sampleDayCycle(frames, 0.75).sunIntensity).toBe(2);
    expect(sampleDayCycle(frames, 0.25).exposure).toBe(1);
  });

  it('interpolates between neighbours', () => {
    const mid = sampleDayCycle(frames, 0.5);
    expect(mid.sunIntensity).toBeCloseTo(1);
    expect(mid.exposure).toBeCloseTo(2);
  });

  it('wraps across midnight', () => {
    expect(sampleDayCycle(frames, 0).sunIntensity).toBeCloseTo(1);
    expect(sampleDayCycle(frames, 1).sunIntensity).toBeCloseTo(1);
    expect(sampleDayCycle(frames, -0.5).sunIntensity).toBeCloseTo(1);
  });

  it('thickens the haze at night with the default keyframes', () => {
    const noon = sampleDayCycle(DEFAULT_DAY_KEYFRAMES, 0.5);
    const night = sampleDayCycle(DEFAULT_DAY_KEYFRAMES, 0);
    expect(night.fogDensity).toBeGreaterThan(noon.fogDensity);
  });
});

describe('lerpColor', () => {
  it('blends each channel', () => {
    expect(lerpColor(0x000000, 0xffffff, 0)).toBe(0x000000);
    expect(lerpColor(0x000000, 0xffffff, 1)).toBe(0xffffff);
    expect(lerpColor(0x102030, 0x304050, 0.5)).toBe(0x203040);
  });
});

describe('sunDirectionAt', () => {
  it('rises at 0.25, peaks at noon and is below the horizon at midnight', () => {
    expect(sunDirectionAt(0.25, 200, 60).y).toBeCloseTo(0);
    expect(sunDirectionAt(0.5, 200, 60).y).toBeCloseTo(Math.sin(Math.PI / 3));
    expect(sunDirectionAt(0, 200, 60).y).toBeLessThan(0);
  });

  it('returns unit vectors', () => {
    const d = sunDirectionAt(0.37, 120, 50);
    expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1);
  });
});
