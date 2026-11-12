import type { GrassBand, GrassQuality } from './GrassBand';

/** Fine blades out to here (m), crossing over to the middle band over the last few metres. */
const NEAR = 20;
/** The far band ends here; past it the ground shader paints grass fur. */
const FAR = 150;
/** Width (m) over which one band thins away while the next grows in. */
const CROSS = 8;
/**
 * Blades per square metre of each band at full (desktop) density, before the density map thins them. Every
 * instance is one blade, so the near band is a few hundred to the square metre: the ground round the player is
 * hidden under blades. Further bands draw fewer, wider blades that cover the same ground.
 */
const PER_M2 = { near: 300, mid: 60, far: 8 };

function sideFor(perM2: number, tile: number, density: number): number {
  return Math.max(1, Math.round(Math.sqrt(perM2 * density) * tile));
}

/**
 * The three bands of the grass field for a device: fine blades, broader blades, wide far blades. A device that
 * draws fewer blades draws them wider, so the ground stays covered.
 */
export function grassBands({ density, midDistance }: GrassQuality): GrassBand[] {
  const mid = Math.max(midDistance + 20, NEAR + CROSS * 2);
  const widen = Math.min(1 / Math.sqrt(density), 1.7);
  const near: GrassBand = {
    segments: 5,
    halfWidth: 0.017 * widen,
    tile: 4,
    side: sideFor(PER_M2.near, 4, density),
    fadeIn: [0, 0],
    fadeOut: [NEAR - CROSS, NEAR],
  };
  const middle: GrassBand = {
    segments: 3,
    halfWidth: 0.042 * widen,
    tile: 8,
    side: sideFor(PER_M2.mid, 8, density),
    fadeIn: near.fadeOut,
    fadeOut: [mid - CROSS * 2, mid],
  };
  const far: GrassBand = {
    segments: 2,
    halfWidth: 0.13 * widen,
    tile: 16,
    side: sideFor(PER_M2.far, 16, density),
    fadeIn: middle.fadeOut,
    fadeOut: [FAR - CROSS * 3, FAR],
  };
  return [near, middle, far];
}

/** Where the far band has started thinning: the ground fur takes over from here. */
export const GRASS_FUR_FROM = FAR - CROSS * 3;
