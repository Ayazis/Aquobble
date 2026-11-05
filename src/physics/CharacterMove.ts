import type { Vec3 } from '@core';

/** Result of moving a character: the translation actually applied after collisions, and whether it stands on ground. */
export interface CharacterMove {
  movement: Vec3;
  grounded: boolean;
}
