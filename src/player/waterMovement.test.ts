import { swimFloatDepth, waterMovement } from './waterMovement';

describe('waterMovement', () => {
  it('walks on dry land, wades slower as the water rises, then swims', () => {
    expect(waterMovement(-1, 1.8)).toEqual({ speedScale: 1, swimming: false });
    const knee = waterMovement(0.4, 1.8);
    const waist = waterMovement(1, 1.8);
    expect(knee.speedScale).toBeLessThan(1);
    expect(waist.speedScale).toBeLessThan(knee.speedScale);
    expect(waist.swimming).toBe(false);
    expect(waterMovement(1.5, 1.8).swimming).toBe(true);
    expect(swimFloatDepth(1.8)).toBeCloseTo(1.17);
  });
});
