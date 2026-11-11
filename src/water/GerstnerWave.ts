/** One Gerstner wave. The water shader (lane C) should use the same numbers. */
export interface GerstnerWave {
  /** Unit horizontal direction of travel (x, z). */
  dirX: number;
  dirZ: number;
  /** Crest-to-crest length in metres. */
  wavelength: number;
  /** Crest height above still water in metres. */
  amplitude: number;
  /** Sharpness in [0, 1]: 0 is a sine, 1 is the sharpest crest without looping. Shared across the sum. */
  steepness: number;
  /** Phase offset in radians. */
  phase: number;
}
