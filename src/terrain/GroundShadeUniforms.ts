import * as THREE from 'three';
import type { GroundShade } from './GroundShade';

/** Shader uniforms for reading a `GroundShade` map; see `GROUND_SHADE_GLSL`. */
export interface GroundShadeUniforms {
  [name: string]: THREE.IUniform;
  uGroundShadeMap: THREE.IUniform<THREE.Texture>;
  /** World size (m) the map covers. */
  uGroundShadeSize: THREE.IUniform<number>;
}

/**
 * Wraps the map's bytes in a texture without copying, so stamps made before the first frame all show.
 * Without a map the ground is unshaded.
 */
export function createGroundShadeUniforms(shade?: GroundShade): GroundShadeUniforms {
  const texture = shade
    ? new THREE.DataTexture(shade.data, shade.resolution, shade.resolution, THREE.RGFormat)
    : new THREE.DataTexture(new Uint8Array(2), 1, 1, THREE.RGFormat);
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { uGroundShadeMap: { value: texture }, uGroundShadeSize: { value: shade?.size ?? 1 } };
}
