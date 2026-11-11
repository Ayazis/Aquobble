import { GRASS_RINGS } from './grassRings';
import { ringFade } from './ringFade';

describe('ringFade', () => {
  const { near, far } = GRASS_RINGS;

  it('draws only the near ring at the feet and only the far ring in the distance', () => {
    expect(ringFade(near, 2)).toBe(1);
    expect(ringFade(far, 2)).toBe(0);
    expect(ringFade(near, 30)).toBe(0);
    expect(ringFade(far, 30)).toBe(1);
    expect(ringFade(far, 80)).toBe(0);
  });

  it('leaves no bare band where the rings cross over', () => {
    for (let d = 0; d <= 50; d += 0.5) expect(ringFade(near, d) + ringFade(far, d)).toBeGreaterThan(0.6);
  });

  it('makes near blades narrower and the far tufts carry fewer blades', () => {
    expect(near.halfWidth * 2).toBeLessThan(far.halfWidth);
    expect(far.blades).toBeLessThan(near.blades);
  });
});
