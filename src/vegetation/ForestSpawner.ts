import { identityQuat, vec3, type GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type { TreeInstancesFactory } from './TreeInstancesFactory';
import type { TreePlacer, TreePlacerOptions } from './TreePlacer';

/** Places a forest and adds it to the world as a single render entity. */
export class ForestSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly placer: TreePlacer,
    private readonly instances: TreeInstancesFactory,
    private readonly physics: PhysicsEngine,
  ) {}

  spawn(options: TreePlacerOptions): void {
    const placements = this.placer.place(options);
    for (const p of placements) {
      // Trunk only (matches TreeInstancesFactory: 2 m tall, ~0.3 m radius, scaled per tree).
      this.physics.createBody({
        kind: 'fixed',
        position: vec3(p.x, p.y + p.scale, p.z),
        shape: { type: 'cylinder', halfHeight: p.scale, radius: 0.3 * p.scale },
      });
    }
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object: this.instances.create(placements) },
    });
  }
}
