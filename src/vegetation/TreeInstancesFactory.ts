import * as THREE from 'three';
import { groupByCell } from '@core';
import type { SurfaceStyler } from '@rendering';
import { treeCrownGeometry } from './treeCrownGeometry';
import type { TreePlacement } from './TreePlacement';

/** Trunk dimensions at scale 1; `ForestSpawner` sizes the collider from these. */
export const TRUNK = { height: 4.2, radius: 0.42 };

/** Side of a map cell in metres; each cell of trees is drawn (or skipped, when out of view) on its own. */
const CELL = 40;

/**
 * Builds broadleaf trees (about 8.5 m at scale 1) as two instanced meshes per map cell, all sharing the
 * same geometry and materials.
 */
export class TreeInstancesFactory {
  constructor(private readonly surfaces?: SurfaceStyler) {}

  create(placements: readonly TreePlacement[]): THREE.Group {
    const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radius * 0.6, TRUNK.radius, TRUNK.height, 6).translate(
      0,
      TRUNK.height / 2,
      0,
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5236, flatShading: true, roughness: 1 });
    const crownMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 });
    this.surfaces?.apply(trunkMaterial, 'bark');
    this.surfaces?.apply(crownMaterial, 'foliage');
    const crownGeometry = treeCrownGeometry();

    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    const group = new THREE.Group();
    for (const cell of groupByCell(placements, CELL)) {
      const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, cell.length);
      const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, cell.length);
      cell.forEach((p, i) => {
        rotation.setFromAxisAngle(up, p.yaw);
        matrix.compose(new THREE.Vector3(p.x, p.y, p.z), rotation, new THREE.Vector3().setScalar(p.scale));
        trunks.setMatrixAt(i, matrix);
        crowns.setMatrixAt(i, matrix);
        // Fresh spring greens, drifting towards yellow-green on some trees.
        crowns.setColorAt(i, color.setHSL(0.3 - p.tint * 0.07, 0.62, 0.36 + p.tint * 0.1));
      });
      for (const mesh of [trunks, crowns]) {
        mesh.computeBoundingSphere();
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
    return group;
  }
}
