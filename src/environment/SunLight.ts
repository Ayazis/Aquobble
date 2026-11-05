import * as THREE from 'three';

/** Directional sun with soft shadows covering the play area, plus sky/ground fill light. */
export class SunLight {
  readonly sun: THREE.DirectionalLight;
  readonly fill = new THREE.HemisphereLight(0xbfd8ff, 0x3a2f24, 0.6);

  constructor(direction: THREE.Vector3, color: number, intensity: number, shadowExtent = 80) {
    this.sun = new THREE.DirectionalLight(color, intensity);
    this.sun.position.copy(direction).multiplyScalar(120);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -shadowExtent,
      right: shadowExtent,
      top: shadowExtent,
      bottom: -shadowExtent,
      far: 400,
    });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.05;
  }
}
