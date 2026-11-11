/**
 * Strength of the drawn sun disc and its halo for a sun at height `sunY` (direction y): fades in just
 * above the horizon so it never hangs under the sea, and is full once the sun clears `fullAbove`.
 */
export function sunGlow(sunY: number, fullAbove = 0.04): number {
  const x = Math.min(1, Math.max(0, (sunY + 0.02) / (fullAbove + 0.02)));
  return x * x * (3 - 2 * x);
}
