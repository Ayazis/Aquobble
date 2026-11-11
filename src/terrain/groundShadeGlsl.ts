import { linearRgb } from './linearRgb';

const vec3 = (hex: number) =>
  `vec3(${linearRgb(hex)
    .map((v) => v.toFixed(4))
    .join(', ')})`;

/** How much of its light the ground loses at a full contact stamp and under a closed canopy. */
export const GROUND_SHADE_DARKEN = { contact: 0.5, canopy: 0.22 } as const;

/**
 * GLSL for reading the `GroundShade` map (uniforms from `createGroundShadeUniforms`), for the terrain shader
 * and for anything that must match the ground under it:
 * `vec2 groundShade(vec2 xz)` is (contact, canopy) in 0..1, and `vec3 shadedGround(vec3 colour, vec2 xz)`
 * browns the colour towards a forest floor under trees and darkens it where objects stand.
 */
export const GROUND_SHADE_GLSL = /* glsl */ `
uniform sampler2D uGroundShadeMap;
uniform float uGroundShadeSize;
vec2 groundShade(vec2 xz) {
  return texture2D(uGroundShadeMap, xz / uGroundShadeSize + 0.5).rg;
}
vec3 shadedGround(vec3 colour, vec2 xz) {
  vec2 shade = groundShade(xz);
  colour = mix(colour, ${vec3(0x6b6a3c)}, shade.y * 0.45);
  return colour * (1.0 - ${GROUND_SHADE_DARKEN.canopy.toFixed(2)} * shade.y) * (1.0 - ${GROUND_SHADE_DARKEN.contact.toFixed(2)} * shade.x);
}
`;
