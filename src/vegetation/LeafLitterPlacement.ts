/** One patch of fallen leaves on the ground. Pure data, produced by LeafLitterPlacer. */
export interface LeafLitterPlacement {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  /** 0..1, picks the patch colour between fresh and dry. */
  tint: number;
}
