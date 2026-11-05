import { identityQuat, vec3, type GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type { HeightField } from './HeightField';
import type { TerrainMeshFactory } from './TerrainMeshFactory';

/** Creates the terrain entity: a fixed height-field collider plus its mesh. */
export class TerrainSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly meshes: TerrainMeshFactory,
  ) {}

  spawn(field: HeightField): void {
    const handle = this.physics.createBody({
      kind: 'fixed',
      position: vec3(),
      shape: {
        type: 'heightField',
        rows: field.samples,
        columns: field.samples,
        heights: field.heights,
        size: { x: field.size, z: field.size },
      },
      friction: 0.9,
    });
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      physicsBody: { handle },
      renderObject: { object: this.meshes.create(field) },
    });
  }
}
