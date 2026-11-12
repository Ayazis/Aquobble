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
  // lane D: light
  /** Sun shadow cascades: 2 adds a wide soft box (`farShadowBoxSize`) behind the sharp one. */
  shadowCascades: number;
  /** Width in metres of the far, soft shadow box. */
  farShadowBoxSize: number;
  /** Cloud shadows drifting over the ground. */
  cloudShadows: boolean;
  /** Bake vertex ambient occlusion into models at load (stands in for the depth AO pass on phones). */
  vertexAo: boolean;
  // end lane D
  // lane D2: night shadows and sky
  /** The nearest lit street lamp casts a small cube shadow at night. */
  lampShadows: boolean;
  /** Light shafts around the low sun and through the canopy (needs `postEffects`). */
  godRays: boolean;
  // end lane D2
  // lane B: grass
  /** Grass tufts per square metre as a share of the desktop count. */
  grassDensity: number;
  /** Where thinned grass blades end and far grass cards take over (m). */
  grassMidDistance: number;
  // end lane B
  // lane B2: grass physics
  /** Texels per side of the trampling bend map (32 m box round the player). */
  grassBendMapSize: number;
  // end lane B2
  /** Volumetric cloud map: texels per side, and march steps per ray. */
  sky: { cloudMapSize: number; cloudSteps: number };
  // lane H: refraction
  /** Water looks through to the copied opaque scene (one full-screen copy); off keeps the opacity blend. */
  refraction: boolean;
  // end lane H
}

export const HIGH_QUALITY: RenderQuality = {
  maxPixelRatio: 2,
  antialias: true,
  shadows: true,
  postEffects: true,
  shadowMapSize: 4096,
  shadowBoxSize: 50,
  shadowInterval: 1,
  surfaceDetail: true,
  // lane D: light
  shadowCascades: 2,
  farShadowBoxSize: 200,
  cloudShadows: true,
  vertexAo: false,
  // end lane D
  lampShadows: true, // lane D2
  godRays: true, // lane D2
  grassDensity: 1, // lane B: grass
  grassMidDistance: 45, // lane B: grass
  grassBendMapSize: 128, // lane B2: grass physics
  sky: { cloudMapSize: 1024, cloudSteps: 22 },
  refraction: true, // lane H
};
