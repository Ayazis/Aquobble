import * as THREE from 'three';

/** Placeholder player: a low-poly capsule centred on its origin, until the rigged character arrives. */
export class PlayerMeshFactory {
  create(halfHeight: number, radius: number): THREE.Mesh {
    const geometry = new THREE.CapsuleGeometry(radius, halfHeight * 2, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xd9a441, flatShading: true, roughness: 0.7 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
