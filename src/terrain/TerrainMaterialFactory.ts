import * as THREE from 'three';
import {
  TERRAIN_FRAGMENT_MAIN,
  TERRAIN_FRAGMENT_PARS,
  TERRAIN_VERTEX_MAIN,
  TERRAIN_VERTEX_PARS,
} from './terrainShaderChunks';
import type { GroundShadeUniforms } from './GroundShadeUniforms';
import type { TerrainTextureUniforms } from './TerrainTextureUniforms';

/**
 * Terrain material: flat-shaded (facet normals) palette colours blended per pixel by height/slope, with grass/sand/rock detail textures
 * blended by height and slope in world space (triplanar for rock) via a standard-material shader patch.
 */
export class TerrainMaterialFactory {
  create(uniforms: TerrainTextureUniforms & GroundShadeUniforms): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.95 });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${TERRAIN_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${TERRAIN_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${TERRAIN_FRAGMENT_PARS}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${TERRAIN_FRAGMENT_MAIN}`);
    };
    material.customProgramCacheKey = () => 'aquobble-terrain';
    return material;
  }
}
