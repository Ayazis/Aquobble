import type { HeightSampler, Pond } from '@terrain';
import type { WaveField } from './WaveField';
import type { WaterLevel } from './WaterLevel';

/**
 * The world's water: the sea at `seaLevel` moving with `waves`, and calm ponds (level discs) above it.
 * The sea rises and falls with the `tide`.
 * `clock` is the water shader's time, so CPU heights match what is drawn.
 */
export class SeaAndPonds implements WaterLevel {
  constructor(
    private readonly ground: HeightSampler,
    private readonly seaLevel: number,
    private readonly waves: WaveField,
    private readonly clock: { readonly value: number },
    private readonly ponds: readonly Pond[] = [],
    /** Tide offset (m) of the sea; ponds keep their level. */
    private readonly tide: { readonly value: number } = { value: 0 },
  ) {}

  surfaceAt(x: number, z: number): number {
    for (const p of this.ponds) {
      if ((x - p.x) ** 2 + (z - p.z) ** 2 < p.radius * p.radius) return p.level;
    }
    return this.seaLevel + this.tide.value + this.waves.waveHeightAt(x, z, this.clock.value);
  }

  groundAt(x: number, z: number): number {
    return this.ground.heightAt(x, z);
  }
}
