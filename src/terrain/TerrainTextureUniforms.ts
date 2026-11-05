import * as THREE from 'three';

/** Shader uniforms for the terrain detail textures. `uTerrainDetail` stays 0 until all textures loaded. */
export interface TerrainTextureUniforms {
  [name: string]: THREE.IUniform;
  uGrassMap: THREE.IUniform<THREE.Texture>;
  uRockMap: THREE.IUniform<THREE.Texture>;
  uSandMap: THREE.IUniform<THREE.Texture>;
  uTerrainDetail: THREE.IUniform<number>;
}

/** Uniforms with 1x1 white placeholders, so the terrain renders untextured until textures arrive. */
export function createTerrainTextureUniforms(): TerrainTextureUniforms {
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.needsUpdate = true;
  return {
    uGrassMap: { value: white },
    uRockMap: { value: white },
    uSandMap: { value: white },
    uTerrainDetail: { value: 0 },
  };
}
