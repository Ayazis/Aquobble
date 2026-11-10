import type { GameWorld, System } from '@core';
import type {} from './WaterSurface';

/** Advances the ripple animation of every water surface (frame system). */
export class WaterAnimationSystem implements System {
  private readonly surfaces;

  constructor(
    world: GameWorld,
    private readonly speed = 0.6,
  ) {
    this.surfaces = world.with('waterSurface');
  }

  update(dt: number): void {
    for (const { waterSurface } of this.surfaces) waterSurface.time.value += dt * this.speed;
  }
}
