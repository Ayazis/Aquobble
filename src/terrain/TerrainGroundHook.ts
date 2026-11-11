import type * as THREE from 'three';

/**
 * Extra ground shading from another slice (lane B: grass fur), added at the end of the terrain colour block.
 * `fragmentMain` may read `grass` (grass weight), `vTerrainPos` and `diffuseColor`.
 */
export interface TerrainGroundHook {
  uniforms: Record<string, THREE.IUniform>;
  fragmentPars: string;
  fragmentMain: string;
}
