import * as THREE from 'three';

/** Layer that refractive surfaces (water) live on, so the refraction pass can draw them after the copy. */
export const REFRACTIVE_LAYER = 7;

/**
 * Shared uniforms for surfaces that look through to the opaque scene behind them. `RefractionRenderPass`
 * fills them on desktop; with `uRefraction` at 0 (phones) shaders keep their plain opacity blend.
 * `uSceneColour` holds the linear opaque colour in rgb and the view depth (m) behind each pixel in alpha.
 */
export const SCENE_COLOUR_UNIFORMS = {
  uSceneColour: { value: null as THREE.Texture | null },
  uSceneResolution: { value: new THREE.Vector2(1, 1) },
  uRefraction: { value: 0 },
};

/** Puts a mesh on the refractive layer (and only there), so it is drawn after the scene colour copy. */
export function markRefractive(mesh: THREE.Object3D): void {
  mesh.layers.set(REFRACTIVE_LAYER);
}
