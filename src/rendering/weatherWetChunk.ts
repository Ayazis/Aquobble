/**
 * Lane G: weather. Wet look for every standard material, from the shared `uWetness` uniform (x = 0..1 how wet
 * the world is). Surfaces facing up (roads, roofs, ground) darken and turn glossy; walls stay nearly dry.
 */

/** Declared ahead of the physical lighting functions, so only standard/physical materials see it. */
export const WEATHER_WET_PARS = /* glsl */ `
uniform vec4 uWetness;
`;

/** Appended to `normal_fragment_maps`, where the final view-space normal is known. */
export const WEATHER_WET_FRAGMENT = /* glsl */ `
#ifdef STANDARD
{
  float wetUp = smoothstep( 0.35, 0.8, ( vec4( normal, 0.0 ) * viewMatrix ).y ) * uWetness.x;
  diffuseColor.rgb *= 1.0 - 0.32 * wetUp;
  roughnessFactor = mix( roughnessFactor, roughnessFactor * 0.35, wetUp );
}
#endif
`;
