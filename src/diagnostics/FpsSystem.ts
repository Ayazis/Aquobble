import type { System } from '@core';
import type { FpsCounter } from './FpsCounter';
import type { FpsOverlay } from './FpsOverlay';
import type { RenderStatsSource } from './RenderStatsSource';

/** Frame system: measures frame rate and refreshes the overlay when new stats are ready. */
export class FpsSystem implements System {
  constructor(
    private readonly counter: FpsCounter,
    private readonly overlay: FpsOverlay,
    private readonly render?: RenderStatsSource,
  ) {}

  update(dt: number): void {
    if (this.counter.sample(dt)) this.overlay.show(this.counter.fps, this.counter.worstFrameMs, this.render?.stats());
  }
}
