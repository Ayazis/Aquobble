import * as THREE from 'three';
import { groupByCell } from '@core';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { grassTuftGeometry } from './grassTuftGeometry';

/** Side of a map cell in metres: small enough that most cells fall outside the view at any moment. */
const CELL = 20;
/** Blades sway and bend a little outside their resting bounds. */
const SWAY_MARGIN = 1;

/**
 * Builds the grass as one instanced mesh per map cell, all sharing one geometry and one swaying material,
 * so cells outside the camera's view are not drawn at all.
 */
export class GrassInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.Group {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    applyWindSway(material, wind, { strength: 0.55, fadeStart: 55, fadeEnd: 75 });
    const geometry = grassTuftGeometry();

    const group = new THREE.Group();
    const color = new THREE.Color();
    for (const cell of groupByCell(placements, CELL)) {
      const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
      cell.forEach((p, i) => {
        mesh.setMatrixAt(i, composeInstance(p));
        mesh.setColorAt(i, color.setHSL(0.24 + p.tint * 0.08, 0.6 + p.tint * 0.15, 0.44 + p.tint * 0.14));
      });
      mesh.computeBoundingSphere();
      if (mesh.boundingSphere) mesh.boundingSphere.radius += SWAY_MARGIN;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}
