import type { GameWorld, Random, System } from '@core';
import type {} from '@water';
import type { DropletPool } from './DropletPool';

const DRIP_SECONDS = 4;
const DRIPS_PER_SECOND = 8;

/**
 * Frame system (2.11): for a few seconds after a character leaves the water, drops fall from the wet part of
 * its body; those landing in the shallows leave tiny ripples.
 */
export class DripSystem implements System {
  private readonly wet;
  private carry = 0;

  constructor(
    world: GameWorld,
    private readonly droplets: DropletPool,
    private readonly random: Random,
  ) {
    this.wet = world.with('wetness', 'waterContact', 'transform');
  }

  update(dt: number): void {
    const r = this.random;
    for (const { wetness: w, waterContact: c, transform } of this.wet) {
      if (c.inWater || w.sinceLeft > DRIP_SECONDS || w.amount <= 0 || w.line < 0.05) continue;
      this.carry += DRIPS_PER_SECOND * (1 - w.sinceLeft / DRIP_SECONDS) * dt;
      const onWater = c.depth > 0;
      const floor = onWater ? Math.max(w.feetY, c.surfaceY) : w.feetY;
      while (this.carry >= 1) {
        this.carry -= 1;
        const angle = r.next() * Math.PI * 2;
        const p = transform.position;
        const at = { x: p.x + Math.cos(angle) * 0.18, y: w.feetY + r.next() * w.line, z: p.z + Math.sin(angle) * 0.18 };
        this.droplets.spawn(at, { x: 0, y: -0.5, z: 0 }, floor, 0.015 + r.next() * 0.01, onWater);
      }
    }
  }
}
