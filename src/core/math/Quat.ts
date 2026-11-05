/** Engine-agnostic rotation quaternion. Structurally compatible with three.js and Rapier. */
export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export const identityQuat = (): Quat => ({ x: 0, y: 0, z: 0, w: 1 });
