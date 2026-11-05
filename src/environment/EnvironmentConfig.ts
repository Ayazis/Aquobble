export interface EnvironmentConfig {
  /** Sun height above the horizon at noon, in degrees. */
  noonSunElevation: number;
  /** Sun compass direction at noon, in degrees. It rises 90° before this and sets 90° after. */
  sunAzimuth: number;
  /** Real seconds for one full day/night cycle. 0 freezes time at `startTimeOfDay`. */
  dayLengthSeconds: number;
  /** Time of day at start: 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset. */
  startTimeOfDay: number;
  /** Seconds between re-baking the sky into the image-based-lighting map. */
  environmentRefreshSeconds: number;
}

export const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  noonSunElevation: 62,
  sunAzimuth: 200,
  dayLengthSeconds: 360,
  startTimeOfDay: 0.32,
  environmentRefreshSeconds: 1.5,
};
