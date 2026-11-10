import * as THREE from 'three';
import type { Random } from '@core';
import type { SurfaceStyler } from '@rendering';

import type { RockModel, RockModelFactory } from './RockModelFactory';

/** Makes unique low-poly rocks by jittering an icosahedron. */
export class RockMeshFactory implements RockModelFactory {
  private readonly material = new THREE.MeshStandardMaterial({ color: 0x8c8378, flatShading: true, roughness: 1 });

  /** Pass `surfaces` only for rocks that stay put; the detail texture is anchored in world space. */
  constructor(
    private readonly random: Random,
    surfaces?: SurfaceStyler,
  ) {
    surfaces?.apply(this.material, 'stone');
  }

  create(radius: number): RockModel {
    const geometry = new THREE.IcosahedronGeometry(radius, 0);
    const positions = geometry.attributes.position;
    // Icosahedron vertices are duplicated per face; jitter by position so faces stay closed.
    const offsets = new Map<string, number>();
    for (let i = 0; i < positions.count; i++) {
      const key = `${positions.getX(i).toFixed(3)},${positions.getY(i).toFixed(3)},${positions.getZ(i).toFixed(3)}`;
      if (!offsets.has(key)) offsets.set(key, this.random.range(0.7, 1.2));
      const k = offsets.get(key) ?? 1;
      positions.setXYZ(i, positions.getX(i) * k, positions.getY(i) * k * 0.8, positions.getZ(i) * k);
    }
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, hullPoints: Float32Array.from(positions.array) };
  }
}
