import type { GameWorld, Random, System, Vec3 } from '@core';
import type {} from '@rendering';
import { DEFAULT_SMOKE, type SmokeConfig } from './SmokeConfig';
import { SmokeMeshFactory } from './SmokeMeshFactory';
import { SmokeSystem } from './SmokeSystem';

/** Adds one smoke mesh for all `chimneys` (world-space tops) and returns the frame system that animates it. */
export class SmokeSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly random: Random,
    private readonly config: SmokeConfig = DEFAULT_SMOKE,
  ) {}

  spawn(chimneys: readonly Vec3[]): System {
    const sources = chimneys.map((position) => ({ position, phase: this.random.next() }));
    const count = sources.length * this.config.puffsPerChimney;
    const mesh = new SmokeMeshFactory().create(Math.max(1, count), this.config);
    mesh.count = count;
    this.world.add({ renderObject: { object: mesh } });
    return new SmokeSystem(mesh, sources, this.config);
  }
}
