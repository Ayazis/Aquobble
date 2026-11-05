import type { Transform, Vec3 } from '@core';
import type { BodyDesc } from './BodyDesc';
import type { BodyHandle } from './BodyHandle';

/**
 * The physics port. Game code depends on this, never on Rapier directly, so the backend can be
 * swapped (or faked in tests).
 */
export interface PhysicsEngine {
  step(dt: number): void;
  createBody(desc: BodyDesc): BodyHandle;
  removeBody(handle: BodyHandle): void;
  /** Copies the body's current pose into `out` (no allocation). */
  readPose(handle: BodyHandle, out: Transform): void;
  applyImpulse(handle: BodyHandle, impulse: Vec3): void;
  /** Applies a force for the next step only (e.g. buoyancy, wind). */
  addForce(handle: BodyHandle, force: Vec3): void;
}
