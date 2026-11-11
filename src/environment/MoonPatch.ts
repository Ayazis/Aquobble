/** One dark patch on the moon's face, in units of the disc radius (centre 0,0). */
export interface MoonPatch {
  x: number;
  y: number;
  radius: number;
  /** 0 = invisible, 1 = darkest. */
  darkness: number;
}
