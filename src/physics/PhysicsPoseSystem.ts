import type { GameWorld, System } from '@core';
import type { PhysicsEngine } from './PhysicsEngine';
import type {} from './PhysicsBody';

/** Fixed system: copies simulated body poses into each entity's Transform. Runs after the step. */
export class PhysicsPoseSystem implements System {
  private readonly bodies;

  constructor(
    world: GameWorld,
    private readonly engine: PhysicsEngine,
  ) {
    this.bodies = world.with('physicsBody', 'transform');
  }

  update(): void {
    for (const entity of this.bodies) this.engine.readPose(entity.physicsBody.handle, entity.transform);
  }
}
