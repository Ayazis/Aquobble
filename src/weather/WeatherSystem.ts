import type { System } from '@core';
import type { Weather } from './Weather';
import type { WeatherSchedule } from './WeatherSchedule';
import type { WeatherTargets } from './WeatherTargets';

/** Seconds of steady rain to soak the ground fully, and for soaked ground to dry again. */
export const SOAK_SECONDS = 90;
export const DRY_SECONDS = 240;

/**
 * Frame system: follows the day clock (`hour` in [0, 24)), counts the days, samples the schedule, lets the ground
 * soak and dry, and hands the result to its targets. Run after the day cycle so its overrides win.
 */
export class WeatherSystem implements System {
  private lastHour: number | undefined;

  constructor(
    private readonly weather: Weather,
    private readonly schedule: WeatherSchedule,
    private readonly hour: () => number,
    private readonly targets: WeatherTargets,
  ) {}

  update(dt: number): void {
    const hour = this.hour();
    if (this.lastHour !== undefined && hour < this.lastHour - 12) this.weather.day++;
    this.lastHour = hour;
    const mix = this.weather.override ?? this.schedule.mixAt(this.weather.day, hour);
    this.weather.mix = mix;
    this.weather.wetness = soak(this.weather.wetness, mix.rain, dt);
    this.targets.setOvercast(mix.overcast);
    this.targets.setMist(mix.mist);
    this.targets.setWetness(this.weather.wetness);
  }
}

/** Wetness moves up towards the rain amount while it rains and dries down towards it otherwise. */
export function soak(wetness: number, rain: number, dt: number): number {
  if (wetness < rain) return Math.min(rain, wetness + dt / SOAK_SECONDS);
  return Math.max(rain, wetness - dt / DRY_SECONDS);
}
