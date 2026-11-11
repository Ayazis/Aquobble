import type { Entity, GameWorld, System } from '@core';
import type {} from '@rocks';
import type {} from './Buoyant';
import { splashSize } from './footfall';
import type { RippleStamper } from './RippleStamper';
import type { WaterEventBus } from './WaterEventBus';

/**
 * Fixed system (2.10): anything entering the water fast (a jump, a falling rock) splashes: a strong ripple
 * with a foam ring here, and a `splash` event for the droplet crown and audio. Size from speed and mass.
 * Runs right after `WaterContactSystem`, whose `entered` pulse lasts one step.
 */
export class SplashTriggerSystem implements System {
  private readonly contacts;

  constructor(
    world: GameWorld,
    private readonly ripples: RippleStamper,
    private readonly events: WaterEventBus,
  ) {
    this.contacts = world.with('waterContact', 'transform');
  }

  update(): void {
    for (const entity of this.contacts) {
      const c = entity.waterContact;
      if (!c.entered) continue;
      const impact = Math.hypot(c.verticalSpeed, c.speed * 0.5);
      const size = splashSize(impact, massOf(entity));
      if (size <= 0) continue;
      const { x, z } = entity.transform.position;
      this.ripples.stamp(x, z, 0.5 + size * 0.6, 0.5 * size, 0);
      // The foam ring: a wide faint patch whose centre the strong ripple pushes clear.
      this.ripples.stamp(x, z, 1 + size * 1.2, 0, Math.min(1, 0.4 + size * 0.4));
      this.events.emit({ type: 'splash', x, y: c.surfaceY, z, size });
    }
  }
}

function massOf(entity: Entity): number {
  if (entity.rock) return Math.min(2, Math.max(0.3, entity.rock.radius * 2));
  if (entity.buoyant) return 0.5;
  return 1;
}
