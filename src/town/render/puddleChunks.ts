/** GLSL injected by `applyVerge` for puddles, from the `puddle` attribute (see `puddleWetness`). */

const f = (n: number) => n.toFixed(3);

/** Where the water's edge lies in the wetness field, and how much noise wobbles it. */
const EDGE = 0.4;
const EDGE_WOBBLE = 0.24;
/** Standing water: what it multiplies the ground colour by (dark, a touch blue), and how smooth (rough 0..1) it is. */
const WATER_TINT = 'vec3(0.42, 0.46, 0.52)';
const WATER_ROUGHNESS = 0.06;
/** The damp ring outside the water: darker, a little smoother. */
const DAMP_DARKEN = 0.22;

export const PUDDLE_VERTEX_PARS = /* glsl */ `
attribute float puddle;
varying float vPuddle;
`;

export const PUDDLE_VERTEX_MAIN = /* glsl */ `
vPuddle = puddle;
`;

export const PUDDLE_FRAGMENT_PARS = /* glsl */ `
varying float vPuddle;
`;

/** Runs after the verge chunk (needs `vergeNoise` and `vVergePos`); declares `puddleWet` and `puddleDamp`. */
export const PUDDLE_FRAGMENT_COLOR = /* glsl */ `
float puddleWet = 0.0;
float puddleDamp = 0.0;
if (vPuddle > 0.0) {
  float puddleEdge = vPuddle + (vergeNoise(vVergePos * 2.3) - 0.5) * ${f(EDGE_WOBBLE)};
  puddleWet = smoothstep(${f(EDGE - 0.03)}, ${f(EDGE + 0.03)}, puddleEdge);
  puddleDamp = smoothstep(${f(EDGE - 0.3)}, ${f(EDGE)}, puddleEdge);
  diffuseColor.rgb *= 1.0 - ${f(DAMP_DARKEN)} * puddleDamp;
  diffuseColor.rgb *= mix(vec3(1.0), ${WATER_TINT}, puddleWet);
}
`;

/** Still water is smooth, so it mirrors the sky; damp ground is a little less rough than dry. */
export const PUDDLE_FRAGMENT_ROUGHNESS = /* glsl */ `
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.75, puddleDamp);
roughnessFactor = mix(roughnessFactor, ${f(WATER_ROUGHNESS)}, puddleWet);
`;

/** The water's surface is flat: the cobble or dirt normal map does not show through it. */
export const PUDDLE_FRAGMENT_NORMAL = /* glsl */ `
normal = normalize(mix(normal, nonPerturbedNormal, puddleWet));
`;
