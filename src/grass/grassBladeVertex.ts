import { GROUND_SHADE_GLSL, HEIGHT_MAP_GLSL, LUSH_GROUND_GLSL } from '@terrain';
import type { GrassBand } from './GrassBand';
import { GRASS_COLOUR_GLSL } from './grassColourGlsl';
import { GRASS_NOISE_GLSL } from './grassNoiseGlsl';
import { grassPlaceGlsl } from './grassPlaceGlsl';
import { grassShapeGlsl } from './grassShapeGlsl';
import { WIND_UNIFORMS } from './windShaderChunk';

/** What the blade vertex shader hands the fragment shader. */
export const GRASS_VARYINGS = /* glsl */ `
varying vec3 vGrassColour;
varying vec4 vGrassLook;
varying vec2 vGrassFar;
varying vec3 vGrassUp;
`;

/** Declarations for the blade vertex shader (goes after `<common>`). */
export const GRASS_BLADE_PARS = /* glsl */ `
${WIND_UNIFORMS}
${HEIGHT_MAP_GLSL}
${LUSH_GROUND_GLSL}
${GROUND_SHADE_GLSL}
${GRASS_NOISE_GLSL}
${GRASS_VARYINGS}
attribute vec2 aTile;
uniform sampler2D uGrassDensity;
uniform float uGrassDensitySize;
uniform float uGrassKeep;
`;

/**
 * Vertex code run after `<begin_vertex>`: places the instance's blade, and if it is there, bends, colours and
 * lights it; `transformed` ends up in world space. Blades that are not there (outside the band, thinned by the
 * density map) collapse to a point and skip the rest, which is most of the work for most of a tile's edge.
 */
export function grassBladeVertex(band: GrassBand): string {
  return /* glsl */ `
${grassPlaceGlsl(band)}
if (gSize > 0.001) {
${grassShapeGlsl(band)}
${GRASS_COLOUR_GLSL}
} else {
  transformed = vec3(aTile.x, -1000.0, aTile.y);
}
`;
}
