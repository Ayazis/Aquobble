import type { Random, System } from '@core';
import type { WaterEventBus } from '@water';
import type { DropletPool } from './DropletPool';

/**
 * Frame system (2.10): a crown of droplets thrown up and out for every `splash` event, sized by the
 * splash; each falls back as a tiny ripple. The strong ripple and foam ring are stamped by the water slice.
 */
export class SplashSystem implements System {
  private readonly unsubscribe: () => void;

  constructor(
    events: WaterEventBus,
    private readonly droplets: DropletPool,
    private readonly random: Random,
  ) {
    this.unsubscribe = events.on('splash', (e) => this.crown(e.x, e.y, e.z, e.size));
  }

  update(dt: number): void {
    this.droplets.update(dt);
  }

  dispose(): void {
    this.unsubscribe();
  }

  private crown(x: number, y: number, z: number, size: number): void {
    const count = Math.round(10 + 24 * size);
    const r = this.random;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + r.next() * 0.4;
      const out = (1 + r.next() * 1.5) * (0.6 + size);
      const up = (2 + r.next() * 2.5) * (0.6 + size * 0.7);
      const v = { x: Math.cos(angle) * out, y: up, z: Math.sin(angle) * out };
      const p = { x: x + Math.cos(angle) * 0.2, y, z: z + Math.sin(angle) * 0.2 };
      this.droplets.spawn(p, v, y, 0.03 + r.next() * 0.03 * (1 + size), true);
    }
  }
}
