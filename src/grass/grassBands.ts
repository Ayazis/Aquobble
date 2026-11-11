import type { GrassBand, GrassQuality } from './GrassBand';

/** Full blades out to here (m), crossing over to the thinned band over the last few metres. */
const NEAR = 20;
/** Card band ends here; past it the ground shader paints grass fur. */
const FAR = 90;
/** Width (m) over which one band shrinks away while the next grows in. */
const CROSS = 6;
/**
 * Tufts per square metre of each band at full (desktop) density, before the density map thins them. The old
 * CPU scatter put about 15 tufts per m² on grassy ground; the near band matches it so the ground round the
 * player is covered in blades, not painted fur.
 */
const PER_M2 = { near: 36, mid: 10, cards: 0.4 };

/** Tiles per side so the grid reaches `radius` from the camera wherever it stands in its own tile. */
function gridFor(radius: number, tile: number): number {
  return 2 * Math.ceil(radius / tile) + 2;
}

function sideFor(perM2: number, tile: number, density: number): number {
  return Math.max(1, Math.round(Math.sqrt(perM2 * density) * tile));
}

/** The three bands of the grass field for a device: full blades, thinned blades, crossed-quad cards. */
export function grassBands({ density, midDistance }: GrassQuality): GrassBand[] {
  const mid = Math.max(midDistance, NEAR + CROSS * 1.5);
  const near: GrassBand = {
    shape: { kind: 'blades', blades: 5, halfWidth: 0.028 },
    tile: 8,
    grid: gridFor(NEAR + CROSS / 2, 8),
    side: sideFor(PER_M2.near, 8, density),
    fadeIn: [0, 0],
    fadeOut: [NEAR - CROSS / 2, NEAR + CROSS / 2],
  };
  const thinned: GrassBand = {
    shape: { kind: 'blades', blades: 4, halfWidth: 0.045 },
    tile: 8,
    grid: gridFor(mid, 8),
    side: sideFor(PER_M2.mid, 8, density),
    fadeIn: near.fadeOut,
    fadeOut: [mid - CROSS, mid],
  };
  const cards: GrassBand = {
    shape: { kind: 'cards', halfWidth: 0.35 },
    tile: 16,
    grid: gridFor(FAR, 16),
    side: sideFor(PER_M2.cards, 16, density),
    fadeIn: thinned.fadeOut,
    fadeOut: [FAR - CROSS * 2, FAR],
  };
  return [near, thinned, cards];
}

/** Where the card band has faded out: the ground fur takes over from here. */
export const GRASS_FUR_FROM = FAR - CROSS * 2;
