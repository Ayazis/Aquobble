import * as THREE from 'three';
import { groupByCell } from '@core';
import { ROCK_FAMILIES } from './RockFamily';
import type { RockPlacement } from './RockPlacement';
import type { RockVariantSet } from './RockVariant';

/** Side of a map cell in metres; each cell's rocks are drawn (or skipped, when out of view) on their own. */
const CELL = 50;
/** Linear-space greys the rocks range between: a warm sandstone and a cool slate. */
const WARM = new THREE.Color(0xab987f);
const COOL = new THREE.Color(0x93918a);

const hash = (x: number, z: number, seed: number) =>
  Math.abs(Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453) % 1;

/**
 * Builds the decorative rock scatter: per map cell, one InstancedMesh for each rock shape in use there.
 * Every rock gets its own grey, warm or cool, through the instance colour.
 */
export class RockScatterFactory {
  /** `material` must use vertex colours (the shapes carry a darkened base) and a white base colour. */
  constructor(private readonly material: THREE.Material) {}

  create(placements: readonly RockPlacement[], variants: RockVariantSet): THREE.Group {
    const group = new THREE.Group();
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();
    for (const cell of groupByCell(placements, CELL)) {
      for (const family of ROCK_FAMILIES) {
        variants[family].forEach(({ geometry }, v) => {
          const mine = cell.filter((p) => p.family === family && p.variant === v);
          if (mine.length === 0) return;
          const instanced = new THREE.InstancedMesh(geometry, this.material, mine.length);
          mine.forEach((p, i) => {
            rotation.setFromEuler(euler.set(p.tilt, p.yaw, 0, 'YXZ'));
            matrix.compose(position.set(p.x, p.y, p.z), rotation, scale.set(p.scale, p.scale * p.squash, p.scale));
            instanced.setMatrixAt(i, matrix);
            // Neighbours in a cluster lean the same way (warm or cool), each with its own brightness.
            const warmth = hash(Math.round(p.x / 12), Math.round(p.z / 12), 0) * 0.7 + hash(p.x, p.z, 1) * 0.3;
            color
              .copy(COOL)
              .lerp(WARM, warmth)
              .multiplyScalar(0.85 + hash(p.x, p.z, 2) * 0.3);
            instanced.setColorAt(i, color);
          });
          instanced.computeBoundingSphere();
          instanced.castShadow = true;
          instanced.receiveShadow = true;
          group.add(instanced);
        });
      }
    }
    return group;
  }
}
