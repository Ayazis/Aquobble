import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { SurfaceStyler } from '@rendering';
import type { TownWall } from '../layout/TownWall';
import type { Box } from './Box';
import { gateArchGeometries } from './gateArchGeometry';
import { gateDoors } from './gateDoors';
import { tint, tintedBox } from './tintedGeometry';
import { wallBoxes } from './wallBoxes';
import { wallMerlons } from './wallMerlons';
import { wallTrim } from './wallTrim';

/**
 * Builds the low-poly stone wall as two meshes, town-local: masonry (segments, towers, gatehouses, plinth, cap
 * course, battlements and gate arches, vertex-coloured with dirt and moss at the foot) and the open wooden doors.
 */
export class WallFactory {
  private readonly stone = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true, vertexColors: true });
  private readonly wood = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true, vertexColors: true });

  constructor(surfaces?: SurfaceStyler) {
    surfaces?.apply(this.stone, 'masonry');
    surfaces?.apply(this.wood, 'wood');
  }

  /** `boxes` are the solid parts to collide with; trim, battlements, arches and doors are visual only. */
  create(wall: TownWall): { object: THREE.Object3D; boxes: Box[] } {
    const boxes = wallBoxes(wall);
    const { plinths, caps } = wallTrim(boxes);
    const doors = gateDoors(wall);
    const object = new THREE.Group();
    object.add(
      this.mesh(this.stone, [
        ...boxes.map((b) => tintedBox(b, 'stone')),
        ...wallMerlons(wall).map((b) => tintedBox(b, 'stone')),
        ...plinths.map((b) => tintedBox(b, 'plinth')),
        ...caps.map((b) => tintedBox(b, 'cap')),
        ...gateArchGeometries(wall).map((g) => tint(g, 'stone')),
      ]),
      this.mesh(this.wood, [
        ...doors.wood.map((b) => tintedBox(b, 'wood')),
        ...doors.iron.map((b) => tintedBox(b, 'iron')),
      ]),
    );
    return { object, boxes };
  }

  private mesh(material: THREE.Material, parts: THREE.BufferGeometry[]): THREE.Mesh {
    const mesh = new THREE.Mesh(mergeGeometries(parts), material);
    for (const part of parts) part.dispose();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
