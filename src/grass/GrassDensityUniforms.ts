import * as THREE from 'three';
import type { DensityGrid } from './DensityGrid';

/**
 * Shader uniforms shared by the grass field and the ground fur: the baked density map (see
 * `bakeGrassDensity`), the world size it covers, the share of tufts the frame-time watchdog keeps, and the
 * sway clock. Created empty (no grass anywhere) so the ground can be built before the map is baked.
 */
export interface GrassDensityUniforms {
  [name: string]: THREE.IUniform;
  uGrassDensity: THREE.IUniform<THREE.Texture>;
  uGrassDensitySize: THREE.IUniform<number>;
  uGrassKeep: THREE.IUniform<number>;
  uGrassTime: THREE.IUniform<number>;
}

export function createGrassDensityUniforms(): GrassDensityUniforms {
  return {
    uGrassDensity: { value: densityTexture(new Uint8Array(4), 1) },
    uGrassDensitySize: { value: 1 },
    uGrassKeep: { value: 1 },
    uGrassTime: { value: 0 },
  };
}

/** Puts a freshly baked map into the uniforms; every material already holding them sees it. */
export function setGrassDensity(uniforms: GrassDensityUniforms, data: Uint8Array, grid: DensityGrid): void {
  uniforms.uGrassDensity.value.dispose();
  uniforms.uGrassDensity.value = densityTexture(data, grid.resolution);
  uniforms.uGrassDensitySize.value = grid.size;
}

function densityTexture(data: Uint8Array, resolution: number): THREE.DataTexture {
  const texture = new THREE.DataTexture(data, resolution, resolution, THREE.RGBAFormat);
  texture.magFilter = texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
