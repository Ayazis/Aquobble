import type { GameWorld, Random, System } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from './Townsfolk';
import type { WanderArea } from './WanderArea';
import { wanderStep } from './wanderStep';

/** Small downward push while grounded so the controller keeps reporting ground contact. */
const GROUND_STICK = 1;
const GRAVITY = 20;

/** Fixed system: runs each townsperson's wander AI and moves its character controller (with gravity). */
export class TownsfolkMovementSystem implements System {
  private readonly folks;

  constructor(
    world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly area: WanderArea,
    private readonly random: Random,
  ) {
    this.folks = world.with('townsfolk', 'characterBody', 'transform');
  }

  update(dt: number): void {
    for (const { townsfolk: folk, characterBody, transform } of this.folks) {
      const { x, z } = transform.position;
      const horizontal = wanderStep(folk, x, z, dt, this.area, this.random);
      folk.moveX = horizontal.x;
      folk.moveZ = horizontal.z;
      if (folk.grounded) folk.verticalVelocity = -GROUND_STICK;
      else folk.verticalVelocity -= GRAVITY * dt;
      const desired = { x: horizontal.x * dt, y: folk.verticalVelocity * dt, z: horizontal.z * dt };
      folk.grounded = this.physics.moveCharacter(characterBody, desired).grounded;
    }
  }
}
