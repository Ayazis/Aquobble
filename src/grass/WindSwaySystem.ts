import type { GameWorld, System } from '@core';
import type {} from './WindSway';

/** Advances the wind time uniform of every swaying plant mesh (presentation, frame system). */
export class WindSwaySystem implements System {
  private readonly swaying;

  constructor(world: GameWorld) {
    this.swaying = world.with('windSway');
  }

  update(dt: number): void {
    for (const { windSway } of this.swaying) windSway.time.value += dt;
  }
}
