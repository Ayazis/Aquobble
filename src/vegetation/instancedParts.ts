import * as THREE from 'three';
import type { ModelPart } from './ModelPart';

/** What instancing needs from a placement: where, which way, how big, and an optional lean. */
export interface Instance {
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
  lean?: number;
  tint: number;
}

/**
 * One instanced mesh per model part, all instances of `items`. `paint` sets each instance's colour per
 * part (it multiplies the texture or vertex colours).
 */
export function instancedParts<T extends Instance>(
  parts: readonly ModelPart[],
  items: readonly T[],
  paint: (item: T, part: ModelPart, color: THREE.Color) => void,
): THREE.InstancedMesh[] {
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();
  return parts.map((part) => {
    const mesh = new THREE.InstancedMesh(part.geometry, part.material, items.length);
    items.forEach((item, i) => {
      rotation.setFromEuler(euler.set(item.lean ?? 0, item.yaw, 0, 'YXZ'));
      matrix.compose(position.set(item.x, item.y, item.z), rotation, scale.setScalar(item.scale));
      mesh.setMatrixAt(i, matrix);
      paint(item, part, color.setRGB(1, 1, 1));
      mesh.setColorAt(i, color);
    });
    mesh.computeBoundingSphere();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  });
}
