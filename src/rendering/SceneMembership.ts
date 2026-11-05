import type { GameWorld } from '@core';
import type { Scene } from 'three';
import type {} from './RenderObject';

/** Keeps the three.js scene in step with the ECS world: entities with a RenderObject appear and disappear. */
export class SceneMembership {
  private readonly unsubscribers: (() => void)[];

  constructor(world: GameWorld, scene: Scene) {
    const visible = world.with('renderObject');
    for (const entity of visible) scene.add(entity.renderObject.object);
    this.unsubscribers = [
      visible.onEntityAdded.subscribe((entity) => scene.add(entity.renderObject.object)),
      visible.onEntityRemoved.subscribe((entity) => scene.remove(entity.renderObject.object)),
    ];
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
}
