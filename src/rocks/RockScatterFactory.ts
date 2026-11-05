import * as THREE from 'three';
import type { RockModelFactory } from './RockModelFactory';
import type { RockPlacement } from './RockPlacement';

/** The scatter's render object plus each variant's unit-radius hull (for colliders). */
export interface RockScatter {
  object: THREE.Group;
  hulls: readonly Float32Array[];
}

/** Builds the decorative rock scatter as one InstancedMesh per procedural geometry variant. */
export class RockScatterFactory {
  constructor(private readonly models: RockModelFactory) {}

  create(placements: readonly RockPlacement[], variants: number): RockScatter {
    const group = new THREE.Group();
    const hulls: Float32Array[] = [];
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    for (let v = 0; v < variants; v++) {
      const { mesh, hullPoints } = this.models.create(1);
      hulls.push(hullPoints);
      const mine = placements.filter((p) => p.variant === v);
      if (mine.length === 0 || !(mesh instanceof THREE.Mesh)) continue;
      const instanced = new THREE.InstancedMesh(mesh.geometry, mesh.material, mine.length);
      mine.forEach((p, i) => {
        rotation.setFromEuler(euler.set(p.tilt, p.yaw, 0, 'YXZ'));
        matrix.compose(position.set(p.x, p.y, p.z), rotation, scale.set(p.scale, p.scale * p.squash, p.scale));
        instanced.setMatrixAt(i, matrix);
        // Deterministic per-rock brightness variation around the material colour.
        const hash = Math.abs(Math.sin(p.x * 12.9898 + p.z * 78.233) * 43758.5453) % 1;
        instanced.setColorAt(i, color.setScalar(0.8 + hash * 0.35));
      });
      instanced.castShadow = true;
      instanced.receiveShadow = true;
      group.add(instanced);
    }
    return { object: group, hulls };
  }
}
