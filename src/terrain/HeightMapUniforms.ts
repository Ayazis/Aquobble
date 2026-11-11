import * as THREE from 'three';
import type { HeightField } from './HeightField';

/** Shader uniforms for reading the terrain's height at a world position; see `HEIGHT_MAP_GLSL`. */
export interface HeightMapUniforms {
  [name: string]: THREE.IUniform;
  uHeightMap: THREE.IUniform<THREE.DataTexture>;
  /** (scale, offset) turning world x or z into a texture coordinate, and the world half-size covered. */
  uHeightMapFrame: THREE.IUniform<THREE.Vector3>;
}

/**
 * Bakes the height field into a half-float texture, one texel per grid sample, so a shader reads the same
 * bilinear heights the game does. Bake it after the terrain is final (town levelled, ponds carved).
 */
export function createHeightMapUniforms(field: HeightField): HeightMapUniforms {
  const n = field.samples;
  const data = new Uint16Array(n * n);
  for (let i = 0; i < data.length; i++) data[i] = THREE.DataUtils.toHalfFloat(field.heights[i]);
  const texture = new THREE.DataTexture(data, n, n, THREE.RedFormat, THREE.HalfFloatType);
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  // Sample i sits at the centre of texel i: world -size/2 maps to 0.5/n and +size/2 to 1 - 0.5/n.
  const scale = (n - 1) / n / field.size;
  return { uHeightMap: { value: texture }, uHeightMapFrame: { value: new THREE.Vector3(scale, 0.5, field.size / 2) } };
}
