import type * as THREE from 'three';

/** The painted pools of light under all lamps: one instanced mesh and the brightness they share. */
export interface LightPools {
  object: THREE.InstancedMesh;
  /** 0 = invisible; written once a frame by `StreetLightSystem`. */
  strength: { value: number };
}
