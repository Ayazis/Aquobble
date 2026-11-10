import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { SurfaceStyler } from '@rendering';
import type { TownWall } from '../layout/TownWall';
import type { Box } from './Box';
import { wallBoxes } from './wallBoxes';
import { wallMerlons } from './wallMerlons';

/** Builds the low-poly stone wall (with gates and battlements) as a single mesh, town-local. */
export class WallFactory {
  private readonly material = new THREE.MeshStandardMaterial({ color: 0xb3a68e, roughness: 1, flatShading: true });

  constructor(surfaces?: SurfaceStyler) {
    surfaces?.apply(this.material, 'masonry');
  }

  /** `boxes` are the solid parts to collide with; the battlements on top are visual only. */
  create(wall: TownWall): { object: THREE.Object3D; boxes: Box[] } {
    const boxes = wallBoxes(wall);
    const parts = [...boxes, ...wallMerlons(wall)].map(({ center, half }) =>
      new THREE.BoxGeometry(half.x * 2, half.y * 2, half.z * 2).translate(center.x, center.y, center.z),
    );
    const mesh = new THREE.Mesh(mergeGeometries(parts), this.material);
    for (const part of parts) part.dispose();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { object: mesh, boxes };
  }
}
