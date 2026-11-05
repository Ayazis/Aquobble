import type { GameWorld, Random } from '@core';
import type {} from '@rendering';
import type { BirdMeshFactory } from './BirdMeshFactory';
import { createFlock } from './createFlock';
import type { WildlifeConfig } from './WildlifeConfig';

/** Adds the bird flocks to the world, each with its own InstancedMesh. */
export class FlockSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly random: Random,
    private readonly meshes: BirdMeshFactory,
  ) {}

  spawn(config: WildlifeConfig): void {
    for (let i = 0; i < config.flocks; i++) {
      const r = this.random;
      const flock = createFlock(r, {
        count: Math.floor(r.range(config.minBirds, config.maxBirds + 1)),
        center: {
          x: config.center.x + r.range(-config.spread, config.spread),
          y: r.range(config.minHeight + 5, config.maxHeight - 5),
          z: config.center.z + r.range(-config.spread, config.spread),
        },
        radius: r.range(config.minRadius, config.maxRadius),
        minHeight: config.minHeight,
        maxHeight: config.maxHeight,
      });
      this.world.add({ flock, renderObject: { object: this.meshes.create(flock.birds) } });
    }
  }
}
