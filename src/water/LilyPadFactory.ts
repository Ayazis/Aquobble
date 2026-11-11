import * as THREE from 'three';
import type { Random } from '@core';

/** How far above the water the pads float (m): enough not to flicker against it. */
const FLOAT = 0.015;

/** Floating lily pads for a pond: a handful of notched green discs near the bank, as one instanced mesh. */
export class LilyPadFactory {
  // A disc with one wedge missing.
  private readonly geometry = new THREE.CircleGeometry(1, 9, 0.35, Math.PI * 2 - 0.7).rotateX(-Math.PI / 2);
  private readonly material = new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide });

  constructor(private readonly random: Random) {}

  /** Pads for a pond of `radius`, relative to its centre at water level. */
  create(radius: number): THREE.InstancedMesh {
    const count = 4 + Math.floor(this.random.next() * radius);
    const pads = new THREE.InstancedMesh(this.geometry, this.material, count);
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const colour = new THREE.Color();
    // Pads gather in two or three patches rather than ringing the pond evenly.
    const patch = this.random.range(0, Math.PI * 2);
    for (let i = 0; i < count; i++) {
      const angle = patch + (i % 3) * 2.1 + this.random.range(-0.45, 0.45);
      const distance = radius * this.random.range(0.45, 0.82);
      const size = this.random.range(0.22, 0.42);
      rotation.setFromAxisAngle(up, this.random.range(0, Math.PI * 2));
      matrix.compose(
        new THREE.Vector3(Math.cos(angle) * distance, FLOAT, Math.sin(angle) * distance),
        rotation,
        new THREE.Vector3(size, 1, size),
      );
      pads.setMatrixAt(i, matrix);
      pads.setColorAt(i, colour.setHSL(this.random.range(0.27, 0.33), 0.55, this.random.range(0.26, 0.36)));
    }
    pads.receiveShadow = true;
    return pads;
  }
}
