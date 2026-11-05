import { identityQuat, vec3, type GameWorld } from '@core';
import type {} from '@rendering';
import type { TreeInstancesFactory } from './TreeInstancesFactory';
import type { TreePlacer, TreePlacerOptions } from './TreePlacer';

/** Places a forest and adds it to the world as a single render entity. */
export class ForestSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly placer: TreePlacer,
    private readonly instances: TreeInstancesFactory,
  ) {}

  spawn(options: TreePlacerOptions): void {
    const placements = this.placer.place(options);
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object: this.instances.create(placements) },
    });
  }
}
