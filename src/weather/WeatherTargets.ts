/** What the weather drives elsewhere; wired in `app`, so this slice depends on no other feature slice. */
export interface WeatherTargets {
  /** Grey sky 0..1: dim the sun, desaturate, thicken the cloud shadows. */
  setOvercast(amount: number): void;
  /** Morning mist 0..1 (height fog). */
  setMist(amount: number): void;
  /** Wet ground and roofs 0..1 (darkening, shine, puddle growth). */
  setWetness(amount: number): void;
}
