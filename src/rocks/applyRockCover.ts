import type * as THREE from 'three';
import type { GroundShadeUniforms } from '@terrain';
import {
  ROCK_COVER_FRAGMENT_MAIN,
  ROCK_COVER_FRAGMENT_PARS,
  ROCK_COVER_VERTEX_MAIN,
  ROCK_COVER_VERTEX_PARS,
} from './rockCoverChunks';

export interface RockCoverLook {
  /** World height (m) below which rocks are wet, normally a little above the sea. */
  wetLevel: number;
  /** The ground shade map; its canopy channel says where moss grows. */
  shade: GroundShadeUniforms;
}

/**
 * Patches a rock material (after any surface detail) so rocks take on their surroundings: moss on top in
 * forest shade, lichen on high ground, a dark wet band at the waterline. One vertex texture read per rock
 * vertex; no extra textures in the fragment shader.
 */
export function applyRockCover(material: THREE.Material, look: RockCoverLook): void {
  const before = material.onBeforeCompile.bind(material);
  const key = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    before(shader, renderer);
    Object.assign(shader.uniforms, look.shade, { uRockWetLevel: { value: look.wetLevel } });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${ROCK_COVER_VERTEX_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${ROCK_COVER_VERTEX_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${ROCK_COVER_FRAGMENT_PARS}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${ROCK_COVER_FRAGMENT_MAIN}`);
  };
  material.customProgramCacheKey = () => `${key}-rock-cover`;
  material.needsUpdate = true;
}
