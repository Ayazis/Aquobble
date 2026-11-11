/** How much of each weather is in the air right now, every value in [0, 1]. */
export interface WeatherMix {
  /** Grey sky: dimmer sun, washed-out colours, more cloud shadow, stronger wind. */
  overcast: number;
  /** Light rain (comes with overcast). */
  rain: number;
  /** Low morning mist. */
  mist: number;
}

export const CLEAR_WEATHER: WeatherMix = { overcast: 0, rain: 0, mist: 0 };
