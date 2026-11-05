import { identityQuat, type GameWorld, type Vec3 } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type {} from './Rock';
import type { RockModelFactory } from './RockModelFactory';

/** Creates a rock entity: dynamic convex-hull body + matching mesh. */
export class RockSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly meshes: RockModelFactory,
  ) {}

  spawn(position: Vec3, radius: number): void {
    const { mesh, hullPoints } = this.meshes.create(radius);
    const handle = this.physics.createBody({
      kind: 'dynamic',
      position,
      shape: { type: 'convexHull', points: hullPoints },
      density: 2.5,
      friction: 0.8,
      restitution: 0.2,
    });
    this.world.add({
      rock: { radius },
      transform: { position: { ...position }, rotation: identityQuat() },
      physicsBody: { handle },
      renderObject: { object: mesh },
    });
  }
}
