import type * as THREE from 'three';

/** Shader inputs for the ripple map, shared by every water material and written by `RippleSimulation`. */
export interface RippleUniforms {
  uRippleMap: { value: THREE.Texture | null };
  /** World min x (x), min z (y) and side in m (z) of the simulated box; side 0 turns ripples off. */
  uRippleBox: { value: THREE.Vector3 };
  /** One texel in uv. */
  uRippleTexel: { value: number };
}
