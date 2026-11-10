import type * as THREE from 'three';
import { VERGE_FRAGMENT_MAIN, VERGE_FRAGMENT_PARS, VERGE_VERTEX_MAIN, VERGE_VERTEX_PARS } from './vergeChunks';

/**
 * Makes a ground material fray at its edges and show wheel ruts, driven by the `verge` attribute of
 * `groundPatch`. Call after any other shader patch on the material (it runs that one first).
 */
export function applyVerge(material: THREE.Material): void {
  const inner = material.onBeforeCompile;
  const innerKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    inner.call(material, shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERGE_VERTEX_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERGE_VERTEX_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${VERGE_FRAGMENT_PARS}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${VERGE_FRAGMENT_MAIN}`);
  };
  material.customProgramCacheKey = () => `${innerKey}|aquobble-verge`;
  material.needsUpdate = true;
}
