import * as THREE from 'three';

/** Flat, slightly glossy water plane. Placeholder until water gets waves and buoyancy. */
export class WaterMeshFactory {
  create(size = 1000): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2f6f8f,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  }
}
