/**
 * Every size that follows from a character's standing height: the capsule collider, where the camera
 * looks, how far it may zoom, and how wide the grass parts around the feet. One height number in
 * `GameConfig` drives all of them, so resizing the character keeps them in proportion.
 */
export interface CharacterBuild {
  height: number;
  /** Capsule: half the straight middle part, and the radius of its ends (total height = 2 * (half + radius)). */
  halfHeight: number;
  radius: number;
  /** Camera look-at point above the capsule centre. */
  cameraHeight: number;
  minCameraDistance: number;
  maxCameraDistance: number;
  /** Radius within which grass bends away. */
  bendRadius: number;
}

/** Builds the derived sizes for a character `height` metres tall; `slim` scales the collider radius. */
export function characterBuild(height: number, slim = 1): CharacterBuild {
  const radius = 0.22 * height * slim;
  return {
    height,
    halfHeight: height / 2 - radius,
    radius,
    cameraHeight: 0.39 * height,
    minCameraDistance: 1.1 * height,
    maxCameraDistance: 14 * height,
    bendRadius: 0.5 * height,
  };
}
