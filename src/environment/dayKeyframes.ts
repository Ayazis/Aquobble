import type { DayKeyframe } from './DayKeyframe';

type Hour = Omit<DayKeyframe, 'time'>;

const NIGHT: Hour = {
  // The "sun" at night is the moon: bright enough to read the town and cast clear shadows.
  sunIntensity: 1,
  hemisphereIntensity: 1.1,
  environmentIntensity: 1,
  fogDensity: 0.0035,
  exposure: 1,
  // Calmer at night: lamplight on grass must not go neon, and moon shade lifts to dark blue rather than black.
  gradeSaturation: 0.9,
  gradeContrast: 0.96,
  gradeLift: 0.06,
};

const DAY: Hour = {
  sunIntensity: 1,
  hemisphereIntensity: 1,
  environmentIntensity: 1,
  fogDensity: 0.0021,
  exposure: 1,
  gradeSaturation: 1.08,
  gradeContrast: 1.06,
  gradeLift: 0,
};

/** Low sun: thicker golden haze. */
const LOW_SUN = { fogDensity: 0.0042 };

/** Night → dawn → day → dusk → night, sorted by time. The colours follow the sun (`skyLighting`). */
export const DEFAULT_DAY_KEYFRAMES: readonly DayKeyframe[] = [
  { time: 0, ...NIGHT },
  { time: 0.2, ...NIGHT },
  { time: 0.26, ...DAY, ...LOW_SUN },
  { time: 0.34, ...DAY, fogDensity: 0.0026 },
  { time: 0.5, ...DAY },
  { time: 0.66, ...DAY, fogDensity: 0.0026 },
  { time: 0.74, ...DAY, ...LOW_SUN },
  { time: 0.8, ...NIGHT },
];
