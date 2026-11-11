/** Tide tuning: shared by the CPU water level, the water shader and the wet-sand band on the beach. */
export const TIDE = {
  /** Half the range (m): the sea rises and falls this far around its still level. */
  amplitude: 0.5,
  /** High tides per in-game day. */
  perDay: 2,
  /** How fast (m per in-game day) the wet band above the waterline dries as the tide falls. */
  dryPerDay: 1.6,
} as const;

/** Tide offset (m) from the still sea level at `timeOfDay` in [0, 1). High tide at 0.125 and 0.625. */
export function tideOffset(
  timeOfDay: number,
  amplitude: number = TIDE.amplitude,
  perDay: number = TIDE.perDay,
): number {
  return amplitude * Math.sin(2 * Math.PI * perDay * timeOfDay);
}

/**
 * The sea's tide, following the day clock. `offset` feeds the water shader (and `SeaAndPonds`),
 * `waterLine` and `wetLine` (world heights) the ground shader: sand between them is still wet.
 */
export class Tide {
  readonly waterLine: { value: number };
  readonly wetLine: { value: number };
  private last: number | undefined;

  constructor(
    readonly seaLevel: number,
    /** Shared with the water shader (`WaterMeshFactory.tide`). */
    readonly offset: { value: number } = { value: 0 },
    private readonly amplitude: number = TIDE.amplitude,
  ) {
    this.waterLine = { value: seaLevel };
    this.wetLine = { value: seaLevel };
  }

  /** Moves the tide to `timeOfDay`; the wet line follows a rising tide at once and dries slowly behind a falling one. */
  advance(timeOfDay: number): void {
    const elapsed = this.last === undefined ? 0 : (((timeOfDay - this.last) % 1) + 1) % 1;
    this.last = timeOfDay;
    this.offset.value = tideOffset(timeOfDay, this.amplitude);
    const line = this.seaLevel + this.offset.value;
    this.waterLine.value = line;
    // A jump of more than a quarter day (time skip) dries the beach at once.
    const dried = elapsed > 0.25 ? -Infinity : this.wetLine.value - TIDE.dryPerDay * elapsed;
    this.wetLine.value = Math.max(line, dried);
  }
}
