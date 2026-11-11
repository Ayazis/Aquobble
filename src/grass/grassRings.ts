import type { GrassRing } from './GrassRing';

/**
 * Near the camera: narrow, five-blade tufts, drawn densely out to 20 m. Further out: fewer, wider three-blade
 * tufts that grow in as the near ring shrinks away, so the two cross over between 12 and 20 m.
 */
export const GRASS_RINGS: { near: GrassRing; far: GrassRing } = {
  near: { blades: 5, halfWidth: 0.016, fadeIn: [0, 0], fadeOut: [14, 20] },
  far: { blades: 3, halfWidth: 0.04, fadeIn: [12, 18], fadeOut: [55, 75] },
};
