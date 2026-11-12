import type * as THREE from 'three';
import type { GrassBand } from './GrassBand';
import {
  GRASS_COLOUR_FRAGMENT,
  GRASS_LIGHT_PARS,
  GRASS_NORMAL_FRAGMENT,
  GRASS_OCCLUSION_FRAGMENT,
  GRASS_ROUGHNESS_FRAGMENT,
} from './grassBladeFragment';
import { GRASS_BLADE_PARS, GRASS_VARYINGS, grassBladeVertex } from './grassBladeVertex';

type Uniforms = Record<string, THREE.IUniform>;

const after = (source: string, chunk: string, code: string) =>
  source.replace(`#include <${chunk}>`, `#include <${chunk}>\n${code}`);

/**
 * Patches a standard material into the grass blade material of one band: the vertex shader grows, bends and
 * colours blades (`grassBladeVertex`), the fragment shader lights them as thin leaves (`grassBladeFragment`).
 * `uniforms` are the shared objects the shaders read: density map, height map, ground shade, wind, bend map.
 */
export function applyGrassBladeShader(material: THREE.Material, band: GrassBand, uniforms: () => Uniforms): void {
  const key = `aquobble-grass-blades-${JSON.stringify(band)}`;
  material.customProgramCacheKey = () => key;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms());
    shader.vertexShader = after(
      after(shader.vertexShader, 'common', GRASS_BLADE_PARS),
      'begin_vertex',
      grassBladeVertex(band),
    );
    let fragment = after(shader.fragmentShader, 'common', GRASS_VARYINGS).replace(
      '#include <lights_physical_pars_fragment>',
      GRASS_LIGHT_PARS,
    );
    fragment = after(fragment, 'color_fragment', GRASS_COLOUR_FRAGMENT);
    fragment = after(fragment, 'roughnessmap_fragment', GRASS_ROUGHNESS_FRAGMENT);
    fragment = after(fragment, 'normal_fragment_begin', GRASS_NORMAL_FRAGMENT);
    shader.fragmentShader = after(fragment, 'aomap_fragment', GRASS_OCCLUSION_FRAGMENT);
  };
}
