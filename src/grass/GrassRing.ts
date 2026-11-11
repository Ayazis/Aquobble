/** How one ring of grass looks and over which camera distances it is drawn. */
export interface GrassRing {
  /** Blades per tuft (3 triangles each). */
  blades: number;
  /** Half the blade width at the root, in metres before the tuft's scale. */
  halfWidth: number;
  /** Camera distance where tufts start growing in, and where they are full size (0, 0: always full). */
  fadeIn: readonly [number, number];
  /** Camera distance where tufts start shrinking away, and where they are gone. */
  fadeOut: readonly [number, number];
}
