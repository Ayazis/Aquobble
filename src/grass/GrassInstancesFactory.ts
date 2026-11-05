import * as THREE from 'three';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';

/** Builds all grass blades as one instanced mesh of single-triangle blades (one draw call). */
export class GrassInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.InstancedMesh {
    const geometry = new THREE.BufferGeometry();
    // A tapered triangle, 0.5 m tall; normals tilted up so blades light like the ground.
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-0.06, 0, 0, 0.06, 0, 0, 0, 0.5, 0], 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0.3, 0, 1, 0.3, 0, 1, 0.3], 3));
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide });
    applyWindSway(material, wind, 0.6);

    const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      mesh.setMatrixAt(i, composeInstance(p));
      mesh.setColorAt(i, color.setHSL(0.22 + p.tint * 0.08, 0.5 + p.tint * 0.15, 0.22 + p.tint * 0.14));
    });
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    // Blades sway outside their static bounds; the field covers the island anyway.
    mesh.frustumCulled = false;
    return mesh;
  }
}
