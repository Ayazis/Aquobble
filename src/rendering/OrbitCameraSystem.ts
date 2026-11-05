import type { System, Vec3 } from '@core';
import { Vector3, type PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { SmoothZoom } from './camera/SmoothZoom';

/**
 * Frame system: orbit camera around a target. OrbitControls handles rotate/pan/pinch; the wheel goes
 * through SmoothZoom so zooming eases instead of stepping. A placeholder until there is a player.
 */
export class OrbitCameraSystem implements System {
  private readonly controls: OrbitControls;
  private readonly offset = new Vector3();

  constructor(
    private readonly camera: PerspectiveCamera,
    canvas: HTMLElement,
    private readonly zoom: SmoothZoom,
    position: Vec3,
    target: Vec3,
  ) {
    camera.position.copy(position);
    this.controls = new OrbitControls(camera, canvas);
    this.controls.target.copy(target);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.48;
  }

  update(dt: number): void {
    this.controls.update(dt);
    this.offset.subVectors(this.camera.position, this.controls.target);
    const distance = this.zoom.update(dt, this.offset.length());
    this.camera.position.copy(this.controls.target).addScaledVector(this.offset.normalize(), distance);
  }
}
