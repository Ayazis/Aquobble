/** One grass blade or flower on the ground. `tint` in [0, 1) drives colour variation. */
export interface GrassPlacement {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  tint: number;
  /** Colour variant index (flowers only; 0 for grass). */
  variant: number;
}
