import type { GameWorld, System } from '@core';
import type {} from './RenderObject';

/** Frame system: copies each entity's simulated Transform onto its three.js object. */
export class TransformSyncSystem implements System {
  private readonly entities;

  constructor(world: GameWorld) {
    this.entities = world.with('transform', 'renderObject');
  }

  update(): void {
    for (const { transform, renderObject } of this.entities) {
      renderObject.object.position.copy(transform.position);
      renderObject.object.quaternion.copy(transform.rotation);
    }
  }
}
