import * as THREE from 'three';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { grassTuftGeometry } from './grassTuftGeometry';

/** Builds all grass tufts as one instanced mesh (one draw call) that sways and bends in the shader. */
export class GrassInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.InstancedMesh {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    applyWindSway(material, wind, { strength: 0.55, fadeStart: 55, fadeEnd: 75 });

    const mesh = new THREE.InstancedMesh(grassTuftGeometry(), material, placements.length);
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      mesh.setMatrixAt(i, composeInstance(p));
      mesh.setColorAt(i, color.setHSL(0.2 + p.tint * 0.1, 0.45 + p.tint * 0.2, 0.42 + p.tint * 0.16));
    });
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    // Blades sway outside their static bounds; the field covers the island anyway.
    mesh.frustumCulled = false;
    return mesh;
  }
}
