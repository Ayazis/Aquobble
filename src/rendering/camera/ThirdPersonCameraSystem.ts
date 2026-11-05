import type { GameWorld, System, Vec3 } from '@core';
import type { PhysicsEngine } from '@physics';
import type { PerspectiveCamera } from 'three';
import type {} from './CameraTarget';
import { clamp, followPosition, orbitDirection, unobstructedDistance } from './followCamera';
import type { PointerLookInput } from './PointerLookInput';
import type { SmoothZoom } from './SmoothZoom';

export interface ThirdPersonCameraOptions {
  /** Radians per pixel of mouse movement. */
  sensitivity: number;
  minPitch: number;
  maxPitch: number;
  startDistance: number;
  /** Gap kept between the camera and anything between it and the target. */
  collisionMargin: number;
  /** Closest the camera may be pushed in by geometry. */
  minDistance: number;
}

export const DEFAULT_THIRD_PERSON_CAMERA: ThirdPersonCameraOptions = {
  sensitivity: 0.0025,
  minPitch: -0.6,
  maxPitch: 1.3,
  startDistance: 6,
  collisionMargin: 0.3,
  minDistance: 0.6,
};

/**
 * Frame system: follows the `cameraTarget` entity from behind. Mouse look (pointer lock) turns it, the
 * wheel zooms via SmoothZoom, and a ray from the target pulls it in so it never sits inside geometry.
 */
export class ThirdPersonCameraSystem implements System {
  private readonly targets;
  private yaw = 0;
  private pitch = 0.35;
  private distance: number;

  constructor(
    world: GameWorld,
    private readonly camera: PerspectiveCamera,
    private readonly physics: PhysicsEngine,
    private readonly look: PointerLookInput,
    private readonly zoom: SmoothZoom,
    private readonly options: ThirdPersonCameraOptions = DEFAULT_THIRD_PERSON_CAMERA,
  ) {
    this.targets = world.with('cameraTarget', 'transform');
    this.distance = options.startDistance;
  }

  update(dt: number): void {
    const target = this.targets.first;
    if (!target) return;
    const { dx, dy } = this.look.consume();
    this.yaw -= dx * this.options.sensitivity;
    this.pitch = clamp(this.pitch + dy * this.options.sensitivity, this.options.minPitch, this.options.maxPitch);
    this.distance = this.zoom.update(dt, this.distance);
    target.cameraTarget.yaw = this.yaw;

    const { position } = target.transform;
    const pivot: Vec3 = { x: position.x, y: position.y + target.cameraTarget.height, z: position.z };
    const hit = this.physics.castRay(
      pivot,
      orbitDirection(this.yaw, this.pitch),
      this.distance,
      target.cameraTarget.ignoreBody,
    );
    const { collisionMargin, minDistance } = this.options;
    const distance = unobstructedDistance(this.distance, hit, collisionMargin, minDistance);
    this.camera.position.copy(followPosition(pivot, this.yaw, this.pitch, distance));
    this.camera.lookAt(pivot.x, pivot.y, pivot.z);
  }
}
