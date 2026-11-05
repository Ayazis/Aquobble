import type { GameWorld, System } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import { movementVelocity } from './movementVelocity';
import type {} from './Player';
import type {} from './PlayerInput';

/** Small downward push while grounded so the controller keeps reporting ground contact. */
const GROUND_STICK = 1;

/**
 * Fixed system: turns PlayerInput into a character-controller move relative to the camera yaw, with
 * jumping and gravity. Runs before the physics step, which applies the corrected translation.
 */
export class CharacterMovementSystem implements System {
  private readonly players;

  constructor(
    world: GameWorld,
    private readonly physics: PhysicsEngine,
  ) {
    this.players = world.with('player', 'playerInput', 'characterBody');
  }

  update(dt: number): void {
    for (const entity of this.players) {
      const { player, playerInput: input } = entity;
      const yaw = entity.cameraTarget?.yaw ?? 0;
      const horizontal = movementVelocity(input, yaw, player.walkSpeed, player.runSpeed);

      if (player.grounded && input.jump) player.verticalVelocity = player.jumpSpeed;
      else if (player.grounded) player.verticalVelocity = -GROUND_STICK;
      else player.verticalVelocity -= player.gravity * dt;
      input.jump = false;

      const desired = { x: horizontal.x * dt, y: player.verticalVelocity * dt, z: horizontal.z * dt };
      const result = this.physics.moveCharacter(entity.characterBody, desired);
      // Bumped a ceiling: stop rising.
      if (player.verticalVelocity > 0 && result.movement.y < desired.y * 0.5) player.verticalVelocity = 0;
      player.grounded = result.grounded && player.verticalVelocity <= 0;
    }
  }
}
