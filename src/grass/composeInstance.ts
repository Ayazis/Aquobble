import * as THREE from 'three';
import type { GrassPlacement } from './GrassPlacement';

const matrix = new THREE.Matrix4();
const position = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

/** Instance matrix for a placement (shared scratch matrix: use it before the next call). */
export function composeInstance(p: GrassPlacement): THREE.Matrix4 {
  rotation.setFromAxisAngle(up, p.yaw);
  return matrix.compose(position.set(p.x, p.y, p.z), rotation, scale.setScalar(p.scale));
}
