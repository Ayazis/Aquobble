import type { GameWorld, System } from '@core';
import type {} from '@physics';
import type {} from './WaterContact';
import type { Wetness } from './Wetness';

/** Seconds for a soaked character to dry completely. */
export const DRYING_SECONDS = 20;

/**
 * Fixed system (2.11): characters in the water get wet up to the deepest point they waded to; out of it
 * they dry over about 20 s. Adds the `Wetness` component on first contact.
 */
export class WetnessSystem implements System {
  private readonly characters;

  constructor(private readonly world: GameWorld) {
    this.characters = world.with('waterContact', 'transform', 'characterBody');
  }

  update(dt: number): void {
    for (const entity of this.characters) {
      const c = entity.waterContact;
      if (!entity.wetness) {
        if (!c.inWater) continue;
        this.world.addComponent(entity, 'wetness', { line: 0, amount: 0, sinceLeft: 0, feetY: 0 });
      }
      const wet = entity.wetness;
      if (!wet) continue;
      wet.feetY = entity.transform.position.y - c.bottom;
      dry(wet, c.inWater ? c.immersion : -1, dt);
    }
  }
}

/** One step of soaking (`immersion` m of water over the feet) or drying (`immersion` < 0). */
export function dry(wet: Wetness, immersion: number, dt: number): void {
  if (immersion > 0) {
    // A fresh soak resets the line; wading deeper raises it.
    wet.line = wet.amount < 0.95 ? Math.max(immersion, wet.line * wet.amount) : Math.max(wet.line, immersion);
    wet.amount = 1;
    wet.sinceLeft = 0;
    return;
  }
  wet.sinceLeft += dt;
  wet.amount = Math.max(0, wet.amount - dt / DRYING_SECONDS);
}
