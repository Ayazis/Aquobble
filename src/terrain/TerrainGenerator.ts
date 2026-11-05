import type { Noise2D } from './noise/Noise2D';
import type { TerrainConfig } from './TerrainConfig';
import { HeightField } from './HeightField';

/** Builds an island height field from noise. Pure: same noise + config gives the same terrain. */
export class TerrainGenerator {
  constructor(
    private readonly noise: Noise2D,
    private readonly config: TerrainConfig,
  ) {}

  generate(): HeightField {
    const { samples, size, noiseScale, amplitude, baseHeight, islandFalloff } = this.config;
    const heights = new Float32Array(samples * samples);
    const step = size / (samples - 1);
    const half = size / 2;

    for (let row = 0; row < samples; row++) {
      for (let column = 0; column < samples; column++) {
        const x = -half + column * step;
        const z = -half + row * step;
        const n = (this.noise.sample(x / noiseScale + 10, z / noiseScale + 10) + 1) / 2; // 0..1
        const r = Math.hypot(x, z) / half;
        heights[row * samples + column] = n * amplitude + baseHeight - r * r * islandFalloff;
      }
    }
    return new HeightField(samples, size, heights);
  }
}
