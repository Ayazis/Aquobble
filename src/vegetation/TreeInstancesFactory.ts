import * as THREE from 'three';
import type { TreePlacement } from './TreePlacement';

/** Builds placeholder low-poly trees as two instanced meshes (one draw call each). */
export class TreeInstancesFactory {
  create(placements: readonly TreePlacement[]): THREE.Group {
    const count = placements.length;
    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 2, 5).translate(0, 1, 0);
    const crownGeometry = new THREE.ConeGeometry(1.6, 4, 6).translate(0, 3.8, 0);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, flatShading: true });
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.9 });
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
    const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, count);

    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      rotation.setFromAxisAngle(up, p.yaw);
      matrix.compose(new THREE.Vector3(p.x, p.y, p.z), rotation, new THREE.Vector3().setScalar(p.scale));
      trunks.setMatrixAt(i, matrix);
      crowns.setMatrixAt(i, matrix);
      crowns.setColorAt(i, color.setHSL(0.28 + p.tint * 0.06, 0.45, 0.28 + p.tint * 0.1));
    });

    const group = new THREE.Group();
    for (const mesh of [trunks, crowns]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}
