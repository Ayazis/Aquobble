import type { GameWorld, Random, System } from '@core';
import type {} from './Rock';
import type { RockSpawner } from './RockSpawner';

export interface RockRecycleOptions {
  /** Rocks to keep alive at once. */
  population: number;
  /** Rocks below this height are removed. */
  removeBelow: number;
  /** Half-width of the square area new rocks drop into. */
  dropExtent: number;
  dropHeight: number;
}

/** Fixed system: removes rocks that sank away and drops new ones to keep the population up. */
export class RockRecycleSystem implements System {
  private readonly rocks;

  constructor(
    private readonly world: GameWorld,
    private readonly spawner: RockSpawner,
    private readonly random: Random,
    private readonly options: RockRecycleOptions,
  ) {
    this.rocks = world.with('rock', 'transform');
  }

  update(): void {
    for (const rock of this.rocks) {
      if (rock.transform.position.y < this.options.removeBelow) this.world.remove(rock);
    }
    // One new rock per tick at most, so they arrive as a steady rain.
    if (this.rocks.size < this.options.population) this.dropOne();
  }

  private dropOne(): void {
    const { dropExtent, dropHeight } = this.options;
    const position = {
      x: this.random.range(-dropExtent, dropExtent),
      y: dropHeight + this.random.range(0, 20),
      z: this.random.range(-dropExtent, dropExtent),
    };
    this.spawner.spawn(position, this.random.range(0.6, 1.8));
  }
}
