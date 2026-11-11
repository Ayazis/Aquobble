import type { GameWorld } from '@core';
import type { WindUniforms } from '@wind';
import type { BendUniforms } from './BendUniforms';
import type {} from './WindSway';

/**
 * Points every swaying plant entity at the shared wind and bend map uniforms. Call once after the world is
 * populated and before the first frame (materials pick the uniforms up when they compile).
 */
export function linkGrassWind(world: GameWorld, wind: WindUniforms, bend: BendUniforms): void {
  for (const { windSway } of world.with('windSway')) {
    windSway.wind = wind;
    windSway.bend = bend;
  }
}
