import type { Transform, Vec3 } from '@core';
import type { BodyDesc } from './BodyDesc';
import type { BodyHandle } from './BodyHandle';
import type { CharacterBody } from './CharacterBody';
import type { CharacterDesc } from './CharacterDesc';
import type { CharacterMove } from './CharacterMove';

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
  /** Applies an impulse at a world point, so it also spins the body (e.g. buoyancy at a body's corners). */
  applyImpulseAt(handle: BodyHandle, impulse: Vec3, point: Vec3): void;
  /** Applies a force for the next step only (e.g. buoyancy, wind). */
  addForce(handle: BodyHandle, force: Vec3): void;
  /** Creates a kinematic capsule body with a character controller (autostep, slope limit, snap to ground). */
  createCharacter(desc: CharacterDesc): CharacterBody;
  /**
   * Slides the character along `desired` (a translation for this step) around obstacles. The corrected
   * translation is applied on the next `step`.
   */
  moveCharacter(character: CharacterBody, desired: Vec3): CharacterMove;
  /**
   * Distance along the ray (direction must be normalised) to the first collider hit within `maxDistance`,
   * or null. Colliders of `exclude` are ignored.
   */
  castRay(origin: Vec3, direction: Vec3, maxDistance: number, exclude?: BodyHandle): number | null;
}
