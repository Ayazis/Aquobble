/** Weather choice in the menu: follow the seeded schedule, or hold one state. */
export type WeatherChoice = 'auto' | 'clear' | 'overcast' | 'rain' | 'mist';
/** Graphics levels that are read once at start ("applies on reload"). */
export type QualityChoice = 'auto' | 'off' | 'low' | 'high';

/** Player preferences kept in localStorage. */
export interface MenuSettings {
  fps: boolean;
  /** Day clock held at this time of day (0..1), or null when time runs. */
  frozenTime: number | null;
  weather: WeatherChoice;
  /** Ink outlines round everything: the old cel look, off by default now the island is lit physically. */
  inkOutlines: boolean;
  shadows: QualityChoice;
  /** Grass density ('auto' follows the device). */
  grass: QualityChoice;
}

export const DEFAULT_SETTINGS: MenuSettings = {
  fps: false,
  frozenTime: null,
  weather: 'auto',
  inkOutlines: false,
  shadows: 'auto',
  grass: 'auto',
};
