/**
 * GLSL twin of the `Wind` port. Include once (top level) in a shader whose uniforms hold `WindUniforms`.
 * `windGust(xz)` matches `gustAt` in TypeScript; `windVector(xz)` is direction * (strength + gust).
 */
export const windShaderChunk = /* glsl */ `
uniform vec2 uWindDirection;
uniform float uWindStrength;
uniform float uWindTime;
uniform vec3 uGustFronts;

float windGust(vec2 xz) {
  float along = dot(xz, uWindDirection);
  float across = -xz.x * uWindDirection.y + xz.y * uWindDirection.x;
  float wobble = 0.35 * sin(across * 0.05 + uGustFronts.z) + 0.15 * sin(across * 0.13 + uWindTime * 0.2);
  float p = (along - uWindTime * uGustFronts.y) / uGustFronts.x + wobble;
  float f = fract(p);
  float front = smoothstep(0.0, 0.12, f) * (1.0 - smoothstep(0.12, 0.6, f));
  return front * uWindStrength;
}

vec2 windVector(vec2 xz) {
  return uWindDirection * (uWindStrength + windGust(xz));
}
`;
