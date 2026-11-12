/** What one kind of wildflower looks like; lengths in metres at scale 1. */
export interface FlowerShape {
  /** Stem height. */
  height: number;
  petals: number;
  /** Petal length and widest width. */
  length: number;
  width: number;
  /** How far petals lift above flat (radians): 0 is a flat daisy, towards 1 a cupped poppy. */
  cup: number;
  /** Petal and centre colours (sRGB hex). */
  petal: number;
  centre: number;
  /** Radius of the centre disc. */
  centreSize: number;
  /** For flower spikes: this many small heads up the top of the stem instead of one at its tip. */
  florets?: number;
}

/** The meadow's wildflowers; a placement's `variant` indexes this, wrapping. */
export const FLOWER_SHAPES: readonly FlowerShape[] = [
  // Buttercup: a few broad glossy yellow petals, cupped.
  { height: 0.3, petals: 5, length: 0.05, width: 0.05, cup: 0.6, petal: 0xf5d63a, centre: 0xd9a514, centreSize: 0.014 },
  // Daisy: many thin white rays round a yellow disc.
  {
    height: 0.36,
    petals: 13,
    length: 0.07,
    width: 0.022,
    cup: 0.12,
    petal: 0xf1f1ec,
    centre: 0xf0c020,
    centreSize: 0.026,
  },
  // Lupin: a spike of small purple bells.
  {
    height: 0.62,
    petals: 4,
    length: 0.03,
    width: 0.028,
    cup: 0.9,
    petal: 0xb06ad0,
    centre: 0x7a4aa8,
    centreSize: 0.008,
    florets: 11,
  },
  // Poppy: four wide red petals round a dark eye, on a tall thin stem.
  {
    height: 0.5,
    petals: 4,
    length: 0.075,
    width: 0.09,
    cup: 0.5,
    petal: 0xe2463a,
    centre: 0x2a1c20,
    centreSize: 0.018,
  },
  // Cornflower: a ruff of narrow blue petals.
  {
    height: 0.44,
    petals: 9,
    length: 0.055,
    width: 0.026,
    cup: 0.4,
    petal: 0x5f86f0,
    centre: 0x3a3fa8,
    centreSize: 0.016,
  },
];
