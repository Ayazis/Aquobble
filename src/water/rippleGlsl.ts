/**
 * Water fragment helper: the ripple map's slope (xy) and foam (z) at world (x, z), zero outside the box and
 * faded towards its edges so the box never shows.
 */
export const RIPPLE_FRAGMENT_PARS = /* glsl */ `
uniform sampler2D uRippleMap;
uniform vec3 uRippleBox;
uniform float uRippleTexel;
// Height differences are taken a texel apart: a finer map needs more gain for the same slope.
#define RIPPLE_NORMAL_GAIN (7.0 * 0.00390625 / uRippleTexel)
vec3 rippleAt(vec2 p) {
  if (uRippleBox.z <= 0.0) return vec3(0.0);
  vec2 uv = (p - uRippleBox.xy) / uRippleBox.z;
  float edge = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
  if (edge <= 0.0) return vec3(0.0);
  float e = uRippleTexel;
  float hx = texture2D(uRippleMap, uv + vec2(e, 0.0)).r - texture2D(uRippleMap, uv - vec2(e, 0.0)).r;
  float hz = texture2D(uRippleMap, uv + vec2(0.0, e)).r - texture2D(uRippleMap, uv - vec2(0.0, e)).r;
  float fade = smoothstep(0.0, 0.12, edge);
  float foam = clamp(texture2D(uRippleMap, uv).b, 0.0, 1.0);
  vec2 slope = clamp(vec2(-hx, -hz) * RIPPLE_NORMAL_GAIN, -1.6, 1.6);
  return vec3(slope, foam) * fade;
}
/** Ripple height (m-ish) at world (x, z): positive on the crests of the rings. */
float rippleHeightAt(vec2 p) {
  if (uRippleBox.z <= 0.0) return 0.0;
  vec2 uv = (p - uRippleBox.xy) / uRippleBox.z;
  float edge = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
  if (edge <= 0.0) return 0.0;
  return texture2D(uRippleMap, uv).r * smoothstep(0.0, 0.12, edge);
}
`;

/** Ripple simulation pass: damped wave equation on (height, previous height, foam), plus queued drops. */
export const RIPPLE_SIM_FRAGMENT = /* glsl */ `
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uShift;
uniform float uStiffness;
uniform vec4 uDrops[16];
uniform float uDropFoam[16];
uniform int uDropCount;
varying vec2 vUv;
vec4 at(vec2 uv) {
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(uPrev, uv);
}
void main() {
  vec2 uv = vUv + uShift * uTexel;
  vec4 c = at(uv);
  float n = at(uv + vec2(uTexel.x, 0.0)).r + at(uv - vec2(uTexel.x, 0.0)).r
    + at(uv + vec2(0.0, uTexel.y)).r + at(uv - vec2(0.0, uTexel.y)).r;
  float v = (c.r - c.g) * 0.994 + uStiffness * (n - 4.0 * c.r);
  float h = (c.r + v) * 0.9995;
  float foam = c.b * 0.991;
  for (int i = 0; i < 16; i++) {
    if (i >= uDropCount) break;
    vec4 d = uDrops[i];
    float r = distance(vUv, d.xy) / d.z;
    if (r < 1.0) {
      float f = 0.5 + 0.5 * cos(r * 3.14159);
      h -= d.w * f;
      foam = max(foam, uDropFoam[i] * f);
    }
  }
  gl_FragColor = vec4(h, c.r, foam, 1.0);
}
`;

export const RIPPLE_SIM_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
