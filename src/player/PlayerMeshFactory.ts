import * as THREE from 'three';
import { applyCharacterRim } from '@rendering';

/** Placeholder player: a low-poly capsule centred on its origin, used when the rigged character is unavailable. */
export class PlayerMeshFactory {
  create(halfHeight: number, radius: number): { object: THREE.Mesh } {
    const geometry = new THREE.CapsuleGeometry(radius, halfHeight * 2, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xd9a441, flatShading: true, roughness: 0.7 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    applyCharacterRim(mesh);
    return { object: mesh };
  }
}
