import { CLEAR_WEATHER, type WeatherMix } from './WeatherMix';

/** Live weather, written by `WeatherSystem` and read by everything the weather touches. */
export class Weather {
  /** The current blended mix. */
  mix: WeatherMix = { ...CLEAR_WEATHER };
  /** How wet the ground and roofs are (0..1): rises in rain, dries slowly after. Puddles grow with it. */
  wetness = 0;
  /** Days passed since the start, counted from the day clock wrapping. */
  day = 0;
  /** When set, replaces the schedule's mix (the pause menu's weather choice). */
  override: WeatherMix | null = null;
}
