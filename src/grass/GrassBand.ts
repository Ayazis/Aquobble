/** One distance band of the grass field: a grid of tiles round the camera, each the same patch of tufts. */
export interface GrassBand {
  /** Shape of every tuft: curved blades, or crossed quads (cards) for the far band. */
  shape: { kind: 'blades'; blades: number; halfWidth: number } | { kind: 'cards'; halfWidth: number };
  /** Side of one tile in metres. */
  tile: number;
  /** Tiles per side of the grid that follows the camera. */
  grid: number;
  /** Tufts per side of a tile (side * side tufts, jittered on a grid). */
  side: number;
  /** Camera distance where tufts start growing in, and where they are full size (0, 0: always full). */
  fadeIn: readonly [number, number];
  /** Camera distance where tufts start shrinking away, and where they are gone. */
  fadeOut: readonly [number, number];
}

/** What the device can afford, from `RenderQuality`. */
export interface GrassQuality {
  /** Tufts per square metre as a share of the desktop count. */
  density: number;
  /** Where the thinned blade band ends and the card band takes over (m). */
  midDistance: number;
}
