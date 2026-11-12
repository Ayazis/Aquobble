import { HEIGHT_MAP_GLSL } from '@terrain';
import { gerstnerGlsl } from './gerstnerGlsl';
import { RIPPLE_FRAGMENT_PARS } from './rippleGlsl';
import { WATER_FOAM_PARS, WATER_FRAGMENT_FOAM } from './waterFoamGlsl';

/**
 * GLSL injected into MeshStandardMaterial by `WaterMeshFactory`. The water knows the ground under it from
 * the terrain's height texture, so it has a shoreline: pale clear shallows, darker deep water and a foam
 * line that laps at the beach. `uWaterCalm` is 0 for the sea and 1 for a pond. The sun's glitter and the
 * mirrored sky are the material's own physical highlights on the rippled normal.
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
  float fleck = smoothstep(0.86, 0.94, a * b * 2.0) * near * (1.0 - uWaterCalm) * (1.0 - shallow);
${WATER_FRAGMENT_FOAM}
  fleck *= mix(1.0, 0.35, uWaterNight);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(mix(0.9, 0.7, uWaterNight)), max(fleck * 0.45, foam));
  diffuseColor.a = mix(diffuseColor.a, 1.0, max(fleck, foam));
}
`;

/**
 * Analytic Gerstner normal (vertex varyings, per pixel) tilted by three scrolling ripple layers, in world
 * space. Far water is rougher: the ripples there are smaller than a pixel, and it is their spread that
 * widens the sun's glitter path towards the horizon. Foam does not shine.
 */
export const WATER_FRAGMENT_NORMAL = /* glsl */ `
{
  vec2 p = vWaterPos.xz;
  // Three sizes of ripple; the finest carries the most slope up close, so the sun breaks into sparkles
  // rather than long curls, and fades out where it would only shimmer.
  vec3 n1 = texture2D(uWaterNormals, p * 0.09 + uWaterTime * vec2(0.02, 0.012)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uWaterNormals, p * 0.031 - uWaterTime * vec2(0.008, 0.014)).xyz * 2.0 - 1.0;
  vec3 n3 = texture2D(uWaterNormals, p * 0.41 + uWaterTime * vec2(-0.031, 0.027)).xyz * 2.0 - 1.0;
  float away = distance(vWaterPos, cameraPosition);
  vec2 ripple = ((n1.xy + n2.xy) * 0.14 + n3.xy * 0.2 * (1.0 - smoothstep(15.0, 70.0, away)))
    * mix(1.0, 0.4, uWaterCalm);
  vec3 swell = vWaveShoal.y > 0.0 ? gerstnerNormal(vWaveRest, uWaterTime, vWaveShoal) : vec3(0.0, 1.0, 0.0);
  ripple += rippleAt(p).xy;
  vec3 world = normalize(vec3(swell.x + ripple.x, swell.y, swell.z + ripple.y));
  normal = normalize((viewMatrix * vec4(world, 0.0)).xyz);
  roughnessFactor = mix(roughnessFactor, 0.34, smoothstep(30.0, 500.0, away));
  roughnessFactor = mix(roughnessFactor, 1.0, waterFoam);
}
`;

/** Ripple crests catch a bright rim, and foam is lifted a little so it still reads by moonlight. */
export const WATER_FRAGMENT_GLITTER = /* glsl */ `
{
  float crest = smoothstep(0.012, 0.05, rippleHeightAt(vWaterPos.xz));
  totalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * crest * 0.25 * (1.0 - uWaterNight * 0.6);
  totalEmissiveRadiance += vec3(waterFoam) * mix(0.04, 0.08, uWaterNight);
}
`;
