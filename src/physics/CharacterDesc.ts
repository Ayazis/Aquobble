import type { Vec3 } from '@core';

/** A kinematic capsule moved by a character controller. Centre-based position, metres and radians. */
export interface CharacterDesc {
  position: Vec3;
  /** Half the length of the capsule's straight middle section. */
  halfHeight: number;
  radius: number;
  /** Steepest slope the character can walk up. */
  maxSlopeClimb: number;
  /** Highest ledge the character steps up automatically. */
  stepHeight: number;
  /** How far down the character snaps to stay on the ground when walking down slopes and steps. */
  snapToGround: number;
}
