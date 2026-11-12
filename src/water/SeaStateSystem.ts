import type { System } from '@core';
import type { Wind } from '@wind';

/** Swell height (as a multiple of the default waves) in still air and in a strong breeze. */
const CALM = 0.6;
const ROUGH = 1.45;
/** The sea answers the wind slowly: seconds to cover most of the way to a new state. */
const RESPONSE_SECONDS = 25;

/**
 * Frame system: the sea follows the wind. A rising wind builds the swell, the surf and the whitecaps and
 * ruffles the surface; when it drops, the sea lies down again, in its own time. Writes the water shader's
 * `swell` and `wind` strength, which the CPU wave field reads too, so floating things feel the same sea.
 */
export class SeaStateSystem implements System {
  private started = false;

  constructor(
    private readonly wind: Wind,
    /** Seconds of wind time (`WindSystem.elapsed`). */
    private readonly windTime: () => number,
    private readonly swell: { value: number },
    private readonly windUniform: { value: { z: number } },
  ) {}

  update(dt: number): void {
    const strength = Math.min(1, Math.max(0, this.wind.strength(this.windTime())));
    const target = CALM + (ROUGH - CALM) * strength;
    const blend = this.started ? 1 - Math.exp(-dt / RESPONSE_SECONDS) : 1;
    this.started = true;
    this.swell.value += (target - this.swell.value) * blend;
    this.windUniform.value.z += (strength - this.windUniform.value.z) * blend;
  }
}
