import { describe, expect, it } from 'vitest';
import { isScaleMode } from './isScaleMode';

describe('isScaleMode', () => {
  it('needs both debug and scale', () => {
    expect(isScaleMode('?debug&scale')).toBe(true);
    expect(isScaleMode('?scale')).toBe(false);
    expect(isScaleMode('?debug')).toBe(false);
  });
});
