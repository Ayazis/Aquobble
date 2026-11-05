import { describe, expect, it } from 'vitest';
import { turnTowards } from './turnTowards';

describe('turnTowards', () => {
  it('snaps when within one step', () => expect(turnTowards(0, 0.1, 0.5)).toBe(0.1));
  it('limits the turn per step', () => expect(turnTowards(0, 2, 0.5)).toBe(0.5));
  it('goes the short way across ±π', () => expect(turnTowards(3, -3, 0.1)).toBeCloseTo(3.1));
});
