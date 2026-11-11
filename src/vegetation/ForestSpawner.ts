import { identityQuat, vec3, type GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type { WindSway } from '@grass';
import type { TreeInstancesFactory } from './TreeInstancesFactory';
import type { TreePlacement } from './TreePlacement';
import { TRUNK } from './treeTrunkGeometry';
import type { TreePlacer, TreePlacerOptions } from './TreePlacer';

/**
 * Places a forest and adds it to the world as a single render entity; returns where the trees stand.
 * Give it the wind the crowns were built with, so the entity's clock is advanced with the grass's.
 */
export class ForestSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly placer: TreePlacer,
    private readonly instances: TreeInstancesFactory,
    private readonly physics: PhysicsEngine,
    private readonly wind?: WindSway,
  ) {}

  spawn(options: TreePlacerOptions): TreePlacement[] {
    const placements = this.placer.place(options);
    for (const p of placements) {
      // Trunk only, scaled per tree.
      this.physics.createBody({
        kind: 'fixed',
        position: vec3(p.x, p.y + (TRUNK.height / 2) * p.scale, p.z),
        shape: { type: 'cylinder', halfHeight: (TRUNK.height / 2) * p.scale, radius: TRUNK.radius * 0.8 * p.scale },
      });
    }
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object: this.instances.create(placements) },
      ...(this.wind ? { windSway: this.wind } : {}),
    });
    return placements;
  }
}
