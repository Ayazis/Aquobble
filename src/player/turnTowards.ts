/** Turns `current` yaw towards `target` by at most `maxStep` radians, the short way round. */
export function turnTowards(current: number, target: number, maxStep: number): number {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return Math.abs(diff) <= maxStep ? target : current + Math.sign(diff) * maxStep;
}
