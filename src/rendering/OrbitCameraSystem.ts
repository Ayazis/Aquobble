import type { System, Vec3 } from '@core';
import type { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** Frame system: mouse/touch orbit camera around a target. A placeholder until there is a player. */
export class OrbitCameraSystem implements System {
  private readonly controls: OrbitControls;

  constructor(camera: PerspectiveCamera, canvas: HTMLElement, position: Vec3, target: Vec3) {
    camera.position.copy(position);
    this.controls = new OrbitControls(camera, canvas);
    this.controls.target.copy(target);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.48;
  }

  update(): void {
    this.controls.update();
  }
}
