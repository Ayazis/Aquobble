/**
 * Whether a walk cycle passed a footfall between two phases in [0, 1): the walk and run clips put one foot
 * down at the start of the loop and the other half way through. Returns the foot (-1 left, 1 right) or 0.
 */
export function footfall(previous: number, phase: number): -1 | 0 | 1 {
  if (phase < previous) return -1; // wrapped past 0
  if (previous < 0.5 && phase >= 0.5) return 1;
  return 0;
}

/** Splash size from impact speed (m/s) and a mass factor (1 for a person): 0 below a gentle step-in. */
export function splashSize(impactSpeed: number, mass: number): number {
  if (impactSpeed < 2.5) return 0;
  return Math.min(2, ((impactSpeed - 1.5) / 6) * mass);
}
