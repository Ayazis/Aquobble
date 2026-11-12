/**
 * Fragment declarations (replaces `<lights_physical_pars_fragment>`): every direct light goes through
 * `RE_Direct_Grass`. A light in front of the blade is the usual surface lighting; a light behind it comes
 * through the blade instead, tinted yellow-green by it and strongest looking into the light. That is what
 * makes a meadow glow against a low sun. Shadows and cloud shadows are already in the light's colour here, so
 * the glow is shadowed like everything else, and lanterns shine through blades too.
 */
export const GRASS_LIGHT_PARS = /* glsl */ `
#include <lights_physical_pars_fragment>
vec3 grassThin = vec3(0.0);
void RE_Direct_Grass(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  if (dot(geometryNormal, directLight.direction) >= 0.0) {
    RE_Direct_Physical(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
    return;
  }
  PhysicalMaterial thin = material;
  float into = pow(saturate(dot(-geometryViewDir, directLight.direction)), 4.0);
  thin.diffuseContribution = material.diffuseContribution * grassThin * (1.0 + 1.6 * into);
  thin.specularColor = vec3(0.0);
  thin.specularColorBlended = vec3(0.0);
  thin.specularF90 = 0.0;
  RE_Direct_Physical(directLight, geometryPosition, -geometryNormal, geometryViewDir, geometryClearcoatNormal, thin, reflectedLight);
}
#undef RE_Direct
#define RE_Direct RE_Direct_Grass
`;

/** After `<color_fragment>`: the blade's colour, a paler midrib up close, and how much light it lets through. */
export const GRASS_COLOUR_FRAGMENT = /* glsl */ `
float grassRib = (1.0 - smoothstep(0.0, 0.3, abs(vGrassLook.y))) * (1.0 - vGrassFar.x);
diffuseColor.rgb = vGrassColour * (1.0 + 0.16 * grassRib);
grassThin = vec3(1.3, 1.2, 0.5) * vGrassFar.y;
`;

/** After `<roughnessmap_fragment>`: glossy towards the tip, dull at the root and far away. */
export const GRASS_ROUGHNESS_FRAGMENT = /* glsl */ `
roughnessFactor = vGrassLook.w;
`;

/**
 * After `<normal_fragment_begin>`: the blade's own normal (already turned to the viewer) leaned towards the
 * ground's. Up close blades keep most of their own, so they sparkle; far away the field is lit like the hill.
 */
export const GRASS_NORMAL_FRAGMENT = /* glsl */ `
normal = normalize(mix(normal, normalize(vGrassUp), vGrassFar.x));
`;

/** After `<aomap_fragment>`: roots sit in the shade of the blades round them, sky light most of all. */
export const GRASS_OCCLUSION_FRAGMENT = /* glsl */ `
float grassShade = vGrassLook.z;
reflectedLight.indirectDiffuse *= grassShade;
reflectedLight.indirectSpecular *= grassShade * grassShade * 0.7;
reflectedLight.directSpecular *= grassShade;
reflectedLight.directDiffuse *= mix(1.0, grassShade, 0.65);
`;
