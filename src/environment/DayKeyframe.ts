/** Lighting and atmosphere at one moment of the day. Colours are 0xRRGGBB. */
export interface DayLighting {
  sunColor: number;
  sunIntensity: number;
  hemisphereSky: number;
  hemisphereGround: number;
  hemisphereIntensity: number;
  /** How much the sky lights the scene (image-based lighting). */
  environmentIntensity: number;
  fogColor: number;
  fogDensity: number;
  /** Sky shader haze and scattering. */
  turbidity: number;
  rayleigh: number;
  exposure: number;
}

/** A `DayLighting` pinned to a time of day in [0, 1): 0 = midnight, 0.5 = noon. */
export interface DayKeyframe extends DayLighting {
  time: number;
}
