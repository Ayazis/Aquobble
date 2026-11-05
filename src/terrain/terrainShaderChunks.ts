/** GLSL injected into MeshStandardMaterial by `TerrainMaterialFactory`. */

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
varying vec3 vTerrainPos;
varying vec3 vTerrainNormal;

// Texture colour divided by its own average, so the palette colour stays the overall tint.
vec3 terrainDetail(sampler2D map, vec2 uv) {
  vec3 mean = max(textureLod(map, vec2(0.5), 16.0).rgb, vec3(0.04));
  // Two scales, the second rotated, to break up visible tiling.
  vec2 uv2 = mat2(0.8, -0.6, 0.6, 0.8) * uv * 0.37 + 0.31;
  vec3 near = texture2D(map, uv).rgb;
  vec3 far = texture2D(map, uv2).rgb;
  return clamp(mix(near, far, 0.4) / mean, 0.0, 2.0);
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

  float rock = max(smoothstep(0.32, 0.55, slope + macro * 0.08), smoothstep(13.0, 16.0, h + macro * 1.5));
  float sand = (1.0 - smoothstep(0.5, 1.5, h + macro * 0.4)) * (1.0 - rock);
  float grass = max(1.0 - rock - sand, 0.0);

  vec3 detail = vec3(0.0);
  if (grass > 0.001) detail += terrainDetail(uGrassMap, uv) * grass;
  if (sand > 0.001) detail += terrainDetail(uSandMap, uv * 1.6) * sand;
  if (rock > 0.001) detail += terrainTriplanar(uRockMap, vTerrainPos * 0.15, n) * rock;
  detail *= mix(0.9, 1.1, macro);

  // Snow keeps most of its flat colour.
  float strength = uTerrainDetail * mix(1.0, 0.35, smoothstep(21.0, 23.0, h));
  diffuseColor.rgb *= mix(vec3(1.0), detail, strength);
}
`;
