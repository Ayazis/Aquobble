import type { Random } from '@core';
import type { GustFronts } from './GustFronts';
import { gustAt } from './gustAt';
import type { Wind } from './Wind';
import type { WindDirection } from './WindDirection';
import { windStrengthAtHour } from './windStrengthAtHour';

/**
 * Wind that slowly turns around a seeded heading (two slow sines, never more than ~50 degrees off)
 * and whose strength follows the hour of day with a gentle seeded swell.
 */
export class SeededWind implements Wind {
  readonly fronts: GustFronts;
  private readonly heading: number;
  private readonly phases: readonly number[];

  /** `hour` returns the current hour of day in [0, 24), e.g. `() => dayNight.timeOfDay * 24`. */
  constructor(
    random: Random,
    private readonly hour: () => number,
    /** Lane G: weather. Multiplies the strength (stronger wind under an overcast sky). */
    private readonly boost: () => number = () => 1,
  ) {
    this.heading = random.range(0, Math.PI * 2);
    this.phases = [random.range(0, 6.283), random.range(0, 6.283), random.range(0, 6.283)];
    this.fronts = { spacing: 38, speed: 6, phase: random.range(0, 6.283) };
  }

  direction(t: number): WindDirection {
    const [a, b] = this.phases;
    const angle = this.heading + 0.6 * Math.sin(t * 0.011 + a) + 0.25 * Math.sin(t * 0.037 + b);
    return { x: Math.cos(angle), z: Math.sin(angle) };
  }

  strength(t: number): number {
    const swell = 0.85 + 0.15 * Math.sin(t * 0.05 + this.phases[2]);
    return Math.min(1, windStrengthAtHour(this.hour()) * swell * this.boost()); // lane G
  }

  gust(x: number, z: number, t: number): number {
    return gustAt(x, z, t, this.direction(t), this.strength(t), this.fronts);
  }
}
