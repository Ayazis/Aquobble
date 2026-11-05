/** One decorative rock: where it sits and how it is shaped. Pure data. */
export interface RockPlacement {
  x: number;
  /** Base height, already sunk into the ground. */
  y: number;
  z: number;
  yaw: number;
  /** Small tilt about x (radians), so rocks do not all sit upright. */
  tilt: number;
  /** Uniform size (radius in metres of a unit rock). */
  scale: number;
  /** Vertical squash factor (below 1 flattens). */
  squash: number;
  /** Index of the geometry variant, in [0, variants). */
  variant: number;
}
