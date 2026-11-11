import type * as THREE from 'three';
import { GROUND_SHADE_GLSL, type GroundShadeUniforms } from '@terrain';
import {
  PUDDLE_FRAGMENT_COLOR,
  PUDDLE_FRAGMENT_NORMAL,
  PUDDLE_FRAGMENT_PARS,
  PUDDLE_FRAGMENT_ROUGHNESS,
  PUDDLE_VERTEX_MAIN,
  PUDDLE_VERTEX_PARS,
} from './puddleChunks';
import { VERGE_FRAGMENT_MAIN, VERGE_FRAGMENT_PARS, VERGE_VERTEX_MAIN, VERGE_VERTEX_PARS } from './vergeChunks';

/** Darkens the ground where things stand, like the terrain does (`vVergePos` is world x/z). */
const SHADE_FRAGMENT_MAIN = /* glsl */ `
diffuseColor.rgb = shadedGround(diffuseColor.rgb, vVergePos);
`;

/**
 * Makes a ground material fray at its edges, show wheel ruts and puddles, driven by the `verge` and
 * `puddle` attributes of `groundPatch`, and, given the ground shade map, darken under things standing on
 * it. Call after any other shader patch on the material (it runs that one first).
 */
export function applyVerge(material: THREE.Material, shade?: GroundShadeUniforms): void {
  const inner = material.onBeforeCompile;
  const innerKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    inner.call(material, shader, renderer);
    if (shade) Object.assign(shader.uniforms, shade);
    const pars = `${VERGE_FRAGMENT_PARS}\n${PUDDLE_FRAGMENT_PARS}\n${shade ? GROUND_SHADE_GLSL : ''}`;
    const colour = `${VERGE_FRAGMENT_MAIN}\n${PUDDLE_FRAGMENT_COLOR}\n${shade ? SHADE_FRAGMENT_MAIN : ''}`;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERGE_VERTEX_PARS}\n${PUDDLE_VERTEX_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERGE_VERTEX_MAIN}\n${PUDDLE_VERTEX_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${pars}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${colour}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${PUDDLE_FRAGMENT_ROUGHNESS}`)
      .replace('#include <emissivemap_fragment>', `${PUDDLE_FRAGMENT_NORMAL}\n#include <emissivemap_fragment>`);
  };
  material.customProgramCacheKey = () => `${innerKey}|aquobble-verge${shade ? '-shaded' : ''}`;
  material.needsUpdate = true;
}
