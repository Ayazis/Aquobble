const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Lane D2: how strong the god rays are for a sun at height `sunY` (direction y, 1 = overhead). Strongest just
 * above the horizon, a faint trace at noon (shafts through the canopy), none once the sun has set.
 */
export function lightShaftStrength(sunY: number): number {
  const up = smoothstep(-0.03, 0.06, sunY);
  const low = 1 - smoothstep(0.15, 0.55, sunY);
  return up * (0.25 + 0.75 * low);
}
