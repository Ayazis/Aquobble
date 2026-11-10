import * as THREE from 'three';
import { groupByCell } from '@core';
import { lushGroundColor } from '@terrain';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyGroundBlend } from './applyGroundBlend';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { grassTipColor } from './grassTipColor';
import { grassTuftGeometry } from './grassTuftGeometry';

/** Side of a map cell in metres: small enough that most cells fall outside the view at any moment. */
const CELL = 20;
/** Blades sway and bend a little outside their resting bounds. */
const SWAY_MARGIN = 1;
/** Camera distances over which tufts shrink away. */
const FADE = { start: 55, end: 75 };
/** Tips lose their own colour over this many metres before the shrinking starts. */
const TIP_FADE_LENGTH = 20;

/**
 * Builds the grass as one instanced mesh per map cell, all sharing one geometry and one swaying material,
 * so cells outside the camera's view are not drawn at all. Each tuft is the colour of the ground at its
 * root and its own tint at the tip.
 */
export class GrassInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.Group {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    applyWindSway(material, wind, { strength: 0.55, fadeStart: FADE.start, fadeEnd: FADE.end });
    applyGroundBlend(material, { tipFadeStart: FADE.start - TIP_FADE_LENGTH, tipFadeEnd: FADE.start });
    const geometry = grassTuftGeometry();

    const group = new THREE.Group();
    const color = new THREE.Color();
    for (const cell of groupByCell(placements, CELL)) {
      const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
      cell.forEach((p, i) => {
        mesh.setMatrixAt(i, composeInstance(p));
        // The tip colour; the shader blends it up from the ground colour at the root.
        mesh.setColorAt(i, color.setRGB(...grassTipColor(lushGroundColor(p.y), p.tint)));
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
