import { describe, expect, it } from 'vitest';
import { outlinesEnabled } from './outlinesEnabled';

describe('outlinesEnabled', () => {
  it('is on by default', () => {
    expect(outlinesEnabled('')).toBe(true);
    expect(outlinesEnabled('?debug')).toBe(true);
    expect(outlinesEnabled('?outlines=1')).toBe(true);
  });

  it('turns off with ?outlines=0', () => {
    expect(outlinesEnabled('?outlines=0')).toBe(false);
    expect(outlinesEnabled('?debug&outlines=off')).toBe(false);
  });
});
