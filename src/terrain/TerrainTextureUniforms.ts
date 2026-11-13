import * as THREE from 'three';

/** Shader uniforms for the terrain detail textures. `uTerrainDetail` stays 0 until all textures loaded. */
export interface TerrainTextureUniforms {
  [name: string]: THREE.IUniform;
  uGrassMap: THREE.IUniform<THREE.Texture>;
  uRockMap: THREE.IUniform<THREE.Texture>;
  uSandMap: THREE.IUniform<THREE.Texture>;
  uGrassNormal: THREE.IUniform<THREE.Texture>;
  uRockNormal: THREE.IUniform<THREE.Texture>;
  uSandNormal: THREE.IUniform<THREE.Texture>;
  uTerrainDetail: THREE.IUniform<number>;
  /** How strongly the normal maps tilt the surface (0 until they have loaded). */
  uTerrainRelief: THREE.IUniform<number>;
  /** World height of the sea; sand just above it is dark and wet. */
  uTerrainWaterLevel: THREE.IUniform<number>;
}

const pixel = (r: number, g: number, b: number): THREE.DataTexture => {
  const texture = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1);
  texture.needsUpdate = true;
  return texture;
};

/** Uniforms with 1x1 placeholders (white, flat), so the terrain renders untextured until textures arrive. */
export function createTerrainTextureUniforms(waterLevel = -1000): TerrainTextureUniforms {
  const white = pixel(255, 255, 255);
  const flat = pixel(128, 128, 255);
  return {
    uGrassMap: { value: white },
    uRockMap: { value: white },
    uSandMap: { value: white },
    uGrassNormal: { value: flat },
    uRockNormal: { value: flat },
    uSandNormal: { value: flat },
    uTerrainDetail: { value: 0 },
    uTerrainRelief: { value: 0 },
    uTerrainWaterLevel: { value: waterLevel },
  };
}
