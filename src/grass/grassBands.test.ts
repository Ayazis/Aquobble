import { describe, expect, it } from 'vitest';
import { grassBands } from './grassBands';

describe('grassBands', () => {
  const desktop = grassBands({ density: 1, midDistance: 45 });
  const phone = grassBands({ density: 0.35, midDistance: 30 });

  it('hands each band over where the one before it thins away', () => {
    for (let i = 1; i < desktop.length; i++) expect(desktop[i].fadeIn).toEqual(desktop[i - 1].fadeOut);
    expect(desktop[1].fadeOut[1]).toBe(65);
    expect(phone[1].fadeOut[1]).toBe(50);
    expect(desktop[2].fadeOut[1]).toBe(150);
  });

  it('hides the ground near the camera under blades, with fewer and wider ones further out', () => {
    const perM2 = (b: { side: number; tile: number }) => (b.side / b.tile) ** 2;
    expect(perM2(desktop[0])).toBeGreaterThanOrEqual(250);
    for (let i = 1; i < desktop.length; i++) {
      expect(perM2(desktop[i])).toBeLessThan(perM2(desktop[i - 1]));
      expect(desktop[i].halfWidth).toBeGreaterThan(desktop[i - 1].halfWidth);
      expect(desktop[i].segments).toBeLessThan(desktop[i - 1].segments);
      // Fewer blades, but each covers more: the ground stays covered.
      expect(perM2(desktop[i]) * desktop[i].halfWidth).toBeGreaterThan(1);
    }
  });

  it('draws fewer but wider blades on a weaker device', () => {
    for (let i = 0; i < desktop.length; i++) {
      expect(phone[i].side).toBeLessThan(desktop[i].side);
      expect(phone[i].halfWidth).toBeGreaterThan(desktop[i].halfWidth);
    }
  });
});
