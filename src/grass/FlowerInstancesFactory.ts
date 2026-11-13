import * as THREE from 'three';
import { groupByCell } from '@core';
import { lushGroundColor } from '@terrain';
import { grassTipColor } from './grassTipColor';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { FLOWER_SHAPES } from './FlowerShape';
import { flowerGeometry } from './flowerGeometry';

/** Side of a map cell in metres: one instanced mesh per cell and kind, so cells out of view are not drawn. */
const CELL = 40;
/** Flowers sway outside their resting bounds. */
const SWAY_MARGIN = 1;
/** Stems take the colour of a mid-tint grass tip on typical meadow ground (linear RGB). */
const STEM = grassTipColor(lushGroundColor(4), 0.5);

/**
 * Builds the wildflowers: each kind (see `FLOWER_SHAPES`) is one petalled geometry, instanced per map cell and
 * swaying with the grass. The instance colour only lightens or darkens a flower a touch.
 */
export class FlowerInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.Group {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide });
    applyWindSway(material, wind, { strength: 1.2, fadeStart: 60, fadeEnd: 80 });
    const color = new THREE.Color();
    FLOWER_SHAPES.forEach((shape, kind) => {
      const geometry = flowerGeometry(shape, STEM);
      const ofKind = placements.filter((p) => p.variant % FLOWER_SHAPES.length === kind);
      for (const cell of groupByCell(ofKind, CELL)) {
        const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
        cell.forEach((p, i) => {
          mesh.setMatrixAt(i, composeInstance(p));
          mesh.setColorAt(i, color.setScalar(1 + (p.tint - 0.5) * 0.3));
        });
        mesh.computeBoundingSphere();
        if (mesh.boundingSphere) mesh.boundingSphere.radius += SWAY_MARGIN;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    });
    return group;
  }
}
