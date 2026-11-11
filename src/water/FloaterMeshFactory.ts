import * as THREE from 'three';

/** Builds the three.js objects for floating things: driftwood logs and single lily pads. */
export class FloaterMeshFactory {
  private readonly wood = new THREE.MeshStandardMaterial({ color: 0x7a6248, roughness: 0.95, flatShading: true });
  private readonly leaf = new THREE.MeshStandardMaterial({ color: 0x3f7a35, roughness: 0.8, side: THREE.DoubleSide });
  // A disc with one wedge missing, lying flat.
  private readonly pad = new THREE.CircleGeometry(1, 9, 0.35, Math.PI * 2 - 0.7).rotateX(-Math.PI / 2);

  /** A log along its local y axis (the physics cylinder's axis). */
  log(halfLength: number, radius: number): THREE.Object3D {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.85, radius, halfLength * 2, 6), this.wood);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /** A pad of `radius`, its top face at local y = `top`. */
  lilyPad(radius: number, top: number, hue: number): THREE.Object3D {
    const material = this.leaf.clone();
    material.color.setHSL(hue, 0.55, 0.32);
    const mesh = new THREE.Mesh(this.pad, material);
    mesh.scale.set(radius, 1, radius);
    mesh.position.y = top;
    mesh.receiveShadow = true;
    return new THREE.Group().add(mesh);
  }
}
