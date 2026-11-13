/**
 * The art-directed side of the lighting at one moment of the day. Colours are not in here: by day they come
 * out of the atmosphere model (`skyLighting`), at night from the colour script.
 */
export interface DayLighting {
  /** Scales the key light (sun or moon). */
  sunIntensity: number;
  /** Scales the hemisphere fill: the ground's bounce light by day, plus the blue lift at night. */
  hemisphereIntensity: number;
  /** How much the sky lights the scene (image-based lighting). */
  environmentIntensity: number;
  fogDensity: number;
  /** Camera exposure before the eye-like adaptation to how bright the sky is. */
  exposure: number;
  /** Colour grade after tone mapping: saturation and contrast (1 = unchanged). */
  gradeSaturation: number;
  gradeContrast: number;
  /** How far blacks lift towards a dark blue (0 = none), so unlit shade reads as night, not as a hole. */
  gradeLift: number;
}

/** A `DayLighting` pinned to a time of day in [0, 1): 0 = midnight, 0.5 = noon. */
export interface DayKeyframe extends DayLighting {
  time: number;
}
