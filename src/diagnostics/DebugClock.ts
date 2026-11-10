/** The time-of-day controls the debug tools need (implemented by the day/night system). */
export interface DebugClock {
  /** Current time of day in [0, 1): 0 = midnight, 0.5 = noon. */
  readonly timeOfDay: number;
  /** True stops time from advancing. */
  paused: boolean;
  setTimeOfDay(time: number): void;
}
