import { HEIGHT_MAP_GLSL } from '@terrain';
import { DETAIL_TILT_RANGE } from '../detail/WaterDetailFactory';
import { gerstnerGlsl } from '../gerstnerGlsl';
import { RIPPLE_FRAGMENT_PARS } from '../rippleGlsl';
import { SURF_GLSL } from '../surfGlsl';
import { WATER_CAUSTICS_GLSL } from './waterCausticsGlsl';

/**
 * Fragment declarations for the water. `uWaterNormals` is the detail map of `WaterDetailFactory` (tilt,
 * height, caustics), `uWaterFoamMap` the bubbles of `FoamTextureFactory`. `uWaterWind` is the unit direction
 * the wind blows towards (xy = world xz, fixed: the swell follows it) and its strength 0..1 right now.
 * The scene uniforms are `SCENE_COLOUR_UNIFORMS` of the rendering slice (the opaque picture behind the water).
 */
export function waterFragmentPars(waveCount: number): string {
  return /* glsl */ `
uniform sampler2D uWaterNormals;
uniform sampler2D uWaterFoamMap;
uniform float uWaterTime;
uniform float uWaterCalm;
uniform float uWaterNight;
uniform float uWaterSwell;
uniform vec3 uWaterShallow;
uniform vec3 uWaterWind;
uniform sampler2D uSceneColour;
uniform vec2 uSceneResolution;
uniform mat4 uSceneProjection;
uniform float uRefraction;
varying vec3 vWaterPos;
varying vec2 vWaveRest;
varying float vWaveLift;
${HEIGHT_MAP_GLSL}
${RIPPLE_FRAGMENT_PARS}
${gerstnerGlsl(waveCount)}
${SURF_GLSL}
/** Foam cover 0..1 of this pixel, for every chunk after the foam one. */
float waterFoam = 0.0;

/**
 * One layer of wind ripples: the detail patch laid over the world at \`scale\` tiles per metre, turned by
 * \`turn\` and drifting at \`drift\` m/s. Returns the surface tilt in world xz (xy) and the ripple height (z).
 */
vec3 waterDetail(vec2 p, mat2 turn, float scale, vec2 drift) {
  vec4 s = texture2D(uWaterNormals, (turn * p + drift * uWaterTime) * scale);
  return vec3(((s.xy * 2.0 - 1.0) * ${DETAIL_TILT_RANGE.toFixed(3)}) * turn, s.z);
}
${WATER_CAUSTICS_GLSL}
`;
}
