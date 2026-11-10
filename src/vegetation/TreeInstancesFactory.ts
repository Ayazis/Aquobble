import * as THREE from 'three';
import type { SurfaceStyler } from '@rendering';
import { treeCrownGeometry } from './treeCrownGeometry';
import type { TreePlacement } from './TreePlacement';

/** Trunk dimensions at scale 1; `ForestSpawner` sizes the collider from these. */
export const TRUNK = { height: 4.2, radius: 0.42 };

/** Builds broadleaf trees (about 8.5 m at scale 1) as two instanced meshes, one draw call each. */
export class TreeInstancesFactory {
  constructor(private readonly surfaces?: SurfaceStyler) {}

  create(placements: readonly TreePlacement[]): THREE.Group {
    const count = placements.length;
    const trunkGeometry = new THREE.CylinderGeometry(TRUNK.radius * 0.6, TRUNK.radius, TRUNK.height, 6).translate(
      0,
      TRUNK.height / 2,
      0,
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5236, flatShading: true, roughness: 1 });
    const crownMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 });
    this.surfaces?.apply(trunkMaterial, 'bark');
    this.surfaces?.apply(crownMaterial, 'foliage');
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
    const crowns = new THREE.InstancedMesh(treeCrownGeometry(), crownMaterial, count);

    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      rotation.setFromAxisAngle(up, p.yaw);
      matrix.compose(new THREE.Vector3(p.x, p.y, p.z), rotation, new THREE.Vector3().setScalar(p.scale));
      trunks.setMatrixAt(i, matrix);
      crowns.setMatrixAt(i, matrix);
      // Fresh spring greens, drifting towards yellow-green on some trees.
      crowns.setColorAt(i, color.setHSL(0.3 - p.tint * 0.07, 0.62, 0.36 + p.tint * 0.1));
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
