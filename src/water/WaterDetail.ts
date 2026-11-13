import type * as THREE from 'three';

/** The generated textures every water surface shares, and how finely the water is drawn on this device. */
export interface WaterDetail {
  /** Wind ripples: tilt, height and caustics (`WaterDetailFactory`). */
  detailMap: THREE.Texture;
  /** Foam bubbles (`FoamTextureFactory`). */
  foamMap: THREE.Texture;
  /** Segments per side of the sea mesh. */
  seaSegments: number;
  /** The finest ripple layer and colour fringes (a few more texture reads per pixel). */
  fine: boolean;
  /**
   * The water is drawn last, over a copy of the finished scene (`RenderQuality.refraction`). It can then
   * write depth, so the screen-space passes after it (ambient occlusion, light shafts) see the surface
   * rather than shading the sea bed's creases onto it.
   */
  drawnLast: boolean;
}
