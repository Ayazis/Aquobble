import { describe, expect, it } from 'vitest';
import { dry, DRYING_SECONDS } from './WetnessSystem';

describe('wetness', () => {
  it('rises to the deepest wade and dries over the drying time', () => {
    const wet = { line: 0, amount: 0, sinceLeft: 0, feetY: 0 };
    dry(wet, 0.3, 0.1);
    dry(wet, 0.6, 0.1);
    dry(wet, 0.2, 0.1);
    expect(wet.line).toBeCloseTo(0.6);
    dry(wet, -1, DRYING_SECONDS / 2);
    expect(wet.amount).toBeCloseTo(0.5);
    expect(wet.sinceLeft).toBeCloseTo(DRYING_SECONDS / 2);
    dry(wet, -1, DRYING_SECONDS);
    expect(wet.amount).toBe(0);
  });
});
