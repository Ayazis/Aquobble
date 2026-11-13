import * as THREE from 'three';
import { groupByCell } from '@core';
import type { SurfaceStyler } from '@rendering';
import { applyCrownRim } from './applyCrownRim';
import { applyCrownSway, type CrownSwayClock } from './applyCrownSway';
import { CROWN_BASE, treeCrownGeometry } from './treeCrownGeometry';
import { treeTrunkGeometry } from './treeTrunkGeometry';
import type { TreePlacement } from './TreePlacement';
import type { TreeSpecies } from './TreeSpecies';

/**
 * How the simple tree stands in for each species (the far level, or everything when the models are
 * missing): crown width and height relative to the trunk, and the crown's hue, saturation and lightness.
 * Dead trunks get no crown.
 */
const STAND_IN: Readonly<Record<TreeSpecies, { width: number; height: number; hsl: [number, number, number] }>> = {
  pineSmall: { width: 0.55, height: 1.05, hsl: [0.36, 0.45, 0.24] },
  pineTall: { width: 0.55, height: 1.2, hsl: [0.37, 0.42, 0.22] },
  oakRound: { width: 0.8, height: 0.8, hsl: [0.27, 0.55, 0.33] },
  oakTall: { width: 0.75, height: 1.05, hsl: [0.28, 0.5, 0.31] },
  dead: { width: 0, height: 1.25, hsl: [0, 0, 0] },
};

/** Side of a map cell in metres; each cell of trees is drawn (or skipped, when out of view) on its own. */
const CELL = 40;

/**
 * Builds simple stand-in trees (about 8.5 m at scale 1, about 210 triangles), shaped and tinted per species,
 * as two instanced meshes per map cell. Every call shares the same geometry and materials. Trunks flare into
 * roots and lean a little; crowns sway when given a clock and get the sun-side rim.
 */
export class TreeInstancesFactory {
  private readonly trunkGeometry = treeTrunkGeometry();
  private readonly crownGeometry = treeCrownGeometry();
  private readonly trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5236, flatShading: true, roughness: 1 });
  private readonly crownMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });

  constructor(surfaces?: SurfaceStyler, sway?: CrownSwayClock) {
    surfaces?.apply(this.trunkMaterial, 'bark');
    surfaces?.apply(this.crownMaterial, 'foliage');
    if (sway) applyCrownSway(this.crownMaterial, sway, CROWN_BASE);
    applyCrownRim(this.crownMaterial);
  }

  create(placements: readonly TreePlacement[]): THREE.Group {
    const { trunkGeometry, crownGeometry, trunkMaterial, crownMaterial } = this;

    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const color = new THREE.Color();
    const group = new THREE.Group();
    for (const cell of groupByCell(placements, CELL)) {
      const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, cell.length);
      const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, cell.length);
      cell.forEach((p, i) => {
        rotation.setFromEuler(euler.set(p.lean, p.yaw, 0, 'YXZ'));
        const look = STAND_IN[p.species];
        const at = new THREE.Vector3(p.x, p.y, p.z);
        const s = p.scale;
        trunks.setMatrixAt(i, matrix.compose(at, rotation, new THREE.Vector3(s * 0.8, s * look.height, s * 0.8)));
        crowns.setMatrixAt(
          i,
          matrix.compose(at, rotation, new THREE.Vector3(s * look.width, s * look.height, s * look.width)),
        );
        const [h, sat, l] = look.hsl;
        crowns.setColorAt(i, color.setHSL(h - p.tint * 0.04, sat, l + p.tint * 0.06));
      });
      for (const mesh of [trunks, crowns]) {
        mesh.computeBoundingSphere();
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
    return group;
  }
}
