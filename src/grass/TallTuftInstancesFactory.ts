import * as THREE from 'three';
import { groupByCell } from '@core';
import { createGroundShadeUniforms, lushGroundColor, type GroundShadeUniforms } from '@terrain';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyGroundBlend } from './applyGroundBlend';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';
import { dryTipColor } from './dryTipColor';
import { grassTipColor } from './grassTipColor';
import { reedGeometry } from './reedGeometry';
import { seedHeadGeometry } from './seedHeadGeometry';

/** Side of a map cell in metres: one instanced mesh per cell, so cells out of view are not drawn. */
const CELL = 20;
/** Tall tufts sway and bend outside their resting bounds. */
const SWAY_MARGIN = 1.5;
/** Camera distance where tall tufts start shrinking away, and where they are gone. */
const FADE_OUT = [45, 60] as const;
/** Tips lose their own colour over the last stretch before they shrink away. */
const TIP_FADE = [30, 45] as const;
/** Seed heads are at least this dry (straw coloured at the top); reeds a deeper green than the grass. */
const SEED_DRY = 0.65;
const REED_GAIN = [0.7, 0.88, 0.6];

/** The tall tuft kinds, placed by `TallTuftPlacer`. */
export interface TallTuftPlacements {
  seedHeads: readonly GrassPlacement[];
  reeds: readonly GrassPlacement[];
}

/**
 * Builds seed-head grass and reeds as instanced meshes per map cell, each kind with one geometry and one
 * swaying, ground-blended material like the short grass (so they glow towards a low sun too). Tall stalks
 * bend less per metre than short blades.
 */
export class TallTuftInstancesFactory {
  constructor(private readonly shade: GroundShadeUniforms = createGroundShadeUniforms()) {}

  create(placements: TallTuftPlacements, wind: WindSway): THREE.Group {
    const group = new THREE.Group();
    const seedTip = (p: GrassPlacement) => dryTipColor(grassTipColor(lushGroundColor(p.y), p.tint), SEED_DRY);
    const reedTip = (p: GrassPlacement) =>
      grassTipColor(lushGroundColor(p.y), p.tint * 0.5).map((c, i) => c * REED_GAIN[i]) as [number, number, number];
    this.cells(placements.seedHeads, seedHeadGeometry(), 0.35, wind, seedTip).forEach((m) => group.add(m));
    this.cells(placements.reeds, reedGeometry(), 0.12, wind, reedTip).forEach((m) => group.add(m));
    return group;
  }

  private cells(
    placements: readonly GrassPlacement[],
    geometry: THREE.BufferGeometry,
    strength: number,
    wind: WindSway,
    tip: (p: GrassPlacement) => [number, number, number],
  ): THREE.InstancedMesh[] {
    if (placements.length === 0) return [];
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    applyWindSway(material, wind, { strength, fadeStart: FADE_OUT[0], fadeEnd: FADE_OUT[1] });
    applyGroundBlend(material, { tipFadeStart: TIP_FADE[0], tipFadeEnd: TIP_FADE[1], shade: this.shade });
    const color = new THREE.Color();
    return groupByCell(placements, CELL).map((cell) => {
      const mesh = new THREE.InstancedMesh(geometry, material, cell.length);
      cell.forEach((p, i) => {
        mesh.setMatrixAt(i, composeInstance(p));
        mesh.setColorAt(i, color.setRGB(...tip(p)));
      });
      mesh.computeBoundingSphere();
      if (mesh.boundingSphere) mesh.boundingSphere.radius += SWAY_MARGIN;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      return mesh;
    });
  }
}
