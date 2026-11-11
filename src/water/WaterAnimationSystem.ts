import type { GameWorld, System } from '@core';
import type {} from './WaterSurface';

/** Advances the ripple animation of every water surface and passes on how dark it is (frame system). */
export class WaterAnimationSystem implements System {
  private readonly surfaces;

  constructor(
    world: GameWorld,
    private readonly speed = 0.6,
    /** How dark the night is in [0, 1]; without it the water keeps its day look. */
    private readonly night: () => number = () => 0,
  ) {
    this.surfaces = world.with('waterSurface');
  }

  update(dt: number): void {
    const night = this.night();
    // Surfaces may share one clock: advance each clock once.
    const clocks = new Set<{ value: number }>();
    for (const { waterSurface } of this.surfaces) {
      clocks.add(waterSurface.time);
      waterSurface.night.value = night;
    }
    for (const clock of clocks) clock.value += dt * this.speed;
  }
}
