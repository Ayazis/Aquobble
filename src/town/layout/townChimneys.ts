import type { Vec3 } from '@core';

/**
 * Chimney tops per building model, in the model's own (unscaled, uncentred) coordinates, read from the GLBs:
 * the vertices that stand above the roof ridge. Models without a chimney are absent.
 */
export const TOWN_CHIMNEYS: Readonly<Record<string, readonly Vec3[]>> = {
  house_a: [{ x: -0.5, y: 7.0, z: -1.6 }],
  house_b: [{ x: -2.1, y: 6.9, z: 0 }],
  tavern: [{ x: 4.75, y: 9.0, z: 0 }],
  blacksmith: [{ x: 0.75, y: 6.5, z: -2.0 }],
};
