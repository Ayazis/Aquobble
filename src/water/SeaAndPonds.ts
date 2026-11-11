import type { HeightSampler, Pond } from '@terrain';
import type { WaveField } from './WaveField';
import type { WaterLevel } from './WaterLevel';

/**
 * The world's water: the sea at `seaLevel` moving with `waves`, and calm ponds (level discs) above it.
 * `clock` is the water shader's time, so CPU heights match what is drawn.
 */
export class SeaAndPonds implements WaterLevel {
  constructor(
    private readonly ground: HeightSampler,
    private readonly seaLevel: number,
    private readonly waves: WaveField,
    private readonly clock: { readonly value: number },
    private readonly ponds: readonly Pond[] = [],
  ) {}

  surfaceAt(x: number, z: number): number {
    for (const p of this.ponds) {
      if ((x - p.x) ** 2 + (z - p.z) ** 2 < p.radius * p.radius) return p.level;
    }
    return this.seaLevel + this.waves.waveHeightAt(x, z, this.clock.value);
  }

  groundAt(x: number, z: number): number {
    return this.ground.heightAt(x, z);
  }
}
