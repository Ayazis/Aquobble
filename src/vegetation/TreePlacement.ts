/** Where one tree goes. Pure data, produced by TreePlacer. */
export interface TreePlacement {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  /** 0..1, used to vary the crown colour. */
  tint: number;
}
