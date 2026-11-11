import { HEIGHT_MAP_GLSL } from '@terrain';
import { gerstnerGlsl } from './gerstnerGlsl';
import { RIPPLE_FRAGMENT_PARS } from './rippleGlsl';
import { WATER_FOAM_PARS, WATER_FRAGMENT_FOAM } from './waterFoamGlsl';

/**
 * GLSL injected into MeshStandardMaterial by `WaterMeshFactory`. The water knows the ground under it from
 * the terrain's height texture, so it has a shoreline: pale clear shallows, darker deep water and a foam
 * line that laps at the beach. `uWaterCalm` is 0 for the sea and 1 for a pond.
 */
/** Vertex declarations: the shared Gerstner sum reads the ground under the water for shoaling. */
export function waterVertexPars(waveCount: number): string {
  return /* glsl */ `
uniform float uWaterTime;
uniform float uWaterSwell;
uniform float uWaterTide;
varying vec3 vWaterPos;
varying vec2 vWaveRest;
varying vec2 vWaveShoal;
${HEIGHT_MAP_GLSL}
${gerstnerGlsl(waveCount)}
`;
}

/**
 * The mesh is a plane built in XY and laid flat, so local (x, y, z) is world (x, -z, y). The Gerstner sum
 * (same numbers as the CPU `GerstnerWaveField`) moves each vertex; the mesh's height is its still level.
 */
export const WATER_VERTEX_MAIN = /* glsl */ `
vec3 waterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
// The tide lifts the sea (uWaterSwell is 0 for ponds, which keep their level).
float waterTide = uWaterTide * uWaterSwell;
transformed.z += waterTide;
waterWorld.y += waterTide;
vWaveRest = waterWorld.xz;
vWaveShoal = waveShoal(waterWorld.xz, modelMatrix[3].y + waterTide) * vec2(1.0, uWaterSwell);
if (vWaveShoal.y > 0.0) {
  vec3 wave = gerstnerOffset(waterWorld.xz, uWaterTime, vWaveShoal);
  transformed += vec3(wave.x, -wave.z, wave.y);
  waterWorld += wave;
}
// Swash: the water's edge slides a little up the beach and back (visual only, under 0.15 m).
float swashDepth = waterWorld.y - groundHeightAt(waterWorld.xz);
float swash = uWaterSwell * (1.0 - smoothstep(0.0, 1.2, swashDepth))
  * (0.5 + 0.5 * sin(uWaterTime * 1.3 + dot(waterWorld.xz, vec2(0.11, 0.07)))) * 0.14;
transformed.z += swash;
waterWorld.y += swash;
vWaterPos = waterWorld;
`;

export const WATER_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uWaterNormals;
uniform float uWaterTime;
uniform float uWaterCalm;
uniform float uWaterNight;
uniform vec3 uWaterShallow;
varying vec3 vWaterPos;
varying vec2 vWaveRest;
varying vec2 vWaveShoal;
${HEIGHT_MAP_GLSL}
${RIPPLE_FRAGMENT_PARS}
${WATER_FOAM_PARS}
`;

export const WATER_FRAGMENT_COLOR = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  float depth = vWaterPos.y - groundHeightAt(p);
  float shallow = 1.0 - smoothstep(0.0, 1.8, depth);
  float deep = smoothstep(2.0, 7.0, depth);
  // Pale and clear over the shallows, darker and more solid over deep water; ponds are darker throughout.
  diffuseColor.rgb = mix(diffuseColor.rgb, uWaterShallow, shallow * 0.6) * mix(1.0, 0.7, deep);
  diffuseColor.rgb *= mix(1.0, 0.6, uWaterCalm);
  // At night the bright cyan would outshine the moonlit land: darken it and calm the flecks and foam.
  diffuseColor.rgb *= mix(1.0, 0.5, uWaterNight);
  diffuseColor.a = mix(mix(diffuseColor.a, 0.4, shallow), 1.0, deep * 0.5);
  // Foam flecks on the open sea: streaks along the wind, where two drifting layers line up, fading with distance.
  vec2 s = vec2(dot(p, vec2(0.94, 0.33)), dot(p, vec2(-0.33, 0.94)));
  float a = texture2D(uWaterNormals, s * vec2(0.028, 0.085) + uWaterTime * vec2(0.012, 0.004)).r;
  float b = texture2D(uWaterNormals, s * vec2(0.043, 0.12) - uWaterTime * vec2(0.007, 0.006)).g;
  float near = 1.0 - smoothstep(60.0, 220.0, distance(vWaterPos, cameraPosition));
  float fleck = smoothstep(0.8, 0.84, a * b * 2.0) * near * (1.0 - uWaterCalm) * (1.0 - shallow);
${WATER_FRAGMENT_FOAM}
  fleck *= mix(1.0, 0.35, uWaterNight);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(mix(1.0, 0.75, uWaterNight)), max(fleck * 0.6, foam));
  diffuseColor.a = mix(diffuseColor.a, 1.0, max(fleck, foam));
}
`;

/** Analytic Gerstner normal (vertex varyings, per pixel) tilted by the scrolling ripple texture, in world space. */
export const WATER_FRAGMENT_NORMAL = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  vec3 n1 = texture2D(uWaterNormals, p * 0.06 + uWaterTime * vec2(0.02, 0.012)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uWaterNormals, p * 0.021 - uWaterTime * vec2(0.008, 0.014)).xyz * 2.0 - 1.0;
  vec2 ripple = (n1.xy + n2.xy) * 0.35 * mix(1.0, 0.4, uWaterCalm);
  vec3 swell = vWaveShoal.y > 0.0 ? gerstnerNormal(vWaveRest, uWaterTime, vWaveShoal) : vec3(0.0, 1.0, 0.0);
  ripple += rippleAt(p).xy;
  vec3 world = normalize(vec3(swell.x + ripple.x, swell.y, swell.z + ripple.y));
  normal = normalize((viewMatrix * vec4(world, 0.0)).xyz);
}
`;

/** A broken path of glints towards the sun (or moon): ripples that mirror it straight at the viewer flash its colour. */
export const WATER_FRAGMENT_GLITTER = /* glsl */ `
{
  // Ripple crests catch a bright rim, and foam is lifted so it stays white by moonlight (dimmer at night).
  float crest = smoothstep(0.012, 0.05, rippleHeightAt(vWaterPos.xz));
  totalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * crest * 0.4 * (1.0 - uWaterNight * 0.6);
  totalEmissiveRadiance += vec3(waterFoam) * mix(0.18, 0.1, uWaterNight);
}
#if NUM_DIR_LIGHTS > 0
{
  vec3 halfway = normalize(directionalLights[0].direction + normalize(vViewPosition));
  float path = smoothstep(0.15, 0.9, pow(max(dot(normal, halfway), 0.0), 140.0));
  // Only scattered wave tips flash, and they twinkle as two fine ripple layers slide past each other.
  vec2 g = vWaterPos.xz;
  float tips = texture2D(uWaterNormals, g * 0.37 + uWaterTime * vec2(0.05, 0.03)).r
    * texture2D(uWaterNormals, g * 0.53 - uWaterTime * vec2(0.04, 0.06)).g;
  float glint = path * smoothstep(0.3, 0.36, tips);
  totalEmissiveRadiance += directionalLights[0].color * glint * 0.3 * (1.0 - uWaterCalm * 0.6)
    * (1.0 - uWaterNight * 0.5);
}
#endif
`;
