import { CAUSTIC_RANGE } from '../detail/WaterDetailFactory';

/**
 * Sunlight focused on the bed by the ripples above: the caustic patch of the detail map, twice, at two sizes
 * drifting against each other. Where both are bright the light dances; the net tightens and blurs with
 * depth. Red, green and blue are read a hair apart, so the bright threads carry a faint rainbow fringe.
 * Averages about 1.
 */
export const WATER_CAUSTICS_GLSL = /* glsl */ `
float waterCausticNet(vec2 q, float t, float lod) {
  float a = textureLod(uWaterNormals, q * 0.11 + t * vec2(0.019, 0.011), lod).a;
  float b = textureLod(uWaterNormals, vec2(q.y, -q.x) * 0.073 + t * vec2(-0.012, 0.016), lod - 0.6).a;
  return min(a, b) * ${(CAUSTIC_RANGE * 1.6).toFixed(2)};
}
/** \`pixel\`: metres of bed one pixel covers (the mip level is set by hand: the bed's position is too coarse to derive it). */
vec3 waterCaustics(vec2 q, float t, float under, float pixel) {
  float lod = log2(max(pixel * 0.11 * float(textureSize(uWaterNormals, 0).x), 1.0)) + log2(1.0 + under * 0.5);
#ifdef WATER_FINE
  float split = 0.01 + under * 0.006;
  return vec3(
    waterCausticNet(q + vec2(split, 0.0), t, lod),
    waterCausticNet(q, t, lod),
    waterCausticNet(q - vec2(split, 0.0), t, lod));
#else
  return vec3(waterCausticNet(q, t, lod));
#endif
}
`;
