/** GLSL injected by `applyVerge`: frayed edges and wheel ruts from the `verge` attribute (cover, lane). */

/** Wobbles of the frayed edge per metre: the broad wander and the small nibbles. */
const EDGE_WANDER = 0.9;
const EDGE_NIBBLE = 5.0;
/** Share of the fray that comes from the small nibbles (0 = smooth waves, 1 = all crumbs). */
const EDGE_NIBBLE_SHARE = 0.35;
/** Wheel ruts: metres from the centreline, half-width in metres, and how much they darken the dirt. */
const RUT_OFFSET = 0.62;
const RUT_HALF_WIDTH = 0.17;
const RUT_DARKEN = 0.22;

const f = (n: number) => n.toFixed(3);

export const VERGE_VERTEX_PARS = /* glsl */ `
attribute vec2 verge;
varying vec2 vVerge;
varying vec2 vVergePos;
`;

export const VERGE_VERTEX_MAIN = /* glsl */ `
vVerge = verge;
vVergePos = (modelMatrix * vec4(transformed, 1.0)).xz;
`;

export const VERGE_FRAGMENT_PARS = /* glsl */ `
varying vec2 vVerge;
varying vec2 vVergePos;

float vergeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vergeNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 t = fract(p);
  t = t * t * (3.0 - 2.0 * t);
  float a = mix(vergeHash(i), vergeHash(i + vec2(1.0, 0.0)), t.x);
  float b = mix(vergeHash(i + vec2(0.0, 1.0)), vergeHash(i + vec2(1.0, 1.0)), t.x);
  return mix(a, b, t.y);
}
`;

/** Cuts the edge strip away along a noisy line (no blending, so no sorting) and darkens twin ruts. */
export const VERGE_FRAGMENT_MAIN = /* glsl */ `
if (vVerge.x < 1.0) {
  float fray = mix(vergeNoise(vVergePos * ${f(EDGE_WANDER)}), vergeNoise(vVergePos * ${f(EDGE_NIBBLE)}), ${f(EDGE_NIBBLE_SHARE)});
  if (vVerge.x < fray) discard;
}
float rutDistance = abs(abs(vVerge.y) - ${f(RUT_OFFSET)});
if (rutDistance < ${f(RUT_HALF_WIDTH)}) {
  float rut = 1.0 - smoothstep(${f(RUT_HALF_WIDTH * 0.35)}, ${f(RUT_HALF_WIDTH)}, rutDistance);
  rut *= 0.5 + 0.5 * vergeNoise(vVergePos * 0.7);
  diffuseColor.rgb *= 1.0 - ${f(RUT_DARKEN)} * rut;
}
`;
