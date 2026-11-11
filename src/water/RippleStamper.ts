/**
 * Port: disturbs the ripple height field (2.5). Anyone may stamp: footsteps, wakes, splashes, drips, rain.
 * Stamps outside the simulated box round the player are ignored.
 */
export interface RippleStamper {
  /**
   * Pushes the water down at (x, z) over `radius` m. `strength` about 0.05 (a drip) to 1 (a big splash).
   * `foam` (0..1) leaves a fading foam patch there too.
   */
  stamp(x: number, z: number, radius: number, strength: number, foam?: number): void;
}
