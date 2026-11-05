/** Axis-aligned square area to level, plus the width of the smooth blend band around it. */
export interface FlattenRegion {
  centerX: number;
  centerZ: number;
  /** Half the side length of the fully flat square. */
  halfSize: number;
  /** Width of the band outside the square that eases back to the original terrain. */
  blend: number;
}
