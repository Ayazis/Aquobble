import type { GameWorld, System } from '@core';
import type { WindUniforms } from '@wind';
import type {} from './WindmillSails';

/** Turns per second in still air (they idle, barely) and at full strength. */
const IDLE = 0.03;
const FULL = 0.35;

/** Frame system: spins every windmill's sails at a speed set by the wind's current strength. */
export class SailSystem implements System {
  private readonly mills;

  constructor(
    world: GameWorld,
    private readonly wind: WindUniforms,
  ) {
    this.mills = world.with('windmillSails');
  }

  update(dt: number): void {
    const strength = Math.min(1, Math.max(0, this.wind.uWindStrength.value));
    const speed = (IDLE + (FULL - IDLE) * strength) * Math.PI * 2;
    for (const { windmillSails: sails } of this.mills) {
      sails.angle = (sails.angle + speed * dt) % (Math.PI * 2);
      sails.object.rotation.y = sails.angle;
    }
  }
}
