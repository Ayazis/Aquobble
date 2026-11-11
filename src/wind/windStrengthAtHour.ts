/** Base wind strength for each whole hour 0..23: still night, calm dawn, gusty afternoon, easing evening. */
const HOURLY = [
  0.2, 0.18, 0.15, 0.12, 0.1, 0.08, 0.1, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.9, 0.85, 0.75, 0.6, 0.45,
  0.35, 0.3, 0.25, 0.22,
];

/** Base strength in [0, 1] at `hour` in [0, 24), linearly blended between whole hours, wrapping at midnight. */
export function windStrengthAtHour(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  const i = Math.floor(h);
  const f = h - i;
  return HOURLY[i] * (1 - f) + HOURLY[(i + 1) % 24] * f;
}
