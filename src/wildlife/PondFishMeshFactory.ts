import * as THREE from 'three';

/** The meshes for the pond fish: faint rings on the water and a small fish body for the jumps. */
export class PondFishMeshFactory {
  /** Flat unit rings (radius 1), brightness through the instance colour (additive). */
  rings(count: number): THREE.InstancedMesh {
    const geometry = new THREE.RingGeometry(0.9, 1, 28).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return this.pool(geometry, material, count);
  }

  /** A stretched diamond about 25 cm long along +z. */
  fish(count: number): THREE.InstancedMesh {
    const geometry = new THREE.OctahedronGeometry(0.06, 0).scale(0.6, 0.8, 2);
    return this.pool(geometry, new THREE.MeshLambertMaterial({ color: 0x9aa39a }), count);
  }

  private pool(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const black = new THREE.Color(0, 0, 0);
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, zero);
      mesh.setColorAt(i, black);
    }
    return mesh;
  }
}
