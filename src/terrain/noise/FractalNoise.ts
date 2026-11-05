import type { Noise2D } from './Noise2D';

/** Decorator: sums several octaves of a base noise (fractal Brownian motion). Output normalised to ~[-1, 1]. */
export class FractalNoise implements Noise2D {
  constructor(
    private readonly base: Noise2D,
    private readonly octaves = 5,
    private readonly lacunarity = 2,
    private readonly gain = 0.5,
  ) {}

  sample(x: number, y: number): number {
    let sum = 0;
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    for (let i = 0; i < this.octaves; i++) {
      sum += this.base.sample(x * frequency, y * frequency) * amplitude;
      total += amplitude;
      amplitude *= this.gain;
      frequency *= this.lacunarity;
    }
    return sum / total;
  }
}
