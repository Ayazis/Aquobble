/** Shading parameters shared by every water surface. */
export interface WaterLook {
  waterColor: number;
  /** 0 = invisible, 1 = opaque; below 1 the sand shows through in the shallows. */
  opacity: number;
}
