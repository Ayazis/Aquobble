import * as THREE from 'three';
import {
  TERRAIN_FRAGMENT_MAIN,
  TERRAIN_FRAGMENT_NORMAL,
  TERRAIN_FRAGMENT_PARS,
  TERRAIN_VERTEX_MAIN,
  TERRAIN_VERTEX_PARS,
} from './terrainShaderChunks';
import type { GroundShadeUniforms } from './GroundShadeUniforms';
import type { TerrainGroundHook } from './TerrainGroundHook';
import type { TerrainTextureUniforms } from './TerrainTextureUniforms';

/**
 * Terrain material: smooth-shaded palette colours blended per pixel by height and slope, with grass, sand and
 * rock textures and their normal maps laid over in world space (triplanar for rock) via a standard-material
 * shader patch.
 */
export class TerrainMaterialFactory {
  create(uniforms: TerrainTextureUniforms & GroundShadeUniforms, hook?: TerrainGroundHook): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({ roughness: 0.92 });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      // lane B: grass
      if (hook) Object.assign(shader.uniforms, hook.uniforms);
      const main = hook ? TERRAIN_FRAGMENT_MAIN.replace(/}\s*$/, `${hook.fragmentMain}\n}`) : TERRAIN_FRAGMENT_MAIN;
      const pars = hook ? `${TERRAIN_FRAGMENT_PARS}\n${hook.fragmentPars}` : TERRAIN_FRAGMENT_PARS;
      // end lane B
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${TERRAIN_VERTEX_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${TERRAIN_VERTEX_MAIN}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${pars}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${main}`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${TERRAIN_FRAGMENT_NORMAL}`);
    };
    material.customProgramCacheKey = () => (hook ? 'aquobble-terrain-hooked' : 'aquobble-terrain');
    return material;
  }
}
