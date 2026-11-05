import type { GameWorld, System, Vec3 } from '@core';
import type { WaterSurface } from './WaterSurface';

/** Anything that knows where the key light currently is (e.g. a day/night cycle). */
export interface SunSource {
  readonly lightDirection: Vec3;
}

/** Scrolls the normal maps of every water surface and keeps its highlight on the sun (frame system). */
export class WaterAnimationSystem implements System {
  private readonly surfaces;

  constructor(
    world: GameWorld,
    private readonly sun?: SunSource,
    private readonly speed = 0.6,
  ) {
    this.surfaces = world.with('waterSurface');
  }

  update(dt: number): void {
    for (const { waterSurface } of this.surfaces) {
      advance(waterSurface, dt * this.speed);
      if (this.sun) copyDirection(waterSurface, this.sun.lightDirection);
    }
  }
}

function advance(surface: WaterSurface, dt: number): void {
  surface.time.value += dt;
}

function copyDirection(surface: WaterSurface, dir: Vec3): void {
  const target = surface.sunDirection.value;
  target.x = dir.x;
  target.y = dir.y;
  target.z = dir.z;
}
