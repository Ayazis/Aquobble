import type { Random } from '@core';
import { inverseFft2d } from './fft';

/** Which waves a tile carries: whole wave counts per tile between `low` and `high`. */
export interface WaveBand {
  low: number;
  high: number;
  /** Height falls off as frequency^-falloff: near 2 keeps every size of ripple equally steep. */
  falloff: number;
  /** 0 = waves run every way, 1 = all crests lie across the tile's x axis (the wind). */
  directional: number;
}

/** A standard normal draw (Box-Muller). */
function gaussian(random: Random): number {
  return Math.sqrt(-2 * Math.log(1 - random.next())) * Math.cos(2 * Math.PI * random.next());
}

/**
 * A seamlessly tiling patch of wind-blown water, `size` texels square (a power of two), as heights with unit
 * variance. Every wave that fits the tile a whole number of times gets a random phase and a height from the
 * band's spectrum, and one inverse FFT sums them: thousands of waves for the price of a few.
 */
export function waveHeights(size: number, band: WaveBand, random: Random): Float32Array {
  const re = new Float32Array(size * size);
  const im = new Float32Array(size * size);
  const reach = Math.min(Math.ceil(band.high), size / 2 - 1);
  for (let j = -reach; j <= reach; j++) {
    for (let i = -reach; i <= reach; i++) {
      const k = Math.hypot(i, j);
      if (k < band.low || k > band.high) continue;
      // Soft shoulders at both ends of the band, so no single wave size stands out as a grid.
      const shoulder = Math.min(1, (k - band.low + 1) / 2) * Math.min(1, (band.high - k + 1) / (band.high * 0.3));
      const along = (i / k) ** 2;
      const amplitude = k ** -band.falloff * shoulder * (1 - band.directional + band.directional * along);
      const index = ((j + size) % size) * size + ((i + size) % size);
      re[index] = gaussian(random) * amplitude;
      im[index] = gaussian(random) * amplitude;
    }
  }
  inverseFft2d(re, im, size);
  let sum = 0;
  for (let n = 0; n < re.length; n++) sum += re[n] * re[n];
  const scale = 1 / Math.sqrt(sum / re.length || 1);
  for (let n = 0; n < re.length; n++) re[n] *= scale;
  return re;
}
