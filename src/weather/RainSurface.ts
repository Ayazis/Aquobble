/** Where rain lands and what it does there; wired in `app` from the water and effects slices. */
export interface RainSurface {
  /** Height a drop stops at over (x, z): the water surface where there is water, else the ground. */
  landingHeight(x: number, z: number): number;
  /** True where (x, z) is open water. */
  isWater(x: number, z: number): boolean;
  /** Ripple on the water (`RippleStamper.stamp`). */
  ripple(x: number, z: number, radius: number, strength: number): void;
  /** A tiny splash on the ground at (x, y, z). */
  splash(x: number, y: number, z: number): void;
}
