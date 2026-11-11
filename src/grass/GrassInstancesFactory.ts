import * as THREE from 'three';
import { groupByCell } from '@core';
import { createGroundShadeUniforms, lushGroundColor, type GroundShadeUniforms } from '@terrain';
import type { GrassPlacement } from './GrassPlacement';
import type { GrassRing } from './GrassRing';
import { GRASS_RINGS } from './grassRings';
import type { WindSway } from './WindSway';
import { applyGroundBlend } from './applyGroundBlend';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { dryTipColor } from './dryTipColor';
import { dryness } from './dryness';
import { grassTipColor } from './grassTipColor';
import { grassTuftGeometry } from './grassTuftGeometry';

/** Side of a map cell in metres, per ring: near cells are small so whole cells drop out past the ring. */
const CELL = { near: 10, far: 20 };
/** Blades sway and bend a little outside their resting bounds. */
const SWAY_MARGIN = 1;
/** Tips lose their own colour over this many metres before the far ring starts shrinking. */
const TIP_FADE_LENGTH = 20;

/** Tufts for each ring: the near ring is denser, the far ring sparser. */
export interface GrassRingPlacements {
  near: readonly GrassPlacement[];
  far: readonly GrassPlacement[];
}

/**
 * Builds the grass in two rings (see `GRASS_RINGS`), each as one instanced mesh per map cell sharing one
 * geometry and one swaying material, so cells outside the camera's view are not drawn. Near cells also sit
 * in a `THREE.LOD` that drops them entirely beyond the near ring. Each tuft is the colour of the ground at its
 * root and its own tint at the tip.
 */
export class GrassInstancesFactory {
  constructor(private readonly shade: GroundShadeUniforms = createGroundShadeUniforms()) {}

  create(placements: GrassRingPlacements, wind: WindSway): THREE.Group {
    const group = new THREE.Group();
    const far = GRASS_RINGS.far;
    const tipFade = { start: far.fadeOut[0] - TIP_FADE_LENGTH, end: far.fadeOut[0] };
    for (const mesh of this.cells(placements.far, far, CELL.far, wind, tipFade)) group.add(mesh);
    const near = GRASS_RINGS.near;
    const cull = near.fadeOut[1] + CELL.near * Math.SQRT1_2 + SWAY_MARGIN;
    for (const mesh of this.cells(placements.near, near, CELL.near, wind, tipFade)) {
      const centre = mesh.boundingSphere?.center.clone() ?? new THREE.Vector3();
      const lod = new THREE.LOD();
      lod.position.copy(centre);
      mesh.position.copy(centre).negate();
      lod.addLevel(mesh, 0);
      lod.addLevel(new THREE.Object3D(), cull);
      group.add(lod);
    }
    return group;
  }

  private cells(
    placements: readonly GrassPlacement[],
    ring: GrassRing,
    cellSize: number,
    wind: WindSway,
    tipFade: { start: number; end: number },
  ): THREE.InstancedMesh[] {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    applyWindSway(material, wind, {
      strength: 0.55,
      fadeStart: ring.fadeOut[0],
      fadeEnd: ring.fadeOut[1],
      fadeIn: ring.fadeIn,
    });
    applyGroundBlend(material, { tipFadeStart: tipFade.start, tipFadeEnd: tipFade.end, shade: this.shade });
    const geometry = grassTuftGeometry(ring.blades, ring.halfWidth);
    const color = new THREE.Color();
    return groupByCell(placements, cellSize).map((cell) => {
      const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
      cell.forEach((p, i) => {
        mesh.setMatrixAt(i, composeInstance(p));
        // The tip colour; the shader blends it up from the ground colour at the root.
        const tip = grassTipColor(lushGroundColor(p.y), p.tint);
        mesh.setColorAt(i, color.setRGB(...dryTipColor(tip, dryness(p.x, p.z, p.y))));
      });
      mesh.computeBoundingSphere();
      if (mesh.boundingSphere) mesh.boundingSphere.radius += SWAY_MARGIN;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      return mesh;
    });
  }
}
