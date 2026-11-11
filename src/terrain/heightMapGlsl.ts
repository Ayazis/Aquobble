/** Height reported for positions off the terrain: far below any water, so they count as open sea. */
export const HEIGHT_OFF_MAP = -100;

/**
 * GLSL `float groundHeightAt(vec2 xz)`: the terrain height (m) under a world position, from the texture of
 * `createHeightMapUniforms`. One texture read.
 */
export const HEIGHT_MAP_GLSL = /* glsl */ `
uniform sampler2D uHeightMap;
uniform vec3 uHeightMapFrame;
float groundHeightAt(vec2 xz) {
  if (max(abs(xz.x), abs(xz.y)) > uHeightMapFrame.z) return ${HEIGHT_OFF_MAP.toFixed(1)};
  return texture2D(uHeightMap, xz * uHeightMapFrame.x + uHeightMapFrame.y).r;
}
`;
