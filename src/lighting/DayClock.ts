/** Anything that knows the time of day in [0, 1): 0 = midnight, 0.25 sunrise, 0.5 noon, 0.75 sunset. */
export interface DayClock {
  readonly timeOfDay: number;
}
