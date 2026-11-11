import * as THREE from 'three';

/**
 * Shared uniform objects for `windShaderChunk`. Put the same object into every material's `uniforms`
 * (e.g. `Object.assign(shader.uniforms, windUniforms)`) and `WindSystem` keeps them all current.
 */
export interface WindUniforms {
  /** Unit direction the wind blows towards (x = world x, y = world z). */
  uWindDirection: { value: THREE.Vector2 };
  /** Base strength in [0, 1]. */
  uWindStrength: { value: number };
  /** Game time in seconds, same clock as `Wind`'s `t`. */
  uWindTime: { value: number };
  /** Gust fronts: x = spacing (m), y = speed (m/s), z = phase. */
  uGustFronts: { value: THREE.Vector3 };
}

export function createWindUniforms(): WindUniforms {
  return {
    uWindDirection: { value: new THREE.Vector2(1, 0) },
    uWindStrength: { value: 0 },
    uWindTime: { value: 0 },
    uGustFronts: { value: new THREE.Vector3(38, 6, 0) },
  };
}
