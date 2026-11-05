export interface EnvironmentConfig {
  /** Sun angle from straight up, in degrees. 90 = on the horizon. */
  sunElevationFromZenith: number;
  /** Sun compass direction in degrees. */
  sunAzimuth: number;
  sunColor: number;
  sunIntensity: number;
  fogColor: number;
  fogDensity: number;
  /** How much the sky lights the scene (image-based lighting). */
  environmentIntensity: number;
}

export const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  sunElevationFromZenith: 62,
  sunAzimuth: 200,
  sunColor: 0xffe2b8,
  sunIntensity: 2.4,
  fogColor: 0xc9d6e3,
  fogDensity: 0.0025,
  environmentIntensity: 0.5,
};
