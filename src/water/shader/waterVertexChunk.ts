import { HEIGHT_MAP_GLSL } from '@terrain';
import { gerstnerGlsl } from '../gerstnerGlsl';
import { SURF_GLSL } from '../surfGlsl';

/** Vertex declarations: the shared Gerstner sum and surf read the ground under the water. */
export function waterVertexPars(waveCount: number, meshWaveCount: number): string {
  return /* glsl */ `
uniform float uWaterTime;
uniform float uWaterSwell;
uniform float uWaterTide;
uniform float uWaterCalm;
varying vec3 vWaterPos;
varying vec2 vWaveRest;
varying float vWaveLift;
${HEIGHT_MAP_GLSL}
${gerstnerGlsl(waveCount, meshWaveCount)}
${SURF_GLSL}
`;
}

/**
 * The mesh is a plane built in XY and laid flat, so local (x, y, z) is world (x, -z, y). The Gerstner swell
 * and the surf (same numbers as the CPU `ShoreWaveField`) move each vertex; the mesh's height is its still
 * level. `uWaterSwell` is the sea state (0 on a pond): how hard the wind has been blowing.
 */
export const WATER_VERTEX_MAIN = /* glsl */ `
vec3 waterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
// The tide lifts the sea; ponds keep their level.
float waterSea = 1.0 - uWaterCalm;
float waterTide = uWaterTide * waterSea;
transformed.z += waterTide;
waterWorld.y += waterTide;
float waterLevel = waterWorld.y;
vWaveRest = waterWorld.xz;
float waterStill = waterLevel - groundHeightAt(waterWorld.xz);
vec2 waveShoal = waveShoalAt(waterStill) * vec2(1.0, uWaterSwell * waveMeshFade(waterWorld.xz));
if (waveShoal.y > 0.0) {
  vec3 wave = gerstnerOffset(waterWorld.xz, uWaterTime, waveShoal);
  wave.y += surfHeight(waterStill, waterWorld.xz, uWaterTime) * uWaterSwell;
  transformed += vec3(wave.x, -wave.z, wave.y);
  waterWorld += wave;
}
// Swash: after each wave the water's edge shoots a little up the beach and drains back (visual only).
float swashDepth = waterWorld.y - groundHeightAt(waterWorld.xz);
float swash = waterSea * (1.0 - smoothstep(0.0, 1.2, swashDepth)) * surfSwash(waterWorld.xz, uWaterTime) * 0.16;
transformed.z += swash;
waterWorld.y += swash;
vWaterPos = waterWorld;
vWaveLift = waterWorld.y - waterLevel;
`;
