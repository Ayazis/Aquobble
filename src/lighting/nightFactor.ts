/**
 * How far the lamps are switched on at `timeOfDay` (0 = midnight, 0.5 = noon): 0 by day, 1 at night, with a
 * smooth ramp around sunset and sunrise. Sun height is the sine of the day (1 at noon, 0 on the horizon,
 * -1 at midnight): the lamps start to glow when it drops below `onBelow` and are fully lit at `fullBelow`.
 */
export function nightFactor(timeOfDay: number, onBelow: number, fullBelow: number): number {
  const sunHeight = Math.sin(2 * Math.PI * (timeOfDay - 0.25));
  const span = onBelow - fullBelow;
  if (span <= 0) return sunHeight < onBelow ? 1 : 0;
  const x = Math.min(1, Math.max(0, (onBelow - sunHeight) / span));
  return x * x * (3 - 2 * x);
}
