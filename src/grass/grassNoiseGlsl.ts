/**
 * GLSL hashes and value noise for the grass shaders. No `sin`: these stay stable for cell numbers in the
 * thousands, so a blade keeps its shape wherever on the island it grows.
 */
export const GRASS_NOISE_GLSL = /* glsl */ `
vec2 grassHash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}
float grassHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
// Smooth noise in [0, 1], one feature per unit.
float grassNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = grassHash(i);
  float b = grassHash(i + vec2(1.0, 0.0));
  float c = grassHash(i + vec2(0.0, 1.0));
  float d = grassHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;
