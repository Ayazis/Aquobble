import type { System } from '@core';
import type { Tide } from './Tide';

/** Frame system: moves the tide with the day clock (`timeOfDay` in [0, 1)). */
export class TideSystem implements System {
  constructor(
    private readonly tide: Tide,
    private readonly timeOfDay: () => number,
  ) {}

  update(): void {
    this.tide.advance(this.timeOfDay());
  }
}
