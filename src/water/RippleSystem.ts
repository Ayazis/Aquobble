import type { GameWorld, System } from '@core';
import type {} from '@player';
import type { RippleSimulation } from './RippleSimulation';

const STEP = 1 / 60;
const MAX_STEPS = 3;

/**
 * Frame system: keeps the ripple box on the player and steps the simulation at a steady 60 Hz, so rings
 * spread at the same speed on every display.
 */
export class RippleSystem implements System {
  private readonly players;
  private pending = 0;

  constructor(
    world: GameWorld,
    private readonly simulation: RippleSimulation,
  ) {
    this.players = world.with('player', 'transform');
  }

  update(dt: number): void {
    const player = this.players.first;
    if (!player) return;
    const { x, z } = player.transform.position;
    this.pending = Math.min(this.pending + dt, STEP * MAX_STEPS);
    while (this.pending >= STEP) {
      this.pending -= STEP;
      this.simulation.step(x, z);
    }
  }
}
