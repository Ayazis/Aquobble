/**
 * Refraction (desktop, lane H). Reads the opaque scene behind the water from `SCENE_COLOUR_UNIFORMS`,
 * wobbled by the wave normal, and tints it by how much water the view ray crosses. The water's own lit colour
 * is scaled by its opacity and the scene behind is added as emission, so the surface draws opaque
 * (alpha 1) and no longer blends. With `uRefraction` 0 (phones) nothing changes.
 */
export const WATER_REFRACTION_PARS = /* glsl */ `
uniform sampler2D uSceneColour;
uniform vec2 uSceneResolution;
uniform float uRefraction;
`;

/** Runs after the normal is known and before lighting (at the emissive map hook). */
export const WATER_FRAGMENT_REFRACTION = /* glsl */ `
if (uRefraction > 0.5) {
  vec2 screen = gl_FragCoord.xy / uSceneResolution;
  float here = vViewPosition.z;
  vec4 straight = texture2D(uSceneColour, screen);
  float reach = smoothstep(0.0, 1.5, straight.a - here);
  vec4 behind = texture2D(uSceneColour, screen + normal.xy * 0.03 * reach);
  // Never refract something that stands in front of the water.
  if (behind.a < here) behind = straight;
  // No valid depth behind (empty or unresolved copy): draw plain lit water, never the dark copy.
  float thick = behind.a > here + 0.01 ? behind.a - here : 1e4;
  float murk = 1.0 - exp(-thick * 0.22);
  float opacity = clamp(max(diffuseColor.a * 0.8, murk), 0.0, 1.0);
  vec3 seen = behind.rgb * mix(vec3(1.0), diffuseColor.rgb * 1.2, 0.5);
  totalEmissiveRadiance += seen * (1.0 - opacity);
  diffuseColor.rgb *= opacity;
  diffuseColor.a = 1.0;
}
`;
