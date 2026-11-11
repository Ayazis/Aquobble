import { describe, expect, it } from 'vitest';
import { sunGlow } from './sunGlow';

describe('sunGlow', () => {
  it('is off below the horizon and full once the sun is up', () => {
    expect(sunGlow(-0.1)).toBe(0);
    expect(sunGlow(0.04)).toBe(1);
    expect(sunGlow(0.8)).toBe(1);
  });

  it('rises smoothly through the horizon', () => {
    expect(sunGlow(0)).toBeGreaterThan(0);
    expect(sunGlow(0)).toBeLessThan(sunGlow(0.02));
  });
});
