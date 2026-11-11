import * as THREE from 'three';
import { groupByCell } from '@core';
import type { LeafLitterPlacement } from './LeafLitterPlacement';
import { leafPatchGeometry } from './leafPatchGeometry';

/** Side of a map cell in metres, so cells outside the view are skipped. */
const CELL = 25;
/** Linear-ish sRGB colours from fresh (tint 0) through brown to dry (tint 1). */
const FRESH = new THREE.Color(0x6f7a2e);
const BROWN = new THREE.Color(0x7a5a2c);
const DRY = new THREE.Color(0x9a7a3e);

/** Builds leaf litter as one instanced mesh per map cell, all sharing one geometry and material. */
export class LeafLitterFactory {
  create(placements: readonly LeafLitterPlacement[]): THREE.Group {
    const geometry = leafPatchGeometry();
    const material = new THREE.MeshStandardMaterial({ roughness: 0.95, side: THREE.DoubleSide });
    const group = new THREE.Group();
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    for (const cell of groupByCell(placements, CELL)) {
      const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
      cell.forEach((p, i) => {
        rotation.setFromAxisAngle(up, p.yaw);
        matrix.compose(new THREE.Vector3(p.x, p.y, p.z), rotation, new THREE.Vector3(p.scale, 1, p.scale));
        mesh.setMatrixAt(i, matrix);
        const t = p.tint;
        if (t < 0.5) color.lerpColors(FRESH, BROWN, t * 2);
        else color.lerpColors(BROWN, DRY, (t - 0.5) * 2);
        mesh.setColorAt(i, color);
      });
      mesh.computeBoundingSphere();
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}
