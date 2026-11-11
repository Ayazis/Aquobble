/** GLSL for the wet look (2.11): below a world-height line, darker and glossier, faded by how wet. */
export const WET_VERTEX_PARS = /* glsl */ `
varying float vWetY;
`;

/** After `project_vertex`: `transformed` is skinned, so the line stays put as the legs move. */
export const WET_VERTEX_MAIN = /* glsl */ `
vWetY = (modelMatrix * vec4(transformed, 1.0)).y;
`;

export const WET_FRAGMENT_PARS = /* glsl */ `
uniform float uWetLine;
uniform float uWetAmount;
varying float vWetY;
float wetHere() {
  // A soft band at the line, a little ragged as the cloth wicks.
  return uWetAmount * (1.0 - smoothstep(uWetLine - 0.03, uWetLine + 0.03, vWetY));
}
`;

export const WET_FRAGMENT_COLOR = /* glsl */ `
diffuseColor.rgb *= 1.0 - 0.45 * wetHere();
`;

export const WET_FRAGMENT_ROUGHNESS = /* glsl */ `
roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.35, wetHere());
`;
