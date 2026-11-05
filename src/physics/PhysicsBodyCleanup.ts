import type { GameWorld } from '@core';
import type { PhysicsEngine } from './PhysicsEngine';
import type {} from './PhysicsBody';

/** Removes the engine body whenever an entity with a PhysicsBody leaves the world. */
export class PhysicsBodyCleanup {
  private readonly unsubscribe: () => void;

  constructor(world: GameWorld, engine: PhysicsEngine) {
    this.unsubscribe = world.with('physicsBody').onEntityRemoved.subscribe((entity) => {
      engine.removeBody(entity.physicsBody.handle);
    });
  }

  dispose(): void {
    this.unsubscribe();
  }
}
