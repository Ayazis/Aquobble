import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { causticLight } from './causticLight';
import { FoamTextureFactory } from './FoamTextureFactory';
import { WaterDetailFactory } from './WaterDetailFactory';
import { waveHeights } from './waveHeights';

/** Mean step between neighbours inside the tile, and across its wrap seams, for one channel. */
function steps(data: Uint8Array, size: number, channel: number): { inside: number; seam: number } {
  const at = (x: number, y: number) => data[(y * size + x) * 4 + channel];
  let inside = 0;
  let seam = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) inside += Math.abs(at(x, y) - at(x + 1, y)) + Math.abs(at(y, x) - at(y, x + 1));
    seam += Math.abs(at(size - 1, y) - at(0, y)) + Math.abs(at(y, size - 1) - at(y, 0));
  }
  return { inside: inside / (2 * size * (size - 1)), seam: seam / (2 * size) };
}

describe('waveHeights', () => {
  it('sums the band into a seeded patch of unit variance', () => {
    const band = { low: 2, high: 10, falloff: 1.5, directional: 0.5 };
    const a = waveHeights(32, band, new SeededRandom(4));
    const b = waveHeights(32, band, new SeededRandom(4));
    expect(Array.from(a)).toEqual(Array.from(b));
    const mean = a.reduce((sum, v) => sum + v, 0) / a.length;
    const variance = a.reduce((sum, v) => sum + v * v, 0) / a.length;
    expect(mean).toBeCloseTo(0, 5);
    expect(variance).toBeCloseTo(1, 5);
  });
});

describe('causticLight', () => {
  it('leaves flat water evenly lit and conserves the light under ripples', () => {
    const flat = causticLight(new Float32Array(16 * 16), 16, 5);
    for (const v of flat) expect(v).toBeCloseTo(1, 6);
    const rippled = causticLight(
      waveHeights(32, { low: 2, high: 6, falloff: 1, directional: 0 }, new SeededRandom(2)),
      32,
      20,
    );
    expect(rippled.reduce((sum, v) => sum + v, 0) / rippled.length).toBeCloseTo(1, 5);
    // Focused: some of the bed is much brighter than average, more of it dimmer.
    expect(Math.max(...rippled)).toBeGreaterThan(2);
    expect(rippled.filter((v) => v < 1).length).toBeGreaterThan(rippled.length / 2);
  });
});

describe('WaterDetailFactory', () => {
  it('builds a seamless patch of ripples: level on average, with tilt, height and caustics', () => {
    const size = 64;
    const data = new WaterDetailFactory(new SeededRandom(5)).create(size).image.data as Uint8Array;
    const mean = (channel: number) => {
      let sum = 0;
      for (let i = channel; i < data.length; i += 4) sum += data[i];
      return sum / (size * size) / 255;
    };
    expect(mean(0)).toBeCloseTo(0.5, 1);
    expect(mean(1)).toBeCloseTo(0.5, 1);
    expect(mean(2)).toBeCloseTo(0.5, 1);
    // Caustics average 1 of a range of 4.
    expect(mean(3)).toBeGreaterThan(0.18);
    expect(mean(3)).toBeLessThan(0.3);
    for (const channel of [0, 1, 2, 3]) {
      const { inside, seam } = steps(data, size, channel);
      expect(inside).toBeGreaterThan(0);
      // A tile that did not wrap would jump at the seam by several times the step between neighbours.
      expect(seam).toBeLessThan(inside * 1.5);
    }
  });
});

describe('FoamTextureFactory', () => {
  it('builds seamless bubbles that fill in from lace to a solid sheet', () => {
    const size = 64;
    const data = new FoamTextureFactory(new SeededRandom(9)).create(size).image.data as Uint8Array;
    const { inside, seam } = steps(data, size, 0);
    expect(seam).toBeLessThan(inside * 1.5);
    const order = Array.from({ length: size * size }, (_, i) => data[i * 4] / 255);
    const share = (above: number) => order.filter((v) => v > above).length / order.length;
    expect(share(0.9)).toBeLessThan(0.15);
    expect(share(0.5)).toBeGreaterThan(0.25);
    expect(share(0.5)).toBeLessThan(0.75);
    expect(share(0.05)).toBeGreaterThan(0.9);
  });
});
