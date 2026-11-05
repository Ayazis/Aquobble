import type { GameWorld, System, Vec3 } from '@core';
import type {} from '@physics';
import { packBenders } from './packBenders';
import type { WindSway } from './WindSway';

/** Feeds every walking character's position to the grass shader so blades bend away (frame system). */
export class GrassBendSystem implements System {
  private readonly swaying;
  private readonly characters;

  constructor(
    world: GameWorld,
    private readonly radius = 0.9,
  ) {
    this.swaying = world.with('windSway');
    this.characters = world.with('characterBody', 'transform');
  }

  update(): void {
    const positions: Vec3[] = [];
    for (const { transform } of this.characters) positions.push(transform.position);
    const done = new Set<WindSway>();
    for (const { windSway } of this.swaying) {
      if (done.has(windSway)) continue;
      done.add(windSway);
      packBenders(positions, this.radius, windSway.benders.value);
    }
  }
}
