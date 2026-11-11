import { COLOUR_SCRIPT, type HourColours } from '@rendering';
import type { DayKeyframe, DayLighting } from './DayKeyframe';

type Hour = Omit<DayKeyframe, 'time'>;

/** Copies an hour's colours from the colour script into the lighting fields. */
function colours(
  hour: HourColours,
): Pick<DayLighting, 'sunColor' | 'hemisphereSky' | 'hemisphereGround' | 'fogColor' | 'skyZenith' | 'skyHorizon'> {
  return {
    sunColor: hour.sun,
    hemisphereSky: hour.shade,
    hemisphereGround: hour.bounce,
    fogColor: hour.fog,
    skyZenith: hour.skyZenith,
    skyHorizon: hour.skyHorizon,
  };
}

const NIGHT: Hour = {
  ...colours(COLOUR_SCRIPT.night),
  // The "sun" at night is the moon: bright enough to read the town and cast clear shadows.
  sunIntensity: 1.15,
  // lane D 0.8: more sky fill so buildings away from lamps read dark blue, not black.
  hemisphereIntensity: 1.05,
  environmentIntensity: 0.2,
  fogDensity: 0.0035,
  exposure: 0.9,
  // Calmer at night: lamplight on grass must not go neon, and moon shade lifts to dark blue rather than black.
  gradeSaturation: 0.88,
  gradeContrast: 0.97,
  gradeLift: 0.07,
};

const DAY: Hour = {
  ...colours(COLOUR_SCRIPT.noon),
  sunIntensity: 1.8,
  // Strong blue sky light with a green bounce: shade stays bright and coloured, as in a cel-shaded scene.
  hemisphereIntensity: 1.25,
  environmentIntensity: 0.35,
  fogDensity: 0.0022,
  exposure: 0.62,
  gradeSaturation: 1.22,
  gradeContrast: 1.06,
  gradeLift: 0,
};

const LOW_SUN = { sunIntensity: 1.1, hemisphereIntensity: 0.45, environmentIntensity: 0.4, fogDensity: 0.0048 };

/** Night → dawn → morning → noon → evening → dusk → night, sorted by time. Colours: `COLOUR_SCRIPT`. */
export const DEFAULT_DAY_KEYFRAMES: readonly DayKeyframe[] = [
  { time: 0, ...NIGHT },
  { time: 0.2, ...NIGHT, ...colours(COLOUR_SCRIPT.predawn) },
  { time: 0.26, ...DAY, ...LOW_SUN, ...colours(COLOUR_SCRIPT.dawn) },
  { time: 0.34, ...DAY, ...colours(COLOUR_SCRIPT.morning), sunIntensity: 2.3, fogDensity: 0.0026 },
  { time: 0.5, ...DAY },
  { time: 0.66, ...DAY, ...colours(COLOUR_SCRIPT.afternoon), sunIntensity: 2.3, fogDensity: 0.0026 },
  { time: 0.74, ...DAY, ...LOW_SUN, ...colours(COLOUR_SCRIPT.dusk) },
  { time: 0.8, ...NIGHT, ...colours(COLOUR_SCRIPT.nightfall) },
];
