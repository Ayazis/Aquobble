import { describe, expect, it } from 'vitest';
import { MOSS_HEIGHT, wallTint } from './wallTint';

describe('wallTint', () => {
  it('is plain stone above the moss line', () => {
    expect(wallTint('stone', MOSS_HEIGHT + 1)).toEqual(wallTint('stone', 5));
  });

  it('darkens and browns towards the ground', () => {
    const top = wallTint('stone', 3);
    const foot = wallTint('stone', 0);
    expect(foot.reduce((a, b) => a + b)).toBeLessThan(top.reduce((a, b) => a + b));
    expect(foot[0]).toBeGreaterThan(foot[2]);
  });

  it('leaves wood untouched by the gradient', () => {
    expect(wallTint('wood', 0)).toEqual(wallTint('wood', 3));
  });

  it('stays in range', () => {
    for (let y = 0; y < 3; y += 0.1) for (const c of wallTint('plinth', y)) expect(c).toBeGreaterThanOrEqual(0);
  });
});
