import { LUSH_BAND } from './LushBand';
import { lushGroundColor } from './lushGroundColor';

const vec3 = (c: readonly number[]) => `vec3(${c.map((v) => v.toFixed(4)).join(', ')})`;

/**
 * GLSL `vec3 lushGroundColor(float height)`: the same blend as the TypeScript `lushGroundColor`, for the
 * terrain shader and for anything that must match the ground under it (grass roots).
 */
export const LUSH_GROUND_GLSL = /* glsl */ `
vec3 lushGroundColor(float height) {
  return mix(${vec3(lushGroundColor(-Infinity))}, ${vec3(lushGroundColor(Infinity))},
    smoothstep(${LUSH_BAND.start.toFixed(1)}, ${LUSH_BAND.end.toFixed(1)}, height));
}
`;
