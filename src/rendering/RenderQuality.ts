/** GPU cost knobs. Phones get a cheaper profile (see `app/qualityFor`). */
export interface RenderQuality {
  /** Upper bound for devicePixelRatio; the biggest single cost on high-DPI phones. */
  maxPixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  /** Ambient occlusion + bloom. Off means a plain render with tone mapping only. */
  postEffects: boolean;
  /** Sun shadow map resolution (square). */
  shadowMapSize: number;
  /** Width in metres of the sun's shadow box, which follows the view. Smaller is sharper but ends nearer. */
  shadowBoxSize: number;
  /** Redraw the shadow map every this many frames (1 = every frame). */
  shadowInterval: number;
  /** Detail textures over models, trees and rocks (several texture reads per pixel). */
  surfaceDetail: boolean;
  // lane B: grass
  /** Grass tufts per square metre as a share of the desktop count. */
  grassDensity: number;
  /** Where thinned grass blades end and far grass cards take over (m). */
  grassMidDistance: number;
  // end lane B
}

export const HIGH_QUALITY: RenderQuality = {
  maxPixelRatio: 2,
  antialias: true,
  shadows: true,
  postEffects: true,
  shadowMapSize: 4096,
  shadowBoxSize: 60,
  shadowInterval: 1,
  surfaceDetail: true,
  grassDensity: 1, // lane B: grass
  grassMidDistance: 45, // lane B: grass
};
