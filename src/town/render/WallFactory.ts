import * as THREE from 'three';
import type { TownWall } from '../layout/TownWall';
import type { Box } from './Box';
import { wallBoxes } from './wallBoxes';

/** Builds the low-poly stone wall (with gates) as one group of boxes, town-local. */
export class WallFactory {
  private readonly material = new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.95, flatShading: true });

  create(wall: TownWall): { object: THREE.Object3D; boxes: Box[] } {
    const boxes = wallBoxes(wall);
    const group = new THREE.Group();
    for (const { center, half } of boxes) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2), this.material);
      mesh.position.set(center.x, center.y, center.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return { object: group, boxes };
  }
}
