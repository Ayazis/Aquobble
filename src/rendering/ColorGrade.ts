/** The final colour grade, retuned through the day (see `DayLighting`). */
export interface ColorGrade {
  /** Saturation and contrast (1 = unchanged); `lift` raises blacks towards a dark blue (0 = none). */
  setGrade(saturation: number, contrast: number, lift: number): void;
}
