import { describe, expect, it } from 'vitest';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import { sampleDayCycle } from './sampleDayCycle';

describe('DEFAULT_DAY_KEYFRAMES colour grade', () => {
  const noon = sampleDayCycle(DEFAULT_DAY_KEYFRAMES, 0.5);
  const midnight = sampleDayCycle(DEFAULT_DAY_KEYFRAMES, 0);

  it('is calmer at night: less saturation and contrast than at noon', () => {
    expect(midnight.gradeSaturation).toBeLessThan(noon.gradeSaturation);
    expect(midnight.gradeContrast).toBeLessThan(noon.gradeContrast);
  });

  it('lifts the blacks at night only', () => {
    expect(noon.gradeLift).toBe(0);
    expect(midnight.gradeLift).toBeGreaterThan(0);
  });
});
