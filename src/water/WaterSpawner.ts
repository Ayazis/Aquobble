import { identityQuat, vec3, type GameWorld } from '@core';
import type {} from '@rendering';
import type { WaterMeshFactory } from './WaterMeshFactory';

/** Creates the sea entity at the given water level. */
export class WaterSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly meshes: WaterMeshFactory,
  ) {}

  spawn(level: number): void {
    this.world.add({
      transform: { position: vec3(0, level, 0), rotation: identityQuat() },
      renderObject: { object: this.meshes.create() },
    });
  }
}
