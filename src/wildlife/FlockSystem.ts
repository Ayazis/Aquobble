import type { GameWorld, System } from '@core';
import type {} from './Flock';
import { flockStep } from './flockStep';

/** Fixed-step simulation: moves every flock's birds. */
export class FlockSystem implements System {
  private readonly flocks;

  constructor(world: GameWorld) {
    this.flocks = world.with('flock');
  }

  update(dt: number): void {
    for (const entity of this.flocks) flockStep(entity.flock, dt);
  }
}
