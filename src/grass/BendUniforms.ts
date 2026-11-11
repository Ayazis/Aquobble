import * as THREE from 'three';

/**
 * What plant shaders read of the bend map: the texture (RGBA = push x, push z, push velocity x, z) and the
 * box it covers (x, z of its centre, side in metres). Fresh uniforms hold a blank map, so nothing bends.
 */
export interface BendUniforms {
  uBendMap: { value: THREE.Texture };
  uBendBox: { value: THREE.Vector3 };
}

export function createBendUniforms(): BendUniforms {
  const blank = new THREE.DataTexture(new Float32Array(4), 1, 1, THREE.RGBAFormat, THREE.FloatType);
  blank.needsUpdate = true;
  return { uBendMap: { value: blank }, uBendBox: { value: new THREE.Vector3(0, 0, 1) } };
}

/** GLSL: the bend at a world xz, fading to nothing at the box edge. Needs the uniforms above. */
export const BEND_MAP_GLSL = /* glsl */ `
uniform sampler2D uBendMap;
uniform vec3 uBendBox;
vec4 bendAt(vec2 xz) {
  vec2 uv = (xz - uBendBox.xy) / uBendBox.z + 0.5;
  vec2 edge = smoothstep(0.0, 0.08, uv) * smoothstep(0.0, 0.08, 1.0 - uv);
  return texture2D(uBendMap, uv) * edge.x * edge.y;
}
// How fast the blades at xz are springing about, 0..1: brightens them as they rustle.
float bendRustle(vec2 xz) {
  return clamp(length(bendAt(xz).zw) * 0.45, 0.0, 1.0);
}
`;
