import type { GameWorld, Random, System, Vec3 } from '@core';
import type { Navigator } from '@navigation';
import type { PhysicsEngine } from '@physics';
import { avoidNeighbours } from './avoidNeighbours';
import type {} from './Townsfolk';
import { wanderStep } from './wanderStep';

/** Small downward push while grounded so the controller keeps reporting ground contact. */
const GROUND_STICK = 1;
const GRAVITY = 20;

/**
 * Fixed system: runs each townsperson's wander AI (route following, stepping around other characters)
 * and moves its character controller, with gravity.
 */
export class TownsfolkMovementSystem implements System {
  private readonly folks;
  private readonly characters;
  private readonly positions: Vec3[] = [];
  private readonly desired: Vec3 = { x: 0, y: 0, z: 0 };

  constructor(
    world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly navigator: Navigator,
    private readonly random: Random,
  ) {
    this.folks = world.with('townsfolk', 'characterBody', 'transform');
    this.characters = world.with('characterBody', 'transform');
  }

  update(dt: number): void {
    const { positions, desired } = this;
    positions.length = 0;
    for (const { transform } of this.characters) positions.push(transform.position);

    for (const { townsfolk: folk, characterBody, transform } of this.folks) {
      const { position } = transform;
      wanderStep(folk, position.x, position.z, dt, this.navigator, this.random);
      // Standing on the ground: nothing to move, so skip the (costly) collision query.
      if (folk.state === 'idle' && folk.grounded) continue;
      avoidNeighbours(folk, position, positions);
      if (folk.grounded) folk.verticalVelocity = -GROUND_STICK;
      else folk.verticalVelocity -= GRAVITY * dt;
      desired.x = folk.moveX * dt;
      desired.y = folk.verticalVelocity * dt;
      desired.z = folk.moveZ * dt;
      folk.grounded = this.physics.moveCharacter(characterBody, desired).grounded;
    }
  }
}
