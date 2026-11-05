import type { System } from '@core';
import type { FpsCounter } from './FpsCounter';
import type { FpsOverlay } from './FpsOverlay';

/** Frame system: measures frame rate and refreshes the overlay when new stats are ready. */
export class FpsSystem implements System {
  constructor(
    private readonly counter: FpsCounter,
    private readonly overlay: FpsOverlay,
  ) {}

  update(dt: number): void {
    if (this.counter.sample(dt)) this.overlay.show(this.counter.fps, this.counter.worstFrameMs);
  }
}
