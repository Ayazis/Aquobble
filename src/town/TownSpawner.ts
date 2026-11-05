import { identityQuat, vec3, type GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import type { PlacedTown } from './PlacedTown';
import type { RoadMeshFactory } from './render/RoadMeshFactory';
import type { WallFactory } from './render/WallFactory';

/** Adds the town's roads and wall (with static colliders) to the world, positioned at the town origin. */
export class TownSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly roads: RoadMeshFactory,
    private readonly walls: WallFactory,
  ) {}

  spawn(town: PlacedTown): void {
    const { origin, layout } = town;
    this.world.add({
      transform: { position: { ...origin }, rotation: identityQuat() },
      renderObject: { object: this.roads.create(layout) },
    });

    const wall = this.walls.create(layout.wall);
    this.world.add({
      transform: { position: { ...origin }, rotation: identityQuat() },
      renderObject: { object: wall.object },
    });
    for (const { center, half } of wall.boxes) {
      this.physics.createBody({
        kind: 'fixed',
        position: vec3(origin.x + center.x, origin.y + center.y, origin.z + center.z),
        shape: { type: 'cuboid', halfExtents: half },
        friction: 0.8,
      });
    }
  }
}
