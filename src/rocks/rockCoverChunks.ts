import * as THREE from 'three';
import { GROUND_SHADE_GLSL } from '@terrain';

const vec3 = (hex: number) => {
  const c = new THREE.Color(hex);
  return `vec3(${[c.r, c.g, c.b].map((v) => v.toFixed(4)).join(', ')})`;
};

/** World heights (m) between which lichen comes in. */
export const LICHEN_BAND = { start: 8, end: 12 } as const;

/** GLSL injected into the scatter rocks' material by `applyRockCover`: moss, lichen and a wet band. */
export const ROCK_COVER_VERTEX_PARS = /* glsl */ `
${GROUND_SHADE_GLSL}
varying vec3 vRockPos;
varying float vRockMoss;
`;

export const ROCK_COVER_VERTEX_MAIN = /* glsl */ `
#ifdef USE_INSTANCING
  vRockPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
  // Moss grows where tree crowns shade the rock's own spot.
  vRockMoss = groundShade((modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xz).y;
#else
  vRockPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vRockMoss = 0.0;
#endif
`;

export const ROCK_COVER_FRAGMENT_PARS = /* glsl */ `
uniform float uRockWetLevel;
varying vec3 vRockPos;
varying float vRockMoss;
float rockHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float rockNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(rockHash(i), rockHash(i + vec2(1.0, 0.0)), f.x),
    mix(rockHash(i + vec2(0.0, 1.0)), rockHash(i + vec2(1.0)), f.x), f.y);
}
`;

export const ROCK_COVER_FRAGMENT_MAIN = /* glsl */ `
{
  // Facet normal in world space, towards the viewer.
  vec3 rockN = normalize(cross(dFdx(vRockPos), dFdy(vRockPos)));
  float wobble = sin(vRockPos.x * 2.3 + sin(vRockPos.z * 1.7) * 1.5) * sin(vRockPos.z * 2.9 + vRockPos.y * 2.1);
  // Moss lies on upward faces of rocks under trees, with a ragged edge.
  float moss = smoothstep(0.45, 0.7, rockN.y + wobble * 0.22) * smoothstep(0.15, 0.5, vRockMoss);
  diffuseColor.rgb = mix(diffuseColor.rgb, ${vec3(0x5f7a34)} * (0.85 + 0.3 * wobble), moss * 0.9);
  // Lichen: small pale flecks on any face, on high ground.
  float blotch = rockNoise(vRockPos.xz * 3.1 + vRockPos.y * 2.3) * 0.6 + rockNoise(vRockPos.zy * 9.0 + vRockPos.x * 5.0) * 0.4;
  float lichen = smoothstep(0.58, 0.66, blotch)
    * smoothstep(${LICHEN_BAND.start.toFixed(1)}, ${LICHEN_BAND.end.toFixed(1)}, vRockPos.y + wobble);
  diffuseColor.rgb = mix(diffuseColor.rgb, ${vec3(0xb3b48c)}, lichen * 0.5);
  // Wet and dark where the sea washes over it.
  diffuseColor.rgb *= mix(0.5, 1.0, smoothstep(uRockWetLevel, uRockWetLevel + 0.22, vRockPos.y + wobble * 0.05));
}
`;
