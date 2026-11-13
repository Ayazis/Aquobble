/**
 * Light the surface gives off beyond its mirror and its body colour. Looking towards the sun, the light
 * that entered the back of a wave comes out through its thin crest, green: the taller the crest, the
 * brighter. Ripple rings catch a bright rim, and foam is lifted a little so it still reads by moonlight.
 */
export const WATER_FRAGMENT_GLOW = /* glsl */ `
{
  float wBack = pow(saturate(dot(normalize(vViewPosition), -normalize(wSunView + normal * 0.5))), 3.0);
  float wCrest = saturate(vWaveLift * 3.0 + 0.3) * saturate(wDepth * 0.8);
  totalEmissiveRadiance += wSunColour * vec3(0.02, 0.3, 0.24) * (wBack * wCrest * 0.22 * wSea * (1.0 - waterFoam));
  float wRing = smoothstep(0.012, 0.05, rippleHeightAt(wP));
  totalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * wRing * 0.16 * (1.0 - uWaterNight * 0.6);
  totalEmissiveRadiance += vec3(waterFoam) * mix(0.03, 0.08, uWaterNight);
}
`;

/** Water mirrors 2% of the light that meets it head on (glass, the material's default, mirrors 4%); foam none. */
export const WATER_FRAGMENT_SPECULAR = /* glsl */ `
material.specularColor = vec3(0.02 * (1.0 - waterFoam));
material.specularColorBlended = material.specularColor;
`;

/** A glint can be thousands of times brighter than a sunlit wall; past a point that only feeds bloom halos. */
export const WATER_FRAGMENT_GLINT_LIMIT = /* glsl */ `
reflectedLight.directSpecular = min(reflectedLight.directSpecular, vec3(24.0));
`;
