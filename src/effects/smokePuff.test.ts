import { describe, expect, it } from 'vitest';
import { DEFAULT_SMOKE } from './SmokeConfig';
import { smokePuff } from './smokePuff';

const c = DEFAULT_SMOKE;

describe('smokePuff', () => {
  it('starts at the chimney, small and invisible', () => {
    const p = smokePuff(0, 0, 4, 0, c);
    expect(p.rise).toBeCloseTo(0);
    expect(p.drift).toBeCloseTo(0);
    expect(p.size).toBeCloseTo(c.startSize);
    expect(p.fade).toBeCloseTo(0);
  });

  it('rises, drifts, grows and fades out over its life', () => {
    const mid = smokePuff(c.lifetime * 0.5, 0, 4, 0, c);
    const late = smokePuff(c.lifetime * 0.99, 0, 4, 0, c);
    expect(late.rise).toBeGreaterThan(mid.rise);
    expect(late.drift).toBeGreaterThan(mid.drift);
    expect(late.size).toBeGreaterThan(mid.size);
    expect(late.fade).toBeLessThan(mid.fade);
    expect(late.fade).toBeLessThan(0.02);
    expect(mid.fade).toBeLessThanOrEqual(c.opacity);
  });

  it('loops every lifetime', () => {
    const a = smokePuff(1.3, 2, 5, 0.4, c);
    const b = smokePuff(1.3 + c.lifetime * 3, 2, 5, 0.4, c);
    expect(b.rise).toBeCloseTo(a.rise);
    expect(b.fade).toBeCloseTo(a.fade);
  });

  it('spaces the puffs of one chimney through the life', () => {
    const rises = [0, 1, 2, 3].map((i) => smokePuff(0.5, i, 4, 0, c).rise.toFixed(3));
    expect(new Set(rises).size).toBe(4);
  });
});
