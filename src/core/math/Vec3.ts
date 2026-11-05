/** Engine-agnostic 3D vector. Structurally compatible with three.js and Rapier vectors. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });
