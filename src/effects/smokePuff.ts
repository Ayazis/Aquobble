import type { SmokeConfig } from './SmokeConfig';

/** Where a puff is and how it looks, relative to its chimney top. */
export interface PuffPose {
  rise: number;
  drift: number;
  size: number;
  fade: number;
}

/**
 * Pure: the pose of puff `index` of `count` at `time`, for a chimney with `phase`. Puffs are evenly spaced
 * through the lifetime, so each chimney shows a steady column. Rise eases out (smoke slows as it cools),
 * drift eases in (the wind takes it once clear of the roof), opacity comes up fast and then fades out.
 */
export function smokePuff(time: number, index: number, count: number, phase: number, c: SmokeConfig): PuffPose {
  const raw = time / c.lifetime + phase + index / count;
  const age = raw - Math.floor(raw);
  const rise = c.rise * (1 - (1 - age) * (1 - age));
  const drift = c.drift * age * age;
  const size = c.startSize + (c.endSize - c.startSize) * Math.sqrt(age);
  const fade = c.opacity * Math.min(1, age / 0.1) * (1 - age);
  return { rise, drift, size, fade };
}
