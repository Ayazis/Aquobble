/** Tuning for chimney smoke. Distances in metres, times in seconds. */
export interface SmokeConfig {
  /** Puffs alive per chimney at once; total instances = chimneys x this. */
  puffsPerChimney: number;
  /** Seconds from leaving the chimney to vanishing. */
  lifetime: number;
  /** How high a puff climbs over its life. */
  rise: number;
  /** How far the wind carries a puff over its life, along `windDirection`. */
  drift: number;
  /** Wind heading in radians (0 = +x). */
  windDirection: number;
  /** Puff radius as it leaves the chimney. */
  startSize: number;
  /** Puff radius at the end of its life. */
  endSize: number;
  /** Peak opacity, reached shortly after leaving the chimney. */
  opacity: number;
  color: number;
}

export const DEFAULT_SMOKE: SmokeConfig = {
  puffsPerChimney: 7,
  lifetime: 6,
  rise: 4.5,
  drift: 2.5,
  windDirection: 0.6,
  startSize: 0.18,
  endSize: 0.65,
  opacity: 0.55,
  color: 0xd8d4cc,
};
