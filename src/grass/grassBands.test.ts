import { describe, expect, it } from 'vitest';
import { grassBands } from './grassBands';

describe('grassBands', () => {
  const desktop = grassBands({ density: 1, midDistance: 45 });
  const phone = grassBands({ density: 0.5, midDistance: 30 });

  it('hands each band over where the one before it shrinks away', () => {
    for (let i = 1; i < desktop.length; i++) expect(desktop[i].fadeIn).toEqual(desktop[i - 1].fadeOut);
    expect(desktop[0].fadeOut[1]).toBeLessThanOrEqual(23);
    expect(desktop[1].fadeOut[1]).toBe(45);
    expect(phone[1].fadeOut[1]).toBe(30);
    expect(desktop[2].fadeOut[1]).toBe(90);
  });

  it('covers each band with its grid of tiles', () => {
    for (const band of desktop) expect(((band.grid - 2) / 2) * band.tile).toBeGreaterThanOrEqual(band.fadeOut[1]);
  });

  it('fills the ground near the camera with dense tufts, thinning further out', () => {
    const perM2 = (b: { side: number; tile: number }) => (b.side / b.tile) ** 2;
    expect(perM2(desktop[0])).toBeGreaterThanOrEqual(15);
    expect(perM2(desktop[1])).toBeLessThan(perM2(desktop[0]));
    expect(perM2(desktop[1])).toBeGreaterThanOrEqual(3);
    expect(perM2(desktop[2])).toBeLessThan(perM2(desktop[1]));
  });

  it('draws fewer tufts on a weaker device', () => {
    expect(phone[0].side).toBeLessThan(desktop[0].side);
    expect(phone[1].grid).toBeLessThan(desktop[1].grid);
  });
});
