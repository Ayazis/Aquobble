/** How the water changes walking: a speed factor, and whether the character swims instead of walking. */
export interface WaterMovement {
  speedScale: number;
  swimming: boolean;
}

/** Past this fraction of the height under water the character swims. */
const SWIM_FRACTION = 0.65;
const SLOWEST_WADE = 0.5;
const SWIM_SPEED = 0.55;

/** `immersion`: water above the feet (m); `height`: the character's height (m). */
export function waterMovement(immersion: number, height: number): WaterMovement {
  const swimDepth = height * SWIM_FRACTION;
  if (immersion >= swimDepth) return { speedScale: SWIM_SPEED, swimming: true };
  if (immersion <= 0) return { speedScale: 1, swimming: false };
  return { speedScale: 1 - (1 - SLOWEST_WADE) * (immersion / swimDepth), swimming: false };
}

/** Depth (m) of the feet below the surface while floating, so the head stays above water. */
export function swimFloatDepth(height: number): number {
  return height * SWIM_FRACTION;
}
