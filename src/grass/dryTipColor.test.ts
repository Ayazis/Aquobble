import { dryTipColor } from './dryTipColor';

describe('dryTipColor', () => {
  const green = [0.1, 0.3, 0.05];

  it('keeps the tip colour on green ground', () => {
    expect(dryTipColor(green, 0)).toEqual(green);
  });

  it('turns tips yellow, not green, on dry ground', () => {
    const [r, g, b] = dryTipColor(green, 1);
    expect(r).toBeGreaterThan(0.3);
    expect(r / g).toBeGreaterThan(green[0] / green[1]);
    expect(b).toBeLessThan(r);
  });
});
