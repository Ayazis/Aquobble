import type { GameWorld, System } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from './Buoyant';
import type {} from './WaterContact';

/** Radius (m) around a mover within which floating things feel its wake. */
const REACH = 2.5;
/** Push per (m/s of mover speed) per unit of displaced water, per second. */
const WAKE = 1.6;
/** One-off push per (m/s of fall) when something splashes in. */
const SPLASH = 0.12;
/** Movers slower than this (m/s) leave no wake. */
const MIN_SPEED = 0.3;

/**
 * Fixed system (2.12): floating things drift away from whoever wades, swims or splashes near them, and rock as
 * the push lands on their near side. Reads `WaterContact` (written by `WaterContactSystem`), pushes through
 * `PhysicsEngine.applyImpulseAt`; the bobbing back level comes from `BuoyancySystem`.
 */
export class WaterPushSystem implements System {
  private readonly movers;
  private readonly floaters;

  constructor(
    world: GameWorld,
    private readonly physics: PhysicsEngine,
  ) {
    this.movers = world.with('waterContact', 'transform');
    this.floaters = world.with('buoyant', 'waterContact', 'physicsBody', 'transform');
  }

  update(dt: number): void {
    for (const mover of this.movers) {
      const c = mover.waterContact;
      if (!c.inWater) continue;
      const wake = c.speed >= MIN_SPEED ? c.speed * WAKE * dt : 0;
      const splash = c.entered ? Math.max(0, -c.verticalSpeed) * SPLASH : 0;
      if (wake + splash <= 0) continue;
      const from = mover.transform.position;
      for (const floater of this.floaters) {
        if (floater === mover || !floater.waterContact.inWater) continue;
        const at = floater.transform.position;
        const dx = at.x - from.x;
        const dz = at.z - from.z;
        const distance = Math.hypot(dx, dz);
        if (distance >= REACH || distance < 1e-3) continue;
        const strength = (wake + splash) * (1 - distance / REACH) * floater.buoyant.volume;
        const ux = dx / distance;
        const uz = dz / distance;
        const impulse = { x: ux * strength, y: strength * 0.3, z: uz * strength };
        // Pushed on the side facing the mover, a little off centre, so it rocks as it drifts.
        const point = { x: at.x - ux * 0.1, y: at.y, z: at.z - uz * 0.1 };
        this.physics.applyImpulseAt(floater.physicsBody.handle, impulse, point);
      }
    }
  }
}
