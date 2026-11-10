import type { Vec3 } from '@core';
import type * as THREE from 'three';
import { flyStep, type FlyInput } from './flyStep';

/** Metres per second of the free camera. */
const FLY_SPEED = 12;

/**
 * A camera pose that overrides the game's own camera while held: set from code (screenshots) or frozen
 * where the camera is and flown from there. Apply it after the game's camera system each frame.
 */
export class DebugCamera {
  private pose: { position: Vec3; target: Vec3 } | null = null;

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  get held(): boolean {
    return this.pose !== null;
  }

  /** Puts the camera at `position`, looking at `target`, until released. */
  hold(position: Vec3, target: Vec3): void {
    this.pose = { position: { ...position }, target: { ...target } };
  }

  /** Freezes the camera where it is now, or hands it back to the game. */
  toggle(): void {
    if (this.pose) {
      this.pose = null;
      return;
    }
    const position = this.camera.position.clone();
    const ahead = this.camera.getWorldDirection(position.clone()).multiplyScalar(10).add(position);
    this.hold(position, ahead);
  }

  release(): void {
    this.pose = null;
  }

  /** Flies the held pose and writes it to the camera. Does nothing while released. */
  apply(dt: number, input: FlyInput): void {
    if (!this.pose) return;
    flyStep(this.pose.position, this.pose.target, input, FLY_SPEED * dt);
    const { position, target } = this.pose;
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(target.x, target.y, target.z);
  }
}
