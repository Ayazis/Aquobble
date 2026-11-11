import { HEIGHT_MAP_GLSL } from '@terrain';
import { MAX_DRY, STRAW } from './dryTipColor';
import type { GrassBand } from './GrassBand';
import { COOL_TIP_GAIN, WARM_TIP_GAIN } from './grassTipColor';

/** Tallest meadow tuft is about this share of its geometry: shin height on a 1.6 m character. */
export const GRASS_HEIGHT = 0.7;
/** How far tips bend per (world height)^2 in wind. */
const BEND = 1.1;
/** Camera distance over which tips take on the ground colour, so far grass melts into the fur. */
const TIP_FADE = [55, 85];

const f = (v: number) => v.toFixed(3);
const vec3 = (c: readonly number[]) => `vec3(${c.map(f).join(', ')})`;

/** Declarations for the grass field vertex shader (after the wind chunk, lush ground and shade). */
export const GRASS_FIELD_PARS = /* glsl */ `
${HEIGHT_MAP_GLSL}
uniform sampler2D uGrassDensity;
uniform float uGrassDensitySize;
uniform float uGrassKeep;
float grassHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
`;

/**
 * Vertex code run after `<begin_vertex>`: turns instance `gl_InstanceID` into a tuft of a tile in the grid
 * that follows the camera (every tile is the same jittered patch), stands it on the height map, sizes it by
 * the density map and its band's distance fade (size 0 collapses it), sways it, and colours it from the
 * ground at the root to its tip, with a darker root band. `transformed` ends up in world space.
 */
export function grassFieldVertex(band: GrassBand): string {
  const grow =
    band.fadeIn[1] > 0 ? `grassSize *= smoothstep(${f(band.fadeIn[0])}, ${f(band.fadeIn[1])}, grassDist);` : '';
  return /* glsl */ `
int grassPerTile = ${band.side} * ${band.side};
int grassTileId = gl_InstanceID / grassPerTile;
int grassTuft = gl_InstanceID - grassTileId * grassPerTile;
vec2 grassTileXY = vec2(float(grassTileId % ${band.grid}), float(grassTileId / ${band.grid})) - ${f(band.grid / 2)};
vec2 grassCell = vec2(float(grassTuft % ${band.side}), float(grassTuft / ${band.side}));
vec2 grassJitter = vec2(grassHash(grassCell + 0.37), grassHash(grassCell + 17.71));
vec2 grassXZ = (floor(cameraPosition.xz / ${f(band.tile)}) + grassTileXY + (grassCell + grassJitter) / ${f(band.side)}) * ${f(band.tile)};
vec4 grassMap = texture2D(uGrassDensity, grassXZ / uGrassDensitySize + 0.5);
float grassSeed = grassHash(grassXZ * 0.913 + 5.3);
float grassDist = distance(grassXZ, cameraPosition.xz);
float grassSize = 1.0 - smoothstep(${f(band.fadeOut[0])}, ${f(band.fadeOut[1])}, grassDist);
${grow}
grassSize *= step(grassSeed, grassMap.r * uGrassKeep) * grassMap.g;
grassSize *= ${f(GRASS_HEIGHT)} * (0.8 + 0.4 * grassHash(grassXZ + 9.1));
vec3 grassRoot = vec3(grassXZ.x, groundHeightAt(grassXZ) - 0.04, grassXZ.y);
float grassYaw = grassHash(grassXZ + 4.2) * 6.2832;
float grassC = cos(grassYaw);
float grassS = sin(grassYaw);
vec3 grassLocal = vec3(grassC * transformed.x + grassS * transformed.z, transformed.y, grassC * transformed.z - grassS * transformed.x) * grassSize;
transformed = grassSize > 0.001
  ? plantDisplace(grassRoot, grassRoot + grassLocal, max(grassLocal.y, 0.0), ${f(BEND)})
  : grassRoot;

#ifdef USE_COLOR
  vec3 grassGround = shadedGround(lushGroundColor(grassRoot.y), grassXZ);
  vec3 grassTipColour = grassGround * mix(${vec3(COOL_TIP_GAIN)}, ${vec3(WARM_TIP_GAIN)}, grassHash(grassXZ + 3.7));
  grassTipColour = mix(grassTipColour, ${vec3(STRAW)}, grassMap.b * ${f(MAX_DRY)});
  // Forest floor grass is darker than the meadow.
  grassTipColour *= 1.0 - 0.3 * grassMap.a;
  float grassTip = color.r * (1.0 - smoothstep(${f(TIP_FADE[0])}, ${f(TIP_FADE[1])}, grassDist));
  vColor.rgb = mix(grassGround, grassTipColour, grassTip);
  // A darker root band fakes the blades shading each other; grass casts no shadows of its own.
  vColor.rgb *= mix(0.55, 1.0, smoothstep(0.0, 0.35, color.r));
  vColor.rgb *= 1.0 + windGust(grassXZ) * grassTip * vec3(0.22, 0.2, 0.1);
#endif
`;
}
