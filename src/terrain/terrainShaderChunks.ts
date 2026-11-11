import { DEFAULT_PALETTE } from './TerrainPalette';
import { linearRgb } from './linearRgb';
import { GROUND_SHADE_GLSL } from './groundShadeGlsl';
import { LUSH_GROUND_GLSL } from './lushGroundGlsl';

/** GLSL injected into MeshStandardMaterial by `TerrainMaterialFactory`. */

// Palette colours as linear-space GLSL constants (three.js converts sRGB hex the same way).
// The grass and forest bands are blended by `lushGroundColor`, which the grass roots share.
const glslColor = (hex: number) =>
  `vec3(${linearRgb(hex)
    .map((v) => v.toFixed(4))
    .join(', ')})`;
const [SAND, , , ROCK, SNOW] = DEFAULT_PALETTE.map((band) => glslColor(band.color));
const EARTH = glslColor(0x7a6450);

export const TERRAIN_VERTEX_PARS = /* glsl */ `
varying vec3 vTerrainPos;
varying vec3 vTerrainNormal;
`;

export const TERRAIN_VERTEX_MAIN = /* glsl */ `
vTerrainPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vTerrainNormal = normalize(mat3(modelMatrix) * objectNormal);
`;

export const TERRAIN_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uGrassMap;
uniform sampler2D uRockMap;
uniform sampler2D uSandMap;
uniform float uTerrainDetail;
uniform float uTerrainWaterLevel;
varying vec3 vTerrainPos;
varying vec3 vTerrainNormal;
${LUSH_GROUND_GLSL}
${GROUND_SHADE_GLSL}
// Texture colour divided by its own average, so the palette colour stays the overall tint.
vec3 terrainDetail(sampler2D map, vec2 uv) {
  vec3 mean = max(textureLod(map, vec2(0.5), 16.0).rgb, vec3(0.04));
  // Two scales, the second rotated, to break up visible tiling.
  vec2 uv2 = mat2(0.8, -0.6, 0.6, 0.8) * uv * 0.37 + 0.31;
  vec3 near = texture2D(map, uv).rgb;
  vec3 far = texture2D(map, uv2).rgb;
  return clamp(mix(near, far, 0.4) / mean, 0.0, 2.0);
}

// Cheap hash value noise (no texture reads) for ragged band edges.
float terrainHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float terrainNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = terrainHash(i), b = terrainHash(i + vec2(1.0, 0.0));
  float c = terrainHash(i + vec2(0.0, 1.0)), d = terrainHash(i + vec2(1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 terrainTriplanar(sampler2D map, vec3 p, vec3 n) {
  vec3 w = pow(abs(n), vec3(4.0));
  w /= (w.x + w.y + w.z);
  return terrainDetail(map, p.zy) * w.x + terrainDetail(map, p.xz) * w.y + terrainDetail(map, p.xy) * w.z;
}
`;

export const TERRAIN_FRAGMENT_MAIN = /* glsl */ `
{
  vec3 n = normalize(vTerrainNormal);
  float h = vTerrainPos.y;
  float slope = 1.0 - n.y;
  vec2 uv = vTerrainPos.xz * 0.25;
  // Macro variation: a slow wobble in the band edges and brightness.
  float macro = sin(vTerrainPos.x * 0.043 + sin(vTerrainPos.z * 0.031) * 2.0) * 0.5 + 0.5;

  // Two octaves of noise jitter the height used for band edges (about +-1.2 m).
  float edge = terrainNoise(vTerrainPos.xz * 0.35) * 0.65 + terrainNoise(vTerrainPos.xz * 1.3) * 0.35 - 0.5;
  float hn = h + edge * 2.4;

  float steep = smoothstep(0.32, 0.55, slope + macro * 0.08 + edge * 0.1);
  float rock = max(steep, smoothstep(13.0, 16.0, hn + macro * 1.5));
  float sand = (1.0 - smoothstep(0.5, 1.5, hn + macro * 0.4)) * (1.0 - rock);
  float grass = max(1.0 - rock - sand, 0.0);

  // Base colour: height bands blended across the noisy edge, steep faces go earth/rock.
  // Plants' ground is browner under tree crowns and darker where a trunk or rock stands on it.
  vec3 lush = shadedGround(lushGroundColor(hn), vTerrainPos.xz);
  vec3 stone = mix(${EARTH}, ${ROCK}, smoothstep(6.0, 14.0, hn));
  float snow = smoothstep(21.0, 23.0, hn) * (1.0 - steep * 0.7);
  // Sand is dark and wet where the sea laps over it, with a ragged upper edge.
  float wet = 1.0 - smoothstep(0.12, 0.42, h - uTerrainWaterLevel + edge * 0.25);
  vec3 base = ${SAND} * mix(1.0, 0.62, wet) * sand + lush * grass + stone * rock;
  diffuseColor.rgb = mix(base, ${SNOW}, snow);

  vec3 detail = vec3(0.0);
  if (grass > 0.001) detail += terrainDetail(uGrassMap, uv) * grass;
  if (sand > 0.001) detail += terrainDetail(uSandMap, uv * 1.6) * sand;
  if (rock > 0.001) detail += terrainTriplanar(uRockMap, vTerrainPos * 0.15, n) * rock;
  detail *= mix(0.9, 1.1, macro);

  // Snow keeps most of its flat colour.
  float strength = uTerrainDetail * mix(1.0, 0.35, snow);
  diffuseColor.rgb *= mix(vec3(1.0), detail, strength);
}
`;
