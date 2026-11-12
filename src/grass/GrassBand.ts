/** One distance band of the grass field: square tiles of blades round the camera, drawn in one instanced call. */
export interface GrassBand {
  /** Segments along each blade: more bend smoothly up close, fewer are cheaper far away. */
  segments: number;
  /** Half the width (m) of a typical blade at its base; far bands use wide blades that stand for whole tufts. */
  halfWidth: number;
  /** Side of one tile in metres. */
  tile: number;
  /** Blades per side of a tile (side * side blades, jittered on a grid). */
  side: number;
  /** Camera distance where blades start growing in, and where they are all there (0, 0: always there). */
  fadeIn: readonly [number, number];
  /** Camera distance where blades start thinning away, and where they are gone. */
  fadeOut: readonly [number, number];
}

/** What the device can afford, from `RenderQuality`. */
export interface GrassQuality {
  /** Blades per square metre as a share of the desktop count. */
  density: number;
  /** Where the middle band ends and the far band of wide blades takes over (m). */
  midDistance: number;
}
