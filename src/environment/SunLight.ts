import * as THREE from 'three';
import type { Vec3 } from '@core';

const LIGHT_DISTANCE = 150;

/** Directional sun (or moon) with crisp shadows over the play area, plus sky/ground fill light. */
export class SunLight {
  readonly sun = new THREE.DirectionalLight(0xffffff, 1);
  readonly fill = new THREE.HemisphereLight(0xbfd8ff, 0x3a2f24, 0.6);

  constructor(shadowExtent = 70, shadowMapSize = 4096) {
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    Object.assign(this.sun.shadow.camera, {
      left: -shadowExtent,
      right: shadowExtent,
      top: shadowExtent,
      bottom: -shadowExtent,
      near: 10,
      far: LIGHT_DISTANCE * 2,
    });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.shadow.bias = -0.0002;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 2;
  }

  /** Points the light from `direction` (unit vector towards the light). */
  setDirection(direction: Vec3): void {
    this.sun.position.set(direction.x, direction.y, direction.z).multiplyScalar(LIGHT_DISTANCE);
  }
}
