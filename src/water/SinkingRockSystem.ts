import type { Entity, GameWorld, System } from '@core';
import type {} from '@physics';
import type {} from '@rocks';
import type {} from './Buoyant';

/** Water drag on rocks: with their density of 2.5 they settle at a little over 1 m/s. */
const ROCK_DRAG = 9;

/**
 * Fixed system: makes every loose rock buoyant (dense, heavily dragged), so a rock dropped in the water slows
 * and sinks slowly to the bottom instead of falling straight through. Run before `BuoyancySystem`.
 */
export class SinkingRockSystem implements System {
  private readonly dry;
  private readonly batch: Entity[] = [];

  constructor(private readonly world: GameWorld) {
    this.dry = world.with('rock', 'physicsBody').without('buoyant');
  }

  update(): void {
    this.batch.length = 0;
    for (const rock of this.dry) this.batch.push(rock);
    for (const rock of this.batch) {
      const r = rock.rock?.radius ?? 0.5;
      const h = r * 0.5;
      this.world.addComponent(rock, 'buoyant', {
        // Rock hulls fill roughly half their bounding sphere.
        volume: (2 / 3) * Math.PI * r ** 3,
        halfHeight: r,
        drag: ROCK_DRAG,
        points: [
          { x: h, y: 0, z: h },
          { x: -h, y: 0, z: h },
          { x: h, y: 0, z: -h },
          { x: -h, y: 0, z: -h },
        ],
      });
    }
  }
}
